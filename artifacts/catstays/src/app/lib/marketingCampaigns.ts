export type PromotionStatus = 'draft' | 'active' | 'paused' | 'expired' | 'archived';
export type SocialPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type CatteryPromotion = {
  id: string;
  cattery_id: string;
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: string | null;
  valid_to: string | null;
  minimum_days: number;
  maximum_uses: number | null;
  usage_count: number;
  status: PromotionStatus;
  terms: string | null;
  created_at: string;
  updated_at: string;
};

export type CatterySocialPost = {
  id: string;
  cattery_id: string;
  promotion_id: string | null;
  title: string;
  caption: string;
  platforms: string[];
  image_url: string | null;
  status: SocialPostStatus;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizePromotionCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
}

export function promotionOffer(promotion: Pick<CatteryPromotion, 'discount_type' | 'discount_value'>) {
  const amount = Number(promotion.discount_value) || 0;
  return promotion.discount_type === 'percentage'
    ? `${amount}% off`
    : `$${amount.toFixed(2)} off`;
}

export function effectivePromotionStatus(
  promotion: Pick<CatteryPromotion, 'status' | 'valid_from' | 'valid_to' | 'maximum_uses' | 'usage_count'>,
  today = new Date().toISOString().slice(0, 10),
): PromotionStatus {
  if (promotion.status === 'archived' || promotion.status === 'paused' || promotion.status === 'draft') return promotion.status;
  if (promotion.valid_from && promotion.valid_from > today) return 'draft';
  if (promotion.valid_to && promotion.valid_to < today) return 'expired';
  if (promotion.maximum_uses !== null && promotion.usage_count >= promotion.maximum_uses) return 'expired';
  return 'active';
}

export function promotionMatchesQuery(promotion: Pick<CatteryPromotion, 'name' | 'code' | 'terms'>, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [promotion.name, promotion.code, promotion.terms || ''].some((value) => value.toLowerCase().includes(search));
}

export function buildSocialCaption({
  catteryName,
  location,
  websiteUrl,
  tone,
  promotion,
}: {
  catteryName: string;
  location?: string | null;
  websiteUrl: string;
  tone: 'availability' | 'care' | 'promotion';
  promotion?: CatteryPromotion | null;
}) {
  if (tone === 'promotion' && promotion) {
    const dates = promotion.valid_to ? ` Offer ends ${promotion.valid_to}.` : '';
    const minimum = promotion.minimum_days > 1 ? ` Minimum ${promotion.minimum_days} days.` : '';
    return `${promotion.name} at ${catteryName}: ${promotionOffer(promotion)} with code ${promotion.code}.${minimum}${dates}\n\nBook now: ${websiteUrl}\n\n#CatBoarding #CatCare #SpecialOffer`;
  }
  if (tone === 'care') {
    return `Comfort, calm and individual attention are part of every stay at ${catteryName}${location ? ` in ${location}` : ''}. We care for every cat as an individual.\n\nLearn more: ${websiteUrl}\n\n#CatCare #CatteryLife #HappyCats`;
  }
  return `Planning a cat stay? ${catteryName}${location ? ` in ${location}` : ''} is taking direct booking requests. Check your dates and send your request online.\n\nBook now: ${websiteUrl}\n\n#CatBoarding #CatHoliday #BookDirect`;
}

export function socialPostMatchesQuery(post: Pick<CatterySocialPost, 'title' | 'caption' | 'platforms' | 'status'>, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;
  return [post.title, post.caption, post.status, ...post.platforms].some((value) => value.toLowerCase().includes(search));
}
