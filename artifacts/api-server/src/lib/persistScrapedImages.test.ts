import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import type { CatteryWebsiteScrapeResult } from './catteryWebsiteScraper';
import {
  MediaImportConfigurationError,
  persistScrapedImages,
  type StoredImageAsset,
} from './persistScrapedImages';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('persistScrapedImages', () => {
  it('downloads, stores, rewrites, and reports imported source images', async () => {
    const uploads: Array<{ bucket: string; path: string; body: Buffer; contentType?: string }> = [];
    globalThis.fetch = async () =>
      new Response(jpegBytes(), {
        status: 200,
        headers: { 'content-type': 'image/jpeg', 'content-length': String(jpegBytes().byteLength) },
      });

    const result = await persistScrapedImages(baseScrape(), {
      catteryId: 'cattery-1',
      importId: 'import-1',
      supabase: fakeStorage(uploads),
      skipHostSafetyCheck: true,
    });

    const assets = result.websiteSettings.importedImageAssets as StoredImageAsset[];
    assert.equal(uploads.length, 1);
    assert.equal(assets.length, 1);
    assert.equal(assets[0].bucket, 'catstays-media');
    assert.match(assets[0].path, /^website-imports\/cattery-1\/import-1\/fancyfelines\.example\//);
    assert.equal(result.heroImage, assets[0].storedUrl);
    assert.equal(result.galleryImages[0].url, assets[0].storedUrl);
    assert.equal((result.websiteSettings.mediaImport as Record<string, any>).imagesStored, 1);
    assert.equal((result.websiteSettings.importReport as Record<string, any>).imagesStored, 1);
  });

  it('rejects HTML masquerading as an image and reports the failed stage', async () => {
    globalThis.fetch = async () =>
      new Response('<html>not an image</html>', {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      });

    const result = await persistScrapedImages(baseScrape(), {
      supabase: fakeStorage([]),
      skipHostSafetyCheck: true,
    });

    const mediaImport = result.websiteSettings.mediaImport as Record<string, any>;
    assert.equal(mediaImport.status, 'failed');
    assert.equal(mediaImport.imagesStored, 0);
    assert.equal(mediaImport.failures[0].stage, 'download');
    assert.equal(mediaImport.failures[0].reason, 'invalid_image_body');
  });

  it('reports Supabase upload failures without pretending media was saved', async () => {
    globalThis.fetch = async () =>
      new Response(jpegBytes(), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      });

    const result = await persistScrapedImages(baseScrape(), {
      supabase: fakeStorage([], new Error('bucket rejected upload')),
      skipHostSafetyCheck: true,
    });

    const mediaImport = result.websiteSettings.mediaImport as Record<string, any>;
    assert.equal(mediaImport.status, 'failed');
    assert.equal(mediaImport.imagesDownloaded, 1);
    assert.equal(mediaImport.imagesStored, 0);
    assert.equal(mediaImport.failures[0].stage, 'upload');
  });

  it('fails loudly when storage is required and no service-role key is configured', async () => {
    const previousServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const previousServiceKeyAlias = process.env.SUPABASE_SERVICE_KEY;
    const previousSecretKey = process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_KEY;
    delete process.env.SUPABASE_SECRET_KEY;

    try {
      await assert.rejects(
        () => persistScrapedImages(baseScrape(), { requireStorage: true }),
        MediaImportConfigurationError,
      );
    } finally {
      restoreEnv('SUPABASE_SERVICE_ROLE_KEY', previousServiceKey);
      restoreEnv('SUPABASE_SERVICE_KEY', previousServiceKeyAlias);
      restoreEnv('SUPABASE_SECRET_KEY', previousSecretKey);
    }
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function fakeStorage(
  uploads: Array<{ bucket: string; path: string; body: Buffer; contentType?: string }>,
  uploadError?: Error,
) {
  return {
    storage: {
      from(bucket: string) {
        return {
          upload(path: string, body: Buffer, options: { contentType: string }) {
            if (uploadError) return Promise.resolve({ error: uploadError });
            uploads.push({ bucket, path, body, contentType: options.contentType });
            return Promise.resolve({ error: null });
          },
          getPublicUrl(path: string) {
            return {
              data: {
                publicUrl: `https://iwyoezwqorddkmqnjbif.supabase.co/storage/v1/object/public/${bucket}/${path}`,
              },
            };
          },
        };
      },
    },
  };
}

function jpegBytes() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0xff, 0xd9]);
}

function baseScrape(): CatteryWebsiteScrapeResult {
  return {
    sourceUrl: 'https://fancyfelines.example/',
    sourceHost: 'fancyfelines.example',
    title: 'Fancy Felines',
    description: '',
    heading: 'Fancy Felines',
    heroImage: 'https://fancyfelines.example/images/hero.jpg',
    logoImage: '',
    images: ['https://fancyfelines.example/images/hero.jpg'],
    galleryImages: [{ url: 'https://fancyfelines.example/images/hero.jpg', caption: 'Hero' }],
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    bookingUrl: '',
    hours: '',
    socialLinks: {},
    highlights: [],
    rooms: [],
    services: [],
    faqs: [],
    reviews: [],
    owner: { title: '', text: '', image: '' },
    commitment: { title: '', text: '', items: [] },
    locationDetails: { heading: '', text: '', directions: '', virtualTourUrl: '' },
    virtualTourUrl: '',
    siteContentLibrary: {
      schemaVersion: 1,
      sourceUrl: 'https://fancyfelines.example/',
      sourceHost: 'fancyfelines.example',
      businessName: 'Fancy Felines',
      capturedAt: '2026-08-09T00:00:00.000Z',
      blocks: [
        {
          id: 'gallery',
          category: 'gallery',
          title: 'Gallery',
          source: 'scrape',
          sourceUrl: 'https://fancyfelines.example/gallery',
          images: [{ url: 'https://fancyfelines.example/images/hero.jpg', caption: 'Hero' }],
        },
      ],
    },
    crawl: {
      canonicalDomain: 'fancyfelines.example',
      pagesFound: 1,
      pagesProcessed: 1,
      pagesFailed: 0,
      imagesFound: 1,
      pages: [
        {
          url: 'https://fancyfelines.example/gallery',
          slug: 'gallery',
          title: 'Gallery',
          metaTitle: 'Gallery',
          metaDescription: '',
          heading: 'Gallery',
          headings: [],
          bodyText: '',
          links: [],
          images: [
            {
              url: 'https://fancyfelines.example/images/hero.jpg',
              altText: 'Cat suite',
              caption: 'Hero',
              sourcePageUrl: 'https://fancyfelines.example/gallery',
            },
          ],
          pageType: 'gallery',
          processedAt: '2026-08-09T00:00:00.000Z',
        },
      ],
      failedPages: [],
    },
    bodyText: '',
    extractedFrom: { html: true, scripts: 0, apiServices: false },
    websiteSettings: {},
    demoCattery: {},
    demoRooms: [],
  };
}
