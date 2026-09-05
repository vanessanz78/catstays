import { Router, type IRouter, type Request } from 'express';
import { requestBookingPayment } from './catteryPayments.js';
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
import { planPhysicalRoomStay } from '../lib/physicalRoomInventory.js';
import { checkParallelRunRequest } from '../lib/parallelRun.js';
import { refreshAvailableWaitlists } from './bookings.js';

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
    supabase.from('staff_memberships').select('id').eq('cattery_id', catteryId).eq('user_id', userId).eq('status', 'active').in('role', ['owner', 'manager', 'staff']).maybeSingle(),
  ]);
  return Boolean(owner?.id || staff?.id);
}

function petcoverEligibility(dateOfBirth: string, referenceDate: string) {
  const dob = new Date(`${dateOfBirth}T12:00:00`);
  const reference = new Date(`${referenceDate}T12:00:00`);
  if (!dateOfBirth || Number.isNaN(dob.getTime()) || Number.isNaN(reference.getTime())) {
    return { eligible: false, reason: 'Enter a valid date of birth.' };
  }
  let ageInMonths = (reference.getFullYear() - dob.getFullYear()) * 12 + reference.getMonth() - dob.getMonth();
  if (reference.getDate() < dob.getDate()) ageInMonths -= 1;
  if (ageInMonths < 0) return { eligible: false, reason: 'Date of birth cannot be in the future.' };
  if (ageInMonths >= 12) return { eligible: false, reason: 'The introductory offer is for cats under 12 months.' };
  return { eligible: true, reason: 'Under 12 months.' };
}

const petcoverDeclarationKeys = [
  'vaccinationsCurrent',
  'noPreExistingConditions',
  'noCurrentIllnessOrInjury',
  'noMedication',
  'noExistingCover',
  'informationAccurate',
  'ownerNotified',
  'dutyOfDisclosure',
] as const;

function hasPetcoverDeclarations(value: unknown) {
  if (!value || typeof value !== 'object') return false;
  return petcoverDeclarationKeys.every((key) => (value as Record<string, unknown>)[key] === true);
}

