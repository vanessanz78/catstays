import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { getRooms, getBookings, getPricingRules } from '../../utils/roomPlannerStorage';
import { Booking, Room, PricingRule } from '../../types/room-planner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, getDay } from 'date-fns';
import { calculatePrice } from '../../utils/pricingCalculator';

export function RoomPricingCalendar() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const loadedRooms = getRooms();
    setRooms(loadedRooms);
    if (loadedRooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(loadedRooms[0].id);
    }
    setBookings(getBookings());
    setPricingRules(getPricingRules());
  }, []);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate prices for each day
  const dailyPrices = daysInMonth.map((date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const booking = bookings.find(
      (b) =>
        b.roomId === selectedRoomId &&
        b.status !== 'cancelled' &&
        b.checkIn <= dateStr &&
        b.checkOut >= dateStr
    );

    if (booking) {
      return {
        date,
        price: booking.finalPrice / booking.numberOfNights,
        isBooked: true,
        booking,
        multiplier: 1,
        appliedRules: booking.appliedDiscounts || [],
      };
    }

    // Calculate theoretical price with pricing rules
    const price = calculatePrice(
      selectedRoom?.baseRate || 0,
      date,
      date,
      pricingRules
    );
    
    const multiplier = price.total / (selectedRoom?.baseRate || 1);
    
    return {
      date,
      price: price.total,
      isBooked: false,
      booking: null,
      multiplier,
      appliedRules: price.appliedRules || [],
    };
  });

  const getPriceColor = (multiplier: number, isBooked: boolean) => {
    if (isBooked) return 'bg-gray-300 text-gray-700'; // Booked dates
    if (multiplier >= 1.5) return 'bg-[#DC143C] text-white'; // Peak pricing (150%+)
    if (multiplier >= 1.2) return 'bg-[#FF7F7F] text-white'; // Premium (120-149%)
    if (multiplier >= 1.0) return 'bg-[#8FBC8F] text-white'; // Base pricing (100-119%)
    if (multiplier >= 0.9) return 'bg-[#FFD700] text-gray-800'; // Light discount (90-99%)
    return 'bg-[#87CEEB] text-white'; // Discount (<90%)
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get the starting day of week for the month
  const startDayOfWeek = getDay(monthStart);

  // Create padding days for the calendar grid
  const paddingDays = Array(startDayOfWeek).fill(null);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="shadow-lg border-[#8FBC8F]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Room Selector */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Select Room:</label>
              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Choose a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} ({room.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoom && (
                <Badge variant="outline" className="text-sm">
                  Base Rate: ${selectedRoom.baseRate}/day
                </Badge>
              )}
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-9">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-semibold text-[#0A1128] min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-9">
                <ChevronRight className="w-4 h-4" />
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
              <div className="w-6 h-6 rounded bg-[#DC143C]"></div>
              <span className="text-gray-600">Peak (150%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FF7F7F]"></div>
              <span className="text-gray-600">Premium (120-149%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#8FBC8F]"></div>
              <span className="text-gray-600">Base (100-119%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#FFD700]"></div>
              <span className="text-gray-600">Light Discount (90-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#87CEEB]"></div>
              <span className="text-gray-600">Discount (&lt;90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-300"></div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD700]" />
              <span className="text-gray-600">= Active pricing rules</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {selectedRoom ? (
        <Card className="shadow-xl border-[#8FBC8F]/20">
          <CardHeader className="bg-gradient-to-r from-[#8FBC8F]/10 to-transparent border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{selectedRoom.name} - Pricing Heat Map</CardTitle>
                <CardDescription>
                  Hover over any date to see pricing details and active rules
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding days */}
              {paddingDays.map((_, index) => (
                <div key={`padding-${index}`} className="aspect-square"></div>
              ))}

              {/* Actual days */}
              {dailyPrices.map(({ date, price, isBooked, booking, multiplier, appliedRules }) => {
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={date.toISOString()}
                    className={`aspect-square rounded-lg ${getPriceColor(
                      multiplier,
                      isBooked
                    )} p-2 relative group cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${
                      isToday ? 'ring-2 ring-[#0A1128]' : ''
                    }`}
                  >
                    {/* Date Number */}
                    <div className="text-sm font-bold">{format(date, 'd')}</div>

                    {/* Price */}
                    <div className="text-xs font-semibold mt-1">
                      ${price.toFixed(0)}
                    </div>

                    {/* Rules Indicator */}
                    {appliedRules.length > 0 && !isBooked && (
                      <Sparkles className="w-3 h-3 absolute top-1 right-1" />
                    )}

                    {/* Booked Indicator */}
                    {isBooked && booking && (
                      <div className="text-[10px] mt-0.5 truncate">
                        {booking.catName}
                      </div>
                    )}

                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl whitespace-nowrap w-64">
                      <div className="font-semibold mb-2">{format(date, 'EEEE, MMMM d, yyyy')}</div>
                      
                      {isBooked && booking ? (
                        <>
                          <div className="text-[#87CEEB]">BOOKED</div>
                          <div className="mt-1">Guest: {booking.catName}</div>
                          <div>Owner: {booking.ownerName}</div>
                          <div className="mt-1 pt-1 border-t border-gray-700">
                            Daily Rate: ${price.toFixed(2)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span>Base Rate:</span>
                            <span>${selectedRoom.baseRate.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between font-semibold text-[#FFD700]">
                            <span>Dynamic Price:</span>
                            <span>${price.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span>Multiplier:</span>
                            <span>{multiplier.toFixed(2)}x ({((multiplier - 1) * 100).toFixed(0)}%)</span>
                          </div>

                          {appliedRules.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="text-[#87CEEB] mb-1">Active Rules:</div>
                              {appliedRules.map((rule, idx) => (
                                <div key={idx} className="text-[10px] flex items-start gap-1">
                                  <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>{rule}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-[#8FBC8F]/20">
          <CardContent className="p-12 text-center">
            <Info className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No rooms available. Add rooms in Room Management to view pricing calendar.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}