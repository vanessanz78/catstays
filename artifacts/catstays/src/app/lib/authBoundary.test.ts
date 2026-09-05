import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessStaffWorkspace,
  canLoadCustomerData,
  clientPortalAccess,
  staffLoginDestination,
} from './authBoundary.ts';

const staffAccounts = [
  { role: 'owner' as const, label: 'owner' },
  { role: 'staff' as const, label: 'enabled staff member' },
];

for (const { role, label } of staffAccounts) {
  test(`${label} can enter Staff Login and reach the staff dashboard`, () => {
    assert.equal(staffLoginDestination(role), '/staff-dashboard');
    assert.equal(
      canAccessStaffWorkspace({
        userId: `${label}-user`,
        catteryId: `${label}-cattery`,
        accountRole: role,
      }),
      true,
    );
  });
}

test('a customer account is rejected by Staff Login and blocked from direct staff routes', () => {
  assert.equal(staffLoginDestination('customer'), null);
  assert.equal(
    canAccessStaffWorkspace({
      userId: 'customer-user',
      catteryId: 'customer-cattery',
      accountRole: 'customer',
    }),
    false,
  );
});

test('an active staff session stays in the client portal without staff-route redirection', () => {
  assert.equal(
    clientPortalAccess({
      userId: 'staff-user',
      accountRole: 'staff',
      customerId: null,
    }),
    'staff-blocked',
  );
  assert.equal(staffLoginDestination('staff'), '/staff-dashboard');
});

test('an unmatched authenticated user receives neither customer nor staff data', () => {
  const context = {
    userId: 'unmatched-user',
    accountRole: null,
    customerId: null,
  } as const;

  assert.equal(clientPortalAccess(context), 'unmatched');
  assert.equal(canLoadCustomerData(context), false);
  assert.equal(
    canAccessStaffWorkspace({
      userId: context.userId,
      catteryId: 'unmatched-cattery',
      accountRole: context.accountRole,
    }),
    false,
  );
});

test('a customer portal loads data only when the account has a linked customer record', () => {
  assert.equal(
    clientPortalAccess({ userId: 'customer-user', accountRole: 'customer', customerId: 'customer-record' }),
    'customer',
  );
  assert.equal(canLoadCustomerData({ accountRole: 'customer', customerId: 'customer-record' }), true);
  assert.equal(clientPortalAccess({ userId: 'customer-user', accountRole: 'customer', customerId: null }), 'unmatched');
  assert.equal(canLoadCustomerData({ accountRole: 'customer', customerId: null }), false);
});