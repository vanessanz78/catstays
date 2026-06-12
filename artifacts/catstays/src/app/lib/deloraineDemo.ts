export const DELORAINE_SOURCE_URL = 'https://www.delorainecattery.com/';
export const PREVIEW_URL_STORAGE_KEY = 'catstays_preview_url';
export const PREVIEW_DATA_STORAGE_KEY = 'catstays_preview_data';
export const IMPORT_URL_STORAGE_KEY = 'catstays_import_url';

const deloraineAssets = [
  'https://www.delorainecattery.com/assets/Deloraine%20Cattery%20Building-CX1rWDRb.png',
  'https://www.delorainecattery.com/assets/Private3-R_9kRTwp.jpg',
  'https://www.delorainecattery.com/assets/Communal3-CidRKr1N.jpg',
  'https://www.delorainecattery.com/assets/Indoor-Blew-XJG.jpeg',
  'https://www.delorainecattery.com/assets/Kitty3-nO3ryPLf.jpg',
  'https://www.delorainecattery.com/assets/Wally-C97dE8Dg.jpg',
  'https://www.delorainecattery.com/assets/Lola-c8BpaLTB.jpg',
  'https://www.delorainecattery.com/assets/Paul%20and%20Vanessa-Dst6H-6-.jpg',
];

