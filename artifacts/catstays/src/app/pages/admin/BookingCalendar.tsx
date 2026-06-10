import { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronLeft, ChevronRight, Search, Info, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { addDays, format, isSameDay, isWeekend, startOfToday, differenceInDays, addWeeks } from 'date-fns';

// Mock Data
const ROOMS = [
  { id: 'r1', name: 'Sunshine Suite', type: 'Premium', capacity: 2, currentOccupancy: 1 },
  { id: 'r2', name: 'Garden View', type: 'Standard', capacity: 1, currentOccupancy: 1 },
  { id: 'r3', name: 'Cozy Corner', type: 'Standard', capacity: 1, currentOccupancy: 0 },
  { id: 'r4', name: 'Royal Retreat', type: 'Premium', capacity: 3, currentOccupancy: 2 },
  { id: 'r5', name: 'Peaceful Pad', type: 'Standard', capacity: 1, currentOccupancy: 1 },
  { id: 'r6', name: 'Luxury Lodge', type: 'Premium', capacity: 2, currentOccupancy: 0 },
];

interface Cat {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  roomId: string;
  cats: Cat[];
  ownerName: string;
  startDate: Date;
  endDate: Date;
  status: 'confirmed' | 'unpaid';
  splitSegments?: { roomId: string; startDate: Date; endDate: Date }[];
}

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    roomId: 'r1',
    cats: [{ id: 'c1', name: 'Whiskers' }],
    ownerName: 'Sarah Johnson',
    startDate: new Date(2026, 2, 18),
    endDate: new Date(2026, 2, 22),
    status: 'confirmed',
  },
  {
    id: 'b2',
    roomId: 'r2',
    cats: [{ id: 'c2', name: 'Luna' }],
    ownerName: 'Michael Chen',
    startDate: new Date(2026, 2, 17),
    endDate: new Date(2026, 2, 20),
    status: 'confirmed',
  },
  {
    id: 'b3',
    roomId: 'r4',
    cats: [{ id: 'c3', name: 'Felix' }, { id: 'c4', name: 'Mittens' }],
    ownerName: 'Emma Davis',
    startDate: new Date(2026, 2, 19),
    endDate: new Date(2026, 2, 25),
    status: 'unpaid',
  },
  {
    id: 'b4',
    roomId: 'r5',
    cats: [{ id: 'c5', name: 'Shadow' }],
    ownerName: 'James Wilson',
    startDate: new Date(2026, 2, 20),
    endDate: new Date(2026, 2, 23),
    status: 'confirmed',
  },
];

type ViewMode = 'week' | 'fortnight' | 'month-lite';

interface BookingTileProps {
  booking: Booking;
  startDate: Date;
  dates: Date[];
  onBookingClick: (booking: Booking) => void;
  onMoveBooking: (bookingId: string, newRoomId: string) => void;
}

