import { useEffect } from 'react';

export const SEO_ORIGIN = 'https://catstays.app';
export const SEO_IMAGE = `${SEO_ORIGIN}/opengraph.jpg`;

export type SeoSchema = Record<string, unknown>;

export type SeoMetadata = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  schemas?: SeoSchema[];
};

type SeoCattery = {
  id?: string;
  name?: string | null;
  slug?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  logo_url?: string | null;
};

function currentOrigin() {
  if (typeof window !== 'undefined' && window.location.origin) return window.location.origin;
  return SEO_ORIGIN;
}

export function absoluteSeoUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${currentOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}

function upsertMeta(selector: string, attributes: Record<string, string>, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    element.dataset.catstaysSeo = 'true';
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"][data-catstays-seo]`);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    element.dataset.catstaysSeo = 'true';
    document.head.appendChild(element);
  }
  element.href = href;
}

export function applySeoMetadata(metadata: SeoMetadata) {
  if (typeof document === 'undefined') return;

  const canonical = absoluteSeoUrl(metadata.path || window.location.pathname);
  const image = absoluteSeoUrl(metadata.image || '/opengraph.jpg');

  document.title = metadata.title;
  upsertMeta('meta[name="description"]', { name: 'description' }, metadata.description);
  upsertMeta('meta[name="robots"]', { name: 'robots' }, metadata.noIndex ? 'noindex,nofollow' : 'index,follow');
  upsertMeta('meta[property="og:title"]', { property: 'og:title' }, metadata.title);
  upsertMeta('meta[property="og:description"]', { property: 'og:description' }, metadata.description);
  upsertMeta('meta[property="og:url"]', { property: 'og:url' }, canonical);
  upsertMeta('meta[property="og:type"]', { property: 'og:type' }, metadata.type || 'website');
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, 'CatStays');
  upsertMeta('meta[property="og:locale"]', { property: 'og:locale' }, 'en_NZ');
  upsertMeta('meta[property="og:image"]', { property: 'og:image' }, image);
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card' }, 'summary_large_image');
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, metadata.title);
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, metadata.description);
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, image);
  upsertLink('canonical', canonical);

  document.head.querySelectorAll('script[data-catstays-seo]').forEach((script) => script.remove());
  const schemas = metadata.schemas || [];
  schemas.forEach((schema) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.catstaysSeo = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

export function useSeoMetadata(metadata: SeoMetadata) {
  const schemaKey = JSON.stringify(metadata.schemas || []);
  useEffect(() => {
    applySeoMetadata(metadata);
  }, [
    metadata.title,
    metadata.description,
    metadata.path,
    metadata.image,
    metadata.type,
    metadata.noIndex,
    schemaKey,
  ]);
}

export function catstaysOrganizationSchema(): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SEO_ORIGIN}/#organization`,
    name: 'CatStays',
    url: SEO_ORIGIN,
    logo: SEO_IMAGE,
    image: SEO_IMAGE,
    description: 'Cat boarding software for catteries, including websites, online bookings, customer records, and staff dashboards.',
  };
}

export function catstaysWebsiteSchema(): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SEO_ORIGIN}/#website`,
    name: 'CatStays',
    url: SEO_ORIGIN,
    publisher: { '@id': `${SEO_ORIGIN}/#organization` },
    inLanguage: 'en-NZ',
  };
}

export function catstaysApplicationSchema(): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CatStays',
    url: SEO_ORIGIN,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Run your cattery with online bookings, room calendars, customer and cat records, staff updates, and a professional website.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NZD',
      category: 'Free trial',
    },
  };
}

export function localBusinessSchema(cattery: SeoCattery, path: string): SeoSchema | null {
  if (!cattery.name || (!cattery.address && !cattery.city)) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${absoluteSeoUrl(path)}#business`,
    name: cattery.name,
    url: absoluteSeoUrl(path),
    image: cattery.logo_url || SEO_IMAGE,
    ...(cattery.phone ? { telephone: cattery.phone } : {}),
    ...(cattery.email ? { email: cattery.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(cattery.address ? { streetAddress: cattery.address } : {}),
      ...(cattery.city ? { addressLocality: cattery.city } : {}),
      addressCountry: 'NZ',
    },
    ...(cattery.city ? { areaServed: cattery.city } : {}),
    parentOrganization: { '@id': `${SEO_ORIGIN}/#organization` },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): SeoSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteSeoUrl(item.path),
    })),
  };
}

