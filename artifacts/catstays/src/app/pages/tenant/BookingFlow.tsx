import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { Calendar, Check, ArrowLeft, Cat, User, ClipboardList, SendHorizonal, Loader2, Home } from 'lucide-react';
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

const STEPS = [
  { n: 1, label: 'Dates & Room', icon: Calendar },
  { n: 2, label: 'Your Details', icon: User },
  { n: 3, label: 'Your Cats', icon: Cat },
  { n: 4, label: 'Review & Submit', icon: ClipboardList },
];

function parseCatsParam(value: string | null) {
  const count = Number.parseInt(value || '1', 10);
  return Number.isFinite(count) ? Math.min(Math.max(count, 1), 4) : 1;
}

export function BookingFlow() {
  const { tenantId } = useParams();
  const [searchParams] = useSearchParams();
  const { cattery, rooms, loading } = useTenantCattery(tenantId);
  const publicSitePath = tenantId
    ? `/tenant/${tenantId}`
    : typeof window !== 'undefined' && window.location.pathname.startsWith('/site')
      ? '/site'
      : '/';
  const initialCatCount = parseCatsParam(searchParams.get('cats'));

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [selectedRoom, setSelectedRoom] = useState<TenantRoom | null>(null);
  const [formData, setFormData] = useState({
    arrivalDate: searchParams.get('checkIn') || '',
    departureDate: searchParams.get('checkOut') || '',
    numberOfCats: initialCatCount,
    catNames: Array(initialCatCount).fill(''),
    catBreeds: Array(initialCatCount).fill(''),
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

  const handleCatCountChange = (n: number) => {
    setFormData(prev => ({
      ...prev,
      numberOfCats: n,
      catNames: Array(n).fill('').map((_, i) => prev.catNames[i] || ''),
      catBreeds: Array(n).fill('').map((_, i) => prev.catBreeds[i] || ''),
    }));
  };

  // The cattery charges for every calendar day in care, including arrival and departure.
  const days = inclusiveStayDays(formData.arrivalDate, formData.departureDate);
  const dailyRate = selectedRoom?.price_per_night ?? (rooms[0]?.price_per_night ?? 20);
  const discountPct = longStayDiscountPercent(days);
  const { beforeDiscount, discount, subtotal, gst, total } = calculateBookingEstimate({
    dailyRate,
    days,
    numberOfCats: formData.numberOfCats,
    discountPercent: discountPct,
  });

  const fmtDate = (d: string) => {
    try { return format(parseISO(d), 'd MMM yyyy'); } catch { return d; }
  };

  const canProceed = (() => {
    if (step === 1) return formData.arrivalDate && formData.departureDate && days > 0;
    if (step === 2) return formData.ownerName.trim() && formData.email.trim() && formData.phone.trim();
    if (step === 3) return formData.catNames.every(n => n.trim());
    return true;
  })();

  const bookingIsComplete = Boolean(
    days > 0 &&
    formData.ownerName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.catNames.every(name => name.trim()),
  );

  const handleSubmit = async () => {
    if (!cattery) return;
    setSubmitting(true);
    setSubmitError('');

    const roomName = selectedRoom?.name || (rooms[0]?.name ?? 'Standard Room');
    const estimatedTotal = `$${total.toFixed(2)} incl. GST`;

    try {
      const res = await fetch('/api/bookings/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catteryId: cattery.id,
          catteryName: cattery.name,
          catteryEmail: cattery.email,
          catteryPhone: cattery.phone,
          customerName: formData.ownerName,
          customerEmail: formData.email,
          phone: formData.phone,
          catNames: formData.catNames,
          checkIn: formData.arrivalDate,
          checkOut: formData.departureDate,
          displayCheckIn: fmtDate(formData.arrivalDate),
          displayCheckOut: fmtDate(formData.departureDate),
          days,
          roomName,
          roomId: selectedRoom?.id || null,
          estimatedTotal,
          specialRequirements: formData.specialRequirements,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send request');
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please try again or call us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

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
              <h1 className="text-2xl font-serif font-semibold mb-2">Booking Request Received</h1>
              <p className="text-cream/80">We'll confirm availability within 24 hours.</p>
            </div>
            <CardContent className="p-8 space-y-4">
              <div className="bg-cream rounded-2xl p-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-forest/60">Cat{formData.catNames.length > 1 ? 's' : ''}</span>
                  <span className="font-medium text-forest">{formData.catNames.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Room</span>
                  <span className="font-medium text-forest">{roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Check-in</span>
                  <span className="font-medium text-forest">{fmtDate(formData.arrivalDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-forest/60">Check-out</span>
                  <span className="font-medium text-forest">{fmtDate(formData.departureDate)}</span>
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
                <p>Thanks — we've received your request. We'll contact you within 24 hours to confirm availability and explain the next steps. Your stay is confirmed once we send your confirmation.</p>
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
              {/* Step 1: Dates & Room */}
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Dates & Accommodation</CardTitle>
                    <CardDescription>When will your cat be staying?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in Date</Label>
                        <Input type="date" value={formData.arrivalDate} onChange={e => updateField('arrivalDate', e.target.value)} min={new Date().toISOString().split('T')[0]} className="rounded-xl border-sage/20" />
                      </div>
                      <div className="space-y-2">
                        <Label>Check-out Date</Label>
                        <Input type="date" value={formData.departureDate} onChange={e => updateField('departureDate', e.target.value)} min={formData.arrivalDate || new Date().toISOString().split('T')[0]} className="rounded-xl border-sage/20" />
                      </div>
                    </div>

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

                    <div className="space-y-2">
                      <Label>Number of Cats</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button key={n} type="button" onClick={() => handleCatCountChange(n)} className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${formData.numberOfCats === n ? 'bg-sage text-white border-sage' : 'border-sage/20 text-forest hover:border-sage/50'}`}>
                            {n} {n === 1 ? 'Cat' : 'Cats'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {rooms.length > 0 && (
                      <div className="space-y-2">
                        <Label>Choose a Room</Label>
                        <div className="space-y-2">
                          {rooms.map(room => (
                            <button key={room.id} type="button" onClick={() => setSelectedRoom(room)} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedRoom?.id === room.id ? 'border-sage bg-sage/5 shadow-sm' : 'border-sage/20 hover:border-sage/40'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-forest">{room.name}</div>
                                  {room.description && <div className="text-sm text-forest/60 mt-0.5">{room.description}</div>}
                                  <div className="text-sm text-forest/50 mt-0.5">Up to {room.capacity} cat{room.capacity > 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                  <div className="font-semibold text-sage">${room.price_per_night}/cat/day</div>
                                  {selectedRoom?.id === room.id && <Check className="w-4 h-4 text-sage ml-auto mt-1" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </>
              )}

              {/* Step 2: Your Details */}
              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Your Details</CardTitle>
                    <CardDescription>Contact information for this booking</CardDescription>
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

              {/* Step 3: Cat Information */}
              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="font-serif text-forest">Cat Information</CardTitle>
                    <CardDescription>Tell us about your cat{formData.numberOfCats > 1 ? 's' : ''}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {Array.from({ length: formData.numberOfCats }).map((_, i) => (
                      <div key={i} className="border border-sage/20 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-sage/10 flex items-center justify-center text-sm font-semibold text-sage">{i + 1}</div>
                          <span className="font-medium text-forest">Cat {i + 1}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label>Name *</Label>
                            <Input placeholder="Whiskers" value={formData.catNames[i]} onChange={e => updateCatName(i, e.target.value)} className="rounded-xl border-sage/20" required />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Breed (optional)</Label>
                            <Input placeholder="Domestic Shorthair" value={formData.catBreeds[i]} onChange={e => updateCatBreed(i, e.target.value)} className="rounded-xl border-sage/20" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label htmlFor="special">Special Requirements or Medical Notes</Label>
                      <Textarea id="special" placeholder="Dietary requirements, medications, allergies, behavioural notes..." value={formData.specialRequirements} onChange={e => updateField('specialRequirements', e.target.value)} rows={3} className="rounded-xl border-sage/20" />
                    </div>
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
                          <span className="text-forest/60">Room</span>
                          <span className="font-medium text-forest">{selectedRoom?.name || rooms[0]?.name || 'Any available'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Check-in</span>
                          <span className="font-medium text-forest">{formData.arrivalDate ? fmtDate(formData.arrivalDate) : 'Not selected yet'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-forest/60">Check-out</span>
                          <span className="font-medium text-forest">{formData.departureDate ? fmtDate(formData.departureDate) : 'Not selected yet'}</span>
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

                    <div className="bg-sage/10 rounded-2xl p-4 text-sm text-forest/70">
                      <p><strong className="text-forest">How this works:</strong> Send your booking request and we'll contact you within 24 hours to confirm availability and explain the next steps. Your stay is confirmed once we send your confirmation.</p>
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
                        <><SendHorizonal className="w-4 h-4 mr-2" />Submit Booking Request</>
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
                {days > 0 ? (
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
                  <p className="text-sm text-forest/50 text-center py-4">Select dates to see pricing</p>
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
