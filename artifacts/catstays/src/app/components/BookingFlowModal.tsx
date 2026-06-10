import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { X, Check, ArrowLeft, ArrowRight, Calendar as CalendarIcon, CreditCard, Mail, Phone, User, Upload, Trash2, Clock, ShoppingBag, Loader2, FileText, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Home, AlertCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface BookingFlowModalProps {
  room: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  checkIn: string;
  checkOut: string;
  numberOfCats: number;
  primaryColor?: string;
  accentColor?: string;
  additionalServices?: Array<{ title: string; price: string; description: string }>;
  onClose: () => void;
  onComplete: (bookingData: any) => void;
  isLoggedIn?: boolean;
  userProfile?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    cats: Array<{
      id: string;
      name: string;
      breed: string;
      age?: number;
      gender?: 'male' | 'female';
      color?: string;
      weight?: number;
      microchipId?: string;
      vetName?: string;
      vetPhone?: string;
      medications?: string;
      dietaryNeeds?: string;
      specialNeeds?: string;
      vaccinationDate: string;
      vaccinationPhoto?: string;
      specialNotes?: string;
    }>;
  };
  availableRooms?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    capacity?: number;
    features?: string[];
  }>;
  multiCatDiscount?: boolean;
  discountPerCat?: number;
}

