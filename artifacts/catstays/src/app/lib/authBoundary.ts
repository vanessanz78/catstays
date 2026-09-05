export type AuthBoundaryRole = 'owner' | 'staff' | 'customer' | null;

export type StaffAccessContext = {
  userId: string | null;
  catteryId: string | null;
  accountRole: AuthBoundaryRole;
};

export type ClientPortalContext = {
  userId: string | null;
  accountRole: AuthBoundaryRole;
  customerId: string | null;
};

export function isStaffRole(accountRole: AuthBoundaryRole): accountRole is 'owner' | 'staff' {
  return accountRole === 'owner' || accountRole === 'staff';
}

export function staffLoginDestination(accountRole: AuthBoundaryRole): '/staff-dashboard' | null {
  return isStaffRole(accountRole) ? '/staff-dashboard' : null;
}

export function canAccessStaffWorkspace({ userId, catteryId, accountRole }: StaffAccessContext): boolean {
  return Boolean(userId && catteryId && isStaffRole(accountRole));
}

export type ClientPortalAccess = 'signed-out' | 'staff-blocked' | 'customer' | 'unmatched';

export function clientPortalAccess({ userId, accountRole, customerId }: ClientPortalContext): ClientPortalAccess {
  if (!userId) return 'signed-out';
  if (isStaffRole(accountRole)) return 'staff-blocked';
  if (accountRole === 'customer' && customerId) return 'customer';
  return 'unmatched';
}

export function canLoadCustomerData({ accountRole, customerId }: Pick<ClientPortalContext, 'accountRole' | 'customerId'>): boolean {
  return accountRole === 'customer' && Boolean(customerId);
}