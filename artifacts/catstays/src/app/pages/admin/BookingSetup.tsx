import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertCircle,
  CalendarOff,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Plus,
  Save,
  Trash2,
  Warehouse,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import { supabase } from '@/utils/supabase/client';
import {
  BOOKING_DAY_OPTIONS,
  normalizeBookingSetup,
  normalizePublicBlackouts,
  validateBlackouts,
  validateBookingSetup,
  type BookingBlackout,
  type BookingSetupValues,
} from '@/app/lib/bookingSetup';
import { bookingHoursSummary } from '@/app/lib/bookingSchedule';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const fieldClass = 'mt-1 h-11 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function toggleDay(days: number[], day: number) {
  return days.includes(day) ? days.filter((value) => value !== day) : [...days, day];
}

function dayButtons(
  selected: number[],
  onChange: (days: number[]) => void,
  disabled: boolean,
) {
  return (
    <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
      {BOOKING_DAY_OPTIONS.map((day) => {
        const active = selected.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            onClick={() => onChange(toggleDay(selected, day.value))}
            className={`h-10 rounded-xl border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'border-[#C46A3A] bg-[#C46A3A] text-white' : 'border-[#D9D1C8] bg-white text-[#4E5871] hover:border-[#C46A3A]'}`}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

export function BookingSetup() {
  const { cattery, user, refreshCattery } = useAuth();
  const { rooms, loading: roomsLoading } = useRooms();
  const [values, setValues] = useState<BookingSetupValues>(() => normalizeBookingSetup(null));
  const [blackouts, setBlackouts] = useState<BookingBlackout[]>([]);
  const [storedBlackoutIds, setStoredBlackoutIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!cattery?.id) {
      setLoading(false);
      return;
    }

    setValues(normalizeBookingSetup(cattery.website_settings));
    setLoading(true);
    void supabase
      .from('availability_rules')
      .select('id,name,starts_at,ends_at,value')
      .eq('cattery_id', cattery.id)
      .eq('rule_type', 'blackout')
      .neq('status', 'archived')
      .order('starts_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setBlackouts(normalizePublicBlackouts(cattery.website_settings));
          setNotice({ tone: 'error', text: `Blackout dates could not be loaded. ${error.message}` });
        } else {
          const rows = (data || []).map((row) => {
            const value = asObject(row.value);
            return {
              id: row.id,
              name: row.name,
              startDate: typeof value.startDate === 'string' ? value.startDate : String(row.starts_at || '').slice(0, 10),
              endDate: typeof value.endDate === 'string' ? value.endDate : String(row.ends_at || '').slice(0, 10),
            };
          });
          setBlackouts(rows);
          setStoredBlackoutIds(rows.map((row) => row.id));
        }
        setLoading(false);
      });
  }, [cattery?.id]);

  const update = <Key extends keyof BookingSetupValues>(key: Key, value: BookingSetupValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const addBlackout = () => {
    setBlackouts((current) => [...current, {
      id: crypto.randomUUID(),
      name: '',
      startDate: '',
      endDate: '',
    }]);
  };

  const updateBlackout = (id: string, changes: Partial<BookingBlackout>) => {
    setBlackouts((current) => current.map((blackout) => blackout.id === id ? { ...blackout, ...changes } : blackout));
  };

  const save = async () => {
    if (!cattery?.id || !user) {
      setNotice({ tone: 'error', text: 'Your cattery account could not be found. Refresh and sign in again.' });
      return;
    }
    const errors = [...validateBookingSetup(values), ...validateBlackouts(blackouts)];
    if (errors.length > 0) {
      setNotice({ tone: 'error', text: errors[0] });
      return;
    }

    setSaving(true);
    setNotice(null);
    const blackoutPayload = blackouts.map((blackout) => ({
      id: blackout.id,
      cattery_id: cattery.id,
      name: blackout.name.trim(),
      rule_type: 'blackout',
      starts_at: `${blackout.startDate}T00:00:00.000Z`,
      ends_at: `${blackout.endDate}T23:59:59.999Z`,
      days_of_week: [],
      value: { startDate: blackout.startDate, endDate: blackout.endDate },
      status: 'active',
      created_by: user.id,
    }));

    if (blackoutPayload.length > 0) {
      const { error } = await supabase.from('availability_rules').upsert(blackoutPayload, { onConflict: 'id' });
      if (error) {
        setNotice({ tone: 'error', text: `Blackout dates could not be saved. ${error.message}` });
        setSaving(false);
        return;
      }
    }

    const removedIds = storedBlackoutIds.filter((id) => !blackouts.some((blackout) => blackout.id === id));
    if (removedIds.length > 0) {
      const { error } = await supabase.from('availability_rules').delete().eq('cattery_id', cattery.id).in('id', removedIds);
      if (error) {
        setNotice({ tone: 'error', text: `Removed blackout dates could not be cleared. ${error.message}` });
        setSaving(false);
        return;
      }
    }

    const existingSettings = asObject(cattery.website_settings);
    const existingNested = asObject(existingSettings.bookingRules);
    const savedRules = {
      ...values,
      bookingInterval: String(values.bookingInterval),
      depositAmount: values.depositAmount,
      pricingPer: 'day',
      bookingBlackouts: blackouts,
    };
    const { error } = await supabase
      .from('catteries')
      .update({
        website_settings: {
          ...existingSettings,
          ...savedRules,
          bookingRules: { ...existingNested, ...savedRules },
        },
      })
      .eq('id', cattery.id);

    if (error) {
      setNotice({ tone: 'error', text: `Booking setup could not be saved. ${error.message}` });
      setSaving(false);
      return;
    }

    setStoredBlackoutIds(blackouts.map((blackout) => blackout.id));
    await refreshCattery();
    setNotice({ tone: 'success', text: 'Booking setup saved. Staff booking times, public booking times, blackout dates, and payment deposits now use these rules.' });
    setSaving(false);
  };

  const hoursSummary = bookingHoursSummary({ ...values });
  const depositMode = values.depositAmount === 0 ? 'none' : values.depositType;

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><RightMenu /></div>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p><h1 className="truncate text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1></div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Operations</p>
              <h2 className="text-3xl font-semibold">Booking Setup</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">Control the times customers and staff can book, closed dates, and the deposit used when a payment request is created.</p>
            </div>
            <Button onClick={() => void save()} disabled={saving || loading} className="h-11 bg-[#C46A3A] hover:bg-[#A85A30]">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving…' : 'Save booking setup'}
            </Button>
          </div>

          {notice && <div role="status" className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p>{notice.text}</p></div>}

          {loading ? (
            <Card className="border-[#E8DED4] bg-white"><CardContent className="flex items-center justify-center gap-3 p-12 text-[#4E5871]"><Loader2 className="h-5 w-5 animate-spin" />Loading this cattery’s booking rules…</CardContent></Card>
          ) : (
            <>
              <Card className="border-[#E8DED4] bg-white">
                <CardContent className="space-y-6 p-5 sm:p-6">
                  <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C46A3A]/10"><Clock3 className="h-5 w-5 text-[#C46A3A]" /></span><div><h3 className="text-xl font-semibold">Booking times</h3><p className="mt-1 text-sm text-[#4E5871]">Times are offered in the staff booking form and on the public booking form.</p></div></div>
                  <label className="flex items-start gap-3 rounded-xl border border-[#D9D1C8] bg-[#F8F1EC] p-4 text-sm">
                    <input type="checkbox" checked={values.openByAppointmentOnly} onChange={(event) => update('openByAppointmentOnly', event.target.checked)} className="mt-0.5 h-5 w-5 accent-[#C46A3A]" />
                    <span><strong className="block">Bookings by appointment only</strong><span className="mt-1 block text-[#4E5871]">Turn this on if customers should contact the cattery instead of choosing a scheduled time.</span></span>
                  </label>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-[#E8DED4] p-4 sm:p-5">
                      <h4 className="font-semibold">Morning appointments</h4>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="text-sm font-semibold">From<input aria-label="Morning opening time" type="time" className={fieldClass} disabled={values.openByAppointmentOnly} value={values.morningStart} onChange={(event) => update('morningStart', event.target.value)} /></label>
                        <label className="text-sm font-semibold">Until<input aria-label="Morning closing time" type="time" className={fieldClass} disabled={values.openByAppointmentOnly} value={values.morningEnd} onChange={(event) => update('morningEnd', event.target.value)} /></label>
                      </div>
                      <p className="mt-4 text-sm font-semibold">Open mornings</p>
                      {dayButtons(values.morningDays, (days) => update('morningDays', days), values.openByAppointmentOnly)}
                    </section>
                    <section className="rounded-2xl border border-[#E8DED4] p-4 sm:p-5">
                      <h4 className="font-semibold">Afternoon appointments</h4>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="text-sm font-semibold">From<input aria-label="Afternoon opening time" type="time" className={fieldClass} disabled={values.openByAppointmentOnly} value={values.afternoonStart} onChange={(event) => update('afternoonStart', event.target.value)} /></label>
                        <label className="text-sm font-semibold">Until<input aria-label="Afternoon closing time" type="time" className={fieldClass} disabled={values.openByAppointmentOnly} value={values.afternoonEnd} onChange={(event) => update('afternoonEnd', event.target.value)} /></label>
                      </div>
                      <p className="mt-4 text-sm font-semibold">Open afternoons</p>
                      {dayButtons(values.afternoonDays, (days) => update('afternoonDays', days), values.openByAppointmentOnly)}
                    </section>
                  </div>
                  <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-end">
                    <label className="text-sm font-semibold">Appointment spacing<select className={fieldClass} disabled={values.openByAppointmentOnly} value={values.bookingInterval} onChange={(event) => update('bookingInterval', Number(event.target.value))}><option value={15}>Every 15 minutes</option><option value={30}>Every 30 minutes</option><option value={45}>Every 45 minutes</option><option value={60}>Every 60 minutes</option></select></label>
                    <div className="rounded-xl border border-[#D9D1C8] bg-[#F8F1EC] p-4 text-sm text-[#4E5871]"><strong className="block text-[#0A1128]">{values.openByAppointmentOnly ? 'Bookings are by appointment only.' : hoursSummary.heading}</strong>{!values.openByAppointmentOnly && hoursSummary.lines.map((line) => <span key={line} className="mt-1 block">{line}</span>)}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-[#E8DED4] bg-white">
                  <CardContent className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C46A3A]/10"><CreditCard className="h-5 w-5 text-[#C46A3A]" /></span><div><h3 className="text-xl font-semibold">Pricing and deposit</h3><p className="mt-1 text-sm text-[#4E5871]">Room prices come from Room Planner. CatStays charges by calendar day, including arrival and departure.</p></div></div>
                    <label className="text-sm font-semibold">Deposit required<select className={fieldClass} value={depositMode} onChange={(event) => { const mode = event.target.value; if (mode === 'none') { update('depositType', 'fixed'); update('depositAmount', 0); } else { update('depositType', mode as BookingSetupValues['depositType']); if (values.depositAmount === 0) update('depositAmount', mode === 'percentage' ? 25 : 50); } }}><option value="none">No upfront deposit</option><option value="fixed">Fixed NZD amount</option><option value="percentage">Percentage of booking</option></select></label>
                    {depositMode !== 'none' && <label className="text-sm font-semibold">{values.depositType === 'percentage' ? 'Deposit percentage' : 'Deposit amount (NZD)'}<div className="relative"><input type="number" min="0" max={values.depositType === 'percentage' ? 100 : undefined} step={values.depositType === 'percentage' ? 1 : 0.01} className={`${fieldClass} ${values.depositType === 'percentage' ? 'pr-10' : 'pl-8'}`} value={values.depositAmount} onChange={(event) => update('depositAmount', Number(event.target.value))} /><span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#4E5871] ${values.depositType === 'percentage' ? 'right-3' : 'left-3'}`}>{values.depositType === 'percentage' ? '%' : '$'}</span></div></label>}
                    <label className="text-sm font-semibold">Cancellation policy<textarea className="mt-1 min-h-28 w-full rounded-xl border border-[#D9D1C8] bg-white p-3 text-sm font-normal text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15" value={values.cancellationPolicy} onChange={(event) => update('cancellationPolicy', event.target.value)} placeholder="Explain cancellation notice and refund terms." /></label>
                    <Link to="/staff-dashboard/room-planner" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#C46A3A] px-4 text-sm font-semibold text-[#A8562E] hover:bg-[#F8F1EC]">Manage room prices</Link>
                  </CardContent>
                </Card>

                <Card className="border-[#E8DED4] bg-white">
                  <CardContent className="space-y-5 p-5 sm:p-6">
                    <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C46A3A]/10"><Warehouse className="h-5 w-5 text-[#C46A3A]" /></span><div><h3 className="text-xl font-semibold">Live room inventory</h3><p className="mt-1 text-sm text-[#4E5871]">These are the actual rooms customers can be assigned—not a separate setup list.</p></div></div>
                    {roomsLoading ? <div className="flex items-center gap-2 py-4 text-sm text-[#4E5871]"><Loader2 className="h-4 w-4 animate-spin" />Loading rooms…</div> : rooms.length === 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No rooms are configured. Add rooms in Room Planner before accepting bookings.</div> : <div className="space-y-2">{rooms.map((room) => <div key={room.id} className="flex items-center justify-between gap-4 rounded-xl border border-[#E8DED4] p-4"><div className="min-w-0"><strong className="block truncate">{room.name}</strong><span className="text-sm text-[#4E5871]">Capacity {room.capacity} · {room.is_active ? 'Available for booking' : 'Inactive'}</span></div><span className="shrink-0 font-semibold text-[#A8562E]">${Number(room.price_per_night).toFixed(2)}/day</span></div>)}</div>}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-[#E8DED4] bg-white">
                <CardContent className="space-y-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#C46A3A]/10"><CalendarOff className="h-5 w-5 text-[#C46A3A]" /></span><div><h3 className="text-xl font-semibold">Blackout dates</h3><p className="mt-1 text-sm text-[#4E5871]">Stop customers choosing dates when the whole cattery is closed or unavailable.</p></div></div>
                    <Button type="button" variant="outline" onClick={addBlackout} className="border-[#C46A3A] text-[#A8562E]"><Plus className="mr-2 h-4 w-4" />Add closed period</Button>
                  </div>
                  {blackouts.length === 0 ? <div className="rounded-xl border border-dashed border-[#D9D1C8] p-6 text-center text-sm text-[#4E5871]">No blackout dates. The normal opening schedule applies.</div> : <div className="space-y-3">{blackouts.map((blackout) => <div key={blackout.id} className="grid gap-3 rounded-2xl border border-[#E8DED4] p-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(150px,1fr)_minmax(150px,1fr)_44px] sm:items-end"><label className="text-sm font-semibold">Reason<input className={fieldClass} value={blackout.name} onChange={(event) => updateBlackout(blackout.id, { name: event.target.value })} placeholder="e.g. Christmas closure" /></label><label className="text-sm font-semibold">Closed from<input type="date" className={fieldClass} value={blackout.startDate} onChange={(event) => updateBlackout(blackout.id, { startDate: event.target.value })} /></label><label className="text-sm font-semibold">Closed until<input type="date" className={fieldClass} value={blackout.endDate} min={blackout.startDate || undefined} onChange={(event) => updateBlackout(blackout.id, { endDate: event.target.value })} /></label><button type="button" aria-label={`Remove ${blackout.name || 'closed period'}`} onClick={() => setBlackouts((current) => current.filter((item) => item.id !== blackout.id))} className="grid h-11 w-11 place-items-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}</div>}
                </CardContent>
              </Card>

              <div className="flex justify-end"><Button onClick={() => void save()} disabled={saving} className="h-11 w-full bg-[#C46A3A] hover:bg-[#A85A30] sm:w-auto"><Save className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save booking setup'}</Button></div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
