import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSocialCaption,
  effectivePromotionStatus,
  normalizePromotionCode,
  promotionMatchesQuery,
  promotionOffer,
  socialPostMatchesQuery,
} from './marketingCampaigns';

const promotion = {
  id: 'promotion-1', cattery_id: 'cattery-1', name: 'Spring stay', code: 'SPRING15',
  discount_type: 'percentage' as const, discount_value: 15, valid_from: '2026-09-01', valid_to: '2026-09-30',
  minimum_days: 3, maximum_uses: 20, usage_count: 2, status: 'active' as const, terms: 'Direct bookings only',
  created_at: '2026-08-30T00:00:00Z', updated_at: '2026-08-30T00:00:00Z',
};

test('normalizes promotion codes and formats offers', () => {
  assert.equal(normalizePromotionCode(' spring 15! '), 'SPRING15');
  assert.equal(promotionOffer(promotion), '15% off');
  assert.equal(promotionOffer({ discount_type: 'fixed', discount_value: 20 }), '$20.00 off');
});

test('derives scheduled, expired and exhausted promotion states', () => {
  assert.equal(effectivePromotionStatus(promotion, '2026-08-30'), 'draft');
  assert.equal(effectivePromotionStatus(promotion, '2026-09-15'), 'active');
  assert.equal(effectivePromotionStatus(promotion, '2026-10-01'), 'expired');
  assert.equal(effectivePromotionStatus({ ...promotion, maximum_uses: 2 }, '2026-09-15'), 'expired');
});

test('builds cattery-specific, promotion-aware copy without invented claims', () => {
  const caption = buildSocialCaption({ catteryName: 'Deloraine Cattery', location: 'Whangārei', websiteUrl: 'https://delorainecattery.catstays.app', tone: 'promotion', promotion });
  assert.match(caption, /Deloraine Cattery/);
  assert.match(caption, /SPRING15/);
  assert.match(caption, /15% off/);
  assert.doesNotMatch(caption, /daily photos|meals included/i);
});

test('searches promotion and social-post operational fields', () => {
  assert.equal(promotionMatchesQuery(promotion, 'direct'), true);
  assert.equal(promotionMatchesQuery(promotion, 'winter'), false);
  assert.equal(socialPostMatchesQuery({ title: 'Spring', caption: 'Book direct', platforms: ['Facebook'], status: 'draft' }, 'facebook'), true);
});
