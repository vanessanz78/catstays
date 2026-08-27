import { Router, type IRouter, type Request } from 'express';
import { resend, FROM_ADDRESS } from '../lib/resend';
import {
  bookingConfirmationHtml,
  contactEnquiryHtml,
  bookingRequestOwnerHtml,
  bookingRequestCustomerHtml,
  testEmailHtml,
} from '../lib/emailTemplates';
import { createClient } from '@supabase/supabase-js';
import { notifyCatteryStaff, notifyCustomer } from '../push/notifications.js';

const supabaseUrl = process.env['VITE_SUPABASE_URL'];
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

if (!supabase) {
  console.warn('[email] Supabase env is not set — booking request DB inserts will be skipped');
}

const router: IRouter = Router();

async function authenticatedUser(req: Request) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token || !supabase) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return error ? null : data.user;
}

async function canManageCattery(userId: string, catteryId: string) {
  if (!supabase || !userId || !catteryId) return false;
  const [{ data: owner }, { data: staff }] = await Promise.all([
    supabase.from('catteries').select('id').eq('id', catteryId).eq('owner_id', userId).maybeSingle(),
    supabase.from('staff_memberships').select('id').eq('cattery_id', catteryId).eq('user_id', userId).eq('status', 'active').maybeSingle(),
  ]);
  return Boolean(owner?.id || staff?.id);
}

