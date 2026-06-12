type EmailAction = {
  label: string;
  href: string;
};

type DetailRow = {
  label: string;
  value?: string | number | null;
};

type DetailCard = {
  title?: string;
  rows?: DetailRow[];
  html?: string;
  tone?: 'plain' | 'cream' | 'success' | 'warning';
};

type BrandedEmailOptions = {
  title: string;
  preheader: string;
  eyebrow?: string;
  intro?: string;
  badge?: string;
  catteryName?: string;
  cards?: DetailCard[];
  bodyHtml?: string;
  action?: EmailAction;
  secondaryAction?: EmailAction;
  footerNote?: string;
};

const APP_URL = (process.env['CATSTAYS_APP_URL'] || process.env['PUBLIC_APP_URL'] || 'https://catstays.app').replace(/\/$/, '');
const LOGO_URL = process.env['CATSTAYS_EMAIL_LOGO_URL'] || `${APP_URL}/icons/icon-192.png`;

const colors = {
  navy: '#0A1128',
  terracotta: '#C46A3A',
  cream: '#F8F7F5',
  warm: '#F1E6DC',
  sage: '#4F6F5A',
  ink: '#172033',
  muted: '#687386',
  line: '#E8DFD7',
  white: '#FFFFFF',
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtml(value?: string | null) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

function firstName(name?: string) {
  const clean = (name || '').trim();
  return clean ? clean.split(/\s+/)[0] : 'there';
}

function plural(count: number, singular: string, fallbackPlural?: string) {
  return `${count} ${count === 1 ? singular : fallbackPlural || `${singular}s`}`;
}

function catNamesText(catNames?: string[]) {
  const names = Array.isArray(catNames) ? catNames.filter(Boolean) : [];
  return names.length > 0 ? names.join(', ') : 'your cat';
}

function cardBackground(tone: DetailCard['tone']) {
  if (tone === 'success') return '#EEF6F0';
  if (tone === 'warning') return '#FFF6E9';
  if (tone === 'plain') return colors.white;
  return colors.cream;
}

function renderRows(rows: DetailRow[] = []) {
  return rows
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
    .map((row) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${colors.line};font:14px Arial,sans-serif;color:${colors.muted};">${escapeHtml(row.label)}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${colors.line};font:600 14px Arial,sans-serif;color:${colors.ink};">${escapeHtml(row.value)}</td>
      </tr>
    `)
    .join('');
}

function renderCard(card: DetailCard) {
  const rows = renderRows(card.rows);
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${colors.line};border-radius:14px;background:${cardBackground(card.tone)};">
      <tr>
        <td style="padding:22px;">
          ${card.title ? `<h3 style="margin:0 0 12px;font:700 15px Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${colors.navy};">${escapeHtml(card.title)}</h3>` : ''}
          ${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>` : ''}
          ${card.html || ''}
        </td>
      </tr>
    </table>
  `;
}

function renderAction(action?: EmailAction, secondary = false) {
  if (!action) return '';
  const background = secondary ? colors.white : colors.terracotta;
  const border = secondary ? colors.line : colors.terracotta;
  const textColor = secondary ? colors.navy : colors.white;

  return `
    <a href="${escapeHtml(action.href)}" style="display:inline-block;margin:8px 6px 0;padding:14px 22px;border:1px solid ${border};border-radius:999px;background:${background};color:${textColor};font:700 14px Arial,sans-serif;text-decoration:none;">
      ${escapeHtml(action.label)}
    </a>
  `;
}

export function catstaysEmailLayout(options: BrandedEmailOptions) {
  const cards = (options.cards || []).map(renderCard).join('');
  const footerNote = options.footerNote || 'You are receiving this because you use CatStays or contacted a cattery powered by CatStays.';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(options.title)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${colors.white};border-radius:20px;overflow:hidden;border:1px solid ${colors.line};box-shadow:0 18px 42px rgba(10,17,40,.08);">
          <tr>
            <td style="padding:28px 32px;background:${colors.navy};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${escapeHtml(LOGO_URL)}" width="48" height="48" alt="CatStays" style="display:inline-block;width:48px;height:48px;border-radius:12px;vertical-align:middle;margin-right:12px;" />
                    <span style="display:inline-block;vertical-align:middle;font:700 24px Georgia,serif;color:${colors.white};">CatStays</span>
                  </td>
                  <td align="right" style="vertical-align:middle;font:700 11px Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#F1C29C;">
                    ${escapeHtml(options.eyebrow || 'Cattery care')}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 36px 20px;background:${colors.white};">
              ${options.badge ? `<div style="display:inline-block;margin-bottom:16px;padding:7px 12px;border-radius:999px;background:${colors.warm};color:${colors.terracotta};font:700 12px Arial,sans-serif;">${escapeHtml(options.badge)}</div>` : ''}
              <h1 style="margin:0;font:700 34px/1.12 Georgia,serif;color:${colors.navy};">${escapeHtml(options.title)}</h1>
              ${options.catteryName ? `<p style="margin:10px 0 0;font:700 15px Arial,sans-serif;color:${colors.sage};">${escapeHtml(options.catteryName)}</p>` : ''}
              ${options.intro ? `<p style="margin:18px 0 0;font:16px/1.65 Arial,sans-serif;color:${colors.muted};">${textToHtml(options.intro)}</p>` : ''}
              ${options.action || options.secondaryAction ? `<div style="margin-top:22px;">${renderAction(options.action)}${renderAction(options.secondaryAction, true)}</div>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 26px;background:${colors.white};">
              ${cards}
              ${options.bodyHtml || ''}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px;background:${colors.navy};">
              <p style="margin:0 0 8px;font:700 14px Arial,sans-serif;color:${colors.white};">CatStays</p>
              <p style="margin:0;font:12px/1.6 Arial,sans-serif;color:#B8C0D6;">${escapeHtml(footerNote)}</p>
              <p style="margin:14px 0 0;font:12px Arial,sans-serif;color:#B8C0D6;">
                <a href="${escapeHtml(APP_URL)}" style="color:#F1C29C;text-decoration:none;">${escapeHtml(APP_URL.replace(/^https?:\/\//, ''))}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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
  const receiptRows: DetailRow[] = [
    { label: 'Subtotal', value: opts.subtotal },
    { label: 'GST', value: opts.gst },
    { label: 'Total', value: opts.totalAmount },
    { label: 'Deposit required', value: opts.deposit },
  ];

  return catstaysEmailLayout({
    title: `You are all booked, ${firstName(opts.customerName)}`,
    preheader: `Booking ${opts.bookingRef} has been confirmed at ${opts.catteryName}.`,
    eyebrow: 'Booking confirmed',
    badge: 'Confirmed',
    catteryName: opts.catteryName,
    intro: `We are looking forward to welcoming ${opts.catName || 'your cat'} for their stay.`,
    cards: [
      {
        title: 'Booking details',
        rows: [
          { label: 'Booking reference', value: `#${opts.bookingRef}` },
          { label: 'Room', value: opts.roomName },
          { label: 'Cat', value: opts.catName },
          { label: 'Check-in', value: opts.checkIn },
          { label: 'Check-out', value: opts.checkOut },
          { label: 'Duration', value: opts.nights ? plural(opts.nights, 'night') : undefined },
          { label: 'Price per night', value: opts.pricePerNight },
        ],
      },
      ...(receiptRows.some((row) => row.value) ? [{ title: 'Receipt', rows: receiptRows, tone: 'success' as const }] : []),
    ],
    footerNote: `Questions about this booking? Contact ${opts.catteryName} directly.`,
  });
}

export function contactEnquiryHtml(opts: {
  customerName: string;
  customerEmail: string;
  message: string;
  catteryName: string;
  phone?: string;
}) {
  return catstaysEmailLayout({
    title: 'New website enquiry',
    preheader: `${opts.customerName} sent an enquiry to ${opts.catteryName}.`,
    eyebrow: 'New enquiry',
    badge: 'Action needed',
    catteryName: opts.catteryName,
    intro: `${opts.customerName} has sent a message from your CatStays website.`,
    cards: [
      {
        title: 'Customer details',
        rows: [
          { label: 'Name', value: opts.customerName },
          { label: 'Email', value: opts.customerEmail },
          { label: 'Phone', value: opts.phone },
        ],
      },
      {
        title: 'Message',
        html: `<p style="margin:0;font:15px/1.7 Arial,sans-serif;color:${colors.ink};">${textToHtml(opts.message)}</p>`,
        tone: 'cream',
      },
    ],
    action: { label: 'Reply by email', href: `mailto:${opts.customerEmail}` },
    footerNote: 'Reply directly to the customer to continue the conversation.',
  });
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
  return catstaysEmailLayout({
    title: 'New booking request',
    preheader: `${opts.customerName} requested ${plural(opts.nights, 'night')} at ${opts.catteryName}.`,
    eyebrow: 'Booking request',
    badge: 'Review request',
    catteryName: opts.catteryName,
    intro: `${opts.customerName} wants to book ${catNamesText(opts.catNames)} for ${plural(opts.nights, 'night')}.`,
    cards: [
      {
        title: 'Stay details',
        rows: [
          { label: 'Cats', value: catNamesText(opts.catNames) },
          { label: 'Check-in', value: opts.checkIn },
          { label: 'Check-out', value: opts.checkOut },
          { label: 'Duration', value: plural(opts.nights, 'night') },
          { label: 'Room', value: opts.roomName },
          { label: 'Estimated total', value: opts.estimatedTotal },
        ],
      },
      {
        title: 'Customer details',
        rows: [
          { label: 'Name', value: opts.customerName },
          { label: 'Email', value: opts.customerEmail },
          { label: 'Phone', value: opts.phone },
        ],
      },
      ...(opts.specialRequirements ? [{
        title: 'Special requirements',
        html: `<p style="margin:0;font:15px/1.7 Arial,sans-serif;color:${colors.ink};">${textToHtml(opts.specialRequirements)}</p>`,
        tone: 'warning' as const,
      }] : []),
    ],
    action: { label: 'Reply to customer', href: `mailto:${opts.customerEmail}` },
    footerNote: 'Confirm availability in your CatStays dashboard, then send the customer their final booking confirmation.',
  });
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
  return catstaysEmailLayout({
    title: `Thanks, ${firstName(opts.customerName)}`,
    preheader: `${opts.catteryName} received your booking request.`,
    eyebrow: 'Request received',
    badge: 'Pending confirmation',
    catteryName: opts.catteryName,
    intro: `Your booking request has been received. ${opts.catteryName} will review availability and contact you to confirm your cat's stay.`,
    cards: [
      {
        title: 'Requested stay',
        rows: [
          { label: 'Cats', value: catNamesText(opts.catNames) },
          { label: 'Check-in', value: opts.checkIn },
          { label: 'Check-out', value: opts.checkOut },
          { label: 'Duration', value: plural(opts.nights, 'night') },
          { label: 'Room', value: opts.roomName },
          { label: 'Estimated total', value: opts.estimatedTotal },
        ],
      },
      {
        title: 'Need help?',
        rows: [
          { label: 'Email', value: opts.catteryEmail },
          { label: 'Phone', value: opts.catteryPhone },
        ],
      },
    ],
    footerNote: `${opts.catteryName} will be in touch to confirm availability and next steps.`,
  });
}

export function testEmailHtml() {
  return catstaysEmailLayout({
    title: 'Email integration confirmed',
    preheader: 'CatStays email sending is working correctly.',
    eyebrow: 'System test',
    badge: 'Connected',
    intro: 'Your CatStays Resend integration is working. Booking confirmations, enquiries, and subscription emails can now use the branded email system.',
    cards: [
      {
        title: 'Sending identity',
        rows: [
          { label: 'Product', value: 'CatStays' },
          { label: 'From address', value: 'bookings@catstays.app' },
        ],
      },
    ],
  });
}

export function ownerWelcomeHtml(opts: {
  ownerName: string;
  catteryName: string;
  dashboardUrl?: string;
}) {
  return catstaysEmailLayout({
    title: `Welcome to CatStays, ${firstName(opts.ownerName)}`,
    preheader: `${opts.catteryName} is ready in CatStays.`,
    eyebrow: 'Welcome',
    badge: 'Account created',
    catteryName: opts.catteryName,
    intro: 'Your CatStays workspace is ready. You can now review your website, manage rooms, and start preparing your booking flow.',
    action: opts.dashboardUrl ? { label: 'Open dashboard', href: opts.dashboardUrl } : undefined,
  });
}

export function trialStartedHtml(opts: {
  ownerName: string;
  catteryName: string;
  planName: string;
  trialEndsAt?: string;
  dashboardUrl?: string;
}) {
  return catstaysEmailLayout({
    title: 'Your CatStays trial is live',
    preheader: `Your ${opts.planName} trial has started for ${opts.catteryName}.`,
    eyebrow: 'Trial started',
    badge: '14-day trial',
    catteryName: opts.catteryName,
    intro: `Hi ${firstName(opts.ownerName)}, your CatStays trial is active with full access to set up your cattery website and dashboard.`,
    cards: [
      {
        title: 'Trial details',
        rows: [
          { label: 'Plan after trial', value: opts.planName },
          { label: 'Trial ends', value: opts.trialEndsAt },
        ],
      },
    ],
    action: opts.dashboardUrl ? { label: 'Continue setup', href: opts.dashboardUrl } : undefined,
  });
}

export function trialEndingReminderHtml(opts: {
  ownerName: string;
  catteryName: string;
  trialEndsAt: string;
  billingUrl?: string;
}) {
  return catstaysEmailLayout({
    title: 'Your trial ends soon',
    preheader: `${opts.catteryName}'s CatStays trial ends on ${opts.trialEndsAt}.`,
    eyebrow: 'Trial reminder',
    badge: 'Action needed',
    catteryName: opts.catteryName,
    intro: `Hi ${firstName(opts.ownerName)}, your CatStays trial ends on ${opts.trialEndsAt}. Add or confirm billing to keep your website and dashboard running without interruption.`,
    action: opts.billingUrl ? { label: 'Review billing', href: opts.billingUrl } : undefined,
  });
}

export function subscriptionStartedHtml(opts: {
  ownerName: string;
  catteryName: string;
  planName: string;
  billingUrl?: string;
}) {
  return catstaysEmailLayout({
    title: 'Your subscription is active',
    preheader: `${opts.catteryName} is subscribed to ${opts.planName}.`,
    eyebrow: 'Subscription',
    badge: 'Active',
    catteryName: opts.catteryName,
    intro: `Thanks ${firstName(opts.ownerName)}. Your CatStays ${opts.planName} subscription is active, so your website and dashboard can keep running smoothly.`,
    action: opts.billingUrl ? { label: 'Manage billing', href: opts.billingUrl } : undefined,
  });
}

export function subscriptionPaymentFailedHtml(opts: {
  ownerName: string;
  catteryName: string;
  billingUrl?: string;
}) {
  return catstaysEmailLayout({
    title: 'Payment needs attention',
    preheader: `We could not process the latest CatStays payment for ${opts.catteryName}.`,
    eyebrow: 'Billing',
    badge: 'Payment issue',
    catteryName: opts.catteryName,
    intro: `Hi ${firstName(opts.ownerName)}, we could not process your latest CatStays payment. Please update your billing details to avoid any interruption to your website or dashboard.`,
    action: opts.billingUrl ? { label: 'Update billing', href: opts.billingUrl } : undefined,
  });
}

export function subscriptionCancelledHtml(opts: {
  ownerName: string;
  catteryName: string;
  billingUrl?: string;
}) {
  return catstaysEmailLayout({
    title: 'Your subscription has been cancelled',
    preheader: `${opts.catteryName}'s CatStays subscription has been cancelled.`,
    eyebrow: 'Subscription',
    badge: 'Cancelled',
    catteryName: opts.catteryName,
    intro: `Hi ${firstName(opts.ownerName)}, your CatStays subscription has been cancelled. You can restart it from billing if you want to keep your website and dashboard active.`,
    action: opts.billingUrl ? { label: 'Open billing', href: opts.billingUrl } : undefined,
  });
}

export function customerPhotoUpdateHtml(opts: {
  customerName: string;
  catteryName: string;
  catName?: string;
  portalUrl?: string;
}) {
  return catstaysEmailLayout({
    title: `New update for ${opts.catName || 'your cat'}`,
    preheader: `${opts.catteryName} shared a new photo update.`,
    eyebrow: 'Cat update',
    badge: 'New photo',
    catteryName: opts.catteryName,
    intro: `Hi ${firstName(opts.customerName)}, ${opts.catteryName} has shared a new update from your cat's stay.`,
    action: opts.portalUrl ? { label: 'View update', href: opts.portalUrl } : undefined,
  });
}
