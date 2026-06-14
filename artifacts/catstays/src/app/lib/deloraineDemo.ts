export const DELORAINE_SOURCE_URL = 'https://www.delorainecattery.com/';
export const PREVIEW_URL_STORAGE_KEY = 'catstays_preview_url';
export const PREVIEW_SOURCE_INTENT_STORAGE_KEY = 'catstays_preview_source_intent';
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

const deloraineVirtualTourEmbedUrl =
  'https://www.google.com/maps/embed?pb=!4v1585042151806!6m8!1m7!1sCAoSLEFGMVFpcE4yclY4ZXBnVTVJTlc4VkVoTEN2dmx5Wk45b201czhtZ3ZUbFpr!2m2!1d-35.72669200000001!2d174.355986!3f20.68!4f-14.75!5f0.4000000000000002';

const genericCatAssets = [
  'https://images.unsplash.com/photo-1770255860384-3359fd44b467?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  'https://images.unsplash.com/photo-1636340629239-008219592d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  'https://images.unsplash.com/photo-1672764788664-9f5844477a0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1574114908319-2efa632834d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  'https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
];

export type CatterySiteContentCategory =
  | 'hero'
  | 'navigation'
  | 'why-choose-us'
  | 'facilities'
  | 'daily-care'
  | 'rooms'
  | 'pricing'
  | 'services'
  | 'gallery'
  | 'reviews'
  | 'faqs'
  | 'owner-story'
  | 'commitment'
  | 'location'
  | 'contact'
  | 'social'
  | 'booking'
  | 'footer';

export interface CatterySiteContentItem {
  title: string;
  text?: string;
  price?: string;
  meta?: string;
  image?: string;
  url?: string;
  answer?: string;
  rating?: number;
  date?: string;
  features?: string[];
  details?: string[];
}

export interface CatterySiteContentBlock {
  id: string;
  category: CatterySiteContentCategory;
  title: string;
  text?: string;
  source?: 'scrape' | 'fallback' | 'generated';
  items?: CatterySiteContentItem[];
  images?: Array<{ url: string; caption?: string }>;
  links?: Array<{ label: string; url: string }>;
}

export interface CatterySiteContentLibrary {
  schemaVersion: 1;
  sourceUrl?: string;
  sourceHost?: string;
  businessName?: string;
  capturedAt?: string;
  blocks: CatterySiteContentBlock[];
}

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
  hours?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
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
  reviews?: Array<{ name: string; text: string; rating?: number; location?: string }>;
  owner?: {
    title?: string;
    text?: string;
    image?: string;
  };
  commitment?: {
    title?: string;
    text?: string;
    items?: Array<{ title: string; description: string }>;
  };
  locationDetails?: {
    heading?: string;
    text?: string;
    directions?: string;
    virtualTourUrl?: string;
  };
  virtualTourUrl?: string;
  siteContentLibrary?: CatterySiteContentLibrary;
  websiteSettings?: Record<string, any>;
  bodyText?: string;
  extractedFrom?: {
    html?: boolean;
    scripts?: number;
    apiServices?: boolean;
  };
}

