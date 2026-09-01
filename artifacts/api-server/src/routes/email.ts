import { Router, type IRouter, type Request } from 'express';
import { resend, FROM_ADDRESS } from '../lib/resend';
import {
  bookingConfirmationHtml,
  contactEnquiryHtml,
  bookingRequestOwnerHtml,
  bookingRequestCustomerHtml,
  customerMessageHtml,
  customerPhotoUpdateHtml,
  testEmailHtml,
} from '../lib/emailTemplates';
import { createClient } from '@supabase/supabase-js';
import { notifyCatteryStaff, notifyCustomer } from '../push/notifications.js';
import { firstAvailablePhysicalRoom } from '../lib/physicalRoomInventory.js';

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

function catUpdatePortalUrl(req: Request, slug: string | null, updateId: string) {
  const requestOrigin = String(req.headers.origin || '').replace(/\/$/, '');
  const origin = /^https:\/\/(?:[a-z0-9-]+\.)?catstays\.app$/i.test(requestOrigin)
    || /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(requestOrigin)
    ? requestOrigin
    : slug ? `https://${slug}.catstays.app` : 'https://catstays.app';
  return `${origin}/client-portal?update=${encodeURIComponent(updateId)}`;
}

router.post('/email/booking-confirmation', async (req, res) => {
  const {
    customerName, customerEmail, catteryName, catName, roomName,
    checkIn, checkOut, nights, pricePerNight, subtotal, gst, totalAmount, deposit,
    bookingRef, catteryEmail, catteryId, customerId, paymentRequest,
    customMessage, customerNote, terms,
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
        paymentRequest, customMessage, customerNote, terms,
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
      if (supabase) {
        const normalizedEmail = String(customerEmail).trim().toLowerCase();
        const { data: matchedCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('cattery_id', catteryId)
          .ilike('email', normalizedEmail)
          .limit(1)
          .maybeSingle();
        const { error: historyError } = await supabase.from('customer_messages').insert({
          cattery_id: catteryId,
          customer_id: matchedCustomer?.id || null,
          channel: 'email',
          direction: 'inbound',
          subject: `Website enquiry from ${customerName}`,
          body: message,
          status: 'delivered',
          provider: 'resend',
          provider_message_id: data?.id || null,
          metadata: {
            source: 'website_enquiry',
            customer_name: customerName,
            customer_email: normalizedEmail,
            phone: phone || null,
          },
        });
        if (historyError) console.warn('[email] website enquiry history failed:', historyError.message);
      }
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

router.post('/email/customer-message', async (req, res) => {
  const {
    catteryId,
    customerId,
    bookingId,
    draftId,
    subject: rawSubject,
    body: rawBody,
  } = req.body || {};
  const subject = String(rawSubject || '').trim();
  const body = String(rawBody || '').trim();
  const user = await authenticatedUser(req);

  if (!user || !catteryId || !customerId || !subject || !body) {
    res.status(400).json({ error: 'Choose a customer and add a subject and message.' });
    return;
  }
  if (!(await canManageCattery(user.id, String(catteryId)))) {
    res.status(403).json({ error: 'This staff account cannot send messages for that cattery.' });
    return;
  }
  if (subject.length > 180 || body.length > 12000) {
    res.status(400).json({ error: 'Keep the subject under 180 characters and the message under 12,000 characters.' });
    return;
  }
  if (!supabase) {
    res.status(503).json({ error: 'Customer messaging is not configured on this server.' });
    return;
  }

  let messageId = '';
  try {
    const [{ data: cattery }, { data: customer }] = await Promise.all([
      supabase.from('catteries').select('id,name,email').eq('id', catteryId).maybeSingle(),
      supabase.from('customers').select('id,cattery_id,name,email,user_id').eq('id', customerId).eq('cattery_id', catteryId).maybeSingle(),
    ]);
    if (!cattery || !customer) {
      res.status(404).json({ error: 'The cattery or customer could not be found.' });
      return;
    }
    if (!customer.email || !/^\S+@\S+\.\S+$/.test(customer.email)) {
      res.status(409).json({ error: 'Add a valid email address to this customer before sending.' });
      return;
    }

    let resolvedBookingId: string | null = null;
    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('cattery_id', catteryId)
        .eq('customer_id', customerId)
        .maybeSingle();
      if (!booking) {
        res.status(400).json({ error: 'That booking does not belong to the selected customer.' });
        return;
      }
      resolvedBookingId = booking.id;
    }

    const preparedAt = new Date().toISOString();
    if (draftId) {
      const { data: draft } = await supabase
        .from('customer_messages')
        .select('id,status')
        .eq('id', draftId)
        .eq('cattery_id', catteryId)
        .eq('customer_id', customerId)
        .maybeSingle();
      if (!draft || !['draft', 'failed'].includes(draft.status)) {
        res.status(409).json({ error: 'This draft is no longer available. Refresh Messages and try again.' });
        return;
      }
      const { data: queued, error: queueError } = await supabase
        .from('customer_messages')
        .update({
          booking_id: resolvedBookingId,
          channel: 'email',
          direction: 'outbound',
          subject,
          body,
          status: 'queued',
          provider: 'resend',
          metadata: { prepared_at: preparedAt },
          created_by: user.id,
        })
        .eq('id', draft.id)
        .select('id')
        .single();
      if (queueError || !queued) throw queueError || new Error('The message history row was not returned.');
      messageId = queued.id;
    } else {
      const { data: queued, error: queueError } = await supabase
        .from('customer_messages')
        .insert({
          cattery_id: catteryId,
          customer_id: customerId,
          booking_id: resolvedBookingId,
          channel: 'email',
          direction: 'outbound',
          subject,
          body,
          status: 'queued',
          provider: 'resend',
          metadata: { prepared_at: preparedAt },
          created_by: user.id,
        })
        .select('id')
        .single();
      if (queueError || !queued) throw queueError || new Error('The message history row was not returned.');
      messageId = queued.id;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: customer.email,
      replyTo: cattery.email || undefined,
      subject,
      html: customerMessageHtml({
        customerName: customer.name,
        catteryName: cattery.name,
        subject,
        message: body,
      }),
    });
    if (error) {
      await supabase.from('customer_messages').update({
        status: 'failed',
        metadata: { prepared_at: preparedAt, failure_reason: error.message },
      }).eq('id', messageId);
      res.status(502).json({ error: `The email was not sent. ${error.message}`, messageId });
      return;
    }

    const sentAt = new Date().toISOString();
    const { error: finaliseError } = await supabase.from('customer_messages').update({
      status: 'sent',
      provider_message_id: data?.id || null,
      sent_at: sentAt,
      metadata: { prepared_at: preparedAt, sent_at: sentAt },
    }).eq('id', messageId);
    if (finaliseError) console.warn('[email] customer message history finalise failed:', finaliseError.message);

    void notifyCustomer(customer.id, cattery.id, {
      type: 'customer_message',
      title: `Message from ${cattery.name}`,
      body: subject,
      url: '/client-portal',
      tag: `catstays-message-${messageId}`,
      metadata: { messageId, bookingId: resolvedBookingId },
    });
    res.json({ success: true, id: data?.id, messageId, historyFinalised: !finaliseError });
  } catch (error) {
    console.error('[email] customer-message exception:', error);
    if (messageId) {
      await supabase.from('customer_messages').update({
        status: 'failed',
        metadata: { failure_reason: error instanceof Error ? error.message : 'Unexpected delivery error' },
      }).eq('id', messageId);
    }
    res.status(503).json({
      error: 'The email was not sent because its dashboard history could not be saved. Refresh and try again.',
    });
  }
});

router.post('/email/cat-update', async (req, res) => {
  const catteryId = String(req.body?.catteryId || '');
  const bookingId = String(req.body?.bookingId || '');
  const customerId = String(req.body?.customerId || '');
  const catId = String(req.body?.catId || '');
  const storagePath = String(req.body?.storagePath || '').trim();
  const caption = String(req.body?.caption || '').replace(/\r\n/g, '\n').trim();
  const user = await authenticatedUser(req);

  if (!user || !catteryId || !bookingId || !customerId || !catId || !storagePath || !caption) {
    res.status(400).json({ success: false, saved: false, error: 'Choose a booked cat, photo and message before sending.' });
    return;
  }
  if (!supabase) {
    res.status(503).json({ success: false, saved: false, error: 'Photo updates are not configured on this server.' });
    return;
  }
  if (!(await canManageCattery(user.id, catteryId))) {
    res.status(403).json({ success: false, saved: false, error: 'This staff account cannot send updates for that cattery.' });
    return;
  }
  if (caption.length > 2000) {
    res.status(400).json({ success: false, saved: false, error: 'Keep the update under 2,000 characters.' });
    return;
  }
  if (!storagePath.startsWith(`${catteryId}/${bookingId}/`) || storagePath.length > 500) {
    res.status(400).json({ success: false, saved: false, error: 'That photo is not in the selected cattery booking folder.' });
    return;
  }

  try {
    const [{ data: cattery }, { data: customer }, { data: booking }, { data: cat }, { data: bookingCat }] = await Promise.all([
      supabase.from('catteries').select('id,name,email,slug').eq('id', catteryId).maybeSingle(),
      supabase.from('customers').select('id,cattery_id,name,email,user_id').eq('id', customerId).eq('cattery_id', catteryId).maybeSingle(),
      supabase.from('bookings').select('id,cattery_id,customer_id,status').eq('id', bookingId).eq('cattery_id', catteryId).maybeSingle(),
      supabase.from('cats').select('id,cattery_id,customer_id,name').eq('id', catId).eq('cattery_id', catteryId).maybeSingle(),
      supabase.from('booking_cats').select('id').eq('booking_id', bookingId).eq('cat_id', catId).maybeSingle(),
    ]);
    if (!cattery || !customer || !booking || !cat || !bookingCat
      || booking.customer_id !== customer.id || cat.customer_id !== customer.id || booking.status === 'cancelled') {
      res.status(409).json({ success: false, saved: false, error: 'That cat is not linked to the selected active booking and customer.' });
      return;
    }

    const slash = storagePath.lastIndexOf('/');
    const folder = storagePath.slice(0, slash);
    const filename = storagePath.slice(slash + 1);
    const { data: storedFiles, error: listError } = await supabase.storage
      .from('cat-update-photos')
      .list(folder, { limit: 5, search: filename });
    if (listError || !storedFiles?.some((file) => file.name === filename)) {
      res.status(409).json({ success: false, saved: false, error: 'The uploaded photo could not be verified. Choose it again and retry.' });
      return;
    }

    const { data: update, error: updateError } = await supabase.from('cat_updates').insert({
      cattery_id: catteryId,
      booking_id: bookingId,
      customer_id: customerId,
      cat_id: catId,
      caption,
      storage_bucket: 'cat-update-photos',
      storage_path: storagePath,
      status: 'queued',
      created_by: user.id,
    }).select('id').single();
    if (updateError || !update) throw updateError || new Error('The cat update was not returned after saving.');

    const portalUrl = catUpdatePortalUrl(req, cattery.slug, update.id);
    const { data: signedPhoto } = await supabase.storage.from('cat-update-photos').createSignedUrl(storagePath, 60 * 60 * 24 * 7);
    const hasEmail = /^\S+@\S+\.\S+$/.test(String(customer.email || ''));
    let emailSent = false;
    let providerMessageId: string | null = null;
    let deliveryError = '';

    if (hasEmail) {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: customer.email,
        replyTo: cattery.email || undefined,
        subject: `New update for ${cat.name} from ${cattery.name}`,
        html: customerPhotoUpdateHtml({
          customerName: customer.name,
          catteryName: cattery.name,
          catName: cat.name,
          caption,
          imageUrl: signedPhoto?.signedUrl,
          portalUrl,
        }),
      });
      emailSent = !error;
      providerMessageId = data?.id || null;
      deliveryError = error?.message || '';
    }

    const finalStatus = emailSent ? 'sent' : hasEmail ? 'failed' : 'portal_only';
    const sentAt = emailSent ? new Date().toISOString() : null;
    await supabase.from('cat_updates').update({
      status: finalStatus,
      email_provider_message_id: providerMessageId,
      email_sent_at: sentAt,
    }).eq('id', update.id);

    void notifyCustomer(customer.id, cattery.id, {
      type: 'cat_update',
      title: `New update for ${cat.name}`,
      body: `${cattery.name} shared a photo from ${cat.name}'s stay.`,
      url: `/client-portal?update=${encodeURIComponent(update.id)}`,
      tag: `catstays-cat-update-${update.id}`,
      metadata: { updateId: update.id, bookingId, catId },
    });

    if (hasEmail && !emailSent) {
      res.status(502).json({
        success: false,
        saved: true,
        updateId: update.id,
        emailSent: false,
        error: `The photo update is saved in the client portal, but the email was not sent. ${deliveryError}`.trim(),
      });
      return;
    }
    res.json({ success: true, saved: true, updateId: update.id, emailSent });
  } catch (error) {
    console.error('[email] cat-update exception:', error);
    res.status(503).json({ success: false, saved: false, error: 'The photo update could not be saved. Refresh and try again.' });
  }
});

