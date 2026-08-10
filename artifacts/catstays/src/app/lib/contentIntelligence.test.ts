import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildContentIntelligencePlan } from './contentIntelligence';

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
});
