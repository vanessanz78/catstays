import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

export function OccupancySummary() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handlePreviousWeek = () => {
    setWeekStart(subDays(weekStart, 7));
  };

  const handleNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  // Generate week data
  const weekData = [
    { day: 'Monday', date: weekStart, in: 0, out: 1, all: 9, dayEnd: 8 },
    { day: 'Tuesday', date: addDays(weekStart, 1), in: 5, out: 0, all: 13, dayEnd: 13 },
    { day: 'Wednesday', date: addDays(weekStart, 2), in: 1, out: 1, all: 14, dayEnd: 13 },
    { day: 'Thursday', date: addDays(weekStart, 3), in: 3, out: 1, all: 16, dayEnd: 15 },
    { day: 'Friday', date: addDays(weekStart, 4), in: 1, out: 1, all: 16, dayEnd: 15 },
    { day: 'Saturday', date: addDays(weekStart, 5), in: 0, out: 3, all: 15, dayEnd: 12 },
    { day: 'Sunday', date: addDays(weekStart, 6), in: 0, out: 0, all: 12, dayEnd: 12 },
  ];

  const totals = weekData.reduce(
    (acc, day) => ({
      in: acc.in + day.in,
      out: acc.out + day.out,
      all: acc.all + day.all,
      dayEnd: acc.dayEnd + day.dayEnd,
    }),
    { in: 0, out: 0, all: 0, dayEnd: 0 }
  );

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  return (
    <Card className="rounded-3xl border-sage/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-serif" style={{ color: '#44b89d' }}>
            OCCUPANCY SUMMARY
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousWeek}
              className="rounded-full hover:bg-sage/10"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#6b7a6d' }} />
            </Button>
            <div 
              className="px-6 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: '#9ba5a0' }}
            >
              {format(weekStart, 'd MMM')} - {format(weekEnd, 'd MMM')}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextWeek}
              className="rounded-full hover:bg-sage/10"
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#6b7a6d' }} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2" style={{ borderColor: '#2d3e2f' }}>
                <th className="text-left py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  DATE
                </th>
                <th className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  IN
                </th>
                <th className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  OUT
                </th>
                <th className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  ALL
                </th>
                <th className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  DAY END
                </th>
              </tr>
            </thead>
            <tbody>
              {weekData.map((day, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? 'bg-rose/5' : 'bg-white'}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold" style={{ color: '#2d3e2f' }}>
                      {day.day}{' '}
                      <span className="font-normal">{format(day.date, 'd MMMM')}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-lg" style={{ color: '#2d3e2f' }}>
                    {day.in}
                  </td>
                  <td className="text-center py-3 px-4 text-lg" style={{ color: '#2d3e2f' }}>
                    {day.out}
                  </td>
                  <td className="text-center py-3 px-4 text-lg" style={{ color: '#2d3e2f' }}>
                    {day.all}
                  </td>
                  <td className="text-center py-3 px-4 text-lg" style={{ color: '#2d3e2f' }}>
                    {day.dayEnd}
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="border-t-2 bg-gray-50" style={{ borderColor: '#2d3e2f' }}>
                <td className="py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  Total
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  {totals.in}
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  {totals.out}
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  {totals.all}
                </td>
                <td className="text-center py-3 px-4 font-bold text-lg" style={{ color: '#2d3e2f' }}>
                  {totals.dayEnd}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Include Run Transfers Checkbox */}
        <div className="mt-4 flex justify-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-sage/30"
            />
            <span style={{ color: '#2d3e2f' }}>Include Run Transfers</span>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
