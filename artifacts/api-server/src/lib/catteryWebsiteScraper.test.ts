import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parse } from 'node-html-parser';
import {
  collectHtmlImages,
  collectSameOriginLinks,
  isCrawlableInternalPage,
  isSameCanonicalDomain,
  normalizeCrawlUrl,
  srcsetCandidateUrls,
} from './catteryWebsiteScraper';

describe('catteryWebsiteScraper crawl rules', () => {
  const baseUrl = new URL('https://www.fancyfelines.nz/');

  it('normalizes fragments, tracking params, trailing slashes, and host case', () => {
    assert.equal(
      normalizeCrawlUrl('HTTPS://WWW.FancyFelines.nz/about/?utm_source=ad#team', baseUrl),
      'https://www.fancyfelines.nz/about',
    );
  });

  it('treats www and non-www as the same canonical domain', () => {
    assert.equal(isSameCanonicalDomain(new URL('https://fancyfelines.nz/rates'), baseUrl), true);
    assert.equal(isSameCanonicalDomain(new URL('https://booking.example.com/rates'), baseUrl), false);
  });

  it('keeps valid internal links and excludes external/private workflow URLs', () => {
    const root = parse(`
      <nav>
        <a href="/about/">About</a>
        <a href="https://fancyfelines.nz/accommodation#top">Accommodation</a>
        <a href="https://facebook.com/fancyfelines">Facebook</a>
        <a href="mailto:hello@example.com">Email</a>
        <a href="/wp-admin/">Admin</a>
      </nav>
    `);

    assert.deepEqual(collectSameOriginLinks(root, baseUrl), [
      'https://www.fancyfelines.nz/about',
      'https://fancyfelines.nz/accommodation',
      'https://www.fancyfelines.nz/wp-admin',
    ]);
    assert.equal(isCrawlableInternalPage('https://www.fancyfelines.nz/about', baseUrl), true);
    assert.equal(isCrawlableInternalPage('https://www.fancyfelines.nz/wp-admin', baseUrl), false);
  });

  it('parses srcset candidates including lazy-loaded image attributes', () => {
    const root = parse(`
      <img src="/cat-small.jpg" srcset="/cat-small.jpg 400w, /cat-large.jpg 1200w" alt="Sunny cat suite">
      <img data-src="/lazy-room.webp" alt="Private room">
      <div style="background-image:url('/hero.jpg')"></div>
    `);

    assert.deepEqual(srcsetCandidateUrls('/cat-small.jpg 400w, /cat-large.jpg 1200w'), [
      '/cat-small.jpg',
      '/cat-large.jpg',
    ]);
    assert.deepEqual(collectHtmlImages(root, baseUrl), [
      'https://www.fancyfelines.nz/cat-small.jpg',
      'https://www.fancyfelines.nz/cat-small.jpg',
      'https://www.fancyfelines.nz/cat-large.jpg',
      'https://www.fancyfelines.nz/lazy-room.webp',
      'https://www.fancyfelines.nz/hero.jpg',
    ]);
  });
});
