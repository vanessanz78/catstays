import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CreditCard, DollarSign, X, CheckCircle2 } from 'lucide-react';

interface PaymentBooking {
  id: string;
  petName: string;
  checkIn: string;
  checkOut: string;
  room: string;
  total: number;
  deposit: number;
  amountPaid: number;
}

interface PaymentCartProps {
  bookings: PaymentBooking[];
  primaryColor?: string;
  accentColor?: string;
  open: boolean;
  onClose: () => void;
  onPaymentComplete: (bookingIds: string[], paymentType: 'deposit' | 'full', amount: number) => void;
}

export function PaymentCart({
  bookings,
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  open,
  onClose,
  onPaymentComplete
}: PaymentCartProps) {
  const [paymentType, setPaymentType] = useState<'deposit' | 'full'>('deposit');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const calculateTotals = () => {
    let depositTotal = 0;
    let fullTotal = 0;

    bookings.forEach(booking => {
      const remainingDeposit = Math.max(0, booking.deposit - booking.amountPaid);
      const remainingBalance = Math.max(0, booking.total - booking.amountPaid);
      
      depositTotal += remainingDeposit;
      fullTotal += remainingBalance;
    });

    return { depositTotal, fullTotal };
  };

  const { depositTotal, fullTotal } = calculateTotals();
  const totalToPay = paymentType === 'deposit' ? depositTotal : fullTotal;

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessing(false);
    setPaymentSuccess(true);

    // Wait a moment to show success message
    setTimeout(() => {
      onPaymentComplete(
        bookings.map(b => b.id),
        paymentType,
        totalToPay
      );
      setPaymentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: primaryColor }}>
            <CreditCard className="w-5 h-5" />
            Payment Cart
          </DialogTitle>
        </DialogHeader>

        {!paymentSuccess ? (
          <div className="space-y-6">
            {/* Selected Bookings */}
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: accentColor }}>
                Selected Bookings ({bookings.length})
              </h3>
              <div className="space-y-3">
                {bookings.map(booking => {
                  const remainingDeposit = Math.max(0, booking.deposit - booking.amountPaid);
                  const remainingBalance = Math.max(0, booking.total - booking.amountPaid);
                  
                  return (
                    <div 
                      key={booking.id}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: `${primaryColor}20`, backgroundColor: `${accentColor}05` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold" style={{ color: primaryColor }}>
                            {booking.petName}
                          </h4>
                          <p className="text-sm" style={{ color: `${primaryColor}70` }}>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </p>
                          <p className="text-sm" style={{ color: `${primaryColor}70` }}>
                            {booking.room}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: primaryColor }}>
                            Total: {formatCurrency(booking.total)}
                          </p>
                          <p className="text-xs" style={{ color: `${primaryColor}60` }}>
                            Paid: {formatCurrency(booking.amountPaid)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span style={{ color: `${primaryColor}70` }}>Deposit due:</span>
                          <span className="font-semibold" style={{ color: accentColor }}>
                            {formatCurrency(remainingDeposit)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span style={{ color: `${primaryColor}70` }}>Full balance:</span>
                          <span className="font-semibold" style={{ color: primaryColor }}>
                            {formatCurrency(remainingBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Options */}
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: accentColor }}>
                Payment Option
              </h3>
              <RadioGroup value={paymentType} onValueChange={(value: 'deposit' | 'full') => setPaymentType(value)}>
                <div className="space-y-3">
                  {/* Deposit Option */}
                  <div 
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentType === 'deposit' ? 'shadow-sm' : ''
                    }`}
                    style={{
                      borderColor: paymentType === 'deposit' ? accentColor : `${primaryColor}20`,
                      backgroundColor: paymentType === 'deposit' ? `${accentColor}05` : 'white'
                    }}
                    onClick={() => setPaymentType('deposit')}
                  >
                    <RadioGroupItem value="deposit" id="deposit" />
                    <div className="flex-1">
                      <Label 
                        htmlFor="deposit" 
                        className="font-semibold cursor-pointer flex items-center gap-2"
                        style={{ color: primaryColor }}
                      >
                        Pay Deposit Only
                        <Badge 
                          variant="outline"
                          style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: accentColor }}
                        >
                          Recommended
                        </Badge>
                      </Label>
                      <p className="text-sm mt-1" style={{ color: `${primaryColor}70` }}>
                        Secure your booking and reserve the room. Remaining balance due upon arrival.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4" style={{ color: accentColor }} />
                        <span className="text-lg font-bold" style={{ color: accentColor }}>
                          {formatCurrency(depositTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Full Payment Option */}
                  <div 
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentType === 'full' ? 'shadow-sm' : ''
                    }`}
                    style={{
                      borderColor: paymentType === 'full' ? accentColor : `${primaryColor}20`,
                      backgroundColor: paymentType === 'full' ? `${accentColor}05` : 'white'
                    }}
                    onClick={() => setPaymentType('full')}
                  >
                    <RadioGroupItem value="full" id="full" />
                    <div className="flex-1">
                      <Label 
                        htmlFor="full" 
                        className="font-semibold cursor-pointer"
                        style={{ color: primaryColor }}
                      >
                        Pay Full Balance
                      </Label>
                      <p className="text-sm mt-1" style={{ color: `${primaryColor}70` }}>
                        Pay the entire outstanding balance now. No additional payment required.
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <DollarSign className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          {formatCurrency(fullTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Note */}
            <div 
              className="p-4 rounded-lg border-l-4"
              style={{ backgroundColor: `${primaryColor}05`, borderColor: accentColor }}
            >
              <p className="text-sm" style={{ color: `${primaryColor}90` }}>
                <strong>Payment Policy:</strong> A deposit secures your booking and reserves the room for your cat. 
                The remaining balance is due upon arrival at check-in. We accept all major credit cards.
              </p>
            </div>

            {/* Total and Actions */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold" style={{ color: primaryColor }}>
                  Total to Pay:
                </span>
                <span className="text-2xl font-bold" style={{ color: accentColor }}>
                  {formatCurrency(totalToPay)}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handlePayment}
                  disabled={processing || totalToPay === 0}
                  style={{ backgroundColor: accentColor, color: 'white' }}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay {formatCurrency(totalToPay)}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: `${accentColor}15` }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: '#10B981' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
              Payment Successful!
            </h3>
            <p style={{ color: `${primaryColor}70` }}>
              Your payment of {formatCurrency(totalToPay)} has been processed.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
