import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRef = process.env.SUPABASE_PROJECT_REF || process.env.PROJECT_REF;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!projectRef || !accessToken) {
  console.error(
    [
      "Missing Supabase credentials.",
      "",
      "Run with:",
      'SUPABASE_PROJECT_REF="your-project-ref" SUPABASE_ACCESS_TOKEN="your-access-token" pnpm run apply:supabase-email-templates',
    ].join("\n"),
  );
  process.exit(1);
}

const templatesDir = path.join(process.cwd(), "supabase", "auth-email-templates");
const appUrl = (process.env.CATSTAYS_APP_URL || process.env.VITE_PUBLIC_APP_URL || "https://catstays.app").replace(/\/$/, "");
const requiredRedirectUrls = [
  `${appUrl}/confirm-email`,
  `${appUrl}/reset-password`,
  `${appUrl}/login`,
  "https://*.catstays.app/confirm-email",
  "https://*.catstays.app/reset-password",
  "https://*.catstays.app/login",
  "http://localhost:3000/**",
  "http://localhost:5173/**",
  "http://localhost:5174/**",
];

function parseUriAllowList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function requestSupabase(init) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Supabase rejected the Auth config update: ${response.status} ${response.statusText}`);
    console.error(body.slice(0, 2000));
    process.exit(1);
  }

  return response.json();
}

async function template(fileName) {
  return readFile(path.join(templatesDir, fileName), "utf8");
}

const payload = {
  site_url: appUrl,
  mailer_subjects_confirmation: "Confirm your CatStays account",
  mailer_templates_confirmation_content: await template("confirmation.html"),

  mailer_subjects_invite: "You have been invited to CatStays",
  mailer_templates_invite_content: await template("invite.html"),

  mailer_subjects_magic_link: "Sign in to CatStays",
  mailer_templates_magic_link_content: await template("magic-link.html"),

  mailer_subjects_email_change: "Confirm your new CatStays email",
  mailer_templates_email_change_content: await template("email-change.html"),

  mailer_subjects_recovery: "Reset your CatStays password",
  mailer_templates_recovery_content: await template("recovery.html"),

  mailer_subjects_reauthentication: "Your CatStays security code",
  mailer_templates_reauthentication_content: await template("reauthentication.html"),
};

const currentConfig = await requestSupabase({ method: "GET" });
const uriAllowList = Array.from(
  new Set([...parseUriAllowList(currentConfig.uri_allow_list), ...requiredRedirectUrls]),
);

await requestSupabase({
  method: "PATCH",
  body: JSON.stringify({ ...payload, uri_allow_list: uriAllowList.join(",") }),
});

const updatedConfig = await requestSupabase({ method: "GET" });
const updatedRedirectUrls = parseUriAllowList(updatedConfig.uri_allow_list);
const missingRedirectUrls = requiredRedirectUrls.filter((url) => !updatedRedirectUrls.includes(url));

if (updatedConfig.site_url !== appUrl || missingRedirectUrls.length) {
  console.error("Supabase accepted the update but Auth URL verification failed.");
  if (updatedConfig.site_url !== appUrl) {
    console.error(`Expected Site URL ${appUrl}, got ${updatedConfig.site_url || "(empty)"}.`);
  }
  if (missingRedirectUrls.length) {
    console.error(`Missing redirect URLs: ${missingRedirectUrls.join(", ")}`);
  }
  process.exit(1);
}

console.log(`Applied CatStays Supabase Auth settings for ${appUrl}.`);
