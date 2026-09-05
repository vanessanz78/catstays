import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings, type BookingWithDetails } from '@/hooks/useBookings';
import { supabase } from '@/utils/supabase/client';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

type Expense = {
  id: string;
  cattery_id: string;
  description: string;
  amount: number;
  category: string | null;
  date: string;
  receipt_url: string | null;
  created_at: string;
};

type Payment = {
  id: string;
  booking_id: string | null;
  amount: number;
  type: string | null;
  status: string | null;
  created_at: string;
};

type PaymentRequest = {
  id: string;
  booking_id: string;
  request_type: 'deposit' | 'full';
  amount: number;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';
  expires_at: string | null;
  created_at: string;
};

type DatePreset = 'this-month' | 'last-month' | 'this-quarter' | 'this-year' | 'all';
type AccountingTab = 'payments' | 'expenses' | 'gst';

const EXPENSE_CATEGORIES = [
  'Cat food and supplies',
  'Cleaning',
  'Maintenance and repairs',
  'Utilities',
  'Insurance',
  'Marketing',
  'Professional services',
  'Other',
] as const;

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateRangeForPreset(preset: DatePreset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (preset === 'all') return { start: '', end: '' };
  if (preset === 'this-month') {
    return { start: localDateKey(new Date(year, month, 1)), end: localDateKey(new Date(year, month + 1, 0)) };
  }
  if (preset === 'last-month') {
    return { start: localDateKey(new Date(year, month - 1, 1)), end: localDateKey(new Date(year, month, 0)) };
  }
  if (preset === 'this-quarter') {
    const quarterStart = Math.floor(month / 3) * 3;
    return { start: localDateKey(new Date(year, quarterStart, 1)), end: localDateKey(new Date(year, quarterStart + 3, 0)) };
  }
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function money(value: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value || 0);
}

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function inclusiveGst(value: number) {
  return value * (3 / 23);
}

function csvCell(value: string | number) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function catNames(booking: BookingWithDetails) {
  const names = booking.booking_cats.map((entry) => entry.cat?.name).filter(Boolean);
  return names.length > 0 ? names.join(', ') : booking.cat_names || 'Cat guest';
}

function customerName(booking: BookingWithDetails) {
  return booking.customer?.name || booking.guest_name || 'Customer';
}

function MetricCard({ label, value, helper, tone = 'light' }: { label: string; value: string; helper: string; tone?: 'light' | 'navy' | 'orange' | 'green' }) {
  const classes = tone === 'navy'
    ? 'bg-[#0A1128] text-white'
    : tone === 'orange'
      ? 'bg-[#C46A3A] text-white'
      : tone === 'green'
        ? 'border-[#7DAF7B]/30 bg-[#EDF6EC] text-[#2D5830]'
        : 'border-[#E8DED4] bg-white text-[#0A1128]';
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${classes}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs opacity-70">{helper}</p>
    </div>
  );
}

