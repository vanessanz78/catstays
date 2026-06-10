export function bookingConfirmationHtml(opts: {
  customerName: string;
  catteryName: string;
  catName?: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights?: number;
  pricePerNight?: string;
  subtotal?: string;
  gst?: string;
  totalAmount?: string;
  deposit?: string;
  bookingRef: string;
}) {
  const showReceipt = opts.totalAmount || opts.subtotal;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Georgia, serif; background: #F6F4EF; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #2d3e2f; padding: 32px; text-align: center; }
    .header h1 { color: #F6F4EF; font-size: 24px; margin: 0 0 4px; }
    .header p { color: #7DAF7B; margin: 0; font-size: 14px; }
    .body { padding: 32px; }
    .body h2 { color: #2d3e2f; font-size: 20px; margin-bottom: 8px; }
    .body p { color: #5c6b5e; line-height: 1.6; }
    .badge { display: inline-block; background: #7DAF7B; color: #fff; border-radius: 20px; padding: 4px 14px; font-size: 12px; margin-bottom: 16px; }
    .card { background: #F6F4EF; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e4dd; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #6b7a6d; }
    .card-value { color: #2d3e2f; font-weight: 500; }
    .receipt { background: #f0f4f0; border-radius: 12px; padding: 20px 24px; margin: 20px 0; border: 1px solid #d0ddd0; }
    .receipt h3 { color: #2d3e2f; font-size: 15px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .receipt-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; color: #5c6b5e; }
    .receipt-total { display: flex; justify-content: space-between; padding: 10px 0 0; border-top: 2px solid #2d3e2f; font-size: 16px; font-weight: bold; color: #2d3e2f; margin-top: 8px; }
    .deposit-note { background: #fff8e8; border: 1px solid #f0d080; border-radius: 8px; padding: 12px 16px; margin-top: 12px; font-size: 13px; color: #7a6010; }
    .footer { background: #F6F4EF; padding: 20px 32px; text-align: center; }
    .footer p { color: #9aaa9c; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${opts.catteryName}</h1>
      <p>Booking Confirmation</p>
    </div>
    <div class="body">
      <span class="badge">Confirmed</span>
      <h2>You're all booked, ${opts.customerName.split(' ')[0]}!</h2>
      <p>We're looking forward to welcoming ${opts.catName ? opts.catName : 'your cat'} to ${opts.catteryName}.</p>

      <div class="card">
        <div class="card-row">
          <span class="card-label">Booking reference</span>
          <span class="card-value">#${opts.bookingRef}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Room</span>
          <span class="card-value">${opts.roomName}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Check-in</span>
          <span class="card-value">${opts.checkIn}</span>
        </div>
        <div class="card-row">
          <span class="card-label">Check-out</span>
          <span class="card-value">${opts.checkOut}</span>
        </div>
        ${opts.nights ? `<div class="card-row"><span class="card-label">Duration</span><span class="card-value">${opts.nights} nights</span></div>` : ''}
      </div>

      ${showReceipt ? `
      <div class="receipt">
        <h3>Invoice / Receipt</h3>
        ${opts.pricePerNight && opts.nights ? `<div class="receipt-row"><span>${opts.roomName} × ${opts.nights} nights @ ${opts.pricePerNight}/night</span><span>${opts.subtotal}</span></div>` : ''}
        ${opts.subtotal && opts.gst ? `<div class="receipt-row"><span>GST (15%)</span><span>${opts.gst}</span></div>` : ''}
        <div class="receipt-total"><span>Total</span><span>${opts.totalAmount}</span></div>
        ${opts.deposit ? `<div class="deposit-note">Deposit required: <strong>${opts.deposit}</strong> — balance due at check-out</div>` : ''}
      </div>
      ` : ''}

      <p>If you need to make any changes or have questions, please contact ${opts.catteryName} directly. We look forward to meeting your cat!</p>
    </div>
    <div class="footer">
      <p>Powered by CatStays &mdash; Professional Cattery Management</p>
    </div>
  </div>
</body>
</html>
`;
}

export function contactEnquiryHtml(opts: {
  customerName: string;
  customerEmail: string;
  message: string;
  catteryName: string;
  phone?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>New Enquiry — ${opts.catteryName}</title>
  <style>
    body { font-family: Georgia, serif; background: #F6F4EF; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #C46A3A; padding: 24px 32px; }
    .header h1 { color: #fff; font-size: 20px; margin: 0; }
    .body { padding: 32px; }
    .body p { color: #5c6b5e; line-height: 1.6; }
    .card { background: #F6F4EF; border-radius: 12px; padding: 16px 20px; margin: 12px 0; }
    .label { color: #6b7a6d; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .value { color: #2d3e2f; font-size: 15px; }
    .message-box { background: #F6F4EF; border-left: 4px solid #C46A3A; padding: 16px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; color: #2d3e2f; line-height: 1.7; }
    .footer { background: #F6F4EF; padding: 20px 32px; text-align: center; }
    .footer p { color: #9aaa9c; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New enquiry for ${opts.catteryName}</h1>
    </div>
    <div class="body">
      <div class="card">
        <div class="label">Name</div>
        <div class="value">${opts.customerName}</div>
      </div>
      <div class="card">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${opts.customerEmail}" style="color:#C46A3A">${opts.customerEmail}</a></div>
      </div>
      ${opts.phone ? `<div class="card"><div class="label">Phone</div><div class="value">${opts.phone}</div></div>` : ''}
      <div class="label" style="margin-top: 20px;">Message</div>
      <div class="message-box">${opts.message.replace(/\n/g, '<br>')}</div>
      <p>Reply directly to this email to respond to ${opts.customerName.split(' ')[0]}.</p>
    </div>
    <div class="footer">
      <p>Powered by CatStays &mdash; Professional Cattery Management</p>
    </div>
  </div>
</body>
</html>
`;
}

export function bookingRequestOwnerHtml(opts: {
  catteryName: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  catNames: string[];
  checkIn: string;
  checkOut: string;
  nights: number;
  roomName: string;
  estimatedTotal: string;
  specialRequirements?: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>New Booking Request — ${opts.catteryName}</title>
  <style>
    body { font-family: Georgia, serif; background: #F6F4EF; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #2d3e2f; padding: 24px 32px; }
    .header h1 { color: #F6F4EF; font-size: 20px; margin: 0 0 4px; }
    .header p { color: #7DAF7B; margin: 0; font-size: 13px; }
    .body { padding: 32px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7a6d; margin: 24px 0 8px; }
    .card { background: #F6F4EF; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
    .card-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e8e4dd; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #6b7a6d; }
    .card-value { color: #2d3e2f; font-weight: 500; }
    .highlight { background: #e8f4e8; border: 1px solid #7DAF7B; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
    .highlight p { margin: 0; color: #2d3e2f; font-size: 15px; }
    .note { background: #fff8e8; border: 1px solid #f0d080; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 13px; color: #7a6010; }
    .cta { text-align: center; margin: 24px 0; }
    .btn { background: #2d3e2f; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; display: inline-block; }
    .footer { background: #F6F4EF; padding: 20px 32px; text-align: center; }
    .footer p { color: #9aaa9c; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Booking Request</h1>
      <p>A customer has requested a stay at ${opts.catteryName}</p>
    </div>
    <div class="body">
      <div class="highlight">
        <p><strong>${opts.customerName}</strong> wants to book <strong>${opts.nights} night${opts.nights !== 1 ? 's' : ''}</strong> for <strong>${opts.catNames.join(', ') || 'their cat(s)'}</strong> — estimated total <strong>${opts.estimatedTotal}</strong></p>
      </div>

      <div class="section-title">Stay Details</div>
      <div class="card">
        <div class="card-row"><span class="card-label">Check-in</span><span class="card-value">${opts.checkIn}</span></div>
        <div class="card-row"><span class="card-label">Check-out</span><span class="card-value">${opts.checkOut}</span></div>
        <div class="card-row"><span class="card-label">Duration</span><span class="card-value">${opts.nights} nights</span></div>
        <div class="card-row"><span class="card-label">Room</span><span class="card-value">${opts.roomName}</span></div>
        <div class="card-row"><span class="card-label">Estimated Total</span><span class="card-value">${opts.estimatedTotal}</span></div>
      </div>

      <div class="section-title">Customer Details</div>
      <div class="card">
        <div class="card-row"><span class="card-label">Name</span><span class="card-value">${opts.customerName}</span></div>
        <div class="card-row"><span class="card-label">Email</span><span class="card-value"><a href="mailto:${opts.customerEmail}" style="color:#C46A3A">${opts.customerEmail}</a></span></div>
        <div class="card-row"><span class="card-label">Phone</span><span class="card-value">${opts.phone}</span></div>
      </div>

      <div class="section-title">Cats</div>
      <div class="card">
        ${opts.catNames.map((name, i) => `<div class="card-row"><span class="card-label">Cat ${i + 1}</span><span class="card-value">${name || 'Unnamed'}</span></div>`).join('')}
      </div>

      ${opts.specialRequirements ? `
      <div class="section-title">Special Requirements</div>
      <div class="card"><p style="margin:0;color:#2d3e2f;font-size:14px;line-height:1.6">${opts.specialRequirements.replace(/\n/g, '<br>')}</p></div>
      ` : ''}

      <div class="note">
        Reply directly to this email or call the customer to confirm. Once confirmed, create the official booking in your CatStays admin dashboard.
      </div>
    </div>
    <div class="footer">
      <p>Powered by CatStays &mdash; Professional Cattery Management</p>
    </div>
  </div>
</body>
</html>
`;
}

export function bookingRequestCustomerHtml(opts: {
  customerName: string;
  catteryName: string;
  catteryEmail?: string;
  catteryPhone?: string;
  catNames: string[];
  checkIn: string;
  checkOut: string;
  nights: number;
  roomName: string;
  estimatedTotal: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Booking Request Received — ${opts.catteryName}</title>
  <style>
    body { font-family: Georgia, serif; background: #F6F4EF; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: #2d3e2f; padding: 32px; text-align: center; }
    .header h1 { color: #F6F4EF; font-size: 24px; margin: 0 0 4px; }
    .header p { color: #7DAF7B; margin: 0; font-size: 14px; }
    .body { padding: 32px; }
    .body h2 { color: #2d3e2f; font-size: 20px; margin-bottom: 8px; }
    .body p { color: #5c6b5e; line-height: 1.6; }
    .badge { display: inline-block; background: #C46A3A; color: #fff; border-radius: 20px; padding: 4px 14px; font-size: 12px; margin-bottom: 16px; }
    .card { background: #F6F4EF; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .card-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e4dd; font-size: 14px; }
    .card-row:last-child { border-bottom: none; }
    .card-label { color: #6b7a6d; }
    .card-value { color: #2d3e2f; font-weight: 500; }
    .next-steps { background: #e8f4e8; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .next-steps h3 { color: #2d3e2f; margin: 0 0 12px; font-size: 16px; }
    .next-steps li { color: #2d3e2f; font-size: 14px; margin-bottom: 8px; }
    .contact-box { border: 1px solid #e8e4dd; border-radius: 12px; padding: 16px 20px; margin-top: 20px; text-align: center; }
    .contact-box p { margin: 4px 0; font-size: 14px; color: #5c6b5e; }
    .footer { background: #F6F4EF; padding: 20px 32px; text-align: center; }
    .footer p { color: #9aaa9c; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>${opts.catteryName}</h1>
      <p>Booking Request Received</p>
    </div>
    <div class="body">
      <span class="badge">Request Received</span>
      <h2>Thanks, ${opts.customerName.split(' ')[0]}!</h2>
      <p>We've received your booking request and will be in touch within 24 hours to confirm your cat's stay.</p>

      <div class="card">
        <div class="card-row"><span class="card-label">Cats</span><span class="card-value">${opts.catNames.join(', ') || 'Your cat(s)'}</span></div>
        <div class="card-row"><span class="card-label">Check-in</span><span class="card-value">${opts.checkIn}</span></div>
        <div class="card-row"><span class="card-label">Check-out</span><span class="card-value">${opts.checkOut}</span></div>
        <div class="card-row"><span class="card-label">Duration</span><span class="card-value">${opts.nights} nights</span></div>
        <div class="card-row"><span class="card-label">Room</span><span class="card-value">${opts.roomName}</span></div>
        <div class="card-row"><span class="card-label">Estimated total</span><span class="card-value">${opts.estimatedTotal}</span></div>
      </div>

      <div class="next-steps">
        <h3>What happens next?</h3>
        <ol>
          <li>We'll review your request and check availability</li>
          <li>We'll contact you within 24 hours to confirm</li>
          <li>You'll receive a deposit payment link to secure the booking</li>
          <li>We'll send you a final confirmation with all details</li>
        </ol>
      </div>

      ${opts.catteryEmail || opts.catteryPhone ? `
      <div class="contact-box">
        <p><strong>Questions?</strong> Contact us directly:</p>
        ${opts.catteryEmail ? `<p><a href="mailto:${opts.catteryEmail}" style="color:#C46A3A">${opts.catteryEmail}</a></p>` : ''}
        ${opts.catteryPhone ? `<p>${opts.catteryPhone}</p>` : ''}
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>Powered by CatStays &mdash; Professional Cattery Management</p>
    </div>
  </div>
</body>
</html>
`;
}