const BookingTile = ({ booking, startDate, dates, onBookingClick, onMoveBooking }: BookingTileProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BOOKING',
    item: { bookingId: booking.id, currentRoomId: booking.roomId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Calculate position and width
  const bookingStartIndex = dates.findIndex(date => isSameDay(date, booking.startDate));
  const bookingEndIndex = dates.findIndex(date => isSameDay(date, booking.endDate));
  
  if (bookingStartIndex === -1) return null;
  
  const width = bookingEndIndex !== -1 
    ? (bookingEndIndex - bookingStartIndex + 1) 
    : (differenceInDays(booking.endDate, booking.startDate) + 1);

  const isPaid = booking.status === 'confirmed';

  return (
    <div
      ref={drag}
      onClick={() => onBookingClick(booking)}
      className="absolute cursor-move group"
      style={{
        left: `${bookingStartIndex * 120 + 4}px`,
        width: `${width * 120 - 8}px`,
        top: '4px',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div 
        className={`h-[60px] rounded-lg p-2 shadow-sm border-2 transition-all
          ${isPaid 
            ? 'bg-[#C46A3A]/10 border-[#C46A3A]/30 hover:shadow-md hover:border-[#C46A3A]' 
            : 'bg-yellow-50 border-yellow-400/50 hover:shadow-md hover:border-yellow-500'
          }`}
      >
        <div className="flex items-start justify-between gap-1 mb-1">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {booking.cats.map(cat => (
              <span 
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Open pet profile:', cat.id);
                }}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-[#0A1128]/20 text-[#0A1128] hover:bg-[#0A1128]/5 cursor-pointer"
              >
                {cat.name}
              </span>
            ))}
          </div>
          <Info className="w-3.5 h-3.5 text-[#0A1128]/40 hover:text-[#C46A3A] flex-shrink-0" />
        </div>
        <div className="text-xs text-[#0A1128]/60 truncate">{booking.ownerName}</div>
        {!isPaid && (
          <div className="absolute top-1 right-1">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
          </div>
        )}
      </div>
    </div>
  );
};

interface RoomRowProps {
  room: typeof ROOMS[0];
  bookings: Booking[];
  dates: Date[];
  onBookingClick: (booking: Booking) => void;
  onMoveBooking: (bookingId: string, newRoomId: string) => void;
}

const RoomRow = ({ room, bookings, dates, onBookingClick, onMoveBooking }: RoomRowProps) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'BOOKING',
    drop: (item: { bookingId: string; currentRoomId: string }) => {
      if (item.currentRoomId !== room.id) {
        onMoveBooking(item.bookingId, room.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const roomBookings = bookings.filter(b => b.roomId === room.id);

  return (
    <div className="flex border-b border-[#0A1128]/10">
      {/* Room Info - Sticky Left */}
      <div className="sticky left-0 z-20 bg-[#F8F7F5] border-r border-[#0A1128]/10 w-[200px] p-4 flex-shrink-0">
        <div className="font-medium text-[#0A1128]">{room.name}</div>
        <div className="text-xs text-[#0A1128]/60 mt-1">{room.type}</div>
        <div className="text-xs text-[#0A1128]/50 mt-1">
          {room.currentOccupancy} / {room.capacity} {room.capacity === 1 ? 'cat' : 'cats'}
        </div>
      </div>

      {/* Date Cells */}
      <div 
        ref={drop}
        className={`flex-1 min-h-[80px] relative transition-colors
          ${isOver && canDrop ? 'bg-[#C46A3A]/5' : ''}
        `}
      >
        <div className="flex">
          {dates.map((date, i) => (
            <div 
              key={i}
              className={`w-[120px] border-r border-[#0A1128]/5 h-[80px]
                ${isWeekend(date) ? 'bg-[#0A1128]/[0.02]' : ''}
              `}
            >
              {/* Dotted pattern for empty space */}
              <div className="w-full h-full" style={{ 
                backgroundImage: 'radial-gradient(circle, #0A1128 0.5px, transparent 0.5px)',
                backgroundSize: '10px 10px',
                opacity: 0.03
              }}></div>
            </div>
          ))}
        </div>

        {/* Booking Tiles */}
        {roomBookings.map(booking => (
          <BookingTile
            key={booking.id}
            booking={booking}
            startDate={dates[0]}
            dates={dates}
            onBookingClick={onBookingClick}
            onMoveBooking={onMoveBooking}
          />
        ))}
      </div>
    </div>
  );
};

interface BookingInfoPanelProps {
  booking: Booking | null;
  onClose: () => void;
}

const BookingInfoPanel = ({ booking, onClose }: BookingInfoPanelProps) => {
  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-serif text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Booking Details
            </h3>
            <button 
              onClick={onClose}
              className="text-[#0A1128]/40 hover:text-[#0A1128]"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-[#0A1128]/60 mb-1">Owner</div>
              <div className="font-medium text-[#0A1128]">{booking.ownerName}</div>
            </div>

            <div>
              <div className="text-sm text-[#0A1128]/60 mb-2">Cats</div>
              <div className="flex flex-wrap gap-2">
                {booking.cats.map(cat => (
                  <span 
                    key={cat.id}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#C46A3A]/10 border border-[#C46A3A]/30 text-[#0A1128]"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#0A1128]/60 mb-1">Dates</div>
              <div className="font-medium text-[#0A1128]">
                {format(booking.startDate, 'MMM d')} - {format(booking.endDate, 'MMM d, yyyy')}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#0A1128]/60 mb-1">Room</div>
              <div className="font-medium text-[#0A1128]">
                {ROOMS.find(r => r.id === booking.roomId)?.name}
              </div>
            </div>

            <div>
              <div className="text-sm text-[#0A1128]/60 mb-1">Payment Status</div>
              <div className="font-medium">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm
                  ${booking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status === 'confirmed' ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          <Button 
            className="w-full mt-6 bg-[#C46A3A] hover:bg-[#A85A30] text-white"
            onClick={onClose}
          >
            View Full Booking →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export function BookingCalendar() {
  const today = startOfToday();
  const [currentDate, setCurrentDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate dates based on view mode
  const getDates = () => {
    const numDays = viewMode === 'week' ? 7 : viewMode === 'fortnight' ? 14 : 30;
    return Array.from({ length: numDays }, (_, i) => addDays(currentDate, i));
  };

  const dates = getDates();

  const handleNavigate = (direction: 'prev' | 'next') => {
    const days = viewMode === 'week' ? 7 : viewMode === 'fortnight' ? 14 : 30;
    setCurrentDate(prev => addDays(prev, direction === 'next' ? days : -days));
  };

  const handleToday = () => {
    setCurrentDate(today);
  };

  const handleMoveBooking = (bookingId: string, newRoomId: string) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, roomId: newRoomId } : b)
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#F8F7F5]">
        {/* Top Bar */}
        <div className="bg-white border-b border-[#0A1128]/10 sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between gap-4 max-w-[1800px] mx-auto">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={handleToday}
                className="border-[#0A1128]/20"
              >
                Today
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleNavigate('prev')}
                  className="border-[#0A1128]/20"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-2 px-3 py-2 border border-[#0A1128]/20 rounded-lg min-w-[180px] justify-center">
                  <CalendarIcon className="w-4 h-4 text-[#0A1128]/60" />
                  <span className="font-medium text-[#0A1128]">
                    {format(currentDate, 'MMM d, yyyy')}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleNavigate('next')}
                  className="border-[#0A1128]/20"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['week', 'fortnight', 'month-lite'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors
                      ${viewMode === mode 
                        ? 'bg-white text-[#0A1128] shadow-sm' 
                        : 'text-[#0A1128]/60 hover:text-[#0A1128]'
                      }`}
                  >
                    {mode === 'week' ? 'Week' : mode === 'fortnight' ? 'Fortnight' : 'Month'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A1128]/40" />
                <Input 
                  placeholder="Search bookings..."
                  className="pl-9 w-[240px] border-[#0A1128]/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-auto" ref={scrollRef}>
          <div className="min-w-max">
            {/* Date Header - Sticky Top */}
            <div className="flex sticky top-[73px] z-20 bg-white border-b border-[#0A1128]/10">
              <div className="sticky left-0 z-30 bg-white border-r border-[#0A1128]/10 w-[200px] flex-shrink-0"></div>
              <div className="flex">
                {dates.map((date, i) => (
                  <div 
                    key={i}
                    className={`w-[120px] border-r border-[#0A1128]/10 p-3 text-center
                      ${isSameDay(date, today) ? 'bg-[#C46A3A]/10' : ''}
                      ${isWeekend(date) ? 'bg-[#0A1128]/[0.02]' : ''}
                    `}
                  >
                    <div className={`text-xs font-medium uppercase tracking-wide
                      ${isSameDay(date, today) ? 'text-[#C46A3A]' : 'text-[#0A1128]/60'}
                    `}>
                      {format(date, 'EEE')}
                    </div>
                    <div className={`text-lg font-semibold mt-0.5
                      ${isSameDay(date, today) ? 'text-[#C46A3A]' : 'text-[#0A1128]'}
                    `}>
                      {format(date, 'd')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Rows */}
            {ROOMS.map(room => (
              <RoomRow
                key={room.id}
                room={room}
                bookings={bookings}
                dates={dates}
                onBookingClick={setSelectedBooking}
                onMoveBooking={handleMoveBooking}
              />
            ))}
          </div>
        </div>

        {/* Booking Info Panel */}
        <BookingInfoPanel 
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      </div>
    </DndProvider>
  );
}
