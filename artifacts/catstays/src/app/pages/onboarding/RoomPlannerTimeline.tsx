import { X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface RoomOccupancy {
  occupied: boolean;
  checkOut?: string;
}

interface RoomPlannerTimelineProps {
  showRoomPlanner: boolean;
  roomPlannerPet: string | null;
  bookingForm: {
    checkInDate: string;
    checkOutDate: string;
    roomAssignments: Record<string, string>;
  };
  setShowRoomPlanner: (show: boolean) => void;
  setRoomPlannerPet: (pet: string | null) => void;
  setBookingForm: (form: any) => void;
}

export const RoomPlannerTimeline = ({
  showRoomPlanner,
  roomPlannerPet,
  bookingForm,
  setShowRoomPlanner,
  setRoomPlannerPet,
  setBookingForm
}: RoomPlannerTimelineProps) => {
  if (!showRoomPlanner || !roomPlannerPet) return null;

  // Mock occupancy data for demonstration
  // In a real app, this would come from your database
  const roomOccupancy: Record<string, RoomOccupancy> = {
    '1': { occupied: true, checkOut: '2026-03-19' },
    '2': { occupied: true, checkOut: '2026-03-20' },
    '3': { occupied: false },
    '4': { occupied: true, checkOut: '2026-03-21' },
    '5': { occupied: true, checkOut: '2026-03-22' },
    '6': { occupied: false },
    '7': { occupied: true, checkOut: '2026-03-18' },
    '8': { occupied: true, checkOut: '2026-03-23' },
    '9': { occupied: false },
    '10': { occupied: true, checkOut: '2026-03-19' },
    '11': { occupied: false },
    '12': { occupied: true, checkOut: '2026-03-20' },
    '13': { occupied: false },
    '14': { occupied: true, checkOut: '2026-03-21' },
    '15': { occupied: false },
    '16': { occupied: false },
    '17': { occupied: false },
    '18': { occupied: true, checkOut: '2026-03-22' },
    '19': { occupied: false },
    '20': { occupied: true, checkOut: '2026-03-23' }
  };

  const handleRoomSelect = (roomNumber: string) => {
    setBookingForm((prev: any) => ({
      ...prev,
      roomAssignments: { ...prev.roomAssignments, [roomPlannerPet]: roomNumber }
    }));
    setShowRoomPlanner(false);
    setRoomPlannerPet(null);
  };

  const isRoomSelected = (roomNumber: string) => {
    return bookingForm.roomAssignments[roomPlannerPet] === roomNumber;
  };

  // Filter to only show available rooms
  const isRoomAvailable = (room: RoomOccupancy, checkInDate: string) => {
    // Room is available if not occupied at all
    if (!room.occupied) return true;
    
    // Room is available if checkout is on or before check-in date (same-day turnover)
    if (room.checkOut) {
      const roomCheckOut = new Date(room.checkOut);
      const bookingCheckIn = new Date(checkInDate);
      // Allow same-day turnover: checkout on arrival day is OK
      return roomCheckOut <= bookingCheckIn;
    }
    
    // Room is occupied with no checkout date
    return false;
  };

  // Calculate the visual width of occupancy bar based on checkout date
  const getOccupancyWidth = (checkOutDate: string) => {
    if (!bookingForm.checkInDate || !bookingForm.checkOutDate || !checkOutDate) return 0;
    
    const checkIn = new Date(bookingForm.checkInDate);
    const checkOut = new Date(bookingForm.checkOutDate);
    const roomCheckOut = new Date(checkOutDate);
    
    // If room checkout is before booking starts, show full availability
    if (roomCheckOut <= checkIn) return 0;
    
    // If room checkout is after booking ends, show full occupancy
    if (roomCheckOut >= checkOut) return 100;
    
    // Calculate percentage
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const occupiedDays = Math.ceil((roomCheckOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return (occupiedDays / totalDays) * 100;
  };

  return (
    <>
      <div 
        className="absolute inset-0 bg-black/30 transition-opacity duration-300 z-[10000]"
        onClick={() => {
          setShowRoomPlanner(false);
          setRoomPlannerPet(null);
        }}
      />
      <div 
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] shadow-2xl z-[10001] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#0A1128] to-[#0A1128]/95 px-5 pt-2 pb-5 rounded-t-[24px]">
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-white">Select Room</h3>
              <p className="text-sm text-white/70 mt-1">For {roomPlannerPet}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowRoomPlanner(false);
                setRoomPlannerPet(null);
              }}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Date Range Header */}
        {bookingForm.checkInDate && bookingForm.checkOutDate && (
          <div className="flex-shrink-0 px-5 py-4 bg-[#F8F7F5] border-b border-[#0A1128]/10">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-semibold text-[#0A1128]">RUN</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[#0A1128]">
                  {format(new Date(bookingForm.checkInDate), 'd MMM yyyy')}
                </span>
                <ChevronRight className="w-4 h-4 text-[#0A1128]/40" />
                <span className="font-semibold text-[#0A1128]">
                  {format(new Date(bookingForm.checkOutDate), 'd MMM yyyy')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Room Timeline List */}
        <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#F8F7F5]">
          <div className="space-y-3">
            {Object.keys(roomOccupancy)
              .filter((roomNumber) => isRoomAvailable(roomOccupancy[roomNumber], bookingForm.checkInDate))
              .map((roomNumber) => {
              const room = roomOccupancy[roomNumber];
              const available = isRoomAvailable(room, bookingForm.checkInDate);
              const selected = isRoomSelected(roomNumber);
              const occupancyWidth = room.checkOut ? getOccupancyWidth(room.checkOut) : 0;

              return (
                <button
                  key={roomNumber}
                  type="button"
                  onClick={() => handleRoomSelect(roomNumber)}
                  className={`w-full bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(10,17,40,0.06)] transition-all ${
                    selected
                      ? 'ring-2 ring-[#C46A3A] shadow-[0_4px_16px_rgba(196,106,58,0.2)]'
                      : 'hover:shadow-[0_4px_12px_rgba(10,17,40,0.1)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Room Name */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: available ? '#7DAF7B' : '#94A3B8' }}></div>
                      <span className="font-medium text-[#0A1128]">Private Room {roomNumber}</span>
                    </div>

                    {/* Timeline Bar */}
                    <div className="flex-1 h-8 bg-[#0A1128]/5 rounded-lg relative overflow-hidden">
                      {room.occupied && occupancyWidth > 0 && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-[#5DADE2] rounded-lg transition-all"
                          style={{ width: `${occupancyWidth}%` }}
                        />
                      )}
                      {available && (
                        <div className="absolute inset-0 bg-[#7DAF7B]/30 rounded-lg"></div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Legend */}
        <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-[#0A1128]/10">
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#7DAF7B]"></div>
              <span className="text-[#0A1128]/70 font-medium">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#5DADE2]"></div>
              <span className="text-[#0A1128]/70 font-medium">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#C46A3A]"></div>
              <span className="text-[#0A1128]/70 font-medium">Selected</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};