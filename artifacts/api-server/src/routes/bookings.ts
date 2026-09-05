import { Router, type IRouter, type Request, type Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { planPhysicalRoomStay, type PhysicalRoomBooking } from '../lib/physicalRoomInventory.js';
import { waitlistAvailabilityOwnerHtml } from '../lib/emailTemplates.js';
import { resend, FROM_ADDRESS } from '../lib/resend.js';
import { notifyCatteryStaff } from '../push/notifications.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const admin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

const router: IRouter = Router();
let lastRefreshStartedAt = 0;

type RoomRow = {
  id: string;
  cattery_id: string;
  name: string;
  description?: string | null;
  capacity: number;
  room_count: number;
  price_per_night: number;
  is_active: boolean;
};

function validDateRange(checkIn: string, checkOut: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(checkIn)
    && /^\d{4}-\d{2}-\d{2}$/.test(checkOut)
    && checkOut >= checkIn;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${value}T12:00:00Z`));
}

function newZealandDateKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

async function authenticatedUser(req: Request) {
  if (!admin) return null;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function canManageCattery(userId: string, catteryId: string) {
  if (!admin || !userId || !catteryId) return false;
  const [{ data: owner }, { data: staff }] = await Promise.all([
    admin.from('catteries').select('id').eq('id', catteryId).eq('owner_id', userId).maybeSingle(),
    admin.from('staff_memberships').select('id').eq('cattery_id', catteryId).eq('user_id', userId).eq('status', 'active').in('role', ['owner', 'manager', 'staff']).maybeSingle(),
  ]);
  return Boolean(owner?.id || staff?.id);
}

async function overlappingBookings(catteryId: string, checkIn: string, checkOut: string, excludeBookingId?: string) {
  if (!admin) throw new Error('Booking service is unavailable.');
  let query = admin
    .from('bookings')
    .select(`
      id, room_id, room_unit_number, check_in, check_out, status,
      booking_cat_rooms(room_id, room_unit_number),
      booking_room_segments(room_id, room_unit_number, starts_on, ends_on)
    `)
    .eq('cattery_id', catteryId)
    .lte('check_in', checkOut)
    .gte('check_out', checkIn);
  if (excludeBookingId) query = query.neq('id', excludeBookingId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as PhysicalRoomBooking[];
}

async function planForRoom(room: RoomRow, checkIn: string, checkOut: string, excludeBookingId?: string) {
  const bookings = await overlappingBookings(room.cattery_id, checkIn, checkOut, excludeBookingId);
  return planPhysicalRoomStay(room.id, Number(room.room_count), bookings, checkIn, checkOut);
}

router.get('/bookings/availability', async (req, res) => {
  if (!admin) { res.status(503).json({ error: 'Availability could not be checked.' }); return; }
  const catteryId = String(req.query.catteryId || '');
  const checkIn = String(req.query.checkIn || '');
  const checkOut = String(req.query.checkOut || '');
  const cats = Number.parseInt(String(req.query.cats || '1'), 10);
  if (!/^[0-9a-f-]{36}$/i.test(catteryId) || !validDateRange(checkIn, checkOut) || !Number.isInteger(cats) || cats < 1 || cats > 4) {
    res.status(400).json({ error: 'Choose valid dates and cats before checking availability.' });
    return;
  }

  try {
    const [{ data: rooms, error: roomsError }, bookings] = await Promise.all([
      admin.from('rooms').select('id,cattery_id,name,description,capacity,room_count,price_per_night,is_active').eq('cattery_id', catteryId).eq('is_active', true),
      overlappingBookings(catteryId, checkIn, checkOut),
    ]);
    if (roomsError) throw roomsError;
    const availability = ((rooms || []) as RoomRow[]).map((room) => {
      if (Number(room.capacity) < cats) {
        return { roomId: room.id, availability: 'not_suitable' as const, roomMoves: 0 };
      }
      const plan = planPhysicalRoomStay(room.id, Number(room.room_count), bookings, checkIn, checkOut);
      return {
        roomId: room.id,
        availability: !plan ? 'waitlist' as const : plan.length === 1 ? 'whole' as const : 'split' as const,
        roomMoves: plan ? plan.length - 1 : 0,
      };
    });
    res.json({ availability });
  } catch (error) {
    console.error('[bookings/availability]', error instanceof Error ? error.message : error);
    res.status(503).json({ error: 'Availability could not be checked. Please try again.' });
  }
});

export async function refreshAvailableWaitlists() {
  if (!admin) return { checked: 0, alerted: 0 };
  const today = newZealandDateKey();
  const { data, error } = await admin
    .from('bookings')
    .select(`
      id, cattery_id, customer_id, room_id, check_in, check_out, cat_names,
      waitlist_available_at, waitlist_alert_claimed_at,
      waitlist_alert_email_sent_at, waitlist_alert_staff_notified_at,
      customer:customers(name,email),
      room:rooms(id,cattery_id,name,capacity,room_count,price_per_night,is_active),
      cattery:catteries(name,slug,email)
    `)
    .eq('status', 'waitlist')
    .gte('check_out', today)
    .not('room_id', 'is', null);
  if (error) {
    console.warn('[waitlist] Availability fields are not ready:', error.message);
    return { checked: 0, alerted: 0 };
  }

  let alerted = 0;
  for (const raw of data || []) {
    const booking = raw as any;
    const room = booking.room as RoomRow | null;
    if (!room?.is_active) continue;
    let plan = null;
    try {
      plan = await planForRoom(room, booking.check_in, booking.check_out, booking.id);
    } catch (planError) {
      console.warn('[waitlist] Availability check failed:', planError instanceof Error ? planError.message : planError);
      continue;
    }

    if (!plan) {
      if (booking.waitlist_available_at || booking.waitlist_alert_claimed_at) {
        await admin.from('bookings').update({
          waitlist_available_at: null,
          waitlist_alert_claimed_at: null,
          waitlist_alert_email_sent_at: null,
          waitlist_alert_staff_notified_at: null,
          waitlist_alert_last_error: null,
        }).eq('id', booking.id).eq('status', 'waitlist');
      }
      continue;
    }
    if (booking.waitlist_alert_email_sent_at && booking.waitlist_alert_staff_notified_at) continue;

    const claimedAt = booking.waitlist_alert_claimed_at ? Date.parse(booking.waitlist_alert_claimed_at) : 0;
    if (claimedAt && claimedAt > Date.now() - 10 * 60_000) continue;
    const now = new Date().toISOString();
    let claim = admin.from('bookings').update({
      waitlist_available_at: booking.waitlist_available_at || now,
      waitlist_alert_claimed_at: now,
      waitlist_alert_last_error: null,
    }).eq('id', booking.id).eq('status', 'waitlist');
    claim = booking.waitlist_alert_claimed_at
      ? claim.eq('waitlist_alert_claimed_at', booking.waitlist_alert_claimed_at)
      : claim.is('waitlist_alert_claimed_at', null);
    const { data: claimed } = await claim.select('id').maybeSingle();
    if (!claimed) continue;

    const cattery = booking.cattery || {};
    const customer = booking.customer || {};
    const customerName = String(customer.name || 'Waitlist customer');
    const catNames = String(booking.cat_names || 'Cat').split(',').map((name) => name.trim()).filter(Boolean);
    const bookingUrl = `${cattery.slug ? `https://${cattery.slug}.catstays.app` : 'https://catstays.app'}/staff-dashboard/bookings?booking=${encodeURIComponent(booking.id)}`;
    const errors: string[] = [];
    let emailSentAt = booking.waitlist_alert_email_sent_at || null;
    let staffNotifiedAt = booking.waitlist_alert_staff_notified_at || null;

    if (!staffNotifiedAt) {
      try {
        const delivery = await notifyCatteryStaff(booking.cattery_id, {
          type: 'waitlist_space_available',
          title: 'Waitlist space available',
          body: `A space is available for ${customerName} (${catNames.join(', ')}) from ${displayDate(booking.check_in)} to ${displayDate(booking.check_out)}. Do you want to slot this person in?`,
          url: `/staff-dashboard/bookings?booking=${encodeURIComponent(booking.id)}`,
          tag: `catstays-waitlist-available-${booking.id}`,
          metadata: { bookingId: booking.id, customerId: booking.customer_id, roomId: booking.room_id },
        });
        staffNotifiedAt = now;
        if (delivery.sent === 0) errors.push('Phone push was not delivered; the alert remains in the CatStays inbox.');
      } catch (pushError) {
        errors.push(pushError instanceof Error ? pushError.message : 'Phone alert failed.');
      }
    }

    if (!emailSentAt) {
      if (!cattery.email) {
        errors.push('The cattery email address is not configured.');
      } else {
        try {
          const result = await resend.emails.send({
            from: FROM_ADDRESS,
            to: cattery.email,
            subject: `Space available for ${customerName}'s waitlist request`,
            html: waitlistAvailabilityOwnerHtml({
              catteryName: cattery.name || 'CatStays',
              customerName,
              catNames,
              checkIn: displayDate(booking.check_in),
              checkOut: displayDate(booking.check_out),
              roomName: room.name,
              bookingUrl,
            }),
          });
          if (result.error) errors.push(result.error.message);
          else emailSentAt = now;
        } catch (emailError) {
          errors.push(emailError instanceof Error ? emailError.message : 'Email alert failed.');
        }
      }
    }

    await admin.from('bookings').update({
      waitlist_alert_email_sent_at: emailSentAt,
      waitlist_alert_staff_notified_at: staffNotifiedAt,
      waitlist_alert_last_error: errors.length ? errors.join(' ').slice(0, 500) : null,
    }).eq('id', booking.id).eq('status', 'waitlist');
    if (!booking.waitlist_available_at) {
      await admin.from('booking_events').insert({
        cattery_id: booking.cattery_id,
        booking_id: booking.id,
        event_type: 'waitlist_space_available',
        summary: 'Suitable room capacity became available; staff were alerted',
        metadata: { room_id: booking.room_id, room_moves: plan.length - 1, email_sent: Boolean(emailSentAt), staff_notified: Boolean(staffNotifiedAt) },
        created_by: null,
      });
    }
    alerted += 1;
  }
  return { checked: data?.length || 0, alerted };
}

