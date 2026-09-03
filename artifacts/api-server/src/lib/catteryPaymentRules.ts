function paymentSettings(settings: unknown) {
  const root = settings && typeof settings === 'object' && !Array.isArray(settings)
    ? settings as Record<string, unknown>
    : {};
  const nested = root.bookingRules && typeof root.bookingRules === 'object' && !Array.isArray(root.bookingRules)
    ? root.bookingRules as Record<string, unknown>
    : {};
  return { ...nested, ...root };
}

export function calculateConfiguredDeposit(settings: unknown, total: number) {
  const source = paymentSettings(settings);
  const configuredAmount = Number(source.depositAmount);
  const depositType = source.depositType === 'percentage' ? 'percentage' : 'fixed';
  const rawDeposit = depositType === 'percentage'
    ? total * (Math.min(100, Math.max(0, configuredAmount || 0)) / 100)
    : configuredAmount;
  const deposit = Math.min(total, Math.max(0, Number.isFinite(rawDeposit) ? rawDeposit : 0));
  return { deposit: Math.round(deposit * 100) / 100, depositType };
}

// Match the staff booking ledger: adjustments are pre-tax, completed payments
// (including applied customer credits and negative refunds) reduce the balance.
export function calculatePaymentAmounts(
  settings: unknown,
  baseTotal: number,
  payments: Array<{ amount: number | string; status: string }>,
  adjustments: Array<{ amount: number | string }>,
) {
  const source = paymentSettings(settings);
  const configuredRate = Number(source.taxRate ?? 15);
  const rate = source.chargeTax === false ? 0 : (Number.isFinite(configuredRate) ? Math.min(100, Math.max(0, configuredRate)) : 15) / 100;
  const round = (value: number) => Math.round(value * 100) / 100;
  const total = round(Math.max(0, baseTotal / (1 + rate) + adjustments.reduce((sum, row) => sum + Number(row.amount), 0)) * (1 + rate));
  const paid = round(payments.filter(row => row.status === 'completed').reduce((sum, row) => sum + Number(row.amount), 0));
  const outstanding = round(Math.max(0, total - paid));
  const configured = calculateConfiguredDeposit(settings, total).deposit;
  return { total, outstanding, deposit: round(Math.min(outstanding, Math.max(0, configured - paid))) };
}
