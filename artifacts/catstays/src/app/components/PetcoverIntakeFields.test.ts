import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

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
  assert.match(source, /For a first-time Petcover offer for cats under 12 months\./);
  assert.ok(declarations.indexOf('PETCOVER_DECLARATION_LABELS.map') < declarations.indexOf('<span>Accept all<\/span>'));
  assert.match(declarations, /className="flex items-start gap-2 text-sm font-semibold/);
});
