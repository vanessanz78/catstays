import { useState, forwardRef, useImperativeHandle } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, AlertCircle } from 'lucide-react';
import { Label } from './ui/label';
import { Input } from './ui/input';

interface PaymentFormProps {
  onPaymentMethodCreated: (paymentMethodId: string) => void;
  onError: (error: string) => void;
  isProcessing?: boolean;
}

export interface PaymentFormHandle {
  createPaymentMethod: () => Promise<string | null>;
}

export const PaymentForm = forwardRef<PaymentFormHandle, PaymentFormProps>(
  ({ onPaymentMethodCreated, onError, isProcessing }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const createPaymentMethod = async () => {
    if (!stripe || !elements) {
      onError('Payment system not loaded');
      return null;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card details not found');
      return null;
    }

    if (!cardholderName.trim()) {
      onError('Please enter cardholder name');
      return null;
    }

    if (!billingZip.trim()) {
      onError('Please enter billing ZIP code');
      return null;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          address: {
            postal_code: billingZip,
          },
        },
      });

      if (error) {
        onError(error.message || 'Payment method creation failed');
        return null;
      }

      if (paymentMethod) {
        onPaymentMethodCreated(paymentMethod.id);
        return paymentMethod.id;
      }

      return null;
    } catch (err: any) {
      onError(err.message || 'An unexpected error occurred');
      return null;
    }
  };

  // Expose the createPaymentMethod function to parent component
  useImperativeHandle(ref, () => ({
    createPaymentMethod,
  }));

  return (
    <div className="space-y-6">
      {/* Security Badge - More Prominent */}
      <div className="bg-gradient-to-r from-[#0A1128]/5 to-[#C46A3A]/5 border-2 border-[#0A1128]/10 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A1128] to-[#0A1128]/80 flex items-center justify-center shadow-md">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#0A1128]">🔒 Secure Payment Protected</p>
            <p className="text-sm text-[#0A1128]/70 mt-0.5">
              Your card <span className="font-semibold text-[#C46A3A]">will not be charged</span> until day 15 of your trial
            </p>
          </div>
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <Label htmlFor="cardholderName" className="text-[#0A1128] mb-2 block font-semibold text-base">
          Cardholder Name *
        </Label>
        <Input
          id="cardholderName"
          type="text"
          placeholder="John Smith"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          className="rounded-xl h-14 text-base border-2 border-[#0A1128]/20 focus:border-[#C46A3A] transition-colors"
          disabled={isProcessing}
        />
      </div>

      {/* Card Details */}
      <div>
        <Label className="text-[#0A1128] mb-2 block flex items-center gap-2 font-semibold text-base">
          <CreditCard className="w-5 h-5 text-[#C46A3A]" />
          Card Details *
        </Label>
        <div className="border-2 border-[#0A1128]/20 rounded-xl p-5 bg-white shadow-sm hover:border-[#C46A3A]/30 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '17px',
                  color: '#0A1128',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                  iconColor: '#C46A3A',
                },
                invalid: {
                  color: '#EF4444',
                  iconColor: '#EF4444',
                },
              },
              hidePostalCode: true,
            }}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <div className="mt-2 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{cardError}</span>
          </div>
        )}
      </div>

      {/* Billing ZIP Code */}
      <div>
        <Label htmlFor="billingZip" className="text-[#0A1128] mb-2 block font-semibold text-base">
          Billing ZIP Code *
        </Label>
        <Input
          id="billingZip"
          type="text"
          placeholder="12345"
          value={billingZip}
          onChange={(e) => setBillingZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
          className="rounded-xl h-14 text-base border-2 border-[#0A1128]/20 focus:border-[#C46A3A] transition-colors"
          disabled={isProcessing}
          maxLength={5}
        />
      </div>

      {/* Trust Badges - More Prominent */}
      <div className="border-t-2 border-[#0A1128]/10 pt-5 mt-4">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 bg-[#0A1128]/5 px-4 py-2 rounded-full">
            <Lock className="w-4 h-4 text-[#C46A3A]" />
            <span className="font-semibold">SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 bg-[#0A1128]/5 px-4 py-2 rounded-full">
            <svg className="w-4 h-4 text-[#C46A3A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">PCI Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 bg-[#0A1128]/5 px-4 py-2 rounded-full">
            <svg className="w-4 h-4 text-[#C46A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-semibold">Powered by Stripe</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentForm.displayName = 'PaymentForm';