router.post('/bookings/request', async (req, res) => {
  const {
    catteryId,
    customerName, customerEmail, phone,
    catNames, checkIn, checkOut, checkInTime, checkOutTime, displayCheckIn, displayCheckOut, days, nights,
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

    if (!resolvedRoomId) {
      res.status(409).json({ error: 'That accommodation option is no longer available. Please choose a room again.' });
      return;
    }

    const { data: resolvedRoom, error: roomError } = await supabase
      .from('rooms')
      .select('id,name,type,capacity,room_count,is_active')
      .eq('id', resolvedRoomId)
      .eq('cattery_id', catteryId)
      .maybeSingle();
    if (roomError || !resolvedRoom?.is_active) {
      res.status(409).json({ error: 'That accommodation option is no longer available. Please choose a room again.' });
      return;
    }
    if (Number(resolvedRoom.capacity) < numCats) {
      res.status(409).json({
        error: `${resolvedRoom.name} can hold ${resolvedRoom.capacity} cat${resolvedRoom.capacity === 1 ? '' : 's'} per room. Please choose another option.`,
      });
      return;
    }

    const { data: overlappingBookings, error: availabilityError } = await supabase
      .from('bookings')
      .select('id,room_id,room_unit_number,check_in,check_out,status,booking_cat_rooms(room_id,room_unit_number)')
      .eq('cattery_id', catteryId)
      .neq('status', 'cancelled')
      .lte('check_in', checkOut)
      .gte('check_out', checkIn);
    if (availabilityError) {
      console.error('[bookings/request] physical room availability failed:', availabilityError.message);
      res.status(503).json({ error: 'Availability could not be checked. Please try again.' });
      return;
    }
    const resolvedRoomUnitNumber = firstAvailablePhysicalRoom(
      resolvedRoomId,
      Number(resolvedRoom.room_count),
      overlappingBookings || [],
      checkIn,
      checkOut,
    );
    if (!resolvedRoomUnitNumber) {
      res.status(409).json({ error: `${resolvedRoom.name} is fully booked for those dates. Please choose another option or different dates.` });
      return;
    }

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
      room_unit_number: resolvedRoomUnitNumber,
      check_in: checkIn,
      check_out: checkOut,
      check_in_time: checkInTime || null,
      check_out_time: checkOutTime || null,
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
      url: `/staff-dashboard/bookings?booking=${encodeURIComponent(String(booking?.id || ''))}`,
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
