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

async function template(fileName) {
  return readFile(path.join(templatesDir, fileName), "utf8");
}

const payload = {
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

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;
const response = await fetch(endpoint, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Supabase rejected the template update: ${response.status} ${response.statusText}`);
  console.error(body.slice(0, 2000));
  process.exit(1);
}

console.log(`Applied ${Object.keys(payload).length / 2} CatStays Supabase Auth email templates.`);
