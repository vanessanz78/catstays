import { AlertTriangle, CreditCard, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SubscriptionWarningBannerProps {
  type: 'payment_due' | 'grace_period';
  daysRemaining?: number;
  onUpdatePayment: () => void;
}

export function SubscriptionWarningBanner({ 
  type, 
  daysRemaining,
  onUpdatePayment 
}: SubscriptionWarningBannerProps) {
  const isPaymentDue = type === 'payment_due';
  const isGracePeriod = type === 'grace_period';

  return (
    <div className={`
      w-full border-l-4 p-4 mb-6 rounded-lg shadow-sm
      ${isPaymentDue ? 'bg-amber-50 border-amber-500' : 'bg-orange-50 border-orange-600'}
    `}>
      <div className="flex items-start gap-4">
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${isPaymentDue ? 'bg-amber-100' : 'bg-orange-100'}
        `}>
          {isPaymentDue ? (
            <CreditCard className="w-5 h-5 text-amber-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {isPaymentDue && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-amber-900">
                  Your subscription payment couldn't be processed.
                </h3>
              </div>
              <p className="text-sm text-amber-800 mb-3">
                We'll retry automatically. Please update your payment method to avoid interruption.
              </p>
            </>
          )}

          {isGracePeriod && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-orange-900">
                  Your account is in a grace period.
                </h3>
                {daysRemaining !== undefined && (
                  <Badge variant="outline" className="bg-white border-orange-600 text-orange-900">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                  </Badge>
                )}
              </div>
              <p className="text-sm text-orange-800 mb-1">
                If payment isn't completed within {daysRemaining || 7} days, your access will be temporarily paused.
              </p>
              <p className="text-xs text-orange-700 italic">
                No data will be lost.
              </p>
            </>
          )}
        </div>

        <Button
          onClick={onUpdatePayment}
          size="sm"
          className={`
            flex-shrink-0 rounded-xl
            ${isPaymentDue 
              ? 'bg-amber-600 hover:bg-amber-700 text-white' 
              : 'bg-orange-600 hover:bg-orange-700 text-white'
            }
          `}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Update Payment Method
        </Button>
      </div>
    </div>
  );
}
