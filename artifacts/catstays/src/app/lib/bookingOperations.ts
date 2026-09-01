export type AdjustmentKind = 'charge' | 'discount';
export type AdjustmentCalculation = 'fixed' | 'percentage';
export type PaymentMethod = 'bank_transfer' | 'cash' | 'stripe' | 'customer_credit';
export type PaymentPurpose = 'booking' | 'deposit';

export type BookingAdjustment = {
  id: string;
  kind: AdjustmentKind;
  label: string;
  calculation: AdjustmentCalculation;
  value: number;
  amount: number;
  created_at: string;
};

export type BookingPayment = {
  id: string;
  amount: number;
  type: string;
  status: string;
  payment_method: PaymentMethod | null;
  paid_on: string | null;
  reference: string | null;
  created_at: string;
};

export type BookingEvent = {
  id: string;
  event_type: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  stripe: 'Stripe',
  customer_credit: 'Customer credit',
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = ['bank_transfer', 'cash', 'stripe', 'customer_credit'];

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function adjustmentAmount(
  baseTotal: number,
  kind: AdjustmentKind,
  calculation: AdjustmentCalculation,
  value: number,
) {
  const positiveValue = Math.max(0, number(value));
  const unsigned = calculation === 'percentage'
    ? number(baseTotal) * (positiveValue / 100)
    : positiveValue;
  return Number((kind === 'discount' ? -unsigned : unsigned).toFixed(2));
}

export function bookingFinancials(
  baseTotal: number,
  adjustments: Pick<BookingAdjustment, 'amount'>[] = [],
  payments: Pick<BookingPayment, 'amount' | 'status'>[] = [],
  tax: { chargeTax?: boolean; taxRate?: number } = {},
) {
  const adjustmentsTotal = adjustments.reduce((sum, item) => sum + number(item.amount), 0);
  const safeTaxRate = tax.chargeTax && Number.isFinite(tax.taxRate)
    ? Math.min(100, Math.max(0, number(tax.taxRate))) / 100
    : 0;
  const baseSubtotal = safeTaxRate > 0 ? number(baseTotal) / (1 + safeTaxRate) : number(baseTotal);
  const subtotal = Math.max(0, baseSubtotal + adjustmentsTotal);
  const taxAmount = subtotal * safeTaxRate;
  const total = subtotal + taxAmount;
  const paid = payments
    .filter((payment) => payment.status === 'completed')
    .reduce((sum, payment) => sum + number(payment.amount), 0);
  return {
    baseTotal: number(baseTotal),
    adjustmentsTotal: Number(adjustmentsTotal.toFixed(2)),
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
    paid: Number(paid.toFixed(2)),
    owing: Number((total - paid).toFixed(2)),
  };
}

export function normalizePaymentMethods(value: unknown): PaymentMethod[] {
  if (!Array.isArray(value)) return DEFAULT_PAYMENT_METHODS;
  const allowed = new Set<PaymentMethod>(DEFAULT_PAYMENT_METHODS);
  const methods = value.filter((method): method is PaymentMethod => allowed.has(method as PaymentMethod));
  return methods.length > 0 ? [...new Set(methods)] : DEFAULT_PAYMENT_METHODS;
}

export function customerCreditBalance(entries: Array<{ amount: number | string }>) {
  return Number(entries.reduce((sum, entry) => sum + number(entry.amount), 0).toFixed(2));
}
