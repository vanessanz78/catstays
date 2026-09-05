import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  isDeloraineCatteryWebsite,
  PETCOVER_CAT_INSURANCE_URL,
  PETCOVER_TRIAL_POLICY_URL,
} from '../lib/petcoverLinks';

test('Petcover public copy is concise and Accept all follows the declaration checkboxes', () => {
  const source = readFileSync(new URL('./PetcoverIntakeFields.tsx', import.meta.url), 'utf8');
  const publicSurfaces = [
    readFileSync(new URL('../pages/tenant/Home.tsx', import.meta.url), 'utf8'),
    readFileSync(new URL('../pages/onboarding/CatstaysTemplateSite.tsx', import.meta.url), 'utf8'),
    readFileSync(new URL('../pages/onboarding/FullWebsitePreview.tsx', import.meta.url), 'utf8'),
  ].join('\n');
  const declarations = source.slice(source.indexOf('<fieldset'), source.indexOf('</fieldset>'));

  assert.doesNotMatch(source, /staff.*manual|manual portal/i);
  assert.doesNotMatch(publicSurfaces, /collects the details.*manual/i);
  assert.match(source, /For a first-time\{' '\}/);
  assert.match(source, /offer for cats under 12 months\./);
  assert.match(source, /Download the 4-week trial policy \(PDF\)/);
  assert.equal(PETCOVER_CAT_INSURANCE_URL, 'https://www.petcovergroup.com/nz/cat-insurance/');
  assert.equal(PETCOVER_TRIAL_POLICY_URL, '/documents/petcover-four-week-trial-policy.pdf');
  assert.ok(declarations.indexOf('PETCOVER_DECLARATION_LABELS.map') < declarations.indexOf('<span>Accept all<\/span>'));
  assert.match(declarations, /className="flex items-start gap-2 text-sm font-semibold/);
});

test('the public website Petcover promotion is scoped to Deloraine Cattery', () => {
  assert.equal(isDeloraineCatteryWebsite('Deloraine Cattery'), true);
  assert.equal(isDeloraineCatteryWebsite('delorainecattery'), true);
  assert.equal(isDeloraineCatteryWebsite('Fancy Felines'), false);

  const templateSource = readFileSync(new URL('../pages/onboarding/CatstaysTemplateSite.tsx', import.meta.url), 'utf8');
  assert.match(templateSource, /!content\.petcoverOfferEnabled \|\| !isDeloraineCatteryWebsite\(content\.business\.name\)/);
  assert.match(templateSource, /Deloraine Cattery offers a four-week free Petcover trial/);
  assert.match(templateSource, /Visit Petcover/);
  assert.match(templateSource, /Download the policy \(PDF\)/);
});

test('the downloadable trial policy is the exact supplied Petcover PDF', () => {
  const policy = readFileSync(new URL('../../../public/documents/petcover-four-week-trial-policy.pdf', import.meta.url));

  assert.equal(policy.subarray(0, 4).toString(), '%PDF');
  assert.equal(createHash('sha256').update(policy).digest('hex'), 'd6bafa00ee6afea02c93c4c85d2f54087cf3c774b09b523db10227e6297a393b');
});
