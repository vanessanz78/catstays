import { useMemo, useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert, GripHorizontal, Info, Plus } from 'lucide-react';
import type { BookingWithDetails } from '@/hooks/useBookings';
import type { RoomRecord } from '@/hooks/useRooms';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { formatBookingTime } from '../../lib/bookingSchedule';
import {
  bookingNeedsRoomUnit,
  bookingRoomUnitKeys,
  expandPhysicalRooms,
  physicalRoomName,
  roomUnitKey,
} from '../../lib/roomInventory';
import {
  addDateKey,
  buildRoomSegments,
  buildTimelineDays,
  catNamesForRoom,
  roomHasBookingConflict,
  shiftBookingDates,
} from '../../lib/staffRoomTimeline';

const ROOM_COLUMN_WIDTH = 164;
const DAY_COLUMN_WIDTH = 108;
const VISIBLE_DAY_COUNT = 21;

type MoveBooking = (
  bookingId: string,
  move: { roomId: string; roomUnitNumber: number; checkIn: string; checkOut: string },
) => Promise<{ error: unknown }>;

type StaffRoomCalendarProps = {
  bookings: BookingWithDetails[];
  rooms: RoomRecord[];
  isLoading: boolean;
  moveBooking: MoveBooking;
  splitBooking: (
    bookingId: string,
    segments: Array<{ cat_id?: string | null; room_id: string; room_unit_number: number; starts_on: string; ends_on: string }>,
  ) => Promise<{ error: unknown }>;
};

function localDateKey(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

function errorMessage(error: unknown) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'The booking could not be moved.';
}

function customerName(booking: BookingWithDetails) {
  return booking.customer?.name || booking.guest_name || 'Online customer';
}

function bookingCatCount(booking: BookingWithDetails) {
  return Math.max(
    booking.booking_cats?.length || 0,
    booking.booking_cat_rooms?.length || 0,
    booking.number_of_cats || 0,
    1,
  );
}

function bookingTone(booking: BookingWithDetails) {
  if (booking.status === 'pending') return 'bg-[#C46A3A] hover:bg-[#A85A30]';
  if (booking.status === 'checked_in') return 'bg-[#2D6A4F] hover:bg-[#24563F]';
  if (booking.status === 'completed') return 'bg-[#6B7280] hover:bg-[#555B66]';
  return 'bg-[#0A4C8B] hover:bg-[#083E72]';
}

function formatBookingDate(value: string) {
  return format(parseISO(value), 'd MMM yyyy');
}

function formatCompactRange(booking: BookingWithDetails) {
  const checkIn = parseISO(booking.check_in);
  const checkOut = parseISO(booking.check_out);
  const start = format(checkIn, checkIn.getFullYear() === checkOut.getFullYear() ? 'd MMM' : 'd MMM yyyy');
  return `${start} – ${format(checkOut, 'd MMM')}`;
}

