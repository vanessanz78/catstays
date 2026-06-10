import { Router, type IRouter } from 'express';
import { resend, FROM_ADDRESS } from '../lib/resend';
import {
  bookingConfirmationHtml,
  contactEnquiryHtml,
  bookingRequestOwnerHtml,
  bookingRequestCustomerHtml,
} from '../lib/emailTemplates';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env['VITE_SUPABASE_URL']!,
  process.env['VITE_SUPABASE_ANON_KEY']!
);

const router: IRouter = Router();

router.post('/email/booking-confirmation', async (req, res) => {
  const {
    customerName, customerEmail, catteryName, catName, roomName,
    checkIn, checkOut, nights, pricePerNight, subtotal, gst, totalAmount, deposit,
    bookingRef, catteryEmail,
  } = req.body;

  if (!customerEmail || !customerName || !catteryName || !checkIn || !checkOut || !roomName) {
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
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] booking-confirmation exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/email/contact-enquiry', async (req, res) => {
  const { customerName, customerEmail, message, catteryName, catteryEmail, phone } = req.body;

  if (!customerName || !customerEmail || !message || !catteryName || !catteryEmail) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: catteryEmail,
      replyTo: customerEmail,
      subject: `New enquiry from ${customerName}`,
      html: contactEnquiryHtml({ customerName, customerEmail, message, catteryName, phone }),
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] contact-enquiry exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.post('/bookings/request', async (req, res) => {
  const {
    catteryId, catteryName, catteryEmail, catteryPhone,
    customerName, customerEmail, phone,
    catNames, checkIn, checkOut, nights,
    roomName, roomId, estimatedTotal, specialRequirements,
  } = req.body;

  if (!customerName || !customerEmail || !catNames || !checkIn || !checkOut || !catteryEmail) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const [ownerResult, customerResult] = await Promise.all([
      resend.emails.send({
        from: FROM_ADDRESS,
        to: catteryEmail,
        replyTo: customerEmail,
        subject: `New booking request from ${customerName}`,
        html: bookingRequestOwnerHtml({
          catteryName, customerName, customerEmail, phone,
          catNames, checkIn, checkOut, nights,
          roomName, estimatedTotal, specialRequirements,
        }),
      }),
      resend.emails.send({
        from: FROM_ADDRESS,
        to: customerEmail,
        subject: `Your booking request at ${catteryName}`,
        html: bookingRequestCustomerHtml({
          customerName, catteryName, catteryEmail, catteryPhone,
          catNames, checkIn, checkOut, nights,
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

    // Save pending booking to database
    if (catteryId) {
      try {
        // Parse total amount (strip "$" and " incl. GST")
        const amountStr = String(estimatedTotal || '').replace(/[^0-9.]/g, '');
        const totalAmount = amountStr ? parseFloat(amountStr) : null;

        // Look up room by name if room ID not provided
        let resolvedRoomId = roomId || null;
        if (!resolvedRoomId && roomName && catteryId) {
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

        await supabase.from('bookings').insert({
          cattery_id: catteryId,
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
        });

        console.log('[bookings/request] saved pending booking to DB for cattery', catteryId);
      } catch (dbErr) {
        console.error('[bookings/request] DB insert failed (emails still sent):', dbErr);
      }
    }

    res.json({ success: true, ownerEmailId: ownerResult.data?.id, customerEmailId: customerResult.data?.id });
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
      subject: 'CatStays — Email is working!',
      html: `
        <div style="font-family:Georgia,serif;max-width:480px;margin:32px auto;padding:32px;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
          <h2 style="color:#2d3e2f;margin-top:0">Email integration confirmed ✓</h2>
          <p style="color:#5c6b5e">Your CatStays Resend integration is working correctly. Booking confirmations and enquiry emails will be delivered from <strong>bookings@catstays.app</strong>.</p>
          <hr style="border:none;border-top:1px solid #e8e4dd;margin:24px 0"/>
          <p style="color:#9aaa9c;font-size:12px;margin:0">Powered by CatStays &amp; Resend</p>
        </div>
      `,
    });
    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('[email] test exception:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
