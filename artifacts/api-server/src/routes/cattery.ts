import { Router, type IRouter, type Request, type Response } from 'express';
import crypto from 'crypto';
import dns from 'dns/promises';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createContentSourceFromOnboardingDraft } from '../lib/openHomeContentSources';
import { adoptTemporaryPreviewSource } from '../lib/temporaryPreviewSources';

const router: IRouter = Router();

const ROOT_DOMAIN = 'catstays.app';

function readEnvValue(...keys: string[]) {
  for (const key of keys) {
    const raw = process.env[key];
    if (!raw) continue;
    const value = raw.trim();
    if (!value || /^\$[A-Z0-9_]+$/i.test(value)) continue;
    return value;
  }
  return undefined;
}

function isLocalhostUrl(value: string) {
  return /^https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:\/|$)/i.test(value.trim());
}

function hasPlaceholderEnvValue(...keys: string[]) {
  return keys.some((key) => {
    const raw = process.env[key];
    return raw ? /^\$[A-Z0-9_]+$/i.test(raw.trim()) : false;
  });
}

function originFromRequest(req?: Request) {
  const forwardedHost = req?.get('x-forwarded-host');
  const forwardedProto = req?.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const origin = req?.get('origin');

  if (forwardedHost) {
    return `${forwardedProto || 'https'}://${forwardedHost.split(',')[0].trim()}`;
  }

  return origin || '';
}

function resolvePublicAppUrl(req?: Request) {
  const configured = readEnvValue('CATSTAYS_APP_URL', 'PUBLIC_APP_URL', 'VITE_PUBLIC_APP_URL');
  const isProduction = process.env.NODE_ENV === 'production';

  if (configured) {
    if (isProduction && isLocalhostUrl(configured)) {
      return `https://${ROOT_DOMAIN}`;
    }
    return configured.replace(/\/$/, '');
  }

  const requestOrigin = originFromRequest(req);
  if (requestOrigin) {
    if (!isProduction || !isLocalhostUrl(requestOrigin)) {
      return requestOrigin.replace(/\/$/, '');
    }
  }

  return isProduction ? `https://${ROOT_DOMAIN}` : 'http://localhost:5173';
}

const supabaseUrl = readEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_PROJECT_URL');
const supabaseAnonKey = readEnvValue('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY');
const supabaseServiceKey = readEnvValue(
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_SECRET_KEY',
);

function missingSupabaseConfigMessage() {
  const missing = [
    supabaseUrl
      ? null
      : hasPlaceholderEnvValue('VITE_SUPABASE_URL', 'SUPABASE_URL', 'SUPABASE_PROJECT_URL')
        ? 'VITE_SUPABASE_URL is set to a placeholder configuration'
        : 'VITE_SUPABASE_URL',
    supabaseAnonKey
      ? null
      : hasPlaceholderEnvValue('VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY', 'SUPABASE_PUBLISHABLE_KEY')
        ? 'VITE_SUPABASE_ANON_KEY is set to a placeholder configuration'
        : 'VITE_SUPABASE_ANON_KEY',
    supabaseServiceKey
      ? null
      : hasPlaceholderEnvValue('SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY', 'SUPABASE_SECRET_KEY')
        ? 'SUPABASE_SERVICE_ROLE_KEY is set to a placeholder configuration'
        : 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean);

  return `Supabase provisioning cannot read the real Replit secret${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}.`;
}

type PlanTier = 'starter' | 'professional' | 'premium';

type RoomTypeDraft = {
  name?: string;
  maxCatsPerRoom?: string | number;
  numberOfRooms?: string | number;
  sameFamilyOnly?: boolean;
};

type PricingRateDraft = {
  price?: string | number;
};

type OnboardingDraft = {
  name?: string;
  email?: string;
  password?: string;
  businessName?: string;
  location?: string;
  address?: string;
  phone?: string;
  subdomain?: string;
  provisionedCatteryId?: string;
  onboardingDraftToken?: string;
  previewSourceToken?: string;
  roomTypes?: RoomTypeDraft[];
  pricingRates?: PricingRateDraft[];
  [key: string]: unknown;
};