const genericCatAssets = [
  'https://images.unsplash.com/photo-1770255860384-3359fd44b467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  'https://images.unsplash.com/photo-1636340629239-008219592d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  'https://images.unsplash.com/photo-1672764788664-9f5844477a0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1574114908319-2efa632834d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

export interface ImportedCatteryScrape {
  sourceUrl?: string;
  sourceHost?: string;
  title?: string;
  description?: string;
  heading?: string;
  heroImage?: string;
  logoImage?: string;
  images?: string[];
  galleryImages?: Array<{ url: string; caption?: string }>;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  bookingUrl?: string;
  highlights?: Array<{ title: string; description: string }>;
  rooms?: Array<{
    name: string;
    description?: string;
    price?: string;
    priceUnit?: string;
    price_per_night?: number;
    capacity?: number;
    amenities?: string[];
    image?: string;
  }>;
  services?: Array<{
    title: string;
    description: string;
    price?: string;
    image?: string;
  }>;
  faqs?: Array<{ question: string; answer: string }>;
  websiteSettings?: Record<string, any>;
  extractedFrom?: {
    html?: boolean;
    scripts?: number;
    apiServices?: boolean;
  };
}

export interface DelorainePreviewData {
  businessName: string;
  location: string;
  subdomain: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  heroHeading: string;
  heroSubheading: string;
  aboutText: string;
  aboutHeading: string;
  phone: string;
  email: string;
  address: string;
  pricePerNight?: string;
  pricePerCat?: string;
  selectedTemplate?: string | null;
  heroImage?: string;
  ctaText?: string;
  headingFont?: string;
  subheadingFont?: string;
  typography?: string;
  whyChooseUsData?: any;
  facilitiesData?: any;
  suitesData?: any;
  aboutData?: any;
  servicesData?: any;
  galleryData?: any;
  testimonialsData?: any;
  faqData?: any;
  commitmentData?: any;
  contactData?: any;
  sectionsOrder?: string[];
  roomTypes?: Array<{
    name: string;
    numberOfRooms: string;
    maxCatsPerRoom: string;
    sameFamilyOnly: boolean;
  }>;
  pricingRates?: Array<{
    numberOfCats: string;
    price: string;
    discountType: string;
    discountValue: string;
  }>;
  checkInTime?: string;
  checkOutTime?: string;
  minimumStay?: string;
  depositRequired?: string;
  depositType?: string;
  cancellationPolicy?: string;
}

export const fallbackDeloraineScrape: ImportedCatteryScrape = {
  sourceUrl: DELORAINE_SOURCE_URL,
  sourceHost: 'delorainecattery.com',
  title: 'Deloraine Cattery - Premium Cat Boarding & Care Services',
  description:
    'Professional cat boarding facility providing exceptional care for your feline friends. Deloraine Cattery offers comfortable accommodations and personalized attention.',
  heading: 'Deloraine Cattery',
  heroImage: deloraineAssets[0],
  images: deloraineAssets,
  galleryImages: deloraineAssets.map((url, index) => ({
    url,
    caption:
      [
        'Deloraine Cattery building',
        'Private boarding rooms',
        'Communal play area',
        'Indoor boarding suites',
        'Happy white kittens',
        'Wally the Siamese cat',
        'Lola at playtime',
        'Paul and Vanessa Wilson',
      ][index] || 'Deloraine Cattery photo',
  })),
  phone: '021 463 616',
  email: 'enquiry@delorainecattery.com',
  address: '50 Konini Street, Abbey Caves, Whangarei',
  city: 'Whangarei',
  bookingUrl: 'https://us.revelationpets.com/bookerv2/zombsurql5',
  highlights: [
    {
      title: '5-Star Facility',
      description:
        'Purpose built cat boarding facility designed with cats in mind, offering comfortable accommodation and care.',
    },
    {
      title: 'Safe & Secure',
      description:
        'Double door systems, security screens, alarms, raised concrete floors, and fully insulated heated building.',
    },
    {
      title: 'On-Site Care',
      description:
        'Friendly animal loving people live on site and welcome both short and long term stays.',
    },
  ],
  rooms: [
    {
      name: 'Private Rooms',
      description:
        'Private rooms with indoor living area and 24-hour access to a fully secure private verandah.',
      price: '$20',
      priceUnit: 'per day',
      price_per_night: 20,
      capacity: 3,
      amenities: ['Secure verandah', 'Climbing frames', 'Daily room cleaning', 'Twice daily feeding'],
      image: deloraineAssets[1],
    },
    {
      name: 'Indoor Rooms',
      description:
        'Indoor only rooms suitable for up to two cats from the same family, with window views and optional communal room access.',
      price: '$20',
      priceUnit: 'per day',
      price_per_night: 20,
      capacity: 2,
      amenities: ['Window views', 'Secure environment', 'Daily cleaning'],
      image: deloraineAssets[3],
    },
    {
      name: 'Communal Room',
      description:
        'Large communal room for cats who enjoy shared indoor and outdoor areas together.',
      price: '$20',
      priceUnit: 'per day',
      price_per_night: 20,
      capacity: 6,
      amenities: ['Communal play area', 'Secure outdoor access', 'Daily care'],
      image: deloraineAssets[2],
    },
  ],
  services: [
    {
      title: 'Daily Brush Service',
      price: '$2 per day',
      description:
        'Professional daily brushing service, especially helpful for long-haired cats prone to matting.',
      image: deloraineAssets[4],
    },
    {
      title: 'Medicine Administration',
      price: '$2 per day',
      description:
        'Medication support for injections, oral medications, tablets, and topical treatments.',
      image: deloraineAssets[5],
    },
    {
      title: 'Pickup & Drop-off Service',
      price: '$35 one way / $50 round trip',
      description: 'Convenient transportation service within a 10km radius.',
      image: deloraineAssets[0],
    },
    {
      title: 'Airport Service',
      price: '$50 per trip',
      description: 'Pickup and drop-off service to Onerahi Airport.',
      image: deloraineAssets[2],
    },
  ],
  faqs: [
    {
      question: 'What vaccinations does my cat need?',
      answer:
        'All cats must have current vaccinations to stay. A current vaccination certificate is required at arrival.',
    },
    {
      question: 'What do you feed the cats and how often?',
      answer:
        'Cats are fed twice daily. Owners bring their cat food so each cat can keep their familiar diet.',
    },
    {
      question: 'What do I need to bring?',
      answer:
        'Bring your cat in a secure carrier, current vaccination certificate, food, medications, and any comfort items.',
    },
  ],
  extractedFrom: {
    html: true,
    scripts: 1,
    apiServices: true,
  },
};

export const defaultDelorainePreviewData = buildPreviewDataFromScrape(fallbackDeloraineScrape);

export function buildPreviewDataFromScrape(scrape: ImportedCatteryScrape): DelorainePreviewData {
  const settings = scrape.websiteSettings ?? {};
  const isDeloraineSource = isDeloraineScrape(scrape);
  const fallbackAssets = isDeloraineSource ? deloraineAssets : genericCatAssets;
  const images = uniqueImages([
    scrape.heroImage,
    ...(scrape.images ?? []),
    ...fallbackAssets,
  ]);
  const fallbackRooms = isDeloraineSource ? fallbackDeloraineScrape.rooms ?? [] : genericRooms(images);
  const fallbackServices = isDeloraineSource ? fallbackDeloraineScrape.services ?? [] : genericServices(images);
  const fallbackHighlights = isDeloraineSource ? fallbackDeloraineScrape.highlights ?? [] : genericHighlights();
  const rooms = scrape.rooms?.length ? scrape.rooms : fallbackRooms;
  const services = (scrape.services?.length ? scrape.services : fallbackServices)
    .filter((service) => !/professional grooming/i.test(service.title))
    .slice(0, 6);
  const highlights = scrape.highlights?.length ? scrape.highlights : fallbackHighlights;
  const galleryImages =
    scrape.galleryImages?.length
      ? scrape.galleryImages
      : images.map((url, index) => ({ url, caption: `${businessNameFromScrape(scrape)} photo ${index + 1}` }));
  const businessName =
    meaningfulHeading(stringValue(settings.businessName)) ||
    cleanBusinessName(scrape.title) ||
    meaningfulHeading(scrape.heading) ||
    businessNameFromScrape(scrape);
  const fallbackPhone = isDeloraineSource ? fallbackDeloraineScrape.phone || '' : '';
  const fallbackEmail = isDeloraineSource ? fallbackDeloraineScrape.email || '' : '';
  const fallbackAddress = isDeloraineSource ? fallbackDeloraineScrape.address || '' : '';
  const fallbackFaqs = isDeloraineSource ? fallbackDeloraineScrape.faqs : genericFaqs(businessName);

  return {
    businessName,
    location: stringValue(settings.location) || scrape.city || '',
    subdomain: slugify(businessName),
    primaryColor: stringValue(settings.primaryColor) || '#21483f',
    accentColor: stringValue(settings.accentColor) || '#b77a35',
    backgroundColor: stringValue(settings.backgroundColor) || '#f8f4ed',
    heroHeading: meaningfulHeading(stringValue(settings.heroHeading)) || businessName,
    heroSubheading:
      stringValue(settings.heroSubheading) ||
      firstSentence(scrape.description) ||
      'Your cats home away from home',
    aboutHeading: importedHeading(stringValue(settings.aboutHeading), businessName) || `About ${businessName}`,
    aboutText:
      stringValue(settings.aboutText) ||
      scrape.description ||
      'A purpose-built cat boarding facility focused on comfort, calm, and personal care.',
    phone: stringValue(settings.phone) || scrape.phone || fallbackPhone,
    email: stringValue(settings.email) || scrape.email || fallbackEmail,
    address: stringValue(settings.address) || scrape.address || fallbackAddress,
    pricePerNight: pricePerNight(rooms),
    pricePerCat: pricePerNight(rooms),
    selectedTemplate: 'boutique-luxury',
    heroImage: stringValue(settings.heroImage) || images[0],
    ctaText: 'Book a stay',
    headingFont: 'playfair',
    subheadingFont: 'inter',
    typography: 'playfair',
    whyChooseUsData: {
      whyChooseUsHeading: `Why choose ${businessName}`,
      whyChooseUsFeatures: highlights.slice(0, 3).map((highlight, index) => ({
        icon: ['Shield', 'Heart', 'Home'][index] ?? 'Star',
        title: highlight.title,
        description: highlight.description,
      })),
    },
    facilitiesData: {
      facilitiesHeading: 'Purpose-built cat accommodation',
      facilitiesText:
        highlights[0]?.description ||
        'Comfortable cat boarding facilities designed around safety, routine, and calm.',
      facilitiesImage: imageByName(images, /building|facility|indoor|communal/i) || images[0],
      facilityFeatures: highlights.map((highlight) => ({
        title: highlight.title,
        description: highlight.description,
      })),
    },
    suitesData: {
      suitesHeading: 'Boarding options',
      suites: rooms.map((room, index) => ({
        name: room.name,
        price: room.price && room.priceUnit ? `${room.price}/${room.priceUnit.replace(/^per\s+/i, '')}` : room.price,
        description: room.description,
        image: room.image || images[index + 1] || images[0],
        popular: index === 0,
        features: room.amenities ?? [],
      })),
    },
    servicesData: {
      servicesHeading: 'Care services',
      services: services.slice(0, 4).map((service, index) => ({
        icon: ['Heart', 'Clock', 'Shield', 'Home'][index] ?? 'Star',
        title: service.title,
        description: service.price ? `${service.description} ${service.price}.` : service.description,
        image: service.image || images[index + 2] || images[0],
      })),
    },
    galleryData: {
      galleryHeading: `Happy cats at ${businessName}`,
      galleryImages: galleryImages.slice(0, 9).map((image) => ({
        url: image.url,
        caption: image.caption || `${businessName} photo`,
      })),
    },
    testimonialsData: {
      testimonialsHeading: 'Trusted cat care',
      testimonials: [
        {
          name: 'Regular guest family',
          text: 'A calm, cat-focused stay with thoughtful daily care.',
          rating: 5,
          location: scrape.city || '',
        },
      ],
    },
    faqData: {
      faqs: scrape.faqs?.length ? scrape.faqs.slice(0, 5) : fallbackFaqs,
    },
    contactData: {
      contactHeading: 'Contact and booking',
    },
    sectionsOrder: ['hero', 'why-choose-us', 'about', 'suites', 'services', 'facilities', 'gallery', 'faq', 'contact'],
    roomTypes: rooms.map((room) => ({
      name: room.name,
      numberOfRooms: '1',
      maxCatsPerRoom: String(room.capacity || 1),
      sameFamilyOnly: true,
    })),
    pricingRates: rooms
      .filter((room) => room.price_per_night)
      .map((room) => ({
        numberOfCats: '1',
        price: String(room.price_per_night),
        discountType: 'none',
        discountValue: '',
      })),
    checkInTime: '09:00',
    checkOutTime: '17:00',
    minimumStay: '1',
    depositRequired: '50',
    depositType: 'fixed',
    cancellationPolicy: 'Credit can be held for future bookings according to the cattery policy.',
  };
}

export function buildFallbackScrapeForUrl(rawUrl: string): ImportedCatteryScrape {
  const sourceUrl = normaliseSourceUrl(rawUrl);
  const host = sourceUrl.hostname.replace(/^www\./, '');
  const businessName = businessNameFromHost(host);

  return {
    sourceUrl: sourceUrl.toString(),
    sourceHost: host,
    title: businessName,
    description: `${businessName} has been imported into CatStays as a starter preview. Add rooms, pricing, photos, and booking rules to finish setup.`,
    heading: businessName,
    heroImage: genericCatAssets[0],
    images: genericCatAssets,
    galleryImages: genericCatAssets.map((url, index) => ({
      url,
      caption: `${businessName} preview ${index + 1}`,
    })),
    highlights: genericHighlights(),
    rooms: genericRooms(genericCatAssets),
    services: genericServices(genericCatAssets),
    faqs: genericFaqs(businessName),
    extractedFrom: {
      html: false,
      scripts: 0,
      apiServices: false,
    },
  };
}

export function rememberCatteryPreview(scrape: ImportedCatteryScrape, previewData: DelorainePreviewData) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ scrape, previewData, savedAt: new Date().toISOString() });
    sessionStorage.setItem(PREVIEW_DATA_STORAGE_KEY, payload);
    localStorage.setItem(PREVIEW_DATA_STORAGE_KEY, payload);
    sessionStorage.setItem(IMPORT_URL_STORAGE_KEY, scrape.sourceUrl || DELORAINE_SOURCE_URL);
    localStorage.setItem(IMPORT_URL_STORAGE_KEY, scrape.sourceUrl || DELORAINE_SOURCE_URL);
  } catch {
    // Storage is optional; the preview can still render from state.
  }
}

