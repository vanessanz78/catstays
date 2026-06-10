import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
import { format, addDays, differenceInDays } from 'date-fns';
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
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');

  const { cattery } = useAuth();
  const { bookings: rawBookings, loading: bookingsLoading, createBooking } = useBookings();
  const { customers: rawCustomers } = useCustomers();
  const { rooms: rawRooms } = useRooms();
  const [customerSearch, setCustomerSearch] = useState('');

  useEffect(() => {
    setShowCreateBooking(isCreating);
  }, [isCreating]);

  // Map real customers to UI shape
  const customers = rawCustomers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || '',
    cats: (c as any).cats?.map((cat: any) => cat.name) || [],
  }));

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Real rooms from Supabase
  const roomTypes = rawRooms
    .filter(r => r.is_active)
    .map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      pricePerDay: r.price_per_night,
      available: r.capacity,
      total: r.capacity,
      description: r.description || r.amenities.slice(0, 2).join(' · '),
      color: 'sage',
    }));

  // Map real Supabase bookings to UI shape
  const bookings = rawBookings.map(b => {
    const nights = differenceInDays(new Date(b.check_out), new Date(b.check_in));
    return {
      id: b.id,
      customerName: b.customer?.name || 'Unknown',
      customerEmail: b.customer?.email || '',
      customerPhone: b.customer?.phone || '',
      catNames: b.booking_cats.map(bc => bc.cat.name),
      checkIn: b.check_in,
      checkOut: b.check_out,
      roomType: b.room?.type || 'Room',
      roomNumber: b.room?.name || '',
      status: b.status,
      paymentStatus: b.payment_status,
      total: b.total_amount || 0,
      nights,
      receivedDate: b.created_at,
      specialRequirements: b.notes || '',
    };
  });

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
    setShowBookingDetails(true);
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !selectedRoom) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights * selectedRoom.pricePerDay * cats.length;
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  const handleCreateBooking = async () => {
    if (!selectedCustomer || !checkIn || !checkOut || !selectedRoom) return;

    const { data, error } = await createBooking({
      customer_id: selectedCustomer.id,
      room_id: String(selectedRoom.id),
      check_in: checkIn,
      check_out: checkOut,
      total_amount: calculateTotal(),
      payment_status: paymentStatus,
      notes: specialRequirements || undefined,
    });

    if (error) {
      console.error('Failed to create booking:', error);
      return;
    }

    if (selectedCustomer.email && cattery?.name) {
      sendBookingConfirmation({
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        catteryName: cattery.name,
        catName: cats[0]?.name,
        roomName: selectedRoom.name,
        checkIn: format(new Date(checkIn), 'd MMM yyyy'),
        checkOut: format(new Date(checkOut), 'd MMM yyyy'),
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
    setSelectedRoom(null);
    setSpecialRequirements('');
    setPaymentStatus('unpaid');
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
                  <p className="text-sm" style={{ color: '#6b7a6d' }}>Step {step} of 4</p>
                </div>
              </div>
              <RightMenu />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-1 bg-sage/10">
            <div 
              className="h-full bg-sage transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
          {/* Step 1: Select Customer */}
          {step === 1 && (
            <div className="space-y-4">
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
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

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCats(customer.cats.map(name => ({ name, age: '', breed: '', dietary: '' })));
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
                              {customer.cats.map((cat, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  🐱 {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-sage" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
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
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: '#2d3e2f' }}>
                      Check-in Date
                    </label>
                    <Input 
                      type="date" 
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="rounded-xl border-sage/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: '#2d3e2f' }}>
                      Check-out Date
                    </label>
                    <Input 
                      type="date" 
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="rounded-xl border-sage/20"
                    />
                  </div>

                  {checkIn && checkOut && (
                    <div className="p-4 rounded-xl bg-sage/5 border border-sage/20">
                      <div className="flex items-center gap-2 text-sage">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">
                          {calculateNights()} nights
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: '#6b7a6d' }}>
                        {format(new Date(checkIn), 'MMM dd, yyyy')} → {format(new Date(checkOut), 'MMM dd, yyyy')}
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
                      disabled={!checkIn || !checkOut}
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

          {/* Step 3: Select Room Type */}
          {step === 3 && (
            <div className="space-y-4">
              <Card className="rounded-3xl border-sage/10">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
                    Choose Room Type
                  </CardTitle>
                  <CardDescription>
                    Booking for {cats.length} cat{cats.length !== 1 ? 's' : ''} • {calculateNights()} nights
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  {roomTypes.map((room) => (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedRoom?.id === room.id
                          ? 'border-sage bg-sage/5'
                          : 'border-sage/10 hover:border-sage/30 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Home className="w-5 h-5 text-sage" />
                            <span className="font-semibold" style={{ color: '#2d3e2f' }}>
                              {room.name}
                            </span>
                          </div>
                          <p className="text-sm mb-2" style={{ color: '#6b7a6d' }}>
                            {room.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={room.available > 5 ? "outline" : "destructive"}
                              className="text-xs"
                            >
                              {room.available} / {room.total} available
                            </Badge>
                            <span className="text-lg font-bold text-sage">
                              ${room.pricePerDay}/night
                            </span>
                          </div>
                        </div>
                        {selectedRoom?.id === room.id && (
                          <div className="w-6 h-6 rounded-full bg-sage flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}

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
                      disabled={!selectedRoom}
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

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
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
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {format(new Date(checkIn), 'MMM dd')} - {format(new Date(checkOut), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm" style={{ color: '#6b7a6d' }}>
                      {calculateNights()} nights
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
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {selectedRoom?.name}
                    </p>
                    <p className="text-sm" style={{ color: '#6b7a6d' }}>
                      ${selectedRoom?.pricePerDay} per cat per night
                    </p>
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

                  {/* Payment Status */}
                  <div>
                    <label className="text-sm font-medium mb-2 block" style={{ color: '#2d3e2f' }}>
                      Payment Status
                    </label>
                    <select 
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full rounded-xl border border-sage/20 p-3 bg-white"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                    </select>
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
                      {cats.length} cat{cats.length !== 1 ? 's' : ''} × {calculateNights()} nights × ${selectedRoom?.pricePerDay}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button 
                      variant="outline"
                      onClick={() => setStep(3)}
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
            <RightMenu />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* New Booking Button */}
        <Link to="/site/booking-flow">
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
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#6b7a6d' }}>Check-out</p>
                    <p className="font-medium" style={{ color: '#2d3e2f' }}>
                      {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                    </p>
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
        <SheetContent side="bottom" className="max-w-lg mx-auto rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-2xl font-serif" style={{ color: '#2d3e2f' }}>
              Booking Details
            </SheetTitle>
            <SheetDescription>
              Complete booking information
            </SheetDescription>
          </SheetHeader>

          {selectedBooking && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pb-6">
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
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Check-in</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {format(new Date(selectedBooking.checkIn), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Check-out</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {format(new Date(selectedBooking.checkOut), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Nights</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.nights} nights
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Received</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {format(new Date(selectedBooking.receivedDate), 'MMM dd, yyyy')}
                      </p>
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
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Room Type</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        {selectedBooking.roomType}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: '#6b7a6d' }}>Room Number</span>
                      <p className="font-medium" style={{ color: '#2d3e2f' }}>
                        Room {selectedBooking.roomNumber}
                      </p>
                    </div>
                  </div>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl border-sage/20"
                  onClick={() => setShowBookingDetails(false)}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 rounded-xl text-white"
                  style={{ backgroundColor: '#7DAF7B' }}
                >
                  Edit Booking
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