export function BookingFlowModal({
  room,
  checkIn,
  checkOut,
  numberOfCats,
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  additionalServices = [],
  onClose,
  onComplete,
  isLoggedIn = false,
  userProfile,
  availableRooms = [],
  multiCatDiscount = false,
  discountPerCat = 0
}: BookingFlowModalProps) {
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<'new' | 'existing'>('new');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  
  // Date state (editable)
  const [checkInDate, setCheckInDate] = useState<Date>(new Date(checkIn));
  const [checkOutDate, setCheckOutDate] = useState<Date>(new Date(checkOut));

  // Logged-in user specific state
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [newCats, setNewCats] = useState<Array<{ name: string; breed: string; vaccinationDate: string; specialNotes: string }>>([]);
  const [roomAssignment, setRoomAssignment] = useState<'shared' | 'separate'>('shared');
  const [selectedRooms, setSelectedRooms] = useState<{ [catId: string]: string }>({});
  const [bookingComments, setBookingComments] = useState('');
  const [expandedCats, setExpandedCats] = useState<{ [catId: string]: boolean }>({});
  const [editedCatDetails, setEditedCatDetails] = useState<{ [catId: string]: any }>({});
  const [vaccinationPhotos, setVaccinationPhotos] = useState<{ [catId: string]: File | null }>({});
  
  // New customer cat expansion state
  const [expandedNewCustomerCats, setExpandedNewCustomerCats] = useState<{ [index: number]: boolean }>({});
  
  const [formData, setFormData] = useState({
    // Step 1: Customer Details
    customerName: isLoggedIn && userProfile ? userProfile.name : '',
    customerEmail: isLoggedIn && userProfile ? userProfile.email : '',
    customerPhone: isLoggedIn && userProfile ? userProfile.phone : '',
    customerAddress: isLoggedIn && userProfile ? userProfile.address : '',
    loginEmail: '',
    loginPassword: '',
    
    // Step 2: Pet Details (enhanced)
    catNames: Array(numberOfCats).fill(''),
    catBreeds: Array(numberOfCats).fill(''),
    catVaccinationDates: Array(numberOfCats).fill(''),
    catVaccinationFiles: Array(numberOfCats).fill(null as File | null),
    specialNotes: '',
    
    // Step 3: Times & Services
    dropOffTime: '09:00',
    pickUpTime: '17:00',
    selectedServices: [] as number[],
    
    // Step 4: Review (auto-populated)
    
    // Step 5: Payment
    paymentMethod: 'card',
  });

  const nights = differenceInDays(checkOutDate, checkInDate);
  
  // Calculate pricing based on logged-in status
  const calculatePricing = () => {
    let roomTotal = 0;
    
    if (isLoggedIn) {
      const totalCats = selectedCatIds.length + newCats.length;
      if (roomAssignment === 'shared') {
        // Apply multi-cat discount if enabled
        if (multiCatDiscount && totalCats > 1) {
          const baseRoomCost = room.price * nights;
          const discount = (totalCats - 1) * discountPerCat * nights;
          roomTotal = Math.max(0, baseRoomCost - discount);
        } else {
          roomTotal = room.price * nights;
        }
      } else {
        // Separate rooms - each cat gets a room
        roomTotal = room.price * nights * totalCats;
      }
    } else {
      roomTotal = room.price * nights;
    }
    
    const servicesTotal = formData.selectedServices.reduce((total, serviceIndex) => {
      const service = additionalServices[serviceIndex];
      if (service) {
        const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
        return total + (price * nights);
      }
      return total;
    }, 0);
    
    const tax = (roomTotal + servicesTotal) * 0.15;
    const total = roomTotal + servicesTotal + tax;
    const deposit = 50;
    
    return { subtotal: roomTotal, servicesTotal, tax, total, deposit };
  };

  const pricing = calculatePricing();

  // Helper: Check if vaccination is out of date (> 1 year)
  const isVaccinationExpired = (vaccinationDate: string): boolean => {
    if (!vaccinationDate) return false;
    const vaccDate = new Date(vaccinationDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return vaccDate < oneYearAgo;
  };

  // Helper: Get cat details (with edits applied)
  const getCatDetails = (catId: string) => {
    const originalCat = userProfile?.cats.find(c => c.id === catId);
    if (!originalCat) return null;
    return editedCatDetails[catId] ? { ...originalCat, ...editedCatDetails[catId] } : originalCat;
  };

  // Helper: Update cat detail field
  const updateCatDetail = (catId: string, field: string, value: any) => {
    setEditedCatDetails(prev => ({
      ...prev,
      [catId]: {
        ...(prev[catId] || {}),
        [field]: value
      }
    }));
  };

  // Helper: Handle vaccination photo upload
  const handleVaccinationPhotoUpload = (catId: string, file: File | null) => {
    setVaccinationPhotos(prev => ({
      ...prev,
      [catId]: file
    }));
  };

  // Determine total steps based on logged-in status
  const totalSteps = isLoggedIn ? 5 : 6;

  // Function to handle login
  const handleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would call your auth API
    // For now, simulate successful login with mock data
    if (formData.loginEmail && formData.loginPassword) {
      setFormData({
        ...formData,
        customerName: 'Sarah Johnson',
        customerEmail: formData.loginEmail,
        customerPhone: '(555) 123-4567',
        customerAddress: '123 Main St, Anytown, USA',
      });
      setIsLoggingIn(false);
      setShowLogin(false);
      // Auto-advance to next step
      setTimeout(() => setStep(2), 500);
    } else {
      setLoginError('Invalid email or password');
      setIsLoggingIn(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete booking - save and prepare data
      handleCompleteBooking();
    }
  };

  const handleCompleteBooking = () => {
    // Prepare updated pet details
    const updatedPets: any[] = [];
    if (isLoggedIn && userProfile) {
      // Collect all edited pet details
      selectedCatIds.forEach(catId => {
        const originalCat = userProfile.cats.find(c => c.id === catId);
        if (originalCat) {
          const editedDetails = editedCatDetails[catId];
          const vaccinationPhoto = vaccinationPhotos[catId];
          
          // Merge original cat with edits
          const updatedCat = {
            ...originalCat,
            ...(editedDetails || {}),
            ...(vaccinationPhoto ? { vaccinationPhoto: URL.createObjectURL(vaccinationPhoto) } : {})
          };
          
          updatedPets.push(updatedCat);
        }
      });
    }

    // Build comprehensive booking data
    const bookingData = {
      ...formData,
      room,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      numberOfCats: isLoggedIn ? selectedCatIds.length + newCats.length : numberOfCats,
      pricing,
      nights,
    };

    if (isLoggedIn) {
      bookingData.selectedCatIds = selectedCatIds;
      bookingData.newCats = newCats;
      bookingData.roomAssignment = roomAssignment;
      bookingData.selectedRooms = selectedRooms;
      bookingData.bookingComments = bookingComments;
      bookingData.updatedPets = updatedPets; // Pass updated pet details
    }

    onComplete(bookingData);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateCatName = (index: number, value: string) => {
    const newNames = [...formData.catNames];
    newNames[index] = value;
    setFormData({ ...formData, catNames: newNames });
  };

  const updateCatBreed = (index: number, value: string) => {
    const newBreeds = [...formData.catBreeds];
    newBreeds[index] = value;
    setFormData({ ...formData, catBreeds: newBreeds });
  };

  const updateCatVaccinationDate = (index: number, value: string) => {
    const newDates = [...formData.catVaccinationDates];
    newDates[index] = value;
    setFormData({ ...formData, catVaccinationDates: newDates });
  };

  const handleFileUpload = (index: number, file: File | null) => {
    const newFiles = [...formData.catVaccinationFiles];
    newFiles[index] = file;
    setFormData({ ...formData, catVaccinationFiles: newFiles });
  };

  const removeFile = (index: number) => {
    const newFiles = [...formData.catVaccinationFiles];
    newFiles[index] = null;
    setFormData({ ...formData, catVaccinationFiles: newFiles });
  };

  const toggleService = (serviceIndex: number) => {
    const newServices = formData.selectedServices.includes(serviceIndex)
      ? formData.selectedServices.filter(i => i !== serviceIndex)
      : [...formData.selectedServices, serviceIndex];
    setFormData({ ...formData, selectedServices: newServices });
  };

  // Logged-in user functions
  const toggleCatSelection = (catId: string) => {
    setSelectedCatIds(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const addNewCat = () => {
    setNewCats(prev => [...prev, { name: '', breed: '', vaccinationDate: '', specialNotes: '' }]);
  };

  const removeNewCat = (index: number) => {
    setNewCats(prev => prev.filter((_, i) => i !== index));
  };

  const updateNewCat = (index: number, field: string, value: string) => {
    setNewCats(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleCatExpanded = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleNewCustomerCatExpanded = (index: number) => {
    setExpandedNewCustomerCats(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const selectRoomForCat = (catId: string, roomId: string) => {
    setSelectedRooms(prev => ({ ...prev, [catId]: roomId }));
  };

  // Generate 15-minute intervals for morning and afternoon only (6 AM - 6 PM)
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 18; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const isStepValid = () => {
    if (isLoggedIn) {
      // Logged-in user validation
      switch (step) {
        case 1:
          return formData.dropOffTime && formData.pickUpTime;
        case 2:
          const totalCats = selectedCatIds.length + newCats.length;
          const newCatsValid = newCats.every(cat => cat.name.trim() !== '');
          const roomsValid = roomAssignment === 'shared' || 
            (roomAssignment === 'separate' && 
             [...selectedCatIds, ...newCats.map((_, i) => `new-${i}`)].every(id => selectedRooms[id]));
          return totalCats > 0 && newCatsValid && roomsValid;
        case 3:
        case 4:
        case 5:
          return true;
        default:
          return false;
      }
    } else {
      // New customer validation
      switch (step) {
        case 1:
          if (customerType === 'existing') {
            return formData.customerName && formData.customerEmail;
          } else {
            return formData.customerName && formData.customerEmail && formData.customerPhone && formData.customerAddress;
          }
        case 2:
          return formData.catNames.every(name => name.trim() !== '');
        case 3:
        case 4:
        case 5:
          return true;
        default:
          return false;
      }
    }
  };

  // Get all cats for booking (selected existing + new cats)
  const getAllBookingCats = () => {
    const existingCats = selectedCatIds.map(id => 
      userProfile?.cats.find(cat => cat.id === id)
    ).filter(Boolean);
    return [...existingCats, ...newCats];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full my-4 sm:my-8 shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold truncate" style={{ color: primaryColor }}>
              {step === totalSteps ? 'Booking Confirmed!' : 'Complete Your Booking'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Step {step} of {totalSteps}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full w-8 h-8 p-0 flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 flex-shrink-0">
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* LOGGED-IN USER FLOW */}
          {isLoggedIn ? (
            <>
              {/* Step 1: Date & Times */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Confirm Dates & Times
                    </h3>
                  </div>

                  {/* Date Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkInDate">Check-in Date *</Label>
                      <Input
                        id="checkInDate"
                        type="date"
                        value={checkInDate.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          setCheckInDate(newDate);
                          // If check-out is before or same as check-in, adjust it
                          if (checkOutDate <= newDate) {
                            const newCheckOut = new Date(newDate);
                            newCheckOut.setDate(newCheckOut.getDate() + 1);
                            setCheckOutDate(newCheckOut);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOutDate">Check-out Date *</Label>
                      <Input
                        id="checkOutDate"
                        type="date"
                        value={checkOutDate.toISOString().split('T')[0]}
                        onChange={(e) => setCheckOutDate(new Date(e.target.value))}
                        min={(() => {
                          const tomorrow = new Date(checkInDate);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          return tomorrow.toISOString().split('T')[0];
                        })()}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Duration Display */}
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: '#F8F7F5', border: '1px solid #C4B5A0' }}>
                    <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                      {nights} day{nights !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dropOffTime">
                        Drop-off Time *
                        <span className="block text-xs font-normal" style={{ color: `${primaryColor}70` }}>
                          {checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </Label>
                      <select
                        id="dropOffTime"
                        value={formData.dropOffTime}
                        onChange={(e) => setFormData({ ...formData, dropOffTime: e.target.value })}
                        className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent bg-white"
                        style={{ outline: 'none' }}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickUpTime">
                        Pick-up Time *
                        <span className="block text-xs font-normal" style={{ color: `${primaryColor}70` }}>
                          {checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </Label>
                      <select
                        id="pickUpTime"
                        value={formData.pickUpTime}
                        onChange={(e) => setFormData({ ...formData, pickUpTime: e.target.value })}
                        className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent bg-white"
                        style={{ outline: 'none' }}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Additional Services - Collapsible */}
                  {additionalServices.length > 0 && (
                    <Collapsible open={servicesExpanded} onOpenChange={setServicesExpanded} className="mt-6">
                      <CollapsibleTrigger asChild>
                        <button 
                          type="button"
                          className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-gray-50 transition-colors border-2"
                          style={{ borderColor: '#e5e7eb' }}
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" style={{ color: accentColor }} />
                            <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                              Additional Services (Optional)
                            </h3>
                            {formData.selectedServices.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: accentColor }}>
                                {formData.selectedServices.length} selected
                              </span>
                            )}
                          </div>
                          {servicesExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-3">
                        <div className="space-y-3">
                          {additionalServices.map((service, index) => (
                            <label 
                              key={index} 
                              className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                              style={{ borderColor: formData.selectedServices.includes(index) ? accentColor : '#e5e7eb' }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedServices.includes(index)}
                                onChange={() => toggleService(index)}
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{ accentColor: accentColor }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold mb-1" style={{ color: primaryColor }}>{service.title}</div>
                                <div className="text-sm text-gray-600">{service.description}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold" style={{ color: accentColor }}>{service.price}</div>
                                <div className="text-xs text-gray-500">per day</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              {/* Step 2: Cat Selection & Room Assignment */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🐱</span>
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Select Your Cat(s)
                    </h3>
                  </div>

                  {/* Existing Cats */}
                  {userProfile && userProfile.cats.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base">Your Cats</Label>
                      {userProfile.cats.map((cat) => (
                        <div key={cat.id} className="border-2 rounded-xl overflow-hidden" style={{ borderColor: selectedCatIds.includes(cat.id) ? accentColor : '#e5e7eb' }}>
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleCatSelection(cat.id)}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={selectedCatIds.includes(cat.id)}
                                onChange={() => toggleCatSelection(cat.id)}
                                className="w-5 h-5 mt-1 flex-shrink-0"
                                style={{ accentColor: accentColor }}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1">
                                <div className="font-semibold" style={{ color: primaryColor }}>{cat.name}</div>
                                <div className="text-sm text-gray-600">{cat.breed || 'Breed not specified'}</div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCatExpanded(cat.id);
                                }}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                {expandedCats[cat.id] ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* Expandable cat info - Full editable details */}
                          {expandedCats[cat.id] && (
                            <div className="px-4 pb-4 pt-2 bg-gray-50 border-t space-y-4">
                              {/* Vaccination Alert */}
                              {isVaccinationExpired(getCatDetails(cat.id)?.vaccinationDate || cat.vaccinationDate) && (
                                <div className="flex items-start gap-2 p-3 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
                                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div className="text-sm">
                                    <p className="font-semibold text-yellow-900">Vaccination Out of Date</p>
                                    <p className="text-yellow-700">This cat's last vaccination was over 1 year ago. Please update vaccination records.</p>
                                  </div>
                                </div>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    value={getCatDetails(cat.id)?.name || cat.name}
                                    onChange={(e) => updateCatDetail(cat.id, 'name', e.target.value)}
                                    className="h-10 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Breed</Label>
                                  <Input
                                    value={getCatDetails(cat.id)?.breed || cat.breed || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'breed', e.target.value)}
                                    className="h-10 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Age</Label>
                                  <Input
                                    type="number"
                                    value={getCatDetails(cat.id)?.age || cat.age || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'age', parseInt(e.target.value))}
                                    className="h-10 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Gender</Label>
                                  <select
                                    value={getCatDetails(cat.id)?.gender || cat.gender || 'male'}
                                    onChange={(e) => updateCatDetail(cat.id, 'gender', e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm"
                                  >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Color</Label>
                                  <Input
                                    value={getCatDetails(cat.id)?.color || cat.color || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'color', e.target.value)}
                                    className="h-10 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Weight (lbs)</Label>
                                  <Input
                                    type="number"
                                    value={getCatDetails(cat.id)?.weight || cat.weight || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'weight', parseFloat(e.target.value))}
                                    className="h-10 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Microchip ID</Label>
                                <Input
                                  value={getCatDetails(cat.id)?.microchipId || cat.microchipId || ''}
                                  onChange={(e) => updateCatDetail(cat.id, 'microchipId', e.target.value)}
                                  className="h-10 text-sm"
                                  placeholder="15-digit microchip number"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs">Vet Name</Label>
                                  <Input
                                    value={getCatDetails(cat.id)?.vetName || cat.vetName || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'vetName', e.target.value)}
                                    className="h-10 text-sm"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Vet Phone</Label>
                                  <Input
                                    value={getCatDetails(cat.id)?.vetPhone || cat.vetPhone || ''}
                                    onChange={(e) => updateCatDetail(cat.id, 'vetPhone', e.target.value)}
                                    className="h-10 text-sm"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Last Vaccination Date *</Label>
                                <Input
                                  type="date"
                                  value={getCatDetails(cat.id)?.vaccinationDate || cat.vaccinationDate}
                                  onChange={(e) => updateCatDetail(cat.id, 'vaccinationDate', e.target.value)}
                                  className="h-10 text-sm"
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Upload Vaccination Booklet Photo</Label>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVaccinationPhotoUpload(cat.id, e.target.files?.[0] || null)}
                                    className="h-10 text-sm"
                                  />
                                  {(vaccinationPhotos[cat.id] || cat.vaccinationPhoto) && (
                                    <Check className="w-5 h-5 text-green-600" />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Medications</Label>
                                <Textarea
                                  value={getCatDetails(cat.id)?.medications || cat.medications || ''}
                                  onChange={(e) => updateCatDetail(cat.id, 'medications', e.target.value)}
                                  className="text-sm"
                                  rows={2}
                                  placeholder="List any medications..."
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Dietary Needs</Label>
                                <Textarea
                                  value={getCatDetails(cat.id)?.dietaryNeeds || cat.dietaryNeeds || ''}
                                  onChange={(e) => updateCatDetail(cat.id, 'dietaryNeeds', e.target.value)}
                                  className="text-sm"
                                  rows={2}
                                  placeholder="Food preferences, allergies..."
                                />
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs">Special Needs</Label>
                                <Textarea
                                  value={getCatDetails(cat.id)?.specialNeeds || cat.specialNeeds || ''}
                                  onChange={(e) => updateCatDetail(cat.id, 'specialNeeds', e.target.value)}
                                  className="text-sm"
                                  rows={2}
                                  placeholder="Behavioral notes, handling requirements..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Cat */}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewCat}
                      className="w-full h-12 rounded-xl border-2 border-dashed"
                      style={{ borderColor: accentColor }}
                    >
                      <Plus className="w-5 h-5 mr-2" style={{ color: accentColor }} />
                      Add Another Cat
                    </Button>
                  </div>

                  {/* New Cats Form */}
                  {newCats.map((cat, index) => (
                    <div key={`new-${index}`} className="p-4 border-2 rounded-xl space-y-4" style={{ borderColor: accentColor }}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm" style={{ color: accentColor }}>New Cat {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNewCat(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={cat.name}
                          onChange={(e) => updateNewCat(index, 'name', e.target.value)}
                          placeholder="Whiskers"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Breed</Label>
                        <Input
                          value={cat.breed}
                          onChange={(e) => updateNewCat(index, 'breed', e.target.value)}
                          placeholder="e.g., Siamese, Persian, Mixed"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Last Vaccination Date</Label>
                        <Input
                          type="date"
                          value={cat.vaccinationDate}
                          onChange={(e) => updateNewCat(index, 'vaccinationDate', e.target.value)}
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Special Notes</Label>
                        <Textarea
                          value={cat.specialNotes}
                          onChange={(e) => updateNewCat(index, 'specialNotes', e.target.value)}
                          placeholder="Dietary needs, medications, behavioral notes..."
                          className="rounded-xl"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Room Assignment */}
                  {(selectedCatIds.length + newCats.length) > 0 && (
                    <>
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <Home className="w-5 h-5" style={{ color: accentColor }} />
                          <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                            Room Selection
                          </h3>
                        </div>

                        {/* Only show shared/separate toggle if more than one cat */}
                        {(selectedCatIds.length + newCats.length) > 1 && (
                          <div className="flex gap-3 p-1 bg-gray-100 rounded-xl mb-4">
                            <button
                              onClick={() => setRoomAssignment('shared')}
                              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                roomAssignment === 'shared' 
                                  ? 'text-white shadow-md' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              style={roomAssignment === 'shared' ? { backgroundColor: primaryColor } : {}}
                            >
                              Shared Room
                            </button>
                            <button
                              onClick={() => setRoomAssignment('separate')}
                              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                                roomAssignment === 'separate' 
                                  ? 'text-white shadow-md' 
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              style={roomAssignment === 'separate' ? { backgroundColor: primaryColor } : {}}
                            >
                              Separate Rooms
                            </button>
                          </div>
                        )}

                        {/* Single cat or shared room - show room options */}
                        {((selectedCatIds.length + newCats.length) === 1 || roomAssignment === 'shared') && (
                          <div className="space-y-3">
                            {availableRooms.map((roomOption) => {
                              const totalCats = selectedCatIds.length + newCats.length;
                              let roomPrice = roomOption.price * nights;
                              
                              // Apply multi-cat discount if applicable and sharing
                              if (multiCatDiscount && totalCats > 1 && roomAssignment === 'shared') {
                                const discount = (totalCats - 1) * discountPerCat * nights;
                                roomPrice = Math.max(0, roomPrice - discount);
                              }

                              const tax = roomPrice * 0.15;
                              const total = roomPrice + tax;
                              const isSelected = (selectedCatIds.length + newCats.length) === 1 
                                ? selectedRooms[selectedCatIds[0] || 'new-0'] === roomOption.id
                                : false;

                              return (
                                <Card 
                                  key={roomOption.id} 
                                  className={`overflow-hidden cursor-pointer transition-all ${
                                    isSelected ? 'ring-2' : 'hover:shadow-md'
                                  }`}
                                  style={{ borderColor: isSelected ? accentColor : undefined }}
                                  onClick={() => {
                                    if ((selectedCatIds.length + newCats.length) === 1) {
                                      const catId = selectedCatIds[0] || 'new-0';
                                      selectRoomForCat(catId, roomOption.id);
                                    }
                                  }}
                                >
                                  {roomOption.image && (
                                    <div className="h-32 overflow-hidden">
                                      <img 
                                        src={roomOption.image} 
                                        alt={roomOption.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h4 className="font-semibold" style={{ color: primaryColor }}>{roomOption.name}</h4>
                                        {roomOption.capacity && (
                                          <p className="text-xs text-gray-500">Sleeps up to {roomOption.capacity} cat{roomOption.capacity > 1 ? 's' : ''}</p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold" style={{ color: accentColor }}>${total.toFixed(0)}</div>
                                        <div className="text-xs text-gray-500">total</div>
                                      </div>
                                    </div>
                                    
                                    {roomOption.features && roomOption.features.length > 0 && (
                                      <div className="space-y-1 mb-3">
                                        {roomOption.features.slice(0, 3).map((feature, i) => (
                                          <div key={i} className="flex items-center text-xs text-gray-600">
                                            <Check className="w-3 h-3 mr-1.5 flex-shrink-0" style={{ color: accentColor }} />
                                            <span>{feature}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="bg-gray-50 rounded-lg p-2 space-y-1 text-xs">
                                      <div className="flex justify-between text-gray-600">
                                        <span>${roomOption.price}/day × {nights}</span>
                                        <span>${(roomOption.price * nights).toFixed(2)}</span>
                                      </div>
                                      {multiCatDiscount && totalCats > 1 && roomAssignment === 'shared' && (
                                        <div className="flex justify-between text-green-600">
                                          <span>{totalCats - 1} cat discount</span>
                                          <span>-${((totalCats - 1) * discountPerCat * nights).toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-gray-600">
                                        <span>Tax (15%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between font-semibold pt-1 border-t" style={{ color: primaryColor }}>
                                        <span>Total</span>
                                        <span>${total.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}

                        {roomAssignment === 'separate' && (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-600">Select a room for each cat:</p>
                            
                            {/* Selected existing cats */}
                            {selectedCatIds.map(catId => {
                              const cat = userProfile?.cats.find(c => c.id === catId);
                              if (!cat) return null;
                              
                              return (
                                <div key={catId} className="p-3 border rounded-xl">
                                  <Label className="text-sm font-semibold mb-2 block">{cat.name}</Label>
                                  <select
                                    value={selectedRooms[catId] || ''}
                                    onChange={(e) => selectRoomForCat(catId, e.target.value)}
                                    className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm"
                                  >
                                    <option value="">Select a room...</option>
                                    {availableRooms.map(r => (
                                      <option key={r.id} value={r.id}>{r.name} - ${r.price}/day</option>
                                    ))}
                                  </select>
                                </div>
                              );
                            })}

                            {/* New cats */}
                            {newCats.map((cat, index) => (
                              <div key={`new-${index}`} className="p-3 border rounded-xl">
                                <Label className="text-sm font-semibold mb-2 block">{cat.name || `New Cat ${index + 1}`}</Label>
                                <select
                                  value={selectedRooms[`new-${index}`] || ''}
                                  onChange={(e) => selectRoomForCat(`new-${index}`, e.target.value)}
                                  className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm"
                                >
                                  <option value="">Select a room...</option>
                                  {availableRooms.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} - ${r.price}/day</option>
                                  ))}
                                </select>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Comments */}
                      <div className="space-y-2">
                        <Label htmlFor="bookingComments">Additional Comments (Optional)</Label>
                        <Textarea
                          id="bookingComments"
                          value={bookingComments}
                          onChange={(e) => setBookingComments(e.target.value)}
                          placeholder="Any special requests or information we should know..."
                          className="rounded-xl"
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Review (Logged-in) */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Review Your Booking
                    </h3>
                  </div>

                  {/* Booking Summary */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(`2000-01-01T${formData.dropOffTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-medium">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(`2000-01-01T${formData.pickUpTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{nights} day{nights !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Guest Details */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.customerPhone}</span>
                    </div>
                  </div>

                  {/* Cats */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold mb-2" style={{ color: primaryColor }}>Your Cats:</div>
                    <div className="space-y-1 text-sm">
                      {selectedCatIds.map(catId => {
                        const cat = userProfile?.cats.find(c => c.id === catId);
                        return cat ? <div key={catId}>• {cat.name}</div> : null;
                      })}
                      {newCats.map((cat, index) => (
                        <div key={`new-${index}`}>• {cat.name}</div>
                      ))}
                    </div>
                  </div>

                  {/* Room Assignment */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="font-semibold mb-2" style={{ color: primaryColor }}>Room Assignment:</div>
                    <div className="text-sm">
                      {roomAssignment === 'shared' ? (
                        <div>Shared Room: {room.name}</div>
                      ) : (
                        <div className="space-y-1">
                          {selectedCatIds.map(catId => {
                            const cat = userProfile?.cats.find(c => c.id === catId);
                            const roomId = selectedRooms[catId];
                            const selectedRoom = availableRooms.find(r => r.id === roomId);
                            return cat && selectedRoom ? (
                              <div key={catId}>• {cat.name}: {selectedRoom.name}</div>
                            ) : null;
                          })}
                          {newCats.map((cat, index) => {
                            const roomId = selectedRooms[`new-${index}`];
                            const selectedRoom = availableRooms.find(r => r.id === roomId);
                            return selectedRoom ? (
                              <div key={`new-${index}`}>• {cat.name}: {selectedRoom.name}</div>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 p-4 border-2 rounded-xl" style={{ borderColor: accentColor }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {roomAssignment === 'shared' ? `${room.name} × ${nights} days` : `Rooms × ${nights} days`}
                      </span>
                      <span>${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {formData.selectedServices.length > 0 && (
                      <>
                        {formData.selectedServices.map(serviceIndex => {
                          const service = additionalServices[serviceIndex];
                          const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
                          return (
                            <div key={serviceIndex} className="flex justify-between text-sm">
                              <span className="text-gray-600">{service.title} × {nights} days</span>
                              <span>${(price * nights).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (15%)</span>
                      <span>${pricing.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t" style={{ color: primaryColor }}>
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Payment (Logged-in) */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Payment Information
                    </h3>
                  </div>

                  <div className="rounded-xl p-4 text-sm" style={{ 
                    backgroundColor: `${accentColor}15`, 
                    border: `1px solid ${accentColor}50`
                  }}>
                    <p className="font-semibold mb-1" style={{ color: primaryColor }}>Deposit Required</p>
                    <p style={{ color: primaryColor }}>
                      A ${pricing.deposit} deposit is required to confirm your booking.
                      <br />
                      Remaining balance of ${(pricing.total - pricing.deposit).toFixed(2)} due at check-in.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    
                    <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: formData.paymentMethod === 'card' ? accentColor : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Credit or Debit Card</div>
                        <div className="text-xs text-gray-600">Secure payment via Stripe</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-7 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          VISA
                        </div>
                        <div className="w-10 h-7 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          MC
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: formData.paymentMethod === 'bank' ? accentColor : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-gray-600">Pay within 24 hours to confirm</div>
                      </div>
                    </label>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-3 mt-4 p-4 border rounded-xl">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="4242 4242 4242 4242" className="h-11 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" className="h-11 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVC</Label>
                          <Input placeholder="123" className="h-11 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Confirmation (Logged-in) */}
              {step === 5 && (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Check className="w-10 h-10" style={{ color: accentColor }} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                      Booking Confirmed!
                    </h3>
                    <p className="text-gray-600">
                      Your booking has been added to your dashboard
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Reference</span>
                      <span className="font-mono font-semibold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">{new Date(checkIn).toLocaleDateString()} at {new Date(`2000-01-01T${formData.dropOffTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">{new Date(checkOut).toLocaleDateString()} at {new Date(`2000-01-01T${formData.pickUpTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cats</span>
                      <span className="font-medium">{selectedCatIds.length + newCats.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold" style={{ color: accentColor }}>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteBooking}
                    className="w-full h-12 rounded-xl font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    View in Dashboard
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* NEW CUSTOMER FLOW (Original) */}
              {/* Step 1: Customer Details */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Your Contact Information
                    </h3>
                  </div>

                  {/* Customer Type Toggle */}
                  <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => {
                        setCustomerType('new');
                        setShowLogin(false);
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        customerType === 'new' 
                          ? 'text-white shadow-md' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={customerType === 'new' ? { backgroundColor: primaryColor } : {}}
                    >
                      New Customer
                    </button>
                    <button
                      onClick={() => {
                        setCustomerType('existing');
                        setShowLogin(true);
                      }}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        customerType === 'existing' 
                          ? 'text-white shadow-md' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      style={customerType === 'existing' ? { backgroundColor: primaryColor } : {}}
                    >
                      Existing Customer
                    </button>
                  </div>

                  {/* Existing Customer - Login Form */}
                  {customerType === 'existing' && showLogin && (
                    <div className="space-y-4 p-4 border-2 rounded-xl" style={{ borderColor: accentColor }}>
                      <h4 className="font-semibold" style={{ color: primaryColor }}>Login to Your Account</h4>
                      
                      <div className="space-y-2">
                        <Label htmlFor="loginEmail">Email Address *</Label>
                        <Input
                          id="loginEmail"
                          type="email"
                          value={formData.loginEmail}
                          onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                          placeholder="your@email.com"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loginPassword">Password *</Label>
                        <div className="relative">
                          <Input
                            id="loginPassword"
                            type={showPassword ? "text" : "password"}
                            value={formData.loginPassword}
                            onChange={(e) => setFormData({ ...formData, loginPassword: e.target.value })}
                            placeholder="••••••••"
                            className="h-12 rounded-xl pr-12"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button 
                        className="w-full h-11 rounded-xl font-semibold text-white"
                        style={{ backgroundColor: accentColor }}
                        onClick={handleLogin}
                        disabled={isLoggingIn || !formData.loginEmail || !formData.loginPassword}
                      >
                        {isLoggingIn ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          'Login'
                        )}
                      </Button>

                      {loginError && (
                        <p className="text-xs text-center text-red-500">
                          {loginError}
                        </p>
                      )}

                      <p className="text-xs text-center text-gray-500">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Add forgot password logic
                          }}
                          className="hover:underline cursor-pointer bg-transparent border-none p-0" 
                          style={{ color: accentColor }}
                        >
                          Forgot password?
                        </button>
                      </p>
                    </div>
                  )}

                  {/* New Customer - Registration Form */}
                  {customerType === 'new' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder="Sarah Johnson"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          placeholder="sarah@example.com"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                          placeholder="(555) 123-4567"
                          className="h-12 rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          value={formData.customerAddress}
                          onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                          placeholder="123 Main St, Anytown, USA"
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </>
                  )}

                  {/* Notification with website colors */}
                  <div className="rounded-xl p-4 text-sm" style={{ 
                    backgroundColor: `${primaryColor}10`, 
                    border: `1px solid ${primaryColor}30`,
                    color: primaryColor 
                  }}>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Booking confirmation will be sent to your email
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Pet Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🐱</span>
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Tell Us About Your Cat{numberOfCats > 1 ? 's' : ''}
                    </h3>
                  </div>

                  {Array.from({ length: numberOfCats }).map((_, index) => (
                    <div key={index} className="border-2 rounded-xl overflow-hidden" style={{ borderColor: `${accentColor}40` }}>
                      {/* Collapsed Header - Always visible */}
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleNewCustomerCatExpanded(index)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            {numberOfCats > 1 && (
                              <span className="text-sm font-semibold px-2 py-1 rounded" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                                Cat {index + 1}
                              </span>
                            )}
                            <div className="flex-1">
                              <Input
                                value={formData.catNames[index]}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateCatName(index, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Enter cat's name *"
                                className="h-10 rounded-lg border-0 bg-transparent focus:bg-white focus:border focus:border-gray-300"
                                style={{ fontSize: '16px', fontWeight: formData.catNames[index] ? '500' : '400' }}
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="ml-4 p-1 hover:bg-gray-200 rounded transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNewCustomerCatExpanded(index);
                          }}
                        >
                          {expandedNewCustomerCats[index] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Details - Optional fields */}
                      {expandedNewCustomerCats[index] && (
                        <div className="px-4 pb-4 pt-2 space-y-4 bg-gray-50 border-t">
                          <div className="space-y-2">
                            <Label htmlFor={`breed-${index}`} className="text-sm text-gray-600">Breed (Optional)</Label>
                            <Input
                              id={`breed-${index}`}
                              value={formData.catBreeds[index]}
                              onChange={(e) => updateCatBreed(index, e.target.value)}
                              placeholder="e.g., Siamese, Persian, Mixed"
                              className="h-11 rounded-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`vaccination-date-${index}`} className="text-sm text-gray-600">Last Vaccination Date (Optional)</Label>
                            <Input
                              id={`vaccination-date-${index}`}
                              type="date"
                              value={formData.catVaccinationDates[index]}
                              onChange={(e) => updateCatVaccinationDate(index, e.target.value)}
                              className="h-11 rounded-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`vaccination-file-${index}`} className="text-sm text-gray-600">Vaccination Certificate (Optional)</Label>
                            
                            {!formData.catVaccinationFiles[index] ? (
                              <div className="relative">
                                <input
                                  id={`vaccination-file-${index}`}
                                  type="file"
                                  accept="image/*,.pdf"
                                  onChange={(e) => handleFileUpload(index, e.target.files ? e.target.files[0] : null)}
                                  className="hidden"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById(`vaccination-file-${index}`)?.click()}
                                  className="w-full h-11 rounded-lg border-2 border-dashed hover:border-solid"
                                  style={{ borderColor: `${accentColor}40` }}
                                >
                                  <Upload className="w-4 h-4 mr-2" style={{ color: accentColor }} />
                                  Upload Certificate
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-3 border-2 rounded-lg" style={{ borderColor: `${accentColor}40` }}>
                                <FileText className="w-5 h-5" style={{ color: accentColor }} />
                                <span className="flex-1 text-sm truncate">{formData.catVaccinationFiles[index]?.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500">Upload photo or PDF of vaccination record</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Special Notes or Requirements (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.specialNotes}
                      onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                      placeholder="Dietary needs, medications, behavioral notes..."
                      className="rounded-xl"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Times & Services */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Confirm Drop-off & Pick-up Times
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dropOffTime">Drop-off Time *</Label>
                      <select
                        id="dropOffTime"
                        value={formData.dropOffTime}
                        onChange={(e) => setFormData({ ...formData, dropOffTime: e.target.value })}
                        className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent bg-white"
                        style={{ outline: 'none' }}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickUpTime">Pick-up Time *</Label>
                      <select
                        id="pickUpTime"
                        value={formData.pickUpTime}
                        onChange={(e) => setFormData({ ...formData, pickUpTime: e.target.value })}
                        className="w-full h-12 px-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent bg-white"
                        style={{ outline: 'none' }}
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 text-sm" style={{ backgroundColor: '#F8F7F5', border: '1px solid #C4B5A0', color: primaryColor }}>
                    <p>
                      <strong>Check-in:</strong> {new Date(checkIn).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(`2000-01-01T${formData.dropOffTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      <br />
                      <strong>Check-out:</strong> {new Date(checkOut).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {new Date(`2000-01-01T${formData.pickUpTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>

                  {additionalServices.length > 0 && (
                    <Collapsible open={servicesExpanded} onOpenChange={setServicesExpanded} className="mt-6">
                      <CollapsibleTrigger asChild>
                        <button 
                          type="button"
                          className="flex items-center justify-between w-full p-4 rounded-xl hover:bg-gray-50 transition-colors border-2"
                          style={{ borderColor: '#e5e7eb' }}
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" style={{ color: accentColor }} />
                            <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                              Additional Services (Optional)
                            </h3>
                            {formData.selectedServices.length > 0 && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full text-white" style={{ backgroundColor: accentColor }}>
                                {formData.selectedServices.length} selected
                              </span>
                            )}
                          </div>
                          {servicesExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-3">
                        <div className="space-y-3">
                          {additionalServices.map((service, index) => (
                            <label 
                              key={index} 
                              className="flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                              style={{ borderColor: formData.selectedServices.includes(index) ? accentColor : '#e5e7eb' }}
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedServices.includes(index)}
                                onChange={() => toggleService(index)}
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{ accentColor: accentColor }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold mb-1" style={{ color: primaryColor }}>{service.title}</div>
                                <div className="text-sm text-gray-600">{service.description}</div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="font-bold" style={{ color: accentColor }}>{service.price}</div>
                                <div className="text-xs text-gray-500">per day</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}

              {/* Step 4: Review Booking */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Review Your Booking
                    </h3>
                  </div>

                  {/* Room Preview */}
                  <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <img 
                      src={room.image} 
                      alt={room.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1" style={{ color: primaryColor }}>{room.name}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                        {' - '}
                        {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-gray-600">{nights} day{nights !== 1 ? 's' : ''} • Drop-off: {new Date(`2000-01-01T${formData.dropOffTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                    </div>
                  </div>

                  {/* Guest Details */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Guest:</span>
                      <span className="font-medium">{formData.customerName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.customerEmail}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{formData.customerPhone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cats:</span>
                      <span className="font-medium">{formData.catNames.filter(n => n).join(', ')}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3 p-4 border-2 rounded-xl" style={{ borderColor: accentColor }}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{room.name} × {nights} days</span>
                      <span>${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    {formData.selectedServices.length > 0 && (
                      <>
                        {formData.selectedServices.map(serviceIndex => {
                          const service = additionalServices[serviceIndex];
                          const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
                          return (
                            <div key={serviceIndex} className="flex justify-between text-sm">
                              <span className="text-gray-600">{service.title} × {nights} days</span>
                              <span>${(price * nights).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (15%)</span>
                      <span>${pricing.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-3 border-t" style={{ color: primaryColor }}>
                      <span>Total</span>
                      <span>${pricing.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="w-5 h-5" style={{ color: accentColor }} />
                    <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>
                      Payment Information
                    </h3>
                  </div>

                  <div className="rounded-xl p-4 text-sm" style={{ 
                    backgroundColor: `${accentColor}15`, 
                    border: `1px solid ${accentColor}50`
                  }}>
                    <p className="font-semibold mb-1" style={{ color: primaryColor }}>Deposit Required</p>
                    <p style={{ color: primaryColor }}>
                      A ${pricing.deposit} deposit is required to confirm your booking.
                      <br />
                      Remaining balance of ${(pricing.total - pricing.deposit).toFixed(2)} due at check-in.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    
                    <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: formData.paymentMethod === 'card' ? accentColor : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Credit or Debit Card</div>
                        <div className="text-xs text-gray-600">Secure payment via Stripe</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-7 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          VISA
                        </div>
                        <div className="w-10 h-7 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                          MC
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ borderColor: formData.paymentMethod === 'bank' ? accentColor : '#e5e7eb' }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Bank Transfer</div>
                        <div className="text-xs text-gray-600">Pay within 24 hours to confirm</div>
                      </div>
                    </label>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-3 mt-4 p-4 border rounded-xl">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="4242 4242 4242 4242" className="h-11 rounded-lg" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" className="h-11 rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVC</Label>
                          <Input placeholder="123" className="h-11 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 6: Confirmation */}
              {step === 6 && (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Check className="w-10 h-10" style={{ color: accentColor }} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                      Booking Confirmed!
                    </h3>
                    <p className="text-gray-600">
                      We've sent a confirmation email to <strong>{formData.customerEmail}</strong>
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Reference</span>
                      <span className="font-mono font-semibold">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room</span>
                      <span className="font-medium">{room.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in</span>
                      <span className="font-medium">{new Date(checkIn).toLocaleDateString()} at {new Date(`2000-01-01T${formData.dropOffTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out</span>
                      <span className="font-medium">{new Date(checkOut).toLocaleDateString()} at {new Date(`2000-01-01T${formData.pickUpTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest(s)</span>
                      <span className="font-medium">{formData.catNames.filter(n => n).join(', ')}</span>
                    </div>
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full h-12 rounded-xl font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {step < totalSteps && (
          <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 border-t flex-shrink-0">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-10 sm:h-12 rounded-xl text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex-1 h-10 sm:h-12 rounded-xl font-semibold text-white text-sm sm:text-base"
              style={{ backgroundColor: isStepValid() ? accentColor : '#9ca3af' }}
            >
              <span className="truncate">{(isLoggedIn && step === 4) || (!isLoggedIn && step === 5) ? `Pay Deposit $${pricing.deposit}` : 'Continue'}</span>
              <ArrowRight className="w-4 h-4 sm:ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
