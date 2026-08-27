import { useState, useEffect } from 'react';
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
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { sendBookingConfirmation } from '@/utils/email';
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
  ChevronRight,
  Clock,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { format, parseISO, startOfToday } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { bookingOverlapsStay, calculateAssignedRoomTotal, inclusiveStayDays } from '../../lib/bookingPricing';
import {
  bookingHoursSummary,
  bookingTimeSlotsForDate,
  customerMatchesSearch,
  formatBookingTime,
} from '../../lib/bookingSchedule';
import { Calendar as DateRangeCalendar } from '../../components/ui/calendar';
import {
  getCatteryPaymentStatus,
  requestBookingPayment,
  type CatteryPaymentStatus,
} from '@/utils/catteryPayments';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';

export function AdminBookings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreating = searchParams.get('new') === 'true';
  const [showCreateBooking, setShowCreateBooking] = useState(isCreating);
  
  // Filter and sort state
  const [viewMode, setViewMode] = useState<'latest' | 'all'>('latest');
  const [sortField, setSortField] = useState<'arrival' | 'departure' | 'received'>('received');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  // Form state
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cats, setCats] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
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
  const [bookingError, setBookingError] = useState('');
  const [bookingActionError, setBookingActionError] = useState('');
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [detailRequestPayment, setDetailRequestPayment] = useState(false);
  const [detailPaymentChoice, setDetailPaymentChoice] = useState<'deposit' | 'full' | 'both'>('both');
  const [paymentActionMessage, setPaymentActionMessage] = useState('');
  const [catteryPaymentStatus, setCatteryPaymentStatus] = useState<CatteryPaymentStatus>({ connected: false });

  const { cattery } = useAuth();
  const { bookings: rawBookings, loading: bookingsLoading, createBooking, updateBookingStatus } = useBookings();
  const { customers: rawCustomers, createCustomer, addCat } = useCustomers();
  const { rooms: rawRooms } = useRooms();
  const [customerSearch, setCustomerSearch] = useState('');

  const locallySavedBookingSettings = (() => {
    try {
      const saved = localStorage.getItem('bookingRules');
      return saved ? JSON.parse(saved) as Record<string, unknown> : {};
    } catch {
      return {};
    }
  })();
  const bookingSettings = {
    ...locallySavedBookingSettings,
    ...(cattery?.website_settings ?? {}),
  };

  useEffect(() => {
    setShowCreateBooking(isCreating);
  }, [isCreating]);

  useEffect(() => {
    if (!cattery?.id) return;
    getCatteryPaymentStatus(cattery.id)
      .then(setCatteryPaymentStatus)
      .catch(() => setCatteryPaymentStatus({ connected: false }));
  }, [cattery?.id]);

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
      description: r.description || r.amenities.slice(0, 2).join(' · '),
      color: 'sage',
    }));

  // Map real Supabase bookings to UI shape
  const bookings = rawBookings.map(b => {
    const days = inclusiveStayDays(b.check_in, b.check_out);
    const linkedCatNames = (b.booking_cats ?? []).map(bc => bc.cat.name);
    const guestCatNames = b.cat_names
      ? b.cat_names.split(',').map(name => name.trim()).filter(Boolean)
      : [];

    return {
      id: b.id,
      customerName: b.customer?.name || b.guest_name || 'Online customer',
      customerEmail: b.customer?.email || b.guest_email || '',
      customerPhone: b.customer?.phone || b.guest_phone || '',
      catNames: linkedCatNames.length > 0 ? linkedCatNames : guestCatNames,
      checkIn: b.check_in,
      checkOut: b.check_out,
      checkInTime: b.check_in_time,
      checkOutTime: b.check_out_time,
      roomType: b.room?.type || 'Room',
      roomNumber: b.room?.name || '',
      status: b.status,
      paymentStatus: b.payment_status,
      total: b.total_amount || 0,
      days,
      receivedDate: b.created_at,
      specialRequirements: b.notes || '',
      customerId: b.customer?.id || null,
      roomArrangement: b.room_arrangement || 'shared',
      roomAssignments: (b.booking_cat_rooms ?? []).map((assignment) => ({
        catId: assignment.cat.id,
        catName: assignment.cat.name,
        roomId: assignment.room.id,
        roomName: assignment.room.name,
        roomType: assignment.room.type,
      })),
    };
  });

  const occupiedRoomIds = new Set(
    checkIn && checkOut
      ? rawBookings
        .filter((booking) => (
          booking.status !== 'cancelled'
          && bookingOverlapsStay(booking.check_in, booking.check_out, checkIn, checkOut)
        ))
        .flatMap((booking) => [
          booking.room?.id,
          ...(booking.booking_cat_rooms ?? []).map((assignment) => assignment.room.id),
        ].filter(Boolean) as string[])
      : []
  );
  const availableRoomTypes = roomTypes.filter((room) => !occupiedRoomIds.has(room.id));
  const roomSelectionComplete = roomArrangement === 'shared'
    ? Boolean(selectedRoom)
    : cats.length > 0 && cats.every((cat) => Boolean(roomAssignments[cat.id]));

  // Filter bookings based on view mode
  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = bookings;
    
    if (viewMode === 'latest') {
      // Show bookings received in the last 7 days
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = bookings.filter(booking => 
        new Date(booking.receivedDate) >= sevenDaysAgo
      );
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

  const displayedBookings = getSortedBookings();

  // Toggle sort direction or change field
  const handleSort = (field: 'arrival' | 'departure' | 'received') => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and default to desc
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'arrival' | 'departure' | 'received') => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setDetailRequestPayment(false);
    setDetailPaymentChoice('both');
    setBookingActionError('');
    setPaymentActionMessage('');
    setShowBookingDetails(true);
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || cats.length === 0) return 0;
    const days = inclusiveStayDays(checkIn, checkOut);
    if (roomArrangement === 'separate') {
      return calculateAssignedRoomTotal(days, cats.map((cat) => roomAssignments[cat.id]?.pricePerDay ?? 0));
    }
    return selectedRoom ? calculateAssignedRoomTotal(days, cats.map(() => selectedRoom.pricePerDay)) : 0;
  };

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
    if (!bookingTimeSlotsForDate(bookingSettings, nextCheckIn).includes(checkInTime)) {
      setCheckInTime('');
    }
    if (!bookingTimeSlotsForDate(bookingSettings, nextCheckOut).includes(checkOutTime)) {
      setCheckOutTime('');
    }
    setShowDateRangePicker(false);
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
    setCats([]);
    setNewCustomer({ name: '', email: '', phone: '', catName: '' });
    setShowAddCustomer(false);
    setSavingCustomer(false);
    setStep(2);
  };

  const handleCreateBooking = async () => {
    const assignedRooms = roomArrangement === 'shared'
      ? cats.map((cat) => ({ cat_id: cat.id, room_id: selectedRoom?.id }))
      : cats.map((cat) => ({ cat_id: cat.id, room_id: roomAssignments[cat.id]?.id }));
    const primaryRoom = roomArrangement === 'shared' ? selectedRoom : roomAssignments[cats[0]?.id];

    if (
      !selectedCustomer || !checkIn || !checkOut || !checkInTime || !checkOutTime
      || cats.length === 0 || !primaryRoom || assignedRooms.some((assignment) => !assignment.room_id)
    ) return;

    setBookingError('');

    const { data, error } = await createBooking({
      customer_id: selectedCustomer.id,
      room_id: String(primaryRoom.id),
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
      })),
    });

    if (error) {
      setBookingError(typeof error === 'string' ? error : error.message || 'Booking could not be created.');
      return;
    }

    if (selectedCustomer.email && cattery?.name) {
      sendBookingConfirmation({
        catteryId: cattery.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        catteryName: cattery.name,
        catName: cats[0]?.name,
        roomName: roomArrangement === 'shared'
          ? selectedRoom.name
          : cats.map((cat) => `${cat.name}: ${roomAssignments[cat.id]?.name}`).join(', '),
        checkIn: `${format(parseISO(checkIn), 'd MMM yyyy')} at ${formatBookingTime(checkInTime)}`,
        checkOut: `${format(parseISO(checkOut), 'd MMM yyyy')} at ${formatBookingTime(checkOutTime)}`,
        totalAmount: `$${calculateTotal().toFixed(2)}`,
        bookingRef: data?.id?.slice(0, 8).toUpperCase(),
        catteryEmail: cattery.email ?? undefined,
      }).catch(err => console.warn('[email] Confirmation not sent:', err));
    }

    setShowCreateBooking(false);
    navigate('/staff-dashboard/bookings');
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
      if (selectedBooking.customerEmail && cattery?.name) {
        const roomName = selectedBooking.roomAssignments.length > 0
          ? selectedBooking.roomAssignments.map((assignment: any) => `${assignment.catName}: ${assignment.roomName}`).join(', ')
          : selectedBooking.roomNumber;
        sendBookingConfirmation({
          catteryId: cattery.id,
          customerId: selectedBooking.customerId,
          customerName: selectedBooking.customerName,
          customerEmail: selectedBooking.customerEmail,
          catteryName: cattery.name,
          catName: selectedBooking.catNames.join(', '),
          roomName,
          checkIn: `${format(parseISO(selectedBooking.checkIn), 'd MMM yyyy')} at ${formatBookingTime(selectedBooking.checkInTime || '')}`,
          checkOut: `${format(parseISO(selectedBooking.checkOut), 'd MMM yyyy')} at ${formatBookingTime(selectedBooking.checkOutTime || '')}`,
          totalAmount: `$${Number(selectedBooking.total).toFixed(2)}`,
          bookingRef: selectedBooking.id.slice(0, 8).toUpperCase(),
          catteryEmail: cattery.email ?? undefined,
        }).catch((emailError) => console.warn('[email] Confirmation not sent:', emailError));
      }
    }

    if (detailRequestPayment) {
      try {
        const result = await requestBookingPayment(selectedBooking.id, detailPaymentChoice);
        setSelectedBooking((current: any) => ({ ...current, paymentStatus: 'pending' }));
        setPaymentActionMessage(result.emailSent
          ? 'Payment options sent to the customer.'
          : 'Payment links were created, but the email could not be sent.');
      } catch (error: any) {
        setBookingActionError(error.message || 'The payment request could not be sent.');
        setConfirmingBooking(false);
        return;
      }
    }
    setConfirmingBooking(false);
  };

  if (showCreateBooking) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-lg mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2">
                <NotificationBell />
                <RightMenu />
              </div>
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

        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
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
                      placeholder="Search customers..." 
                      className="pl-10 rounded-xl border-sage/20"
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                    />
                  </div>

                  {hasCustomerSearch && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCats([]);
                          setSelectedRoom(null);
                          setRoomAssignments({});
                          setStep(2);
                        }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedCustomer?.id === customer.id
                            ? 'border-sage bg-sage/5'
                            : 'border-sage/10 hover:border-sage/30 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold" style={{ color: '#2d3e2f' }}>
                              {customer.name}
                            </div>
                            <div className="text-sm" style={{ color: '#6b7a6d' }}>
                              {customer.email} • {customer.phone}
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
                    {filteredCustomers.length === 0 && (
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
                      onClick={() => setStep(3)}
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
                      <a href="/rooms/room-management" className="text-sm underline" style={{ color: '#C46A3A' }}>
                        Go to Room Management →
                      </a>
                    </div>
                  )}

                  {roomArrangement === 'shared' && roomTypes.map((room) => {
                    const roomIsOccupied = occupiedRoomIds.has(room.id);
                    const roomFits = room.capacity >= cats.length;
                    const isAvailable = !roomIsOccupied && roomFits;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full rounded-xl border-2 p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-55 ${
                          selectedRoom?.id === room.id
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
                                {roomIsOccupied ? 'Unavailable for these dates' : roomFits ? 'Available' : `Fits up to ${room.capacity} cats`}
                              </Badge>
                              <span className="font-bold text-sage">${room.pricePerDay}/cat/day</span>
                            </div>
                          </div>
                          {selectedRoom?.id === room.id && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {roomArrangement === 'shared' && roomTypes.length > 0 && !roomTypes.some((room) => !occupiedRoomIds.has(room.id) && room.capacity >= cats.length) && (
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
                            .map(([, room]) => room?.id)
                            .filter(Boolean)
                        );
                        return (
                          <label key={cat.id} className="block rounded-xl border border-sage/15 bg-white p-4">
                            <span className="mb-2 flex items-center gap-2 font-semibold" style={{ color: '#2d3e2f' }}>
                              <Cat className="h-4 w-4 text-sage" /> {cat.name}'s room
                            </span>
                            <select
                              aria-label={`Room for ${cat.name}`}
                              value={roomAssignments[cat.id]?.id ?? ''}
                              onChange={(event) => {
                                const room = roomTypes.find((candidate) => candidate.id === event.target.value);
                                setRoomAssignments((current) => ({ ...current, [cat.id]: room }));
                              }}
                              className="h-11 w-full rounded-xl border border-sage/20 bg-white px-3 text-sm"
                            >
                              <option value="">Select an available room</option>
                              {availableRoomTypes.map((room) => (
                                <option key={room.id} value={room.id} disabled={usedByOtherCats.has(room.id)}>
                                  {room.name} — ${room.pricePerDay}/day
                                </option>
                              ))}
                            </select>
                          </label>
                        );
                      })}
                      {availableRoomTypes.length < cats.length && (
                        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          There are not enough separate rooms available for every selected cat on these dates.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(3)}
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
                        <p className="font-medium" style={{ color: '#2d3e2f' }}>{selectedRoom?.name}</p>
                        <p className="text-sm" style={{ color: '#6b7a6d' }}>${selectedRoom?.pricePerDay} per cat per day</p>
                      </>
                    ) : (
                      <ul className="space-y-1 text-sm" style={{ color: '#2d3e2f' }}>
                        {cats.map((cat) => (
                          <li key={cat.id}>• {cat.name}: {roomAssignments[cat.id]?.name} (${roomAssignments[cat.id]?.pricePerDay}/day)</li>
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
                    <p className="text-3xl font-bold text-sage">
                      ${calculateTotal().toFixed(2)}
                    </p>
                    <p className="text-sm mt-1" style={{ color: '#6b7a6d' }}>
                      {roomArrangement === 'shared'
                        ? `${cats.length} cat${cats.length !== 1 ? 's' : ''} × ${calculateDays()} days × $${selectedRoom?.pricePerDay}`
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
                      className="flex-1 rounded-xl text-white"
                      style={{ backgroundColor: '#7DAF7B' }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirm Booking
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
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Bookings
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>All reservations</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <RightMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
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

        {/* Filter Tabs */}
        <Card className="rounded-3xl border-sage/10">
          <CardContent className="p-2">
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('latest')}
                variant={viewMode === 'latest' ? 'default' : 'ghost'}
                className={`flex-1 rounded-xl ${
                  viewMode === 'latest' 
                    ? 'text-white' 
                    : 'text-sage'
                }`}
                style={viewMode === 'latest' ? { backgroundColor: '#2d3e2f' } : {}}
              >
                Latest Bookings
              </Button>
              <Button
                onClick={() => setViewMode('all')}
                variant={viewMode === 'all' ? 'default' : 'ghost'}
                className={`flex-1 rounded-xl ${
                  viewMode === 'all' 
                    ? 'text-white' 
                    : 'text-sage'
                }`}
                style={viewMode === 'all' ? { backgroundColor: '#2d3e2f' } : {}}
              >
                All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sort Controls */}
        <Card className="rounded-3xl border-sage/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2" style={{ color: '#6b7a6d' }}>
                Sort by:
              </span>
              <Button
                onClick={() => handleSort('arrival')}
                variant="outline"
                size="sm"
                className="rounded-xl border-sage/20 text-xs"
              >
                Arrival {getSortIcon('arrival')}
              </Button>
              <Button
                onClick={() => handleSort('departure')}
                variant="outline"
                size="sm"
                className="rounded-xl border-sage/20 text-xs"
              >
                Departure {getSortIcon('departure')}
              </Button>
              <Button
                onClick={() => handleSort('received')}
                variant="outline"
                size="sm"
                className="rounded-xl border-sage/20 text-xs"
              >
                Received {getSortIcon('received')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {bookingsLoading && (
          <Card className="rounded-3xl border-sage/10">
            <CardContent className="p-8 text-center">
              <p className="text-sm" style={{ color: '#6b7a6d' }}>Loading bookings...</p>
            </CardContent>
          </Card>
        )}

        {/* Bookings List */}
        {!bookingsLoading && <div className="space-y-3">
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

        {/* Empty State */}
        {!bookingsLoading && displayedBookings.length === 0 && (
          <Card className="rounded-3xl border-sage/10">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-sage/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2d3e2f' }}>
                {viewMode === 'latest' ? 'No recent bookings' : 'No bookings yet'}
              </h3>
              <p className="text-sm mb-6" style={{ color: '#6b7a6d' }}>
                {viewMode === 'latest' 
                  ? 'No bookings received in the last 7 days' 
                  : 'Create your first booking to get started'
                }
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
      <Sheet open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <SheetContent side="right" className="h-dvh w-screen max-w-none gap-0 overflow-hidden border-0 p-0 sm:max-w-none">
          <SheetHeader className="shrink-0 border-b border-sage/10 bg-white px-4 py-4 pr-12 text-left">
            <SheetTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
              Booking Details
            </SheetTitle>
            <SheetDescription>
              Complete booking information
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#F6F4EF] p-4 pb-8">
              {/* Customer Info */}
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      Customer Information
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Name</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.customerName}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Email</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.customerEmail}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Phone</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.customerPhone}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cats */}
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Cat className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      Cats ({selectedBooking.catNames.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.catNames.map((cat: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-sm px-3 py-1">
                        🐱 {cat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Booking Dates */}
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      Booking Dates
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      • Check-in: {format(new Date(selectedBooking.checkIn), 'EEE, d MMM yyyy')}
                      {selectedBooking.checkInTime ? ` at ${formatBookingTime(selectedBooking.checkInTime)}` : ''}
                    </p>
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      • Check-out: {format(new Date(selectedBooking.checkOut), 'EEE, d MMM yyyy')}
                      {selectedBooking.checkOutTime ? ` at ${formatBookingTime(selectedBooking.checkOutTime)}` : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Days</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.days} days
                      </p>
                      <p className="text-xs" style={{ color: '#6b7a6d' }}>
                        Arrival and departure days included
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Received</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {format(new Date(selectedBooking.receivedDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Info */}
              <Card className="rounded-2xl border-sage/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      Accommodation
                    </h3>
                  </div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sage">
                    {selectedBooking.roomArrangement === 'separate' ? 'Own room each' : 'Shared room'}
                  </p>
                  {selectedBooking.roomAssignments.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {selectedBooking.roomAssignments.map((assignment: any) => (
                        <li key={assignment.catId} className="rounded-lg bg-[#F6F4EF] px-3 py-2">
                          <span className="font-semibold" style={{ color: '#2d3e2f' }}>{assignment.catName}</span>
                          <span style={{ color: '#6b7a6d' }}> — {assignment.roomName}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>{selectedBooking.roomType}</p>
                      <p style={{ color: '#6b7a6d' }}>{selectedBooking.roomNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Special Requirements */}
              {selectedBooking.specialRequirements && (
                <Card className="rounded-2xl border-sage/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-sage" />
                      <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                        Special Requirements
                      </h3>
                    </div>
                    <p className="text-sm" style={{ color: '#2d3e2f' }}>
                      {selectedBooking.specialRequirements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Info */}
              <Card className="rounded-2xl border-sage/10 bg-gradient-to-br from-sage/5 to-sage-light/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-sage" />
                    <h3 className="font-semibold" style={{ color: '#2d3e2f' }}>
                      Payment
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm" style={{ color: '#6b7a6d' }}>Total Amount</p>
                      <p className="text-3xl font-bold text-sage">
                        ${selectedBooking.total}
                      </p>
                    </div>
                    <Badge 
                      className={
                        selectedBooking.paymentStatus === 'paid' 
                          ? 'bg-sage/10 text-sage border-sage/20' 
                          : selectedBooking.paymentStatus === 'pending'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-rose/10 text-rose border-rose/20'
                      }
                    >
                      {selectedBooking.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#6b7a6d' }}>
                    Status: {selectedBooking.status}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-sage/10">
                <CardContent className="space-y-3 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={detailRequestPayment}
                      onChange={(event) => setDetailRequestPayment(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-sage/30 accent-[#C46A3A]"
                    />
                    <span>
                      <span className="block font-semibold" style={{ color: '#2d3e2f' }}>Request payment from customer</span>
                      <span className="block text-xs" style={{ color: '#6b7a6d' }}>
                        Generate secure Stripe Checkout links and email them to the customer.
                      </span>
                    </span>
                  </label>

                  {detailRequestPayment && catteryPaymentStatus.connected && (
                    <div className="space-y-2 rounded-xl bg-[#F6F4EF] p-3">
                      {([
                        ['deposit', 'Deposit only'],
                        ['full', 'Full balance only'],
                        ['both', 'Offer deposit or full payment'],
                      ] as const).map(([value, label]) => (
                        <label key={value} className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: '#2d3e2f' }}>
                          <input
                            type="radio"
                            name="detail-payment-choice"
                            value={value}
                            checked={detailPaymentChoice === value}
                            onChange={() => setDetailPaymentChoice(value)}
                            className="accent-[#C46A3A]"
                          />
                          {label}{value === 'deposit' || value === 'both' ? ' (uses the cattery deposit setting)' : ''}
                        </label>
                      ))}
                    </div>
                  )}

                  {detailRequestPayment && !catteryPaymentStatus.connected && (
                    <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      Connect this cattery's Stripe keys in <Link to="/staff-dashboard/payment" className="font-semibold underline">Payment Setup</Link> before requesting payment.
                    </p>
                  )}
                </CardContent>
              </Card>

              {bookingActionError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {bookingActionError}
                </p>
              )}
              {paymentActionMessage && (
                <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                  {paymentActionMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="sticky bottom-0 -mx-4 -mb-8 mt-4 grid grid-cols-2 gap-3 border-t border-sage/10 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,17,40,0.08)]">
                <Button 
                  variant="outline" 
                  className="rounded-xl border-sage/20"
                  onClick={() => setShowBookingDetails(false)}
                >
                  Close
                </Button>
                <Button 
                  type="button"
                  disabled={
                    confirmingBooking
                    || (selectedBooking.status === 'confirmed' && !detailRequestPayment)
                    || (detailRequestPayment && !catteryPaymentStatus.connected)
                  }
                  onClick={() => void handleConfirmSelectedBooking()}
                  className="rounded-xl text-white disabled:bg-sage/50"
                  style={{ backgroundColor: '#7DAF7B' }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {confirmingBooking
                    ? 'Working…'
                    : detailRequestPayment
                      ? selectedBooking.status === 'confirmed' ? 'Send Payment Request' : 'Confirm & Request Payment'
                      : selectedBooking.status === 'confirmed' ? 'Confirmed' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Removed BottomNav component */}
    </div>
  );
}
