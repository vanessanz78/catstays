import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, Plus, Calendar, Edit, Trash2, Clock, MapPin, DollarSign, FileText, X, Info, ShoppingCart, CheckCircle2, TrendingUp, Hotel, CreditCard, Tag, Camera, Mail, Share2, Download, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { BookingInvoice } from '../../components/BookingInvoice';
import { BookingStatement } from '../../components/BookingStatement';
import { PaymentCart } from '../../components/PaymentCart';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'per day' | 'per stay' | 'per week';
}

interface Booking {
  id: string;
  petName: string;
  checkIn: string;
  checkOut: string;
  room: string;
  nights: number;
  total: number;
  status: 'upcoming' | 'confirmed' | 'completed' | 'cancelled';
  services?: string[]; // Service IDs
  deposit: number;
  amountPaid: number;
}

interface CustomerBookingsViewProps {
  onBack: () => void;
  onCreateBooking?: () => void;
  primaryColor?: string;
  accentColor?: string;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessLogo?: string;
  externalBookings?: Booking[];
}

export function CustomerBookingsView({ 
  onBack, 
  onCreateBooking,
  primaryColor = '#0A1128', 
  accentColor = '#C46A3A',
  businessName = 'CatStays',
  businessAddress = '123 Main St, City, State 12345',
  businessPhone = '(555) 123-4567',
  businessEmail = 'hello@catstays.app',
  businessLogo,
  externalBookings
}: CustomerBookingsViewProps) {
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'history'>('upcoming');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  // Statement state
  const [showStatement, setShowStatement] = useState(false);
  const [selectedStatementBooking, setSelectedStatementBooking] = useState<Booking | null>(null);

  // Stats time period state
  const [statsPeriod, setStatsPeriod] = useState<'6months' | '1year' | 'lifetime'>('lifetime');

  // Service management state
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [currentBookingForServices, setCurrentBookingForServices] = useState<Booking | null>(null);

  // Payment cart state
  const [selectedBookingsForPayment, setSelectedBookingsForPayment] = useState<Set<string>>(new Set());
  const [showPaymentCart, setShowPaymentCart] = useState(false);

  // Postcard state
  const [showPostcard, setShowPostcard] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  // Mock cat updates
  const catUpdates = [
    {
      id: '1',
      title: 'Morning Playtime 🎾',
      time: 'Today at 9:30 AM',
      date: '2026-03-17',
      message: "I had the most pawsome morning chasing my favorite toy mouse! The staff here really knows how to keep me entertained. Can't wait for my afternoon nap in the sunny window spot! 😺",
      photo: 'https://images.unsplash.com/photo-1772621489868-7979e59ebb06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2F0JTIwcGxheWluZyUyMGluZG9vcnN8ZW58MXx8fHwxNzczNzc4Mzg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      petName: 'Whiskers',
      isNew: true
    },
    {
      id: '2',
      title: 'Breakfast Time 🍽️',
      time: 'Today at 7:00 AM',
      date: '2026-03-17',
      message: "Meow meow! Breakfast was delicious as always. I cleaned my bowl completely and even asked for seconds. Now time for my post-breakfast grooming session! 🐾",
      photo: 'https://images.unsplash.com/photo-1762006496712-30db6d0b5c30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBlYXRpbmclMjBmb29kJTIwYm93bHxlbnwxfHx8fDE3NzM3NzgzODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      petName: 'Whiskers',
      isNew: false
    },
    {
      id: '3',
      title: 'Sunny Window Nap ☀️',
      time: 'Today at 6:45 AM',
      date: '2026-03-17',
      message: "Found the best sunny spot for my morning nap! The warmth is purr-fect and I can watch the birds outside. Living my best life here! 😻",
      photo: 'https://images.unsplash.com/photo-1761915626453-fb60366929d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzbGVlcGluZyUyMHN1bm55JTIwd2luZG93fGVufDF8fHx8MTc3MzgwODg3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      petName: 'Mittens',
      isNew: true
    },
    {
      id: '4',
      title: 'Settling In 😴',
      time: 'Yesterday at 5:00 PM',
      date: '2026-03-16',
      message: "Just checked into my cozy suite! The bed is purr-fect and I've already found the best hiding spots. Looking forward to my vacation here! 😻",
      photo: 'https://images.unsplash.com/photo-1758709783982-cd3714821b47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzbGVlcGluZyUyMGNvenklMjBiZWR8ZW58MXx8fHwxNzczNzc4Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      petName: 'Mittens',
      isNew: false
    }
  ];

  // Available services (will pull from Step 4 booking setup in the future)
  const services: Service[] = [
    {
      id: '1',
      name: 'Daily Photo Updates',
      description: 'Receive daily photos and videos of your cat via email or SMS to stay connected during their stay.',
      price: 5,
      unit: 'per day'
    },
    {
      id: '2',
      name: 'Premium Food',
      description: 'Gourmet wet and dry food options tailored to your cat\'s dietary preferences and needs.',
      price: 10,
      unit: 'per day'
    },
    {
      id: '3',
      name: 'Playtime Session',
      description: 'One-on-one interactive play sessions with our trained staff to keep your cat active and entertained.',
      price: 8,
      unit: 'per day'
    },
    {
      id: '4',
      name: 'Grooming Service',
      description: 'Professional grooming including brushing, nail trimming, and ear cleaning.',
      price: 25,
      unit: 'per stay'
    },
    {
      id: '5',
      name: 'Medication Administration',
      description: 'Safe and reliable administration of medications as prescribed by your veterinarian.',
      price: 7,
      unit: 'per day'
    }
  ];

  // Mock bookings data (or use external bookings from parent)
  const [bookings, setBookings] = useState<Booking[]>(externalBookings || [
    {
      id: '1',
      petName: 'Whiskers',
      checkIn: '2026-03-20',
      checkOut: '2026-03-25',
      room: 'Deluxe Suite',
      nights: 5,
      total: 450,
      status: 'upcoming',
      services: ['1', '2'],
      deposit: 50,
      amountPaid: 0
    },
    {
      id: '2',
      petName: 'Mittens',
      checkIn: '2026-04-10',
      checkOut: '2026-04-15',
      room: 'Standard Room',
      nights: 5,
      total: 325,
      status: 'confirmed',
      services: ['1'],
      deposit: 50,
      amountPaid: 0
    },
    {
      id: '3',
      petName: 'Shadow',
      checkIn: '2026-02-10',
      checkOut: '2026-02-15',
      room: 'Premium Suite',
      nights: 5,
      total: 500,
      status: 'completed',
      deposit: 50,
      amountPaid: 500
    }
  ]);

  // Update bookings when external bookings change
  useEffect(() => {
    if (externalBookings) {
      setBookings(externalBookings);
    }
  }, [externalBookings]);

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'confirmed');
  const historyBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingBooking) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? editingBooking : b));
      setShowEditDialog(false);
      setEditingBooking(null);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      setBookings(bookings.map(b => 
        b.id === bookingToCancel.id ? { ...b, status: 'cancelled' as const } : b
      ));
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: Booking['status']) => {
    const statusStyles = {
      upcoming: { bg: `${accentColor}20`, color: accentColor, text: 'Upcoming' },
      confirmed: { bg: '#2D5F4F15', color: '#2D5F4F', text: 'Confirmed' },
      completed: { bg: `${primaryColor}10`, color: primaryColor, text: 'Completed' },
      cancelled: { bg: '#EF444415', color: '#EF4444', text: 'Cancelled' }
    };
    const style = statusStyles[status];
    return (
      <Badge style={{ backgroundColor: style.bg, color: style.color, borderColor: style.color }}>
        {style.text}
      </Badge>
    );
  };

  const handleViewInvoice = (booking: Booking) => {
    setSelectedInvoiceBooking(booking);
    setShowInvoice(true);
  };

  const handleViewServiceDetails = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
  };

  const handleRemoveService = (booking: Booking, serviceId: string) => {
    const updatedServices = booking.services?.filter(id => id !== serviceId) || [];
    setBookings(bookings.map(b => 
      b.id === booking.id ? { ...b, services: updatedServices } : b
    ));
  };

  const handleAddServiceClick = (booking: Booking) => {
    setCurrentBookingForServices(booking);
    setShowAddService(true);
  };

  const handleAddServiceToBooking = (serviceId: string) => {
    if (currentBookingForServices) {
      const currentServices = currentBookingForServices.services || [];
      if (!currentServices.includes(serviceId)) {
        setBookings(bookings.map(b =>
          b.id === currentBookingForServices.id
            ? { ...b, services: [...currentServices, serviceId] }
            : b
        ));
      }
    }
  };

  const generateInvoiceData = (booking: Booking) => {
    const roomRate = Math.round(booking.total / booking.nights / 1.15); // Calculate base rate before tax
    const subtotal = roomRate * booking.nights;
    const addOnsData = booking.services?.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      return service ? {
        name: service.name,
        price: service.price,
        quantity: booking.nights
      } : null;
    }).filter((service): service is { name: string, price: number, quantity: number } => !!service) || [];
    const addOnsTotal = addOnsData.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    const total = subtotal + addOnsTotal;
    const tax = total * 0.15;
    const grandTotal = total + tax;
    const deposit = 50;

    return {
      invoiceNumber: `INV-${booking.id.padStart(6, '0')}`,
      bookingId: booking.id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: booking.checkIn,
      
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessLogo,
      taxId: 'TAX-123456789',
      
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@email.com',
      customerPhone: '(555) 987-6543',
      customerAddress: '456 Oak Street, Springfield, IL 62701',
      
      petName: booking.petName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      room: booking.room,
      nights: booking.nights,
      
      roomRate,
      roomTotal: subtotal,
      addOns: addOnsData,
      subtotal: total,
      tax,
      total: grandTotal,
      deposit,
      amountDue: grandTotal - deposit,
      
      paymentStatus: booking.status === 'completed' ? 'paid' as const : 
                    booking.status === 'confirmed' || booking.status === 'upcoming' ? 'partial' as const : 
                    'pending' as const,
      paymentMethod: 'Credit Card'
    };
  };

  const generateStatementData = (booking: Booking) => {
    const invoiceData = generateInvoiceData(booking);
    return {
      statementNumber: `STMT-${booking.id.padStart(6, '0')}`,
      bookingId: booking.id,
      issueDate: new Date().toISOString().split('T')[0],
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessLogo,
      taxId: invoiceData.taxId,
      customerName: invoiceData.customerName,
      customerEmail: invoiceData.customerEmail,
      customerPhone: invoiceData.customerPhone,
      customerAddress: invoiceData.customerAddress,
      petName: booking.petName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      room: booking.room,
      nights: booking.nights,
      roomRate: invoiceData.roomRate,
      roomTotal: invoiceData.roomTotal,
      addOns: invoiceData.addOns,
      subtotal: invoiceData.subtotal,
      tax: invoiceData.tax,
      total: invoiceData.total,
      totalPaid: booking.amountPaid,
      paymentStatus: 'paid' as const,
      paymentMethod: 'Credit Card'
    };
  };

  const handleToggleBookingSelection = (bookingId: string) => {
    const newSelection = new Set(selectedBookingsForPayment);
    if (newSelection.has(bookingId)) {
      newSelection.delete(bookingId);
    } else {
      newSelection.add(bookingId);
    }
    setSelectedBookingsForPayment(newSelection);
  };

  const handleViewStatement = (booking: Booking) => {
    setSelectedStatementBooking(booking);
    setShowStatement(true);
  };

  const handleOpenPaymentCart = () => {
    setShowPaymentCart(true);
  };

  const handlePaymentComplete = (bookingIds: string[], paymentType: 'deposit' | 'full', amount: number) => {
    setBookings(bookings.map(booking => {
      if (bookingIds.includes(booking.id)) {
        const newAmountPaid = paymentType === 'deposit' 
          ? booking.amountPaid + Math.max(0, booking.deposit - booking.amountPaid)
          : booking.total;
        return { ...booking, amountPaid: newAmountPaid };
      }
      return booking;
    }));
    setSelectedBookingsForPayment(new Set());
  };

  const selectedBookingsForPaymentData = upcomingBookings.filter(b => selectedBookingsForPayment.has(b.id));

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          style={{ color: accentColor }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <Button 
          style={{ backgroundColor: accentColor, color: 'white' }}
          onClick={onCreateBooking}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Booking
        </Button>
      </div>

      {/* Quick Reference Stats */}
      <Card className="mb-6 border" style={{ borderColor: `${primaryColor}20` }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle style={{ color: primaryColor }}>Quick Stats</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={statsPeriod === '6months' ? 'default' : 'outline'}
                onClick={() => setStatsPeriod('6months')}
                style={statsPeriod === '6months' ? { backgroundColor: accentColor, color: 'white' } : { color: primaryColor }}
                className="text-xs h-7"
              >
                6 Months
              </Button>
              <Button
                size="sm"
                variant={statsPeriod === '1year' ? 'default' : 'outline'}
                onClick={() => setStatsPeriod('1year')}
                style={statsPeriod === '1year' ? { backgroundColor: accentColor, color: 'white' } : { color: primaryColor }}
                className="text-xs h-7"
              >
                1 Year
              </Button>
              <Button
                size="sm"
                variant={statsPeriod === 'lifetime' ? 'default' : 'outline'}
                onClick={() => setStatsPeriod('lifetime')}
                style={statsPeriod === 'lifetime' ? { backgroundColor: accentColor, color: 'white' } : { color: primaryColor }}
                className="text-xs h-7"
              >
                Lifetime
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Bookings */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${accentColor}08` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                  <Hotel className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: `${primaryColor}60` }}>
                  Bookings
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>

            {/* Total Days */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${primaryColor}05` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: `${primaryColor}60` }}>
                  Total Days
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                {bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.nights, 0)}
              </p>
            </div>

            {/* Total Paid */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#2D5F4F08' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2D5F4F15' }}>
                  <CreditCard className="w-4 h-4" style={{ color: '#2D5F4F' }} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: `${primaryColor}60` }}>
                  Total Paid
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                ${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amountPaid, 0)}
              </p>
            </div>

            {/* Total Discounts */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${accentColor}08` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}20` }}>
                  <Tag className="w-4 h-4" style={{ color: accentColor }} />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: `${primaryColor}60` }}>
                  Discounts
                </p>
              </div>
              <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                $0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: `${primaryColor}20` }}>
        <button
          onClick={() => setSelectedTab('upcoming')}
          className="px-4 py-2 font-medium border-b-2 transition"
          style={{
            borderColor: selectedTab === 'upcoming' ? accentColor : 'transparent',
            color: selectedTab === 'upcoming' ? accentColor : `${primaryColor}80`
          }}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className="px-4 py-2 font-medium border-b-2 transition"
          style={{
            borderColor: selectedTab === 'history' ? accentColor : 'transparent',
            color: selectedTab === 'history' ? accentColor : `${primaryColor}80`
          }}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          History ({historyBookings.length})
        </button>
      </div>

      {/* Payment Cart Sticky Button */}
      {selectedBookingsForPayment.size > 0 && selectedTab === 'upcoming' && (
        <div className="sticky top-4 z-20 mb-6">
          <div 
            className="p-4 rounded-xl shadow-lg border-2 flex items-center justify-between"
            style={{ 
              backgroundColor: 'white',
              borderColor: accentColor
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                {selectedBookingsForPayment.size}
              </div>
              <div>
                <p className="font-semibold" style={{ color: primaryColor }}>
                  {selectedBookingsForPayment.size} booking{selectedBookingsForPayment.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm" style={{ color: `${primaryColor}70` }}>
                  Ready to proceed with payment
                </p>
              </div>
            </div>
            <Button
              size="lg"
              onClick={handleOpenPaymentCart}
              style={{ backgroundColor: accentColor, color: 'white' }}
              className="gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {(selectedTab === 'upcoming' ? upcomingBookings : historyBookings).map(booking => (
          <Card key={booking.id} className="border" style={{ borderColor: `${primaryColor}20` }}>
            <CardContent className="p-0 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center gap-0">
                {/* Checkbox (if applicable) */}
                {(booking.status === 'upcoming' || booking.status === 'confirmed') && booking.amountPaid < booking.total && (
                  <div className="flex items-center justify-center p-4 md:pl-5 md:pr-4">
                    <Checkbox
                      checked={selectedBookingsForPayment.has(booking.id)}
                      onCheckedChange={() => handleToggleBookingSelection(booking.id)}
                      id={`select-${booking.id}`}
                      className="h-5 w-5"
                      style={{ borderColor: accentColor }}
                    />
                  </div>
                )}

                {/* Main content - horizontal layout */}
                <div className="flex-1 px-5 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Left: Pet name, dates, room */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold" style={{ color: primaryColor }}>
                          {booking.petName}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm" style={{ color: `${primaryColor}80` }}>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {booking.nights} day{booking.nights !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5" style={{ color: accentColor }} />
                          {booking.room}
                        </span>
                      </div>

                      {/* Services - compact inline display */}
                      {booking.services && booking.services.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          {booking.services.map((serviceId) => {
                            const service = services.find(s => s.id === serviceId);
                            return service ? (
                              <span
                                key={serviceId}
                                className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium transition-all hover:shadow-sm"
                                style={{ 
                                  backgroundColor: `${accentColor}12`,
                                  color: accentColor,
                                  border: `1px solid ${accentColor}30`
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleViewServiceDetails(service)}
                                  className="inline-flex items-center gap-1 px-1"
                                >
                                  <Info className="w-3 h-3" />
                                  {service.name}
                                </button>
                                {(booking.status === 'upcoming' || booking.status === 'confirmed') && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveService(booking, serviceId);
                                    }}
                                    className="ml-0.5 hover:bg-red-100 rounded-full p-0.5"
                                    title="Remove"
                                  >
                                    <X className="w-2.5 h-2.5 text-red-600" />
                                  </button>
                                )}
                              </span>
                            ) : null;
                          })}
                          {(booking.status === 'upcoming' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleAddServiceClick(booking)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-dashed transition-all hover:border-solid hover:shadow-sm"
                              style={{ 
                                borderColor: `${accentColor}50`, 
                                color: accentColor 
                              }}
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          )}
                        </div>
                      )}

                      {(!booking.services || booking.services.length === 0) && (booking.status === 'upcoming' || booking.status === 'confirmed') && (
                        <div className="mt-2.5">
                          <button
                            onClick={() => handleAddServiceClick(booking)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-dashed transition-all hover:border-solid hover:shadow-sm"
                            style={{ 
                              borderColor: `${accentColor}50`, 
                              color: accentColor 
                            }}
                          >
                            <Plus className="w-3 h-3" />
                            Add Services
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Center: Pricing */}
                    <div className="flex items-center gap-4 lg:border-l lg:pl-5" style={{ borderColor: `${primaryColor}10` }}>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wide mb-0.5" style={{ color: `${primaryColor}50` }}>
                          Total
                        </p>
                        <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                          ${booking.total}
                        </p>
                      </div>
                      
                      {/* Payment status */}
                      <div className="min-w-[100px]">
                        {booking.amountPaid > 0 && booking.amountPaid < booking.total && (
                          <div className="text-right">
                            <Badge 
                              className="font-semibold text-xs mb-1"
                              style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: accentColor }}
                            >
                              ${booking.amountPaid} paid
                            </Badge>
                            <p className="text-xs font-medium" style={{ color: `${primaryColor}60` }}>
                              ${booking.total - booking.amountPaid} due
                            </p>
                          </div>
                        )}
                        {booking.amountPaid >= booking.total && (
                          <Badge 
                            className="font-semibold text-xs"
                            style={{ backgroundColor: '#2D5F4F15', color: '#2D5F4F', borderColor: '#2D5F4F' }}
                          >
                            ✓ Paid in Full
                          </Badge>
                        )}
                        {booking.amountPaid === 0 && (booking.status === 'upcoming' || booking.status === 'confirmed') && (
                          <Badge 
                            className="font-semibold text-xs"
                            style={{ backgroundColor: `${accentColor}15`, color: accentColor, borderColor: accentColor }}
                          >
                            Payment Due
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 lg:border-l lg:pl-5" style={{ borderColor: `${primaryColor}10` }}>
                      {(booking.status === 'upcoming' || booking.status === 'confirmed') && (
                        <>
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 hover:bg-transparent"
                            style={{ color: `${primaryColor}70` }}
                            onClick={() => handleEditBooking(booking)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2 hover:bg-transparent"
                            style={{ color: '#EF4444' }}
                            onClick={() => handleCancelBooking(booking)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold"
                            style={{ 
                              backgroundColor: accentColor,
                              color: 'white'
                            }}
                            onClick={() => handleViewInvoice(booking)}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Invoice
                          </Button>
                        </>
                      )}

                      {(booking.status === 'completed' || booking.status === 'cancelled') && (
                        <>
                          <Button 
                            size="sm"
                            className="h-8 px-3 text-xs font-semibold"
                            style={{ 
                              backgroundColor: accentColor,
                              color: 'white'
                            }}
                            onClick={() => handleViewStatement(booking)}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5" />
                            Statement
                          </Button>
                          {booking.status === 'completed' && (
                            <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded" style={{ color: '#2D5F4F' }}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Completed</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(selectedTab === 'upcoming' ? upcomingBookings : historyBookings).length === 0 && (
          <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: `${primaryColor}30` }} />
              <p className="text-lg mb-2" style={{ color: primaryColor }}>No {selectedTab} bookings</p>
              <p className="text-sm mb-4" style={{ color: `${primaryColor}70` }}>
                {selectedTab === 'upcoming' 
                  ? "You don't have any upcoming bookings yet."
                  : "You don't have any booking history yet."
                }
              </p>
              {selectedTab === 'upcoming' && (
                <Button 
                  style={{ backgroundColor: accentColor, color: 'white' }}
                  onClick={onCreateBooking}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Booking
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Booking Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Edit Booking</DialogTitle>
            <DialogDescription>
              Update your booking dates and special requests
            </DialogDescription>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label style={{ color: primaryColor }}>Check-in Date</Label>
                <Input
                  type="date"
                  value={editingBooking.checkIn}
                  onChange={(e) => setEditingBooking({ ...editingBooking, checkIn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: primaryColor }}>Check-out Date</Label>
                <Input
                  type="date"
                  value={editingBooking.checkOut}
                  onChange={(e) => setEditingBooking({ ...editingBooking, checkOut: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label style={{ color: primaryColor }}>Special Requests</Label>
                <Textarea
                  placeholder="Any special requirements for your pet..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: accentColor, color: 'white' }}
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Cancel Booking</DialogTitle>
            <DialogDescription>
              Review the cancellation policy before confirming
            </DialogDescription>
          </DialogHeader>
          {bookingToCancel && (
            <div className="space-y-4">
              <p style={{ color: `${primaryColor}90` }}>
                Are you sure you want to cancel the booking for <strong>{bookingToCancel.petName}</strong>?
              </p>
              <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2', borderColor: '#EF4444', border: '1px solid' }}>
                <p className="text-sm" style={{ color: '#EF4444' }}>
                  <strong>Cancellation Policy:</strong> Cancellations made more than 7 days before check-in receive a full refund. 
                  Cancellations within 7 days may incur a 50% charge.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: '#EF4444', color: 'white' }}
                  onClick={confirmCancelBooking}
                >
                  Yes, Cancel Booking
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                >
                  Keep Booking
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Invoice  */}
      {selectedInvoiceBooking && (
        <BookingInvoice
          invoice={generateInvoiceData(selectedInvoiceBooking)}
          primaryColor={primaryColor}
          accentColor={accentColor}
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
        />
      )}

      {/* Service Details Dialog */}
      <Dialog open={showServiceDetails} onOpenChange={setShowServiceDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Service Details</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1" style={{ color: primaryColor }}>
                    {selectedService.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" style={{ color: accentColor }} />
                    <span className="text-lg font-bold" style={{ color: accentColor }}>
                      ${selectedService.price}
                    </span>
                    <span className="text-sm" style={{ color: `${primaryColor}70` }}>
                      {selectedService.unit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: `${accentColor}05`, border: `1px solid ${accentColor}20` }}>
                <p className="text-sm" style={{ color: `${primaryColor}90` }}>
                  {selectedService.description}
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setShowServiceDetails(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: primaryColor }}>Add Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm" style={{ color: `${primaryColor}80` }}>
              Select services to add to your booking:
            </p>
            {services.map((service) => {
              const isAlreadyAdded = currentBookingForServices?.services?.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => {
                    if (!isAlreadyAdded) {
                      handleAddServiceToBooking(service.id);
                    }
                  }}
                  disabled={isAlreadyAdded}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
                  }`}
                  style={{
                    borderColor: isAlreadyAdded ? `${primaryColor}20` : `${accentColor}40`,
                    backgroundColor: isAlreadyAdded ? `${primaryColor}05` : 'white'
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: primaryColor }}>
                      {service.name}
                    </h4>
                    {isAlreadyAdded && (
                      <Badge style={{ backgroundColor: '#10B98120', color: '#10B981' }}>
                        Added
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: `${primaryColor}70` }}>
                    {service.description}
                  </p>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" style={{ color: accentColor }} />
                    <span className="font-bold" style={{ color: accentColor }}>
                      ${service.price}
                    </span>
                    <span className="text-sm" style={{ color: `${primaryColor}60` }}>
                      {service.unit}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1"
              style={{ backgroundColor: accentColor, color: 'white' }}
              onClick={() => setShowAddService(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Cart */}
      <PaymentCart
        open={showPaymentCart}
        onClose={() => setShowPaymentCart(false)}
        bookings={selectedBookingsForPaymentData}
        onPaymentComplete={handlePaymentComplete}
        primaryColor={primaryColor}
        accentColor={accentColor}
      />

      {/* Statement */}
      {selectedStatementBooking && (
        <BookingStatement
          statement={generateStatementData(selectedStatementBooking)}
          primaryColor={primaryColor}
          accentColor={accentColor}
          open={showStatement}
          onClose={() => setShowStatement(false)}
        />
      )}

      {/* Postcard Dialog - Same as Dashboard */}
      <Dialog open={showPostcard} onOpenChange={(open) => {
        setShowPostcard(open);
      }}>
        <DialogContent className="max-w-2xl p-0 overflow-visible [&>button]:hidden" aria-describedby="postcard-description">
          {selectedUpdate && (
            <div className="relative">
              {/* Hidden title for accessibility */}
              <DialogHeader className="sr-only">
                <DialogTitle>Postcard from {selectedUpdate.petName}</DialogTitle>
              </DialogHeader>
              <p id="postcard-description" className="sr-only">
                View a postcard-style update from your cat during their stay
              </p>
              
              {/* Postcard Design */}
              <div 
                className="p-8"
                style={{ 
                  backgroundColor: '#F8F7F5',
                  backgroundImage: `
                    repeating-linear-gradient(45deg, transparent, transparent 10px, ${primaryColor}03 10px, ${primaryColor}03 20px),
                    repeating-linear-gradient(-45deg, transparent, transparent 10px, ${accentColor}03 10px, ${accentColor}03 20px)
                  `
                }}
              >
                {/* Postcard Header */}
                <div className="text-center mb-6">
                  <h2 
                    className="text-3xl font-bold mb-2" 
                    style={{ 
                      color: primaryColor,
                      fontFamily: 'Playfair Display, serif'
                    }}
                  >
                    Greetings from {businessName || 'CatStays'}!
                  </h2>
                  <div className="w-16 h-1 mx-auto rounded-full" style={{ backgroundColor: accentColor }} />
                </div>

                {/* Photo */}
                <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                  <ImageWithFallback
                    src={selectedUpdate.photo}
                    alt={`${selectedUpdate.petName} enjoying their stay`}
                    className="w-full h-96 object-cover"
                  />
                </div>

                {/* Message */}
                <div className="mb-6 p-6 bg-white rounded-xl shadow-lg border" style={{ borderColor: `${primaryColor}15` }}>
                  <p className="text-lg italic leading-relaxed" style={{ color: primaryColor }}>
                    "{selectedUpdate.message}"
                  </p>
                  <p className="text-right mt-4 font-semibold" style={{ color: accentColor }}>
                    - Love, {selectedUpdate.petName} 🐾
                  </p>
                </div>

                {/* Cattery Info */}
                <div className="text-center mb-6">
                  <p className="text-sm" style={{ color: `${primaryColor}90` }}>
                    {selectedUpdate.petName} is enjoying their stay at{' '}
                    <a 
                      href={window.location.origin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                      style={{ color: accentColor }}
                    >
                      {businessName || 'CatStays'}
                    </a>
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowPostcard(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-10"
                style={{ color: primaryColor }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
