import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPublicWebsiteAddress } from './platform';

test('recognises tenant subdomains as public website addresses', () => {
  assert.equal(hasPublicWebsiteAddress({ slug: 'delorainecattery', custom_domain: null, current_published_version_id: null }), true);
});

test('recognises custom domains and tracked published versions', () => {
  assert.equal(hasPublicWebsiteAddress({ slug: null, custom_domain: 'example.co.nz', current_published_version_id: null }), true);
  assert.equal(hasPublicWebsiteAddress({ slug: null, custom_domain: null, current_published_version_id: 'version-id' }), true);
});

test('does not report a website address when no public route exists', () => {
  assert.equal(hasPublicWebsiteAddress({ slug: null, custom_domain: null, current_published_version_id: null }), false);
});
