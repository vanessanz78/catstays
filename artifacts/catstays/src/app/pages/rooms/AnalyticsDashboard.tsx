import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Users,
  Percent,
  Clock,
  Award,
  PieChart,
  BarChart3,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import { getRooms, getBookings } from '../../utils/roomPlannerStorage';
import { Booking, Room } from '../../types/room-planner';
import { format, subDays, isWithinInterval, differenceInDays, parseISO } from 'date-fns';

type DateRange = 30 | 60 | 90;

export function AnalyticsDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(30);

  useEffect(() => {
    setRooms(getRooms());
    setBookings(getBookings());
  }, []);

  const analytics = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, dateRange);

    const relevantBookings = bookings.filter(
      (b) =>
        b.status !== 'cancelled' &&
        isWithinInterval(parseISO(b.checkIn), { start: startDate, end: today })
    );

    const totalRevenue = relevantBookings.reduce((sum, b) => sum + b.finalPrice, 0);
    const confirmedRevenue = relevantBookings
      .filter((b) => b.status === 'confirmed' || b.status === 'checked_in' || b.status === 'checked_out')
      .reduce((sum, b) => sum + b.finalPrice, 0);
    const potentialRevenue = relevantBookings
      .filter((b) => b.status === 'pending')
      .reduce((sum, b) => sum + b.finalPrice, 0);

    // Occupancy calculation
    const totalRoomDays = rooms.length * dateRange;
    const bookedDays = relevantBookings.reduce((sum, b) => sum + b.numberOfNights, 0);
    const occupancyRate = totalRoomDays > 0 ? (bookedDays / totalRoomDays) * 100 : 0;

    // Average metrics
    const avgDailyRate = relevantBookings.length > 0
      ? relevantBookings.reduce((sum, b) => sum + (b.finalPrice / b.numberOfNights), 0) / relevantBookings.length
      : 0;
    
    const avgLengthOfStay = relevantBookings.length > 0
      ? relevantBookings.reduce((sum, b) => sum + b.numberOfNights, 0) / relevantBookings.length
      : 0;

    // Booking lead time
    const avgLeadTime = relevantBookings.length > 0
      ? relevantBookings.reduce((sum, b) => {
          const leadTime = differenceInDays(parseISO(b.checkIn), parseISO(b.createdAt || b.checkIn));
          return sum + leadTime;
        }, 0) / relevantBookings.length
      : 0;

    // Cancellation rate
    const totalBookingsIncCancelled = bookings.filter((b) =>
      isWithinInterval(parseISO(b.checkIn), { start: startDate, end: today })
    );
    const cancelledBookings = totalBookingsIncCancelled.filter((b) => b.status === 'cancelled');
    const cancellationRate = totalBookingsIncCancelled.length > 0
      ? (cancelledBookings.length / totalBookingsIncCancelled.length) * 100
      : 0;

    // Room type popularity
    const roomTypeStats = rooms.reduce((acc, room) => {
      const roomBookings = relevantBookings.filter((b) => b.roomId === room.id);
      const roomRevenue = roomBookings.reduce((sum, b) => sum + b.finalPrice, 0);
      
      if (!acc[room.type]) {
        acc[room.type] = { count: 0, revenue: 0 };
      }
      acc[room.type].count += roomBookings.length;
      acc[room.type].revenue += roomRevenue;
      
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    // Repeat guests
    const ownerCounts = relevantBookings.reduce((acc, b) => {
      acc[b.ownerEmail] = (acc[b.ownerEmail] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const repeatGuests = Object.values(ownerCounts).filter((count) => count > 1).length;
    const totalUniqueGuests = Object.keys(ownerCounts).length;
    const repeatGuestRate = totalUniqueGuests > 0 ? (repeatGuests / totalUniqueGuests) * 100 : 0;

    // Add-on revenue
    const addOnRevenue = relevantBookings.reduce((sum, b) => {
      const addOnTotal = b.addOns?.reduce((aSum, a) => aSum + (a.price * a.quantity), 0) || 0;
      return sum + addOnTotal;
    }, 0);

    // RevPAR (Revenue Per Available Room)
    const revPAR = rooms.length > 0 ? totalRevenue / (rooms.length * dateRange) : 0;

    return {
      totalRevenue,
      confirmedRevenue,
      potentialRevenue,
      occupancyRate,
      avgDailyRate,
      avgLengthOfStay,
      avgLeadTime,
      cancellationRate,
      roomTypeStats,
      repeatGuestRate,
      addOnRevenue,
      revPAR,
      totalBookings: relevantBookings.length,
    };
  }, [rooms, bookings, dateRange]);

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'deluxe': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'standard': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <Card className="border-[#8FBC8F]/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1128]">Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">Key metrics and performance insights</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 mr-2">Time Period:</span>
              <Button
                variant={dateRange === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(30)}
                className={dateRange === 30 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                30 Days
              </Button>
              <Button
                variant={dateRange === 60 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(60)}
                className={dateRange === 60 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                60 Days
              </Button>
              <Button
                variant={dateRange === 90 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(90)}
                className={dateRange === 90 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Occupancy Rate */}
        <Card className="border-[#8FBC8F]/30 shadow-md bg-gradient-to-br from-white to-[#8FBC8F]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#8FBC8F]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#8FBC8F]" />
              </div>
              <Badge className="bg-[#8FBC8F] text-white">
                {analytics.occupancyRate >= 80 ? 'Excellent' : analytics.occupancyRate >= 60 ? 'Good' : 'Low'}
              </Badge>
            </div>
            <div className={`text-3xl font-bold mb-1 ${getOccupancyColor(analytics.occupancyRate)}`}>
              {analytics.occupancyRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Occupancy Rate</div>
            <div className="text-xs text-gray-400 mt-2">{analytics.totalBookings} bookings</div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-[#87CEEB]/30 shadow-md bg-gradient-to-br from-white to-[#87CEEB]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#87CEEB]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#87CEEB]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0A1128] mb-1">
              ${analytics.totalRevenue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-green-600">✓ ${analytics.confirmedRevenue.toFixed(0)}</span>
              <span className="text-yellow-600">⏳ ${analytics.potentialRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Average Daily Rate */}
        <Card className="border-[#E6E6FA]/30 shadow-md bg-gradient-to-br from-white to-[#E6E6FA]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#E6E6FA]/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0A1128] mb-1">
              ${analytics.avgDailyRate.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Avg Daily Rate (ADR)</div>
            <div className="text-xs text-gray-400 mt-2">{analytics.avgLengthOfStay.toFixed(1)} nights avg</div>
          </CardContent>
        </Card>

        {/* RevPAR */}
        <Card className="border-[#FFD700]/30 shadow-md bg-gradient-to-br from-white to-[#FFD700]/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#FFD700]" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#0A1128] mb-1">
              ${analytics.revPAR.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">RevPAR</div>
            <div className="text-xs text-gray-400 mt-2">Revenue per available room</div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{analytics.avgLeadTime.toFixed(0)}</div>
                <div className="text-xs text-gray-500">Avg Lead Time (days)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Percent className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{analytics.cancellationRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Cancellation Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{analytics.repeatGuestRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Repeat Guest Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">${analytics.addOnRevenue.toFixed(0)}</div>
                <div className="text-xs text-gray-500">Add-on Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Type Performance */}
      <Card className="border-[#8FBC8F]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#8FBC8F]/10 to-transparent border-b">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#8FBC8F]" />
            <CardTitle className="text-lg">Room Type Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(analytics.roomTypeStats).map(([type, stats]) => (
              <Card key={type} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getRoomTypeColor(type)}>{type}</Badge>
                    <div className="text-xs text-gray-500">{stats.count} bookings</div>
                  </div>
                  <div className="text-2xl font-bold text-[#0A1128] mb-1">
                    ${stats.revenue.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Revenue</div>
                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                    ${(stats.revenue / stats.count || 0).toFixed(0)} avg per booking
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-[#FF7F7F]/20 shadow-lg bg-gradient-to-br from-[#FF7F7F]/5 to-white">
        <CardHeader className="bg-gradient-to-r from-[#FF7F7F]/10 to-transparent border-b">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#FF7F7F]" />
            <CardTitle className="text-lg">AI-Powered Recommendations</CardTitle>
            <CardDescription className="ml-auto">Based on your {dateRange}-day performance</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {analytics.occupancyRate < 60 && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-yellow-900">Low Occupancy Alert</div>
                    <div className="text-sm text-yellow-800 mt-1">
                      Your occupancy rate is {analytics.occupancyRate.toFixed(1)}%. Consider enabling weekday discounts or
                      last-minute booking promotions to increase bookings.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics.avgLeadTime < 7 && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900">Short Booking Window</div>
                    <div className="text-sm text-blue-800 mt-1">
                      Average lead time is only {analytics.avgLeadTime.toFixed(0)} days. Consider last-minute pricing
                      strategies to fill gaps and reward advance bookings with early-bird discounts.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics.repeatGuestRate > 40 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900">High Customer Loyalty!</div>
                    <div className="text-sm text-green-800 mt-1">
                      {analytics.repeatGuestRate.toFixed(1)}% of your guests are returning customers! Consider implementing a
                      loyalty program or VIP perks to maintain this excellent retention rate.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics.addOnRevenue / analytics.totalRevenue > 0.15 && (
              <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-purple-900">Strong Add-On Sales</div>
                    <div className="text-sm text-purple-800 mt-1">
                      Add-ons contribute {((analytics.addOnRevenue / analytics.totalRevenue) * 100).toFixed(1)}% of your
                      revenue. Consider creating bundled packages to increase this even further.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics.occupancyRate >= 80 && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900">Excellent Performance!</div>
                    <div className="text-sm text-green-800 mt-1">
                      With {analytics.occupancyRate.toFixed(1)}% occupancy, you're performing extremely well. Consider
                      increasing your base rates by 5-10% to maximize revenue potential.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
