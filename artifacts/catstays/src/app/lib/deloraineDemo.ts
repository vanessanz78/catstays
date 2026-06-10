export const DELORAINE_SOURCE_URL = 'https://www.delorainecattery.com/';

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
  const images = uniqueImages([
    scrape.heroImage,
    ...(scrape.images ?? []),
    ...deloraineAssets,
  ]);
  const rooms = scrape.rooms?.length ? scrape.rooms : fallbackDeloraineScrape.rooms ?? [];
  const services = (scrape.services?.length ? scrape.services : fallbackDeloraineScrape.services ?? [])
    .filter((service) => !/professional grooming/i.test(service.title))
    .slice(0, 6);
  const highlights = scrape.highlights?.length ? scrape.highlights : fallbackDeloraineScrape.highlights ?? [];
  const galleryImages =
    scrape.galleryImages?.length
      ? scrape.galleryImages
      : images.map((url, index) => ({ url, caption: `Deloraine Cattery photo ${index + 1}` }));
  const businessName =
    stringValue(settings.businessName) ||
    scrape.heading ||
    cleanBusinessName(scrape.title) ||
    'Deloraine Cattery';

  return {
    businessName,
    location: stringValue(settings.location) || scrape.city || 'Whangarei',
    subdomain: 'delorainecattery',
    primaryColor: stringValue(settings.primaryColor) || '#21483f',
    accentColor: stringValue(settings.accentColor) || '#b77a35',
    backgroundColor: stringValue(settings.backgroundColor) || '#f8f4ed',
    heroHeading: stringValue(settings.heroHeading) || businessName,
    heroSubheading:
      stringValue(settings.heroSubheading) ||
      firstSentence(scrape.description) ||
      'Your cats home away from home',
    aboutHeading: stringValue(settings.aboutHeading) || `About ${businessName}`,
    aboutText:
      stringValue(settings.aboutText) ||
      scrape.description ||
      'A purpose-built cat boarding facility focused on comfort, calm, and personal care.',
    phone: stringValue(settings.phone) || scrape.phone || fallbackDeloraineScrape.phone || '',
    email: stringValue(settings.email) || scrape.email || fallbackDeloraineScrape.email || '',
    address: stringValue(settings.address) || scrape.address || fallbackDeloraineScrape.address || '',
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
        caption: image.caption || 'Deloraine Cattery photo',
      })),
    },
    testimonialsData: {
      testimonialsHeading: 'Trusted cat care',
      testimonials: [
        {
          name: 'Regular guest family',
          text: 'A calm, cat-focused stay with thoughtful daily care.',
          rating: 5,
          location: 'Whangarei',
        },
      ],
    },
    faqData: {
      faqs: scrape.faqs?.length ? scrape.faqs.slice(0, 5) : fallbackDeloraineScrape.faqs,
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

export function rememberCatteryPreview(scrape: ImportedCatteryScrape, previewData: DelorainePreviewData) {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({ scrape, previewData, savedAt: new Date().toISOString() });
    sessionStorage.setItem('catstays_preview_data', payload);
    localStorage.setItem('catstays_preview_data', payload);
    sessionStorage.setItem('catstays_import_url', scrape.sourceUrl || DELORAINE_SOURCE_URL);
    localStorage.setItem('catstays_import_url', scrape.sourceUrl || DELORAINE_SOURCE_URL);
  } catch {
    // Storage is optional; the preview can still render from state.
  }
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function cleanBusinessName(title?: string): string {
  return (title || '').replace(/\s+-\s+.*$/, '').trim();
}

function firstSentence(text?: string): string {
  return (text || '').split(/(?<=[.!?])\s+/)[0] || '';
}

function pricePerNight(rooms: ImportedCatteryScrape['rooms']): string {
  const firstPriced = rooms?.find((room) => room.price);
  return firstPriced?.price || '$20';
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
