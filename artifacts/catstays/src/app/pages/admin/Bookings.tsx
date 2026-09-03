import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { useBookings } from '@/hooks/useBookings';
import { bookingListScope, matchesBookingListView, type BookingListView } from '@/app/lib/bookingReadScope';
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { sendBookingConfirmation } from '@/utils/email';
import { useBookingOperations } from '@/hooks/useBookingOperations';
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Home, 
  DollarSign,
  X,
  Check,
  Cat,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  History,
  Mail,
  NotebookPen,
  Phone,
  Receipt,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { format, parseISO, startOfToday } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { calculateStaffBookingPrice, inclusiveStayDays } from '../../lib/bookingPricing';
import {
  expandPhysicalRooms,
  physicalRoomName,
  roomUnitHasConflict,
} from '../../lib/roomInventory';
import {
  bookingHoursSummary,
  bookingTimeSlotsForDate,
  customerMatchesSearch,
  formatBookingTime,
} from '../../lib/bookingSchedule';
import { Calendar as DateRangeCalendar } from '../../components/ui/calendar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { normalizeBookingSetup } from '../../lib/bookingSetup';
import {
  PAYMENT_METHOD_LABELS,
  cancellationSettlement,
  type AdjustmentCalculation,
  type AdjustmentKind,
  type CancellationCreditChoice,
  type PaymentMethod,
  type PaymentPurpose,
} from '../../lib/bookingOperations';
import { bookingReviewCatStays } from '../../lib/bookingReview';

