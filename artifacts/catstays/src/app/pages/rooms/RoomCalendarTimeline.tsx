import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar as CalendarIcon,
  Maximize2
} from 'lucide-react';
import { getRooms, getBookings, saveBookings } from '../../utils/roomPlannerStorage';
import { Booking, Room } from '../../types/room-planner';
import { format, addDays, eachDayOfInterval, isSameDay, startOfDay, differenceInDays } from 'date-fns';
import { BookingFormModal } from '../../components/rooms/BookingFormModal';

export function RoomCalendarTimeline() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const [daysToShow, setDaysToShow] = useState(21); // 3 weeks
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newBookingData, setNewBookingData] = useState<{ roomId: string; date: Date } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRooms(getRooms().filter(r => r.active));
    setBookings(getBookings());
  }, []);

  const dateRange = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1)
  });

  const handlePrevWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const handleToday = () => {
    setStartDate(startOfDay(new Date()));
    // Scroll to today column
    setTimeout(() => {
      if (scrollRef.current) {
        const todayIndex = dateRange.findIndex(d => isSameDay(d, new Date()));
        if (todayIndex >= 0) {
          scrollRef.current.scrollLeft = todayIndex * 100; // 100px per day
        }
      }
    }, 100);
  };

  const getBookingsForRoomAndDate = (roomId: string, date: Date): Booking | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.status !== 'cancelled' &&
        b.checkIn <= dateStr &&
        b.checkOut >= dateStr
    ) || null;
  };

  const getBookingPosition = (booking: Booking, room: Room, date: Date): 'start' | 'middle' | 'end' | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (booking.checkIn === dateStr) return 'start';
    if (booking.checkOut === dateStr) return 'end';
    if (booking.checkIn < dateStr && booking.checkOut > dateStr) return 'middle';
    return null;
  };

  const handleCellClick = (roomId: string, date: Date) => {
    const existingBooking = getBookingsForRoomAndDate(roomId, date);
    if (existingBooking) {
      setSelectedBooking(existingBooking);
      setNewBookingData(null);
    } else {
      setNewBookingData({ roomId, date });
      setSelectedBooking(null);
    }
    setShowBookingModal(true);
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return '#E6E6FA';
      case 'deluxe': return '#87CEEB';
      case 'standard': return '#F5F5F0';
      default: return '#F5F5F0';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#8FBC8F';
      case 'pending': return '#FFF4B7';
      case 'checked_in': return '#FF7F7F';
      default: return '#E8E8E3';
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="shadow-lg border-[#8FBC8F]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevWeek} className="h-9">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous Week
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="h-9 bg-[#8FBC8F] text-white hover:bg-[#8FBC8F]/90 border-[#8FBC8F]">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek} className="h-9">
                Next Week
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Date Range Display */}
            <div className="text-sm font-semibold text-[#0A1128]">
              {format(startDate, 'MMM d, yyyy')} – {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy')}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mr-2">View:</span>
              <Button
                variant={daysToShow === 14 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDaysToShow(14)}
                className={daysToShow === 14 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                2 Weeks
              </Button>
              <Button
                variant={daysToShow === 21 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDaysToShow(21)}
                className={daysToShow === 21 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                3 Weeks
              </Button>
              <Button
                variant={daysToShow === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDaysToShow(30)}
                className={daysToShow === 30 ? 'bg-[#8FBC8F] hover:bg-[#8FBC8F]/90' : ''}
              >
                Month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-lg border-[#8FBC8F]/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-xs flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#8FBC8F] border border-[#8FBC8F]"></div>
              <span className="text-gray-600">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FFF4B7] border border-[#FFF4B7]"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FF7F7F] border border-[#FF7F7F]"></div>
              <span className="text-gray-600">Checked-in (Current)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-200 border border-gray-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-gray-400 to-transparent opacity-50"></div>
              </div>
              <span className="text-gray-600">Blocked/Cleaning</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Calendar */}
      <Card className="shadow-xl border-[#8FBC8F]/20">
        <CardHeader className="bg-gradient-to-r from-[#8FBC8F]/10 to-transparent border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Room Calendar Timeline</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Maximize2 className="w-4 h-4" />
              <span>Click any cell to view or create booking</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto" ref={scrollRef}>
            <div className="min-w-max">
              {/* Header Row with Dates */}
              <div className="flex border-b bg-gray-50 sticky top-0 z-10">
                <div className="w-40 p-3 border-r bg-white flex-shrink-0 font-semibold text-sm text-gray-700">
                  Room
                </div>
                {dateRange.map((date) => {
                  const isToday = isSameDay(date, new Date());
                  return (
                    <div
                      key={date.toISOString()}
                      className={`w-24 p-2 border-r text-center flex-shrink-0 ${
                        isToday ? 'bg-[#8FBC8F]/20 font-bold' : ''
                      }`}
                    >
                      <div className={`text-xs font-semibold ${isToday ? 'text-[#8FBC8F]' : 'text-gray-700'}`}>
                        {format(date, 'EEE')}
                      </div>
                      <div className={`text-sm ${isToday ? 'text-[#8FBC8F] font-bold' : 'text-gray-600'}`}>
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs text-gray-400">{format(date, 'MMM')}</div>
                    </div>
                  );
                })}
              </div>

              {/* Room Rows */}
              {rooms.map((room) => (
                <div key={room.id} className="flex border-b hover:bg-gray-50/50 transition-colors">
                  {/* Room Name Column */}
                  <div
                    className="w-40 p-3 border-r flex-shrink-0 flex flex-col justify-center"
                    style={{ backgroundColor: getRoomTypeColor(room.type) }}
                  >
                    <div className="font-semibold text-sm text-[#0A1128]">{room.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{room.type}</div>
                    <Badge className="mt-1 w-fit text-xs" variant="outline">
                      ${room.baseRate}/day
                    </Badge>
                  </div>

                  {/* Date Cells */}
                  {dateRange.map((date) => {
                    const booking = getBookingsForRoomAndDate(room.id, date);
                    const position = booking ? getBookingPosition(booking, room, date) : null;

                    return (
                      <div
                        key={date.toISOString()}
                        className={`w-24 p-1 border-r flex-shrink-0 cursor-pointer relative group transition-all ${
                          booking ? '' : 'hover:bg-blue-50'
                        }`}
                        onClick={() => handleCellClick(room.id, date)}
                      >
                        {booking ? (
                          <div
                            className={`h-full rounded px-2 py-1 text-xs font-medium text-white relative overflow-hidden ${
                              position === 'start' ? 'rounded-l-lg' : ''
                            } ${position === 'end' ? 'rounded-r-lg' : ''} ${
                              position === 'middle' ? 'rounded-none' : ''
                            }`}
                            style={{
                              backgroundColor: getStatusColor(booking.status),
                              border: `1px solid ${getStatusColor(booking.status)}`,
                            }}
                          >
                            {position === 'start' && (
                              <div className="truncate">
                                <div className="font-semibold">{booking.catName}</div>
                                <div className="text-[10px] opacity-90">{booking.ownerName}</div>
                              </div>
                            )}
                            {/* Tooltip on hover */}
                            <div className="hidden group-hover:block absolute z-20 left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap w-64">
                              <div className="font-semibold mb-1">{booking.catName}</div>
                              <div>Owner: {booking.ownerName}</div>
                              <div>Check-in: {format(new Date(booking.checkIn), 'MMM d, yyyy')}</div>
                              <div>Check-out: {format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
                              <div>Nights: {booking.numberOfNights}</div>
                              <div>Price: ${booking.finalPrice.toFixed(2)}</div>
                              {booking.specialNeeds && (
                                <div className="mt-1 pt-1 border-t border-gray-700">
                                  ⚠️ {booking.specialNeeds}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>No active rooms. Add rooms in Room Management to get started.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingFormModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedBooking(null);
            setNewBookingData(null);
          }}
          booking={selectedBooking}
          preSelectedRoom={newBookingData?.roomId}
          preSelectedDate={newBookingData?.date}
          onSave={() => {
            setBookings(getBookings());
            setShowBookingModal(false);
            setSelectedBooking(null);
            setNewBookingData(null);
          }}
        />
      )}
    </div>
  );
}
