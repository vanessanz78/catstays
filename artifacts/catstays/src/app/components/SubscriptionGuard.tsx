import { ReactNode } from 'react';
import { SubscriptionWarningBanner } from './SubscriptionWarningBanner';
import { AccountLockedScreen } from './AccountLockedScreen';
import { SubscriptionStatus } from '../types/subscription';

interface SubscriptionGuardProps {
  children: ReactNode;
  subscriptionStatus?: SubscriptionStatus;
  gracePeriodDaysRemaining?: number;
  lockedDaysRemaining?: number;
}

/**
 * SubscriptionGuard - Wraps dashboard content to show subscription warnings or lock screen
 * 
 * Usage:
 * <SubscriptionGuard subscriptionStatus={status}>
 *   <YourDashboardContent />
 * </SubscriptionGuard>
 */
export function SubscriptionGuard({ 
  children, 
  subscriptionStatus = 'active',
  gracePeriodDaysRemaining = 7,
  lockedDaysRemaining = 30
}: SubscriptionGuardProps) {
  
  const handleUpdatePayment = () => {
    // In production, this would open a payment modal or redirect to billing page
    console.log('Opening payment method update...');
  };

  const handleRestoreAccess = () => {
    // In production, this would initiate the restoration flow
    console.log('Initiating account restoration...');
  };

  // If account is locked, show lock screen instead of dashboard
  if (subscriptionStatus === 'locked') {
    return (
      <AccountLockedScreen
        daysUntilDeletion={lockedDaysRemaining}
        onRestoreAccess={handleRestoreAccess}
        onUpdatePayment={handleUpdatePayment}
      />
    );
  }

  // For active accounts, show dashboard with optional warning banners
  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Payment Due Warning */}
      {subscriptionStatus === 'payment_due' && (
        <div className="p-4 bg-white border-b border-[#0A1128]/10">
          <div className="max-w-7xl mx-auto">
            <SubscriptionWarningBanner
              type="payment_due"
              onUpdatePayment={handleUpdatePayment}
            />
          </div>
        </div>
      )}

      {/* Grace Period Warning */}
      {subscriptionStatus === 'grace_period' && (
        <div className="p-4 bg-white border-b border-[#0A1128]/10">
          <div className="max-w-7xl mx-auto">
            <SubscriptionWarningBanner
              type="grace_period"
              daysRemaining={gracePeriodDaysRemaining}
              onUpdatePayment={handleUpdatePayment}
            />
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {children}
    </div>
  );
}
