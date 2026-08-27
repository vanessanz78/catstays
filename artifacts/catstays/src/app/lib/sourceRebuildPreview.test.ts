import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizePublishedSourceHtml, sourceRebuildHtmlFromData } from './sourceRebuildPreview.ts';

test('normalizes legacy booking language in stored published source HTML', () => {
  const html = `<section><p>Book or enquire about your cat's stay.</p><button>BOOK / ENQUIRE</button></section>`;

  assert.equal(
    normalizePublishedSourceHtml(html),
    `<section><p>Book your cat's stay.</p><button>Book Now</button></section>`,
  );
});

test('normalizes stored rebuild HTML before it is published', () => {
  assert.equal(
    sourceRebuildHtmlFromData({
      sourceArchive: {
        rebuild: {
          html: '<button>Book / Enquire</button>',
        },
      },
    }),
    '<button>Book Now</button>',
  );
});

test('leaves unrelated source HTML unchanged', () => {
  const html = '<p>Contact us about medication or long-term care.</p>';

  assert.equal(normalizePublishedSourceHtml(html), html);
});
