export function checkParallelRunRequest(mode: unknown, isStaff: boolean, isTest: unknown, verifiedEmail: string | null | undefined, recipient: unknown): string | null {
  if (mode !== 'test_only') return null;
  if (!isStaff || isTest !== true) return 'Online bookings are test-only while Revelation Pets remains the main booking system. Please contact the cattery for a real booking.';
  if (!verifiedEmail || String(recipient || '').trim().toLowerCase() !== verifiedEmail.trim().toLowerCase()) return 'Test bookings must use your own verified staff email address.';
  return null;
}
