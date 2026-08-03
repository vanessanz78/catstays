import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const templatesDir = path.join(process.cwd(), 'supabase', 'auth-email-templates');
const supportEmail = process.env.CATSTAYS_SUPPORT_EMAIL || 'support@catstays.app';
const appUrl = (process.env.CATSTAYS_APP_URL || process.env.VITE_PUBLIC_APP_URL || 'https://catstays.app').replace(/\/$/, '');
const logoIconUrl = `${appUrl}/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png`;
const logoWordmarkUrl = `${appUrl}/assets/9900b394e20a5e059447324d58daad1b1bf43ed6.png`;

const colors = {
  navy: '#0A1128',
  terracotta: '#C46A3A',
  terracottaDark: '#A85A30',
  cream: '#F8F7F5',
  warm: '#F1E6DC',
  sage: '#4F6F5A',
  ink: '#172033',
  muted: '#687386',
  line: '#E8DFD7',
  white: '#FFFFFF',
};

const actionNote = (href) => `
              <p style="margin:24px 0 0;font:13px/1.6 Arial,sans-serif;color:${colors.muted};">
                If the button does not work, copy and paste this link into your browser:<br>
                <a href="${href}" style="color:${colors.terracotta};word-break:break-all;">${href}</a>
              </p>`;

function layout({
  title,
  preheader,
  badge,
  intro,
  action,
  bodyHtml = '',
  footerNote,
}) {
  const actionHtml = action
    ? `
              <div style="margin-top:26px;">
                <a href="${action.href}" style="display:inline-block;padding:15px 24px;border-radius:999px;background:${colors.terracotta};color:${colors.white};font:700 15px Arial,sans-serif;text-decoration:none;">
                  ${action.label}
                </a>
              </div>
              ${actionNote(action.href)}`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${colors.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.cream};">
    <tr>
      <td align="center" style="padding:42px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${colors.white};border-radius:20px;overflow:hidden;border:1px solid ${colors.line};">
          <tr>
            <td align="center" style="padding:42px 36px 34px;background:${colors.cream};">
              <img src="${logoIconUrl}" width="64" height="64" alt="CatStays" style="display:block;width:64px;height:64px;margin:0 auto 16px;">
              <img src="${logoWordmarkUrl}" width="142" alt="CatStays" style="display:block;width:142px;max-width:60%;height:auto;margin:0 auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:38px 38px 34px;background:${colors.white};">
              ${badge ? `<div style="display:inline-block;margin-bottom:18px;padding:8px 13px;border-radius:999px;background:${colors.warm};color:${colors.terracottaDark};font:700 12px Arial,sans-serif;">${badge}</div>` : ''}
              <h1 style="margin:0;font:700 34px/1.12 Georgia,serif;color:${colors.navy};">${title}</h1>
              <p style="margin:18px 0 0;font:16px/1.65 Arial,sans-serif;color:${colors.muted};">${intro}</p>
              ${actionHtml}
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:28px 38px;background:${colors.navy};">
              <p style="margin:0 0 8px;font:700 15px Arial,sans-serif;color:${colors.white};">CatStays</p>
              <p style="margin:0;font:13px/1.6 Arial,sans-serif;color:#D8DDEB;">${footerNote || 'Need a hand? Our support team is here to help with your CatStays account.'}</p>
              <p style="margin:10px 0 0;font:13px/1.6 Arial,sans-serif;color:#D8DDEB;">Need a hand? Our support team is here to help.</p>
              <p style="margin:14px 0 0;font:13px Arial,sans-serif;color:#D8DDEB;">
                <a href="mailto:${supportEmail}" style="color:#F1C29C;text-decoration:none;">${supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const confirmation = layout({
  title: "You're almost ready",
  preheader: 'Welcome to CatStays. Confirm your email to continue setting up your cattery.',
  badge: 'Welcome to CatStays',
  intro: 'Please confirm your email address so you can keep setting up your cattery website, rooms, dashboard, and booking flow.',
  action: { label: 'Confirm my email', href: '{{ .ConfirmationURL }}' },
  footerNote: 'This message was sent because this email was used to start a CatStays account.',
});

const templates = {
  'confirmation.html': confirmation,
  'confirm-signup.html': confirmation,
  'magic-link.html': layout({
    title: 'Your CatStays sign-in link',
    preheader: 'Use this secure link or one-time code to sign in to CatStays.',
    badge: 'Secure sign in',
    intro: 'Here is your secure CatStays sign-in link. It can only be used for a short time.',
    action: { label: 'Sign in to CatStays', href: '{{ .ConfirmationURL }}' },
    bodyHtml: `
              <p style="margin:24px 0 0;font:14px/1.6 Arial,sans-serif;color:${colors.muted};">One-time code: <strong style="color:${colors.navy};letter-spacing:.08em;">{{ .Token }}</strong></p>`,
  }),
  'invite.html': layout({
    title: 'Welcome to CatStays',
    preheader: 'You have been invited to join a CatStays workspace.',
    badge: 'Invitation',
    intro: 'You have been invited to join a CatStays workspace and help manage cattery bookings, customers, rooms, and care updates.',
    action: { label: 'Accept invitation', href: '{{ .ConfirmationURL }}' },
    footerNote: 'This invitation was sent to {{ .Email }}.',
  }),
  'email-change.html': layout({
    title: 'Confirm your new email',
    preheader: 'Confirm this email address for your CatStays account.',
    badge: 'Account update',
    intro: 'Please confirm this new email address so we can keep your CatStays account secure and up to date.',
    action: { label: 'Confirm new email', href: '{{ .ConfirmationURL }}' },
  }),
  'recovery.html': layout({
    title: 'Reset your password',
    preheader: 'Use this secure link to reset your CatStays password.',
    badge: 'Password reset',
    intro: 'No worries. Use the secure button below to choose a new password for your CatStays account.',
    action: { label: 'Reset password', href: '{{ .ConfirmationURL }}' },
  }),
  'reset-password.html': layout({
    title: 'Reset your password',
    preheader: 'Use this secure link to reset your CatStays password.',
    badge: 'Password reset',
    intro: 'No worries. Use the secure button below to choose a new password for your CatStays account.',
    action: { label: 'Reset password', href: '{{ .ConfirmationURL }}' },
  }),
  'reauthentication.html': layout({
    title: 'Your security code',
    preheader: 'Use this one-time code to continue in CatStays.',
    badge: 'Security check',
    intro: 'Enter this one-time code to continue safely in CatStays.',
    bodyHtml: `
              <div style="margin-top:26px;padding:22px;border-radius:16px;background:${colors.cream};border:1px solid ${colors.line};text-align:center;">
                <span style="font:700 34px Arial,sans-serif;letter-spacing:.18em;color:${colors.navy};">{{ .Token }}</span>
              </div>`,
  }),
  'trial-reminder.html': layout({
    title: 'Your trial ends soon',
    preheader: 'Your CatStays trial is almost complete.',
    badge: 'Trial reminder',
    intro: 'Your CatStays trial is almost complete. Choose a plan when you are ready to keep your website, bookings, and dashboard running smoothly.',
    action: { label: 'Review my account', href: appUrl },
  }),
  'billing-reminder.html': layout({
    title: 'Payment needs attention',
    preheader: 'Please update your CatStays billing details.',
    badge: 'Billing',
    intro: 'We could not complete your latest CatStays payment. Please update your billing details to keep your account active.',
    action: { label: 'Update billing', href: appUrl },
  }),
};

await mkdir(templatesDir, { recursive: true });

await Promise.all(
  Object.entries(templates).map(([fileName, html]) =>
    writeFile(path.join(templatesDir, fileName), html.replace(/[ \t]+$/gm, ''), 'utf8'),
  ),
);

console.log(`Generated ${Object.keys(templates).length} CatStays email templates.`);
