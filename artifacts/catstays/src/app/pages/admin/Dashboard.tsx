import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  UserPlus,
  Bell,
  CreditCard,
  ArrowRight,
  Plus,
  Sparkles,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityItem {
  id: number;
  type: 'booking' | 'payment' | 'customer';
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
}

interface Booking {
  id: number;
  customer: string;
  pet: string;
  dates: string;
  room: string;
  status: 'confirmed' | 'pending' | 'checked-in';
}

interface AdminDashboardProps {
  onBackToWebsite?: () => void;
  isPreview?: boolean;
}

export function AdminDashboard({ onBackToWebsite, isPreview = false }: AdminDashboardProps = {}) {
  const [hasData] = useState(true);
  const { cattery } = useAuth();
  const { stats, loading: statsLoading } = useStats();

  const metrics = [
    {
      label: 'Revenue',
      value: stats ? `$${stats.revenue.toLocaleString()}` : '$0',
      change: stats ? `+${stats.revenueChange}% from last month` : 'Loading...',
      icon: DollarSign,
      bgColor: 'bg-[#C46A3A]/10',
      iconColor: 'text-[#C46A3A]'
    },
    {
      label: 'Bookings',
      value: stats ? String(stats.bookings) : '0',
      change: stats ? `+${stats.bookingsChange} this week` : 'Loading...',
      icon: Calendar,
      bgColor: 'bg-[#0A1128]/10',
      iconColor: 'text-[#0A1128]'
    },
    {
      label: 'Customers',
      value: stats ? String(stats.customers) : '0',
      change: stats ? `+${stats.customersChange} this month` : 'Loading...',
      icon: UserPlus,
      bgColor: 'bg-[#C46A3A]/10',
      iconColor: 'text-[#C46A3A]'
    },
    {
      label: 'Occupancy',
      value: stats ? `${stats.occupancy}%` : '0%',
      change: stats ? `+${stats.occupancyChange}% this month` : 'Loading...',
      icon: TrendingUp,
      bgColor: 'bg-[#0A1128]/10',
      iconColor: 'text-[#0A1128]'
    },
  ];

  const recentActivity = stats?.recentActivity ?? [];
  const upcomingBookings: Booking[] = [];



  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Mobile-First Header */}
      <header className="bg-white border-b border-[#0A1128]/10 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back to Today Button */}
              {isPreview ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-[#0A1128] hover:bg-[#0A1128]/5 h-9"
                  onClick={(e) => e.preventDefault()}
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Today</span>
                </Button>
              ) : (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-[#0A1128] hover:bg-[#0A1128]/5 h-9"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Back to Today</span>
                  </Button>
                </Link>
              )}
              
              {/* Title */}
              <div>
                <h1 className="text-lg font-semibold text-[#0A1128]">Overview</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#0A1128]/60" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4 pb-8 space-y-4">
        {/* Top Metrics */}
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="border-[#0A1128]/10">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#0A1128] mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">
                      {metric.label}
                    </div>
                    <div className="text-xs text-[#C46A3A] font-medium">
                      {metric.change}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="border-[#0A1128]/10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0A1128]">
                Recent Activity
              </h2>
              {isPreview ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-[#C46A3A] hover:bg-[#C46A3A]/10 h-8"
                  onClick={(e) => e.preventDefault()}
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/admin/bookings">
                  <Button variant="ghost" size="sm" className="gap-1 text-[#C46A3A] hover:bg-[#C46A3A]/10 h-8">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>

            {hasData ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#0A1128]/5 transition-colors border border-[#0A1128]/5"
                    >
                      <div className="p-2 rounded-lg bg-[#C46A3A]/10 flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#C46A3A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#0A1128]">
                          {activity.title}
                        </div>
                        <div className="text-sm text-[#0A1128]/60">
                          {activity.description}
                        </div>
                        <div className="text-xs text-[#0A1128]/40 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A1128]/5 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-[#0A1128]/40" />
                </div>
                <p className="text-[#0A1128]/60 mb-1">No activity yet</p>
                <p className="text-sm text-[#0A1128]/40">
                  Your recent updates will appear here
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="border-[#0A1128]/10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0A1128]">
                Upcoming Bookings
              </h2>
              {isPreview ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-[#C46A3A] hover:bg-[#C46A3A]/10 h-8"
                  onClick={(e) => e.preventDefault()}
                >
                  Calendar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Link to="/admin/calendar">
                  <Button variant="ghost" size="sm" className="gap-1 text-[#C46A3A] hover:bg-[#C46A3A]/10 h-8">
                    Calendar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>

            {hasData && upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 rounded-lg border border-[#0A1128]/10 hover:border-[#C46A3A]/30 hover:bg-[#0A1128]/5 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-[#0A1128] text-sm">
                          {booking.customer}
                        </div>
                        <div className="text-sm text-[#0A1128]/60">
                          {booking.pet} • {booking.room}
                        </div>
                      </div>
                      <Badge className="bg-[#C46A3A]/10 text-[#C46A3A] text-xs border-0">
                        {booking.status === 'checked-in' ? 'Checked In' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#0A1128]/40">
                      <Calendar className="w-3 h-3" />
                      {booking.dates}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0A1128]/5 rounded-full mb-4">
                  <Calendar className="w-8 h-8 text-[#0A1128]/40" />
                </div>
                <p className="text-[#0A1128]/60 mb-1">No bookings yet — your first one is coming 🐾</p>
                {isPreview ? (
                  <Button 
                    size="sm" 
                    className="mt-4 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white h-9"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Booking
                  </Button>
                ) : (
                  <Link to="/admin/bookings?new=true">
                    <Button size="sm" className="mt-4 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white h-9">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Booking
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>

      {/* Bottom Navigation */}
      {/* Removed BottomNav component */}
    </div>
  );
}