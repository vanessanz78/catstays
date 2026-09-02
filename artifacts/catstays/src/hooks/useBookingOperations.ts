import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import {
  adjustmentAmount,
  bookingFinancials,
  customerCreditBalance,
  type AdjustmentCalculation,
  type AdjustmentKind,
  type BookingAdjustment,
  type BookingEvent,
  type BookingPayment,
  type PaymentMethod,
  type PaymentPurpose,
} from '@/app/lib/bookingOperations';

type OperationResult = { error: unknown | null };

function message(error: unknown) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'The booking change could not be saved.';
}

export function useBookingOperations(
  bookingId: string | null,
  customerId: string | null,
  baseTotal: number,
  tax: { chargeTax?: boolean; taxRate?: number } = {},
) {
  const { cattery, user } = useAuth();
  const [adjustments, setAdjustments] = useState<BookingAdjustment[]>([]);
  const [payments, setPayments] = useState<BookingPayment[]>([]);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    if (!cattery?.id || !bookingId) {
      setAdjustments([]);
      setPayments([]);
      setEvents([]);
      setCreditBalance(0);
      return;
    }

    setLoading(true);
    setLoadError('');
    const [adjustmentResult, paymentResult, eventResult, creditResult] = await Promise.all([
      supabase.from('booking_adjustments').select('*').eq('cattery_id', cattery.id).eq('booking_id', bookingId).order('created_at'),
      supabase.from('payments').select('id,amount,type,status,payment_method,paid_on,reference,created_at').eq('cattery_id', cattery.id).eq('booking_id', bookingId).order('created_at'),
      supabase.from('booking_events').select('id,event_type,summary,metadata,created_at').eq('cattery_id', cattery.id).eq('booking_id', bookingId).order('created_at', { ascending: false }),
      customerId
        ? supabase.from('customer_credit_ledger').select('amount').eq('cattery_id', cattery.id).eq('customer_id', customerId)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const firstError = adjustmentResult.error || paymentResult.error || eventResult.error || creditResult.error;
    if (firstError) setLoadError(message(firstError));
    setAdjustments((adjustmentResult.data || []) as unknown as BookingAdjustment[]);
    setPayments((paymentResult.data || []) as unknown as BookingPayment[]);
    setEvents((eventResult.data || []) as unknown as BookingEvent[]);
    setCreditBalance(customerCreditBalance((creditResult.data || []) as Array<{ amount: number | string }>));
    setLoading(false);
  }, [bookingId, cattery?.id, customerId]);

  useEffect(() => { void load(); }, [load]);

  const recordEvent = async (eventType: string, summary: string, metadata: Record<string, unknown> = {}) => {
    if (!cattery?.id || !bookingId) return { error: 'Booking not found' };
    const { error } = await supabase.from('booking_events').insert({
      cattery_id: cattery.id,
      booking_id: bookingId,
      event_type: eventType,
      summary,
      metadata,
      created_by: user?.id || null,
    });
    return { error };
  };

  const syncPaymentStatus = async (
    nextAdjustments: BookingAdjustment[],
    nextPayments: Array<Pick<BookingPayment, 'amount' | 'status' | 'type'>> = payments,
  ) => {
    if (!cattery?.id || !bookingId) return;
    const nextFinancials = bookingFinancials(baseTotal, nextAdjustments, nextPayments, tax);
    const hasCompletedPayment = nextPayments.some((payment) => payment.status === 'completed');
    const hasCompletedBookingPayment = nextPayments.some((payment) => (
      payment.status === 'completed' && payment.type !== 'deposit'
    ));
    await supabase.from('bookings').update({
      payment_status: nextFinancials.owing <= 0
        ? 'paid'
        : hasCompletedBookingPayment ? 'partially_paid' : hasCompletedPayment ? 'deposit_paid' : 'unpaid',
    }).eq('id', bookingId).eq('cattery_id', cattery.id);
  };

  const saveNote = async (note: string, visibleToCustomer: boolean): Promise<OperationResult> => {
    if (!cattery?.id || !bookingId) return { error: 'Booking not found' };
    const { error } = await supabase.from('bookings').update({
      notes: note.trim() || null,
      customer_note_visible: visibleToCustomer,
    }).eq('id', bookingId).eq('cattery_id', cattery.id);
    if (!error) {
      await recordEvent('note_updated', visibleToCustomer ? 'Customer-visible booking note updated' : 'Internal booking note updated');
      await load();
    }
    return { error };
  };

  const addAdjustment = async (input: {
    kind: AdjustmentKind;
    label: string;
    calculation: AdjustmentCalculation;
    value: number;
  }): Promise<OperationResult> => {
    if (!cattery?.id || !bookingId) return { error: 'Booking not found' };
    const taxableSubtotal = bookingFinancials(baseTotal, [], [], tax).subtotal;
    const amount = adjustmentAmount(taxableSubtotal, input.kind, input.calculation, input.value);
    const { data, error } = await supabase.from('booking_adjustments').insert({
      cattery_id: cattery.id,
      booking_id: bookingId,
      kind: input.kind,
      label: input.label.trim(),
      calculation: input.calculation,
      value: input.value,
      amount,
      created_by: user?.id || null,
    }).select('*').single();
    if (!error) {
      const nextAdjustments = [...adjustments, data as unknown as BookingAdjustment];
      setAdjustments(nextAdjustments);
      await syncPaymentStatus(nextAdjustments);
      await recordEvent('adjustment_added', `${input.kind === 'discount' ? 'Discount' : 'Charge'} added: ${input.label.trim()}`, { amount });
      await load();
    }
    return { error };
  };

  const removeAdjustment = async (id: string): Promise<OperationResult> => {
    if (!cattery?.id || !bookingId) return { error: 'Booking not found' };
    const existing = adjustments.find((item) => item.id === id);
    const { error } = await supabase.from('booking_adjustments').delete().eq('id', id).eq('cattery_id', cattery.id).eq('booking_id', bookingId);
    if (!error) {
      const nextAdjustments = adjustments.filter((item) => item.id !== id);
      setAdjustments(nextAdjustments);
      await syncPaymentStatus(nextAdjustments);
      await recordEvent('adjustment_removed', `Adjustment removed${existing?.label ? `: ${existing.label}` : ''}`);
      await load();
    }
    return { error };
  };

  const addPayment = async (input: {
    purpose: PaymentPurpose;
    method: PaymentMethod;
    paidOn: string;
    amount: number;
    reference?: string;
  }): Promise<OperationResult> => {
    if (!cattery?.id || !bookingId || !customerId) return { error: 'Booking customer not found' };
    const amount = Math.max(0, Number(input.amount) || 0);
    if (amount <= 0) return { error: 'Enter a payment amount greater than zero.' };
    if (input.method === 'customer_credit' && amount > creditBalance) {
      return { error: `Only $${creditBalance.toFixed(2)} customer credit is available.` };
    }

    const { data: payment, error } = await supabase.from('payments').insert({
      cattery_id: cattery.id,
      booking_id: bookingId,
      customer_id: customerId,
      amount,
      type: input.purpose,
      status: 'completed',
      payment_method: input.method,
      paid_on: input.paidOn,
      reference: input.reference?.trim() || null,
      created_by: user?.id || null,
    }).select('id').single();
    if (error) return { error };

    if (input.method === 'customer_credit') {
      const { error: creditError } = await supabase.from('customer_credit_ledger').insert({
        cattery_id: cattery.id,
        customer_id: customerId,
        booking_id: bookingId,
        entry_type: 'applied',
        amount: -amount,
        note: 'Applied to booking payment',
        created_by: user?.id || null,
      });
      if (creditError) {
        await supabase.from('payments').delete().eq('id', payment.id);
        return { error: creditError };
      }
    }

    const nextPayments = [
      ...payments,
      { amount, status: 'completed' },
    ];
    const nextFinancials = bookingFinancials(baseTotal, adjustments, nextPayments, tax);
    await supabase.from('bookings').update({
      payment_status: nextFinancials.owing <= 0 ? 'paid' : input.purpose === 'deposit' ? 'deposit_paid' : 'partially_paid',
    }).eq('id', bookingId).eq('cattery_id', cattery.id);
    await recordEvent('payment_recorded', `${input.purpose === 'deposit' ? 'Deposit' : 'Payment'} recorded by ${input.method.replaceAll('_', ' ')}`, { amount, method: input.method });
    await load();
    return { error: null };
  };

  const issueCredit = async (amount: number, note: string): Promise<OperationResult> => {
    if (!cattery?.id || !bookingId || !customerId) return { error: 'Booking customer not found' };
    const safeAmount = Math.max(0, Number(amount) || 0);
    if (safeAmount <= 0) return { error: 'Enter a credit amount greater than zero.' };
    const { error } = await supabase.from('customer_credit_ledger').insert({
      cattery_id: cattery.id,
      customer_id: customerId,
      booking_id: bookingId,
      entry_type: 'issued',
      amount: safeAmount,
      note: note.trim() || 'Booking credit retained for a future stay',
      created_by: user?.id || null,
    });
    if (!error) {
      await recordEvent('customer_credit_issued', 'Customer credit issued for a future booking', { amount: safeAmount });
      await load();
    }
    return { error };
  };

  return {
    adjustments,
    payments,
    events,
    creditBalance,
    financials: bookingFinancials(baseTotal, adjustments, payments, tax),
    loading,
    loadError,
    saveNote,
    addAdjustment,
    removeAdjustment,
    addPayment,
    issueCredit,
    recordEvent,
    refetch: load,
  };
}
