import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { 
  Calendar, 
  Check, 
  X, 
  User, 
  PawPrint, 
  Home,
  Shield,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

interface BookingSystemProps {
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  businessName?: string;
  rooms?: Room[];
  onClose?: () => void;
  isPreview?: boolean;
}

interface Room {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  maxCats?: number;
}

interface Cat {
  id?: string;
  name: string;
  age?: string;
  breed?: string;
  notes?: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  cats: Cat[];
  hasReceivedIntroInsurance?: boolean;
}

type BookingStep = 
  | 'dates' 
  | 'customer-type' 
  | 'login' 
  | 'details';

export function BookingSystem({
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  backgroundColor = '#F8F7F5',
  businessName = 'Our Cattery',
  rooms = [],
  onClose,
  isPreview = false
}: BookingSystemProps) {
  // State management
  const [step, setStep] = useState<BookingStep>('dates');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  
  // Customer state
  const [isReturningCustomer, setIsReturningCustomer] = useState<boolean | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Booking details state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Cat state
  const [selectedCats, setSelectedCats] = useState<Cat[]>([]);
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCat, setNewCat] = useState<Cat>({ name: '', age: '', breed: '', notes: '' });
  
  // Room state
  const [selectedRooms, setSelectedRooms] = useState<{ roomId: string; quantity: number; cats: string[] }[]>([]);
  
  // Insurance state
  const [showInsurance, setShowInsurance] = useState(false);
  const [wantsInsurance, setWantsInsurance] = useState(false);
  const [insuranceChecks, setInsuranceChecks] = useState({
    vaccinations: false,
    noPreExisting: false,
    noExistingCover: false,
    ownerInformed: false,
    waitingPeriods: false,
    accurateInfo: false,
    finalConfirm: false
  });
  
  // Collapsed sections for returning customers
  const [collapsedSections, setCollapsedSections] = useState({
    personalInfo: true,
    cats: true,
    rooms: false
  });
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  // Calculate pricing
  const calculatePricing = () => {
    if (!checkIn || !checkOut) return { subtotal: 0, extras: 0, total: 0, nights: 0 };
    
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    let subtotal = 0;
    
    selectedRooms.forEach(({ roomId, quantity }) => {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        subtotal += room.price * quantity * nights;
      }
    });
    
    // Additional cats fee (example: $10 per additional cat per night)
    const totalCats = selectedCats.length;
    const baseRoomCapacity = selectedRooms.reduce((sum, { quantity }) => sum + quantity, 0);
    const additionalCats = Math.max(0, totalCats - baseRoomCapacity);
    const extras = additionalCats * 10 * nights;
    
    const total = subtotal + extras;
    
    return { subtotal, extras, total, nights };
  };

  const pricing = calculatePricing();

  // Check availability
  const handleCheckAvailability = async () => {
    if (!checkIn || !checkOut) return;
    
    setCheckingAvailability(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isPreview) {
      setIsAvailable(true);
      setCheckingAvailability(false);
      setStep('customer-type');
      return;
    }
    
    // TODO: Real availability check
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524/check-availability`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ checkIn, checkOut })
        }
      );
      
      const data = await response.json();
      setIsAvailable(data.available);
      setCheckingAvailability(false);
      
      if (data.available) {
        setStep('customer-type');
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setCheckingAvailability(false);
    }
  };

  // Handle login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isPreview) {
      // Mock returning customer data
      const mockProfile: CustomerProfile = {
        id: 'mock-1',
        name: 'Sarah Johnson',
        email: loginEmail,
        phone: '(555) 123-4567',
        address: '123 Main St, Springfield',
        cats: [
          { id: 'cat-1', name: 'Whiskers', age: '3 years', breed: 'Tabby' },
          { id: 'cat-2', name: 'Luna', age: '5 years', breed: 'Siamese' }
        ],
        hasReceivedIntroInsurance: false
      };
      
      setCustomerProfile(mockProfile);
      setIsLoggedIn(true);
      setCustomerName(mockProfile.name);
      setCustomerEmail(mockProfile.email);
      setCustomerPhone(mockProfile.phone);
      setCustomerAddress(mockProfile.address || '');
      setSelectedCats(mockProfile.cats);
      setShowInsurance(!mockProfile.hasReceivedIntroInsurance);
      setIsLoggingIn(false);
      setStep('details');
      return;
    }
    
    // TODO: Real login
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524/customer-login`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: loginEmail, password: loginPassword })
        }
      );
      
      if (!response.ok) {
        setLoginError('Invalid email or password');
        setIsLoggingIn(false);
        return;
      }
      
      const data = await response.json();
      setCustomerProfile(data.profile);
      setIsLoggedIn(true);
      setCustomerName(data.profile.name);
      setCustomerEmail(data.profile.email);
      setCustomerPhone(data.profile.phone);
      setCustomerAddress(data.profile.address || '');
      setSelectedCats(data.profile.cats || []);
      setShowInsurance(!data.profile.hasReceivedIntroInsurance);
      setIsLoggingIn(false);
      setStep('details');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  // Add new cat
  const handleAddCat = () => {
    if (!newCat.name) return;
    setSelectedCats([...selectedCats, { ...newCat, id: `cat-${Date.now()}` }]);
    setNewCat({ name: '', age: '', breed: '', notes: '' });
    setIsAddingNewCat(false);
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    // Validate insurance if selected
    if (wantsInsurance && showInsurance) {
      const allChecked = Object.values(insuranceChecks).every(v => v);
      if (!allChecked) {
        alert('Please confirm all insurance statements');
        setIsSubmitting(false);
        return;
      }
    }
    
    const bookingData = {
      checkIn,
      checkOut,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      },
      cats: selectedCats,
      rooms: selectedRooms,
      insurance: wantsInsurance && showInsurance ? insuranceChecks : null,
      pricing
    };
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (isPreview) {
      const ref = 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setBookingReference(ref);
      setBookingConfirmed(true);
      setIsSubmitting(false);
      return;
    }
    
    // TODO: Real booking submission
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524/create-booking`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData)
        }
      );
      
      const data = await response.json();
      setBookingReference(data.reference);
      setBookingConfirmed(true);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Booking submission error:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render date selection step
  const renderDateSelection = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-serif font-bold mb-3"
          style={{ color: primaryColor }}
        >
          Choose Your Stay
        </h2>
        <p className="text-gray-600">
          Select your check-in and check-out dates
        </p>
      </div>

      <Card className="p-8 shadow-lg border-0" style={{ backgroundColor: 'white' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <Label htmlFor="check-in" className="text-base font-medium">
              Check-in Date
            </Label>
            <Input
              id="check-in"
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-14 text-lg rounded-xl border-2"
              style={{ borderColor: checkIn ? accentColor : '#e5e7eb' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check-out" className="text-base font-medium">
              Check-out Date
            </Label>
            <Input
              id="check-out"
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="h-14 text-lg rounded-xl border-2"
              style={{ borderColor: checkOut ? accentColor : '#e5e7eb' }}
            />
          </div>
        </div>

        <Button
          onClick={handleCheckAvailability}
          disabled={!checkIn || !checkOut || checkingAvailability}
          className="w-full h-14 text-lg font-semibold rounded-xl text-white"
          style={{ 
            backgroundColor: (checkIn && checkOut) ? accentColor : '#9ca3af',
            opacity: checkingAvailability ? 0.7 : 1
          }}
        >
          {checkingAvailability ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Checking Availability...
            </>
          ) : (
            <>
              Check Availability
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </Card>
    </div>
  );

  // Render customer type selection
  const renderCustomerType = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-serif font-bold mb-3"
          style={{ color: primaryColor }}
        >
          Have you booked with us before?
        </h2>
        <p className="text-gray-600">
          This helps us make your booking experience faster
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className="p-8 cursor-pointer transition-all hover:shadow-xl border-3"
          style={{ 
            borderColor: isReturningCustomer === true ? accentColor : '#e5e7eb',
            backgroundColor: 'white'
          }}
          onClick={() => {
            setIsReturningCustomer(true);
            setStep('login');
          }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <User className="w-8 h-8" style={{ color: accentColor }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>
              Existing Customer
            </h3>
            <p className="text-gray-600 text-sm">
              Login to access your saved details and booking history
            </p>
          </div>
        </Card>

        <Card 
          className="p-8 cursor-pointer transition-all hover:shadow-xl border-3"
          style={{ 
            borderColor: isReturningCustomer === false ? accentColor : '#e5e7eb',
            backgroundColor: 'white'
          }}
          onClick={() => {
            setIsReturningCustomer(false);
            setStep('details');
          }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <PawPrint className="w-8 h-8" style={{ color: accentColor }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>
              New Customer
            </h3>
            <p className="text-gray-600 text-sm">
              Continue to fill in your details and complete your booking
            </p>
          </div>
        </Card>
      </div>
    </div>
  );

  // Render login step
  const renderLogin = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 
          className="text-3xl font-serif font-bold mb-3"
          style={{ color: primaryColor }}
        >
          Welcome Back
        </h2>
        <p className="text-gray-600">
          Login to continue your booking
        </p>
      </div>

      <Card className="p-8 shadow-lg border-0" style={{ backgroundColor: 'white' }}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email Address</Label>
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              className="h-12 rounded-xl"
            />
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {loginError}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!loginEmail || !loginPassword || isLoggingIn}
            className="w-full h-12 text-base font-semibold rounded-xl text-white"
            style={{ 
              backgroundColor: (loginEmail && loginPassword) ? accentColor : '#9ca3af' 
            }}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login & Continue'
            )}
          </Button>

          <div className="text-center pt-4">
            <button
              onClick={() => setStep('customer-type')}
              className="text-sm underline"
              style={{ color: accentColor }}
            >
              Back to customer type
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render booking details step
  const renderBookingDetails = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Left: Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Welcome message for returning customers */}
        {isLoggedIn && customerProfile && (
          <div 
            className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex items-start gap-4"
          >
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-green-900 text-lg">
                Welcome back, {customerProfile.name.split(' ')[0]}!
              </p>
              <p className="text-green-700 text-sm mt-1">
                We've filled everything in for you. Feel free to review and edit any details below.
              </p>
            </div>
          </div>
        )}

        {/* Dates Section */}
        <Card className="p-6 shadow-md border-0" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                Your Stay
              </h3>
            </div>
            <button
              className="text-sm underline"
              style={{ color: accentColor }}
              onClick={() => setStep('dates')}
            >
              Edit dates
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Check-in</p>
                <p className="font-semibold text-lg" style={{ color: primaryColor }}>
                  {format(new Date(checkIn), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Check-out</p>
                <p className="font-semibold text-lg" style={{ color: primaryColor }}>
                  {format(new Date(checkOut), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="text-center mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 shadow-md border-0" style={{ backgroundColor: 'white' }}>
          <button
            onClick={() => setCollapsedSections(prev => ({ ...prev, personalInfo: !prev.personalInfo }))}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                Personal Information
              </h3>
            </div>
            {isLoggedIn && (
              collapsedSections.personalInfo ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {(!isLoggedIn || !collapsedSections.personalInfo) && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="123 Main St, Springfield"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          )}

          {isLoggedIn && collapsedSections.personalInfo && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm"><span className="text-gray-600">Name:</span> <span className="font-medium">{customerName}</span></p>
              <p className="text-sm"><span className="text-gray-600">Email:</span> <span className="font-medium">{customerEmail}</span></p>
              <p className="text-sm"><span className="text-gray-600">Phone:</span> <span className="font-medium">{customerPhone}</span></p>
              {customerAddress && (
                <p className="text-sm"><span className="text-gray-600">Address:</span> <span className="font-medium">{customerAddress}</span></p>
              )}
            </div>
          )}
        </Card>

        {/* Cats Section */}
        <Card className="p-6 shadow-md border-0" style={{ backgroundColor: 'white' }}>
          <button
            onClick={() => setCollapsedSections(prev => ({ ...prev, cats: !prev.cats }))}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <PawPrint className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                Your Cats ({selectedCats.length})
              </h3>
            </div>
            {isLoggedIn && selectedCats.length > 0 && (
              collapsedSections.cats ? 
                <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {(!isLoggedIn || !collapsedSections.cats || selectedCats.length === 0) && (
            <div className="space-y-4">
              {selectedCats.map((cat, index) => (
                <div key={cat.id || index} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-base" style={{ color: primaryColor }}>
                        {cat.name}
                      </p>
                      {(cat.age || cat.breed) && (
                        <p className="text-sm text-gray-600 mt-1">
                          {[cat.age, cat.breed].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      {cat.notes && (
                        <p className="text-xs text-gray-500 mt-2">{cat.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedCats(selectedCats.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {isAddingNewCat ? (
                <div className="border-2 border-dashed rounded-xl p-4 space-y-3" style={{ borderColor: accentColor }}>
                  <Input
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder="Cat's name *"
                    className="h-10 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newCat.age}
                      onChange={(e) => setNewCat({ ...newCat, age: e.target.value })}
                      placeholder="Age"
                      className="h-10 rounded-lg"
                    />
                    <Input
                      value={newCat.breed}
                      onChange={(e) => setNewCat({ ...newCat, breed: e.target.value })}
                      placeholder="Breed"
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <Input
                    value={newCat.notes}
                    onChange={(e) => setNewCat({ ...newCat, notes: e.target.value })}
                    placeholder="Special notes (optional)"
                    className="h-10 rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddCat}
                      disabled={!newCat.name}
                      className="flex-1 h-10 rounded-lg text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      Add Cat
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNewCat(false);
                        setNewCat({ name: '', age: '', breed: '', notes: '' });
                      }}
                      className="h-10 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAddingNewCat(true)}
                  variant="outline"
                  className="w-full h-12 rounded-xl border-2 border-dashed"
                  style={{ borderColor: accentColor, color: accentColor }}
                >
                  + Add Cat
                </Button>
              )}
            </div>
          )}

          {isLoggedIn && collapsedSections.cats && selectedCats.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                {selectedCats.map(c => c.name).join(', ')}
              </p>
            </div>
          )}
        </Card>

        {/* Room Selection */}
        <Card className="p-6 shadow-md border-0" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5" style={{ color: accentColor }} />
            <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
              Select Room
            </h3>
          </div>

          <div className="space-y-3">
            {rooms.length > 0 ? rooms.map(room => (
              <div
                key={room.id}
                className="border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                style={{
                  borderColor: selectedRooms.some(r => r.roomId === room.id) ? accentColor : '#e5e7eb'
                }}
                onClick={() => {
                  const existing = selectedRooms.find(r => r.roomId === room.id);
                  if (existing) {
                    setSelectedRooms(selectedRooms.filter(r => r.roomId !== room.id));
                  } else {
                    setSelectedRooms([...selectedRooms, { roomId: room.id, quantity: 1, cats: [] }]);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  {room.image && (
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-base" style={{ color: primaryColor }}>
                      {room.name}
                    </h4>
                    {room.description && (
                      <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                    )}
                    <p className="font-semibold mt-2" style={{ color: accentColor }}>
                      ${room.price}/night
                    </p>
                  </div>
                  {selectedRooms.some(r => r.roomId === room.id) && (
                    <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: accentColor }} />
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>No rooms available for the selected dates</p>
              </div>
            )}
          </div>
        </Card>

        {/* Insurance Module */}
        {showInsurance && (
          <Card className="p-6 shadow-md border-0" style={{ backgroundColor: 'white' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5" style={{ color: accentColor }} />
              <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                Protect Your Pet's Stay
              </h3>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="font-medium text-blue-900 mb-2">
                Complimentary Introductory Insurance
              </p>
              <p className="text-sm text-blue-800 mb-3">
                Provided by PetCover Australia
              </p>
              <a
                href="https://www.petcover.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center gap-1 underline"
                style={{ color: accentColor }}
              >
                Learn more <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={wantsInsurance}
                  onChange={(e) => setWantsInsurance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"
                  style={{ backgroundColor: wantsInsurance ? accentColor : undefined }}
                ></div>
              </label>
              <span className="font-medium text-base">
                {wantsInsurance ? 'Yes, add insurance' : 'No, skip insurance'}
              </span>
            </div>

            {wantsInsurance && (
              <div className="mt-6 space-y-4 pt-6 border-t">
                <div className="mb-4">
                  <p className="font-semibold text-base mb-2" style={{ color: primaryColor }}>
                    This only takes 10 seconds. Please confirm the statements below:
                  </p>
                  <p className="text-xs text-gray-600">
                    All checkboxes must be ticked to proceed
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.vaccinations}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, vaccinations: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    Pet is up to date with vaccinations and healthy
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.noPreExisting}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, noPreExisting: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    No pre-existing conditions or medical history
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.noExistingCover}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, noExistingCover: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    No existing insurance or prior introductory cover
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.ownerInformed}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, ownerInformed: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    Owner has been informed of the cover
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.waitingPeriods}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, waitingPeriods: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    Waiting periods understood: 3 days injury, 7 days illness, 12 months brachycephalic airway, excess applies
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={insuranceChecks.accurateInfo}
                    onChange={(e) => setInsuranceChecks({ ...insuranceChecks, accurateInfo: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-2 flex-shrink-0"
                    style={{ accentColor }}
                  />
                  <span className="text-sm group-hover:text-gray-900">
                    Information provided is accurate and complete
                  </span>
                </label>

                <div className="pt-4 border-t">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={insuranceChecks.finalConfirm}
                      onChange={(e) => setInsuranceChecks({ ...insuranceChecks, finalConfirm: e.target.checked })}
                      className="mt-1 w-6 h-6 rounded border-2 flex-shrink-0"
                      style={{ accentColor }}
                    />
                    <span className="text-base font-semibold group-hover:text-gray-900" style={{ color: primaryColor }}>
                      I confirm all statements above are true
                    </span>
                  </label>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Submit Button */}
        <div className="sticky bottom-0 bg-white p-6 -mx-6 -mb-6 border-t lg:hidden">
          <Button
            onClick={handleSubmitBooking}
            disabled={isSubmitting || !customerName || !customerEmail || !customerPhone || selectedCats.length === 0 || selectedRooms.length === 0}
            className="w-full h-14 text-lg font-semibold rounded-xl text-white"
            style={{ 
              backgroundColor: (customerName && customerEmail && customerPhone && selectedCats.length > 0 && selectedRooms.length > 0) ? accentColor : '#9ca3af' 
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </Button>
        </div>
      </div>

      {/* Right: Pricing Summary (Sticky) */}
      <div className="lg:col-span-1">
        <div className="sticky top-6">
          <Card className="p-6 shadow-lg border-0" style={{ backgroundColor: 'white' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: primaryColor }}>
              Booking Summary
            </h3>

            <div className="space-y-4">
              {/* Dates */}
              <div className="pb-4 border-b">
                <p className="text-sm text-gray-600 mb-2">Dates</p>
                <p className="text-sm font-medium">
                  {format(new Date(checkIn), 'MMM d')} - {format(new Date(checkOut), 'MMM d, yyyy')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {pricing.nights} {pricing.nights === 1 ? 'night' : 'nights'}
                </p>
              </div>

              {/* Cats */}
              {selectedCats.length > 0 && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-2">Cats</p>
                  <p className="text-sm font-medium">
                    {selectedCats.map(c => c.name).join(', ')}
                  </p>
                </div>
              )}

              {/* Rooms */}
              {selectedRooms.length > 0 && (
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-2">Rooms</p>
                  {selectedRooms.map(({ roomId, quantity }) => {
                    const room = rooms.find(r => r.id === roomId);
                    return room ? (
                      <div key={roomId} className="text-sm">
                        <p className="font-medium">{room.name}</p>
                        <p className="text-xs text-gray-500">
                          ${room.price}/night × {pricing.nights} nights
                        </p>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Room subtotal</span>
                  <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
                </div>

                {pricing.extras > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Additional cats</span>
                    <span className="font-medium">${pricing.extras.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold pt-3 border-t" style={{ color: primaryColor }}>
                  <span>Total</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button (Desktop) */}
              <Button
                onClick={handleSubmitBooking}
                disabled={isSubmitting || !customerName || !customerEmail || !customerPhone || selectedCats.length === 0 || selectedRooms.length === 0}
                className="hidden lg:flex w-full h-12 text-base font-semibold rounded-xl text-white mt-6"
                style={{ 
                  backgroundColor: (customerName && customerEmail && customerPhone && selectedCats.length > 0 && selectedRooms.length > 0) ? accentColor : '#9ca3af' 
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  // Render confirmation
  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div 
        className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <Check className="w-10 h-10" style={{ color: accentColor }} />
      </div>

      <h2 className="text-3xl font-serif font-bold mb-4" style={{ color: primaryColor }}>
        Booking Request Submitted!
      </h2>

      <p className="text-gray-600 mb-8">
        Thank you for your booking request. We'll review it and send you a confirmation email shortly.
      </p>

      <Card className="p-6 shadow-lg border-0 text-left" style={{ backgroundColor: 'white' }}>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Booking Reference</span>
            <span className="font-mono font-semibold">{bookingReference}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{customerEmail}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Status</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              Pending Review
            </span>
          </div>
        </div>
      </Card>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <p className="text-sm text-blue-900">
          <strong>What's next?</strong>
        </p>
        <p className="text-sm text-blue-800 mt-2">
          We'll review your booking request and send you an email confirmation within 24 hours. 
          You'll receive an SMS notification once your booking is confirmed.
        </p>
      </div>

      {onClose && (
        <Button
          onClick={onClose}
          className="mt-8 h-12 px-8 rounded-xl font-semibold text-white"
          style={{ backgroundColor: accentColor }}
        >
          Close
        </Button>
      )}
    </div>
  );

  return (
    <div 
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-serif font-bold" style={{ color: primaryColor }}>
            {businessName}
          </h1>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {bookingConfirmed ? renderConfirmation() :
         step === 'dates' ? renderDateSelection() :
         step === 'customer-type' ? renderCustomerType() :
         step === 'login' ? renderLogin() :
         renderBookingDetails()}
      </div>
    </div>
  );
}