export function sourceMatchesRequest(sourceUrl: string | undefined, requestedUrl: string): boolean {
  if (!sourceUrl) return false;
  try {
    return normaliseSourceUrl(sourceUrl).hostname.replace(/^www\./, '') === normaliseSourceUrl(requestedUrl).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function cleanBusinessName(title?: string): string {
  return (title || '').replace(/\s+[-–—|]\s+.*$/, '').trim();
}

function meaningfulHeading(heading?: string): string {
  const cleaned = (heading || '').trim();
  return /^(home|welcome|about|contact|services|gallery|book now)$/i.test(cleaned) ? '' : cleaned;
}

function importedHeading(heading: string, businessName: string): string {
  const cleaned = heading.trim();
  if (!cleaned) return '';
  if (/^(home|welcome)$/i.test(cleaned)) return '';
  return cleaned.replace(/\bHome\b/g, businessName);
}

function businessNameFromScrape(scrape: ImportedCatteryScrape): string {
  const titleName = cleanBusinessName(scrape.title);
  if (titleName) return titleName;
  const headingName = meaningfulHeading(scrape.heading);
  if (headingName) return headingName;
  const host = scrape.sourceHost || (scrape.sourceUrl ? normaliseSourceUrl(scrape.sourceUrl).hostname.replace(/^www\./, '') : '');
  return businessNameFromHost(host) || 'Your Cattery';
}

function businessNameFromHost(host: string): string {
  const firstPart = host.replace(/^www\./, '').split('.')[0] || '';
  if (!firstPart) return '';
  return firstPart
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isDeloraineScrape(scrape: ImportedCatteryScrape): boolean {
  const source = `${scrape.sourceHost || ''} ${scrape.sourceUrl || ''}`.toLowerCase();
  return source.includes('delorainecattery.com');
}

function normaliseSourceUrl(rawUrl: string): URL {
  return new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'your-cattery';
}

function firstSentence(text?: string): string {
  return (text || '').split(/(?<=[.!?])\s+/)[0] || '';
}

function pricePerNight(rooms: ImportedCatteryScrape['rooms']): string {
  const firstPriced = rooms?.find((room) => room.price);
  return firstPriced?.price || '$20';
}

function genericRooms(images: string[]): NonNullable<ImportedCatteryScrape['rooms']> {
  return [
    {
      name: 'Standard Suite',
      description: 'A calm private boarding space with daily care, feeding, and comfort checks.',
      price: '$35',
      priceUnit: 'per night',
      price_per_night: 35,
      capacity: 1,
      amenities: ['Daily care', 'Comfort checks', 'Clean bedding'],
      image: images[2] || genericCatAssets[2],
    },
    {
      name: 'Premium Suite',
      description: 'A larger suite for cats who enjoy extra space and a little more attention during their stay.',
      price: '$55',
      priceUnit: 'per night',
      price_per_night: 55,
      capacity: 2,
      amenities: ['Extra space', 'Photo updates', 'Enrichment time'],
      image: images[3] || genericCatAssets[3],
    },
  ];
}

function genericServices(images: string[]): NonNullable<ImportedCatteryScrape['services']> {
  return [
    {
      title: 'Daily Photo Updates',
      description: 'Send owners reassuring updates from their cat during the stay.',
      image: images[3] || genericCatAssets[3],
    },
    {
      title: 'Medication Support',
      description: 'Record medication instructions and make care notes easy for staff to follow.',
      image: images[4] || genericCatAssets[4],
    },
  ];
}

function genericHighlights(): NonNullable<ImportedCatteryScrape['highlights']> {
  return [
    {
      title: 'Calm Cat Care',
      description: 'A cattery preview focused on safe stays, clear routines, and owner confidence.',
    },
    {
      title: 'Online Booking Ready',
      description: 'Turn the imported website into a booking-ready CatStays setup.',
    },
    {
      title: 'Owner Updates',
      description: 'Keep clients close with profile management, booking history, and photo updates.',
    },
  ];
}

function genericFaqs(businessName: string): NonNullable<ImportedCatteryScrape['faqs']> {
  return [
    {
      question: `How do I book with ${businessName}?`,
      answer: 'Use the booking enquiry flow to request dates, add your cat details, and confirm care needs.',
    },
    {
      question: 'Can I add my cat details online?',
      answer: 'Yes. Clients can manage pet profiles, care notes, and booking details from the portal.',
    },
    {
      question: 'Can owners receive updates?',
      answer: 'Yes. CatStays supports photo updates and messages during a stay.',
    },
  ];
}

function imageByName(images: string[], pattern: RegExp): string {
  return images.find((image) => pattern.test(decodeURIComponent(image))) || '';
}

function uniqueImages(images: Array<string | undefined>): string[] {
  const seen = new Set<string>();
  return images
    .filter((image): image is string => Boolean(image && /^https?:\/\//i.test(image)))
    .filter((image) => {
      const key = image.split('?')[0].toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