export interface DelorainePreviewData {
  businessName: string;
  sourceUrl?: string;
  sourceHost?: string;
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
  ownerData?: any;
  locationData?: any;
  hours?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
  virtualTourUrl?: string;
  siteContentLibrary?: CatterySiteContentLibrary;
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
  hours: 'By appointment only. Mon-Sat: 9:00am - 10:30am. Mon-Sun: 4:30pm - 6:00pm. Closed Sunday mornings.',
  socialLinks: {
    facebook: 'https://www.facebook.com/delorainecattery',
    instagram: 'https://www.instagram.com/delorainecattery/',
  },
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
    {
      title: 'Daily Care Routine',
      description:
        'Cats are cared for with routine feeding, cleaning, attention, enrichment, and medication support where needed.',
    },
    {
      title: 'Premium Room Accommodation',
      description:
        'Private, indoor, and communal room options are available for different cats and family groups.',
    },
  ],
  rooms: [
    {
      name: 'Private Rooms',
      description:
        'Private rooms with indoor living area and 24-hour access to a fully secure private verandah.',
      price: '$20 (1 cat), $36 (2 cats), $54 (3 cats)',
      priceUnit: 'per day',
      price_per_night: 20,
      capacity: 3,
      amenities: ['Indoor living area', '24-hour secure verandah', 'Climbing frames and chairs', 'Bird watching opportunities', 'Daily room cleaning', 'Twice daily feeding'],
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
      amenities: ['Indoor accommodation', 'Window views', 'Secure environment', 'Optional communal room access', 'Daily cleaning', 'Medicine administration available'],
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
      amenities: ['Shared indoor and outdoor areas', 'Social interaction with other cats', 'Secure observation period', 'Neutral territory environment', 'Move to private room if needed'],
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
      title: 'Electric Blanket Setup',
      price: '$10 surcharge',
      description:
        'Special comfort for mature cats with electrical appliances. Equipment must be tested and tagged for safety.',
      image: deloraineAssets[6],
    },
    {
      title: 'Pickup & Drop-off Service',
      price: '$35 one way / $50 round trip',
      description: 'Convenient transportation service within a 10km radius, with free service available for senior citizens over 65 without transport.',
      image: deloraineAssets[0],
    },
    {
      title: 'Airport Service',
      price: '$50 per trip',
      description: 'Pickup and drop-off service to Onerahi Airport.',
      image: deloraineAssets[2],
    },
    {
      title: 'Flea & Worm Treatment',
      price: '$100 per treatment',
      description:
        'Treatment can be applied if flea or worm discomfort is detected during a cat\'s stay.',
      image: deloraineAssets[4],
    },
    {
      title: 'Out of Hours Service',
      price: '$35 additional fee',
      description:
        'Flexible pickup and drop-off outside regular opening hours when mutually agreed upon.',
      image: deloraineAssets[0],
    },
    {
      title: 'Veterinary Transport',
      price: '$35 surcharge',
      description:
        'Professional transport to and from your veterinary clinic if medical attention is required during the stay.',
      image: deloraineAssets[2],
    },
    {
      title: 'Professional Grooming',
      price: 'Contact for pricing',
      description:
        'Specialist medical-grade matting removal through Fancy Felines Cat Grooming without sedation.',
      image: deloraineAssets[3],
    },
  ],
  faqs: [
    {
      question: 'Is there a discount for long term boarding?',
      answer:
        'Long term stays can be discussed when booking so Deloraine Cattery can confirm availability, care needs, and any applicable pricing.',
    },
    {
      question: 'Do you still offer an NDHB discount?',
      answer:
        'Discount eligibility can be discussed directly with Deloraine Cattery when making a booking enquiry.',
    },
    {
      question: 'Do you offer discounts if I have more than one cat?',
      answer:
        'Yes. Multi-cat pricing is available for cats from the same family, including two-cat and three-cat room rates where applicable.',
    },
    {
      question: 'Do you offer a delivery service?',
      answer:
        'Pickup and drop-off services are available within a 10km radius, with airport and veterinary transport options by arrangement.',
    },
    {
      question: 'Can I visit my cat while they are in the cattery?',
      answer:
        'Visits can be arranged by appointment so the team can keep routines calm and secure for all cats.',
    },
    {
      question: 'Our cats have never stayed in a cattery, will they be alright?',
      answer:
        'Cats are settled carefully with secure spaces, familiar food, daily routines, and observation so staff can adjust care if needed.',
    },
    {
      question: 'My cat is on a special diet or medication, is this a problem?',
      answer:
        'Special diets and medication instructions can be followed. Owners should bring food, medication, and clear written instructions.',
    },
    {
      question: 'What vaccinations does my cat need?',
      answer:
        'All cats must be vaccinated for cat flu every year and their vaccination booklet must be provided on arrival unless previously noted. Cats sharing the communal room also need the annual combined vaccination.',
    },
    {
      question: 'What do you feed the cats and how often?',
      answer:
        'Cats are fed twice daily. Owners bring their cat food so each cat can keep their familiar diet.',
    },
    {
      question: 'What happens if my cat needs flea or worm treatment?',
      answer:
        'Regular flea and worm treatments are recommended. If a cat appears uncomfortable, treatment may be applied and the treatment cost passed on.',
    },
    {
      question: 'Can I drop off or collect outside regular hours?',
      answer:
        'Out of hours pickup or drop off may be arranged by agreement and attracts an additional fee.',
    },
    {
      question: 'What do I need to bring?',
      answer:
        'Bring your cat in a secure carrier, current vaccination certificate, food, medications, and any comfort items.',
    },
    {
      question: 'What are your Peak Periods?',
      answer:
        'Peak periods usually include school holidays, public holidays, and Christmas. Early booking is recommended.',
    },
  ],
  reviews: [
    {
      name: 'Guest family',
      text:
        'I had a great experience. :) Our cat has never stayed away before and was content and relaxed after his return from Deloraine. Drop off was easy and pick up was even easier. The online portal is awesome.',
      rating: 5,
      location: '04 May 2026',
    },
    {
      name: 'Guest family',
      text:
        'Our two oriental kittens stayed for two weeks - both seemed quite happy when we picked them up and dropped them off. Even learnt to use the cat door!! Pick up and drop off was seamless. We will definitely be using Deloraine again. Thanks so much.',
      rating: 5,
      location: '30 Apr 2026',
    },
    {
      name: 'Guest family',
      text: 'Lovely place, our cat is very happy here. Would recommend.',
      rating: 5,
      location: '14 Apr 2026',
    },
  ],
  owner: {
    title: 'Your Caring Hosts - Paul & Vanessa',
    text:
      'Paul and Vanessa Wilson love animals, so taking on Deloraine Cattery feels like second nature. Paul grew up on a farm and Vanessa has always had cats and dogs as part of the family. They live on site and care for cats as part of their family property.',
    image: deloraineAssets[7],
  },
  commitment: {
    title: 'Our commitment to safe, settled stays',
    text:
      'Deloraine Cattery focuses on secure rooms, daily routines, careful medication support, vaccination standards, and calm care for every guest.',
    items: [
      {
        title: 'Vaccination standards',
        description: 'Current cat flu vaccination is required, with additional vaccination requirements for communal room stays.',
      },
      {
        title: 'Secure facilities',
        description: 'Double-door systems, security screens, alarms, raised concrete floors, and insulated heated buildings support a safer stay.',
      },
      {
        title: 'Care notes followed',
        description: 'Food, medication, routines, and comfort items can be managed so each cat keeps a familiar rhythm.',
      },
    ],
  },
  locationDetails: {
    heading: 'Find Deloraine Cattery',
    text: 'Deloraine Cattery is located at 50 Konini Street, Abbey Caves, Whangarei.',
    directions: 'The cattery is around five minutes from Onerahi Airport.',
    virtualTourUrl: deloraineVirtualTourEmbedUrl,
  },
  virtualTourUrl: deloraineVirtualTourEmbedUrl,
  siteContentLibrary: {
    schemaVersion: 1,
    sourceUrl: DELORAINE_SOURCE_URL,
    sourceHost: 'delorainecattery.com',
    businessName: 'Deloraine Cattery',
    capturedAt: '2026-06-12',
    blocks: [
      {
        id: 'hero',
        category: 'hero',
        title: 'Deloraine Cattery',
        text: 'Your cats home away from home. Professional cat boarding facility providing exceptional care for your feline friends.',
        source: 'scrape',
        images: [{ url: deloraineAssets[0], caption: 'Deloraine Cattery building at dusk' }],
        links: [
          { label: 'View Our Services', url: '#services' },
          { label: 'Book Now', url: '#booking' },
        ],
      },
      {
        id: 'why-choose-deloraine',
        category: 'why-choose-us',
        title: 'Choose Deloraine Cattery',
        text:
          'Deloraine Cattery is a purpose built cat boarding facility designed with cats in mind. Care and thought went into the planning and construction, from security features to comfort amenities, ensuring cats are safe and secure in a peaceful rural setting.',
        source: 'scrape',
        items: [
          {
            title: '5-Star Facility',
            text: 'Purpose built cat boarding facility designed with cats in mind, offering fine accommodation and care at affordable prices.',
          },
          {
            title: 'Safe & Secure',
            text: 'Double door systems, amplimesh security screens, alarms, raised concrete floors, and a fully insulated heated building.',
          },
          {
            title: 'On-Site Care',
            text: 'Friendly animal loving people live on site, welcoming both short and long term stays in a peaceful rural setting.',
          },
        ],
      },
      {
        id: 'facilities',
        category: 'facilities',
        title: 'Our Facilities',
        text:
          "State-of-the-art boarding facilities designed with your cat's comfort, safety, and well-being in mind. Every detail has been carefully planned to create a stress-free environment.",
        source: 'scrape',
        images: [{ url: deloraineAssets[4], caption: 'Cats relaxing in Deloraine Cattery accommodation' }],
        items: [
          {
            title: 'Premium Accommodations',
            text: 'Private, indoor, and communal spaces designed for comfort, hygiene, and calm daily routines.',
          },
          {
            title: 'Security Features',
            text: 'Double door systems on all exits and entry points, amplimesh security screens on all doors, windows, and outdoor areas.',
          },
          {
            title: 'Climate Controlled',
            text: 'Fully insulated building heated during winter months for comfort, with raised concrete floors for hygiene.',
          },
          {
            title: 'Alarm Systems',
            text: "Comprehensive alarms in and around the facility to ensure each cat's safety and security at all times.",
          },
        ],
      },
      {
        id: 'daily-care-routine',
        category: 'daily-care',
        title: 'Daily Care Routine',
        text: 'Deloraine Cattery follows a daily routine so each cat has clean rooms, familiar food, and careful supervision.',
        source: 'scrape',
        items: [
          { title: 'Room cleaning', text: 'Rooms are cleaned each morning, with surfaces wiped and all areas swept and mopped.' },
          { title: 'Food and litter', text: 'Litter trays and food dishes are changed daily.' },
          { title: 'Secure social walks', text: 'Secure hallway walks support gentle social interaction.' },
          { title: 'Twice daily feeding', text: 'Cats are fed twice daily using food supplied by their owner.' },
          { title: 'Medication support', text: 'Medicine administration is available at an additional charge.' },
        ],
      },
      {
        id: 'rooms-and-pricing',
        category: 'rooms',
        title: 'Our Rooms',
        text: 'Choose from a range of boarding options designed to provide comfort, safety, and care for your feline friend.',
        source: 'scrape',
        items: [
          {
            title: 'Private Rooms',
            text:
              'Private rooms with indoor living area and 24-hour access to a fully secure private verandah, suitable for up to three cats from the same family.',
            price: '$20.00 (1 cat), $36 (2 cats), $54 (3 cats) per day. GST additional if applicable.',
            image: deloraineAssets[1],
            features: [
              'Indoor living area',
              '24-hour access to secure verandah',
              'Climbing frames and chairs',
              'Bird watching opportunities',
              'Daily room cleaning',
              'Twice daily feeding',
            ],
          },
          {
            title: 'Indoor Rooms',
            text:
              'Indoor only rooms suitable for up to two cats from the same family, with window views and option for communal room access.',
            price: '$20.00 (1 cat), $36 (2 cats) per day. GST additional if applicable.',
            image: deloraineAssets[3],
            features: [
              'Indoor accommodation',
              'Window views',
              'Secure environment',
              'Optional communal room access',
              'Daily cleaning',
              'Medicine administration available',
            ],
          },
          {
            title: 'Communal Room',
            text:
              'Large communal room for multiple cats to share indoor and outdoor areas together on neutral territory.',
            price: '$20.00 (1 cat), $36 (2 cats) per day. GST additional if applicable.',
            image: deloraineAssets[2],
            features: [
              'Shared indoor and outdoor areas',
              'Social interaction with other cats',
              'Secure observation period',
              'Neutral territory environment',
              'Move to private room if needed',
            ],
          },
        ],
      },
      {
        id: 'additional-services',
        category: 'services',
        title: 'Additional Services',
        text: 'Additional services help each cat receive specialized care during their stay.',
        source: 'scrape',
        items: [
          {
            title: 'Daily Brush Service',
            text:
              'Professional daily brushing service, especially recommended for long-haired cats prone to matting. Done in the evenings when cats are more relaxed.',
            price: '$2 per day',
            features: ['Professional grooming', 'Prevents matting', 'Evening service', 'Reduces stress'],
          },
          {
            title: 'Medicine Administration',
            text:
              'Medication administration by Vanessa, who trained as a pharmacy technician. Support includes injections, oral medications, tablets, and topical treatments.',
            price: '$2 per day',
            features: ['Insulin injections', 'Oral medications', 'Topical treatments', 'Professional care'],
          },
          {
            title: 'Electric Blanket Setup',
            text: 'Special comfort for mature cats with electrical appliances. Equipment must be tested and tagged for safety.',
            price: '$10 surcharge',
            features: ['Comfort for senior cats', 'Safety tested equipment', 'Temperature control', 'Extra warmth'],
          },
          {
            title: 'Pickup & Drop-off Service',
            text:
              'Transportation service within a 10km radius. Free service is available for senior citizens over 65 without transport.',
            price: '$35 one way / $50 round trip',
            features: ['10km radius coverage', 'Your cage or ours', 'Senior citizen discount', 'Convenient scheduling'],
          },
          {
            title: 'Airport Service',
            text: 'Specialized pickup and drop-off service to Onerahi Airport for owners relocating or travelling.',
            price: '$50 per trip',
            features: ['Onerahi Airport service', 'Flight schedule coordination', 'Advance booking required', 'Travel convenience'],
          },
          {
            title: 'Flea & Worm Treatment',
            text: "Professional treatment for flea or worm issues if detected during your cat's stay. Applied only when necessary for comfort.",
            price: '$100 per treatment',
            features: ['Professional treatment', 'Health monitoring', 'Comfort focused', 'Veterinary grade products'],
          },
          {
            title: 'Out of Hours Service',
            text: 'Flexible pickup and drop-off outside regular opening hours when mutually agreed upon.',
            price: '$35 surcharge',
            features: ['Flexible timing', 'By appointment', 'Convenience fee', 'Mutual agreement required'],
          },
          {
            title: 'Veterinary Transport',
            text: 'Professional transport to and from your veterinary clinic if medical attention is required during the stay.',
            price: '$35 surcharge',
            features: ['Emergency transport', 'Professional care', 'Clinic coordination', 'Health priority'],
          },
          {
            title: 'Professional Grooming',
            text:
              'Partnership with Fancy Felines Cat Grooming for specialized medical-grade matting removal without sedation.',
            price: 'Contact for pricing',
            features: ['Medical grade grooming', 'No sedation required', 'Specialist partnership', 'Professional care'],
          },
        ],
      },
      {
        id: 'gallery',
        category: 'gallery',
        title: 'Happy Cats at Deloraine',
        text: 'A gallery of the facilities and cats who love staying at Deloraine Cattery.',
        source: 'scrape',
        images: [
          { url: deloraineAssets[4], caption: 'Happy kittens at Deloraine' },
          { url: deloraineAssets[5], caption: 'Wally relaxing' },
          { url: deloraineAssets[6], caption: 'Lola at playtime' },
          { url: deloraineAssets[2], caption: 'Communal room with outdoor views' },
          { url: deloraineAssets[1], caption: 'Private boarding room' },
          { url: deloraineAssets[3], caption: 'Indoor room accommodation' },
        ],
      },
      {
        id: 'reviews',
        category: 'reviews',
        title: 'What Our Clients Say',
        text: 'Families share feedback about their cats staying at Deloraine Cattery.',
        source: 'scrape',
        items: [
          {
            title: 'Guest review',
            text:
              'I had a great experience. :) Our cat has never stayed away before and was content and relaxed after his return from Deloraine. Drop off was easy and pick up was even easier. The online portal is awesome.',
            rating: 5,
            date: '04 May 2026',
          },
          {
            title: 'Guest review',
            text:
              'Our two oriental kittens stayed for two weeks - both seemed quite happy when we picked them up and dropped them off. Even learnt to use the cat door!! Pick up and drop off was seamless. We will definitely be using Deloraine again. Thanks so much.',
            rating: 5,
            date: '30 Apr 2026',
          },
          {
            title: 'Guest review',
            text: 'Lovely place, our cat is very happy here. Would recommend.',
            rating: 5,
            date: '14 Apr 2026',
          },
        ],
      },
      {
        id: 'faqs',
        category: 'faqs',
        title: 'Frequently Asked Questions',
        text: "Common questions about Deloraine Cattery's cat boarding services, policies, and what to expect.",
        source: 'scrape',
        items: [
          {
            title: 'Is there a discount for long term boarding?',
            answer: 'Long term stays can be discussed when booking so the cattery can confirm availability, care needs, and any applicable pricing.',
          },
          {
            title: 'Do you still offer an NDHB discount?',
            answer: 'Discount eligibility can be discussed directly with Deloraine Cattery when making a booking enquiry.',
          },
          {
            title: 'Do you offer discounts if I have more than one cat?',
            answer: 'Yes. Multi-cat pricing is available for cats from the same family, including two-cat and three-cat room rates where applicable.',
          },
          {
            title: 'Do you offer a delivery service?',
            answer: 'Pickup and drop-off services are available within a 10km radius, with airport and veterinary transport options by arrangement.',
          },
          {
            title: 'Can I visit my cat while they are in the cattery?',
            answer: 'Visits can be arranged by appointment so the team can keep routines calm and secure for all cats.',
          },
          {
            title: 'Our cats have never stayed in a cattery, will they be alright?',
            answer: 'Cats are settled carefully with secure spaces, familiar food, daily routines, and observation so staff can adjust care if needed.',
          },
          {
            title: 'My cat is on a special diet or medication, is this a problem?',
            answer: 'Special diets and medication instructions can be followed. Owners should bring food, medication, and clear written instructions.',
          },
          {
            title: 'What vaccinations does my cat need?',
            answer: 'Cats must be current with cat flu vaccination, and the vaccination booklet should be supplied on arrival unless already provided.',
          },
          {
            title: 'What happens if my cat gets sick?',
            answer: 'The team will contact the owner and arrange veterinary support or transport if medical attention is required during the stay.',
          },
          {
            title: 'What do you feed the cats and how often?',
            answer: 'Cats are fed twice daily using food supplied by their owner to keep their diet familiar.',
          },
          {
            title: "What do I need to bring for my cat's stay?",
            answer: 'Bring a secure carrier, vaccination booklet, food, medication, and any comfort items that help your cat settle.',
          },
          {
            title: 'What are your Peak Periods?',
            answer: 'Peak periods usually include school holidays, public holidays, and Christmas. Early booking is recommended.',
          },
        ],
      },
      {
        id: 'owner-story',
        category: 'owner-story',
        title: 'About Paul and Vanessa Wilson',
        text:
          'Paul and Vanessa Wilson love animals, so taking on Deloraine Cattery feels like second nature. Paul grew up on a farm and Vanessa has always had cats and dogs as part of the family. They have three daughters, Isabella, Mia, and Kaia, and one son Harlo, who share their love of animals. Their tabby cat Blaise and Raffy the Maltese are part of the family too. Paul and Vanessa derive their income from Deloraine Cattery and Deloraine Cottage, and caring for animals is part of their family life.',
        source: 'scrape',
        images: [{ url: deloraineAssets[7], caption: 'Paul and Vanessa Wilson' }],
      },
      {
        id: 'commitment',
        category: 'commitment',
        title: 'Our Commitment',
        text: 'Every cat receives individual attention, safe routines, and family care throughout their stay.',
        source: 'scrape',
        items: [
          {
            title: 'Compassionate Care',
            text: 'Every cat receives individual attention and love from a family who understand feline needs.',
          },
          {
            title: 'Safety & Security',
            text: 'High standards of safety, cleanliness, and security support complete peace of mind.',
          },
          {
            title: 'Family Commitment',
            text: 'Every cat is treated like family, with updates to keep owners connected during their stay.',
          },
        ],
      },
      {
        id: 'location',
        category: 'location',
        title: 'Our Location',
        text: '50 Konini Street, Abbey Caves, Whangarei. Deloraine Cattery sits on 2.5 acres of peaceful park-like grounds, five minutes from Onerahi Airport and five minutes from Whangarei CBD.',
        source: 'scrape',
        items: [
          { title: 'From Whangarei City', text: 'Head along Riverside Drive towards Onerahi.' },
          { title: 'Second left', text: 'Take the second street on the left past the BP Petrol Station.' },
          { title: 'Big Fish bus stop', text: 'Turn left onto Mackesy Road at the Big Fish bus stop.' },
          { title: 'Konini Street', text: 'Keep going on Mackesy Road until it becomes Konini Street.' },
          { title: 'Arrival', text: 'Deloraine Cattery is number 50 Konini Street, approximately 1.3km from Riverside Drive.' },
        ],
        links: [{ label: 'Virtual Tour', url: deloraineVirtualTourEmbedUrl }],
      },
      {
        id: 'contact',
        category: 'contact',
        title: 'Contact Us',
        text: 'Get in touch for bookings, enquiries, or to schedule a facility tour.',
        source: 'scrape',
        items: [
          { title: 'Location', text: '50 Konini St, Abbey Caves, Whangarei. 2.5 acres of peaceful park-like grounds.' },
          { title: 'Phone/Text', text: '021 463 616' },
          { title: 'Email', text: 'enquiry@delorainecattery.com' },
          { title: 'Open Hours', text: 'By appointment only. Mon-Sat: 9:00am - 10:30am. Mon-Sun: 4:30pm - 6:00pm. Closed Sunday mornings.' },
        ],
        links: [
          { label: 'Facebook', url: 'https://www.facebook.com/delorainecattery' },
          { label: 'Instagram', url: 'https://www.instagram.com/delorainecattery/' },
          { label: 'Book online', url: 'https://us.revelationpets.com/bookerv2/zombsurql5' },
        ],
      },
      {
        id: 'booking',
        category: 'booking',
        title: 'Ready to Book?',
        text: "Contact Deloraine Cattery to reserve your cat's stay or schedule a facility tour.",
        source: 'scrape',
        links: [{ label: "Book Your Cat's Stay Now", url: 'https://us.revelationpets.com/bookerv2/zombsurql5' }],
      },
      {
        id: 'footer',
        category: 'footer',
        title: 'Deloraine Cattery',
        text:
          'Providing exceptional boarding and care services for cats with over 20 years of experience in feline hospitality and comfort.',
        source: 'scrape',
      },
    ],
  },
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
  const services = (scrape.services?.length ? scrape.services : fallbackServices).slice(0, 12);
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
  const reviews = scrape.reviews?.length
    ? scrape.reviews
    : (settings.testimonialsData?.testimonials ?? (isDeloraineSource ? fallbackDeloraineScrape.reviews ?? [] : []));
  const hours = stringValue(settings.hours) || scrape.hours || (isDeloraineSource ? fallbackDeloraineScrape.hours || '' : '');
  const owner = scrape.owner || settings.ownerData || (isDeloraineSource ? fallbackDeloraineScrape.owner : undefined);
  const commitment = scrape.commitment || settings.commitmentData || (isDeloraineSource ? fallbackDeloraineScrape.commitment : undefined);
  const locationDetails = scrape.locationDetails || settings.locationData || (isDeloraineSource ? fallbackDeloraineScrape.locationDetails : undefined);
  const socialLinks = scrape.socialLinks || settings.socialLinks || (isDeloraineSource ? fallbackDeloraineScrape.socialLinks : undefined);
  const virtualTourUrl =
    embeddableVirtualTourUrl(
      stringValue(settings.virtualTourUrl) ||
        scrape.virtualTourUrl ||
        locationDetails?.virtualTourUrl ||
        '',
      scrape.sourceHost,
    ) ||
    (isDeloraineSource ? fallbackDeloraineScrape.virtualTourUrl || '' : '');
  const siteContentLibrary =
    scrape.siteContentLibrary ||
    siteContentLibraryFromSettings(settings.siteContentLibrary) ||
    buildSiteContentLibrary({
      scrape,
      businessName,
      rooms,
      services,
      highlights,
      galleryImages,
      reviews,
      faqs: scrape.faqs?.length ? scrape.faqs : fallbackFaqs,
      hours,
      owner,
      commitment,
      locationDetails,
      socialLinks,
      virtualTourUrl,
    });

  return {
    businessName,
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    location: stringValue(settings.location) || scrape.city || '',
    subdomain: slugify(businessName),
    primaryColor: stringValue(settings.primaryColor) || '#0A1128',
    accentColor: stringValue(settings.accentColor) || '#C46A3A',
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
    selectedTemplate: scrape.sourceUrl ? 'original' : 'conversion-focus',
    heroImage: stringValue(settings.heroImage) || images[0],
    ctaText: 'Book a stay',
    headingFont: 'playfair',
    subheadingFont: 'inter',
    typography: 'playfair',
    whyChooseUsData: {
      whyChooseUsHeading: `Why choose ${businessName}`,
      whyChooseUsFeatures: highlights.map((highlight, index) => ({
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
      services: services.map((service, index) => ({
        icon: ['Heart', 'Clock', 'Shield', 'Home'][index] ?? 'Star',
        title: service.title,
        description: service.price ? `${service.description} ${service.price}.` : service.description,
        image: service.image || images[index + 2] || images[0],
      })),
    },
    galleryData: {
      galleryHeading: `Happy cats at ${businessName}`,
      galleryImages: galleryImages.slice(0, 24).map((image) => ({
        url: image.url,
        caption: image.caption || `${businessName} photo`,
      })),
    },
    testimonialsData: {
      testimonialsHeading: 'Trusted cat care',
      testimonials: reviews.length
        ? reviews
        : [
            {
              name: 'Regular guest family',
              text: 'A calm, cat-focused stay with thoughtful daily care.',
              rating: 5,
              location: scrape.city || '',
            },
          ],
    },
    faqData: {
      faqs: scrape.faqs?.length ? scrape.faqs.slice(0, 20) : fallbackFaqs,
    },
    contactData: {
      contactHeading: 'Contact and booking',
      hours,
      socialLinks,
      virtualTourUrl,
      locationDetails,
    },
    commitmentData: commitment,
    ownerData: owner,
    locationData: locationDetails,
    hours,
    socialLinks,
    virtualTourUrl,
    siteContentLibrary,
    sectionsOrder: ['hero', 'about', 'why-choose-us', 'facilities', 'suites', 'services', 'gallery', 'reviews', 'location', 'contact'],
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

function siteContentLibraryFromSettings(value: unknown): CatterySiteContentLibrary | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Partial<CatterySiteContentLibrary>;
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.blocks)) return undefined;
  return candidate as CatterySiteContentLibrary;
}

function buildSiteContentLibrary(input: {
  scrape: ImportedCatteryScrape;
  businessName: string;
  rooms: NonNullable<ImportedCatteryScrape['rooms']>;
  services: NonNullable<ImportedCatteryScrape['services']>;
  highlights: NonNullable<ImportedCatteryScrape['highlights']>;
  galleryImages: NonNullable<ImportedCatteryScrape['galleryImages']>;
  reviews: NonNullable<ImportedCatteryScrape['reviews']>;
  faqs: NonNullable<ImportedCatteryScrape['faqs']>;
  hours: string;
  owner?: ImportedCatteryScrape['owner'];
  commitment?: ImportedCatteryScrape['commitment'];
  locationDetails?: ImportedCatteryScrape['locationDetails'];
  socialLinks?: ImportedCatteryScrape['socialLinks'];
  virtualTourUrl?: string;
}): CatterySiteContentLibrary {
  const { scrape, businessName } = input;
  const blocks: CatterySiteContentBlock[] = [
    {
      id: 'hero',
      category: 'hero',
      title: scrape.heading || businessName,
      text: scrape.description || `${businessName} has been imported into CatStays.`,
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      images: input.galleryImages[0] ? [input.galleryImages[0]] : scrape.heroImage ? [{ url: scrape.heroImage, caption: businessName }] : [],
      links: scrape.bookingUrl ? [{ label: 'Book Now', url: scrape.bookingUrl }] : [],
    },
    {
      id: 'why-choose-us',
      category: 'why-choose-us',
      title: `Why choose ${businessName}`,
      text: scrape.description,
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.highlights.map((highlight) => ({
        title: highlight.title,
        text: highlight.description,
      })),
    },
    {
      id: 'rooms',
      category: 'rooms',
      title: 'Rooms and pricing',
      text: 'Accommodation options extracted from the owner site.',
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.rooms.map((room) => ({
        title: room.name,
        text: room.description,
        price: room.price && room.priceUnit ? `${room.price} ${room.priceUnit}` : room.price,
        image: room.image,
        features: room.amenities,
        meta: room.capacity ? `Up to ${room.capacity} cats` : undefined,
      })),
    },
    {
      id: 'services',
      category: 'services',
      title: 'Services',
      text: 'Additional services and care options extracted from the owner site.',
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.services.map((service) => ({
        title: service.title,
        text: service.description,
        price: service.price,
        image: service.image,
      })),
    },
    {
      id: 'gallery',
      category: 'gallery',
      title: 'Gallery',
      text: 'Images extracted from the owner site.',
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      images: input.galleryImages,
    },
    {
      id: 'reviews',
      category: 'reviews',
      title: 'Reviews',
      text: 'Client reviews extracted from the owner site.',
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.reviews.map((review) => ({
        title: review.name,
        text: review.text,
        rating: review.rating,
        meta: review.location,
      })),
    },
    {
      id: 'faqs',
      category: 'faqs',
      title: 'Frequently Asked Questions',
      text: 'Questions and answers extracted from the owner site.',
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.faqs.map((faq) => ({
        title: faq.question,
        answer: faq.answer,
      })),
    },
    {
      id: 'contact',
      category: 'contact',
      title: 'Contact',
      text: [scrape.address, scrape.phone, scrape.email, input.hours].filter(Boolean).join(' | '),
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: [
        { title: 'Address', text: scrape.address },
        { title: 'Phone', text: scrape.phone },
        { title: 'Email', text: scrape.email },
        { title: 'Hours', text: input.hours },
      ].filter((item) => item.text),
      links: [
        input.socialLinks?.facebook ? { label: 'Facebook', url: input.socialLinks.facebook } : undefined,
        input.socialLinks?.instagram ? { label: 'Instagram', url: input.socialLinks.instagram } : undefined,
        scrape.bookingUrl ? { label: 'Book online', url: scrape.bookingUrl } : undefined,
        input.virtualTourUrl ? { label: 'Virtual tour', url: input.virtualTourUrl } : undefined,
      ].filter((link): link is { label: string; url: string } => Boolean(link)),
    },
  ];

  if (input.owner?.text) {
    blocks.push({
      id: 'owner-story',
      category: 'owner-story',
      title: input.owner.title || `About ${businessName}`,
      text: input.owner.text,
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      images: input.owner.image ? [{ url: input.owner.image, caption: input.owner.title || businessName }] : [],
    });
  }

  if (input.commitment?.items?.length || input.commitment?.text) {
    blocks.push({
      id: 'commitment',
      category: 'commitment',
      title: input.commitment.title || `${businessName} care standards`,
      text: input.commitment.text,
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.commitment.items?.map((item) => ({
        title: item.title,
        text: item.description,
      })),
    });
  }

  if (input.locationDetails?.text || input.locationDetails?.directions) {
    blocks.push({
      id: 'location',
      category: 'location',
      title: input.locationDetails.heading || `Find ${businessName}`,
      text: input.locationDetails.text,
      source: scrape.extractedFrom?.html ? 'scrape' : 'generated',
      items: input.locationDetails.directions
        ? [{ title: 'Directions', text: input.locationDetails.directions }]
        : [],
      links: input.locationDetails.virtualTourUrl
        ? [{ label: 'Virtual tour', url: input.locationDetails.virtualTourUrl }]
        : [],
    });
  }

  return {
    schemaVersion: 1,
    sourceUrl: scrape.sourceUrl,
    sourceHost: scrape.sourceHost,
    businessName,
    capturedAt: new Date().toISOString(),
    blocks,
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

function embeddableVirtualTourUrl(rawUrl: string, sourceHost?: string): string {
  if (!rawUrl) return '';
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, '').toLowerCase();
    const source = (sourceHost || '').replace(/^www\./, '').toLowerCase();
    if (source && hostname === source && url.hash) return '';
    if (/google\.[^/]+\/maps\/embed|my\.matterport\.com|kuula\.co|cloudpano\.com|realsee\.ai|eyespy360\.com/i.test(url.href)) {
      return url.href;
    }
    if (/virtual|tour|360|streetview|matterport/i.test(url.href) && hostname !== source) {
      return url.href;
    }
  } catch {
    return '';
  }
  return '';
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
