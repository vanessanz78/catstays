import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Calendar, Check, ArrowLeft, Cat, User, ClipboardList, SendHorizonal, Loader2, Home, Clock3, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { useTenantCattery, type TenantRoom } from '@/hooks/useTenantCattery';
import {
  calculateBookingEstimate,
  inclusiveStayDays,
  longStayDiscountPercent,
} from '@/app/lib/bookingPricing';
import { bookingHoursSummary, bookingTimeSlotsForDate, formatBookingTime } from '@/app/lib/bookingSchedule';
import { normalizeBookingSetup, normalizePublicBlackouts, stayOverlapsBlackout } from '@/app/lib/bookingSetup';
import { normalizeTenantFeatures } from '@/app/lib/tenantFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { PetcoverIntakeFields } from '../../components/PetcoverIntakeFields';
import { defaultPetcoverCatIntake, petcoverEligibility, petcoverIntakeComplete, type PetcoverCatIntake } from '../../lib/petcover';

const STEPS = [
  { n: 1, label: 'Your Details', icon: User },
  { n: 2, label: 'Your Cats', icon: Cat },
  { n: 3, label: 'Dates & Room', icon: Calendar },
  { n: 4, label: 'Review & Submit', icon: ClipboardList },
];

type RoomAvailability = {
  roomId: string;
  availability: 'whole' | 'split' | 'waitlist' | 'not_suitable';
  roomMoves: number;
};

type RequestKind = 'booking' | 'split' | 'waitlist';

const MAX_PUBLIC_CATS = 25;

function roomIsCommunal(room: TenantRoom) {
  return `${room.name} ${room.type}`.toLowerCase().includes('communal');
}

function customerRoomDescription(room: TenantRoom) {
  return roomIsCommunal(room)
    ? `A shared communal facility with ${room.room_count} individual rooms.`
    : room.description;
}

function customerRoomCapacity(room: TenantRoom, numberOfCats: number) {
  if (roomIsCommunal(room)) {
    return `${numberOfCats} individual room${numberOfCats === 1 ? '' : 's'} for ${numberOfCats} cat${numberOfCats === 1 ? '' : 's'}`;
  }
  return `Up to ${room.capacity} cat${room.capacity === 1 ? '' : 's'} in one room`;
}

function parseCatsParam(value: string | null) {
  const count = Number.parseInt(value || '1', 10);
  return Number.isFinite(count) ? Math.min(Math.max(count, 1), MAX_PUBLIC_CATS) : 1;
}