export function AdminBookings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreating = searchParams.get('new') === 'true';
  const requestedBookingId = searchParams.get('booking');
  const openedBookingRequest = useRef<string | null>(null);
  const requestedCustomerId = searchParams.get('customer');
  const requestedCheckIn = searchParams.get('checkIn') || '';
  const requestedCheckOut = searchParams.get('checkOut') || requestedCheckIn;
  const requestedRoomId = searchParams.get('room');
  const requestedRoomUnit = Number(searchParams.get('roomUnit')) || 0;
  const [showCreateBooking, setShowCreateBooking] = useState(isCreating);
  
  // Filter and sort state
  const [viewMode, setViewMode] = useState<BookingListView>('current');
  const [sortField, setSortField] = useState<'arrival' | 'departure' | 'received'>('arrival');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingPage, setBookingPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);

  // Form state
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState(requestedCheckIn);
  const [checkOut, setCheckOut] = useState(requestedCheckOut);
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [draftDateRange, setDraftDateRange] = useState<DateRange>();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomArrangement, setRoomArrangement] = useState<'shared' | 'separate'>('shared');
  const [roomAssignments, setRoomAssignments] = useState<Record<string, any>>({});
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', catName: '' });
  const [newCustomerError, setNewCustomerError] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingActionError, setBookingActionError] = useState('');
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [paymentActionMessage, setPaymentActionMessage] = useState('');
  const [sendingConfirmation, setSendingConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [confirmationPayment, setConfirmationPayment] = useState<'deposit' | 'full' | 'none'>('deposit');
  const [noteDraft, setNoteDraft] = useState('');
  const [noteVisible, setNoteVisible] = useState(false);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [adjustmentDraft, setAdjustmentDraft] = useState<{ kind: AdjustmentKind; label: string; calculation: AdjustmentCalculation; value: string }>({ kind: 'discount', label: '', calculation: 'fixed', value: '' });
  const [paymentDraft, setPaymentDraft] = useState<{ purpose: PaymentPurpose; method: PaymentMethod; paidOn: string; amount: string; reference: string }>({ purpose: 'deposit', method: 'bank_transfer', paidOn: format(new Date(), 'yyyy-MM-dd'), amount: '', reference: '' });
  const [operationMessage, setOperationMessage] = useState('');
  const [showCancelBooking, setShowCancelBooking] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationNote, setCancellationNote] = useState('');
  const [cancellationCreditChoice, setCancellationCreditChoice] = useState<CancellationCreditChoice>('after_deposit');
  const [customCancellationCredit, setCustomCancellationCredit] = useState('');
  const [showDeleteBooking, setShowDeleteBooking] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [closingBooking, setClosingBooking] = useState(false);

  const { cattery } = useAuth();
  const {
    bookings: rawBookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    deleteErroneousBooking,
  } = useBookings({
    // Apply operational date ranges before loading nested details. Creation and search retain history.
    ...(!showCreateBooking && !isCreating
      ? bookingListScope(viewMode, format(startOfToday(), 'yyyy-MM-dd'), bookingSearch) : {}),
  });
  // Opening one alert must not wait for thousands of historical stays.
  // Keep the main list scoped unless creation or history actually needs all stays.
  const { bookings: requestedBookings, loading: requestedBookingLoading } = useBookings({
    bookingId: requestedBookingId || undefined,
    enabled: Boolean(requestedBookingId),
  });
  const { customers: rawCustomers, createCustomer, addCat } = useCustomers();
  const { rooms: rawRooms } = useRooms();
  const [customerSearch, setCustomerSearch] = useState('');

  const bookingSettings = cattery?.website_settings ?? {};
  const bookingSetup = normalizeBookingSetup(bookingSettings);
  const bookingOperations = useBookingOperations(
    selectedBooking?.id || null,
    selectedBooking?.customerId || null,
    Number(selectedBooking?.total || 0),
    { chargeTax: bookingSetup.chargeTax, taxRate: bookingSetup.taxRate },
  );

  useEffect(() => {
    setShowCreateBooking(isCreating);
  }, [isCreating]);

  // Map real customers to UI shape
  const customers = rawCustomers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    cats: (c as any).cats?.map((cat: any) => ({ id: cat.id, name: cat.name })) || [],
  }));

  const hasCustomerSearch = customerSearch.trim().length > 0;
  const filteredCustomers = hasCustomerSearch
    ? customers.filter((customer) => customerMatchesSearch(customer, customerSearch))
    : [];
  const customerSuggestions = filteredCustomers.flatMap((customer) => {
    const query = customerSearch.trim().toLowerCase();
    const matchingCats = customer.cats.filter((cat: any) => cat.name.toLowerCase().includes(query));
    return matchingCats.length > 0
      ? matchingCats.map((cat: any) => ({ customer, cat }))
      : [{ customer, cat: null }];
  });

  const checkInTimeSlots = bookingTimeSlotsForDate(bookingSettings, checkIn);
  const checkOutTimeSlots = bookingTimeSlotsForDate(bookingSettings, checkOut);
  const hoursSummary = bookingHoursSummary(bookingSettings);

  // Real rooms from Supabase
  const roomTypes = rawRooms
    .filter(r => r.is_active)
    .map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      pricePerDay: r.price_per_night,
      capacity: r.capacity,
      room_count: r.room_count,
      is_active: r.is_active,
      description: r.description || r.amenities.slice(0, 2).join(' · '),
      color: 'sage',
    }));
  const roomOptions = expandPhysicalRooms(roomTypes).map((physicalRoom) => ({
    ...physicalRoom.room,
    key: physicalRoom.key,
    unitNumber: physicalRoom.unitNumber,
    physicalName: physicalRoom.name,
  }));

  // Map real Supabase bookings to UI shape
  const bookings = [...rawBookings, ...requestedBookings.filter(requested => !rawBookings.some(b => b.id === requested.id))].map(b => {
    const days = inclusiveStayDays(b.check_in, b.check_out);
    const linkedCatNames = (b.booking_cats ?? []).map(bc => bc.cat.name);
    const guestCatNames = b.cat_names
      ? b.cat_names.split(',').map(name => name.trim()).filter(Boolean)
      : [];

    return {
      id: b.id,
      customerName: b.customer?.name || b.legacy_customer_name || b.guest_name || 'Online customer',
      sourceReference: b.legacy_reference || b.external_id || '',
      customerEmail: b.customer?.email || b.guest_email || '',
      customerPhone: b.customer?.phone || b.guest_phone || '',
      catNames: linkedCatNames.length > 0 ? linkedCatNames : guestCatNames,
      checkIn: b.check_in,
      checkOut: b.check_out,
      checkInTime: b.check_in_time,
      checkOutTime: b.check_out_time,
      roomType: b.room?.type || (b.legacy_run_name ? 'Historical run' : 'Room'),
      roomNumber: b.room && b.room_unit_number
        ? physicalRoomName(b.room, b.room_unit_number)
        : b.room?.name || b.legacy_run_name || '',
      status: b.status,
      paymentStatus: b.payment_status,
      total: b.total_amount || 0,
      days,
      receivedDate: b.created_at,
      specialRequirements: b.notes || '',
      customerNoteVisible: Boolean((b as any).customer_note_visible),
      cancellationReason: b.cancellation_reason,
      cancellationNote: b.cancellation_note,
      cancelledAt: b.cancelled_at,
      cancellationCreditAmount: Number(b.cancellation_credit_amount || 0),
      customerId: b.customer?.id || null,
      roomArrangement: b.room_arrangement || undefined,
      roomAssignments: (b.booking_cat_rooms ?? []).map((assignment) => ({
        catId: assignment.cat.id,
        catName: assignment.cat.name,
        roomId: assignment.room.id,
        roomUnitNumber: assignment.room_unit_number,
        roomName: assignment.room_unit_number
          ? physicalRoomName(assignment.room, assignment.room_unit_number)
          : assignment.room.name,
        roomType: assignment.room.type,
      })),
    };
  });

  const availableRoomOptions = roomOptions.filter((room) => (
    !checkIn
    || !checkOut
    || !roomUnitHasConflict(rawBookings, room.id, room.unitNumber, checkIn, checkOut)
  ));
  const roomSelectionComplete = roomArrangement === 'shared'
    ? Boolean(selectedRoom)
    : cats.length > 0 && cats.every((cat) => Boolean(roomAssignments[cat.id]));

  useEffect(() => {
    if (step !== 4 || !requestedRoomId || selectedRoom || roomArrangement !== 'shared') return;
    const requestedRoom = availableRoomOptions.find((room) => (
      room.id === requestedRoomId
      && room.unitNumber === requestedRoomUnit
      && room.capacity >= cats.length
    ));
    if (requestedRoom) setSelectedRoom(requestedRoom);
  }, [availableRoomOptions, cats.length, requestedRoomId, requestedRoomUnit, roomArrangement, selectedRoom, step]);

  // Filter bookings based on view mode
  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = bookings.filter(booking => matchesBookingListView(booking, viewMode, format(now, 'yyyy-MM-dd'), bookingSearch));
    const search = bookingSearch.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter(booking => [
        booking.customerName, booking.customerEmail, booking.customerPhone,
        booking.sourceReference, ...booking.catNames,
      ].some(value => value.toLowerCase().includes(search)));
    }
    return filtered;
  };

  // Sort bookings
  const getSortedBookings = () => {
    const filtered = getFilteredBookings();
    
    return [...filtered].sort((a, b) => {
      let aValue: Date;
      let bValue: Date;
      
      if (sortField === 'arrival') {
        aValue = new Date(a.checkIn);
        bValue = new Date(b.checkIn);
      } else if (sortField === 'departure') {
        aValue = new Date(a.checkOut);
        bValue = new Date(b.checkOut);
      } else { // received
        aValue = new Date(a.receivedDate);
        bValue = new Date(b.receivedDate);
      }
      
      if (sortDirection === 'asc') {
        return aValue.getTime() - bValue.getTime();
      } else {
        return bValue.getTime() - aValue.getTime();
      }
    });
  };

  const matchingBookings = getSortedBookings();
  const pageCount = Math.max(1, Math.ceil(matchingBookings.length / 50));
  const currentPage = Math.min(bookingPage, pageCount);
  const displayedBookings = matchingBookings.slice((currentPage - 1) * 50, currentPage * 50);
  useEffect(() => { setBookingPage(1); }, [viewMode, bookingSearch, sortField, sortDirection]);

  const handleSort = (field: 'arrival' | 'departure' | 'received') => {
    setSortField(field);
    setSortDirection(field === 'received' ? 'desc' : 'asc');
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setBookingActionError('');
    setPaymentActionMessage('');
    setOperationMessage('');
    setNoteDraft(booking.specialRequirements || '');
    setNoteVisible(Boolean(booking.customerNoteVisible));
    setShowNoteEditor(false);
    setShowHistory(false);
    setCustomerDetailsOpen(false);
    setConfirmationMessage(bookingSetup.confirmationMessage);
    setConfirmationPayment(bookingSetup.defaultConfirmationPayment);
    setCancellationReason('');
    setCancellationNote('');
    setCancellationCreditChoice('after_deposit');
    setCustomCancellationCredit('');
    setDeletionReason('');
    setPaymentDraft((current) => ({
      ...current,
      method: bookingSetup.enabledPaymentMethods[0] || 'bank_transfer',
      paidOn: format(new Date(), 'yyyy-MM-dd'),
      amount: '',
      reference: '',
    }));
    setShowBookingDetails(true);
  };

  const selectCustomerSuggestion = (customer: any, cat?: any | null) => {
    setSelectedCustomer(customer);
    setCats(cat ? [cat] : customer.cats?.length ? [customer.cats[0]] : []);
    setSelectedRoom(null);
    setRoomAssignments({});
    setStep(2);
    setDraftDateRange(undefined);
    setShowDateRangePicker(true);
  };

  useEffect(() => {
    if (!isCreating || !requestedCustomerId || selectedCustomer) return;
    const requestedCustomer = customers.find((customer) => customer.id === requestedCustomerId);
    if (requestedCustomer) selectCustomerSuggestion(requestedCustomer);
  }, [customers, isCreating, requestedCustomerId, selectedCustomer]);

  useEffect(() => {
    if (!requestedBookingId) {
      openedBookingRequest.current = null;
      return;
    }
    if (requestedBookingLoading || openedBookingRequest.current === requestedBookingId) return;
    if (selectedBooking?.id === requestedBookingId && showBookingDetails) return;
    const requestedBooking = bookings.find((booking) => booking.id === requestedBookingId);
    if (requestedBooking) {
      // Consume each deep link once; closing must not replay it before navigation settles.
      openedBookingRequest.current = requestedBookingId;
      handleViewBooking(requestedBooking);
    }
  }, [bookings, requestedBookingLoading, requestedBookingId, selectedBooking?.id, showBookingDetails]);

  const handleBookingDetailsOpenChange = (open: boolean) => {
    setShowBookingDetails(open);
    if (!open && requestedBookingId) navigate('/staff-dashboard/bookings', { replace: true });
  };

  const calculatePrice = () => {
    const days = checkIn && checkOut ? inclusiveStayDays(checkIn, checkOut) : 0;
    const dailyRates = roomArrangement === 'separate'
      ? cats.map((cat) => roomAssignments[cat.id]?.pricePerDay ?? 0)
      : selectedRoom ? cats.map(() => selectedRoom.pricePerDay) : [];
    return calculateStaffBookingPrice({
      days,
      dailyRates,
      arrangement: roomArrangement,
      occupancyRates: bookingSetup.pricingRates,
      chargeTax: bookingSetup.chargeTax,
      taxRate: bookingSetup.taxRate,
    });
  };

  const calculateTotal = () => calculatePrice().total;

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    return inclusiveStayDays(checkIn, checkOut);
  };

  const openDateRangePicker = () => {
    setDraftDateRange(checkIn
      ? { from: parseISO(checkIn), to: checkOut ? parseISO(checkOut) : undefined }
      : undefined);
    setShowDateRangePicker(true);
  };

  const saveDateRange = () => {
    if (!draftDateRange?.from || !draftDateRange.to) return;

    const nextCheckIn = format(draftDateRange.from, 'yyyy-MM-dd');
    const nextCheckOut = format(draftDateRange.to, 'yyyy-MM-dd');
    setCheckIn(nextCheckIn);
    setCheckOut(nextCheckOut);
    setSelectedRoom(null);
    setRoomAssignments({});
    const nextCheckInSlots = bookingTimeSlotsForDate(bookingSettings, nextCheckIn);
    const nextCheckOutSlots = bookingTimeSlotsForDate(bookingSettings, nextCheckOut);
    setCheckInTime(nextCheckInSlots.includes(bookingSetup.defaultCheckInTime)
      ? bookingSetup.defaultCheckInTime
      : nextCheckInSlots[0] || '');
    setCheckOutTime(nextCheckOutSlots.includes(bookingSetup.defaultCheckOutTime)
      ? bookingSetup.defaultCheckOutTime
      : nextCheckOutSlots[nextCheckOutSlots.length - 1] || '');
    setShowDateRangePicker(false);
    setStep(cats.length > 0 ? 4 : 3);
  };

  const handleAddCustomer = async () => {
    const name = newCustomer.name.trim();
    const email = newCustomer.email.trim();
    const phone = newCustomer.phone.trim();
    const catName = newCustomer.catName.trim();

    if (!name || !email || !catName) {
      setNewCustomerError('Enter the customer name, email address, and cat name.');
      return;
    }

    setSavingCustomer(true);
    setNewCustomerError('');
    const { data: customer, error } = await createCustomer({ name, email, phone: phone || undefined });
    if (error || !customer) {
      setNewCustomerError(typeof error === 'string' ? error : error?.message || 'Customer could not be added.');
      setSavingCustomer(false);
      return;
    }

    const customerCats: { id: string; name: string }[] = [];
    if (catName) {
      const { data: cat, error: catError } = await addCat(customer.id, { name: catName });
      if (catError || !cat) {
        setNewCustomerError(typeof catError === 'string' ? catError : catError?.message || 'The customer was added, but the cat could not be added.');
        setSavingCustomer(false);
        return;
      }
      customerCats.push({ id: cat.id, name: cat.name });
    }

    const createdCustomer = { ...customer, phone: customer.phone || '', cats: customerCats };
    setSelectedCustomer(createdCustomer);
    setCats(customerCats);
    setNewCustomer({ name: '', email: '', phone: '', catName: '' });
    setShowAddCustomer(false);
    setSavingCustomer(false);
    setStep(2);
    setShowDateRangePicker(true);
  };

  const handleCreateBooking = async () => {
    const assignedRooms = roomArrangement === 'shared'
      ? cats.map((cat) => ({
          cat_id: cat.id,
          room_id: selectedRoom?.id,
          room_unit_number: selectedRoom?.unitNumber,
        }))
      : cats.map((cat) => ({
          cat_id: cat.id,
          room_id: roomAssignments[cat.id]?.id,
          room_unit_number: roomAssignments[cat.id]?.unitNumber,
        }));
    const primaryRoom = roomArrangement === 'shared' ? selectedRoom : roomAssignments[cats[0]?.id];

    if (
      !selectedCustomer || !checkIn || !checkOut || !checkInTime || !checkOutTime
      || cats.length === 0 || !primaryRoom
      || assignedRooms.some((assignment) => !assignment.room_id || !assignment.room_unit_number)
    ) return;

    setCreatingBooking(true);
    setBookingError('');

    const { data, error } = await createBooking({
      customer_id: selectedCustomer.id,
      room_id: String(primaryRoom.id),
      room_unit_number: Number(primaryRoom.unitNumber),
      check_in: checkIn,
      check_out: checkOut,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      total_amount: calculateTotal(),
      payment_status: paymentStatus,
      status: 'confirmed',
      room_arrangement: roomArrangement,
      notes: specialRequirements || undefined,
      cat_ids: cats.map((cat) => cat.id).filter(Boolean),
      room_assignments: assignedRooms.map((assignment) => ({
        cat_id: assignment.cat_id,
        room_id: String(assignment.room_id),
        room_unit_number: Number(assignment.room_unit_number),
      })),
    });

    if (error) {
      setBookingError(typeof error === 'string' ? error : error.message || 'Booking could not be created.');
      setCreatingBooking(false);
      return;
    }

    setShowCreateBooking(false);
    navigate(`/staff-dashboard/bookings?booking=${data?.id}`);
    setStep(1);
    setSelectedCustomer(null);
    setCats([]);
    setCheckIn('');
    setCheckOut('');
    setCheckInTime('');
    setCheckOutTime('');
    setSelectedRoom(null);
    setRoomArrangement('shared');
    setRoomAssignments({});
    setSpecialRequirements('');
    setPaymentStatus('unpaid');
    setCreatingBooking(false);
  };

  const handleConfirmSelectedBooking = async () => {
    if (!selectedBooking) return;

    setConfirmingBooking(true);
    setBookingActionError('');
    setPaymentActionMessage('');
    const wasAlreadyConfirmed = selectedBooking.status === 'confirmed';
    if (!wasAlreadyConfirmed) {
      const { error } = await updateBookingStatus(selectedBooking.id, 'confirmed');
      if (error) {
        setBookingActionError(typeof error === 'string' ? error : error.message || 'Booking could not be confirmed.');
        setConfirmingBooking(false);
        return;
      }

      setSelectedBooking((current: any) => ({ ...current, status: 'confirmed' }));
    }
    setConfirmingBooking(false);
  };

  const handleSendConfirmation = async () => {
    if (!selectedBooking || !cattery?.id || !cattery.name || !selectedBooking.customerEmail) {
      setBookingActionError('Add a customer email address before sending the confirmation.');
      return;
    }
    setSendingConfirmation(true);
    setBookingActionError('');
    setPaymentActionMessage('');
    const roomName = selectedBooking.roomAssignments.length > 0
      ? selectedBooking.roomAssignments.map((assignment: any) => `${assignment.catName}: ${assignment.roomName}`).join(', ')
      : selectedBooking.roomNumber;
    const fixedDeposit = bookingSetup.depositType === 'fixed'
      ? bookingSetup.depositAmount
      : Number(selectedBooking.total) * (bookingSetup.depositAmount / 100);
    const result = await sendBookingConfirmation({
      catteryId: cattery.id,
      customerId: selectedBooking.customerId,
      customerName: selectedBooking.customerName,
      customerEmail: selectedBooking.customerEmail,
      catteryName: cattery.name,
      catName: selectedBooking.catNames.join(', '),
      roomName,
      checkIn: `${format(parseISO(selectedBooking.checkIn), 'd MMM yyyy')} at ${formatBookingTime(selectedBooking.checkInTime || '')}`,
      checkOut: `${format(parseISO(selectedBooking.checkOut), 'd MMM yyyy')} at ${formatBookingTime(selectedBooking.checkOutTime || '')}`,
      totalAmount: `$${bookingOperations.financials.total.toFixed(2)}`,
      deposit: confirmationPayment === 'deposit' ? `$${fixedDeposit.toFixed(2)}` : undefined,
      paymentRequest: confirmationPayment,
      customMessage: confirmationMessage,
      customerNote: noteVisible ? noteDraft : undefined,
      terms: bookingSetup.cancellationPolicy,
      bookingRef: selectedBooking.id.slice(0, 8).toUpperCase(),
      catteryEmail: cattery.email ?? undefined,
    });
    if (!result.success) {
      setBookingActionError(result.error || 'The confirmation could not be sent.');
      setSendingConfirmation(false);
      return;
    }
    await bookingOperations.recordEvent('confirmation_emailed', `Booking confirmation emailed to ${selectedBooking.customerEmail}`, {
      payment_request: confirmationPayment,
      provider_message_id: result.id || null,
    });
    await bookingOperations.refetch();
    setPaymentActionMessage('Booking confirmation sent to the customer.');
    setSendingConfirmation(false);
  };

  const handleSaveNote = async () => {
    const result = await bookingOperations.saveNote(noteDraft, noteVisible);
    if (result.error) {
      setBookingActionError(typeof result.error === 'string' ? result.error : (result.error as any)?.message || 'The note could not be saved.');
      return;
    }
    setSelectedBooking((current: any) => ({ ...current, specialRequirements: noteDraft, customerNoteVisible: noteVisible }));
    setShowNoteEditor(false);
    setOperationMessage('Booking note saved.');
  };

  const handleAddAdjustment = async () => {
    const value = Number(adjustmentDraft.value);
    const label = adjustmentDraft.label.trim();
    if (!label || !Number.isFinite(value) || value <= 0) {
      setBookingActionError('Add a description and an amount greater than zero.');
      return;
    }
    const result = await bookingOperations.addAdjustment({ ...adjustmentDraft, label, value });
    if (result.error) {
      setBookingActionError((result.error as any)?.message || String(result.error));
      return;
    }
    setAdjustmentDraft({ kind: 'discount', label: '', calculation: 'fixed', value: '' });
    setOperationMessage('Booking total updated.');
  };

  const handleRemoveAdjustment = async (id: string) => {
    const result = await bookingOperations.removeAdjustment(id);
    if (result.error) {
      setBookingActionError((result.error as any)?.message || String(result.error));
      return;
    }
    setOperationMessage('Charge or discount removed.');
  };

  const handleAddPayment = async (markTotal = false) => {
    if (markTotal && paymentDraft.purpose !== 'booking') {
      setBookingActionError('Choose Payment before marking the remaining total as paid.');
      return;
    }
    const amount = markTotal ? Math.max(0, bookingOperations.financials.owing) : Number(paymentDraft.amount);
    const result = await bookingOperations.addPayment({ ...paymentDraft, amount });
    if (result.error) {
      setBookingActionError((result.error as any)?.message || String(result.error));
      return;
    }
    setPaymentDraft((current) => ({ ...current, amount: '', reference: '' }));
    setSelectedBooking((current: any) => ({ ...current, paymentStatus: amount >= bookingOperations.financials.owing ? 'paid' : paymentDraft.purpose === 'deposit' ? 'deposit_paid' : 'partially_paid' }));
    setOperationMessage(markTotal ? 'Remaining balance marked as paid.' : 'Payment added to this booking.');
  };

  const configuredDeposit = selectedBooking
    ? bookingSetup.depositType === 'fixed'
      ? bookingSetup.depositAmount
      : bookingOperations.financials.total * (bookingSetup.depositAmount / 100)
    : 0;
  const cancellationSummary = cancellationSettlement({
    paidAmount: bookingOperations.financials.paid,
    nonRefundableDeposit: configuredDeposit,
    choice: cancellationCreditChoice,
    customCreditAmount: Number(customCancellationCredit),
  });
  const selectedBookingCatStays = selectedBooking
    ? bookingReviewCatStays(selectedBooking)
    : [];

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason) {
      setBookingActionError('Choose a cancellation reason.');
      return;
    }
    if (!cancellationSummary.isCustomAmountValid) {
      setBookingActionError(`Customer credit cannot exceed $${cancellationSummary.paid.toFixed(2)}.`);
      return;
    }
    setClosingBooking(true);
    setBookingActionError('');
    const result = await cancelBooking({
      id: selectedBooking.id,
      reason: cancellationReason,
      note: cancellationNote,
      customerCreditAmount: cancellationSummary.credit,
    });
    if (result.error) {
      setBookingActionError((result.error as any)?.message || String(result.error));
      setClosingBooking(false);
      return;
    }
    setSelectedBooking((current: any) => ({
      ...current,
      status: 'cancelled',
      cancellationReason,
      cancellationNote,
      cancelledAt: new Date().toISOString(),
      cancellationCreditAmount: cancellationSummary.credit,
    }));
    await bookingOperations.refetch();
    setShowCancelBooking(false);
    setClosingBooking(false);
    setOperationMessage(
      cancellationSummary.credit > 0
        ? `Booking cancelled and $${cancellationSummary.credit.toFixed(2)} saved as customer credit.`
        : 'Booking cancelled and retained in booking history.',
    );
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking || deletionReason.trim().length < 5) {
      setBookingActionError('Briefly explain why this booking was created by mistake.');
      return;
    }
    setClosingBooking(true);
    setBookingActionError('');
    const result = await deleteErroneousBooking(selectedBooking.id, deletionReason);
    if (result.error) {
      setBookingActionError((result.error as any)?.message || String(result.error));
      setClosingBooking(false);
      return;
    }
    setShowDeleteBooking(false);
    setShowBookingDetails(false);
    setSelectedBooking(null);
    setClosingBooking(false);
    navigate('/staff-dashboard/bookings', { replace: true });
  };

  if (showCreateBooking) {
    return (
      <div className="min-h-screen lg:flex" style={{ backgroundColor: '#F6F4EF' }}>
        <RightMenu mode="sidebar" />
        <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="lg:hidden"><RightMenu /></div>
                <Button
                  onClick={() => {
                    setShowCreateBooking(false);
                    navigate('/staff-dashboard/bookings');
                  }}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="w-5 h-5" style={{ color: '#6b7a6d' }} />
                </Button>
                <div>
                  <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                    New Booking
                  </h1>
                  <p className="text-sm" style={{ color: '#6b7a6d' }}>Step {step} of 5</p>
                </div>
              </div>
              <NotificationBell />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-sage/10">
            <div 
              className="h-full bg-sage transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
          {/* Step 1: Select Customer */}
          {step === 1 && (
            <div className="space-y-4">
              <Card className="-mx-1 rounded-2xl border-sage/10 sm:mx-0 sm:rounded-3xl">
                <CardHeader className="px-4 pb-3 sm:px-6">
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Select Customer
                  </CardTitle>
                  <CardDescription>Choose an existing customer or create a new one</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sage/50" />
                    <Input 
                      placeholder="Type a customer or cat name…"
                      className="pl-10 rounded-xl border-sage/20"
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>

                  {hasCustomerSearch && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {customerSuggestions.map(({ customer, cat }) => (
                      <button
                        key={`${customer.id}:${cat?.id || 'customer'}`}
                        onClick={() => selectCustomerSuggestion(customer, cat)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedCustomer?.id === customer.id
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 hover:border-sage/30 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold" style={{ color: '#2d3e2f' }}>
                              {cat ? `🐱 ${cat.name}` : customer.name}
                            </div>
                            <div className="text-sm" style={{ color: '#6b7a6d' }}>
                              {cat ? `${customer.name} · ` : ''}{customer.email}{customer.phone ? ` · ${customer.phone}` : ''}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {customer.cats.map((cat) => (
                                <Badge key={cat.id} variant="outline" className="text-xs">
                                  🐱 {cat.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-sage" />
                        </div>
                      </button>
                    ))}
                    {customerSuggestions.length === 0 && (
                      <div className="rounded-xl border border-dashed border-sage/20 bg-white p-4 text-center">
                        <p className="text-sm font-medium" style={{ color: '#2d3e2f' }}>
                          No matching customers
                        </p>
                        <p className="mt-1 text-xs" style={{ color: '#6b7a6d' }}>
                          Search by customer name, cat name, email, or mobile number — or add a new customer below.
                        </p>
                      </div>
                    )}
                  </div>
                  )}

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewCustomerError('');
                      setShowAddCustomer(true);
                    }}
                    className="w-full rounded-xl border-sage/20 text-sage hover:bg-sage/5"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Customer
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Check-in/Check-out Dates */}
          {step === 2 && (
            <div className="space-y-4">
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Booking Dates
                  </CardTitle>
                  <CardDescription>When will {selectedCustomer?.name}'s cats be staying?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>Stay dates</p>
                      <p className="text-xs" style={{ color: '#6b7a6d' }}>
                        Select the first and last day in one calendar.
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={openDateRangePicker}
                      className="h-11 w-full rounded-xl border border-[#C46A3A] bg-[#FFF4ED] font-semibold text-[#A8562E] shadow-sm hover:bg-[#FCE8DB]"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {checkIn && checkOut ? 'Edit booking dates' : 'Select booking dates'}
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="min-w-0 rounded-xl border border-sage/15 bg-[#F6F4EF] px-3 py-3">
                        <span className="block text-xs" style={{ color: '#6b7a6d' }}>Check-in day</span>
                        <span className="mt-1 block whitespace-nowrap text-xs font-semibold sm:text-sm" style={{ color: '#2d3e2f' }}>
                          {checkIn ? format(parseISO(checkIn), 'EEE, d MMM yyyy') : 'Not selected'}
                        </span>
                      </div>
                      <div className="min-w-0 rounded-xl border border-sage/15 bg-[#F6F4EF] px-3 py-3">
                        <span className="block text-xs" style={{ color: '#6b7a6d' }}>Check-out day</span>
                        <span className="mt-1 block whitespace-nowrap text-xs font-semibold sm:text-sm" style={{ color: '#2d3e2f' }}>
                          {checkOut ? format(parseISO(checkOut), 'EEE, d MMM yyyy') : 'Not selected'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-sm font-medium" style={{ color: '#2d3e2f' }}>
                      Check-in time
                      <select
                        aria-label="Check-in time"
                        value={checkInTime}
                        onChange={(event) => setCheckInTime(event.target.value)}
                        disabled={!checkIn || checkInTimeSlots.length === 0}
                        className="mt-2 h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Select a time</option>
                        {checkInTimeSlots.map((time) => (
                          <option key={time} value={time}>{formatBookingTime(time)}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-medium" style={{ color: '#2d3e2f' }}>
                      Check-out time
                      <select
                        aria-label="Check-out time"
                        value={checkOutTime}
                        onChange={(event) => setCheckOutTime(event.target.value)}
                        disabled={!checkOut || checkOutTimeSlots.length === 0}
                        className="mt-2 h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Select a time</option>
                        {checkOutTimeSlots.map((time) => (
                          <option key={time} value={time}>{formatBookingTime(time)}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="rounded-xl border border-sage/15 bg-[#F6F4EF] p-3 text-xs leading-5" style={{ color: '#536456' }}>
                    <p className="font-semibold" style={{ color: '#2d3e2f' }}>{hoursSummary.heading}</p>
                    {hoursSummary.lines.map((line) => <p key={line}>{line}</p>)}
                    <p className="mt-1">Choose an available check-in and check-out time after selecting the dates.</p>
                  </div>

                  {checkIn && checkInTimeSlots.length === 0 && (
                    <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      No check-in times are configured for this day. Choose another date or update Booking Setup.
                    </p>
                  )}

                  {checkOut && checkOutTimeSlots.length === 0 && (
                    <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      No check-out times are configured for this day. Choose another date or update Booking Setup.
                    </p>
                  )}

                  {checkIn && checkOut && (
                    <div className="p-4 rounded-xl bg-sage/5 border border-sage/20">
                      <div className="flex items-center gap-2 text-sage">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">
                          {calculateDays()} days
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm" style={{ color: '#6b7a6d' }}>
                        <li>• Check-in: {format(parseISO(checkIn), 'EEE, d MMM yyyy')}{checkInTime ? ` at ${formatBookingTime(checkInTime)}` : ''}</li>
                        <li>• Check-out: {format(parseISO(checkOut), 'EEE, d MMM yyyy')}{checkOutTime ? ` at ${formatBookingTime(checkOutTime)}` : ''}</li>
                      </ul>
                      <p className="text-xs mt-1" style={{ color: '#6b7a6d' }}>
                        Includes the day of arrival and the day of departure.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-xl border-sage/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(cats.length > 0 ? 4 : 3)}
                      disabled={calculateDays() === 0 || !checkInTime || !checkOutTime}
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: '#7DAF7B' }}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Select Cats */}
          {step === 3 && (
            <div className="space-y-4">
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Select Cats
                  </CardTitle>
                  <CardDescription>
                    Choose which of {selectedCustomer?.name}'s cats are staying.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCustomer?.cats?.length ? selectedCustomer.cats.map((cat: any) => {
                    const selected = cats.some((candidate) => candidate.id === cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          const nextCats = selected
                            ? cats.filter((candidate) => candidate.id !== cat.id)
                            : [...cats, cat];
                          setCats(nextCats);
                          setSelectedRoom(null);
                          setRoomAssignments({});
                          if (nextCats.length <= 1) setRoomArrangement('shared');
                        }}
                        className={`flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all ${
                          selected ? 'border-sage bg-sage/5' : 'border-sage/10 bg-white hover:border-sage/30'
                        }`}
                      >
                        <span className="flex items-center gap-3 font-semibold" style={{ color: '#2d3e2f' }}>
                          <Cat className="h-5 w-5 text-sage" />
                          {cat.name}
                        </span>
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-sage bg-sage' : 'border-sage/30 bg-white'}`}>
                          {selected && <Check className="h-4 w-4 text-white" />}
                        </span>
                      </button>
                    );
                  }) : (
                    <div className="rounded-xl border border-dashed border-sage/20 bg-white p-5 text-center">
                      <Cat className="mx-auto mb-2 h-10 w-10 text-sage/30" />
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>No cats saved for this customer</p>
                      <p className="mt-1 text-sm" style={{ color: '#6b7a6d' }}>
                        Add the cat in Customers, then return to create this booking.
                      </p>
                    </div>
                  )}

                  {cats.length > 0 && (
                    <p className="rounded-xl bg-sage/5 p-3 text-sm font-medium text-sage">
                      {cats.length} cat{cats.length === 1 ? '' : 's'} selected
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-xl border-sage/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={cats.length === 0}
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: '#7DAF7B' }}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Select Accommodation */}
          {step === 4 && (
            <div className="space-y-4">
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Choose Accommodation
                  </CardTitle>
                  <CardDescription>
                    {cats.length} cat{cats.length !== 1 ? 's' : ''} • {calculateDays()} days
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-sage/15 bg-[#F6F4EF] p-3">
                    <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>Cats in this booking</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCustomer?.cats?.map((cat: any) => {
                        const selected = cats.some((candidate) => candidate.id === cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => {
                              const nextCats = selected
                                ? cats.filter((candidate) => candidate.id !== cat.id)
                                : [...cats, cat];
                              if (nextCats.length === 0) return;
                              setCats(nextCats);
                              setSelectedRoom(null);
                              setRoomAssignments({});
                            }}
                            className={`rounded-full border px-3 py-2 text-sm font-semibold ${selected ? 'border-sage bg-sage text-white' : 'border-sage/20 bg-white text-sage'}`}
                          >
                            🐱 {cat.name}
                          </button>
                        );
                      })}
                    </div>
                    {selectedCustomer?.cats?.some((cat: any) => !cats.some((selectedCat) => selectedCat.id === cat.id)) && (
                      <p className="mt-2 text-xs" style={{ color: '#6b7a6d' }}>Tap the next cat to add them with the same dates and times.</p>
                    )}
                  </div>

                  {cats.length > 1 && (
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F6F4EF] p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRoomArrangement('shared');
                          setRoomAssignments({});
                        }}
                        className={`rounded-xl px-3 py-3 text-sm font-semibold ${roomArrangement === 'shared' ? 'bg-white text-sage shadow-sm' : 'text-[#6b7a6d]'}`}
                      >
                        Cats share a room
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomArrangement('separate');
                          setSelectedRoom(null);
                        }}
                        className={`rounded-xl px-3 py-3 text-sm font-semibold ${roomArrangement === 'separate' ? 'bg-white text-sage shadow-sm' : 'text-[#6b7a6d]'}`}
                      >
                        Own room each
                      </button>
                    </div>
                  )}

                  {roomTypes.length === 0 && (
                    <div className="text-center py-6">
                      <Home className="w-12 h-12 text-sage/30 mx-auto mb-3" />
                      <p className="font-medium mb-1" style={{ color: '#2d3e2f' }}>No rooms set up yet</p>
                      <p className="text-sm mb-4" style={{ color: '#6b7a6d' }}>
                        Add your boarding rooms in Room Management first.
                      </p>
                      <Link to="/staff-dashboard/room-planner" className="text-sm underline" style={{ color: '#C46A3A' }}>
                        Go to Room Planner →
                      </Link>
                    </div>
                  )}

                  {roomArrangement === 'shared' && roomTypes.map((room) => {
                    const availableRoom = availableRoomOptions.find((option) => option.id === room.id);
                    const roomFits = room.capacity >= cats.length;
                    const isAvailable = Boolean(availableRoom) && roomFits;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedRoom(availableRoom)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-55 ${
                          selectedRoom?.key === availableRoom?.key
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 bg-white enabled:hover:border-sage/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <Home className="h-5 w-5 shrink-0 text-sage" />
                              <span className="font-semibold" style={{ color: '#2d3e2f' }}>{room.name}</span>
                            </div>
                            <p className="mb-2 text-sm" style={{ color: '#6b7a6d' }}>{room.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={isAvailable ? 'outline' : 'destructive'} className="text-xs">
                                {!roomFits
                                  ? `Fits up to ${room.capacity} cats per room`
                                  : availableRoom
                                    ? `${availableRoom.physicalName} available`
                                    : 'Fully booked for these dates'}
                              </Badge>
                              <span className="font-bold text-sage">${room.pricePerDay}/cat/day</span>
                            </div>
                          </div>
                          {selectedRoom?.key === availableRoom?.key && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {roomArrangement === 'shared' && roomTypes.length > 0 && !roomTypes.some((room) => (
                    room.capacity >= cats.length && availableRoomOptions.some((option) => option.id === room.id)
                  )) && (
                    <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      No single room can take all selected cats for these dates. Choose separate rooms or edit the dates.
                    </p>
                  )}

                  {roomArrangement === 'separate' && (
                    <div className="space-y-3">
                      <p className="text-sm" style={{ color: '#6b7a6d' }}>
                        Select one different available room for each cat.
                      </p>
                      {cats.map((cat) => {
                        const usedByOtherCats = new Set(
                          Object.entries(roomAssignments)
                            .filter(([catId]) => catId !== cat.id)
                            .map(([, room]) => room?.key)
                            .filter(Boolean)
                        );
                        return (
                          <label key={cat.id} className="block rounded-xl border border-sage/15 bg-white p-4">
                            <span className="mb-2 flex items-center gap-2 font-semibold" style={{ color: '#2d3e2f' }}>
                              <Cat className="h-4 w-4 text-sage" /> {cat.name}'s room
                            </span>
                            <select
                              aria-label={`Room for ${cat.name}`}
                              value={roomAssignments[cat.id]?.key ?? ''}
                              onChange={(event) => {
                                const room = availableRoomOptions.find((candidate) => candidate.key === event.target.value);
                                setRoomAssignments((current) => ({ ...current, [cat.id]: room }));
                              }}
                              className="h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm"
                            >
                              <option value="">Select an available room</option>
                              {availableRoomOptions.map((room) => (
                                <option key={room.key} value={room.key} disabled={usedByOtherCats.has(room.key)}>
                                  {room.physicalName} — {room.name} — ${room.pricePerDay}/day
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      })}
                      {availableRoomOptions.length < cats.length && (
                        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          There are not enough separate rooms available for every selected cat on these dates.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(2)}
                      className="flex-1 rounded-xl border-sage/20"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(5)}
                      disabled={!roomSelectionComplete}
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: '#7DAF7B' }}
                    >
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 5 && (
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Review Booking
                  </CardTitle>
                  <CardDescription>Please confirm all details are correct</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="p-4 rounded-xl bg-white border border-sage/10">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-sage" />
                      <span className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                        Customer
                      </span>
                    </div>
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {selectedCustomer?.name}
                    </p>
                    <p className="text-sm" style={{ color: '#6b7a6d' }}>
                      {selectedCustomer?.email}
                    </p>
                  </div>

                  {/* Cats */}
                  <div className="p-4 rounded-xl bg-white border border-sage/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Cat className="w-4 h-4 text-sage" />
                      <span className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                        Cats ({cats.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {cats.map((cat, i) => (
                        <Badge key={i} variant="outline">
                          🐱 {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="p-4 rounded-xl bg-white border border-sage/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-sage" />
                      <span className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                        Dates
                      </span>
                    </div>
                    <ul className="space-y-1 text-sm" style={{ color: '#2d3e2f' }}>
                      <li>• Check-in: {format(parseISO(checkIn), 'EEE, d MMM yyyy')} at {formatBookingTime(checkInTime)}</li>
                      <li>• Check-out: {format(parseISO(checkOut), 'EEE, d MMM yyyy')} at {formatBookingTime(checkOutTime)}</li>
                    </ul>
                    <p className="mt-2 text-sm" style={{ color: '#6b7a6d' }}>
                      {calculateDays()} days, including arrival and departure days
                    </p>
                  </div>

                  {/* Room */}
                  <div className="p-4 rounded-xl bg-white border border-sage/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="w-4 h-4 text-sage" />
                      <span className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                        Accommodation
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-sage">
                      {roomArrangement === 'shared' ? 'Cats sharing one room' : 'Each cat in their own room'}
                    </p>
                    {roomArrangement === 'shared' ? (
                      <>
                        <p className="font-medium" style={{ color: '#2d3e2f' }}>{selectedRoom?.physicalName}</p>
                        <p className="text-sm" style={{ color: '#6b7a6d' }}>{selectedRoom?.name}</p>
                        <p className="text-sm" style={{ color: '#6b7a6d' }}>${selectedRoom?.pricePerDay} per cat per day</p>
                      </>
                    ) : (
                      <ul className="space-y-1 text-sm" style={{ color: '#2d3e2f' }}>
                        {cats.map((cat) => (
                          <li key={cat.id}>• {cat.name}: {roomAssignments[cat.id]?.physicalName} (${roomAssignments[cat.id]?.pricePerDay}/day)</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Special Requirements */}
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: '#2d3e2f' }}>
                      Special Requirements (Optional)
                    </label>
                    <textarea 
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      placeholder="Dietary needs, medication, behavior notes..."
                      className="w-full rounded-xl border border-sage/20 p-3 min-h-24 resize-none"
                    />
                  </div>

                  <div className="rounded-xl border border-sage/15 bg-white p-4">
                    <p className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>Payment status</p>
                    <Badge className="mt-2 border-rose/20 bg-rose/10 text-rose">Unpaid</Badge>
                    <p className="mt-2 text-xs" style={{ color: '#6b7a6d' }}>
                      A staff-created booking starts unpaid. You can request a deposit or full payment after confirming it.
                    </p>
                  </div>

                  {/* Total */}
                  <div className="p-6 rounded-xl bg-gradient-to-br from-sage/10 to-sage-light/10 border-2 border-sage/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#2d3e2f' }}>
                        Total Amount
                      </span>
                      <DollarSign className="w-5 h-5 text-sage" />
                    </div>
                    <div className="space-y-1 text-sm text-[#6b7a6d]"><div className="flex justify-between"><span>Accommodation subtotal</span><span>${calculatePrice().subtotal.toFixed(2)}</span></div>{bookingSetup.chargeTax && <div className="flex justify-between"><span>{bookingSetup.taxType} at {bookingSetup.taxRate}%</span><span>${calculatePrice().tax.toFixed(2)}</span></div>}</div>
                    <p className="mt-3 text-3xl font-bold text-sage">${calculateTotal().toFixed(2)}</p>
                    <p className="text-sm mt-1" style={{ color: '#6b7a6d' }}>
                      {roomArrangement === 'shared'
                        ? `${cats.length} cat${cats.length !== 1 ? 's' : ''} sharing × ${calculateDays()} days × $${calculatePrice().dailyTotal.toFixed(2)}${calculatePrice().occupancyRateApplied ? ' shared rate' : ''}`
                        : `${calculateDays()} days × ${cats.length} separately assigned rooms`}
                    </p>
                  </div>

                  {bookingError && (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {bookingError}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(4)}
                      className="flex-1 rounded-xl border-sage/20"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleCreateBooking}
                      disabled={creatingBooking}
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: '#7DAF7B' }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {creatingBooking ? 'Saving…' : 'Confirm Booking'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        <Dialog open={showDateRangePicker} onOpenChange={setShowDateRangePicker}>
          <DialogContent className="w-[calc(100%-1.5rem)] max-w-sm overflow-hidden p-0">
            <DialogHeader className="px-5 pt-5">
              <DialogTitle>Select stay dates</DialogTitle>
              <DialogDescription>
                Tap the check-in day, then the check-out day. Every day between them is included.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-x-auto px-2">
              <DateRangeCalendar
                mode="range"
                min={0}
                selected={draftDateRange}
                onSelect={setDraftDateRange}
                defaultMonth={draftDateRange?.from}
                disabled={{ before: startOfToday() }}
                className="mx-auto w-fit"
              />
            </div>
            {draftDateRange?.from && (
              <div className="mx-5 rounded-xl bg-sage/5 px-3 py-2 text-sm" style={{ color: '#2d3e2f' }}>
                {format(draftDateRange.from, 'EEE, d MMM yyyy')}
                {' → '}
                {draftDateRange.to ? format(draftDateRange.to, 'EEE, d MMM yyyy') : 'choose check-out day'}
              </div>
            )}
            <DialogFooter className="border-t bg-white px-5 py-4 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setShowDateRangePicker(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!draftDateRange?.from || !draftDateRange.to}
                onClick={saveDateRange}
                className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddCustomer} onOpenChange={(open) => {
          setShowAddCustomer(open);
          if (!open) setNewCustomerError('');
        }}>
          <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add new customer</DialogTitle>
              <DialogDescription>
                Add the owner now, then continue this booking without losing your place.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-[#2d3e2f]">
                Customer name
                <Input
                  autoComplete="name"
                  value={newCustomer.name}
                  onChange={(event) => setNewCustomer((value) => ({ ...value, name: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </label>
              <label className="block text-sm font-medium text-[#2d3e2f]">
                Email address
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={newCustomer.email}
                  onChange={(event) => setNewCustomer((value) => ({ ...value, email: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </label>
              <label className="block text-sm font-medium text-[#2d3e2f]">
                Phone number
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={newCustomer.phone}
                  onChange={(event) => setNewCustomer((value) => ({ ...value, phone: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </label>
              <label className="block text-sm font-medium text-[#2d3e2f]">
                Cat name
                <Input
                  value={newCustomer.catName}
                  onChange={(event) => setNewCustomer((value) => ({ ...value, catName: event.target.value }))}
                  className="mt-1 rounded-xl"
                />
              </label>
              {newCustomerError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {newCustomerError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={savingCustomer}
                onClick={() => void handleAddCustomer()}
                className="bg-[#C46A3A] text-white hover:bg-[#A85A30]"
              >
                {savingCustomer ? 'Adding customer…' : 'Add customer and continue'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Removed BottomNav component */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:flex" style={{ backgroundColor: '#F6F4EF' }}>
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><RightMenu /></div>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                  Bookings
                </h1>
                <p className="truncate text-sm" style={{ color: '#6b7a6d' }}>All reservations</p>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        {/* New Booking Button */}
        <Link to="/staff-dashboard/bookings?new=true">
          <Button 
            className="w-full rounded-3xl text-white py-6 text-lg font-semibold"
            style={{ backgroundColor: '#C46A3A' }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Booking
          </Button>
        </Link>

        <Card className="rounded-3xl border-sage/10">
          <CardContent className="space-y-3 p-3">
            <h2 className="text-center text-base font-semibold text-[#2d3e2f]">
              <time dateTime={format(startOfToday(), 'yyyy-MM-dd')}>{format(startOfToday(), 'EEE d MMM yyyy').toUpperCase()}</time>
            </h2>
            <div className="grid grid-cols-3 gap-1" aria-label="Booking views">
              {([
                ['current', 'Current'],
                ['recent', 'Recent'],
                ['future', 'Future'],
              ] as const).map(([mode, label]) => (
                <Button key={mode}
                  onClick={() => { setViewMode(mode); setBookingSearch(''); setSortField(mode === 'recent' ? 'departure' : 'arrival'); setSortDirection(mode === 'recent' ? 'desc' : 'asc'); }}
                  aria-pressed={viewMode === mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  className="min-w-0 rounded-xl px-1 text-xs sm:text-sm"
                  style={viewMode === mode ? { backgroundColor: '#2d3e2f', color: 'white' } : { color: '#2d3e2f' }}>
                  {label}
                </Button>
              ))}
            </div>
            <Input aria-label="Search bookings" placeholder="Customer, cat or Revelation booking number"
              value={bookingSearch} onChange={event => setBookingSearch(event.target.value)} />
          </CardContent>
        </Card>

        {/* Sort Controls */}
        <Card className="rounded-3xl border-sage/10">
          <CardContent className="p-4">
            <label className="flex items-center gap-3 text-sm font-medium" style={{ color: '#6b7a6d' }}>
              <span className="shrink-0">Sort by</span>
              <span className="relative min-w-0 flex-1">
                <select
                  aria-label="Sort bookings"
                  value={sortField}
                  onChange={(event) => handleSort(event.target.value as 'arrival' | 'departure' | 'received')}
                  className="h-11 w-full appearance-none rounded-xl border border-sage/20 bg-white px-4 pr-10 text-sm font-semibold text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15"
                >
                  <option value="arrival">Arrival date</option>
                  <option value="departure">Departure date</option>
                  <option value="received">Received date</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7a6d]" />
              </span>
            </label>
          </CardContent>
        </Card>

        {bookingsError && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">Bookings could not be loaded. Your records have not been deleted.<Button variant="outline" className="mt-3 block" onClick={() => void refetchBookings()}>Try again</Button></div>}

        {/* Loading state */}
        {bookingsLoading && (
          <Card className="rounded-3xl border-sage/10">
            <CardContent className="p-8 text-center">
              <p className="text-sm" style={{ color: '#6b7a6d' }}>Loading bookings...</p>
            </CardContent>
          </Card>
        )}

        {!bookingsLoading && !bookingsError && <p role="status" className="text-sm text-[#6b7a6d]">
          {matchingBookings.length.toLocaleString()} bookings{matchingBookings.length > 50 ? ` · Page ${currentPage} of ${pageCount}` : ''}
        </p>}
        {/* Bookings List */}
        {!bookingsLoading && !bookingsError && <div className="space-y-3">
          {displayedBookings.map((booking) => (
            <Card 
              key={booking.id} 
              className="rounded-3xl border-sage/10 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewBooking(booking)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      {booking.customerName}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {booking.catNames.map((cat, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          🐱 {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge 
                    className={
                      booking.paymentStatus === 'paid' 
                        ? 'bg-sage/10 text-sage border-sage/20' 
                        : ['partial', 'partially_paid', 'deposit_paid'].includes(booking.paymentStatus)
                        ? 'border-[#D69E2E] bg-[#FDE68A] text-[#713F12] hover:bg-[#FDE68A] hover:text-[#713F12]'
                        : booking.paymentStatus === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-rose/10 text-rose border-rose/20'
                    }
                  >
                    {booking.paymentStatus}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: '#6b7a6d' }}>Check-in</p>
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                    </p>
                    {booking.checkInTime && (
                      <p className="text-xs" style={{ color: '#6b7a6d' }}>{formatBookingTime(booking.checkInTime)}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6b7a6d' }}>Check-out</p>
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                    </p>
                    {booking.checkOutTime && (
                      <p className="text-xs" style={{ color: '#6b7a6d' }}>{formatBookingTime(booking.checkOutTime)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-sage/10">
                  <div>
                    <p className="text-xs" style={{ color: '#6b7a6d' }}>{booking.roomType} - Room {booking.roomNumber}</p>
                    <p className="font-semibold text-sage">${booking.total}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-terracotta hover:text-terracotta/80">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>}

        {!bookingsLoading && !bookingsError && pageCount > 1 && <nav aria-label="Booking pages" className="flex items-center justify-between gap-3">
          <Button variant="outline" disabled={currentPage === 1} onClick={() => setBookingPage(currentPage - 1)}>Previous</Button>
          <span className="text-sm">{currentPage} / {pageCount}</span>
          <Button variant="outline" disabled={currentPage === pageCount} onClick={() => setBookingPage(currentPage + 1)}>Next</Button>
        </nav>}
        {/* Empty State */}
        {!bookingsLoading && !bookingsError && displayedBookings.length === 0 && (
          <Card className="rounded-3xl border-sage/10">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-sage/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2d3e2f' }}>
                {bookingSearch ? 'No matching bookings' : viewMode === 'current' ? 'No current bookings' : viewMode === 'recent' ? 'No recent bookings' : 'No future bookings'}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6b7a6d' }}>
                {bookingSearch ? 'Try another customer, cat or booking number.' : viewMode === 'current' ? 'No stays overlap today. Choose Future to see upcoming arrivals.' : viewMode === 'recent' ? 'No stays ended in the last 30 days. Search to find older bookings.' : 'No stays arriving after today.'}
              </p>
              <Link to="?new=true">
                <Button className="rounded-xl text-white" style={{ backgroundColor: '#C46A3A' }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Booking Details Sheet */}
      <Sheet open={showBookingDetails} onOpenChange={handleBookingDetailsOpenChange}>
        <SheetContent side="right" className="h-dvh w-screen max-w-none gap-0 overflow-hidden border-0 p-0 sm:max-w-none">
          <SheetHeader className="shrink-0 border-b border-sage/10 bg-white px-4 py-4 pr-12 text-left">
            <SheetTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
              {selectedBooking?.customerName || 'Booking details'}
            </SheetTitle>
            <SheetDescription>
              {selectedBooking
                ? `Booking ${selectedBooking.id.slice(0, 8).toUpperCase()} · Added ${format(new Date(selectedBooking.receivedDate), 'd MMM yyyy')}`
                : 'Booking information'}
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#F6F4EF] p-4 pb-8">
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <button
                    type="button"
                    aria-expanded={customerDetailsOpen}
                    onClick={() => setCustomerDetailsOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sage">Customer</p>
                      <p className="truncate text-lg font-semibold text-[#2d3e2f]">{selectedBooking.customerName}</p>
                      <p className="text-xs text-[#6b7a6d]">Tap for email and phone</p>
                    </div>
                    {customerDetailsOpen
                      ? <ChevronUp className="h-5 w-5 shrink-0 text-sage" />
                      : <ChevronDown className="h-5 w-5 shrink-0 text-sage" />}
                  </button>

                  {customerDetailsOpen && (
                    <div className="grid gap-2 border-t border-sage/10 pt-3 sm:grid-cols-2">
                      {selectedBooking.customerEmail ? (
                        <a
                          href={`mailto:${selectedBooking.customerEmail}`}
                          aria-label={`Email ${selectedBooking.customerName}`}
                          className="flex min-h-12 items-center gap-3 rounded-xl border border-sage/15 bg-[#F6F4EF] px-3 text-sm font-medium text-[#2d3e2f]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sage"><Mail className="h-4 w-4" /></span>
                          <span className="min-w-0 break-all">{selectedBooking.customerEmail}</span>
                        </a>
                      ) : <p className="rounded-xl bg-[#F6F4EF] p-3 text-sm text-[#6b7a6d]">No email saved</p>}
                      {selectedBooking.customerPhone ? (
                        <a
                          href={`tel:${selectedBooking.customerPhone.replace(/\s+/g, '')}`}
                          aria-label={`Call ${selectedBooking.customerName}`}
                          className="flex min-h-12 items-center gap-3 rounded-xl border border-sage/15 bg-[#F6F4EF] px-3 text-sm font-medium text-[#2d3e2f]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sage"><Phone className="h-4 w-4" /></span>
                          <span>{selectedBooking.customerPhone}</span>
                        </a>
                      ) : <p className="rounded-xl bg-[#F6F4EF] p-3 text-sm text-[#6b7a6d]">No phone saved</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <Link to={`/staff-dashboard/calendar?date=${selectedBooking.checkIn}&booking=${selectedBooking.id}`} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-sage/20 bg-white px-2 text-center text-xs font-semibold text-sage"><Calendar className="h-4 w-4" />Calendar</Link>
                    <button type="button" onClick={() => setShowNoteEditor((value) => !value)} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-sage/20 bg-white px-2 text-xs font-semibold text-sage"><NotebookPen className="h-4 w-4" />Notes</button>
                    <button type="button" onClick={() => setShowHistory((value) => !value)} className="flex min-h-11 items-center justify-center gap-1 rounded-xl border border-sage/20 bg-white px-2 text-xs font-semibold text-sage"><History className="h-4 w-4" />History</button>
                  </div>
                  {showNoteEditor && (
                    <div className="space-y-3 rounded-xl bg-[#F6F4EF] p-3">
                      <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Add an internal booking note…" className="min-h-24 w-full rounded-xl border border-sage/20 bg-white p-3 text-sm" />
                      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={noteVisible} onChange={(event) => setNoteVisible(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#C46A3A]" /><span>Show this note on the customer confirmation</span></label>
                      <Button type="button" onClick={() => void handleSaveNote()} className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]">Save note</Button>
                    </div>
                  )}
                  {showHistory && (
                    <div className="space-y-2 rounded-xl bg-[#F6F4EF] p-3">
                      {bookingOperations.loading ? <p className="text-sm text-[#6b7a6d]">Loading booking history…</p> : bookingOperations.events.length > 0 ? bookingOperations.events.map((event) => (
                        <div key={event.id} className="border-b border-sage/10 pb-2 last:border-0 last:pb-0"><p className="text-sm font-medium text-[#2d3e2f]">{event.summary}</p><p className="text-xs text-[#6b7a6d]">{format(new Date(event.created_at), 'd MMM yyyy, h:mm a')}</p></div>
                      )) : <p className="text-sm text-[#6b7a6d]">No recorded changes yet.</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cat stays */}
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2">
                    <Cat className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold text-[#2d3e2f]">Cats, dates and rooms</h3>
                  </div>
                  {selectedBookingCatStays.length > 0 ? selectedBookingCatStays.map((stay, index) => (
                    <article key={`${stay.catName}-${index}`} aria-label={`${stay.catName} stay details`} className="space-y-3 rounded-2xl border border-sage/10 bg-[#F6F4EF] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="flex min-w-0 items-center gap-2 text-base font-semibold text-[#2d3e2f]"><span aria-hidden="true">🐱</span><span className="truncate">{stay.catName}</span></h4>
                        <Badge variant="outline" className={stay.sharingRoom ? 'border-[#BCD8F4] bg-[#EDF6FF] text-[#0A4C8B]' : 'border-sage/20 bg-white text-sage'}>
                          Sharing: {stay.sharingRoom ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">From</p>
                          <p className="mt-1 font-semibold text-[#2d3e2f]">{format(parseISO(selectedBooking.checkIn), 'd MMM yyyy')}</p>
                          <p className={`mt-1 flex items-center gap-1 text-xs ${selectedBooking.checkInTime ? 'text-[#6b7a6d]' : 'font-semibold text-amber-700'}`}><Clock className="h-3.5 w-3.5" />{selectedBooking.checkInTime ? formatBookingTime(selectedBooking.checkInTime) : 'Time not recorded'}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">To</p>
                          <p className="mt-1 font-semibold text-[#2d3e2f]">{format(parseISO(selectedBooking.checkOut), 'd MMM yyyy')}</p>
                          <p className={`mt-1 flex items-center gap-1 text-xs ${selectedBooking.checkOutTime ? 'text-[#6b7a6d]' : 'font-semibold text-amber-700'}`}><Clock className="h-3.5 w-3.5" />{selectedBooking.checkOutTime ? formatBookingTime(selectedBooking.checkOutTime) : 'Time not recorded'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm">
                        <Home className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                        <div><p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a6d]">Accommodation</p><p className="mt-1 font-semibold text-[#2d3e2f]">{stay.roomName}</p></div>
                      </div>
                    </article>
                  )) : (
                    <p className="rounded-xl bg-[#F6F4EF] p-3 text-sm text-amber-800">No cat is linked to this booking yet.</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 border-t border-sage/10 pt-3 text-center">
                    <div><p className="text-xs text-[#6b7a6d]">Total</p><p className="font-semibold text-[#2d3e2f]">${bookingOperations.financials.total.toFixed(2)}</p></div>
                    <div><p className="text-xs text-[#6b7a6d]">Paid</p><p className="font-semibold text-emerald-700">${bookingOperations.financials.paid.toFixed(2)}</p></div>
                    <div>
                      <p className="text-xs text-[#6b7a6d]">{bookingOperations.financials.owing < 0 ? 'Credit' : 'Owing'}</p>
                      <p className="font-semibold text-[#2d3e2f]">${Math.abs(bookingOperations.financials.owing).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <p className="text-sm font-semibold text-[#2d3e2f]">Review this booking</p>
                  <div className={selectedBooking.status === 'confirmed' || selectedBooking.status === 'cancelled' ? 'grid' : 'grid grid-cols-2 gap-3'}>
                    <Button variant="outline" className="min-h-12 rounded-xl border-sage/20" onClick={() => handleBookingDetailsOpenChange(false)}>Close</Button>
                    {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'cancelled' && (
                      <Button type="button" disabled={confirmingBooking} onClick={() => void handleConfirmSelectedBooking()} className="min-h-12 rounded-xl bg-[#7DAF7B] text-white hover:bg-[#699967] disabled:bg-sage/50">
                        <Check className="mr-2 h-4 w-4" />
                        {confirmingBooking ? 'Working…' : 'Confirm booking'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <details className="group rounded-2xl border border-sage/10 bg-white">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-[#2d3e2f]">
                  <span>More booking tools and payments</span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-sage transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-4 border-t border-sage/10 bg-[#F6F4EF] p-3">

              {/* Booking note */}
              {selectedBooking.specialRequirements && !showNoteEditor && (
                <Card className="rounded-2xl border-sage/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-sage" />
                      <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                        Booking note
                      </h3>
                    </div>
                    <p className="text-sm" style={{ color: '#2d3e2f' }}>
                      {selectedBooking.specialRequirements}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: '#6b7a6d' }}>{selectedBooking.customerNoteVisible ? 'Included on customer confirmation' : 'Internal only'}</p>
                  </CardContent>
                </Card>
              )}

              {selectedBooking.status !== 'cancelled' && <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-center gap-2"><Mail className="h-5 w-5 text-sage" /><h3 className="font-semibold text-[#2d3e2f]">Send booking confirmation</h3></div>
                  <p className="text-sm text-[#6b7a6d]">To {selectedBooking.customerEmail || 'customer email not saved'}</p>
                  <textarea value={confirmationMessage} onChange={(event) => setConfirmationMessage(event.target.value)} className="min-h-24 w-full rounded-xl border border-sage/20 p-3 text-sm" aria-label="Confirmation message" />
                  <div className="grid gap-2">
                    {([['deposit', `Request deposit${bookingSetup.depositAmount ? ` (${bookingSetup.depositType === 'fixed' ? `$${bookingSetup.depositAmount}` : `${bookingSetup.depositAmount}%`})` : ''}`], ['full', 'Request total booking payment'], ['none', "Don't request payment"]] as const).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 rounded-xl border border-sage/15 px-3 py-2 text-sm"><input type="radio" name="confirmation-payment" checked={confirmationPayment === value} onChange={() => setConfirmationPayment(value)} className="accent-[#C46A3A]" />{label}</label>
                    ))}
                  </div>
                  <Button type="button" onClick={() => void handleSendConfirmation()} disabled={sendingConfirmation || !selectedBooking.customerEmail} className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]"><Mail className="mr-2 h-4 w-4" />{sendingConfirmation ? 'Sending…' : 'Send to customer'}</Button>
                </CardContent>
              </Card>}

              {/* Payment summary */}
              <Card className="rounded-2xl border-sage/10 bg-gradient-to-br from-sage/5 to-sage-light/5">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center gap-2"><Receipt className="h-5 w-5 text-sage" /><h3 className="font-semibold text-[#2d3e2f]">Costs and payments</h3></div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#6b7a6d]">Booking</span><span>${bookingOperations.financials.baseTotal.toFixed(2)}</span></div>
                    {bookingOperations.adjustments.map((adjustment) => (
                      <div key={adjustment.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-2"><span className="min-w-0 truncate">{adjustment.label}</span><span className="flex shrink-0 items-center gap-2 font-medium">{adjustment.amount < 0 ? '-' : '+'}${Math.abs(Number(adjustment.amount)).toFixed(2)}{selectedBooking.status !== 'cancelled' && <button type="button" aria-label={`Remove ${adjustment.label}`} onClick={() => void handleRemoveAdjustment(adjustment.id)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>}</span></div>
                    ))}
                    {bookingSetup.chargeTax && <><div className="flex justify-between border-t border-sage/15 pt-2"><span className="text-[#6b7a6d]">Subtotal</span><span>${bookingOperations.financials.subtotal.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-[#6b7a6d]">{bookingSetup.taxType} at {bookingSetup.taxRate}%</span><span>${bookingOperations.financials.tax.toFixed(2)}</span></div></>}
                    <div className="flex justify-between border-t border-sage/15 pt-2 font-semibold"><span>Total</span><span>${bookingOperations.financials.total.toFixed(2)}</span></div>
                    <div className="flex justify-between text-emerald-700"><span>Paid</span><span>-${bookingOperations.financials.paid.toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold"><span>{bookingOperations.financials.owing < 0 ? 'Credit' : 'Owing'}</span><span>${Math.abs(bookingOperations.financials.owing).toFixed(2)}</span></div>
                  </div>
                  {bookingOperations.payments.map((payment) => <div key={payment.id} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800"><strong>{payment.type === 'deposit' ? 'Deposit' : 'Payment'}</strong> · {payment.payment_method ? PAYMENT_METHOD_LABELS[payment.payment_method] : 'Payment'} · {payment.paid_on || format(new Date(payment.created_at), 'd MMM yyyy')}<span className="float-right font-semibold">${Number(payment.amount).toFixed(2)}</span></div>)}
                </CardContent>
              </Card>

              {selectedBooking.status !== 'cancelled' && <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <h3 className="font-semibold text-[#2d3e2f]">Add charge or discount</h3>
                  <div className="grid grid-cols-2 gap-2"><select value={adjustmentDraft.kind} onChange={(event) => setAdjustmentDraft((current) => ({ ...current, kind: event.target.value as AdjustmentKind }))} className="h-11 rounded-xl border border-sage/20 bg-white px-3 text-sm"><option value="charge">Charge</option><option value="discount">Discount</option></select><select value={adjustmentDraft.calculation} onChange={(event) => setAdjustmentDraft((current) => ({ ...current, calculation: event.target.value as AdjustmentCalculation }))} className="h-11 rounded-xl border border-sage/20 bg-white px-3 text-sm"><option value="fixed">Fixed amount</option><option value="percentage">Percentage</option></select></div>
                  <Input value={adjustmentDraft.label} onChange={(event) => setAdjustmentDraft((current) => ({ ...current, label: event.target.value }))} placeholder="e.g. Daily medication or loyalty discount" />
                  <Input type="number" min="0" step="0.01" inputMode="decimal" value={adjustmentDraft.value} onChange={(event) => setAdjustmentDraft((current) => ({ ...current, value: event.target.value }))} placeholder={adjustmentDraft.calculation === 'fixed' ? 'Amount' : 'Percentage'} />
                  <Button type="button" onClick={() => void handleAddAdjustment()} variant="outline" className="w-full border-sage/20">Add to booking</Button>
                </CardContent>
              </Card>}

              {selectedBooking.status !== 'cancelled' && <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-sage" /><h3 className="font-semibold text-[#2d3e2f]">Record payment</h3></div>{bookingOperations.creditBalance > 0 && <Badge variant="outline">${bookingOperations.creditBalance.toFixed(2)} credit</Badge>}</div>
                  <select value={paymentDraft.purpose} onChange={(event) => setPaymentDraft((current) => ({ ...current, purpose: event.target.value as PaymentPurpose }))} className="h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm"><option value="deposit">Deposit</option><option value="booking">Payment</option></select>
                  <select value={paymentDraft.method} onChange={(event) => setPaymentDraft((current) => ({ ...current, method: event.target.value as PaymentMethod }))} className="h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm">{bookingSetup.enabledPaymentMethods.map((method) => <option key={method} value={method}>{PAYMENT_METHOD_LABELS[method]}</option>)}</select>
                  <Input type="date" value={paymentDraft.paidOn} onChange={(event) => setPaymentDraft((current) => ({ ...current, paidOn: event.target.value }))} />
                  <Input value={paymentDraft.reference} onChange={(event) => setPaymentDraft((current) => ({ ...current, reference: event.target.value }))} placeholder="Reference (optional)" />
                  <Input type="number" min="0" step="0.01" inputMode="decimal" value={paymentDraft.amount} onChange={(event) => setPaymentDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" />
                  <div className="grid grid-cols-2 gap-2"><Button type="button" onClick={() => void handleAddPayment(false)} variant="outline">Add payment</Button><Button type="button" onClick={() => void handleAddPayment(true)} disabled={bookingOperations.financials.owing <= 0 || paymentDraft.purpose !== 'booking'} className="bg-[#7DAF7B] text-white hover:bg-[#699967]">Mark total paid</Button></div>
                  {paymentDraft.purpose !== 'booking' && <p className="text-xs text-[#6b7a6d]">Choose Payment to use “Mark total paid”. Deposits keep their entered amount.</p>}
                </CardContent>
              </Card>}

              <Card className={`rounded-2xl ${selectedBooking.status === 'cancelled' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-white'}`}>
                <CardContent className="space-y-3 p-4">
                  {selectedBooking.status === 'cancelled' ? (
                    <>
                      <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-amber-700" /><h3 className="font-semibold text-[#2d3e2f]">Cancelled booking</h3></div>
                      <div className="space-y-1 text-sm text-[#4E5871]">
                        <p><strong>Reason:</strong> {selectedBooking.cancellationReason || 'Not recorded'}</p>
                        {selectedBooking.cancellationNote && <p><strong>Note:</strong> {selectedBooking.cancellationNote}</p>}
                        {selectedBooking.cancelledAt && <p><strong>Cancelled:</strong> {format(new Date(selectedBooking.cancelledAt), 'd MMM yyyy, h:mm a')}</p>}
                        <p><strong>Customer credit:</strong> ${Number(selectedBooking.cancellationCreditAmount || 0).toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-amber-800">This record stays in cancelled-booking history and is removed from room availability.</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-600" /><h3 className="font-semibold text-[#2d3e2f]">Cancel or remove booking</h3></div>
                      <p className="text-xs leading-5 text-[#6b7a6d]">Cancel a genuine booking to keep its reason and financial history. Delete only an entry that should never have been created.</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Button type="button" variant="outline" onClick={() => {
                          setBookingActionError('');
                          setCancellationCreditChoice(bookingOperations.financials.paid > 0 ? 'after_deposit' : 'none');
                          setShowCancelBooking(true);
                        }} className="min-h-11 border-red-200 text-red-700 hover:bg-red-50">Cancel booking</Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setBookingActionError('');
                          setShowDeleteBooking(true);
                        }} className="min-h-11 border-red-200 text-red-700 hover:bg-red-50"><Trash2 className="mr-2 h-4 w-4" />Created by mistake</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
                </div>
              </details>

              {bookingActionError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {bookingActionError}
                </p>
              )}
              {bookingOperations.loadError && (
                <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Booking operations could not be loaded. {bookingOperations.loadError}</p>
              )}
              {paymentActionMessage && (
                <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {paymentActionMessage}
                </p>
              )}
              {operationMessage && (
                <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">{operationMessage}</p>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showCancelBooking} onOpenChange={(open) => !closingBooking && setShowCancelBooking(open)}>
        <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif">Cancel this booking?</DialogTitle>
            <DialogDescription className="leading-6">
              The stay will leave the operational calendar, but its booking, payment, and cancellation history will remain available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="cancellation-reason" className="text-sm font-semibold text-[#2d3e2f]">Reason</label>
              <select id="cancellation-reason" value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} className="h-12 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm">
                <option value="">Select a reason</option>
                <option value="Customer change of plans">Customer change of plans</option>
                <option value="No show">No show</option>
                <option value="Deposit not paid">Deposit not paid</option>
                <option value="Vaccination requirements">Vaccination requirements</option>
                <option value="Cattery unavailable or full">Cattery unavailable or full</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="cancellation-note" className="text-sm font-semibold text-[#2d3e2f]">Note <span className="font-normal text-[#6b7a6d]">(optional)</span></label>
              <textarea id="cancellation-note" value={cancellationNote} onChange={(event) => setCancellationNote(event.target.value)} placeholder="Add any useful detail for the cancellation record…" className="min-h-24 w-full rounded-xl border border-sage/20 bg-white p-3 text-sm" />
            </div>

            {cancellationSummary.paid > 0 && (
              <div className="space-y-3 rounded-2xl border border-[#E8DED4] bg-[#F6F2EA] p-4">
                <div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#C46A3A]" /><h3 className="font-semibold text-[#2d3e2f]">What happens to the ${cancellationSummary.paid.toFixed(2)} paid?</h3></div>
                <p className="text-xs leading-5 text-[#6b7a6d]">Customer credit remains on the account for a future booking. Money not credited remains retained; this does not send a bank or Stripe refund.</p>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 rounded-xl border border-[#E8DED4] bg-white p-3 text-sm"><input type="radio" name="cancellation-credit" checked={cancellationCreditChoice === 'none'} onChange={() => setCancellationCreditChoice('none')} className="mt-0.5 accent-[#C46A3A]" /><span><strong>Keep payment</strong><br /><span className="text-xs text-[#6b7a6d]">No customer credit</span></span></label>
                  <label className="flex items-start gap-3 rounded-xl border border-[#E8DED4] bg-white p-3 text-sm"><input type="radio" name="cancellation-credit" checked={cancellationCreditChoice === 'after_deposit'} onChange={() => setCancellationCreditChoice('after_deposit')} className="mt-0.5 accent-[#C46A3A]" /><span><strong>Keep non-refundable deposit</strong><br /><span className="text-xs text-[#6b7a6d]">Credit ${Math.max(0, cancellationSummary.paid - cancellationSummary.deposit).toFixed(2)} and retain ${cancellationSummary.deposit.toFixed(2)}</span></span></label>
                  <label className="flex items-start gap-3 rounded-xl border border-[#E8DED4] bg-white p-3 text-sm"><input type="radio" name="cancellation-credit" checked={cancellationCreditChoice === 'full'} onChange={() => setCancellationCreditChoice('full')} className="mt-0.5 accent-[#C46A3A]" /><span><strong>Credit the full payment</strong><br /><span className="text-xs text-[#6b7a6d]">Add ${cancellationSummary.paid.toFixed(2)} to customer balance</span></span></label>
                  <label className="flex items-start gap-3 rounded-xl border border-[#E8DED4] bg-white p-3 text-sm"><input type="radio" name="cancellation-credit" checked={cancellationCreditChoice === 'custom'} onChange={() => setCancellationCreditChoice('custom')} className="mt-0.5 accent-[#C46A3A]" /><span className="flex-1"><strong>Choose another amount</strong>{cancellationCreditChoice === 'custom' && <Input type="number" min="0" max={cancellationSummary.paid} step="0.01" inputMode="decimal" value={customCancellationCredit} onChange={(event) => setCustomCancellationCredit(event.target.value)} placeholder="Customer credit amount" className="mt-2 bg-white" />}</span></label>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3 text-sm"><div><span className="text-xs text-[#6b7a6d]">Customer credit</span><p className="font-bold text-emerald-700">${cancellationSummary.credit.toFixed(2)}</p></div><div><span className="text-xs text-[#6b7a6d]">Payment retained</span><p className="font-bold text-[#2d3e2f]">${cancellationSummary.retained.toFixed(2)}</p></div></div>
              </div>
            )}

            {bookingActionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bookingActionError}</p>}
          </div>

          <DialogFooter className="gap-2 sm:flex-row">
            <Button type="button" variant="outline" disabled={closingBooking} onClick={() => setShowCancelBooking(false)}>Back</Button>
            <Button type="button" disabled={closingBooking || !cancellationReason || !cancellationSummary.isCustomAmountValid} onClick={() => void handleCancelBooking()} className="bg-red-600 text-white hover:bg-red-700">{closingBooking ? 'Cancelling…' : 'Confirm cancellation'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteBooking} onOpenChange={(open) => !closingBooking && setShowDeleteBooking(open)}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-serif"><Trash2 className="h-6 w-6 text-red-600" />Delete an accidental entry?</DialogTitle>
            <DialogDescription className="leading-6">Use this only when the booking should never have existed. A booking with any payment or customer-credit history cannot be deleted and must be cancelled instead.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="deletion-reason" className="text-sm font-semibold text-[#2d3e2f]">Why was this created by mistake?</label>
            <textarea id="deletion-reason" value={deletionReason} onChange={(event) => setDeletionReason(event.target.value)} placeholder="For example: duplicate entry created while taking a phone booking" className="min-h-28 w-full rounded-xl border border-sage/20 p-3 text-sm" />
            {bookingOperations.payments.length > 0 && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">This booking has a payment record, so deletion is blocked. Cancel it instead.</p>}
            {bookingActionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bookingActionError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button type="button" variant="outline" disabled={closingBooking} onClick={() => setShowDeleteBooking(false)}>Back</Button>
            <Button type="button" disabled={closingBooking || deletionReason.trim().length < 5 || bookingOperations.payments.length > 0} onClick={() => void handleDeleteBooking()} className="bg-red-600 text-white hover:bg-red-700">{closingBooking ? 'Deleting…' : 'Delete accidental entry'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Removed BottomNav component */}
      </div>
    </div>
  );
}
