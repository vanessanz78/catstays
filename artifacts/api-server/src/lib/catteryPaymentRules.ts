export function calculateConfiguredDeposit(settings: unknown, total: number) {
  const root = settings && typeof settings === 'object' && !Array.isArray(settings)
    ? settings as Record<string, unknown>
    : {};
  const nested = root.bookingRules && typeof root.bookingRules === 'object' && !Array.isArray(root.bookingRules)
    ? root.bookingRules as Record<string, unknown>
    : {};
  const source = { ...nested, ...root };
  const configuredAmount = Number(source.depositAmount);
  const depositType = source.depositType === 'percentage' ? 'percentage' : 'fixed';
  const rawDeposit = depositType === 'percentage'
    ? total * (Math.min(100, Math.max(0, configuredAmount || 0)) / 100)
    : configuredAmount;
  const deposit = Math.min(total, Math.max(0, Number.isFinite(rawDeposit) ? rawDeposit : 0));
  return { deposit: Math.round(deposit * 100) / 100, depositType };
}
