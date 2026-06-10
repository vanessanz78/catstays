import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  LogIn, 
  LogOut, 
  Home, 
  Sparkles, 
  AlertTriangle, 
  Check,
  Clock,
  User,
  Phone
} from 'lucide-react';
import { getRooms, getBookings } from '../../utils/roomPlannerStorage';
import { Booking, Room } from '../../types/room-planner';
import { format, isToday, parseISO } from 'date-fns';

export function RoomStatusBoard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setRooms(getRooms());
    setBookings(getBookings());
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const arrivingToday = bookings.filter(
    (b) => b.checkIn === today && (b.status === 'confirmed' || b.status === 'pending')
  );

  const departingToday = bookings.filter(
    (b) => b.checkOut === today && b.status === 'checked_in'
  );

  const currentlyOccupied = bookings.filter(
    (b) => b.status === 'checked_in' && b.checkIn <= today && b.checkOut >= today
  );

  const cleaningQueue = rooms.filter((r) => r.status === 'cleaning');
  const maintenanceRequired = rooms.filter((r) => r.status === 'maintenance');
  const availableNow = rooms.filter((r) => r.status === 'available' && r.active);

  const getRoomName = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-[#FF7F7F]/30 bg-gradient-to-br from-white to-[#FF7F7F]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF7F7F]/20 flex items-center justify-center">
                <LogIn className="w-5 h-5 text-[#FF7F7F]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{arrivingToday.length}</div>
                <div className="text-xs text-gray-500">Arriving</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#87CEEB]/30 bg-gradient-to-br from-white to-[#87CEEB]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#87CEEB]/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-[#87CEEB]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{departingToday.length}</div>
                <div className="text-xs text-gray-500">Departing</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#8FBC8F]/30 bg-gradient-to-br from-white to-[#8FBC8F]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#8FBC8F]/20 flex items-center justify-center">
                <Home className="w-5 h-5 text-[#8FBC8F]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{currentlyOccupied.length}</div>
                <div className="text-xs text-gray-500">Occupied</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#FFD700]/30 bg-gradient-to-br from-white to-[#FFD700]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FFD700]/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{cleaningQueue.length}</div>
                <div className="text-xs text-gray-500">Cleaning</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DC143C]/30 bg-gradient-to-br from-white to-[#DC143C]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#DC143C]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#DC143C]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{maintenanceRequired.length}</div>
                <div className="text-xs text-gray-500">Maintenance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#228B22]/30 bg-gradient-to-br from-white to-[#228B22]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#228B22]/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#228B22]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0A1128]">{availableNow.length}</div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arriving Today */}
        <Card className="border-[#FF7F7F]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#FF7F7F]/10 to-transparent border-b">
            <div className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-[#FF7F7F]" />
              <CardTitle className="text-lg">Arriving Today</CardTitle>
              <Badge className="ml-auto bg-[#FF7F7F] text-white">{arrivingToday.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {arrivingToday.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <LogIn className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No arrivals scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {arrivingToday.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-white rounded-xl border-2 border-[#FF7F7F]/20 hover:border-[#FF7F7F]/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-[#0A1128]">{booking.catName}</div>
                        <div className="text-sm text-gray-500">{booking.ownerName}</div>
                      </div>
                      <Badge className="bg-[#8FBC8F] text-white">{getRoomName(booking.roomId)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{booking.numberOfNights} nights</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{booking.ownerPhone}</span>
                      </div>
                    </div>
                    {booking.specialNeeds && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                        ⚠️ {booking.specialNeeds}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Departing Today */}
        <Card className="border-[#87CEEB]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#87CEEB]/10 to-transparent border-b">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-[#87CEEB]" />
              <CardTitle className="text-lg">Departing Today</CardTitle>
              <Badge className="ml-auto bg-[#87CEEB] text-white">{departingToday.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {departingToday.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <LogOut className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No departures scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {departingToday.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-white rounded-xl border-2 border-[#87CEEB]/20 hover:border-[#87CEEB]/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-[#0A1128]">{booking.catName}</div>
                        <div className="text-sm text-gray-500">{booking.ownerName}</div>
                      </div>
                      <Badge className="bg-[#8FBC8F] text-white">{getRoomName(booking.roomId)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>${booking.finalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{booking.ownerPhone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Currently Occupied & Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Occupied */}
        <Card className="border-[#8FBC8F]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#8FBC8F]/10 to-transparent border-b">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-[#8FBC8F]" />
              <CardTitle className="text-lg">Currently Occupied</CardTitle>
              <Badge className="ml-auto bg-[#8FBC8F] text-white">{currentlyOccupied.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {currentlyOccupied.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Home className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No rooms currently occupied</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentlyOccupied.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 bg-gradient-to-br from-white to-[#8FBC8F]/5 rounded-lg border border-[#8FBC8F]/20"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-[#0A1128]">{getRoomName(booking.roomId)}</div>
                      <Badge variant="outline" className="text-xs border-[#8FBC8F] text-[#8FBC8F]">
                        {booking.catName}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">{booking.ownerName}</div>
                    <div className="text-xs text-gray-400 mt-1">Until {format(parseISO(booking.checkOut), 'MMM d')}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cleaning & Maintenance */}
        <Card className="border-[#FFD700]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#FFD700]/10 to-transparent border-b">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFD700]" />
              <CardTitle className="text-lg">Cleaning & Maintenance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Cleaning Queue */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                Cleaning Queue ({cleaningQueue.length})
              </div>
              {cleaningQueue.length === 0 ? (
                <div className="text-xs text-gray-400 italic">All rooms clean</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cleaningQueue.map((room) => (
                    <Badge key={room.id} className="bg-[#FFD700] text-gray-800">
                      {room.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance Required */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#DC143C]" />
                Maintenance Required ({maintenanceRequired.length})
              </div>
              {maintenanceRequired.length === 0 ? (
                <div className="text-xs text-gray-400 italic">No issues reported</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {maintenanceRequired.map((room) => (
                    <Badge key={room.id} className="bg-[#DC143C] text-white">
                      {room.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Available Now */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-[#228B22]" />
                Available Now ({availableNow.length})
              </div>
              {availableNow.length === 0 ? (
                <div className="text-xs text-gray-400 italic">Fully booked</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableNow.map((room) => (
                    <Badge key={room.id} className="bg-[#228B22] text-white">
                      {room.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
