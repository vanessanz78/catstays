export interface TenantFeatureSettings {
  petcoverOfferEnabled: boolean;
  groomingEnabled: boolean;
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeTenantFeatures(settings: unknown): TenantFeatureSettings {
  const source = asObject(settings);
  return {
    petcoverOfferEnabled: source.petcoverOfferEnabled === true,
    groomingEnabled: source.groomingEnabled === true,
  };
}