router.post('/bookings/waitlist/refresh', async (_req, res) => {
  if (Date.now() - lastRefreshStartedAt < 30_000) {
    res.status(202).json({ success: true });
    return;
  }
  lastRefreshStartedAt = Date.now();
  try {
    await refreshAvailableWaitlists();
    res.status(202).json({ success: true });
  } catch (error) {
    console.error('[waitlist/refresh]', error instanceof Error ? error.message : error);
    res.status(202).json({ success: true });
  }
});

router.post('/bookings/waitlist/:bookingId/slot', async (req: Request, res: Response) => {
  if (!admin) { res.status(503).json({ error: 'Booking service is unavailable.' }); return; }
  const bookingId = String(req.params.bookingId || '');
  const user = await authenticatedUser(req);
  const { data: booking, error } = await admin
    .from('bookings')
    .select('id,cattery_id,room_id,check_in,check_out,status,number_of_cats,room:rooms(id,cattery_id,name,capacity,room_count,price_per_night,is_active)')
    .eq('id', bookingId)
    .maybeSingle();
  if (error || !booking || !user || !(await canManageCattery(user.id, booking.cattery_id))) {
    res.status(403).json({ error: 'You cannot slot this waitlist request.' });
    return;
  }
  if (booking.status !== 'waitlist') {
    res.status(409).json({ error: 'This booking is no longer on the waitlist.' });
    return;
  }
  const room = booking.room as unknown as RoomRow | null;
  if (!room?.is_active) { res.status(409).json({ error: 'The preferred room is no longer active.' }); return; }
  if (Number(room.capacity) < Math.max(1, Number(booking.number_of_cats) || 1)) {
    res.status(409).json({ error: 'The preferred room can no longer accommodate all cats in this request.' });
    return;
  }

  try {
    const plan = await planForRoom(room, booking.check_in, booking.check_out, booking.id);
    if (!plan) {
      res.status(409).json({ error: 'That space is no longer available. The request is still on the waitlist.' });
      return;
    }
    const { data: slotted, error: updateError } = await admin.from('bookings').update({
      status: 'pending',
      room_unit_number: plan[0].unitNumber,
      waitlist_available_at: null,
      waitlist_alert_claimed_at: null,
      waitlist_alert_email_sent_at: null,
      waitlist_alert_staff_notified_at: null,
      waitlist_alert_last_error: null,
    }).eq('id', booking.id).eq('status', 'waitlist').select('id').maybeSingle();
    if (updateError) throw updateError;
    if (!slotted) {
      res.status(409).json({ error: 'This booking is no longer on the waitlist.' });
      return;
    }

    await admin.from('booking_room_segments').delete().eq('booking_id', booking.id);
    if (plan.length > 1) {
      const { error: segmentsError } = await admin.from('booking_room_segments').insert(plan.map((segment) => ({
        cattery_id: booking.cattery_id,
        booking_id: booking.id,
        room_id: segment.roomId,
        room_unit_number: segment.unitNumber,
        starts_on: segment.startsOn,
        ends_on: segment.endsOn,
        created_by: user.id,
      })));
      if (segmentsError) {
        await admin.from('bookings').update({ status: 'waitlist', room_unit_number: null }).eq('id', booking.id);
        throw segmentsError;
      }
    }
    await admin.from('booking_events').insert({
      cattery_id: booking.cattery_id,
      booking_id: booking.id,
      event_type: 'waitlist_slotted',
      summary: plan.length === 1 ? 'Waitlist request slotted into an available room' : 'Waitlist request slotted into a continuous split-room plan',
      metadata: { room_id: room.id, room_moves: plan.length - 1 },
      created_by: user.id,
    });
    void refreshAvailableWaitlists();
    res.json({ success: true, status: 'pending', availability: plan.length === 1 ? 'whole' : 'split', roomMoves: plan.length - 1 });
  } catch (slotError) {
    console.error('[waitlist/slot]', slotError instanceof Error ? slotError.message : slotError);
    res.status(503).json({ error: 'The waitlist request could not be slotted. Please try again.' });
  }
});

export default router;
