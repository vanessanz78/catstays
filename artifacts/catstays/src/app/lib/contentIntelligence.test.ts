import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildContentIntelligencePlan } from './contentIntelligence';
import { buildCatstaysTemplateContent } from './previewTemplates';

describe('content intelligence plan', () => {
  it('preserves source order and maps sections to template slots', () => {
    const plan = buildContentIntelligencePlan({
      sourceUrl: 'https://example-cattery.test/',
      sourceHost: 'example-cattery.test',
      businessName: 'Example Cattery',
      sourceArchive: {
        pages: [
          {
            sourceUrl: 'https://example-cattery.test/',
            title: 'Example Cattery',
            heading: 'Example Cattery',
            bodyText: 'A calm boutique cattery for cats who need a quiet stay.',
            images: ['https://example-cattery.test/hero-cat.jpg'],
          },
          {
            sourceUrl: 'https://example-cattery.test/accommodation',
            title: 'Accommodation',
            heading: 'Boutique Accommodation',
            bodyText: 'Private sunny suites. Basic Care $50.00 per 24 hours.',
            images: ['https://example-cattery.test/suite.jpg'],
          },
          {
            sourceUrl: 'https://example-cattery.test/contact',
            title: 'Contact',
            heading: 'Contact Us',
            bodyText: 'Email hello@example-cattery.test to enquire.',
            images: [],
          },
        ],
      },
      siteContentLibrary: {
        schemaVersion: 1,
        sourceUrl: 'https://example-cattery.test/',
        sourceHost: 'example-cattery.test',
        businessName: 'Example Cattery',
        capturedAt: '2026-08-09T00:00:00.000Z',
        blocks: [],
      },
    });

    assert.equal(plan.clusters[0]?.role, 'opening');
    assert.equal(plan.clusters[1]?.role, 'rooms');
    assert.equal(plan.clusters[2]?.role, 'contact');
    assert.deepEqual(
      plan.clusters.map((cluster) => cluster.sourcePageUrl),
      [
        'https://example-cattery.test/',
        'https://example-cattery.test/accommodation',
        'https://example-cattery.test/contact',
      ],
    );
    assert.equal(plan.templateSlots.find((slot) => slot.slot === 'hero')?.clusterIds[0], plan.clusters[0]?.id);
    assert.ok(plan.templateSlots.find((slot) => slot.slot === 'rooms')?.clusterIds.includes(plan.clusters[1]?.id || ''));
    assert.ok(plan.templateSlots.find((slot) => slot.slot === 'booking')?.clusterIds.includes(plan.clusters[2]?.id || ''));
  });

  it('keeps section images with nearby text and reports completeness', () => {
    const plan = buildContentIntelligencePlan({
      sourceUrl: 'https://fancy.example/',
      sourceHost: 'fancy.example',
      businessName: 'Fancy Example',
      siteContentLibrary: {
        schemaVersion: 1,
        sourceUrl: 'https://fancy.example/',
        sourceHost: 'fancy.example',
        businessName: 'Fancy Example',
        capturedAt: '2026-08-09T00:00:00.000Z',
        blocks: [
          {
            id: 'hero',
            category: 'hero',
            title: 'Fancy Example',
            text: 'A home away from home for cats.',
            images: [{ url: 'https://fancy.example/home-cat.jpg', caption: 'Cat in sunny room' }],
          },
          {
            id: 'health-care',
            category: 'health-care',
            title: 'Feline Health Care',
            text: 'Wellness care, routine support, and calm handling.',
            images: [{ url: 'https://fancy.example/health-room.jpg', caption: 'Health care room' }],
          },
        ],
      },
    });

    const healthCluster = plan.clusters.find((cluster) => cluster.role === 'pet_suitability');
    assert.ok(healthCluster);
    assert.equal(healthCluster?.images[0]?.url, 'https://fancy.example/health-room.jpg');
    assert.equal(healthCluster?.images[0]?.nearbyHeading, 'Feline Health Care');
    assert.equal(plan.completeness.clustersGenerated, 2);
    assert.equal(plan.completeness.imagesRepresented, 2);
    assert.ok(plan.templateSlots.find((slot) => slot.slot === 'pet-fit')?.clusterIds.includes(healthCluster?.id || ''));
  });

  it('enriches archive pages with grouped source-library blocks instead of dropping them', () => {
    const plan = buildContentIntelligencePlan({
      sourceUrl: 'https://rooms.example/',
      sourceHost: 'rooms.example',
      businessName: 'Rooms Example',
      sourceArchive: {
        pages: [
          {
            sourceUrl: 'https://rooms.example/',
            title: 'Rooms Example',
            heading: 'Rooms Example',
            bodyText: 'A calm place for cats to stay.',
            images: ['https://rooms.example/hero.jpg'],
          },
          {
            sourceUrl: 'https://rooms.example/accommodation',
            title: 'Accommodation',
            heading: 'Accommodation',
            bodyText: 'Private suites and daily care are available.',
            images: ['https://rooms.example/accommodation.jpg'],
          },
        ],
      },
      siteContentLibrary: {
        schemaVersion: 1,
        sourceUrl: 'https://rooms.example/',
        sourceHost: 'rooms.example',
        businessName: 'Rooms Example',
        capturedAt: '2026-08-09T00:00:00.000Z',
        blocks: [
          {
            id: 'rooms',
            category: 'rooms',
            title: 'Accommodation',
            text: 'Choose the space that fits your cat.',
            items: [
              {
                title: 'Garden Suite',
                text: 'Quiet suite with garden outlook.',
                price: '$45',
                image: 'https://rooms.example/garden-suite.jpg',
              },
              {
                title: 'Family Suite',
                text: 'Larger room for cats from one home.',
                price: '$65',
                image: 'https://rooms.example/family-suite.jpg',
              },
            ],
            images: [{ url: 'https://rooms.example/rooms-overview.jpg', caption: 'Room overview' }],
          },
        ],
      },
    });

    const roomCluster = plan.clusters.find((cluster) => cluster.role === 'rooms');

    assert.ok(roomCluster);
    assert.equal(roomCluster?.sourceOrder, 1);
    assert.deepEqual(
      roomCluster?.blocks.map((block) => block.heading),
      ['Accommodation', 'Garden Suite', 'Family Suite'],
    );
    assert.ok(roomCluster?.images.some((image) => image.url === 'https://rooms.example/garden-suite.jpg'));
    assert.ok(roomCluster?.images.some((image) => image.url === 'https://rooms.example/family-suite.jpg'));
    assert.ok(plan.templateSlots.find((slot) => slot.slot === 'rooms')?.clusterIds.includes(roomCluster?.id || ''));
  });

  it('keeps scraped template images available without repeating them while unused photos exist', () => {
    const content = buildCatstaysTemplateContent({
      sourceUrl: 'https://template-images.example/',
      sourceHost: 'template-images.example',
      businessName: 'Photos Example',
      sourceArchive: {
        pages: [
          {
            sourceUrl: 'https://template-images.example/',
            title: 'Photos Example',
            heading: 'Photos Example',
            bodyText: 'A calm boutique cattery with individual care for each guest.',
            images: ['https://template-images.example/hero.jpg'],
          },
          {
            sourceUrl: 'https://template-images.example/about',
            title: 'About',
            heading: 'About Photos Example',
            bodyText: 'Our team provides reassuring daily care, quiet rooms, and plenty of attention.',
            images: ['https://template-images.example/about.jpg'],
          },
          {
            sourceUrl: 'https://template-images.example/gallery',
            title: 'Gallery',
            heading: 'Gallery',
            bodyText: 'Photos from the cattery and guest spaces.',
            images: [
              'https://template-images.example/gallery-1.jpg',
              'https://template-images.example/gallery-2.jpg',
              'https://template-images.example/gallery-3.jpg',
              'https://template-images.example/gallery-4.jpg',
            ],
          },
        ],
      },
      siteContentLibrary: {
        schemaVersion: 1,
        sourceUrl: 'https://template-images.example/',
        sourceHost: 'template-images.example',
        businessName: 'Photos Example',
        capturedAt: '2026-08-11T00:00:00.000Z',
        blocks: [
          {
            id: 'rooms',
            category: 'rooms',
            title: 'Accommodation',
            text: 'Choose the space that fits your cat.',
            items: [
              {
                title: 'Garden Suite',
                text: 'Quiet suite with garden outlook.',
                price: '$45',
                image: 'https://template-images.example/garden-suite.jpg',
              },
              {
                title: 'Family Suite',
                text: 'Larger room for cats from one home.',
                price: '$65',
                image: 'https://template-images.example/family-suite.jpg',
              },
            ],
            images: [{ url: 'https://template-images.example/rooms-overview.jpg', caption: 'Room overview' }],
          },
          {
            id: 'grooming',
            category: 'grooming',
            title: 'Grooming',
            text: 'Gentle grooming support is available by arrangement.',
            images: [{ url: 'https://template-images.example/grooming.jpg', caption: 'Grooming room' }],
          },
        ],
      },
    });

    const renderedImages = [
      content.hero.image,
      content.about.image,
      content.facilities.image,
      content.owner.image,
      ...content.suites.map((suite) => suite.image),
      ...content.services.map((service) => service.image),
      ...content.gallery.slice(0, 4).map((image) => image.image),
    ].filter(Boolean);

    assert.equal(new Set(renderedImages).size, renderedImages.length);
    assert.ok(content.gallery.some((image) => image.image.startsWith('https://template-images.example/gallery-')));
    assert.ok(content.contentLibrary.blocks.some((block) => block.items.some((item) => item.image === 'https://template-images.example/garden-suite.jpg')));
  });

  it('builds source-ordered template sections without stealing gallery photos', () => {
    const content = buildCatstaysTemplateContent({
      sourceUrl: 'https://ordered.example/',
      sourceHost: 'ordered.example',
      businessName: 'Ordered Cattery',
      sourceArchive: {
        pages: [
          {
            sourceUrl: 'https://ordered.example/',
            title: 'Ordered Cattery',
            heading: 'Ordered Cattery',
            bodyText: 'A calm boutique cattery for local cats.',
            images: ['https://ordered.example/hero.jpg'],
          },
          {
            sourceUrl: 'https://ordered.example/accommodation',
            title: 'Accommodation',
            heading: 'Boutique Accommodation',
            bodyText: 'Private suites are arranged for quiet, comfortable stays.',
            images: ['https://ordered.example/rooms.jpg'],
          },
          {
            sourceUrl: 'https://ordered.example/health-care',
            title: 'Health Care',
            heading: 'Feline Health Care',
            bodyText: 'Medication support and calm health care are available.',
            images: ['https://ordered.example/health.jpg'],
          },
          {
            sourceUrl: 'https://ordered.example/gallery',
            title: 'Gallery',
            heading: 'Gallery',
            bodyText: 'Photos from the cattery.',
            images: [
              'https://ordered.example/gallery-1.jpg',
              'https://ordered.example/gallery-2.jpg',
            ],
          },
        ],
      },
      siteContentLibrary: {
        schemaVersion: 1,
        sourceUrl: 'https://ordered.example/',
        sourceHost: 'ordered.example',
        businessName: 'Ordered Cattery',
        capturedAt: '2026-08-11T00:00:00.000Z',
        blocks: [
          {
            id: 'rooms',
            category: 'rooms',
            title: 'Boutique Accommodation',
            text: 'Choose the space that fits your cat.',
            items: [
              {
                title: 'Sunny Room',
                text: 'A private room with daily care.',
                image: 'https://ordered.example/sunny-room.jpg',
              },
            ],
            images: [{ url: 'https://ordered.example/rooms.jpg', caption: 'Rooms' }],
          },
        ],
      },
    });

    const sourceSections = content.sourceSections ?? [];

    assert.deepEqual(
      sourceSections.map((section) => section.role),
      ['accommodation', 'health-care', 'gallery'],
    );
    assert.equal(sourceSections.find((section) => section.role === 'accommodation')?.items[0]?.image, 'https://ordered.example/sunny-room.jpg');
    assert.deepEqual(
      sourceSections.find((section) => section.role === 'gallery')?.images.map((image) => image.image),
      [
        'https://ordered.example/gallery-1.jpg',
        'https://ordered.example/gallery-2.jpg',
      ],
    );
    assert.ok(!sourceSections.some((section) => section.role !== 'gallery' && section.images.some((image) => image.image.includes('gallery-'))));
  });
});