export function routeSeo(pathname: string): SeoMetadata {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const publicRoutes: Record<string, SeoMetadata> = {
    '/': {
      title: 'Cat Boarding Software for Catteries | CatStays',
      description: 'CatStays helps catteries take online bookings, manage rooms and customer records, send cat updates, and launch a professional website.',
      path: '/',
      schemas: [catstaysOrganizationSchema(), catstaysWebsiteSchema(), catstaysApplicationSchema()],
    },
    '/home': {
      title: 'Cat Boarding Software for Catteries | CatStays',
      description: 'Run your cattery with calmer bookings, room management, customer records, cat updates, and a professional website from CatStays.',
      path: '/home',
      schemas: [catstaysOrganizationSchema(), catstaysWebsiteSchema(), catstaysApplicationSchema()],
    },
    '/marketing': {
      title: 'Cattery Management Software | CatStays',
      description: 'A calmer way to run a cattery: websites, online bookings, room calendars, customer records, payments, and cat updates in one place.',
      path: '/marketing',
      schemas: [catstaysOrganizationSchema(), catstaysWebsiteSchema(), catstaysApplicationSchema()],
    },
    '/features': {
      title: 'Cattery Software Features | Bookings, Rooms & Cat Updates',
      description: 'Explore CatStays features for catteries: online bookings, room calendars, customer and cat profiles, payments, messages, and private cat updates.',
      path: '/features',
      schemas: [catstaysOrganizationSchema(), breadcrumbSchema([{ name: 'CatStays', path: '/' }, { name: 'Features', path: '/features' }])],
    },
    '/pricing': {
      title: 'Cattery Software Pricing | CatStays Plans',
      description: 'Compare CatStays plans for catteries. Start with the essentials for bookings and grow into a complete cattery management workspace.',
      path: '/pricing',
      schemas: [catstaysOrganizationSchema(), breadcrumbSchema([{ name: 'CatStays', path: '/' }, { name: 'Pricing', path: '/pricing' }])],
    },
    '/demo/deloraine': {
      title: 'Cattery Website Example | Deloraine Cattery Demo | CatStays',
      description: 'See an example of a polished cattery website, online booking flow, staff dashboard, and client portal built with CatStays.',
      path: '/demo/deloraine',
      schemas: [catstaysOrganizationSchema(), breadcrumbSchema([{ name: 'CatStays', path: '/' }, { name: 'Live example', path: '/demo/deloraine' }])],
    },
  };

  if (publicRoutes[cleanPath]) return publicRoutes[cleanPath];
  const privateRoute = /\/(admin|dashboard|staff-dashboard|client-portal|customer|platform|builder|onboarding|login|signup|reset-password)/.test(cleanPath);
  const tenantRoute = cleanPath.match(/^\/tenant\/([^/]+)(?:\/([^/]+))?$/);
  if (tenantRoute) {
    const tenantName = tenantRoute[1]
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
    const section = tenantRoute[2];
    const sectionLabels: Record<string, string> = {
      about: 'About',
      rooms: 'Rooms & Accommodation',
      booking: 'Bookings',
      'booking-flow': 'Book a Cat Stay',
      contact: 'Contact',
      blog: 'Cat Care Blog',
    };
    const sectionLabel = section ? sectionLabels[section] || 'Cat Boarding' : 'Cat Boarding';
    return {
      title: `${sectionLabel} | ${tenantName}`,
      description: `${tenantName} provides caring cat boarding, comfortable accommodation, and simple online booking for cat families.`,
      path: cleanPath,
      schemas: [breadcrumbSchema([
        { name: tenantName, path: `/tenant/${tenantRoute[1]}` },
        ...(section ? [{ name: sectionLabel, path: cleanPath }] : []),
      ])],
    };
  }
  return {
    title: 'CatStays | Cattery Management Software',
    description: 'CatStays gives catteries a calmer way to manage bookings, rooms, customer records, and cat care.',
    path: cleanPath,
    noIndex: privateRoute,
    schemas: privateRoute ? [] : [catstaysOrganizationSchema()],
  };
}