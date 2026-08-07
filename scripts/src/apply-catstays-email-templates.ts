import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PROJECT_REF = 'iwyoezwqorddkmqnjbif';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const templateRoot = path.join(repoRoot, 'supabase', 'auth-email-templates');
const appUrl = (process.env.CATSTAYS_APP_URL || process.env.VITE_PUBLIC_APP_URL || 'https://catstays.app').replace(
  /\/$/,
  '',
);
const requiredRedirectUrls = [
  `${appUrl}/confirm-email`,
  `${appUrl}/reset-password`,
  `${appUrl}/login`,
  'https://*.catstays.app/confirm-email',
  'https://*.catstays.app/reset-password',
  'https://*.catstays.app/login',
  'http://localhost:3000/**',
  'http://localhost:5173/**',
  'http://localhost:5174/**',
];

type TemplateKey =
  | 'mailer_templates_confirmation_content'
  | 'mailer_templates_invite_content'
  | 'mailer_templates_magic_link_content'
  | 'mailer_templates_email_change_content'
  | 'mailer_templates_recovery_content'
  | 'mailer_templates_reauthentication_content';

async function readTemplate(fileName: string) {
  return readFile(path.join(templateRoot, fileName), 'utf8');
}

function parseUriAllowList(value: unknown) {
  if (!value || typeof value !== 'string') return [];
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function requestSupabase<T>(
  projectRef: string,
  accessToken: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase Management API returned ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  const projectRef = process.env.SUPABASE_PROJECT_REF || DEFAULT_PROJECT_REF;

  if (!accessToken) {
    throw new Error(
      'Set SUPABASE_ACCESS_TOKEN to a Supabase personal access token before applying hosted email templates.',
    );
  }

  const currentConfig = await requestSupabase<Record<string, unknown>>(projectRef, accessToken, {
    method: 'GET',
  });

  const uriAllowList = Array.from(
    new Set([...parseUriAllowList(currentConfig.uri_allow_list), ...requiredRedirectUrls]),
  );

  const payload = {
    site_url: appUrl,
    uri_allow_list: uriAllowList.join(','),
    mailer_subjects_confirmation: 'Confirm your CatStays account',
    mailer_templates_confirmation_content: await readTemplate('confirmation.html'),
    mailer_subjects_invite: 'Welcome to CatStays',
    mailer_templates_invite_content: await readTemplate('invite.html'),
    mailer_subjects_magic_link: 'Sign in to CatStays',
    mailer_templates_magic_link_content: await readTemplate('magic-link.html'),
    mailer_subjects_email_change: 'Confirm your new CatStays email',
    mailer_templates_email_change_content: await readTemplate('email-change.html'),
    mailer_subjects_recovery: 'Reset your CatStays password',
    mailer_templates_recovery_content: await readTemplate('recovery.html'),
    mailer_subjects_reauthentication: 'Your CatStays security code',
    mailer_templates_reauthentication_content: await readTemplate('reauthentication.html'),
  };

  await requestSupabase<Record<string, unknown>>(projectRef, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const updatedConfig = await requestSupabase<Record<string, string>>(projectRef, accessToken, {
    method: 'GET',
  });

  const templateKeys: TemplateKey[] = [
    'mailer_templates_confirmation_content',
    'mailer_templates_invite_content',
    'mailer_templates_magic_link_content',
    'mailer_templates_email_change_content',
    'mailer_templates_recovery_content',
    'mailer_templates_reauthentication_content',
  ];

  const mismatchedKeys: string[] = templateKeys.filter((key) => updatedConfig[key] !== payload[key]);
  const updatedRedirectUrls = parseUriAllowList(updatedConfig.uri_allow_list);
  const missingRedirectUrls = requiredRedirectUrls.filter((url) => !updatedRedirectUrls.includes(url));

  if (updatedConfig.site_url !== appUrl) {
    mismatchedKeys.push('site_url');
  }

  if (missingRedirectUrls.length) {
    throw new Error(
      `Supabase accepted the update but these redirect URLs are missing: ${missingRedirectUrls.join(', ')}`,
    );
  }

  if (mismatchedKeys.length) {
    throw new Error(`Supabase accepted the update but verification failed for: ${mismatchedKeys.join(', ')}`);
  }

  console.log(`CatStays Supabase Auth settings are live on ${projectRef}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
