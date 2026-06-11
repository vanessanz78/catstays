import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, DollarSign, AlertCircle, Sparkles, ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export function AdminInsights() {
  const { weeklyStats, nextWeekOccupancy, outstandingPayments, monthlyStats, loading } = useAnalytics();
  const [sentPaymentRequests, setSentPaymentRequests] = useState<string[]>([]);

  const handleSendPaymentRequest = (paymentId: string) => {
    setSentPaymentRequests(prev => [...prev, paymentId]);
  };

  const isPaymentRequestSent = (paymentId: string) => sentPaymentRequests.includes(paymentId);

  const occupancyColor =
    nextWeekOccupancy.status === 'high' ? '#7DAF7B' :
    nextWeekOccupancy.status === 'moderate' ? '#E9C46A' : '#E63946';

  const occupancyLabel =
    nextWeekOccupancy.status === 'high' ? 'Great Occupancy' :
    nextWeekOccupancy.status === 'moderate' ? 'Moderate Occupancy' : 'Low Occupancy';

  const occupancyTip =
    nextWeekOccupancy.status === 'high' ? "You're nearly full — well done!" :
    nextWeekOccupancy.status === 'moderate' ? 'Consider running a promotion' : 'Try a special offer to fill spots';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F6F4EF' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: '#7DAF7B' }} />
          <p style={{ color: '#6b7a6d' }}>Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/staff-dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" style={{ color: '#7DAF7B' }} />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Business Insights
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>Analytics & Opportunities</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Weekly Performance */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
            <span className="text-2xl">📈</span> This Week
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-4">
                <p className="text-sm mb-1" style={{ color: '#6b7a6d' }}>Revenue</p>
                <p className="text-2xl font-semibold" style={{ color: '#2A9D8F' }}>
                  ${weeklyStats.revenue.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-4">
                <p className="text-sm mb-1" style={{ color: '#6b7a6d' }}>Bookings</p>
                <p className="text-2xl font-semibold" style={{ color: '#7DAF7B' }}>
                  {weeklyStats.bookings}
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-4">
                <p className="text-sm mb-1" style={{ color: '#6b7a6d' }}>Occupancy</p>
                <p className="text-2xl font-semibold" style={{ color: '#E9C46A' }}>
                  {weeklyStats.occupancyRate}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-4">
                <p className="text-sm mb-1" style={{ color: '#6b7a6d' }}>Avg Stay</p>
                <p className="text-2xl font-semibold" style={{ color: '#7DAF7B' }}>
                  {weeklyStats.avgStayLength} days
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Occupancy Health */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
            <span className="text-2xl">📊</span> Next Week Occupancy
          </h2>

          <Card
            className="border-2 shadow-md"
            style={{ borderRadius: '16px', backgroundColor: '#FFFFFF', borderColor: occupancyColor }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-serif" style={{ color: '#2d3e2f' }}>
                    {occupancyLabel}
                  </CardTitle>
                  <CardDescription style={{ color: '#6b7a6d' }}>
                    {occupancyTip}
                  </CardDescription>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: occupancyColor }} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextWeekOccupancy.total > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm" style={{ color: '#2d3e2f' }}>
                    <span>Rooms booked: {nextWeekOccupancy.booked} / {nextWeekOccupancy.total}</span>
                    <span className="font-semibold">{nextWeekOccupancy.percentage}%</span>
                  </div>
                  <div className="w-full rounded-full h-3" style={{ backgroundColor: '#F6F4EF' }}>
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ width: `${nextWeekOccupancy.percentage}%`, backgroundColor: occupancyColor }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: '#6b7a6d' }}>
                    {nextWeekOccupancy.cats} cat{nextWeekOccupancy.cats !== 1 ? 's' : ''} booked
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: '#6b7a6d' }}>
                  No rooms set up yet. Add rooms in Room Management to track occupancy.
                </p>
              )}

              <Link to="/staff-dashboard/promotions">
                <Button className="w-full bg-[#E9C46A] hover:bg-[#E9C46A]/90 text-[#2d3e2f] rounded-xl shadow-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Promotion
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Outstanding Payments */}
        {outstandingPayments.length > 0 && (
          <section>
            <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <span className="text-2xl">💰</span> Outstanding Payments
            </h2>

            <Card
              className="border-2 shadow-md"
              style={{ borderRadius: '16px', backgroundColor: '#FFFFFF', borderColor: '#E63946' }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-serif" style={{ color: '#2d3e2f' }}>
                      Payment Reminders
                    </CardTitle>
                    <CardDescription style={{ color: '#6b7a6d' }}>
                      {outstandingPayments.length} payment{outstandingPayments.length !== 1 ? 's' : ''} pending
                    </CardDescription>
                  </div>
                  <AlertCircle className="w-8 h-8" style={{ color: '#E63946' }} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {outstandingPayments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-xl p-4 space-y-3"
                    style={{ borderColor: 'rgba(125, 175, 123, 0.2)' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold" style={{ color: '#2d3e2f' }}>
                          {payment.owner}
                        </div>
                        <div className="text-sm" style={{ color: '#6b7a6d' }}>
                          {payment.cat}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color: '#E63946' }}>
                          ${payment.amount}
                        </div>
                        <Badge className="bg-[#E9C46A] hover:bg-[#E9C46A] text-[#2d3e2f] text-xs">
                          {payment.arrivalDate}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full bg-[#7DAF7B] hover:bg-[#7DAF7B]/90 text-white rounded-xl"
                      disabled={isPaymentRequestSent(payment.id)}
                      onClick={() => handleSendPaymentRequest(payment.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {isPaymentRequestSent(payment.id) ? 'Request Sent ✓' : 'Send Payment Request'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Empty state when no outstanding payments */}
        {outstandingPayments.length === 0 && (
          <section>
            <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <span className="text-2xl">💰</span> Outstanding Payments
            </h2>
            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#7DAF7B]/10 flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6" style={{ color: '#7DAF7B' }} />
                </div>
                <p className="font-medium mb-1" style={{ color: '#2d3e2f' }}>All paid up!</p>
                <p className="text-sm" style={{ color: '#6b7a6d' }}>No outstanding payments at this time.</p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Monthly Revenue */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
            <span className="text-2xl">💵</span> Monthly Summary
          </h2>

          <Card className="border-[#7DAF7B]/20 shadow-md" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm" style={{ color: '#6b7a6d' }}>{monthlyStats.monthName} Revenue</p>
                  <p className="text-3xl font-semibold" style={{ color: '#2A9D8F' }}>
                    ${monthlyStats.revenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2A9D8F20' }}>
                  <DollarSign className="w-8 h-8" style={{ color: '#2A9D8F' }} />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'rgba(125, 175, 123, 0.2)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7a6d' }}>Total Bookings</span>
                  <span className="font-medium" style={{ color: '#2d3e2f' }}>{monthlyStats.totalBookings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7a6d' }}>Avg Booking Value</span>
                  <span className="font-medium" style={{ color: '#2d3e2f' }}>
                    {monthlyStats.avgBookingValue > 0 ? `$${monthlyStats.avgBookingValue}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#6b7a6d' }}>Occupancy Rate</span>
                  <span className="font-medium" style={{ color: '#2d3e2f' }}>{monthlyStats.occupancyRate}%</span>
                </div>
              </div>

              <Link to="/staff-dashboard/accounting" className="block mt-4">
                <Button
                  variant="outline"
                  className="w-full border-[#7DAF7B] text-[#7DAF7B] hover:bg-[#7DAF7B]/5 rounded-xl"
                >
                  View Full Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
