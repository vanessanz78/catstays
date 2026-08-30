import { Link } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  CalendarRange,
  Clock3,
  DollarSign,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const currency = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  maximumFractionDigits: 0,
});

function InsightMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone = 'navy',
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  detail: string;
  tone?: 'navy' | 'copper' | 'green';
}) {
  const colours = tone === 'copper'
    ? 'bg-[#C46A3A] text-white'
    : tone === 'green'
      ? 'bg-[#EAF3E7] text-[#244728]'
      : 'bg-[#0A1128] text-white';

  return (
    <article className={`min-w-0 rounded-2xl p-5 shadow-sm ${colours}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium opacity-75">{label}</p>
        <Icon className="h-5 w-5 shrink-0 opacity-70" />
      </div>
      <p className="mt-4 break-words text-3xl font-semibold leading-none">{value}</p>
      <p className="mt-3 text-xs leading-5 opacity-70">{detail}</p>
    </article>
  );
}

export function StaffInsights() {
  const {
    weeklyStats,
    nextWeekOccupancy,
    outstandingPayments,
    monthlyStats,
    loading,
    error,
    refetch,
  } = useAnalytics();

  if (loading) {
    return (
      <section className="grid min-h-80 place-items-center rounded-2xl border border-[#E8DED4] bg-white p-8 text-center shadow-sm">
        <div>
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#C46A3A]" />
          <p className="mt-4 text-sm text-[#4E5871]">Loading this cattery's live insights...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-[#C46A3A]/30 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#C46A3A]" />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-[#0A1128]">Insights are temporarily unavailable</h3>
            <p className="mt-1 text-sm leading-6 text-[#4E5871]">{error}</p>
            <Button onClick={() => void refetch()} className="mt-4 rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const occupancyTone = nextWeekOccupancy.status === 'high'
    ? { label: 'Strong occupancy', colour: '#3E7A45', background: '#EAF3E7' }
    : nextWeekOccupancy.status === 'moderate'
      ? { label: 'Moderate occupancy', colour: '#8A5B12', background: '#FFF4D6' }
      : { label: 'Room to grow', colour: '#9A4827', background: '#F9E9DF' };

  return (
    <div className="min-w-0 space-y-6">
      <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightMetric
          icon={DollarSign}
          label="This week's booked value"
          value={currency.format(weeklyStats.revenue)}
          detail="Value of active stays overlapping this week"
        />
        <InsightMetric
          icon={CalendarRange}
          label="Active stays this week"
          value={String(weeklyStats.bookings)}
          detail="Cancelled bookings are excluded"
          tone="copper"
        />
        <InsightMetric
          icon={TrendingUp}
          label="This week's occupancy"
          value={`${weeklyStats.occupancyRate}%`}
          detail="Occupied cat-days across active room capacity"
          tone="green"
        />
        <InsightMetric
          icon={Clock3}
          label="Average stay"
          value={`${weeklyStats.avgStayLength} days`}
          detail="Arrival and departure days are both included"
        />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <article className="min-w-0 rounded-2xl border border-[#E8DED4] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C46A3A]">Next week</p>
              <h3 className="mt-2 text-2xl font-semibold text-[#0A1128]">Occupancy forecast</h3>
              <p className="mt-1 text-sm leading-6 text-[#4E5871]">
                Based on every non-cancelled stay that overlaps next week.
              </p>
            </div>
            <Badge
              className="w-fit rounded-full px-3 py-1 hover:opacity-100"
              style={{ backgroundColor: occupancyTone.background, color: occupancyTone.colour }}
            >
              {occupancyTone.label}
            </Badge>
          </div>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-5xl font-semibold text-[#0A1128]">{nextWeekOccupancy.percentage}%</p>
              <p className="mt-2 text-sm text-[#4E5871]">
                {nextWeekOccupancy.cats} cat{nextWeekOccupancy.cats === 1 ? '' : 's'} booked · {nextWeekOccupancy.total} active cat spaces
              </p>
            </div>
            <Link to="/staff-dashboard/promotions" className="shrink-0">
              <Button className="w-full rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30] sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Create promotion
              </Button>
            </Link>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#F1E8DE]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(nextWeekOccupancy.percentage, 100)}%`,
                backgroundColor: occupancyTone.colour,
              }}
            />
          </div>
        </article>

        <article className="min-w-0 rounded-2xl border border-[#E8DED4] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C46A3A]">{monthlyStats.monthName}</p>
          <h3 className="mt-2 text-2xl font-semibold text-[#0A1128]">Monthly summary</h3>
          <p className="mt-5 break-words text-4xl font-semibold text-[#0A1128]">{currency.format(monthlyStats.revenue)}</p>
          <p className="mt-1 text-sm text-[#4E5871]">Booked value for active stays this month</p>

          <dl className="mt-6 divide-y divide-[#E8DED4] border-y border-[#E8DED4]">
            <div className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-[#4E5871]">Active stays</dt>
              <dd className="font-semibold text-[#0A1128]">{monthlyStats.totalBookings}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-[#4E5871]">Average booking value</dt>
              <dd className="font-semibold text-[#0A1128]">{currency.format(monthlyStats.avgBookingValue)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3 text-sm">
              <dt className="text-[#4E5871]">Cat-day occupancy</dt>
              <dd className="font-semibold text-[#0A1128]">{monthlyStats.occupancyRate}%</dd>
            </div>
          </dl>

          <Link to="/staff-dashboard/accounting" className="mt-5 flex items-center justify-between rounded-xl bg-[#F8F7F5] px-4 py-3 text-sm font-semibold text-[#0A1128] hover:bg-[#F1E8DE]">
            Open full accounting report
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="min-w-0 rounded-2xl border border-[#E8DED4] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C46A3A]">Payments</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#0A1128]">Outstanding booking balances</h3>
            <p className="mt-1 text-sm leading-6 text-[#4E5871]">
              Open the booking before sending a payment request so the amount and customer are verified.
            </p>
          </div>
          <Badge className="w-fit rounded-full bg-[#F1E8DE] px-3 py-1 text-[#0A1128] hover:bg-[#F1E8DE]">
            {outstandingPayments.length}
          </Badge>
        </div>

        {outstandingPayments.length === 0 ? (
          <div className="mt-5 rounded-xl bg-[#EAF3E7] p-5 text-sm text-[#244728]">
            No unpaid, partial, or pending booking balances are showing for this cattery.
          </div>
        ) : (
          <div className="mt-5 grid min-w-0 gap-3 lg:grid-cols-2">
            {outstandingPayments.map((payment) => (
              <Link
                key={payment.id}
                to={`/staff-dashboard/bookings?booking=${payment.id}`}
                className="min-w-0 rounded-xl border border-[#E8DED4] p-4 transition hover:border-[#C46A3A]/45 hover:bg-[#F8F7F5]"
              >
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#0A1128]">{payment.owner}</p>
                    <p className="mt-1 truncate text-sm text-[#4E5871]">{payment.cat}</p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-[#C46A3A]">{currency.format(payment.amount)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                  <span className="rounded-full bg-[#F1E8DE] px-3 py-1 font-medium capitalize text-[#0A1128]">{payment.type}</span>
                  <span className="font-semibold text-[#4E5871]">Arrival: {payment.arrivalDate}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <aside className="rounded-2xl border border-[#E8DED4] bg-[#F8F7F5] p-5 text-sm leading-6 text-[#4E5871]">
        <strong className="text-[#0A1128]">How these figures work:</strong> occupancy uses each cat's inclusive arrival and departure days across the active room capacity saved for this cattery. Cancelled bookings are excluded. Booked value is not the same as cleared revenue; use Accounting for paid, refunded, and GST figures.
      </aside>
    </div>
  );
}