router.post('/email/booking-confirmation', async (req, res) => {
  const {
    customerName, customerEmail, catteryName, catName, roomName,
    checkIn, checkOut, nights, pricePerNight, subtotal, gst, totalAmount, deposit,
    bookingRef, catteryEmail, catteryId, customerId,
  } = req.body;

  const user = await authenticatedUser(req);
  if (!customerEmail || !customerName || !catteryName || !checkIn || !checkOut || !roomName || !catteryId || !user || !(await canManageCattery(user.id, catteryId))) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: customerEmail,
      ...(catteryEmail ? { cc: catteryEmail } : {}),
      replyTo: catteryEmail,
      subject: `Booking confirmed at ${catteryName}`,
      html: bookingConfirmationHtml({
        customerName, catteryName, catName, roomName, checkIn, checkOut,
        nights, pricePerNight, subtotal, gst, totalAmount, deposit,
        bookingRef: bookingRef ?? 'N/A',
      }),
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    if (catteryId && customerId) {
      void notifyCustomer(customerId, catteryId, {
        type: 'booking_confirmed',
        title: 'Booking confirmed',
        body: `${catteryName} confirmed ${catName || 'your cat'} from ${checkIn} to ${checkOut}.`,
        url: '/client-portal',
        tag: `catstays-confirmed-${bookingRef || customerId}`,
      });
    }
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] booking-confirmation exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/email/contact-enquiry', async (req, res) => {
  const { customerName, customerEmail, message, catteryName, catteryEmail, catteryId, phone } = req.body;

  if (!customerName || !customerEmail || !message || !catteryName || !catteryEmail) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    let resolvedCatteryEmail = catteryEmail;
    let resolvedCatteryName = catteryName;
    if (catteryId && supabase) {
      const { data: catteryRecord } = await supabase.from('catteries').select('name,email').eq('id', catteryId).maybeSingle();
      if (!catteryRecord) { res.status(404).json({ error: 'Cattery not found' }); return; }
      resolvedCatteryEmail = catteryRecord.email;
      resolvedCatteryName = catteryRecord.name;
    }
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: resolvedCatteryEmail,
      replyTo: customerEmail,
      subject: `New enquiry from ${customerName}`,
      html: contactEnquiryHtml({ customerName, customerEmail, message, catteryName: resolvedCatteryName, phone }),
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    if (catteryId) {
      void notifyCatteryStaff(catteryId, {
        type: 'customer_enquiry',
        title: 'New customer enquiry',
        body: `${customerName} sent a website enquiry.`,
        url: '/staff-dashboard/messages',
        tag: `catstays-enquiry-${catteryId}-${Date.now()}`,
      });
    }
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] contact-enquiry exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/bookings/request', async (req, res) => {
  const {
    catteryId,
    customerName, customerEmail, phone,
    catNames, checkIn, checkOut, displayCheckIn, displayCheckOut, days, nights,
    roomName, roomId, estimatedTotal, specialRequirements,
  } = req.body;

  if (!catteryId || !customerName || !customerEmail || !catNames || !checkIn || !checkOut) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    if (!supabase) {
      res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
      return;
    }

    const { data: catteryRecord } = await supabase
      .from('catteries')
      .select('id,name,email,phone')
      .eq('id', catteryId)
      .maybeSingle();
    if (!catteryRecord) {
      res.status(404).json({ error: 'Cattery not found.' });
      return;
    }
    const catteryName = catteryRecord.name;
    const catteryEmail = catteryRecord.email;
    const catteryPhone = catteryRecord.phone;

    // Save the request before sending emails so online bookings always have a dashboard destination.
    const amountStr = String(estimatedTotal || '').replace(/[^0-9.]/g, '');
    const totalAmount = amountStr ? parseFloat(amountStr) : null;

    let resolvedRoomId = roomId || null;
    if (!resolvedRoomId && roomName) {
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .eq('cattery_id', catteryId)
        .ilike('name', roomName)
        .single();
      resolvedRoomId = roomData?.id || null;
    }

    const catNamesStr = Array.isArray(catNames) ? catNames.join(', ') : String(catNames || '');
    const numCats = Array.isArray(catNames) ? catNames.length : 1;

    const normalizedEmail = String(customerEmail).trim().toLowerCase();
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id,user_id')
      .eq('cattery_id', catteryId)
      .ilike('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    let customerId = existingCustomer?.id || null;
    if (customerId) {
      await supabase.from('customers').update({
        name: customerName,
        email: normalizedEmail,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      }).eq('id', customerId);
    } else {
      const { data: createdCustomer, error: customerError } = await supabase.from('customers').insert({
        cattery_id: catteryId,
        name: customerName,
        email: normalizedEmail,
        phone: phone || null,
      }).select('id,user_id').single();
      if (customerError) {
        console.error('[bookings/request] customer record failed:', customerError.message);
        res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
        return;
      }
      customerId = createdCustomer.id;
    }

    const { data: booking, error: bookingError } = await supabase.from('bookings').insert({
      cattery_id: catteryId,
      customer_id: customerId,
      room_id: resolvedRoomId,
      check_in: checkIn,
      check_out: checkOut,
      status: 'pending',
      payment_status: 'unpaid',
      total_amount: totalAmount,
      notes: specialRequirements || null,
      guest_name: customerName,
      guest_email: customerEmail,
      guest_phone: phone || null,
      cat_names: catNamesStr,
      number_of_cats: numCats,
    }).select('id').single();

    if (bookingError) {
      console.error('[bookings/request] DB insert failed:', bookingError);
      res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
      return;
    }

    const bookingBody = `${customerName} requested ${catNamesStr || 'a cat stay'} from ${displayCheckIn || checkIn} to ${displayCheckOut || checkOut}.`;
    void notifyCatteryStaff(catteryId, {
      type: 'booking_request',
      title: 'New booking request',
      body: bookingBody,
      url: '/staff-dashboard/bookings',
      tag: `catstays-booking-${booking?.id || catteryId}`,
      metadata: { bookingId: booking?.id, customerId },
    }).catch((pushError) => {
      console.warn('[bookings/request] native notification failed:', pushError instanceof Error ? pushError.message : pushError);
    });

    if (customerId) {
      void notifyCustomer(customerId, catteryId, {
        type: 'booking_received',
        title: 'Booking received',
        body: `${catteryName} received your request for ${catNamesStr || 'your cat'}.`,
        url: '/client-portal',
        tag: `catstays-booking-received-${booking?.id || customerId}`,
        metadata: { bookingId: booking?.id },
      });
    }

    const emailCheckIn = displayCheckIn || checkIn;
    const emailCheckOut = displayCheckOut || checkOut;
    const stayDays = Number(days ?? nights ?? 0);
    const [ownerResult, customerResult] = await Promise.all([
      catteryEmail ? resend.emails.send({
        from: FROM_ADDRESS,
        to: catteryEmail,
        replyTo: customerEmail,
        subject: `New booking request from ${customerName}`,
        html: bookingRequestOwnerHtml({
          catteryName, customerName, customerEmail, phone,
          catNames, checkIn: emailCheckIn, checkOut: emailCheckOut, days: stayDays,
          roomName, estimatedTotal, specialRequirements,
        }),
      }) : Promise.resolve({ data: null, error: new Error('Cattery email is not configured') }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: customerEmail,
        subject: `Your booking request at ${catteryName}`,
        html: bookingRequestCustomerHtml({
          customerName, catteryName, catteryEmail, catteryPhone,
          catNames, checkIn: emailCheckIn, checkOut: emailCheckOut, days: stayDays,
          roomName, estimatedTotal,
        }),
      }),
    ]);

    if (ownerResult.error) {
      console.error('[bookings/request] owner email error:', ownerResult.error);
    }
    if (customerResult.error) {
      console.error('[bookings/request] customer email error:', customerResult.error);
    }

    console.log('[bookings/request] saved pending booking to DB for cattery', catteryId);
    res.json({ success: true, bookingStored: true, ownerEmailId: ownerResult.data?.id, customerEmailId: customerResult.data?.id });
  } catch (err) {
    console.error('[bookings/request] exception:', err);
    res.status(500).json({ error: 'Failed to send booking request' });
  }
});

router.post('/email/test', async (req, res) => {
  const { to } = req.body;
  if (!to) { res.status(400).json({ error: 'Missing "to" email address' }); return; }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject: 'CatStays - Email is working',
      html: testEmailHtml(),
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] test exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