export function BookingFlow() {
  const { tenantId } = useParams();
  const [searchParams] = useSearchParams();
  const { cattery, rooms, loading } = useTenantCattery(tenantId);
  const { user, session, cattery: staffCattery, accountRole, loading: authLoading } = useAuth();
  const testOnly = cattery?.website_settings?.bookingMode === 'test_only';
  const canTest = staffCattery?.id === cattery?.id && ['owner', 'staff'].includes(accountRole || '');
  const publicSitePath = tenantId
    ? `/tenant/${tenantId}`
    : typeof window !== 'undefined' && window.location.pathname.startsWith('/site')
      ? '/site'
      : '/';
  const initialCatCount = parseCatsParam(searchParams.get('cats'));
  const today = format(new Date(), 'yyyy-MM-dd');

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submittedKind, setSubmittedKind] = useState<RequestKind>('booking');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeCatIndex, setActiveCatIndex] = useState(0);
  const [availability, setAvailability] = useState<RoomAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const [selectedRoom, setSelectedRoom] = useState<TenantRoom | null>(null);
  const [requestKind, setRequestKind] = useState<RequestKind | null>(null);
  const [formData, setFormData] = useState({
    arrivalDate: searchParams.get('checkIn') || '',
    departureDate: searchParams.get('checkOut') || '',
    arrivalTime: '',
    departureTime: '',
    numberOfCats: initialCatCount,
    catNames: Array(initialCatCount).fill(''),
    catBreeds: Array(initialCatCount).fill(''),
    petcoverCats: Array<PetcoverCatIntake>(initialCatCount).fill(null as never).map(() => defaultPetcoverCatIntake()),
    ownerName: '',
    email: '',
    phone: '',
    specialRequirements: '',
  });

  const updateField = (field: string, value: string | number) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const updateCatName = (i: number, val: string) => {
    const names = [...formData.catNames];
    names[i] = val;
    setFormData(prev => ({ ...prev, catNames: names }));
  };

  const updateCatBreed = (i: number, val: string) => {
    const breeds = [...formData.catBreeds];
    breeds[i] = val;
    setFormData(prev => ({ ...prev, catBreeds: breeds }));
  };

  const addCat = () => {
    if (formData.numberOfCats >= MAX_PUBLIC_CATS) return;
    const nextCount = formData.numberOfCats + 1;
    setSelectedRoom(null);
    setRequestKind(null);
    setFormData(prev => ({
      ...prev,
      numberOfCats: nextCount,
      catNames: [...prev.catNames, ''],
      catBreeds: [...prev.catBreeds, ''],
      petcoverCats: [...prev.petcoverCats, defaultPetcoverCatIntake()],
    }));
    setActiveCatIndex(nextCount - 1);
  };

  const removeCat = (index: number) => {
    if (formData.numberOfCats <= 1) return;
    const nextCount = formData.numberOfCats - 1;
    setSelectedRoom(null);
    setRequestKind(null);
    setFormData((prev) => ({
      ...prev,
      numberOfCats: nextCount,
      catNames: prev.catNames.filter((_, itemIndex) => itemIndex !== index),
      catBreeds: prev.catBreeds.filter((_, itemIndex) => itemIndex !== index),
      petcoverCats: prev.petcoverCats.filter((_, itemIndex) => itemIndex !== index),
    }));
    setActiveCatIndex(Math.max(0, Math.min(index - 1, nextCount - 1)));
  };

  // The cattery charges for every calendar day in care, including arrival and departure.
  const days = inclusiveStayDays(formData.arrivalDate, formData.departureDate);
  const dailyRate = selectedRoom?.price_per_night ?? 0;
  const discountPct = longStayDiscountPercent(days);
  const bookingSettings = normalizeBookingSetup(cattery?.website_settings);
  const tenantFeatures = normalizeTenantFeatures(cattery?.website_settings);
  const publicBlackouts = normalizePublicBlackouts(cattery?.website_settings);
  const arrivalTimeSlots = bookingTimeSlotsForDate(cattery?.website_settings, formData.arrivalDate);
  const departureTimeSlots = bookingTimeSlotsForDate(cattery?.website_settings, formData.departureDate);
  const hoursSummary = bookingHoursSummary(cattery?.website_settings);
  const blackoutConflict = stayOverlapsBlackout(publicBlackouts, formData.arrivalDate, formData.departureDate);
  const visitTimesComplete = bookingSettings.openByAppointmentOnly || Boolean(formData.arrivalTime && formData.departureTime);
  const petcoverSelectionsEligible = formData.petcoverCats.every((intake) => (
    !intake.requested || petcoverEligibility(intake.dateOfBirth, formData.arrivalDate || new Date()).eligible
  ));
  const { beforeDiscount, discount, subtotal, gst, total } = calculateBookingEstimate({
    dailyRate,
    days,
    numberOfCats: formData.numberOfCats,
    discountPercent: discountPct,
  });

  const fmtDate = (d: string) => {
    try { return format(parseISO(d), 'd MMM yyyy'); } catch { return d; }
  };

  useEffect(() => {
    setSelectedRoom(null);
    setRequestKind(null);
    setAvailability([]);
    setAvailabilityError('');
    if (!cattery?.id || !formData.arrivalDate || !formData.departureDate || days <= 0 || blackoutConflict) return;
    const controller = new AbortController();
    setAvailabilityLoading(true);
    const params = new URLSearchParams({
      catteryId: cattery.id,
      checkIn: formData.arrivalDate,
      checkOut: formData.departureDate,
      cats: String(formData.numberOfCats),
    });
    fetch(`/api/bookings/availability?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || 'Availability could not be checked.');
        setAvailability(Array.isArray(payload.availability) ? payload.availability : []);
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setAvailabilityError(error instanceof Error ? error.message : 'Availability could not be checked.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      });
    return () => controller.abort();
  }, [blackoutConflict, cattery?.id, days, formData.arrivalDate, formData.departureDate, formData.numberOfCats]);

  const canProceed = (() => {
    if (step === 1) return formData.ownerName.trim() && formData.email.trim() && formData.phone.trim();
    if (step === 2) return formData.catNames.every(n => n.trim()) && (!tenantFeatures.petcoverOfferEnabled || formData.petcoverCats.every(petcoverIntakeComplete));
    if (step === 3) return formData.arrivalDate && formData.departureDate && days > 0 && visitTimesComplete && !blackoutConflict && petcoverSelectionsEligible && Boolean(selectedRoom) && Boolean(requestKind);
    return true;
  })();

  const bookingIsComplete = Boolean(
    days > 0 &&
    visitTimesComplete &&
    !blackoutConflict &&
    Boolean(selectedRoom) &&
    Boolean(requestKind) &&
    formData.ownerName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.catNames.every(name => name.trim()) &&
    (!tenantFeatures.petcoverOfferEnabled || (formData.petcoverCats.every(petcoverIntakeComplete) && petcoverSelectionsEligible)),
  );

  const handleSubmit = async () => {
    if (!cattery) return;
    setSubmitting(true);
    setSubmitError('');

    if (!selectedRoom) {
      setSubmitting(false);
      setSubmitError('Choose an accommodation option before submitting your request.');
      return;
    }
    const roomName = selectedRoom.name;
    const estimatedTotal = `$${total.toFixed(2)} incl. GST`;

    try {
      const res = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          catteryId: cattery.id,
          testOnly,
          catteryName: cattery.name,
          catteryEmail: cattery.email,
          catteryPhone: cattery.phone,
          customerName: formData.ownerName,
          customerEmail: formData.email,
          phone: formData.phone,
          catNames: formData.catNames,
          checkIn: formData.arrivalDate,
          checkOut: formData.departureDate,
          checkInTime: formData.arrivalTime || null,
          checkOutTime: formData.departureTime || null,
          displayCheckIn: `${fmtDate(formData.arrivalDate)}${formData.arrivalTime ? ` at ${formatBookingTime(formData.arrivalTime)}` : ''}`,
          displayCheckOut: `${fmtDate(formData.departureDate)}${formData.departureTime ? ` at ${formatBookingTime(formData.departureTime)}` : ''}`,
          days,
          roomName,
          roomId: selectedRoom.id,
          estimatedTotal,
          specialRequirements: formData.specialRequirements,
          requestKind,
          petcoverApplications: tenantFeatures.petcoverOfferEnabled
            ? formData.petcoverCats
              .map((intake, index) => ({ ...intake, catName: formData.catNames[index], breed: formData.catBreeds[index] }))
              .filter((intake) => intake.requested)
            : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');
      setSubmittedKind(data.requestKind || requestKind || 'booking');
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  if (testOnly && !canTest) return <main className="min-h-screen bg-cream p-6"><section className="mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-6">
    <h1 className="text-2xl font-serif font-bold text-forest">Online booking preview</h1>
    <p>CatStays bookings are test-only while we prepare to switch. Revelation Pets remains our main booking system. Please contact the cattery to make or change a real booking.</p>
    {cattery?.phone && <a href={`tel:${cattery.phone}`} className="block rounded-xl bg-forest p-3 text-center text-white">Call the cattery</a>}
    <Link to={publicSitePath} className="block underline">Back to website</Link><Link to="/staff-login" className="block text-sm underline">Staff test sign-in</Link>
  </section></main>;

  if (submitted) {
    const roomName = selectedRoom?.name || (rooms[0]?.name ?? 'Standard Room');
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <Card className="border-sage/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-forest text-cream p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-sage" />
              </div>
              <h1 className="text-2xl font-serif font-semibold mb-2">{testOnly ? 'Test booking received' : submittedKind === 'waitlist' ? 'Waitlist Request Received' : 'Booking Request Received'}</h1>
              <p className="text-cream/80">{testOnly ? 'This is not a real reservation. Revelation Pets remains primary.' : submittedKind === 'waitlist' ? "We'll contact you if a suitable space becomes available." : "We'll confirm your booking within 24 hours."}</p>
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="bg-cream rounded-2xl p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest/60">Cat{formData.catNames.length > 1 ? 's' : ''}</span>
                  <span className="font-medium text-forest">{formData.catNames.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">{submittedKind === 'waitlist' ? 'Preferred room' : 'Room'}</span>
                  <span className="font-medium text-forest">{roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Check-in</span>
                  <span className="font-medium text-forest">{fmtDate(formData.arrivalDate)}{formData.arrivalTime ? ` at ${formatBookingTime(formData.arrivalTime)}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Check-out</span>
                  <span className="font-medium text-forest">{fmtDate(formData.departureDate)}{formData.departureTime ? ` at ${formatBookingTime(formData.departureTime)}` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Duration</span>
                  <span className="font-medium text-forest">{days} day{days !== 1 ? 's' : ''}</span>
                </div>
                <div className="border-t border-sage/20 pt-2 flex justify-between font-semibold">
                  <span className="text-forest/60">Estimated total</span>
                  <span className="text-forest">${total.toFixed(2)} incl. GST</span>
                </div>
              </div>

              <div className="bg-sage/10 rounded-2xl p-4 text-sm text-forest/70">
                <p>{submittedKind === 'waitlist'
                  ? "Thanks — you're on the waitlist. We'll contact you if a suitable space becomes available. This is not yet a confirmed booking."
                  : "Thanks — we've received your request. We'll contact you within 24 hours to confirm the next steps. Your stay is confirmed once we send your confirmation."}</p>
              </div>

              <div className="flex gap-3">
                <Link to={publicSitePath} className="flex-1">
                  <Button variant="outline" className="w-full border-sage text-sage rounded-xl">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Site
                  </Button>
                </Link>
                {cattery?.phone && (
                  <a href={`tel:${cattery.phone}`} className="flex-1">
                    <Button className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl">Call Us</Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {testOnly && <div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><strong>Staff test only.</strong> Revelation Pets is the main booking system. This does not create a real reservation. Use your verified staff email ({user?.email}) so test emails stay with you.</div>}
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={publicSitePath} className="inline-flex items-center gap-1 text-forest/50 hover:text-forest text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            {cattery?.name || 'Back'}
          </Link>
          <h1 className="text-3xl font-serif font-semibold text-forest">Book Your Cat's Stay</h1>
          {cattery?.city && <p className="text-forest/60 mt-1">{cattery.name} · {cattery.city}</p>}
        </div>

        {/* Step progress */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div key={s.n} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(s.n)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:border-sage/40 hover:text-sage ${active ? 'bg-sage text-white shadow-md hover:text-white' : done ? 'bg-sage/20 text-sage' : 'bg-white text-forest/40 border border-sage/10'}`}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.n}</span>
                </button>
                {idx < STEPS.length - 1 && <div className={`h-px w-4 ${done ? 'bg-sage' : 'bg-sage/20'}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="md:col-span-2">
            <Card className="border-sage/10 shadow-lg rounded-3xl overflow-hidden">
              {/* Step 1: Your Details */}
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Your Details</CardTitle>
                    <CardDescription>Who should we contact about this booking?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Full Name *</Label>
                      <Input id="ownerName" value={formData.ownerName} onChange={e => updateField('ownerName', e.target.value)} className="rounded-xl border-sage/20" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => updateField('email', e.target.value)} className="rounded-xl border-sage/20" required />
                      <p className="text-xs text-forest/50">Your booking confirmation will be sent here</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={e => updateField('phone', e.target.value)} className="rounded-xl border-sage/20" required />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 2: Cat Information */}
              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Your Cat{formData.numberOfCats > 1 ? 's' : ''}</CardTitle>
                    <CardDescription>Add each cat who will be staying</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: formData.numberOfCats }).map((_, i) => {
                      const expanded = activeCatIndex === i;
                      const catComplete = Boolean(formData.catNames[i]?.trim())
                        && (!tenantFeatures.petcoverOfferEnabled || petcoverIntakeComplete(formData.petcoverCats[i]));
                      return (
                        <div key={i} className={`rounded-2xl border ${expanded ? 'border-sage/40 bg-sage/5' : 'border-sage/20 bg-white'}`}>
                          <div className="flex items-center gap-2 p-3">
                            <button type="button" aria-expanded={expanded} onClick={() => setActiveCatIndex(i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sm font-semibold text-sage">{i + 1}</div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-forest">{formData.catNames[i]?.trim() || `Cat ${i + 1}`}</p>
                                {!expanded && <p className="text-xs text-forest/50">{catComplete ? 'Details saved' : 'Details need finishing'}</p>}
                              </div>
                              {expanded ? <ChevronUp className="h-5 w-5 shrink-0 text-sage" /> : <ChevronDown className="h-5 w-5 shrink-0 text-sage" />}
                            </button>
                            {formData.numberOfCats > 1 && (
                              <button type="button" aria-label={`Remove ${formData.catNames[i] || `cat ${i + 1}`}`} onClick={() => removeCat(i)} className="rounded-lg p-2 text-forest/40 hover:bg-white hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          {expanded && (
                            <div className="space-y-4 border-t border-sage/15 p-4">
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                  <Label htmlFor={`cat-name-${i}`}>Name *</Label>
                                  <Input id={`cat-name-${i}`} placeholder="Whiskers" value={formData.catNames[i]} onChange={e => updateCatName(i, e.target.value)} className="rounded-xl border-sage/20" required />
                                </div>
                                <div className="space-y-1.5">
                                  <Label htmlFor={`cat-breed-${i}`}>Breed (optional)</Label>
                                  <Input id={`cat-breed-${i}`} placeholder="Domestic Shorthair" value={formData.catBreeds[i]} onChange={e => updateCatBreed(i, e.target.value)} className="rounded-xl border-sage/20" />
                                </div>
                              </div>
                              {tenantFeatures.petcoverOfferEnabled ? <PetcoverIntakeFields
                                value={formData.petcoverCats[i]}
                                onChange={(updates) => setFormData((current) => ({
                                  ...current,
                                  petcoverCats: current.petcoverCats.map((intake, index) => index === i ? { ...intake, ...updates } : intake),
                                }))}
                                referenceDate={formData.arrivalDate}
                                idPrefix={`public-petcover-${i}`}
                              /> : null}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {formData.numberOfCats < MAX_PUBLIC_CATS && (
                      <Button type="button" variant="outline" onClick={addCat} className="w-full rounded-xl border-dashed border-sage/40 text-sage">
                        <Plus className="mr-2 h-4 w-4" />Add another cat
                      </Button>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="special">Special Requirements or Medical Notes</Label>
                      <Textarea id="special" placeholder="Dietary requirements, medications, allergies, behavioural notes..." value={formData.specialRequirements} onChange={e => updateField('specialRequirements', e.target.value)} rows={3} className="rounded-xl border-sage/20" />
                    </div>
                  </CardContent>
                </>
              )}

              {/* Step 3: Dates & Room */}
              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Dates, Times & Room</CardTitle>
                    <CardDescription>Choose the stay for {formData.catNames.filter(Boolean).join(', ')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <Input type="date" value={formData.arrivalDate} onChange={e => setFormData((current) => ({ ...current, arrivalDate: e.target.value, arrivalTime: '' }))} min={today} className="rounded-xl border-sage/20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-out Date</Label>
                        <Input type="date" value={formData.departureDate} onChange={e => setFormData((current) => ({ ...current, departureDate: e.target.value, departureTime: '' }))} min={formData.arrivalDate || today} className="rounded-xl border-sage/20" />
                      </div>
                    </div>

                    {bookingSettings.openByAppointmentOnly ? (
                      <div className="rounded-xl border border-sage/20 bg-sage/10 p-4 text-sm text-forest/70">
                        This cattery arranges arrival and departure times directly after receiving the booking.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-sm font-medium text-forest">
                            Check-in time
                            <select aria-label="Check-in time" className="mt-2 h-11 w-full rounded-xl border border-sage/20 bg-white px-3" value={formData.arrivalTime} disabled={!formData.arrivalDate || arrivalTimeSlots.length === 0} onChange={(event) => updateField('arrivalTime', event.target.value)}>
                              <option value="">Select time</option>
                              {arrivalTimeSlots.map((time) => <option key={time} value={time}>{formatBookingTime(time)}</option>)}
                            </select>
                          </label>
                          <label className="text-sm font-medium text-forest">
                            Check-out time
                            <select aria-label="Check-out time" className="mt-2 h-11 w-full rounded-xl border border-sage/20 bg-white px-3" value={formData.departureTime} disabled={!formData.departureDate || departureTimeSlots.length === 0} onChange={(event) => updateField('departureTime', event.target.value)}>
                              <option value="">Select time</option>
                              {departureTimeSlots.map((time) => <option key={time} value={time}>{formatBookingTime(time)}</option>)}
                            </select>
                          </label>
                        </div>
                        <div className="rounded-xl border border-sage/20 bg-white p-4 text-sm text-forest/60">
                          <div className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-sage" /><div><strong className="block text-forest">{hoursSummary.heading}</strong>{hoursSummary.lines.map((line) => <span key={line} className="mt-1 block">{line}</span>)}</div></div>
                        </div>
                        {formData.arrivalDate && arrivalTimeSlots.length === 0 && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">There are no check-in appointments on this day. Please choose another date.</p>}
                        {formData.departureDate && departureTimeSlots.length === 0 && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">There are no check-out appointments on this day. Please choose another date.</p>}
                      </>
                    )}

                    {blackoutConflict && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">The cattery is closed during part of this stay. Please choose different dates.</p>}
                    {!petcoverSelectionsEligible && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">The selected dates place at least one Petcover cat outside the under-12-month introductory offer. Go back to update the Petcover selection or choose earlier dates.</p>}

                    {days > 0 && (
                      <div className="bg-sage/10 rounded-xl p-3 text-sm flex items-start gap-2 text-sage-dark">
                        <Calendar className="w-4 h-4" />
                        <span>
                          <strong>{days} day{days !== 1 ? 's' : ''}</strong>
                          {' — includes day of arrival and day of departure'}
                          {discountPct > 0 ? ` · ${discountPct}% long-stay discount applied` : ''}
                        </span>
                      </div>
                    )}

                    {availabilityLoading && <div role="status" className="flex items-center gap-2 rounded-xl bg-white p-4 text-sm text-forest/60"><Loader2 className="h-4 w-4 animate-spin text-sage" />Checking live room availability…</div>}
                    {availabilityError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{availabilityError}</p>}

                    {rooms.length > 0 && availability.length > 0 && (
                      <div className="space-y-2">
                        <Label>Choose a room</Label>
                        <div className="space-y-2">
                          {rooms.map(room => {
                            const roomAvailability = availability.find((item) => item.roomId === room.id);
                            const isSuitable = roomAvailability?.availability !== 'not_suitable';
                            const availableKind: RequestKind | null = roomAvailability?.availability === 'whole'
                              ? 'booking'
                              : roomAvailability?.availability === 'split'
                                ? 'split'
                                : null;
                            const isWaitlist = roomAvailability?.availability === 'waitlist';
                            const description = customerRoomDescription(room);
                            const capacity = customerRoomCapacity(room, formData.numberOfCats);
                            const selected = selectedRoom?.id === room.id && requestKind === availableKind;
                            const waitlistSelected = selectedRoom?.id === room.id && requestKind === 'waitlist';
                            const roomDetails = (
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-forest">{room.name}</div>
                                  {description && <div className="mt-0.5 text-sm text-forest/60">{description}</div>}
                                  <div className="mt-0.5 text-sm text-forest/50">{capacity}</div>
                                  {(roomAvailability?.availability === 'whole' || roomAvailability?.availability === 'split') && <div className="mt-1 text-sm font-medium text-emerald-700">Available for the whole stay</div>}
                                  {isWaitlist && <div className="mt-1 text-sm font-medium text-amber-800">Fully booked for these dates</div>}
                                  {roomAvailability?.availability === 'not_suitable' && <div className="mt-1 text-sm font-medium text-amber-700">Not available for this number of cats</div>}
                                </div>
                                <div className="ml-4 flex-shrink-0 text-right">
                                  <div className="font-semibold text-sage">${room.price_per_night}/cat/day</div>
                                  {(selected || waitlistSelected) && <Check className="ml-auto mt-1 h-4 w-4 text-sage" />}
                                </div>
                              </div>
                            );
                            if (isWaitlist) {
                              return (
                                <div key={room.id} className={`w-full rounded-xl border p-4 text-left transition-all ${waitlistSelected ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-amber-200 bg-amber-50/40'}`}>
                                  {roomDetails}
                                  <label className="mt-4 flex cursor-pointer items-start gap-2 border-t border-amber-200 pt-4 text-sm font-medium text-forest">
                                    <input
                                      type="checkbox"
                                      checked={waitlistSelected}
                                      onChange={(event) => {
                                        if (event.target.checked) {
                                          setSelectedRoom(room);
                                          setRequestKind('waitlist');
                                        } else if (waitlistSelected) {
                                          setSelectedRoom(null);
                                          setRequestKind(null);
                                        }
                                      }}
                                      className="mt-0.5 h-4 w-4 accent-[#C46A3A]"
                                    />
                                    <span>Would you like to be added to the waitlist?</span>
                                  </label>
                                  {waitlistSelected && <p className="mt-2 pl-6 text-sm text-amber-900">We'll notify you as soon as a suitable room becomes available.</p>}
                                </div>
                              );
                            }
                            return (
                              <button key={room.id} type="button" disabled={!isSuitable || !availableKind} onClick={() => { setSelectedRoom(room); setRequestKind(availableKind); }} className={`w-full rounded-xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-55 ${selected ? 'border-sage bg-sage/5 shadow-sm' : 'border-sage/20 enabled:hover:border-sage/40'}`}>
                                {roomDetails}
                              </button>
                            );
                          })}
                        </div>
                        {requestKind === 'waitlist' && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This sends a waitlist request, not a confirmed booking. We'll notify you as soon as a suitable room becomes available.</p>}
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Review & Submit</CardTitle>
                    <CardDescription>Please check your booking details before submitting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="bg-cream rounded-2xl p-5 space-y-3 text-sm">
                      <h4 className="font-semibold text-forest mb-2">Stay Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-forest/60">{requestKind === 'waitlist' ? 'Preferred room' : 'Room'}</span>
                          <span className="font-medium text-forest">{selectedRoom?.name || 'Not selected yet'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Check-in</span>
                          <span className="font-medium text-forest">{formData.arrivalDate ? `${fmtDate(formData.arrivalDate)}${formData.arrivalTime ? ` at ${formatBookingTime(formData.arrivalTime)}` : ''}` : 'Not selected yet'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Check-out</span>
                          <span className="font-medium text-forest">{formData.departureDate ? `${fmtDate(formData.departureDate)}${formData.departureTime ? ` at ${formatBookingTime(formData.departureTime)}` : ''}` : 'Not selected yet'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Duration</span>
                          <span className="font-medium text-forest">{days > 0 ? `${days} day${days !== 1 ? 's' : ''}` : 'Not selected yet'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Cats</span>
                          <span className="font-medium text-forest">{formData.catNames.filter(name => name.trim()).join(', ') || 'Not entered yet'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-cream rounded-2xl p-5 text-sm space-y-2">
                      <h4 className="font-semibold text-forest mb-2">Your Details</h4>
                      <div className="flex justify-between"><span className="text-forest/60">Name</span><span className="text-forest">{formData.ownerName || 'Not entered yet'}</span></div>
                      <div className="flex justify-between"><span className="text-forest/60">Email</span><span className="text-forest">{formData.email || 'Not entered yet'}</span></div>
                      <div className="flex justify-between"><span className="text-forest/60">Phone</span><span className="text-forest">{formData.phone || 'Not entered yet'}</span></div>
                    </div>

                    <div className={`${requestKind === 'waitlist' ? 'border border-amber-200 bg-amber-50 text-amber-900' : 'bg-sage/10 text-forest/70'} rounded-2xl p-4 text-sm`}>
                      <p><strong className="text-forest">How this works:</strong> {requestKind === 'waitlist'
                        ? "Send this waitlist request and we'll contact you if suitable capacity becomes available. This is not yet a confirmed booking."
                        : "Send your booking request and we'll contact you within 24 hours to confirm the next steps. Your stay is confirmed once we send your confirmation."}</p>
                    </div>

                    {submitError && (
                      <div className="bg-rose/10 border border-rose/30 rounded-xl p-4 text-sm text-rose-dark">
                        {submitError}
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Navigation */}
              <CardContent className="pt-0 pb-6">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button variant="outline" onClick={() => setStep(s => s - 1)} className="border-sage/30 text-forest rounded-xl">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  {step < 4 ? (
                    <Button
                      className="flex-1 bg-sage hover:bg-sage-dark text-white rounded-xl"
                      onClick={() => setStep(s => s + 1)}
                      disabled={!canProceed}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 bg-forest hover:bg-forest/90 text-cream rounded-xl"
                      onClick={handleSubmit}
                      disabled={submitting || !bookingIsComplete}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending Request…</>
                      ) : (
                        <><SendHorizonal className="w-4 h-4 mr-2" />{requestKind === 'waitlist' ? 'Join Waitlist' : 'Submit Booking Request'}</>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border-sage/10 shadow-md rounded-3xl sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif text-forest">Price Estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {days > 0 && selectedRoom ? (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="text-forest/70">
                        Rate: ${dailyRate} per cat, per day
                      </div>
                      <div className="flex justify-between gap-3 text-forest/70">
                        <span>{formData.numberOfCats} cat{formData.numberOfCats !== 1 ? 's' : ''} × {days} day{days !== 1 ? 's' : ''}</span>
                        <span className="whitespace-nowrap">${beforeDiscount.toFixed(2)}</span>
                      </div>
                      {discountPct > 0 && (
                        <div className="flex justify-between text-sage">
                          <span>Long-stay discount ({discountPct}%)</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-forest/70">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-forest/70">
                        <span>GST (15%)</span>
                        <span>${gst.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-sage/20 pt-2 flex justify-between font-bold text-forest">
                        <span>Estimated Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                  </>
                ) : (
                  <p className="text-sm text-forest/50 text-center py-4">Choose dates and a room to see pricing</p>
                )}

                <div className="space-y-2 text-sm">
                  {[
                    'Free cancellation (48hrs notice)',
                    'Individual care & attention',
                    'Twice daily feeding',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-2 text-forest/70">
                      <Check className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
