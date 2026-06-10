import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_PROJECT_REF = 'iwyoezwqorddkmqnjbif';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const templateRoot = path.join(repoRoot, 'supabase', 'auth-email-templates');

type TemplateKey =
  | 'mailer_templates_confirmation_content'
  | 'mailer_templates_magic_link_content'
  | 'mailer_templates_recovery_content';

async function readTemplate(fileName: string) {
  return readFile(path.join(templateRoot, fileName), 'utf8');
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

  const payload = {
    mailer_subjects_confirmation: 'Confirm your CatStays account',
    mailer_templates_confirmation_content: await readTemplate('confirm-signup.html'),
    mailer_subjects_magic_link: 'Sign in to CatStays',
    mailer_templates_magic_link_content: await readTemplate('magic-link.html'),
    mailer_subjects_recovery: 'Reset your CatStays password',
    mailer_templates_recovery_content: await readTemplate('reset-password.html'),
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
    'mailer_templates_magic_link_content',
    'mailer_templates_recovery_content',
  ];

  const mismatchedKeys = templateKeys.filter((key) => updatedConfig[key] !== payload[key]);

  if (mismatchedKeys.length) {
    throw new Error(`Supabase accepted the update but verification failed for: ${mismatchedKeys.join(', ')}`);
  }

  console.log(`CatStays Supabase Auth email templates are live on ${projectRef}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
