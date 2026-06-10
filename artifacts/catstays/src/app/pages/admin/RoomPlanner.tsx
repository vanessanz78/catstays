import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Menu, Calendar as CalendarIcon } from 'lucide-react';

export function AdminRoomPlanner() {
  const rooms = Array.from({ length: 17 }, (_, i) => ({
    number: i + 1,
    type: i < 5 ? 'Private' : i < 12 ? 'Indoor' : 'Communal',
  }));

  const dates = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Room Planner</h1>
            <p className="text-xs text-gray-500">Visual room allocation</p>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Horizontal Room Planner</CardTitle>
            <CardDescription>Drag and drop bookings between rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 gap-2 mb-2">
                  <div className="font-semibold text-sm">Room</div>
                  {dates.map((date) => (
                    <div key={date} className="text-center text-sm font-semibold">
                      {date}
                    </div>
                  ))}
                </div>

                {rooms.slice(0, 10).map((room) => (
                  <div key={room.number} className="grid grid-cols-8 gap-2 mb-1">
                    <div className="flex items-center">
                      <div className="text-sm font-medium">Room {room.number}</div>
                    </div>
                    {dates.map((date) => (
                      <div
                        key={date}
                        className="border rounded h-12 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        {/* Booking blocks would go here */}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-600">
              Tip: Drag bookings between rooms to reassign. The system will check for conflicts and cleaning buffers.
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <Link to="/admin/calendar">
            <Button variant="outline" className="w-full">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Switch to Calendar View
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