function validBookingDateRange(checkIn: unknown, checkOut: unknown) {
  const start = String(checkIn || '');
  const end = String(checkOut || '');
  return /^\d{4}-\d{2}-\d{2}$/.test(start)
    && /^\d{4}-\d{2}-\d{2}$/.test(end)
    && end >= start;
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
  if (req.body?.paymentRequest === 'deposit' || req.body?.paymentRequest === 'full') {
    await requestBookingPayment(req, res, true);
    return;
  }
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

router.post('/email/customer-reply', async (req, res) => {
  const subject = String(req.body?.subject || '').trim();
  const body = String(req.body?.body || '').replace(/\r\n/g, '\n').trim();
  const bookingId = String(req.body?.bookingId || '').trim();
  const user = await authenticatedUser(req);

  if (!user || !subject || !body) {
    res.status(400).json({ success: false, saved: false, error: 'Add a subject and message before sending.' });
    return;
  }
  if (subject.length > 180 || body.length > 4000) {
    res.status(400).json({ success: false, saved: false, error: 'Keep the subject under 180 characters and the message under 4,000 characters.' });
    return;
  }
  if (!supabase) {
    res.status(503).json({ success: false, saved: false, error: 'Client messaging is not configured on this server.' });
    return;
  }

  try {
    const { data: customer } = await supabase
      .from('customers')
      .select('id,cattery_id,name,email,phone')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();
    if (!customer) {
      res.status(403).json({ success: false, saved: false, error: 'No customer record is linked to this login.' });
      return;
    }

    const { data: cattery } = await supabase
      .from('catteries')
      .select('id,name,email')
      .eq('id', customer.cattery_id)
      .maybeSingle();
    if (!cattery) {
      res.status(404).json({ success: false, saved: false, error: 'The linked cattery could not be found.' });
      return;
    }

    let resolvedBookingId: string | null = null;
    if (bookingId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('id', bookingId)
        .eq('cattery_id', customer.cattery_id)
        .eq('customer_id', customer.id)
        .maybeSingle();
      if (!booking) {
        res.status(400).json({ success: false, saved: false, error: 'That booking is not connected to this customer login.' });
        return;
      }
      resolvedBookingId = booking.id;
    }

    const sentAt = new Date().toISOString();
    const { data: message, error: messageError } = await supabase
      .from('customer_messages')
      .insert({
        cattery_id: customer.cattery_id,
        customer_id: customer.id,
        booking_id: resolvedBookingId,
        channel: 'portal',
        direction: 'inbound',
        subject,
        body,
        status: 'delivered',
        sent_at: sentAt,
        created_by: user.id,
        metadata: { source: 'client_portal' },
      })
      .select('id')
      .single();
    if (messageError || !message) throw messageError || new Error('The client message was not returned after saving.');

    let emailSent = false;
    let providerMessageId: string | null = null;
    let deliveryError = '';
    if (cattery.email && /^\S+@\S+\.\S+$/.test(cattery.email)) {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: cattery.email,
        replyTo: customer.email || undefined,
        subject: `Client message from ${customer.name}: ${subject}`,
        html: contactEnquiryHtml({
          customerName: customer.name,
          customerEmail: customer.email,
          phone: customer.phone || undefined,
          message: `${subject}\n\n${body}`,
          catteryName: cattery.name,
        }),
      });
      emailSent = !error;
      providerMessageId = data?.id || null;
      deliveryError = error?.message || '';
      await supabase.from('customer_messages').update({
        provider: 'resend',
        provider_message_id: providerMessageId,
        metadata: emailSent
          ? { source: 'client_portal', email_sent_at: sentAt }
          : { source: 'client_portal', email_failure: deliveryError },
      }).eq('id', message.id);
    }

    void notifyCatteryStaff(customer.cattery_id, {
      type: 'customer_message',
      title: `Client message from ${customer.name}`,
      body: subject,
      url: `/staff-dashboard/messages?customer=${encodeURIComponent(customer.id)}`,
      tag: `catstays-client-message-${message.id}`,
      metadata: { messageId: message.id, customerId: customer.id, bookingId: resolvedBookingId },
    });

    res.json({
      success: true,
      saved: true,
      messageId: message.id,
      emailSent,
      warning: deliveryError ? `The message is saved for staff, but the email alert was not sent. ${deliveryError}` : undefined,
    });
  } catch (error) {
    console.error('[email] customer-reply exception:', error);
    res.status(503).json({ success: false, saved: false, error: 'The message could not be saved. Refresh and try again.' });
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
    roomName, roomId, estimatedTotal, specialRequirements, petcoverApplications, requestKind,
  } = req.body;

  if (!catteryId || !customerName || !customerEmail || !catNames || !checkIn || !checkOut) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }
  if (!validBookingDateRange(checkIn, checkOut)) {
    res.status(400).json({ error: 'Choose valid arrival and departure dates.' });
    return;
  }

  try {
    if (!supabase) {
      res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
      return;
    }

    const { data: catteryRecord } = await supabase
      .from('catteries')
      .select('id,name,email,phone,website_settings')
      .eq('id', catteryId)
      .maybeSingle();
    if (!catteryRecord) {
      res.status(404).json({ error: 'Cattery not found.' });
      return;
    }
    const catteryName = catteryRecord.name;
    const catteryEmail = catteryRecord.email;
    const catteryPhone = catteryRecord.phone;
    const testOnly = catteryRecord.website_settings?.bookingMode === 'test_only';
    const petcoverOfferEnabled = catteryRecord.website_settings?.petcoverOfferEnabled === true;
    const requester = await authenticatedUser(req);
    const tester = testOnly ? requester : null;
    const testError = checkParallelRunRequest(catteryRecord.website_settings?.bookingMode,
      Boolean(tester && await canManageCattery(tester.id, catteryId)), req.body?.testOnly,
      tester?.email_confirmed_at ? tester.email : null, customerEmail);
    if (testError) { res.status(403).json({ error: testError }); return; }

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

    const normalizedCatNames = (Array.isArray(catNames) ? catNames : [catNames])
      .map((value: unknown) => String(value || '').trim());
    const catNameKeys = normalizedCatNames.map((name) => name.toLowerCase());
    if (!normalizedCatNames.length || normalizedCatNames.some((name) => !name) || new Set(catNameKeys).size !== normalizedCatNames.length) {
      res.status(400).json({ error: 'Enter one distinct name for each cat.' });
      return;
    }
    const catNamesStr = normalizedCatNames.join(', ');
    const numCats = normalizedCatNames.length;
    const waitlistRequested = requestKind === 'waitlist';
    const requestedPetcoverApplications = petcoverOfferEnabled && Array.isArray(petcoverApplications)
      ? petcoverApplications.filter((application: any) => application?.requested)
      : [];
    const requestedPetcoverKeys = requestedPetcoverApplications.map((application: any) => String(application.catName || '').trim().toLowerCase());
    if (new Set(requestedPetcoverKeys).size !== requestedPetcoverKeys.length || requestedPetcoverKeys.some((key: string) => !catNameKeys.includes(key))) {
      res.status(400).json({ error: 'Choose each Petcover cat once from this booking.' });
      return;
    }

    for (const application of requestedPetcoverApplications) {
      const eligibility = petcoverEligibility(String(application.dateOfBirth || ''), checkIn);
      const validAcquisition = ['purchased', 'rescued', 'unknown'].includes(application.acquisitionType);
      const validSex = ['female', 'male', 'unknown'].includes(application.sex);
      const purchasePriceValid = application.acquisitionType !== 'purchased'
        || (application.purchasePrice !== '' && Number.isFinite(Number(application.purchasePrice)) && Number(application.purchasePrice) >= 0);
      if (
        !application.catName
        || !eligibility.eligible
        || !validAcquisition
        || application.acquisitionType === 'unknown'
        || !validSex
        || application.sex === 'unknown'
        || !purchasePriceValid
        || !hasPetcoverDeclarations(application.declarations)
      ) {
        res.status(400).json({ error: 'Complete the Petcover eligibility details and declarations for each selected cat.' });
        return;
      }
    }

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
      .select('id,room_id,room_unit_number,check_in,check_out,status,booking_cat_rooms(room_id,room_unit_number),booking_room_segments(room_id,room_unit_number,starts_on,ends_on)')
      .eq('cattery_id', catteryId)
      .neq('status', 'cancelled')
      .lte('check_in', checkOut)
      .gte('check_out', checkIn);
    if (availabilityError) {
      console.error('[bookings/request] physical room availability failed:', availabilityError.message);
      res.status(503).json({ error: 'Availability could not be checked. Please try again.' });
      return;
    }
    const resolvedRoomPlan = planPhysicalRoomStay(
      resolvedRoomId,
      Number(resolvedRoom.room_count),
      overlappingBookings || [],
      checkIn,
      checkOut,
    );
    if (waitlistRequested && resolvedRoomPlan) {
      res.status(409).json({ error: `${resolvedRoom.name} has just become available. Please choose it as a booking instead of joining the waitlist.`, refreshAvailability: true });
      return;
    }
    if (!waitlistRequested && !resolvedRoomPlan) {
      res.status(409).json({ error: `${resolvedRoom.name} is fully booked for those dates. You can join the waitlist or choose another option.`, waitlistAvailable: true });
      return;
    }
    const resolvedRoomUnitNumber = waitlistRequested ? null : resolvedRoomPlan?.[0]?.unitNumber || null;
    const storedRequestKind = waitlistRequested ? 'waitlist' : (resolvedRoomPlan?.length || 0) > 1 ? 'split' : 'booking';

    const normalizedEmail = String(customerEmail).trim().toLowerCase();
    const { data: existingCustomer } = requester && !testOnly
      ? await supabase
        .from('customers')
        .select('id,user_id,email')
        .eq('cattery_id', catteryId)
        .eq('user_id', requester.id)
        .limit(1)
        .maybeSingle()
      : { data: null };

    // A public email address is not proof of identity. Reuse only the signed-in
    // customer's exact linked record; otherwise create a separate request that
    // staff can review or merge without overwriting an existing profile.
    let customerId = !testOnly && existingCustomer?.email?.trim().toLowerCase() === normalizedEmail
      ? existingCustomer.id
      : null;
    let createdCustomerId: string | null = null;
    const createdCatIds: string[] = [];
    const rollbackBookingRequest = async (bookingId?: string) => {
      if (bookingId) {
        const { error } = await supabase.from('bookings').delete().eq('id', bookingId).eq('cattery_id', catteryId);
        if (error) console.warn('[bookings/request] booking rollback failed:', error.message);
      }
      if (createdCustomerId) {
        const { error } = await supabase.from('customers').delete().eq('id', createdCustomerId).eq('cattery_id', catteryId);
        if (error) console.warn('[bookings/request] customer rollback failed:', error.message);
      } else if (createdCatIds.length) {
        const { error } = await supabase.from('cats').delete().in('id', createdCatIds).eq('customer_id', customerId).eq('cattery_id', catteryId);
        if (error) console.warn('[bookings/request] cat rollback failed:', error.message);
      }
    };
    if (!customerId) {
      const { data: createdCustomer, error: customerError } = await supabase.from('customers').insert({
        cattery_id: catteryId,
        name: testOnly ? `[TEST] ${customerName}` : customerName,
        email: normalizedEmail,
        phone: phone || null,
      }).select('id,user_id').single();
      if (customerError) {
        console.error('[bookings/request] customer record failed:', customerError.message);
        res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
        return;
      }
      customerId = createdCustomer.id;
      createdCustomerId = createdCustomer.id;
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
      status: waitlistRequested ? 'waitlist' : 'pending',
      payment_status: 'unpaid',
      total_amount: totalAmount,
      notes: testOnly ? `[CATSTAYS TEST ONLY — Revelation Pets remains primary]\n${specialRequirements || ''}` : specialRequirements || null,
      guest_name: testOnly ? `[TEST] ${customerName}` : customerName,
      guest_email: customerEmail,
      guest_phone: phone || null,
      cat_names: catNamesStr,
      number_of_cats: numCats,
    }).select('id').single();

    if (bookingError) {
      console.error('[bookings/request] DB insert failed:', bookingError);
      await rollbackBookingRequest();
      res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
      return;
    }

    if (!waitlistRequested && resolvedRoomPlan && resolvedRoomPlan.length > 1) {
      const { error: segmentError } = await supabase.from('booking_room_segments').insert(
        resolvedRoomPlan.map((segment) => ({
          cattery_id: catteryId,
          booking_id: booking.id,
          room_id: segment.roomId,
          room_unit_number: segment.unitNumber,
          starts_on: segment.startsOn,
          ends_on: segment.endsOn,
          created_by: requester?.id || null,
        })),
      );
      if (segmentError) {
        console.error('[bookings/request] split-room plan failed:', segmentError.message);
        await rollbackBookingRequest(booking.id);
        res.status(409).json({ error: 'That split-room plan is no longer available. Please refresh and try again.' });
        return;
      }
    }

    const requestedByCatName = new Map(
      requestedPetcoverApplications.map((application: any) => [String(application.catName).trim().toLowerCase(), application]),
    );
    const resolvedCats: Array<{ id: string; key: string }> = [];
    for (const name of normalizedCatNames) {
      const application = requestedByCatName.get(name.toLowerCase());
      const catFields = application ? {
        date_of_birth: application.dateOfBirth || null,
        sex: application.sex || null,
        acquisition_type: application.acquisitionType || null,
        purchase_price: application.purchasePrice === '' ? null : Number(application.purchasePrice),
        microchip_number: String(application.microchipNumber || '').trim() || null,
      } : {};
      const { data: existingCat, error: existingCatError } = await supabase
        .from('cats')
        .select('id')
        .eq('customer_id', customerId)
        .eq('cattery_id', catteryId)
        .ilike('name', name)
        .limit(1)
        .maybeSingle();
      if (existingCatError) {
        console.error('[bookings/request] existing cat lookup failed:', existingCatError.message);
        await rollbackBookingRequest(booking.id);
        res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
        return;
      }
      let catId = existingCat?.id;
      if (!catId) {
        const { data: createdCat, error: catError } = await supabase.from('cats').insert({
          cattery_id: catteryId,
          customer_id: customerId,
          name,
          breed: application?.breed || null,
          ...catFields,
        }).select('id').single();
        if (catError || !createdCat) {
          console.error('[bookings/request] cat record failed:', catError?.message);
          await rollbackBookingRequest(booking.id);
          res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
          return;
        }
        catId = createdCat.id;
        createdCatIds.push(createdCat.id);
      }
      if (catId) resolvedCats.push({ id: catId, key: name.toLowerCase() });
    }

    if (resolvedCats.length > 0) {
      const { error: bookingCatsError } = await supabase.from('booking_cats').insert(
        resolvedCats.map(({ id }) => ({ booking_id: booking.id, cat_id: id })),
      );
      if (bookingCatsError) {
        console.error('[bookings/request] booking cat link failed:', bookingCatsError.message);
        await rollbackBookingRequest(booking.id);
        res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
        return;
      }
    }

    if (requestedPetcoverApplications.length > 0) {
      const catIdByName = new Map(
        resolvedCats.map(({ id, key }) => [key, id]),
      );
      const { error: insuranceError } = await supabase.from('petcover_applications').insert(
        requestedPetcoverApplications.map((application: any) => ({
          cattery_id: catteryId,
          booking_id: booking.id,
          customer_id: customerId,
          cat_id: catIdByName.get(String(application.catName).trim().toLowerCase()),
          offer_code: 'petcover_intro_4_week',
          status: 'ready_to_submit',
          eligibility_reason: petcoverEligibility(String(application.dateOfBirth), checkIn).reason,
          cat_date_of_birth: application.dateOfBirth,
          cat_sex: application.sex,
          acquisition_type: application.acquisitionType,
          purchase_price: application.purchasePrice === '' ? null : Number(application.purchasePrice),
          microchip_number: String(application.microchipNumber || '').trim() || null,
          declarations: application.declarations,
        })),
      );
      if (insuranceError) {
        console.error('[bookings/request] Petcover record failed:', insuranceError.message);
        await rollbackBookingRequest(booking.id);
        res.status(500).json({ error: 'Booking could not be saved. Please contact the cattery directly.' });
        return;
      }
    }

    const bookingBody = waitlistRequested
      ? `${customerName} joined the waitlist for ${catNamesStr || 'a cat stay'} from ${displayCheckIn || checkIn} to ${displayCheckOut || checkOut}.`
      : `${customerName} requested ${catNamesStr || 'a cat stay'} from ${displayCheckIn || checkIn} to ${displayCheckOut || checkOut}.`;
    void notifyCatteryStaff(catteryId, {
      type: waitlistRequested ? 'waitlist_request' : 'booking_request',
      title: testOnly ? `TEST ${waitlistRequested ? 'waitlist' : 'booking'} request` : waitlistRequested ? 'New waitlist request' : 'New booking request',
      body: bookingBody,
      url: `/staff-dashboard/bookings?booking=${encodeURIComponent(String(booking?.id || ''))}`,
      tag: `catstays-booking-${booking?.id || catteryId}`,
      metadata: { bookingId: booking?.id, customerId },
    }).catch((pushError) => {
      console.warn('[bookings/request] native notification failed:', pushError instanceof Error ? pushError.message : pushError);
    });

    if (customerId) {
      void notifyCustomer(customerId, catteryId, {
        type: waitlistRequested ? 'waitlist_received' : 'booking_received',
        title: waitlistRequested ? 'Waitlist request received' : 'Booking received',
        body: `${catteryName} received your ${waitlistRequested ? 'waitlist' : 'booking'} request for ${catNamesStr || 'your cat'}.`,
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
        subject: `${testOnly ? '[TEST ONLY] ' : ''}${waitlistRequested ? 'New waitlist request' : 'New booking request'} from ${customerName}`,
        html: bookingRequestOwnerHtml({
          catteryName, customerName, customerEmail, phone,
          catNames, checkIn: emailCheckIn, checkOut: emailCheckOut, days: stayDays,
          roomName, estimatedTotal, specialRequirements, requestKind: storedRequestKind,
        }),
      }) : Promise.resolve({ data: null, error: new Error('Cattery email is not configured') }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: customerEmail,
        subject: `${testOnly ? '[TEST ONLY] ' : ''}Your ${waitlistRequested ? 'waitlist' : 'booking'} request at ${catteryName}`,
        html: bookingRequestCustomerHtml({
          customerName, catteryName, catteryEmail, catteryPhone,
          catNames, checkIn: emailCheckIn, checkOut: emailCheckOut, days: stayDays,
          roomName, estimatedTotal, requestKind: storedRequestKind,
        }),
      }),
    ]);

    if (ownerResult.error) {
      console.error('[bookings/request] owner email error:', ownerResult.error);
    }
    if (customerResult.error) {
      console.error('[bookings/request] customer email error:', customerResult.error);
    }

    console.log(`[bookings/request] saved ${waitlistRequested ? 'waitlist' : 'pending booking'} to DB for cattery`, catteryId);
    void refreshAvailableWaitlists();
    res.json({ success: true, bookingStored: true, status: waitlistRequested ? 'waitlist' : 'pending', requestKind: storedRequestKind, ownerEmailId: ownerResult.data?.id, customerEmailId: customerResult.data?.id });
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