export function AdminAccounting() {
  const { cattery } = useAuth();
  const { bookings, loading: bookingsLoading, error: bookingsError, refetch: refetchBookings } = useBookings();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [ledgerError, setLedgerError] = useState('');
  const [activeTab, setActiveTab] = useState<AccountingTab>('payments');
  const [preset, setPreset] = useState<DatePreset>('this-month');
  const [range, setRange] = useState(() => dateRangeForPreset('this-month'));
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: EXPENSE_CATEGORIES[0] as string,
    date: localDateKey(new Date()),
  });

  const loadLedger = async () => {
    if (!cattery?.id) {
      setPayments([]);
      setPaymentRequests([]);
      setExpenses([]);
      setLoadingLedger(false);
      return;
    }

    setLoadingLedger(true);
    setLedgerError('');
    const [paymentsResult, requestsResult, expensesResult] = await Promise.allSettled([
      supabase.from('payments').select('id,booking_id,amount,type,status,created_at').eq('cattery_id', cattery.id).order('created_at', { ascending: false }),
      supabase.from('payment_requests').select('id,booking_id,request_type,amount,status,expires_at,created_at').eq('cattery_id', cattery.id).order('created_at', { ascending: false }),
      supabase.from('expenses').select('id,cattery_id,description,amount,category,date,receipt_url,created_at').eq('cattery_id', cattery.id).order('date', { ascending: false }),
    ]);

    const errors: string[] = [];
    if (paymentsResult.status === 'fulfilled') {
      if (paymentsResult.value.error) errors.push(`Payments: ${paymentsResult.value.error.message}`);
      else setPayments((paymentsResult.value.data || []) as Payment[]);
    } else errors.push('Payments could not be loaded.');

    if (requestsResult.status === 'fulfilled') {
      if (requestsResult.value.error) errors.push(`Payment requests: ${requestsResult.value.error.message}`);
      else setPaymentRequests((requestsResult.value.data || []) as PaymentRequest[]);
    } else errors.push('Payment requests could not be loaded.');

    if (expensesResult.status === 'fulfilled') {
      if (expensesResult.value.error) errors.push(`Expenses: ${expensesResult.value.error.message}`);
      else setExpenses((expensesResult.value.data || []) as Expense[]);
    } else errors.push('Expenses could not be loaded.');

    setLedgerError(errors.join(' '));
    setLoadingLedger(false);
  };

  useEffect(() => {
    void loadLedger();
  }, [cattery?.id]);

  const choosePreset = (nextPreset: DatePreset) => {
    setPreset(nextPreset);
    setRange(dateRangeForPreset(nextPreset));
  };

  const withinRange = (value: string) => {
    const key = value.slice(0, 10);
    return (!range.start || key >= range.start) && (!range.end || key <= range.end);
  };

  const filteredPayments = useMemo(() => payments.filter((payment) => withinRange(payment.created_at)), [payments, range]);
  const filteredRequests = useMemo(() => paymentRequests.filter((request) => withinRange(request.created_at)), [paymentRequests, range]);
  const filteredExpenses = useMemo(() => expenses.filter((expense) => withinRange(expense.date)), [expenses, range]);
  const filteredBookings = useMemo(() => bookings.filter((booking) => booking.status !== 'cancelled' && booking.status !== 'waitlist' && withinRange(booking.created_at)), [bookings, range]);

  const paidByBooking = useMemo(() => {
    const totals = new Map<string, number>();
    filteredPayments
      .filter((payment) => payment.status === 'completed')
      .forEach((payment) => {
        if (payment.booking_id) totals.set(payment.booking_id, (totals.get(payment.booking_id) || 0) + Number(payment.amount || 0));
      });
    return totals;
  }, [filteredPayments]);

  const latestRequestByBooking = useMemo(() => {
    const requests = new Map<string, PaymentRequest>();
    filteredRequests.forEach((request) => {
      if (!requests.has(request.booking_id)) requests.set(request.booking_id, request);
    });
    return requests;
  }, [filteredRequests]);

  const received = filteredPayments
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const bookedRevenue = filteredBookings.reduce((sum, booking) => sum + Number(booking.total_amount || 0), 0);
  const outstanding = filteredBookings.reduce((sum, booking) => {
    return sum + Math.max(Number(booking.total_amount || 0) - (paidByBooking.get(booking.id) || 0), 0);
  }, 0);
  const expenseTotal = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const pendingBookings = new Set(filteredRequests.filter((request) => request.status === 'pending').map((request) => request.booking_id)).size;
  const outputGst = inclusiveGst(received);
  const inputGst = inclusiveGst(expenseTotal);
  const estimatedGst = outputGst - inputGst;
  const isLoading = bookingsLoading || loadingLedger;

  const addExpense = async () => {
    if (!cattery?.id) return;
    const amount = Number(newExpense.amount);
    if (!newExpense.description.trim() || !Number.isFinite(amount) || amount <= 0 || !newExpense.date) {
      setLedgerError('Add an expense description, date, and amount greater than zero.');
      return;
    }
    setSavingExpense(true);
    setLedgerError('');
    const { error } = await supabase.from('expenses').insert({
      cattery_id: cattery.id,
      description: newExpense.description.trim(),
      amount,
      category: newExpense.category,
      date: newExpense.date,
    });
    if (error) setLedgerError(`Expense could not be saved: ${error.message}`);
    else {
      setNewExpense({ description: '', amount: '', category: EXPENSE_CATEGORIES[0], date: localDateKey(new Date()) });
      setShowExpenseForm(false);
      await loadLedger();
    }
    setSavingExpense(false);
  };

  const deleteExpense = async (expenseId: string) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return;
    setDeletingExpenseId(expenseId);
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) setLedgerError(`Expense could not be deleted: ${error.message}`);
    else setExpenses((current) => current.filter((expense) => expense.id !== expenseId));
    setDeletingExpenseId('');
  };

  const exportPayments = () => {
    downloadCsv(`catstays-payments-${range.start || 'all'}-${range.end || 'today'}.csv`, [
      ['Booking', 'Customer', 'Cats', 'Booked total', 'Paid', 'Payment status', 'Created'],
      ...filteredBookings.map((booking) => [
        booking.id.slice(0, 8).toUpperCase(),
        customerName(booking),
        catNames(booking),
        Number(booking.total_amount || 0).toFixed(2),
        (paidByBooking.get(booking.id) || 0).toFixed(2),
        booking.payment_status || 'unpaid',
        booking.created_at.slice(0, 10),
      ]),
    ]);
  };

  const exportExpenses = () => {
    downloadCsv(`catstays-expenses-${range.start || 'all'}-${range.end || 'today'}.csv`, [
      ['Date', 'Description', 'Category', 'Amount (GST inclusive)', 'Estimated GST'],
      ...filteredExpenses.map((expense) => [
        expense.date,
        expense.description,
        expense.category || '',
        Number(expense.amount).toFixed(2),
        inclusiveGst(Number(expense.amount)).toFixed(2),
      ]),
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden"><RightMenu /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p>
                <h1 className="text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1>
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Payments and accounting</p>
              <h2 className="text-3xl font-semibold">Accounting</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#4E5871]">
                Track real booking payments, outstanding balances, expenses, and an estimated New Zealand GST position.
              </p>
            </div>
            <Button variant="outline" onClick={() => { void loadLedger(); void refetchBookings(); }} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>

          {(ledgerError || bookingsError) && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{ledgerError || bookingsError}</p>
            </div>
          )}

          <section className="rounded-xl border border-[#E8DED4] bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">Period</span>
                <select
                  value={preset}
                  onChange={(event) => choosePreset(event.target.value as DatePreset)}
                  className="h-11 w-full rounded-lg border border-[#D8D1C8] bg-white px-3 text-sm"
                >
                  <option value="this-month">This month</option>
                  <option value="last-month">Last month</option>
                  <option value="this-quarter">This quarter</option>
                  <option value="this-year">This year</option>
                  <option value="all">All time</option>
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">From</span>
                <input type="date" value={range.start} onChange={(event) => { setPreset('all'); setRange((current) => ({ ...current, start: event.target.value })); }} className="h-11 rounded-lg border border-[#D8D1C8] px-3 text-sm" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">To</span>
                <input type="date" value={range.end} onChange={(event) => { setPreset('all'); setRange((current) => ({ ...current, end: event.target.value })); }} className="h-11 rounded-lg border border-[#D8D1C8] px-3 text-sm" />
              </label>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Payments received" value={money(received)} helper="Completed customer payments" tone="green" />
            <MetricCard label="Booked revenue" value={money(bookedRevenue)} helper="Active bookings created in this period" tone="navy" />
            <MetricCard label="Outstanding" value={money(outstanding)} helper={`${pendingBookings} booking${pendingBookings === 1 ? '' : 's'} with active payment requests`} tone="orange" />
            <MetricCard label="Expenses" value={money(expenseTotal)} helper="Recorded business expenses" />
          </div>

          <div className="flex gap-2 overflow-x-auto rounded-xl border border-[#E8DED4] bg-white p-2 shadow-sm">
            {([
              ['payments', 'Payments'],
              ['expenses', 'Expenses'],
              ['gst', 'GST summary'],
            ] as Array<[AccountingTab, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveTab(value)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === value ? 'bg-[#0A1128] text-white' : 'text-[#4E5871] hover:bg-[#F6F2EA]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === 'payments' && (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Booking payment ledger</CardTitle>
                  <p className="mt-1 text-sm text-[#6b7a6d]">Live booking totals, received amounts, and payment-request status.</p>
                </div>
                <Button variant="outline" onClick={exportPayments} disabled={filteredBookings.length === 0}>
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="rounded-xl bg-[#F8F7F5] p-6 text-sm text-[#4E5871]">Loading payments…</p>
                ) : filteredBookings.length === 0 ? (
                  <div className="rounded-xl bg-[#F8F7F5] p-8 text-center">
                    <CreditCard className="mx-auto h-8 w-8 text-[#C46A3A]" />
                    <h3 className="mt-3 font-semibold">No bookings in this period</h3>
                    <p className="mt-1 text-sm text-[#4E5871]">Choose another period or create a booking to start the payment ledger.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((booking) => {
                      const paid = paidByBooking.get(booking.id) || 0;
                      const total = Number(booking.total_amount || 0);
                      const request = latestRequestByBooking.get(booking.id);
                      return (
                        <Link
                          key={booking.id}
                          to={`/staff-dashboard/bookings?booking=${booking.id}`}
                          className="grid gap-3 rounded-xl border border-[#E8DED4] p-4 transition hover:bg-[#F8F7F5] lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(110px,0.5fr))_auto] lg:items-center"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{catNames(booking)}</p>
                            <p className="truncate text-sm text-[#4E5871]">{customerName(booking)} · {booking.id.slice(0, 8).toUpperCase()}</p>
                            <p className="mt-1 text-xs text-[#768098]">{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-[#768098]">Booked</p>
                            <p className="font-semibold">{money(total)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-[#768098]">Received</p>
                            <p className="font-semibold text-[#2D5830]">{money(paid)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-[#768098]">Request</p>
                            <p className="font-semibold capitalize">{request?.status || 'Not sent'}</p>
                          </div>
                          <Badge className={booking.payment_status === 'paid' ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]' : booking.payment_status === 'pending' || booking.payment_status === 'partial' ? 'bg-[#C46A3A] hover:bg-[#C46A3A]' : 'bg-[#6b7a6d] hover:bg-[#6b7a6d]'}>
                            {booking.payment_status || 'unpaid'}
                          </Badge>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'expenses' && (
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Expenses</CardTitle>
                  <p className="mt-1 text-sm text-[#6b7a6d]">Tenant-owned expense records saved to this cattery.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button variant="outline" onClick={exportExpenses} disabled={filteredExpenses.length === 0}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                  <Button onClick={() => setShowExpenseForm((visible) => !visible)} className="bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                    <Plus className="mr-2 h-4 w-4" /> Add expense
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showExpenseForm && (
                  <div className="grid gap-3 rounded-xl border border-[#C46A3A]/30 bg-[#FBF5F0] p-4 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className="mb-1 block text-sm font-semibold">Description</span>
                      <input value={newExpense.description} onChange={(event) => setNewExpense((current) => ({ ...current, description: event.target.value }))} placeholder="e.g. Cat food and litter" className="h-11 w-full rounded-lg border border-[#D8D1C8] px-3" />
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-semibold">Category</span>
                      <select value={newExpense.category} onChange={(event) => setNewExpense((current) => ({ ...current, category: event.target.value }))} className="h-11 w-full rounded-lg border border-[#D8D1C8] bg-white px-3">
                        {EXPENSE_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-semibold">Date</span>
                      <input type="date" value={newExpense.date} onChange={(event) => setNewExpense((current) => ({ ...current, date: event.target.value }))} className="h-11 w-full rounded-lg border border-[#D8D1C8] px-3" />
                    </label>
                    <label>
                      <span className="mb-1 block text-sm font-semibold">GST-inclusive amount (NZD)</span>
                      <input type="number" min="0.01" step="0.01" value={newExpense.amount} onChange={(event) => setNewExpense((current) => ({ ...current, amount: event.target.value }))} placeholder="0.00" className="h-11 w-full rounded-lg border border-[#D8D1C8] px-3" />
                    </label>
                    <div className="flex items-end gap-2">
                      <Button onClick={addExpense} disabled={savingExpense} className="bg-[#0A1128] text-white hover:bg-[#19233D]">
                        {savingExpense ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Save expense
                      </Button>
                      <Button variant="ghost" onClick={() => setShowExpenseForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {filteredExpenses.length === 0 ? (
                  <div className="rounded-xl bg-[#F8F7F5] p-8 text-center">
                    <Receipt className="mx-auto h-8 w-8 text-[#C46A3A]" />
                    <h3 className="mt-3 font-semibold">No expenses in this period</h3>
                    <p className="mt-1 text-sm text-[#4E5871]">Record operating costs here so the GST summary and net position stay useful.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredExpenses.map((expense) => (
                      <div key={expense.id} className="grid gap-3 rounded-xl border border-[#E8DED4] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                        <div>
                          <p className="font-semibold">{expense.description}</p>
                          <p className="mt-1 text-sm text-[#4E5871]">{expense.category || 'Other'} · {formatDate(expense.date)}</p>
                        </div>
                        <div className="sm:text-right">
                          <p className="font-semibold">{money(Number(expense.amount))}</p>
                          <p className="text-xs text-[#768098]">Est. GST {money(inclusiveGst(Number(expense.amount)))}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)} disabled={deletingExpenseId === expense.id} aria-label={`Delete ${expense.description}`} className="text-red-700">
                          {deletingExpenseId === expense.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'gst' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><FileText className="h-5 w-5 text-[#C46A3A]" /> GST summary</CardTitle>
                <p className="mt-1 text-sm text-[#6b7a6d]">A cash-basis estimate using the GST-inclusive 3/23 fraction for New Zealand.</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <MetricCard label="Output GST" value={money(outputGst)} helper={`Estimated GST in ${money(received)} received`} />
                  <MetricCard label="Input GST" value={money(inputGst)} helper={`Estimated GST in ${money(expenseTotal)} expenses`} tone="green" />
                  <MetricCard label="Estimated GST position" value={money(estimatedGst)} helper={estimatedGst >= 0 ? 'Estimated amount payable' : 'Estimated refund position'} tone={estimatedGst >= 0 ? 'orange' : 'green'} />
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <strong>Check before filing:</strong> this summary assumes all listed payments and expenses include 15% GST. Only use it if the cattery is GST registered, and confirm classifications and filing figures with your accountant or Inland Revenue records.
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
