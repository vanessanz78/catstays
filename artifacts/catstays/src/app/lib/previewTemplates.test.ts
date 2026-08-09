import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCatstaysTemplateContent,
  type PreviewImportRecord,
} from './previewTemplates';

const storedHero =
  'https://iwyoezwqorddkmqnjbif.supabase.co/storage/v1/object/public/catstays-media/website-imports/cattery-1/source-1/fancyfelines.nz/hero-room.jpg';
const storedGallery =
  'https://iwyoezwqorddkmqnjbif.supabase.co/storage/v1/object/public/catstays-media/website-imports/cattery-1/source-1/fancyfelines.nz/gallery-cat.jpg';

describe('previewTemplates imported media rendering', () => {
  it('uses stored imported business images instead of stock template images', () => {
    const record = previewRecord({
      importedImageAssets: [
        { originalUrl: 'https://www.fancyfelines.nz/hero.jpg', storedUrl: storedHero },
        { originalUrl: 'https://www.fancyfelines.nz/gallery.jpg', storedUrl: storedGallery },
      ],
    });

    const content = buildCatstaysTemplateContent({
      ...record.normalizedPreviewData,
      previewImportRecord: record,
    });
    const rendered = renderedImages(content);

    assert.equal(content.hero.image, storedHero);
    assert.equal(rendered.some((image) => image.includes('images.unsplash.com')), false);
    assert.equal(rendered.includes(storedHero), true);
    assert.equal(rendered.includes(storedGallery), true);
  });

  it('does not fabricate stock photos when an imported site has no stored media', () => {
    const record = previewRecord({ importedImageAssets: [] });

    const content = buildCatstaysTemplateContent({
      ...record.normalizedPreviewData,
      previewImportRecord: record,
    });
    const rendered = renderedImages(content);

    assert.equal(content.hero.image, '');
    assert.equal(rendered.some((image) => image.includes('images.unsplash.com')), false);
  });

  it('prefers persisted imported assets over stale stock hero and gallery settings', () => {
    const content = buildCatstaysTemplateContent({
      businessName: 'Fancy Felines',
      sourceUrl: 'https://www.fancyfelines.nz/',
      sourceHost: 'fancyfelines.nz',
      heroImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200',
      galleryImages: [
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200',
      ],
      importedImageAssets: [
        { originalUrl: 'https://www.fancyfelines.nz/hero.jpg', storedUrl: storedHero },
        { originalUrl: 'https://www.fancyfelines.nz/gallery.jpg', storedUrl: storedGallery },
      ],
      siteContentLibrary: previewRecord({ importedImageAssets: [] }).contentLibrary,
    });
    const rendered = renderedImages(content);

    assert.equal(content.hero.image, storedHero);
    assert.equal(rendered.includes(storedGallery), true);
    assert.equal(rendered.some((image) => image.includes('images.unsplash.com')), false);
  });
});

function previewRecord(input: { importedImageAssets: Array<Record<string, unknown>> }): PreviewImportRecord {
  const contentLibrary = {
    schemaVersion: 1 as const,
    sourceUrl: 'https://www.fancyfelines.nz/',
    sourceHost: 'fancyfelines.nz',
    businessName: 'Fancy Felines',
    capturedAt: '2026-08-09T00:00:00.000Z',
    blocks: [
      {
        id: 'hero',
        category: 'hero',
        title: 'Fancy Felines',
        text: 'Cat-only grooming and accommodation.',
        source: 'scrape' as const,
        sourceUrl: 'https://www.fancyfelines.nz/',
      },
      {
        id: 'gallery',
        category: 'gallery',
        title: 'Gallery',
        text: 'A closer look at Fancy Felines.',
        source: 'scrape' as const,
        sourceUrl: 'https://www.fancyfelines.nz/gallery',
      },
    ],
  };

  return {
    id: 'fancy-felines-test',
    status: 'preview',
    selectedTemplate: 'original',
    createdAt: '2026-08-09T00:00:00.000Z',
    source: {
      url: 'https://www.fancyfelines.nz/',
      host: 'fancyfelines.nz',
      importedImageAssets: input.importedImageAssets,
      importReport: {
        imagesFound: input.importedImageAssets.length,
        imagesStored: input.importedImageAssets.length,
      },
    },
    identity: {
      businessName: 'Fancy Felines',
      location: 'Auckland',
      subdomain: 'fancy-felines',
    },
    contact: {
      phone: '',
      email: '',
      address: '',
      city: 'Auckland',
    },
    media: {
      heroImage: '',
      logoImage: '',
      images: [],
      galleryImages: [],
    },
    content: {
      title: 'Fancy Felines',
      description: 'Cat-only grooming and accommodation.',
      heading: 'Fancy Felines',
      heroHeading: 'Fancy Felines',
      heroSubheading: 'Cat-only grooming and accommodation.',
      aboutHeading: 'About Fancy Felines',
      aboutText: 'Cat-only grooming and accommodation.',
      highlights: [],
    },
    rooms: [],
    services: [],
    faqs: [],
    contentLibrary,
    normalizedPreviewData: {
      businessName: 'Fancy Felines',
      sourceUrl: 'https://www.fancyfelines.nz/',
      sourceHost: 'fancyfelines.nz',
      location: 'Auckland',
      subdomain: 'fancy-felines',
      primaryColor: '#0A1128',
      accentColor: '#C46A3A',
      backgroundColor: '#F8F7F5',
      heroHeading: 'Fancy Felines',
      heroSubheading: 'Cat-only grooming and accommodation.',
      aboutHeading: 'About Fancy Felines',
      aboutText: 'Cat-only grooming and accommodation.',
      phone: '',
      email: '',
      address: '',
      heroImage: '',
      siteContentLibrary: contentLibrary,
    },
  } as PreviewImportRecord;
}

function renderedImages(content: ReturnType<typeof buildCatstaysTemplateContent>) {
  return [
    content.hero.image,
    content.facilities.image,
    content.about.image,
    ...content.gallery.map((item) => item.image),
    ...content.suites.map((item) => item.image),
    ...content.services.map((item) => item.image),
  ].filter(Boolean);
}
