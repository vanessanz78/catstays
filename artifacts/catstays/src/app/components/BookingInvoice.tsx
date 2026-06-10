import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { X, Printer, Download } from 'lucide-react';

interface InvoiceData {
  invoiceNumber: string;
  bookingId: string;
  issueDate: string;
  dueDate: string;
  
  // Business Details
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessLogo?: string;
  taxId?: string;
  
  // Customer Details
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Booking Details
  petName: string;
  checkIn: string;
  checkOut: string;
  room: string;
  nights: number;
  
  // Financial Details
  roomRate: number;
  roomTotal: number;
  addOns?: Array<{ name: string; price: number; quantity: number }>;
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  amountDue: number;
  
  // Payment Details
  paymentStatus: 'paid' | 'partial' | 'pending';
  paymentMethod?: string;
}

interface BookingInvoiceProps {
  invoice: InvoiceData;
  primaryColor?: string;
  accentColor?: string;
  open: boolean;
  onClose: () => void;
}

export function BookingInvoice({
  invoice,
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  open,
  onClose
}: BookingInvoiceProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production, this would generate a PDF
    // For now, we'll trigger the print dialog with a download-friendly name
    const originalTitle = document.title;
    document.title = `Invoice_${invoice.invoiceNumber}_${invoice.businessName.replace(/\s+/g, '_')}`;
    window.print();
    document.title = originalTitle;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0">
        {/* Action Buttons - Hidden when printing */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print:hidden z-10">
          <h2 className="text-lg font-semibold" style={{ color: primaryColor }}>
            Invoice #{invoice.invoiceNumber}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-8 h-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 bg-white" id="invoice-content">
          {/* Header with Logo and Business Info */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
            <div>
              {invoice.businessLogo ? (
                <img 
                  src={invoice.businessLogo} 
                  alt={invoice.businessName}
                  className="h-16 mb-3 object-contain"
                />
              ) : (
                <div className="text-3xl font-bold mb-3" style={{ color: primaryColor }}>
                  {invoice.businessName}
                </div>
              )}
              <div className="text-sm space-y-1" style={{ color: `${primaryColor}90` }}>
                <p>{invoice.businessAddress}</p>
                <p>{invoice.businessPhone}</p>
                <p>{invoice.businessEmail}</p>
                {invoice.taxId && <p>Tax ID: {invoice.taxId}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-2" style={{ color: accentColor }}>
                INVOICE
              </div>
              <div className="text-sm space-y-1" style={{ color: `${primaryColor}80` }}>
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Booking ID:</strong> {invoice.bookingId}</p>
                <p><strong>Issue Date:</strong> {formatDate(invoice.issueDate)}</p>
                <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: accentColor }}>
                Bill To
              </h3>
              <div className="space-y-1" style={{ color: primaryColor }}>
                <p className="font-semibold text-lg">{invoice.customerName}</p>
                <p className="text-sm">{invoice.customerAddress}</p>
                <p className="text-sm">{invoice.customerEmail}</p>
                <p className="text-sm">{invoice.customerPhone}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: accentColor }}>
                Booking Details
              </h3>
              <div className="space-y-1 text-sm" style={{ color: primaryColor }}>
                <p><strong>Pet Name:</strong> {invoice.petName}</p>
                <p><strong>Room:</strong> {invoice.room}</p>
                <p><strong>Check-in:</strong> {formatDate(invoice.checkIn)}</p>
                <p><strong>Check-out:</strong> {formatDate(invoice.checkOut)}</p>
                <p><strong>Duration:</strong> {invoice.nights} night{invoice.nights !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                  <th className="text-left py-3 px-2 font-semibold" style={{ color: primaryColor }}>
                    Description
                  </th>
                  <th className="text-right py-3 px-2 font-semibold" style={{ color: primaryColor }}>
                    Rate
                  </th>
                  <th className="text-center py-3 px-2 font-semibold" style={{ color: primaryColor }}>
                    Qty
                  </th>
                  <th className="text-right py-3 px-2 font-semibold" style={{ color: primaryColor }}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Room Charge */}
                <tr className="border-b" style={{ borderColor: `${primaryColor}20` }}>
                  <td className="py-3 px-2" style={{ color: primaryColor }}>
                    <div className="font-medium">{invoice.room}</div>
                    <div className="text-sm" style={{ color: `${primaryColor}70` }}>
                      Accommodation
                    </div>
                  </td>
                  <td className="text-right py-3 px-2" style={{ color: primaryColor }}>
                    {formatCurrency(invoice.roomRate)}
                  </td>
                  <td className="text-center py-3 px-2" style={{ color: primaryColor }}>
                    {invoice.nights}
                  </td>
                  <td className="text-right py-3 px-2 font-medium" style={{ color: primaryColor }}>
                    {formatCurrency(invoice.roomTotal)}
                  </td>
                </tr>

                {/* Add-ons */}
                {invoice.addOns && invoice.addOns.map((addon, index) => (
                  <tr key={index} className="border-b" style={{ borderColor: `${primaryColor}20` }}>
                    <td className="py-3 px-2" style={{ color: primaryColor }}>
                      <div className="font-medium">{addon.name}</div>
                      <div className="text-sm" style={{ color: `${primaryColor}70` }}>
                        Additional Service
                      </div>
                    </td>
                    <td className="text-right py-3 px-2" style={{ color: primaryColor }}>
                      {formatCurrency(addon.price)}
                    </td>
                    <td className="text-center py-3 px-2" style={{ color: primaryColor }}>
                      {addon.quantity}
                    </td>
                    <td className="text-right py-3 px-2 font-medium" style={{ color: primaryColor }}>
                      {formatCurrency(addon.price * addon.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between py-2 text-sm">
                <span style={{ color: `${primaryColor}80` }}>Subtotal:</span>
                <span className="font-medium" style={{ color: primaryColor }}>
                  {formatCurrency(invoice.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span style={{ color: `${primaryColor}80` }}>Tax (15%):</span>
                <span className="font-medium" style={{ color: primaryColor }}>
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-b-2 text-lg font-bold" style={{ borderColor: primaryColor, color: primaryColor }}>
                <span>Total:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span style={{ color: `${primaryColor}80` }}>Deposit Paid:</span>
                <span className="font-medium" style={{ color: '#10B981' }}>
                  -{formatCurrency(invoice.deposit)}
                </span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold rounded-lg px-3" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                <span>Amount Due:</span>
                <span>{formatCurrency(invoice.amountDue)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}05`, borderLeft: `4px solid ${accentColor}` }}>
            <h3 className="font-semibold mb-2" style={{ color: primaryColor }}>
              Payment Information
            </h3>
            <div className="text-sm space-y-1" style={{ color: `${primaryColor}80` }}>
              <p>
                <strong>Status:</strong>{' '}
                <span 
                  className="inline-block px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: invoice.paymentStatus === 'paid' ? '#10B98120' : 
                                   invoice.paymentStatus === 'partial' ? `${accentColor}20` : '#EF444420',
                    color: invoice.paymentStatus === 'paid' ? '#10B981' : 
                          invoice.paymentStatus === 'partial' ? accentColor : '#EF4444'
                  }}
                >
                  {invoice.paymentStatus === 'paid' ? 'Paid in Full' : 
                   invoice.paymentStatus === 'partial' ? 'Partially Paid' : 'Pending'}
                </span>
              </p>
              {invoice.paymentMethod && (
                <p><strong>Payment Method:</strong> {invoice.paymentMethod}</p>
              )}
              <p className="mt-2">
                Please ensure payment is received by the due date. The remaining balance is due at check-in.
              </p>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="text-center pt-6 border-t" style={{ borderColor: `${primaryColor}20` }}>
            <p className="text-sm mb-2" style={{ color: `${primaryColor}80` }}>
              Thank you for choosing {invoice.businessName}!
            </p>
            <p className="text-xs" style={{ color: `${primaryColor}60` }}>
              If you have any questions about this invoice, please contact us at {invoice.businessEmail} or {invoice.businessPhone}
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-content,
            #invoice-content * {
              visibility: visible;
            }
            #invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}