export function StaffRoomCalendar({ bookings, rooms, isLoading, moveBooking, splitBooking }: StaffRoomCalendarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const today = localDateKey();
  const [anchorDate, setAnchorDate] = useState(() => addDateKey(searchParams.get('date') || today, -1));
  const [selected, setSelected] = useState<{
    booking: BookingWithDetails;
    roomId?: string;
    roomUnitNumber?: number;
    roomName?: string;
  } | null>(null);
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);
  const [movingBookingId, setMovingBookingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [moveDraft, setMoveDraft] = useState({ roomKey: '', checkIn: '' });
  const [splitDraft, setSplitDraft] = useState({ firstRoomKey: '', secondRoomKey: '', secondStartsOn: '', thirdRoomKey: '', thirdStartsOn: '' });
  const [editorMode, setEditorMode] = useState<'none' | 'move' | 'split'>('none');
  const dragEndedAt = useRef(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => buildTimelineDays(anchorDate, VISIBLE_DAY_COUNT), [anchorDate]);
  const firstDate = days[0];
  const lastDate = days[days.length - 1];
  const activeBookings = useMemo(
    () => bookings.filter((booking) => booking.status !== 'cancelled'),
    [bookings],
  );
  const hasUnassigned = activeBookings.some(bookingNeedsRoomUnit);
  const physicalRooms = useMemo(
    () => expandPhysicalRooms(rooms),
    [rooms],
  );
  const rows = [
    ...(hasUnassigned ? [{ key: 'unassigned', roomId: null, roomUnitNumber: null, room: null, name: 'Unassigned', subtitle: 'Needs a physical room' }] : []),
    ...physicalRooms.map((physicalRoom) => ({
      key: physicalRoom.key,
      roomId: physicalRoom.roomId,
      roomUnitNumber: physicalRoom.unitNumber,
      room: physicalRoom.room,
      name: physicalRoom.name,
      subtitle: `${physicalRoom.room.name} · up to ${physicalRoom.room.capacity || 1} cat${physicalRoom.room.capacity === 1 ? '' : 's'}`,
    })),
  ];
  const timelineWidth = ROOM_COLUMN_WIDTH + (days.length * DAY_COLUMN_WIDTH);

  const changeDate = (date: string) => {
    if (!date) return;
    setAnchorDate(date);
    timelineRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const goToday = () => changeDate(addDateKey(today, -1));

  const startBooking = (room: RoomRecord, roomUnitNumber: number, dateKey: string) => {
    if (!room.is_active) return;
    const query = new URLSearchParams({
      new: 'true',
      checkIn: dateKey,
      checkOut: dateKey,
      room: room.id,
      roomUnit: String(roomUnitNumber),
    });
    navigate(`/staff-dashboard/bookings?${query.toString()}`);
  };

  const showBooking = (
    booking: BookingWithDetails,
    roomId?: string,
    roomUnitNumber?: number,
    roomName?: string,
  ) => {
    if (Date.now() - dragEndedAt.current < 300) return;
    setSelected({ booking, roomId, roomUnitNumber, roomName });
    setMessage(null);
    const existingKey = bookingRoomUnitKeys(booking)[0] || '';
    setMoveDraft({ roomKey: existingKey, checkIn: booking.check_in });
    setSplitDraft({ firstRoomKey: existingKey, secondRoomKey: '', secondStartsOn: addDateKey(booking.check_in, 1), thirdRoomKey: '', thirdStartsOn: '' });
    setEditorMode('none');
  };

  const saveMoveFromDialog = async () => {
    if (!selected || !moveDraft.roomKey || !moveDraft.checkIn) return;
    const target = physicalRooms.find((room) => room.key === moveDraft.roomKey);
    if (!target) return;
    const nextDates = shiftBookingDates(selected.booking.check_in, selected.booking.check_out, moveDraft.checkIn);
    setMovingBookingId(selected.booking.id);
    const result = await moveBooking(selected.booking.id, {
      roomId: target.roomId,
      roomUnitNumber: target.unitNumber,
      checkIn: nextDates.checkIn,
      checkOut: nextDates.checkOut,
    });
    setMovingBookingId(null);
    if (result.error) {
      setMessage({ tone: 'error', text: errorMessage(result.error) });
      return;
    }
    setSelected(null);
    setMessage({ tone: 'success', text: `${catNamesForRoom(selected.booking)} moved to ${target.name}.` });
  };

  const saveSplitFromDialog = async () => {
    if (!selected || !splitDraft.firstRoomKey || !splitDraft.secondRoomKey || !splitDraft.secondStartsOn) return;
    const firstRoom = physicalRooms.find((room) => room.key === splitDraft.firstRoomKey);
    const secondRoom = physicalRooms.find((room) => room.key === splitDraft.secondRoomKey);
    if (!firstRoom || !secondRoom) return;
    const wantsThirdRoom = Boolean(splitDraft.thirdRoomKey || splitDraft.thirdStartsOn);
    const thirdRoom = wantsThirdRoom ? physicalRooms.find((room) => room.key === splitDraft.thirdRoomKey) : undefined;
    if (splitDraft.secondStartsOn <= selected.booking.check_in || splitDraft.secondStartsOn > selected.booking.check_out) {
      setMessage({ tone: 'error', text: 'Choose the first day the cats move to the second room.' });
      return;
    }
    if (firstRoom.key === secondRoom.key || (thirdRoom && secondRoom.key === thirdRoom.key)) {
      setMessage({ tone: 'error', text: 'Choose a different room for each move in the split stay.' });
      return;
    }
    if (wantsThirdRoom && (!thirdRoom || !splitDraft.thirdStartsOn || splitDraft.thirdStartsOn <= splitDraft.secondStartsOn || splitDraft.thirdStartsOn > selected.booking.check_out)) {
      setMessage({ tone: 'error', text: 'Choose the later day the cats move to the third room.' });
      return;
    }
    const segments = [
      { room_id: firstRoom.roomId, room_unit_number: firstRoom.unitNumber, starts_on: selected.booking.check_in, ends_on: addDateKey(splitDraft.secondStartsOn, -1) },
      { room_id: secondRoom.roomId, room_unit_number: secondRoom.unitNumber, starts_on: splitDraft.secondStartsOn, ends_on: thirdRoom ? addDateKey(splitDraft.thirdStartsOn, -1) : selected.booking.check_out },
      ...(thirdRoom ? [{ room_id: thirdRoom.roomId, room_unit_number: thirdRoom.unitNumber, starts_on: splitDraft.thirdStartsOn, ends_on: selected.booking.check_out }] : []),
    ];
    const result = await splitBooking(selected.booking.id, segments);
    if (result.error) {
      setMessage({ tone: 'error', text: errorMessage(result.error) });
      return;
    }
    setSelected(null);
    setMessage({ tone: 'success', text: `${catNamesForRoom(selected.booking)} now has a split stay across ${segments.length} rooms.` });
  };

  const handleDrop = async (
    event: DragEvent<HTMLButtonElement>,
    room: RoomRecord,
    roomUnitNumber: number,
    dateKey: string,
  ) => {
    event.preventDefault();
    const bookingId = event.dataTransfer.getData('text/catstays-booking') || draggedBookingId;
    setDraggedBookingId(null);
    dragEndedAt.current = Date.now();
    if (!bookingId || !room.is_active) return;

    const booking = activeBookings.find((candidate) => candidate.id === bookingId);
    if (!booking) return;
    const assignedRoomUnits = bookingRoomUnitKeys(booking);
    if (assignedRoomUnits.length > 1) {
      setMessage({
        tone: 'error',
        text: `${catNamesForRoom(booking)} uses more than one room. Open the full booking to change its room assignments safely.`,
      });
      return;
    }
    if (room.capacity < bookingCatCount(booking)) {
      setMessage({
        tone: 'error',
        text: `${room.name} can hold ${room.capacity} cat${room.capacity === 1 ? '' : 's'}, so this stay cannot be moved there.`,
      });
      return;
    }

    const nextDates = shiftBookingDates(booking.check_in, booking.check_out, dateKey);
    const targetName = physicalRoomName(room, roomUnitNumber);
    if (roomHasBookingConflict(activeBookings, room.id, roomUnitNumber, nextDates.checkIn, nextDates.checkOut, booking.id)) {
      setMessage({
        tone: 'error',
        text: `${targetName} is already booked during ${formatBookingDate(nextDates.checkIn)} – ${formatBookingDate(nextDates.checkOut)}.`,
      });
      return;
    }

    if (
      assignedRoomUnits[0] === roomUnitKey(room.id, roomUnitNumber)
      && booking.check_in === nextDates.checkIn
      && booking.check_out === nextDates.checkOut
    ) return;

    setMovingBookingId(booking.id);
    setMessage(null);
    const result = await moveBooking(booking.id, {
      roomId: room.id,
      roomUnitNumber,
      checkIn: nextDates.checkIn,
      checkOut: nextDates.checkOut,
    });
    setMovingBookingId(null);
    if (result.error) {
      setMessage({ tone: 'error', text: errorMessage(result.error) });
      return;
    }
    setMessage({
      tone: 'success',
      text: `${catNamesForRoom(booking)} moved to ${targetName}, ${formatBookingDate(nextDates.checkIn)} – ${formatBookingDate(nextDates.checkOut)}.`,
    });
  };

  return (
    <div className="min-w-0 space-y-4">
      <section className="rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-[#C46A3A]" />
              <h3 className="text-xl font-semibold text-[#0A1128]">Room booking calendar</h3>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#4E5871]">
              Click an empty day to make a booking. Click a booking for details. On a laptop, drag a booking to move the full stay to another available room or start date.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <Button type="button" variant="outline" onClick={goToday}>Go to today</Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" aria-label="Show previous seven days" onClick={() => changeDate(addDateKey(anchorDate, -7))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="Show next seven days" onClick={() => changeDate(addDateKey(anchorDate, 7))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <label className="text-xs font-semibold uppercase tracking-wide text-[#4E5871]">
              Start date
              <input
                type="date"
                value={anchorDate}
                onChange={(event) => changeDate(event.target.value)}
                className="mt-1 block min-h-10 rounded-lg border border-[#E8DED4] bg-white px-3 text-sm font-normal text-[#0A1128] outline-none focus:border-[#C46A3A]"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#4E5871]">
          <Badge className="bg-[#0A4C8B] text-white hover:bg-[#0A4C8B]">Confirmed</Badge>
          <Badge className="bg-[#C46A3A] text-white hover:bg-[#C46A3A]">Pending</Badge>
          <Badge className="bg-[#2D6A4F] text-white hover:bg-[#2D6A4F]">Checked in</Badge>
          <span>Arrival and departure days are both included.</span>
        </div>
      </section>

      {message && (
        <div
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            message.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {message.tone === 'error' ? <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" /> : <Info className="mt-0.5 h-5 w-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-[#E8DED4] bg-white p-8 text-sm text-[#4E5871] shadow-sm">Loading room calendar…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-[#E8DED4] bg-white p-8 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-[#0A1128]">Add rooms to use the calendar</h3>
          <p className="mt-2 text-sm text-[#4E5871]">Room rows will appear here as soon as they are created in Room Planner.</p>
          <Link to="/staff-dashboard/room-planner"><Button className="mt-4 bg-[#C46A3A] text-white hover:bg-[#A85A30]">Open Room Planner</Button></Link>
        </div>
      ) : (
        <section className="min-w-0 overflow-hidden rounded-2xl border border-[#D8D2CB] bg-white shadow-sm" aria-label="Scrollable room booking calendar">
          <div ref={timelineRef} className="max-w-full overflow-x-auto overscroll-x-contain" tabIndex={0}>
            <div style={{ width: timelineWidth }}>
              <div className="sticky top-0 z-40 flex h-[74px] border-b border-[#D8D2CB] bg-white">
                <div
                  className="sticky left-0 z-50 flex shrink-0 items-center border-r border-[#D8D2CB] bg-[#F8F7F5] px-3 font-semibold text-[#0A1128] shadow-[4px_0_8px_rgba(10,17,40,0.06)]"
                  style={{ width: ROOM_COLUMN_WIDTH }}
                >
                  Room
                </div>
                {days.map((dateKey) => {
                  const date = parseISO(dateKey);
                  const isToday = dateKey === today;
                  return (
                    <div
                      key={dateKey}
                      className={`grid shrink-0 place-items-center border-r border-[#D8D2CB] px-1 text-center ${isToday ? 'bg-[#C46A3A] text-white' : 'bg-white text-[#0A1128]'}`}
                      style={{ width: DAY_COLUMN_WIDTH }}
                    >
                      <div>
                        <span className={`block text-xs font-semibold uppercase ${isToday ? 'text-white/80' : 'text-[#4E5871]'}`}>{format(date, 'EEE')}</span>
                        <span className="block text-sm font-semibold">{format(date, 'd MMM')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {rows.map((row) => {
                const segments = buildRoomSegments(
                  activeBookings,
                  row.roomId,
                  row.roomUnitNumber,
                  firstDate,
                  lastDate,
                );
                const laneCount = segments.reduce((highest, segment) => Math.max(highest, segment.lane + 1), 0);
                const rowHeight = Math.max(66, (laneCount * 42) + 18);
                return (
                  <div key={row.key} className="relative border-b border-[#D8D2CB]" style={{ width: timelineWidth, height: rowHeight }}>
                    <div className="absolute inset-y-0 flex" style={{ left: ROOM_COLUMN_WIDTH }}>
                      {days.map((dateKey) => {
                        const isToday = dateKey === today;
                        const canBook = Boolean(row.room?.is_active);
                        return (
                          <button
                            key={dateKey}
                            type="button"
                            disabled={!canBook}
                            aria-label={canBook ? `Book ${row.name} on ${formatBookingDate(dateKey)}` : `${row.name} is not available for bookings`}
                            title={canBook ? `Book ${row.name} on ${formatBookingDate(dateKey)}` : undefined}
                            onClick={() => row.room && row.roomUnitNumber && startBooking(row.room, row.roomUnitNumber, dateKey)}
                            onDragOver={(event) => {
                              if (canBook) {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = 'move';
                              }
                            }}
                            onDrop={(event) => row.room && row.roomUnitNumber && void handleDrop(event, row.room, row.roomUnitNumber, dateKey)}
                            className={`group grid shrink-0 place-items-center border-r border-[#E8DED4] text-xs transition ${
                              isToday ? 'bg-[#FFF2EA]' : canBook ? 'bg-white hover:bg-[#F1F7F1]' : 'cursor-not-allowed bg-[#F3F1EE]'
                            }`}
                            style={{ width: DAY_COLUMN_WIDTH, height: rowHeight }}
                          >
                            {canBook && <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 font-semibold text-[#2D6A4F] opacity-0 shadow-sm ring-1 ring-[#7DAF7B]/40 transition group-hover:opacity-100 group-focus:opacity-100"><Plus className="h-3 w-3" /> Book</span>}
                          </button>
                        );
                      })}
                    </div>

                    <div
                      className={`sticky left-0 z-30 flex h-full shrink-0 flex-col justify-center border-r border-[#D8D2CB] px-3 shadow-[4px_0_8px_rgba(10,17,40,0.06)] ${row.room?.is_active === false ? 'bg-[#F3F1EE]' : row.roomId ? 'bg-white' : 'bg-amber-50'}`}
                      style={{ width: ROOM_COLUMN_WIDTH }}
                    >
                      <span className="truncate text-sm font-semibold text-[#0A1128]">{row.name}</span>
                      <span className="truncate text-xs text-[#4E5871]">{row.subtitle}</span>
                      {row.room?.is_active === false && <span className="mt-1 text-[11px] font-semibold uppercase text-[#8A4E2B]">Inactive</span>}
                    </div>

                    {segments.map((segment) => {
                      const { booking } = segment;
                      const width = ((segment.endIndex - segment.startIndex + 1) * DAY_COLUMN_WIDTH) - 8;
                      const draggable = bookingRoomUnitKeys(booking).length <= 1 && (booking.booking_room_segments || []).length === 0 && booking.status !== 'completed';
                      const roomId = row.roomId || undefined;
                      const roomUnitNumber = row.roomUnitNumber || undefined;
                      return (
                        <button
                          key={`${booking.id}-${segment.segmentId || 'whole'}-${row.key}`}
                          type="button"
                          draggable={draggable}
                          onDragStart={(event) => {
                            if (!draggable) {
                              event.preventDefault();
                              return;
                            }
                            setDraggedBookingId(booking.id);
                            event.dataTransfer.effectAllowed = 'move';
                            event.dataTransfer.setData('text/catstays-booking', booking.id);
                          }}
                          onDragEnd={() => {
                            dragEndedAt.current = Date.now();
                            setDraggedBookingId(null);
                          }}
                          onClick={() => showBooking(booking, roomId, roomUnitNumber, row.name)}
                          aria-label={`${catNamesForRoom(booking, roomId, roomUnitNumber)}, ${customerName(booking)}, ${formatBookingDate(booking.check_in)} to ${formatBookingDate(booking.check_out)}. Open booking details.`}
                          title={draggable ? 'Drag to move this stay, or click for details' : 'Click for details'}
                          className={`absolute z-20 flex h-9 items-center gap-2 overflow-hidden rounded-lg px-2.5 text-left text-xs font-medium text-white shadow-sm ring-1 ring-white/30 transition focus:z-30 focus:outline-none focus:ring-2 focus:ring-[#C46A3A] focus:ring-offset-2 ${bookingTone(booking)} ${movingBookingId === booking.id ? 'animate-pulse opacity-70' : ''}`}
                          style={{
                            left: ROOM_COLUMN_WIDTH + (segment.startIndex * DAY_COLUMN_WIDTH) + 4,
                            top: 9 + (segment.lane * 42),
                            width,
                          }}
                        >
                          {draggable ? <GripHorizontal className="h-4 w-4 shrink-0 text-white/75" /> : <Info className="h-4 w-4 shrink-0 text-white/75" />}
                          <span className="shrink-0 rounded bg-white px-1.5 py-0.5 font-bold text-[#0A4C8B]">{catNamesForRoom(booking, roomId, roomUnitNumber)}</span>
                          <span className="truncate">{formatCompactRange(booking)} · {customerName(booking)}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{catNamesForRoom(selected.booking, selected.roomId, selected.roomUnitNumber)}</DialogTitle>
                <DialogDescription>{customerName(selected.booking)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-[#0A1128]">
                <div className="rounded-xl bg-[#F8F7F5] p-4">
                  <p className="font-semibold">{formatBookingDate(selected.booking.check_in)} – {formatBookingDate(selected.booking.check_out)}</p>
                  <p className="mt-1 text-[#4E5871]">Check in: {formatBookingTime(selected.booking.check_in_time || '')}</p>
                  <p className="text-[#4E5871]">Check out: {formatBookingTime(selected.booking.check_out_time || '')}</p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                  <dt className="text-[#4E5871]">Room</dt><dd className="font-medium">{selected.roomName || 'Unassigned'}</dd>
                  <dt className="text-[#4E5871]">Booking</dt><dd className="font-medium capitalize">{selected.booking.status.replaceAll('_', ' ')}</dd>
                  <dt className="text-[#4E5871]">Payment</dt><dd className="font-medium capitalize">{selected.booking.payment_status.replaceAll('_', ' ')}</dd>
                  <dt className="text-[#4E5871]">Total</dt><dd className="font-medium">${Number(selected.booking.total_amount || 0).toFixed(2)}</dd>
                </dl>
                {selected.booking.notes && <div className="rounded-xl border border-[#E8DED4] p-3 text-[#4E5871]"><span className="font-semibold text-[#0A1128]">Notes: </span>{selected.booking.notes}</div>}
                {(selected.booking.booking_room_segments || []).length > 0 && <div className="rounded-xl border border-[#C46A3A]/30 bg-[#FFF2EA] p-3"><p className="font-semibold">Split stay</p>{selected.booking.booking_room_segments.map((segment) => <p key={segment.id} className="mt-1 text-xs">{segment.room?.name} {segment.room_unit_number} · {formatBookingDate(segment.starts_on)} – {formatBookingDate(segment.ends_on)}</p>)}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditorMode(editorMode === 'move' ? 'none' : 'move')} disabled={(selected.booking.booking_room_segments || []).length > 0}>Move stay</Button>
                  <Button type="button" variant="outline" onClick={() => setEditorMode(editorMode === 'split' ? 'none' : 'split')} disabled={selected.booking.check_in >= selected.booking.check_out}>Split stay</Button>
                </div>
                {editorMode === 'move' && <div className="space-y-3 rounded-xl bg-[#F8F7F5] p-3">
                  <label className="block text-xs font-semibold uppercase text-[#4E5871]">New arrival date<input type="date" value={moveDraft.checkIn} onChange={(event) => setMoveDraft((current) => ({ ...current, checkIn: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]" /></label>
                  <label className="block text-xs font-semibold uppercase text-[#4E5871]">Room<select value={moveDraft.roomKey} onChange={(event) => setMoveDraft((current) => ({ ...current, roomKey: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]"><option value="">Choose an available room</option>{physicalRooms.map((room) => <option key={room.key} value={room.key} disabled={!room.room.is_active || room.room.capacity < bookingCatCount(selected.booking)}>{room.name}</option>)}</select></label>
                  <Button type="button" onClick={() => void saveMoveFromDialog()} className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]">Move booking</Button>
                </div>}
                {editorMode === 'split' && <div className="space-y-3 rounded-xl bg-[#F8F7F5] p-3">
                  <p className="text-xs leading-5 text-[#4E5871]">Choose the room used first, the day the cats move, and the room used for the rest of the stay.</p>
                  <label className="block text-xs font-semibold uppercase text-[#4E5871]">First room<select value={splitDraft.firstRoomKey} onChange={(event) => setSplitDraft((current) => ({ ...current, firstRoomKey: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]"><option value="">Choose first room</option>{physicalRooms.map((room) => <option key={room.key} value={room.key} disabled={!room.room.is_active || room.room.capacity < bookingCatCount(selected.booking)}>{room.name}</option>)}</select></label>
                  <label className="block text-xs font-semibold uppercase text-[#4E5871]">Move to second room on<input type="date" min={addDateKey(selected.booking.check_in, 1)} max={selected.booking.check_out} value={splitDraft.secondStartsOn} onChange={(event) => setSplitDraft((current) => ({ ...current, secondStartsOn: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]" /></label>
                  <label className="block text-xs font-semibold uppercase text-[#4E5871]">Second room<select value={splitDraft.secondRoomKey} onChange={(event) => setSplitDraft((current) => ({ ...current, secondRoomKey: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]"><option value="">Choose second room</option>{physicalRooms.map((room) => <option key={room.key} value={room.key} disabled={!room.room.is_active || room.room.capacity < bookingCatCount(selected.booking)}>{room.name}</option>)}</select></label>
                  {!splitDraft.thirdRoomKey && !splitDraft.thirdStartsOn ? <Button type="button" variant="outline" disabled={addDateKey(splitDraft.secondStartsOn || selected.booking.check_in, 1) > selected.booking.check_out} onClick={() => setSplitDraft((current) => ({ ...current, thirdStartsOn: addDateKey(current.secondStartsOn || selected.booking.check_in, 1) }))}>Add a third room</Button> : <div className="space-y-3 rounded-lg border border-[#D8D2CB] bg-white p-3"><label className="block text-xs font-semibold uppercase text-[#4E5871]">Move to third room on<input type="date" min={addDateKey(splitDraft.secondStartsOn || selected.booking.check_in, 1)} max={selected.booking.check_out} value={splitDraft.thirdStartsOn} onChange={(event) => setSplitDraft((current) => ({ ...current, thirdStartsOn: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]" /></label><label className="block text-xs font-semibold uppercase text-[#4E5871]">Third room<select value={splitDraft.thirdRoomKey} onChange={(event) => setSplitDraft((current) => ({ ...current, thirdRoomKey: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-[#D8D2CB] bg-white px-3 text-sm font-normal text-[#0A1128]"><option value="">Choose third room</option>{physicalRooms.map((room) => <option key={room.key} value={room.key} disabled={!room.room.is_active || room.room.capacity < bookingCatCount(selected.booking)}>{room.name}</option>)}</select></label><Button type="button" variant="ghost" onClick={() => setSplitDraft((current) => ({ ...current, thirdRoomKey: '', thirdStartsOn: '' }))} className="text-red-700">Remove third room</Button></div>}
                  <Button type="button" onClick={() => void saveSplitFromDialog()} className="w-full bg-[#0A4C8B] text-white hover:bg-[#083E72]">Save split stay</Button>
                </div>}
                {message?.tone === 'error' && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message.text}</div>}
                <p className="text-xs leading-5 text-[#4E5871]">On a phone, use Move stay or Split stay. On a laptop, you can also drag the full stay. Times, payment status, and price are kept.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelected(null)}>Close</Button>
                <Link to={`/staff-dashboard/bookings?booking=${selected.booking.id}`}>
                  <Button className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]">View full booking</Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