const websiteSettingKeys = [
  'primaryColor',
  'accentColor',
  'backgroundColor',
  'typography',
  'headingFont',
  'subheadingFont',
  'bodyFont',
  'logo',
  'logoImage',
  'heroImage',
  'heroHeading',
  'heroSubheading',
  'heroPrimaryCtaText',
  'heroPrimaryCtaHref',
  'heroSecondaryCtaText',
  'heroSecondaryCtaHref',
  'aboutText',
  'aboutHeading',
  'aboutImage',
  'whyChooseUsData',
  'whyChooseUsHeading',
  'whyChooseUsText',
  'whyChooseUsFeatures',
  'facilitiesData',
  'facilitiesHeading',
  'facilitiesText',
  'facilitiesImage',
  'facilityFeatures',
  'suitesData',
  'suitesHeading',
  'suites',
  'servicesData',
  'additionalServicesHeading',
  'galleryImages',
  'galleryData',
  'galleryHeading',
  'testimonialsData',
  'testimonialsHeading',
  'faqData',
  'faqHeading',
  'commitmentData',
  'ownerData',
  'locationData',
  'contactData',
  'socialLinks',
  'virtualTourUrl',
  'footerAbout',
  'siteContentLibrary',
  'contentLibrary',
  'sourceArchive',
  'sectionsOrder',
  'importSourceUrl',
  'sourceUrl',
  'sourceHost',
  'previewImportRecord',
  'previewImportRecordId',
  'contentSourceId',
  'contentSourceHash',
  'contentSourceImportVersion',
  'previewRecordStatus',
  'previewSourceId',
  'previewSourceToken',
  'previewSourceExpiresAt',
  'liveTemplate',
  'testimonials',
  'faqs',
  'additionalServices',
  'openByAppointmentOnly',
  'bookingInterval',
  'morningStart',
  'morningEnd',
  'afternoonStart',
  'afternoonEnd',
  'depositType',
  'depositAmount',
  'cleaningBufferEnabled',
  'cleaningBuffer',
  'pricingPer',
  'pricingRates',
  'chargeTax',
  'taxRate',
  'taxType',
  'discounts',
  'blockOutDates',
  'selectedTemplate',
] as const;

function createPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureProvisioningClientsReady(
  publicClient: SupabaseClient,
  serviceClient: SupabaseClient,
) {
  const { error: authError } = await publicClient.auth.getSession();
  if (authError) {
    throw new Error('Supabase public auth is not configured correctly.');
  }

  const { error: adminError } = await serviceClient.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (adminError) {
    throw new Error(
      'Supabase provisioning is not configured correctly. Please check the service role key in Replit secrets.',
    );
  }
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function normalizePlan(plan: unknown): PlanTier {
  return plan === 'starter' || plan === 'premium' ? plan : 'professional';
}

function pickWebsiteSettings(data: OnboardingDraft) {
  return websiteSettingKeys.reduce<Record<string, unknown>>((settings, key) => {
    if (data[key] !== undefined) settings[key] = data[key];
    return settings;
  }, {});
}

function stringSetting(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function hasExistingContentSource(settings: Record<string, unknown>) {
  return Boolean(
    stringSetting(settings.contentSourceId) ||
      stringSetting(settings.contentSourceHash),
  );
}

function hasImportPayload(draft: OnboardingDraft) {
  const record = draft.previewImportRecord;
  if (record && typeof record === 'object' && !Array.isArray(record)) {
    const source = (record as Record<string, unknown>).source;
    if (source && typeof source === 'object' && !Array.isArray(source)) {
      return Boolean(stringSetting((source as Record<string, unknown>).url));
    }
  }

  return Boolean(
    stringSetting(draft.previewSourceToken) ||
    stringSetting(draft.importSourceUrl) ||
      stringSetting(draft.sourceUrl) ||
      draft.siteContentLibrary ||
      draft.contentLibrary,
  );
}

function createOnboardingDraftToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashOnboardingDraftToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function tokensMatch(token: string, expectedHash: unknown) {
  if (typeof expectedHash !== 'string' || !token) return false;
  const actual = Buffer.from(hashOnboardingDraftToken(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function toPositiveNumber(value: string | number | undefined, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function waitForTriggeredCattery(serviceClient: SupabaseClient, ownerId: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const { data } = await serviceClient
      .from('catteries')
      .select('id, slug')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (data) return data as { id: string; slug: string | null };
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return null;
}

async function ensureRequestedSlugAvailable(
  serviceClient: SupabaseClient,
  requestedSlug: string,
  ownerId: string,
) {
  const { data } = await serviceClient
    .from('catteries')
    .select('id, owner_id')
    .eq('slug', requestedSlug)
    .maybeSingle();

  return !data || data.owner_id === ownerId;
}

function roomInsertsForDraft(catteryId: string, data: OnboardingDraft) {
  const defaultRate = toPositiveNumber(data.pricingRates?.[0]?.price, 30);
  const roomTypes = Array.isArray(data.roomTypes) ? data.roomTypes : [];

  return roomTypes
    .filter((room) => typeof room.name === 'string' && room.name.trim().length > 0)
    .map((room) => {
      const capacity = toPositiveNumber(room.maxCatsPerRoom, 1);

      return {
        cattery_id: catteryId,
        name: room.name!.trim(),
        type: 'standard',
        description: `Capacity: ${capacity} cat${capacity === 1 ? '' : 's'} per room`,
        price_per_night: defaultRate,
        max_cats: capacity,
        capacity,
        amenities: [],
        is_active: true,
      };
    });
}

router.post('/cattery/provision', async (req: Request, res: Response) => {
  const publicClient = createPublicClient();
  const serviceClient = createServiceClient();

  if (!publicClient || !serviceClient) {
    res.status(500).json({ error: missingSupabaseConfigMessage() });
    return;
  }

  const draft = (req.body?.data ?? {}) as OnboardingDraft;
  const plan = normalizePlan(req.body?.plan);
  const ownerName = (draft.name ?? '').trim();
  const email = (draft.email ?? '').trim().toLowerCase();
  const password = draft.password ?? '';
  const businessName = (draft.businessName || ownerName || 'My Cattery').trim();
  const requestedSlug = slugify(draft.subdomain || businessName);

  if (!ownerName || !email || !password || password.length < 8 || !requestedSlug) {
    res.status(400).json({ error: 'Name, email, password, and cattery handle are required.' });
    return;
  }

  try {
    await ensureProvisioningClientsReady(publicClient, serviceClient);

    const { data: signupData, error: signupError } = await publicClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
          business_name: businessName,
        },
        emailRedirectTo: `${resolvePublicAppUrl(req)}/confirm-email`,
      },
    });

    if (signupError) {
      const message = signupError.message || 'Could not create account.';
      const alreadyRegistered = message.toLowerCase().includes('already');
      res.status(alreadyRegistered ? 409 : 400).json({ error: alreadyRegistered ? 'This email is already registered. Please sign in instead.' : message });
      return;
    }

    const user = signupData.user;
    const identities = user?.identities ?? [];
    if (!user?.id || identities.length === 0) {
      res.status(409).json({ error: 'This email is already registered. Please sign in instead.' });
      return;
    }

    const slugAvailable = await ensureRequestedSlugAvailable(serviceClient, requestedSlug, user.id);
    if (!slugAvailable) {
      res.status(409).json({ error: 'That CatStays website handle is already taken. Please choose another one.' });
      return;
    }

    let cattery = await waitForTriggeredCattery(serviceClient, user.id);

    if (!cattery) {
      const { data: inserted, error: insertError } = await serviceClient
        .from('catteries')
        .insert({
          owner_id: user.id,
          name: businessName,
          slug: requestedSlug,
          email,
        })
        .select('id, slug')
        .single();

      if (insertError || !inserted) {
        throw insertError ?? new Error('Cattery could not be created.');
      }

      cattery = inserted as { id: string; slug: string | null };
    }

    const websiteSettings = pickWebsiteSettings(draft);
    const onboardingDraftToken = createOnboardingDraftToken();
    websiteSettings.onboardingDraftTokenHash = hashOnboardingDraftToken(onboardingDraftToken);
    websiteSettings.onboardingDraftTokenCreatedAt = new Date().toISOString();
    let contentSource = await adoptTemporaryPreviewSource(serviceClient, {
      previewToken: draft.previewSourceToken,
      catteryId: cattery.id,
      actorId: user.id,
    });
    if (!contentSource) {
      contentSource = await createContentSourceFromOnboardingDraft(serviceClient, {
        catteryId: cattery.id,
        draft,
        actorId: user.id,
      });
    }

    if (contentSource) {
      websiteSettings.previewImportRecordId = contentSource.id;
      websiteSettings.contentSourceId = contentSource.id;
      websiteSettings.contentSourceHash = contentSource.content_hash;
      websiteSettings.contentSourceImportVersion = contentSource.import_version;
    }

    const { error: updateError } = await serviceClient
      .from('catteries')
      .update({
        name: businessName,
        email,
        phone: draft.phone || null,
        address: draft.address || null,
        city: draft.location || null,
        slug: requestedSlug,
        website_settings: websiteSettings,
        subscription_status: `trial_${plan}`,
      })
      .eq('id', cattery.id);

    if (updateError) throw updateError;

    const { data: existingRooms } = await serviceClient
      .from('rooms')
      .select('id')
      .eq('cattery_id', cattery.id)
      .limit(1);

    const roomInserts = roomInsertsForDraft(cattery.id, draft);
    if ((!existingRooms || existingRooms.length === 0) && roomInserts.length > 0) {
      const { error: roomsError } = await serviceClient.from('rooms').insert(roomInserts);
      if (roomsError) {
        const message = roomsError.message.toLowerCase();
        if (message.includes('capacity') || message.includes('amenities')) {
          const legacyRoomInserts = roomInserts.map(({ capacity: _capacity, amenities: _amenities, ...room }) => room);
          const { error: legacyRoomsError } = await serviceClient.from('rooms').insert(legacyRoomInserts);
          if (legacyRoomsError) throw legacyRoomsError;
        } else {
          throw roomsError;
        }
      }
    }

    res.json({
      success: true,
      userId: user.id,
      catteryId: cattery.id,
      onboardingDraftToken,
      contentSourceId: contentSource?.id ?? null,
      slug: requestedSlug,
      emailConfirmationSent: true,
    });
  } catch (err: unknown) {
    console.error('[cattery/provision]', err);
    const message = err instanceof Error ? err.message : 'Failed to provision cattery.';
    res.status(500).json({ error: message });
  }
});

router.patch('/cattery/draft-progress', async (req: Request, res: Response) => {
  const publicClient = createPublicClient();
  const serviceClient = createServiceClient();

  if (!publicClient || !serviceClient) {
    res.status(500).json({ error: missingSupabaseConfigMessage() });
    return;
  }

  const catteryId = typeof req.body?.catteryId === 'string' ? req.body.catteryId : '';
  const onboardingDraftToken = typeof req.body?.onboardingDraftToken === 'string' ? req.body.onboardingDraftToken : '';
  const draft = (req.body?.data ?? {}) as OnboardingDraft;
  const plan = normalizePlan(req.body?.plan);
  const shouldPublish = req.body?.publish === true;

  if (!catteryId || !onboardingDraftToken) {
    res.status(400).json({ error: 'Cattery draft details are required.' });
    return;
  }

  try {
    await ensureProvisioningClientsReady(publicClient, serviceClient);

    const { data: cattery, error: catteryError } = await serviceClient
      .from('catteries')
      .select('id, owner_id, slug, email, phone, address, city, website_settings')
      .eq('id', catteryId)
      .maybeSingle();

    if (catteryError) throw catteryError;
    if (!cattery) {
      res.status(404).json({ error: 'Cattery draft was not found.' });
      return;
    }

    const existingSettings = (cattery.website_settings as Record<string, unknown> | null) ?? {};
    if (!tokensMatch(onboardingDraftToken, existingSettings.onboardingDraftTokenHash)) {
      res.status(403).json({ error: 'This onboarding draft is no longer available.' });
      return;
    }

    const businessName = (draft.businessName || '').trim();
    const requestedSlug = slugify(String(draft.subdomain || cattery.slug || businessName || 'my-cattery'));
    const websiteSettings = {
      ...existingSettings,
      ...pickWebsiteSettings(draft),
    };

    let contentSource: Awaited<ReturnType<typeof createContentSourceFromOnboardingDraft>> = null;
    if (hasImportPayload(draft) && !hasExistingContentSource(websiteSettings)) {
      contentSource = await adoptTemporaryPreviewSource(serviceClient, {
        previewToken: draft.previewSourceToken,
        catteryId,
        actorId: cattery.owner_id,
      });
      if (!contentSource) {
        contentSource = await createContentSourceFromOnboardingDraft(serviceClient, {
          catteryId,
          draft,
          actorId: cattery.owner_id,
        });
      }

      if (contentSource) {
        websiteSettings.previewImportRecordId = contentSource.id;
        websiteSettings.contentSourceId = contentSource.id;
        websiteSettings.contentSourceHash = contentSource.content_hash;
        websiteSettings.contentSourceImportVersion = contentSource.import_version;
      }
    }

    if (shouldPublish) {
      const { data: existingRooms } = await serviceClient
        .from('rooms')
        .select('id')
        .eq('cattery_id', catteryId)
        .limit(1);

      const roomInserts = roomInsertsForDraft(catteryId, draft);
      if ((!existingRooms || existingRooms.length === 0) && roomInserts.length > 0) {
        const { error: roomsError } = await serviceClient.from('rooms').insert(roomInserts);
        if (roomsError) {
          const message = roomsError.message.toLowerCase();
          if (message.includes('capacity') || message.includes('amenities')) {
            const legacyRoomInserts = roomInserts.map(({ capacity: _capacity, amenities: _amenities, ...room }) => room);
            const { error: legacyRoomsError } = await serviceClient.from('rooms').insert(legacyRoomInserts);
            if (legacyRoomsError) throw legacyRoomsError;
          } else {
            throw roomsError;
          }
        }
      }
    }

    const { error: updateError } = await serviceClient
      .from('catteries')
      .update({
        name: businessName || undefined,
        email: draft.email || cattery.email,
        phone: draft.phone || cattery.phone,
        address: draft.address || cattery.address,
        city: draft.location || cattery.city,
        slug: requestedSlug || cattery.slug,
        website_settings: websiteSettings,
        ...(shouldPublish ? { subscription_status: `trial_${plan}` } : {}),
      })
      .eq('id', catteryId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      catteryId,
      slug: requestedSlug || cattery.slug,
      contentSourceId: contentSource?.id ?? websiteSettings.contentSourceId ?? null,
    });
  } catch (err: unknown) {
    console.error('[cattery/draft-progress]', err);
    const message = err instanceof Error ? err.message : 'Failed to save onboarding progress.';
    res.status(500).json({ error: message });
  }
});

router.get('/cattery/verify-domain', async (req, res) => {
  const domain = req.query.domain as string;
  if (!domain) {
    res.status(400).json({ error: 'Missing domain parameter' });
    return;
  }

  try {
    const cleanDomain = domain.replace(/^www\./, '');
    let verified = false;
    let resolvedTo = '';
    let method = '';

    try {
      const cnames = await dns.resolveCname(domain);
      resolvedTo = cnames[0] || '';
      verified = cnames.some(c => c === ROOT_DOMAIN || c === `www.${ROOT_DOMAIN}` || c.endsWith(`.${ROOT_DOMAIN}`));
      method = 'CNAME';
    } catch {
      try {
        const addrs = await dns.resolve4(domain);
        const rootAddrs: string[] = await dns.resolve4(ROOT_DOMAIN).catch(() => []);
        resolvedTo = addrs[0] || '';
        verified = addrs.some(a => rootAddrs.includes(a));
        method = 'A record';
      } catch {
        verified = false;
        resolvedTo = 'not resolved';
        method = 'none';
      }
    }

    res.json({
      domain,
      verified,
      resolvedTo,
      method,
      expected: ROOT_DOMAIN,
      message: verified
        ? `Domain is correctly pointing to ${ROOT_DOMAIN}`
        : `Domain is not yet pointing to ${ROOT_DOMAIN}. Add a CNAME record: ${domain} → ${ROOT_DOMAIN}`,
    });
  } catch (err) {
    console.error('[cattery/verify-domain]', err);
    res.status(500).json({ error: 'DNS lookup failed', verified: false });
  }
});

export default router;
