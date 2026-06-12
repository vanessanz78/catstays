import { useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Camera, User, LogOut, ArrowLeft, Plus, PawPrint, Heart, Calendar, Mail, X, Download, Facebook, Twitter, MessageCircle, Share2, Instagram } from 'lucide-react';
import { CustomerBookingsView } from './CustomerBookingsView';
import { CustomerProfileView } from './CustomerProfileView';
import { CustomerPetsView } from './CustomerPetsView';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { BookingFlowModal } from '../../components/BookingFlowModal';

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface CustomerDashboardProps {
  onBackToWebsite?: () => void;
  primaryColor?: string;
  accentColor?: string;
  onCreateBooking?: () => void;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessLogo?: string;
  previewDevice?: PreviewDevice;
}

export function CustomerDashboard({ 
  onBackToWebsite, 
  primaryColor = '#0A1128', 
  accentColor = '#C46A3A',
  onCreateBooking,
  businessName,
  businessAddress,
  businessPhone,
  businessEmail,
  businessLogo,
  previewDevice
}: CustomerDashboardProps = {}) {
  const navigate = useNavigate(); // FIXED: Hook must be called at top level
  const [currentView, setCurrentView] = useState<'home' | 'bookings' | 'profile' | 'pets' | 'updates'>('home');
  const isPreviewMobile = previewDevice === 'mobile';

  // Cat Updates state
  const [showPostcard, setShowPostcard] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Booking Flow Modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Bookings and Pets state
  const [bookings, setBookings] = useState<any[]>([]);
  const [userPets, setUserPets] = useState<any[]>([
    {
      id: '1',
      name: 'Whiskers',
      breed: 'Domestic Shorthair',
      age: 3,
      gender: 'male',
      color: 'Tabby',
      weight: 10,
      microchipId: '',
      vetName: '',
      vetPhone: '',
      medications: '',
      dietaryNeeds: '',
      specialNeeds: '',
      vaccinationDate: '2025-06-15',
      specialNotes: 'Loves playing with toy mice'
    },
    {
      id: '2',
      name: 'Mittens',
      breed: 'Persian',
      age: 5,
      gender: 'female',
      color: 'White',
      weight: 12,
      microchipId: '',
      vetName: '',
      vetPhone: '',
      medications: '',
      dietaryNeeds: '',
      specialNeeds: '',
      vaccinationDate: '2025-08-20',
      specialNotes: 'Prefers quiet spaces'
    }
  ]);
  
  // Ref for share menu click-outside detection
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showShareMenu]);

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleShare = async () => {
    if (!selectedUpdate) return;

    const shareData = {
      title: `Postcard from ${selectedUpdate.petName}`,
      text: `${selectedUpdate.message}\n\n- Love, ${selectedUpdate.petName}`,
      url: window.location.href
    };

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShowShareMenu(false);
      } catch (err) {
        // User cancelled share or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Desktop - show share menu
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleLogout = () => {
    if (onBackToWebsite) {
      onBackToWebsite();
    } else {
      navigate('/site'); // FIXED: Using hook variable instead of calling useNavigate
    }
  };

  // Get unique pet names from updates
  const getUniquePetNames = () => {
    const names = [...new Set(catUpdates.map(update => update.petName))];
    if (names.length === 1) {
      return names[0] + "'s";
    } else if (names.length === 2) {
      return names.join(' & ') + "'";
    } else {
      const lastPet = names.pop();
      return names.join(', ') + ' & ' + lastPet + "'";
    }
  };

  // Mock user profile for logged-in booking flow (uses live pets state)
  const mockUserProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 987-6543',
    address: '456 Oak Street, Springfield, IL 62701',
    cats: userPets
  };

  // Mock available rooms
  const mockAvailableRooms = [
    {
      id: '1',
      name: 'Deluxe Suite',
      price: 85,
      image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    },
    {
      id: '2',
      name: 'Premium Suite',
      price: 95,
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    },
    {
      id: '3',
      name: 'Standard Room',
      price: 65,
      image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'
    }
  ];

  // Mock services
  const mockServices = [
    { title: 'Daily Photo Updates', price: '$5', description: 'Receive daily photos via email or SMS' },
    { title: 'Premium Food', price: '$10', description: 'Gourmet wet and dry food options' },
    { title: 'Playtime Session', price: '$8', description: 'One-on-one interactive play sessions' },
    { title: 'Grooming Service', price: '$25', description: 'Professional grooming including brushing and nail trimming' }
  ];

  const dashboardCards = [
    {
      view: 'bookings',
      icon: Calendar,
      title: 'My Bookings',
      description: 'View and manage stays'
    },
    {
      view: 'pets',
      icon: PawPrint,
      title: 'My Pets',
      description: 'Manage pet profiles'
    },
    {
      view: 'profile',
      icon: User,
      title: 'My Profile',
      description: 'Update your details'
    }
  ] as const;

  // Default booking data (user can change in the modal)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getNextWeekDate = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);
    return nextWeek.toISOString().split('T')[0];
  };

  const handleBookingComplete = (bookingData: any) => {
    console.log('Booking completed:', bookingData);
    
    // Update pet profiles with any changes made during booking
    if (bookingData.updatedPets && bookingData.updatedPets.length > 0) {
      setUserPets(prevPets => {
        const updatedPetsMap = new Map(bookingData.updatedPets.map((pet: any) => [pet.id, pet]));
        return prevPets.map(pet => updatedPetsMap.get(pet.id) || pet);
      });
    }
    
    // Create new booking record
    const newBooking = {
      id: Date.now().toString(),
      petName: bookingData.selectedCatIds?.map((id: string) => {
        const pet = userPets.find(p => p.id === id);
        return pet?.name || '';
      }).join(', ') || 'Multiple Cats',
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      room: bookingData.room.name,
      nights: bookingData.nights,
      total: bookingData.pricing.total,
      status: 'upcoming',
      services: bookingData.selectedServices || [],
      deposit: bookingData.pricing.deposit,
      amountPaid: 0,
      dropOffTime: bookingData.dropOffTime,
      pickUpTime: bookingData.pickUpTime,
      numberOfCats: bookingData.numberOfCats,
      roomAssignment: bookingData.roomAssignment,
      comments: bookingData.bookingComments
    };
    
    // Add booking to list
    setBookings(prevBookings => [newBooking, ...prevBookings]);
    
    // Close modal and navigate to bookings
    setShowBookingModal(false);
    setTimeout(() => {
      setCurrentView('bookings');
    }, 500);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F5' }}>
      <header className="bg-white border-b" style={{ borderColor: `${primaryColor}20` }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToWebsite && (
              <Button
                onClick={onBackToWebsite}
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-opacity-10"
                style={{ color: accentColor }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Website</span>
              </Button>
            )}
            <h1 className="text-xl font-bold" style={{ color: primaryColor }}>
              {currentView === 'home' && 'My Dashboard'}
              {currentView === 'bookings' && 'My Bookings'}
              {currentView === 'profile' && 'My Profile'}
              {currentView === 'pets' && 'My Pets'}
              {currentView === 'updates' && 'Cat Updates'}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            style={{ color: primaryColor }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {currentView === 'home' && (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>Welcome back, Sarah!</h2>
            <p style={{ color: `${primaryColor}90` }}>Manage your bookings and view cat updates</p>
          </div>

          <div className={`${isPreviewMobile ? 'grid grid-cols-1 gap-3' : 'grid md:grid-cols-3 gap-4'} mb-8`}>
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.view}
                  className="hover:shadow-lg transition cursor-pointer border min-w-0"
                  style={{ borderColor: `${primaryColor}20` }}
                  onClick={() => setCurrentView(card.view)}
                >
                  <CardHeader className={isPreviewMobile ? 'flex flex-row items-center gap-3 px-4 py-4' : undefined}>
                    <Icon
                      className={isPreviewMobile ? 'w-7 h-7 flex-shrink-0' : 'w-8 h-8 mb-2'}
                      style={{ color: accentColor }}
                    />
                    <div className="min-w-0">
                      <CardTitle
                        className={isPreviewMobile ? 'text-lg leading-tight whitespace-normal' : undefined}
                        style={{ color: primaryColor }}
                      >
                        {card.title}
                      </CardTitle>
                      <CardDescription className={isPreviewMobile ? 'text-sm leading-snug' : undefined}>
                        {card.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="border mb-8" style={{ borderColor: `${primaryColor}20` }}>
            <CardHeader>
              <CardTitle style={{ color: primaryColor }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className={isPreviewMobile ? 'flex flex-col gap-3 px-4 pb-4' : 'flex flex-wrap gap-3'}>
              <Button 
                style={{ backgroundColor: accentColor, color: 'white' }}
                onClick={() => setShowBookingModal(true)}
                className={isPreviewMobile ? 'w-full justify-start' : undefined}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Booking
              </Button>
              <Button 
                variant="outline" 
                style={{ borderColor: accentColor, color: accentColor }}
                onClick={() => setCurrentView('updates')}
                className={isPreviewMobile ? 'w-full justify-start' : undefined}
              >
                <Camera className="w-4 h-4 mr-2" />
                View Cat Updates
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
            <CardHeader>
              <CardTitle style={{ color: primaryColor }}>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`${isPreviewMobile ? 'flex flex-col gap-3' : 'flex items-start gap-4'} p-3 rounded-lg`} style={{ backgroundColor: `${accentColor}10` }}>
                  <Camera className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ color: primaryColor }}>New photo from Whiskers!</p>
                    <p className="text-sm" style={{ color: `${primaryColor}70` }}>Morning playtime - Today at 9:30 AM</p>
                  </div>
                  <Badge className="w-fit" style={{ backgroundColor: `${accentColor}20`, color: accentColor, borderColor: accentColor }}>
                    <Heart className="w-3 h-3 mr-1" />
                    New
                  </Badge>
                </div>
                <div className={`${isPreviewMobile ? 'flex flex-col gap-3' : 'flex items-start gap-4'} p-3 rounded-lg`} style={{ backgroundColor: `${primaryColor}05` }}>
                  <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium" style={{ color: primaryColor }}>Upcoming booking reminder</p>
                    <p className="text-sm" style={{ color: `${primaryColor}70` }}>Whiskers' stay starts in 5 days</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      )}

      {currentView === 'bookings' && (
        <CustomerBookingsView
          onBack={() => setCurrentView('home')}
          onCreateBooking={() => setShowBookingModal(true)}
          primaryColor={primaryColor}
          accentColor={accentColor}
          businessName={businessName}
          businessAddress={businessAddress}
          businessPhone={businessPhone}
          businessEmail={businessEmail}
          businessLogo={businessLogo}
          externalBookings={bookings.length > 0 ? bookings : undefined}
          previewDevice={previewDevice}
        />
      )}

      {currentView === 'profile' && (
        <CustomerProfileView
          onBack={() => setCurrentView('home')}
          primaryColor={primaryColor}
          accentColor={accentColor}
          previewDevice={previewDevice}
        />
      )}

      {currentView === 'pets' && (
        <CustomerPetsView
          onBack={() => setCurrentView('home')}
          primaryColor={primaryColor}
          accentColor={accentColor}
          externalPets={userPets}
          onPetsUpdate={setUserPets}
          previewDevice={previewDevice}
        />
      )}

      {currentView === 'updates' && (
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => setCurrentView('home')} 
            className="mb-6"
            style={{ color: accentColor }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
            <CardHeader>
              <CardTitle style={{ color: primaryColor }}>{getUniquePetNames()} Journey</CardTitle>
              <CardDescription>
                Recent updates from your {catUpdates.map(u => u.petName).filter((v, i, a) => a.indexOf(v) === i).length === 1 ? "cat's" : "cats'"} stay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {catUpdates.map((update, index) => (
                  <button
                    key={update.id}
                    onClick={() => {
                      setSelectedUpdate(update);
                      setShowPostcard(true);
                      setShowShareMenu(false);
                    }}
                    className="w-full border rounded-lg p-4 text-left transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                    style={{ 
                      borderColor: `${primaryColor}20`,
                      opacity: index === 0 ? 1 : 0.75
                    }}
                  >
                    <div className={isPreviewMobile ? 'space-y-3' : 'flex items-start gap-4'}>
                      <div className={isPreviewMobile ? 'w-full aspect-[4/3] rounded-lg overflow-hidden shadow-md' : 'w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-md'}>
                        <ImageWithFallback
                          src={update.photo}
                          alt={update.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`${isPreviewMobile ? 'flex flex-wrap items-start justify-between gap-2' : 'flex items-start justify-between'} mb-2`}>
                          <div className="min-w-0">
                            <p className="font-semibold" style={{ color: primaryColor }}>{update.title}</p>
                            <p className="text-sm" style={{ color: `${primaryColor}70` }}>{update.time}</p>
                          </div>
                          {update.isNew && (
                            <Badge variant="outline" style={{ backgroundColor: `${accentColor}10`, color: accentColor, borderColor: accentColor }}>
                              <Heart className="w-3 h-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm italic" style={{ color: `${primaryColor}90` }}>
                          "{update.message}"
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Postcard Dialog */}
          <Dialog open={showPostcard} onOpenChange={(open) => {
            setShowPostcard(open);
            if (!open) setShowShareMenu(false);
          }}>
            <DialogContent className="max-w-2xl p-0 overflow-visible [&>button]:hidden" aria-describedby="postcard-description">
              {selectedUpdate && (
                <div className="relative">
                  {/* Hidden title for accessibility */}
                  <DialogHeader className="sr-only">
                    <DialogTitle>Postcard from {selectedUpdate.petName}</DialogTitle>
                  </DialogHeader>
                  <p id="postcard-description" className="sr-only">
                    View and share a postcard-style update from your cat during their stay
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
                        Postcard from {selectedUpdate.petName}
                      </h2>
                      <p className="text-sm" style={{ color: `${primaryColor}70` }}>
                        {formatDate(selectedUpdate.date)}
                      </p>
                    </div>

                    {/* Photo */}
                    <div className="relative mb-6 rounded-xl overflow-hidden shadow-2xl border-8 border-white">
                      <ImageWithFallback
                        src={selectedUpdate.photo}
                        alt={`Update from ${selectedUpdate.petName}`}
                        className="w-full aspect-[4/3] object-cover"
                      />
                    </div>

                    {/* Message */}
                    <div 
                      className="bg-white p-6 rounded-xl shadow-lg border-2 mb-4"
                      style={{ borderColor: `${accentColor}30` }}
                    >
                      <p 
                        className="text-lg leading-relaxed italic"
                        style={{ 
                          color: primaryColor,
                          fontFamily: 'Georgia, serif'
                        }}
                      >
                        "{selectedUpdate.message}"
                      </p>
                      <div className="mt-4 flex items-center justify-end gap-2">
                        <p className="text-sm font-semibold" style={{ color: accentColor }}>
                          Love, {selectedUpdate.petName} 🐾
                        </p>
                      </div>
                    </div>

                    {/* Cattery Footer */}
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
                          {businessName || 'Purrfect Paws Cattery'}
                        </a>
                      </p>
                    </div>

                    {/* Share Button with Dropdown */}
                    <div className="relative flex justify-center">
                      <Button
                        size="lg"
                        style={{ backgroundColor: accentColor, color: 'white' }}
                        className="gap-2 px-8"
                        onClick={handleShare}
                      >
                        <Share2 className="w-5 h-5" />
                        Share Postcard
                      </Button>

                      {/* Share Menu (Desktop Only) */}
                      {showShareMenu && !navigator.share && (
                        <div 
                          className="absolute bottom-full mb-2 bg-white rounded-xl shadow-2xl border-2 p-3 min-w-[320px] z-50"
                          style={{ borderColor: `${primaryColor}20` }}
                          ref={shareMenuRef}
                        >
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                const subject = `Postcard from ${selectedUpdate.petName}`;
                                const body = `${selectedUpdate.message}\n\n- Love, ${selectedUpdate.petName}\n\n${selectedUpdate.petName} is enjoying their stay at ${businessName || 'Purrfect Paws Cattery'}`;
                                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: primaryColor }}
                            >
                              <Mail className="w-5 h-5" />
                              <span className="text-xs font-medium">Email</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const text = `Check out this adorable update from ${selectedUpdate.petName} at ${businessName || 'Purrfect Paws Cattery'}! ${selectedUpdate.message}`;
                                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: '#1DA1F2' }}
                            >
                              <Twitter className="w-5 h-5" />
                              <span className="text-xs font-medium">Twitter</span>
                            </button>

                            <button
                              onClick={() => {
                                const url = window.location.href;
                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: '#4267B2' }}
                            >
                              <Facebook className="w-5 h-5" />
                              <span className="text-xs font-medium">Facebook</span>
                            </button>

                            <button
                              onClick={() => {
                                // Instagram doesn't have direct share URL, open in new tab
                                alert('To share on Instagram, download the image and upload it through the Instagram app!');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: '#E4405F' }}
                            >
                              <Instagram className="w-5 h-5" />
                              <span className="text-xs font-medium">Instagram</span>
                            </button>

                            <button
                              onClick={() => {
                                // TikTok doesn't have direct share URL
                                alert('To share on TikTok, download the image and upload it through the TikTok app!');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: '#000000' }}
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-xs font-medium">TikTok</span>
                            </button>

                            <button
                              onClick={() => {
                                const text = `Check out this adorable update from ${selectedUpdate.petName}! ${selectedUpdate.message}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              style={{ color: '#25D366' }}
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span className="text-xs font-medium">WhatsApp</span>
                            </button>

                            <button
                              onClick={() => {
                                alert('Download functionality would save this postcard as an image!');
                                setShowShareMenu(false);
                              }}
                              className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-50 transition-colors col-span-3"
                              style={{ color: accentColor }}
                            >
                              <Download className="w-5 h-5" />
                              <span className="text-xs font-medium">Download Image</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => {
                      setShowPostcard(false);
                      setShowShareMenu(false);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
                    style={{ color: primaryColor }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      )}

      {/* Booking Flow Modal */}
      {showBookingModal && (
        <BookingFlowModal
          room={mockAvailableRooms[0]}
          checkIn={getTomorrowDate()}
          checkOut={getNextWeekDate()}
          numberOfCats={mockUserProfile.cats.length}
          primaryColor={primaryColor}
          accentColor={accentColor}
          additionalServices={mockServices}
          onClose={() => setShowBookingModal(false)}
          onComplete={handleBookingComplete}
          isLoggedIn={true}
          userProfile={mockUserProfile}
          availableRooms={mockAvailableRooms}
        />
      )}
    </div>
  );
}
