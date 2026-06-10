import { Lock, Shield, CreditCard, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

interface AccountLockedScreenProps {
  daysUntilDeletion?: number;
  onRestoreAccess: () => void;
  onUpdatePayment: () => void;
}

export function AccountLockedScreen({ 
  daysUntilDeletion = 30,
  onRestoreAccess,
  onUpdatePayment 
}: AccountLockedScreenProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-white to-[#F8F7F5] p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-orange-600" />
          </div>
          
          <h1 className="text-4xl font-serif font-semibold text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Your account is temporarily paused
          </h1>
          
          <p className="text-lg text-[#0A1128]/70">
            We couldn't process your subscription payment.
          </p>
        </CardHeader>

        <CardContent className="p-12">
          <div className="space-y-8">
            {/* Main message */}
            <div className="text-center">
              <p className="text-[#0A1128]/80 text-lg mb-4">
                To restore access to your website and bookings, please update your payment details.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-[#0A1128]/70">
                <Shield className="w-5 h-5 text-green-600" />
                <p className="text-base">
                  Your data is <span className="font-semibold text-green-700">safe and secure</span> and will be restored once payment is completed.
                </p>
              </div>
            </div>

            {/* Data retention warning */}
            {daysUntilDeletion <= 30 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Account Retention Period
                    </h3>
                    <p className="text-sm text-orange-800 mb-3">
                      You have <span className="font-bold">{daysUntilDeletion} days</span> to restore access before your data is permanently removed.
                    </p>
                    <p className="text-xs text-orange-700 italic">
                      After {daysUntilDeletion} days, all customer data, bookings, and your website will be permanently deleted and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <Button
                onClick={onRestoreAccess}
                size="lg"
                className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6 text-lg shadow-lg"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Restore Access
              </Button>

              <Button
                onClick={onUpdatePayment}
                variant="outline"
                size="lg"
                className="w-full border-[#0A1128]/20 hover:bg-[#0A1128]/5 rounded-xl py-6 text-lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Update Payment Method
              </Button>
            </div>

            {/* Additional info */}
            <div className="bg-[#F8F7F5] rounded-2xl p-6 border border-[#0A1128]/10">
              <h4 className="font-semibold text-[#0A1128] mb-3">What happens when you restore access:</h4>
              <ul className="space-y-2 text-sm text-[#0A1128]/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#C46A3A] mt-0.5">✓</span>
                  <span>Your website goes back online immediately</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C46A3A] mt-0.5">✓</span>
                  <span>All your bookings and customer data are restored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C46A3A] mt-0.5">✓</span>
                  <span>Customers can book again right away</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C46A3A] mt-0.5">✓</span>
                  <span>Your dashboard access is fully restored</span>
                </li>
              </ul>
            </div>

            {/* Support contact */}
            <div className="text-center text-sm text-[#0A1128]/60">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@catstays.com" className="text-[#C46A3A] hover:underline">
                support@catstays.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
