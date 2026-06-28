import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { AddressAutocomplete } from '../../components/AddressAutocomplete';
import { 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Check, 
  Palette,
  Eye,
  CreditCard,
  Rocket,
  Upload,
  ExternalLink,
  Cat,
  LayoutDashboard,
  Save,
  Loader2,
  Wand2,
  Image as ImageIcon,
  Type,
  MousePointer,
  Globe,
  ArrowLeft,
  PlayCircle,
  ArrowRight,
  Download,
  Home,
  Clock,
  Percent,
  FileText,
  Link as LinkIcon,
  ChevronRight,
  PawPrint,
  Copy,
  Share2,
  Plus,
  Trash2,
  Tag,
  CalendarX,
  AlertCircle
} from 'lucide-react';
import { WebsiteBuilder } from './WebsiteBuilder';
import { SuccessScreen } from './SuccessScreen';
import { DataImportPrompt } from './DataImportPrompt';
import { DataImportFlow } from './DataImportFlow';
import { BookingRulesForm } from './BookingRulesForm';
import { DashboardPreviewStep } from './DashboardPreviewStep';
import { FullWebsitePreview } from './FullWebsitePreview';
import { CatstaysTemplateSite } from './CatstaysTemplateSite';
import {
  applyPreviewTemplate,
  buildPreviewImportRecord,
  dataFromPreviewRecord,
  markPreviewSelectionLive,
  normalizePreviewTemplateId,
  savePreviewImportRecord,
  templateOptionsForData,
  type PreviewImportRecord,
  type PreviewTemplateId,
  type ImportedCatteryScrape,
} from '../../lib/previewTemplates';

const logoIcon = '/assets/b463d12091f20e48be52186dedd2a0f6707d0b66.png';

function mediaKey(url: string) {
  return String(url || '').split('?')[0].trim().toLowerCase();
}

function slugKey(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function savePreviewSourceCatalog(record: PreviewImportRecord, catteryId?: string | null) {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;
    if (!userId || !record.source.url) return;

    const { data: importRow, error: importError } = await supabase
      .from('preview_source_imports')
      .upsert({
        cattery_id: catteryId || null,
        created_by: userId,
        source_url: record.source.url,
        source_host: record.source.host,
        business_name: record.identity.businessName,
        import_status: record.status,
        template_hint: record.selectedTemplate,
        raw_summary: {
          contact: record.contact,
          identity: record.identity,
          source: record.source,
          counts: {
            images: record.media.images.length,
            mediaAssets: record.media.mediaAssets?.length ?? 0,
            galleryImages: record.media.galleryImages.length,
            contentSnippets: record.contentSnippets?.length ?? 0,
            rooms: record.rooms.length,
            services: record.services.length,
            faqs: record.faqs.length,
          },
        },
      }, { onConflict: 'source_fingerprint,created_by' })
      .select('id')
      .single();

    if (importError || !importRow?.id) {
      console.warn('Could not save preview source import catalog', importError);
      return;
    }

    const importId = importRow.id as string;
    await supabase.from('preview_template_slot_assignments').delete().eq('import_id', importId);
    await supabase.from('preview_source_content_media_links').delete().eq('import_id', importId);
    await supabase.from('preview_source_content_items').delete().eq('import_id', importId);

    const mediaByKey = new Map<string, any>();
    const addMedia = (url: string, details: Record<string, any> = {}) => {
      const key = mediaKey(url);
      if (!key) return;
      const existing = mediaByKey.get(key) || {};
      mediaByKey.set(key, {
        import_id: importId,
        url,
        source_page_url: details.sourceUrl || existing.source_page_url || record.source.url,
        source_page_title: details.sourcePageTitle || existing.source_page_title || '',
        alt_text: details.alt || existing.alt_text || '',
        title: details.title || existing.title || '',
        caption: details.caption || existing.caption || '',
        nearby_text: details.nearbyText || existing.nearby_text || '',
        semantic_role: details.category || existing.semantic_role || 'gallery',
        section_hint: details.sectionHint || existing.section_hint || details.category || 'gallery',
        tags: Array.isArray(details.tags) ? details.tags : existing.tags || [],
        contains_text: Boolean(details.containsText ?? existing.contains_text),
        is_logo: Boolean(details.isLogo ?? existing.is_logo),
        is_decorative: Boolean(details.isDecorative ?? existing.is_decorative),
        quality_score: typeof details.score === 'number' ? details.score : existing.quality_score ?? null,
        ai_metadata: details.aiMetadata || existing.ai_metadata || {},
      });
    };

    for (const asset of record.media.mediaAssets ?? []) addMedia(asset.url, asset);
    for (const image of record.media.galleryImages) addMedia(image.url, { caption: image.caption, category: 'gallery', tags: (image as any).tags });
    for (const url of record.media.images) addMedia(url, { category: 'gallery' });
    for (const room of record.rooms) addMedia(room.image || '', { category: 'rooms', sectionHint: room.name, nearbyText: room.description, tags: ['room', room.name].filter(Boolean) });
    for (const service of record.services) addMedia(service.image || '', { category: 'services', sectionHint: service.title, nearbyText: service.description, tags: ['service', service.title].filter(Boolean) });

    const mediaRows = [...mediaByKey.values()];
    const { data: savedMedia } = mediaRows.length
      ? await supabase
          .from('preview_source_media_assets')
          .upsert(mediaRows, { onConflict: 'import_id,normalized_url' })
          .select('id,url,semantic_role')
      : { data: [] as any[] };
    const savedMediaByUrl = new Map((savedMedia ?? []).map((media) => [mediaKey(media.url), media]));

    const contentRows: Array<Record<string, any> & { linkedImage?: string; slotKey?: string }> = [];
    const addContent = (semanticRole: string, title: string, body: string, details: Record<string, any> = {}) => {
      if (!String(title || body).trim()) return;
      contentRows.push({
        import_id: importId,
        source_page_url: details.sourceUrl || record.source.url,
        source_page_title: details.sourcePageTitle || '',
        heading: details.heading || '',
        title,
        body,
        semantic_role: semanticRole,
        section_hint: details.sectionHint || semanticRole,
        tags: Array.isArray(details.tags) ? details.tags : [semanticRole],
        intent: details.intent || {},
        sort_order: contentRows.length,
        linkedImage: details.linkedImage,
        slotKey: details.slotKey,
      });
    };

    for (const snippet of record.contentSnippets ?? []) {
      addContent(snippet.category || 'general', snippet.title, snippet.text, {
        sourceUrl: snippet.sourceUrl,
        sourcePageTitle: snippet.sourcePageTitle,
        heading: snippet.heading,
        tags: snippet.tags,
      });
    }
    for (const block of record.contentLibrary.blocks ?? []) {
      addContent(block.category, block.title, block.text || '', {
        linkedImage: block.images?.[0]?.url,
        slotKey: block.category,
        tags: [block.category],
      });
      for (const item of block.items ?? []) {
        addContent(block.category, item.title, item.text || item.answer || '', {
          linkedImage: item.image,
          slotKey: `${block.category}:${slugKey(item.title)}`,
          tags: [block.category, item.title].filter(Boolean),
        });
      }
    }
    for (const room of record.rooms) {
      addContent('rooms', room.name, room.description, {
        linkedImage: room.image,
        slotKey: `rooms:${slugKey(room.name)}`,
        tags: ['room', room.name].filter(Boolean),
        intent: { price: room.price, priceUnit: room.priceUnit, amenities: room.amenities ?? [] },
      });
    }
    for (const service of record.services) {
      addContent('services', service.title, service.description, {
        linkedImage: service.image,
        slotKey: `services:${slugKey(service.title)}`,
        tags: ['service', service.title].filter(Boolean),
        intent: { price: service.price },
      });
    }
    for (const faq of record.faqs) addContent('faqs', faq.question, faq.answer, { slotKey: `faqs:${slugKey(faq.question)}` });

    const contentRowsForDb = contentRows.map(({ linkedImage, slotKey, ...row }) => row);
    const { data: savedContent } = contentRowsForDb.length
      ? await supabase.from('preview_source_content_items').insert(contentRowsForDb).select('id,semantic_role,sort_order')
      : { data: [] as any[] };

    const linkRows: any[] = [];
    const slotRows: any[] = [];
    (savedContent ?? []).forEach((content, index) => {
      const sourceContent = contentRows[index];
      const media = savedMediaByUrl.get(mediaKey(sourceContent?.linkedImage || ''));
      if (media) {
        linkRows.push({
          import_id: importId,
          content_item_id: content.id,
          media_asset_id: media.id,
          semantic_role: sourceContent.semantic_role,
          confidence: 0.96,
          reason: 'Image was found with the matching source-site content block.',
        });
      }
      if (sourceContent?.slotKey) {
        slotRows.push({
          import_id: importId,
          template_id: 'all-previews',
          slot_key: sourceContent.slotKey,
          content_item_id: content.id,
          media_asset_id: media?.id ?? null,
          confidence: media ? 0.96 : 0.82,
          rationale: media
            ? 'Use the original image-copy pairing before falling back to gallery images.'
            : 'Use the source content block in the matching preview section.',
        });
      }
    });

    if (linkRows.length) await supabase.from('preview_source_content_media_links').insert(linkRows);
    if (slotRows.length) await supabase.from('preview_template_slot_assignments').upsert(slotRows, { onConflict: 'import_id,template_id,slot_key' });
  } catch (error) {
    console.warn('Preview source catalog save skipped', error);
  }
}

function OnboardingTemplateSnapshot({
  template,
  data,
}: {
  template: PreviewTemplateId;
  data: Record<string, any>;
}) {
  const miniatureScale = 0.22;
  const miniatureStyle = {
    width: `${100 / miniatureScale}%`,
    height: `${100 / miniatureScale}%`,
    transform: `scale(${miniatureScale})`,
    transformOrigin: 'top left',
  } as const;

  return (
    <div className="relative h-full overflow-hidden bg-white">
      <div className="absolute left-0 top-0" style={miniatureStyle}>
        <CatstaysTemplateSite data={data} templateId={normalizePreviewTemplateId(template)} embedded />
      </div>
    </div>
  );
}

type PlanTier = 'starter' | 'professional' | 'premium';

const planDetails: Record<PlanTier, {
  name: string;
  price: number;
  description: string;
  badge?: string;
  features: string[];
}> = {
  starter: {
    name: 'Starter',
    price: 49,
    description: 'A calm, simple way to launch your cattery online.',
    features: [
      'Booking-ready cattery website',
      'Dashboard to manage bookings',
      'Customer communication tools',
      'Payment request setup',
      'Availability and room setup',
    ],
  },
  professional: {
    name: 'Professional',
    price: 79,
    description: 'For catteries ready to give customers more self-service.',
    badge: 'Most Popular',
    features: [
      'Everything in Starter',
      'Client portal logins',
      'Customer-managed bookings',
      'Photo updates and reminders',
      'Reports for bookings and revenue',
    ],
  },
  premium: {
    name: 'Premium',
    price: 99,
    description: 'For established catteries that want the complete growth toolkit.',
    badge: 'Complete',
    features: [
      'Everything in Professional',
      'Custom domain request workflow',
      'Marketing kit and social assets',
      'Accounting and financial tools',
      'Advanced reports',
    ],
  },
};

function publishErrorMessage(status: number, rawPayload: string) {
  const trimmedPayload = rawPayload.trim();
  if (status >= 500 && !trimmedPayload) {
    return 'The publishing service is not available in this preview. Your setup is saved; please try again after the full CatStays preview restarts.';
  }
  if (status >= 500) {
    return 'The publishing service hit a temporary problem. Your setup is saved; please try again in a moment.';
  }
  return 'Something went wrong while publishing your cattery.';
}

function offlinePublishMessage(message: string) {
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'The publishing service is not available in this preview. Your setup is saved; please try again after the full CatStays preview restarts.';
  }
  return message;
}

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { cattery, refreshCattery } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 9; // Account, Cattery Details, Website Builder, Booking Setup, Website Preview, Choose Plan, Publish, Success, Data Import
  const [accountCreated, setAccountCreated] = useState(false);
  const [showDataImportFlow, setShowDataImportFlow] = useState(false);
  const [showTemplateSelection, setShowTemplateSelection] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>('professional');

  const [data, setData] = useState<any>({
    // Step 1 - Account Creation
    name: '',
    email: '',
    password: '',
    emailConfirmed: false,
    
    // Step 2 - Cattery Details
    businessName: '',
    location: '',
    
    // Step 3 - Import Website
    websiteUrl: '',
    importSourceUrl: '',
    sourceUrl: '',
    sourceHost: '',
    previewImportRecord: null,
    previewImportRecordId: '',
    previewRecordStatus: 'draft',
    isImporting: false,
    importComplete: false,
    importError: '',
    selectedTemplate: null as string | null,
    
    // Step 4 - Website Style & Brand Colors
    primaryColor: '#4F6F5A',
    accentColor: '#D98C6A',
    backgroundColor: '#FAF7F2',
    typography: 'playfair',
    logo: '',
    heroImage: '',
    heroHeading: 'Luxury Cat Boarding',
    heroSubheading: 'A home away from home for your feline friends',
    heroPrimaryCtaText: 'Discover Our Suites',
    heroPrimaryCtaHref: '#suites',
    heroSecondaryCtaText: 'Our Care Approach',
    heroSecondaryCtaHref: '#care',
    aboutText: 'We provide premium cat boarding in a peaceful, caring environment.',
    aboutHeading: 'About Our Cattery',
    phone: '',
    address: '',
    locationData: null,
    socialLinks: null,
    virtualTourUrl: '',
    footerAbout: '',
    siteContentLibrary: null,
    contentLibrary: null,
    sectionsOrder: [],
    
    // Website Content - Preloaded defaults
    galleryImages: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&h=800&fit=crop'
    ],
    testimonials: [
      { name: 'Sarah M.', text: 'Absolutely wonderful! My cat Whiskers loves it here.', rating: 5 },
      { name: 'James T.', text: 'Professional, caring, and spotlessly clean. Highly recommend!', rating: 5 },
      { name: 'Emma L.', text: 'I travel worry-free knowing my cats are in great hands.', rating: 5 }
    ],
    faqs: [
      { question: 'What are your check-in times?', answer: 'Check-in is between 9 AM - 12 PM, and check-out is 3 PM - 6 PM.' },
      { question: 'Do you require vaccinations?', answer: 'Yes, all cats must be up-to-date on vaccinations for everyone\'s safety.' },
      { question: 'Can I visit my cat during their stay?', answer: 'We recommend letting cats settle in, but video updates are sent daily.' }
    ],
    additionalServices: [
      { title: 'Grooming', price: '$35', description: 'Professional bathing and brushing' },
      { title: 'Medication Administration', price: '$10/day', description: 'Careful medication management' },
      { title: 'Special Diet', price: '$15/day', description: 'Custom meal preparation' },
      { title: 'Extended Playtime', price: '$20/day', description: 'Extra one-on-one attention' }
    ],
    
    // Step 5 - Booking Rules
    // Opening Hours (renamed from Check-in Times)
    openByAppointmentOnly: false,
    bookingInterval: '15',
    morningStart: '09:00',
    morningEnd: '12:00',
    afternoonStart: '15:00',
    afternoonEnd: '18:00',
    
    // Deposit Requirements
    depositType: 'percentage', // 'percentage' or 'fixed'
    depositAmount: '50',
    
    // Room Cleaning Buffer
    cleaningBufferEnabled: true,
    cleaningBuffer: '15', // in minutes
    
    // Room Capacity
    roomTypes: [
      { 
        name: 'Private Suite', 
        numberOfRooms: '17', 
        maxCatsPerRoom: '1',
        sameFamilyOnly: false 
      }
    ],
    
    // Daily Pricing (renamed from Pricing Rates)
    pricingPer: 'day', // 'day' or 'night'
    pricingRates: [
      { numberOfCats: '1', price: '30', discountType: 'none', discountValue: '0' }
    ],
    
    // Tax Logic
    chargeTax: true,
    taxRate: '15', // Will auto-detect based on address
    taxType: 'GST', // GST, VAT, Sales Tax
    
    // Discounts
    discounts: [] as Array<{ name: string; type: 'percentage' | 'fixed'; value: string }>,
    
    // Block Out Dates
    blockOutDates: [] as Array<{ name: string; startDate: string; endDate: string }>,
    
    // Legacy fields (keeping for backwards compatibility)
    privateRooms: '',
    indoorRooms: '',
    communalRooms: '',
    pricePerCat: '30',
    
    // Step 6 - Dashboard Preview (informational)
    
    // Step 7 - Full Website Preview
    
    // Step 8 - Publishing & Trial
    subdomain: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [createAccountError, setCreateAccountError] = useState<string | null>(null);

  // Auto-generate subdomain from business name
  useEffect(() => {
    if (data.businessName && !data.subdomain) {
      const subdomain = data.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      setData(prev => ({ ...prev, subdomain }));
    }
  }, [data.businessName]);

  // Auto-detect tax based on location
  useEffect(() => {
    const locationSignals = [
      data.location,
      data.address,
      data.previewImportRecord?.identity?.location,
      data.previewImportRecord?.normalizedPreviewData?.location,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (!locationSignals) return;

    let nextTaxType: string | null = null;
    let nextTaxRate: string | null = null;

    if (locationSignals.includes('new zealand') || /\bnz\b/.test(locationSignals)) {
      nextTaxType = 'GST';
      nextTaxRate = '15';
    } else if (locationSignals.includes('australia') || /\bau\b/.test(locationSignals)) {
      nextTaxType = 'GST';
      nextTaxRate = '10';
    } else if (
      locationSignals.includes('united kingdom') ||
      /\buk\b/.test(locationSignals) ||
      ['france', 'germany', 'spain', 'italy', 'ireland', 'netherlands', 'belgium', 'portugal'].some((country) =>
        locationSignals.includes(country),
      )
    ) {
      nextTaxType = 'VAT';
      nextTaxRate = '20';
    } else if (
      locationSignals.includes('united states') ||
      locationSignals.includes('usa') ||
      /\bus\b/.test(locationSignals)
    ) {
      nextTaxType = 'Sales Tax';
      nextTaxRate = '8';
    }

    if (!nextTaxType || !nextTaxRate) return;

    setData((prev: any) =>
      prev.taxType === nextTaxType && prev.taxRate === nextTaxRate
        ? prev
        : { ...prev, taxType: nextTaxType, taxRate: nextTaxRate },
    );
  }, [data.location, data.address, data.previewImportRecord]);

  const handleNext = () => {
    if (step < totalSteps) {
      handleSaveProgress();
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      handleSaveProgress();
      setStep(step - 1);
    }
  };

  const handleGoToStep = (stepNumber: number) => {
    // Only allow navigation to step 1, or if account is created
    if (stepNumber === 1 || accountCreated) {
      handleSaveProgress();
      setStep(stepNumber);
    }
  };

  const handleCreateAccount = async () => {
    setCreateAccountError(null);

    if (!data.name || !data.email || !data.password) {
      setCreateAccountError('Please fill in all fields.');
      return;
    }

    if ((data.password || '').length < 8) {
      setCreateAccountError('Password must be at least 8 characters.');
      return;
    }

    setIsSaving(true);

    const draftAccount = {
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
      emailConfirmed: false,
      status: 'draft',
    };
    setAccountCreated(true);
    localStorage.setItem('catstays_account', JSON.stringify(draftAccount));
    localStorage.setItem('catstays_onboarding', JSON.stringify({ step: 2, data, accountCreated: true }));
    setIsSaving(false);
    setStep(2);
  };

  const handleImportWebsite = async () => {
    setData(prev => ({ ...prev, isImporting: true, importError: '' }));

    try {
      const res = await fetch('/api/website/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.websiteUrl }),
      });

      const payload = await res.json() as ImportedCatteryScrape & { error?: string };

      if (!res.ok || payload.error) {
        setData(prev => ({
          ...prev,
          isImporting: false,
          importError: payload.error || "We couldn't reach that site — you can start from scratch instead.",
        }));
        return;
      }

      const previewRecord = buildPreviewImportRecord(payload);
      savePreviewImportRecord(previewRecord);
      void savePreviewSourceCatalog(previewRecord, cattery?.id);

      setData(prev => ({
        ...dataFromPreviewRecord(previewRecord, 'original', prev),
        isImporting: false,
        importComplete: true,
        importError: '',
      }));
    } catch {
      setData(prev => ({
        ...prev,
        isImporting: false,
        importError: "We couldn't reach that site — you can start from scratch instead.",
      }));
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    // Always save locally for resilience
    localStorage.setItem('catstays_onboarding', JSON.stringify({ step, data, accountCreated }));

    // Save cattery profile + website settings to Supabase if logged in
    if (cattery?.id) {
      const websiteSettings = {
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        typography: data.typography,
        headingFont: data.headingFont,
        subheadingFont: data.subheadingFont,
        bodyFont: data.bodyFont,
        logo: data.logo,
        heroImage: data.heroImage,
        heroHeading: data.heroHeading,
        heroSubheading: data.heroSubheading,
        heroPrimaryCtaText: data.heroPrimaryCtaText,
        heroPrimaryCtaHref: data.heroPrimaryCtaHref,
        heroSecondaryCtaText: data.heroSecondaryCtaText,
        heroSecondaryCtaHref: data.heroSecondaryCtaHref,
        aboutText: data.aboutText,
        aboutHeading: data.aboutHeading,
        whyChooseUsHeading: data.whyChooseUsHeading,
        whyChooseUsFeatures: data.whyChooseUsFeatures,
        facilitiesHeading: data.facilitiesHeading,
        facilitiesText: data.facilitiesText,
        facilitiesImage: data.facilitiesImage,
        facilityFeatures: data.facilityFeatures,
        suitesHeading: data.suitesHeading,
        suites: data.suites,
        additionalServicesHeading: data.additionalServicesHeading,
        galleryHeading: data.galleryHeading,
        galleryImages: data.galleryImages,
        testimonialsHeading: data.testimonialsHeading,
        faqHeading: data.faqHeading,
        ownerData: data.ownerData,
        locationData: data.locationData,
        socialLinks: data.socialLinks,
        virtualTourUrl: data.virtualTourUrl,
        footerAbout: data.footerAbout,
        siteContentLibrary: data.siteContentLibrary,
        contentLibrary: data.contentLibrary,
        sectionsOrder: data.sectionsOrder,
        importSourceUrl: data.importSourceUrl,
        sourceUrl: data.sourceUrl,
        sourceHost: data.sourceHost,
        previewImportRecord: data.previewImportRecord,
        previewImportRecordId: data.previewImportRecordId,
        previewRecordStatus: data.previewRecordStatus,
        liveTemplate: data.selectedTemplate,
        testimonials: data.testimonials,
        faqs: data.faqs,
        additionalServices: data.additionalServices,
        openByAppointmentOnly: data.openByAppointmentOnly,
        bookingInterval: data.bookingInterval,
        morningStart: data.morningStart,
        morningEnd: data.morningEnd,
        afternoonStart: data.afternoonStart,
        afternoonEnd: data.afternoonEnd,
        depositType: data.depositType,
        depositAmount: data.depositAmount,
        cleaningBufferEnabled: data.cleaningBufferEnabled,
        cleaningBuffer: data.cleaningBuffer,
        pricingPer: data.pricingPer,
        pricingRates: data.pricingRates,
        chargeTax: data.chargeTax,
        taxRate: data.taxRate,
        taxType: data.taxType,
        discounts: data.discounts,
        blockOutDates: data.blockOutDates,
        selectedTemplate: data.selectedTemplate,
      };

      await supabase
        .from('catteries')
        .update({
          name: data.businessName || cattery.name,
          phone: data.phone || cattery.phone,
          address: data.address || cattery.address,
          city: data.location || cattery.city,
          slug: data.subdomain || cattery.slug,
          website_settings: websiteSettings,
        })
        .eq('id', cattery.id);
    }

    setIsSaving(false);
    setSavedSuccessfully(true);
    setTimeout(() => setSavedSuccessfully(false), 2000);
  };

  // Pre-populate form from existing cattery record when user is already logged in
  useEffect(() => {
    if (cattery) {
      setAccountCreated(true);
      const ws = cattery.website_settings as Record<string, any> || {};
      setData(prev => ({
        ...prev,
        businessName: cattery.name || prev.businessName,
        phone: cattery.phone || prev.phone,
        address: cattery.address || prev.address,
        location: cattery.city || prev.location,
        subdomain: cattery.slug || prev.subdomain,
        primaryColor: ws.primaryColor || prev.primaryColor,
        accentColor: ws.accentColor || prev.accentColor,
        backgroundColor: ws.backgroundColor || prev.backgroundColor,
        typography: ws.typography || prev.typography,
        headingFont: ws.headingFont || prev.headingFont,
        subheadingFont: ws.subheadingFont || prev.subheadingFont,
        bodyFont: ws.bodyFont || prev.bodyFont,
        logo: ws.logo || prev.logo,
        heroImage: ws.heroImage || prev.heroImage,
        heroHeading: ws.heroHeading || prev.heroHeading,
        heroSubheading: ws.heroSubheading || prev.heroSubheading,
        heroPrimaryCtaText: ws.heroPrimaryCtaText || prev.heroPrimaryCtaText,
        heroPrimaryCtaHref: ws.heroPrimaryCtaHref || prev.heroPrimaryCtaHref,
        heroSecondaryCtaText: ws.heroSecondaryCtaText || prev.heroSecondaryCtaText,
        heroSecondaryCtaHref: ws.heroSecondaryCtaHref || prev.heroSecondaryCtaHref,
        aboutText: ws.aboutText || prev.aboutText,
        aboutHeading: ws.aboutHeading || prev.aboutHeading,
        whyChooseUsHeading: ws.whyChooseUsHeading || prev.whyChooseUsHeading,
        whyChooseUsFeatures: ws.whyChooseUsFeatures ?? prev.whyChooseUsFeatures,
        facilitiesHeading: ws.facilitiesHeading || prev.facilitiesHeading,
        facilitiesText: ws.facilitiesText || prev.facilitiesText,
        facilitiesImage: ws.facilitiesImage || prev.facilitiesImage,
        facilityFeatures: ws.facilityFeatures ?? prev.facilityFeatures,
        suitesHeading: ws.suitesHeading || prev.suitesHeading,
        suites: ws.suites ?? prev.suites,
        additionalServicesHeading: ws.additionalServicesHeading || prev.additionalServicesHeading,
        galleryHeading: ws.galleryHeading || prev.galleryHeading,
        galleryImages: ws.galleryImages ?? prev.galleryImages,
        testimonialsHeading: ws.testimonialsHeading || prev.testimonialsHeading,
        testimonials: ws.testimonials ?? prev.testimonials,
        faqHeading: ws.faqHeading || prev.faqHeading,
        faqs: ws.faqs ?? prev.faqs,
        additionalServices: ws.additionalServices ?? prev.additionalServices,
        ownerData: ws.ownerData || prev.ownerData,
        locationData: ws.locationData || prev.locationData,
        socialLinks: ws.socialLinks || prev.socialLinks,
        virtualTourUrl: ws.virtualTourUrl || prev.virtualTourUrl,
        footerAbout: ws.footerAbout || prev.footerAbout,
        siteContentLibrary: ws.siteContentLibrary || prev.siteContentLibrary,
        contentLibrary: ws.contentLibrary || prev.contentLibrary,
        sectionsOrder: ws.sectionsOrder || prev.sectionsOrder,
        importSourceUrl: ws.importSourceUrl || ws.sourceUrl || prev.importSourceUrl,
        sourceUrl: ws.sourceUrl || ws.importSourceUrl || prev.sourceUrl,
        sourceHost: ws.sourceHost || prev.sourceHost,
        previewImportRecord: ws.previewImportRecord || prev.previewImportRecord,
        previewImportRecordId: ws.previewImportRecordId || prev.previewImportRecordId,
        previewRecordStatus: ws.previewRecordStatus || prev.previewRecordStatus,
        liveTemplate: ws.liveTemplate || prev.liveTemplate,
        selectedTemplate: ws.selectedTemplate || ws.liveTemplate || prev.selectedTemplate,
      }));
    }
  }, [cattery?.id]);

  // Load saved progress and signup data on mount
  useEffect(() => {
    // Load saved account
    const accountData = localStorage.getItem('catstays_account');
    if (accountData) {
      try {
        const account = JSON.parse(accountData);
        setAccountCreated(true);
        setData(prev => ({ ...prev, name: account.name, email: account.email }));
      } catch (e) {
        console.error('Failed to load account data');
      }
    }

    // Load signup data from modal (legacy)
    const signupData = localStorage.getItem('catstays_signup_data');
    if (signupData) {
      try {
        const { businessName } = JSON.parse(signupData);
        if (businessName) {
          setData(prev => ({ ...prev, businessName }));
        }
        localStorage.removeItem('catstays_signup_data');
      } catch (e) {
        console.error('Failed to load signup data');
      }
    }

    // Load saved onboarding progress
    const saved = localStorage.getItem('catstays_onboarding');
    if (saved) {
      try {
        const { step: savedStep, data: savedData, accountCreated: savedAccountCreated } = JSON.parse(saved);
        setStep(savedStep);
        setData(savedData);
        if (savedAccountCreated) setAccountCreated(savedAccountCreated);
      } catch (e) {
        console.error('Failed to load saved progress');
      }
    }
  }, []);

  // Keep local progress synced so returning owners land on the correct step.
  useEffect(() => {
    if (!accountCreated && step <= 1) return;
    localStorage.setItem('catstays_onboarding', JSON.stringify({
      step,
      data,
      accountCreated,
    }));
  }, [step, data, accountCreated]);

  // Auto-save on unmount (when leaving the page)
  useEffect(() => {
    return () => {
      if (step > 1 && accountCreated) {
        localStorage.setItem('catstays_onboarding', JSON.stringify({ 
          step, 
          data, 
          accountCreated 
        }));
      }
    };
  }, [step, data, accountCreated]);

  // Handle AI-powered content regeneration for website fields
  const handleAIRegenerate = (field: string) => {
    // AI content generation examples
    const suggestions = {
      heroHeading: [
        'Premium Cat Boarding & Care',
        'A Peaceful Retreat for Your Cat',
        'Luxury Cat Boarding Services',
        'Your Cat\'s Home Away From Home'
      ],
      heroSubheading: [
        'Where comfort meets exceptional feline care',
        'Professional, loving care for your beloved pets',
        'Boutique cat boarding in a serene environment',
        'Expert care in a calm, stress-free setting'
      ],
      whyChooseUsHeading: [
        'Why Choose Us',
        'What Sets Us Apart',
        'Why We\'re Different',
        'Your Cat Deserves the Best'
      ],
      facilitiesHeading: [
        'Our Facilities',
        'Premium Facilities',
        'World-Class Amenities',
        'State-of-the-Art Cattery'
      ],
      facilitiesText: [
        'Our state-of-the-art cattery features climate-controlled suites, natural lighting, and soothing music to keep your cat comfortable and relaxed throughout their stay.',
        'Every aspect of our facility is designed with your cat\'s comfort in mind, from temperature control to calming colors and soft bedding.',
        'We\'ve created a serene environment with individual play areas, cozy sleeping quarters, and plenty of natural light to ensure your cat feels at home.',
        'Our modern cattery combines luxury accommodations with thoughtful design to create the perfect retreat for your feline friend.'
      ],
      suitesHeading: [
        'Our Suites',
        'Luxury Accommodations',
        'Choose Your Suite',
        'Premium Cat Suites'
      ],
      servicesHeading: [
        'Our Services',
        'What We Offer',
        'Additional Services',
        'Premium Care Services'
      ],
      testimonialsHeading: [
        'What Our Clients Say',
        'Client Testimonials',
        'Happy Cat Parents',
        'Reviews & Testimonials'
      ],
      faqHeading: [
        'Frequently Asked Questions',
        'Common Questions',
        'FAQ',
        'Your Questions Answered'
      ],
      commitmentHeading: [
        'Our Commitment',
        'What We Stand For',
        'Our Promise',
        'Core Values'
      ],
      aboutHeading: [
        'About Our Cattery',
        'Welcome to ' + data.businessName,
        'Why Choose Us',
        'Our Story'
      ],
      aboutText: [
        'We provide premium cat boarding in a peaceful, caring environment. Our experienced team ensures your feline friend receives personalized attention and care.',
        'A family-run cattery dedicated to providing the highest standard of care for your beloved cats in a home-like setting.',
        'Our boutique cattery offers luxury accommodations and individualized care, ensuring your cat feels safe, comfortable, and loved.',
        'With over a decade of experience, we specialize in providing stress-free boarding for cats in a calm, nurturing environment.'
      ]
    };

    // Handle array-based fields (features, services, testimonials, etc.)
    if (field.match(/whyChooseUsFeature\d+Title/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const titles = ['Licensed & Insured', 'Loving Care', 'Years of Experience', '24/7 Monitoring', 'Daily Photo Updates'];
      const newFeatures = [...(data.whyChooseUsFeatures || [])];
      if (newFeatures[index]) {
        newFeatures[index] = { ...newFeatures[index], title: titles[Math.floor(Math.random() * titles.length)] };
        setData({ ...data, whyChooseUsFeatures: newFeatures });
      }
      return;
    }
    
    if (field.match(/whyChooseUsFeature\d+Description/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const descs = ['Fully certified cattery', 'Individual attention daily', 'Trusted by thousands', 'Round-the-clock care', 'Professional photos sent daily'];
      const newFeatures = [...(data.whyChooseUsFeatures || [])];
      if (newFeatures[index]) {
        newFeatures[index] = { ...newFeatures[index], description: descs[Math.floor(Math.random() * descs.length)] };
        setData({ ...data, whyChooseUsFeatures: newFeatures });
      }
      return;
    }

    if (field.match(/facilityFeature\d+Title/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const titles = ['Climate Control', 'Natural Lighting', 'Premium Bedding', 'Play Areas', 'Security Cameras'];
      const newFeatures = [...(data.facilityFeatures || [])];
      if (newFeatures[index]) {
        newFeatures[index] = { ...newFeatures[index], title: titles[Math.floor(Math.random() * titles.length)] };
        setData({ ...data, facilityFeatures: newFeatures });
      }
      return;
    }

    if (field.match(/facilityFeature\d+Description/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const descs = ['Perfect temperature year-round', 'Large windows with sunlight', 'Soft, luxurious bedding', 'Individual exercise spaces', '24/7 video monitoring'];
      const newFeatures = [...(data.facilityFeatures || [])];
      if (newFeatures[index]) {
        newFeatures[index] = { ...newFeatures[index], description: descs[Math.floor(Math.random() * descs.length)] };
        setData({ ...data, facilityFeatures: newFeatures });
      }
      return;
    }

    if (field.match(/service\d+Title/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const titles = ['Luxury Boarding', 'Daily Photo Updates', 'Special Care', 'Grooming Services', 'Medical Administration'];
      const newServices = [...(data.services || [])];
      if (newServices[index]) {
        newServices[index] = { ...newServices[index], title: titles[Math.floor(Math.random() * titles.length)] };
        setData({ ...data, services: newServices });
      }
      return;
    }

    if (field.match(/service\d+Description/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const descs = ['Premium accommodations with individual suites', 'Professional photos sent daily', 'Medication administration and dietary needs', 'Professional grooming by appointment', 'Expert medical care when needed'];
      const newServices = [...(data.services || [])];
      if (newServices[index]) {
        newServices[index] = { ...newServices[index], description: descs[Math.floor(Math.random() * descs.length)] };
        setData({ ...data, services: newServices });
      }
      return;
    }

    if (field.match(/testimonial\d+/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const texts = ['The best cattery! My cat actually seems happy to go back.', 'Professional, caring, and the daily updates are wonderful.', 'I trust them completely. Highly recommend!', 'Amazing facility and caring staff.'];
      const newTestimonials = [...(data.testimonials || [])];
      if (newTestimonials[index]) {
        newTestimonials[index] = { ...newTestimonials[index], text: texts[Math.floor(Math.random() * texts.length)] };
        setData({ ...data, testimonials: newTestimonials });
      }
      return;
    }

    if (field.match(/faq\d+Question/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const questions = ['What time is check-in?', 'Do you provide food?', 'Can I visit my cat?', 'What vaccinations are required?', 'How often do you send updates?'];
      const newFaqs = [...(data.faqs || [])];
      if (newFaqs[index]) {
        newFaqs[index] = { ...newFaqs[index], question: questions[Math.floor(Math.random() * questions.length)] };
        setData({ ...data, faqs: newFaqs });
      }
      return;
    }

    if (field.match(/faq\d+Answer/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const answers = ['Check-in is between 9am-6pm daily.', 'We provide premium cat food.', 'Yes! Visits are welcome during business hours.', 'We require proof of current vaccinations.', 'We send photos daily via email or text.'];
      const newFaqs = [...(data.faqs || [])];
      if (newFaqs[index]) {
        newFaqs[index] = { ...newFaqs[index], answer: answers[Math.floor(Math.random() * answers.length)] };
        setData({ ...data, faqs: newFaqs });
      }
      return;
    }

    if (field.match(/commitmentValue\d+Title/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const titles = ['Love & Care', 'Safety First', 'Excellence', 'Quality', 'Trust', 'Comfort'];
      const newValues = [...(data.commitmentValues || [])];
      if (newValues[index]) {
        newValues[index] = { ...newValues[index], title: titles[Math.floor(Math.random() * titles.length)] };
        setData({ ...data, commitmentValues: newValues });
      }
      return;
    }

    if (field.match(/customSection\d+Heading/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const headings = ['Important Information', 'Special Offers', 'Health & Safety', 'Cat Care Tips', 'Our Philosophy'];
      const newSections = [...(data.customSections || [])];
      if (newSections[index]) {
        newSections[index] = { ...newSections[index], heading: headings[Math.floor(Math.random() * headings.length)] };
        setData({ ...data, customSections: newSections });
      }
      return;
    }

    if (field.match(/customSection\d+Content/)) {
      const index = parseInt(field.match(/\d+/)?.[0] || '0');
      const contents = ['We believe every cat deserves individualized care and attention.', 'Take advantage of our special rates for extended stays.', 'Your cat\'s health and safety are our top priorities.', 'Learn more about how we care for our feline guests.'];
      const newSections = [...(data.customSections || [])];
      if (newSections[index]) {
        newSections[index] = { ...newSections[index], content: contents[Math.floor(Math.random() * contents.length)] };
        setData({ ...data, customSections: newSections });
      }
      return;
    }

    // Handle simple field regeneration
    const options = suggestions[field as keyof typeof suggestions];
    if (options) {
      const randomSuggestion = options[Math.floor(Math.random() * options.length)];
      setData({ ...data, [field]: randomSuggestion });
    }
  };

  const handleTemplateSelect = (template: PreviewTemplateId) => {
    const nextData = applyPreviewTemplate(data, template);
    setData(nextData);
    setShowTemplateSelection(false);
    localStorage.setItem('catstays_onboarding', JSON.stringify({ step, data: nextData, accountCreated }));
    setStep(Math.min(step + 1, totalSteps));
  };

  const handlePublish = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      let activeCatteryId = cattery?.id ?? null;
      const liveData = markPreviewSelectionLive(data);
      setData(liveData);

      if (!activeCatteryId) {
        if (!liveData.name || !liveData.email || !liveData.password || (liveData.password || '').length < 8) {
          setCreateAccountError('Please complete your account details before publishing.');
          setStep(1);
          return;
        }

        localStorage.setItem('catstays_onboarding', JSON.stringify({ step, data: liveData, accountCreated: true }));

        const response = await fetch('/api/cattery/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: liveData, plan: selectedPlan }),
        });

        const rawPayload = await response.text();
        let payload: {
          error?: string;
          catteryId?: string;
          slug?: string;
        } = {};

        try {
          payload = rawPayload ? JSON.parse(rawPayload) : {};
        } catch {
          payload = {};
        }

        if (!response.ok) {
          const message = payload.error || publishErrorMessage(response.status, rawPayload);
          if (response.status === 409 && message.toLowerCase().includes('account')) {
            setCreateAccountError(message);
            setAccountCreated(false);
            setStep(1);
            return;
          }
          throw new Error(message);
        }

        activeCatteryId = payload.catteryId || null;
        if (payload.slug && payload.slug !== data.subdomain) {
          setData((prev: any) => ({ ...prev, subdomain: payload.slug }));
        }

        localStorage.setItem('catstays_account', JSON.stringify({
          name: liveData.name,
          email: liveData.email,
          businessName: liveData.businessName,
          createdAt: new Date().toISOString(),
          emailConfirmed: false,
          catteryId: activeCatteryId,
          slug: payload.slug || liveData.subdomain,
          status: 'confirmation_sent',
        }));
        await refreshCattery();
      } else {
        // Save all cattery data to Supabase for already-authenticated owners.
        await handleSaveProgress();
      }

      // Create rooms from the roomTypes defined in booking setup.
      // New unconfirmed users are provisioned server-side because RLS prevents
      // browser writes until the confirmation link is clicked.
      const liveRoomTypes = Array.isArray(liveData.roomTypes) ? liveData.roomTypes : [];
      const livePricingRates = Array.isArray(liveData.pricingRates) ? liveData.pricingRates : [];
      if (cattery?.id && liveRoomTypes.length > 0) {
        const defaultRate = parseFloat(livePricingRates[0]?.price || '30');
        const roomInserts = liveRoomTypes.map((rt: any) => ({
          cattery_id: activeCatteryId,
          name: rt.name,
          type: 'standard',
          description: `Capacity: ${rt.maxCatsPerRoom} cat${Number(rt.maxCatsPerRoom) > 1 ? 's' : ''} per room`,
          price_per_night: defaultRate,
          max_cats: parseInt(rt.maxCatsPerRoom) || 1,
          capacity: parseInt(rt.maxCatsPerRoom) || 1,
          amenities: [],
          is_active: true,
        }));

        // Only insert if no rooms exist yet
        const { data: existingRooms } = await supabase
          .from('rooms')
          .select('id')
          .eq('cattery_id', activeCatteryId);

        if (!existingRooms || existingRooms.length === 0) {
          await supabase.from('rooms').insert(roomInserts);
        }
      }

      // Update subscription status — persist the chosen plan tier.
      if (cattery?.id && activeCatteryId) {
        const trialStatus = `trial_${selectedPlan}`;
        await supabase
          .from('catteries')
          .update({ subscription_status: trialStatus })
          .eq('id', activeCatteryId);
        await refreshCattery();
      }

      localStorage.setItem('catstays_onboarding', JSON.stringify({
        step: 8,
        data: liveData,
        accountCreated: true,
      }));

      // Move to success screen
      setStep(8);
    } catch (error) {
      const message = error instanceof Error
        ? offlinePublishMessage(error.message)
        : 'Something went wrong. Please try again.';
      setPaymentError(message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleGoToDashboard = () => {
    localStorage.removeItem('catstays_onboarding');
    navigate('/staff-dashboard');
  };

  const progress = (step / totalSteps) * 100;

  const stepTitles = [
    'Account',
    'Cattery Setup',
    'Website Builder',
    'Booking Setup',
    'Website Preview',
    'Choose Plan',
    'Publish',
    'Success',
    'Data Import'
  ];

  return (
    <div className="min-h-screen bg-cream pb-8 px-4">
      {/* Back to CatStays Link */}
      <div className="max-w-6xl mx-auto pt-6">
        <Button 
          variant="ghost" 
          onClick={() => {
            if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
              handleSaveProgress();
              navigate('/');
            }
          }}
          className="text-forest/60 hover:text-forest hover:bg-forest/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to CatStays
        </Button>
      </div>

      {/* Floating Save Indicator */}
      {step >= 2 && step < 8 && savedSuccessfully && (
        <div className="fixed top-6 right-6 z-50">
          <Badge className="bg-sage text-white shadow-lg px-4 py-2 rounded-full">
            <Check className="w-4 h-4 mr-2" />
            Progress Saved
          </Badge>
        </div>
      )}

      <div className={`${step === 3 ? 'w-full max-w-[calc(100vw-2rem)] 2xl:max-w-[1900px]' : 'max-w-6xl'} mx-auto py-4`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sage to-terracotta flex items-center justify-center">
              <Cat className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-forest">
              CatStays Setup
            </h1>
          </div>
          <p className="text-lg text-forest/70">
            {stepTitles[step - 1]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-forest">
              Step {step} of {totalSteps}
            </span>
            <span className="text-sm text-forest/60">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
          
          {/* Step Indicators */}
          <div className="flex justify-between mt-6">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const canNavigate = stepNumber === 1 || accountCreated;
              const isCompleted = step > stepNumber;
              const isCurrent = step === stepNumber;
              
              return (
                <button
                  key={index}
                  onClick={() => handleGoToStep(stepNumber)}
                  disabled={!canNavigate}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    isCurrent ? 'opacity-100' : 'opacity-40'
                  } ${canNavigate ? 'cursor-pointer hover:opacity-100' : 'cursor-not-allowed'}`}
                  title={canNavigate ? `Go to ${title}` : 'Complete account creation first'}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? 'bg-sage text-white' 
                        : isCurrent
                        ? 'bg-sage text-white ring-4 ring-sage/20'
                        : canNavigate
                        ? 'bg-cream-dark text-forest/60 hover:bg-cream-darker'
                        : 'bg-cream-dark text-forest/40'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                  </div>
                  <span className="text-xs text-center hidden md:block max-w-[80px] leading-tight">{title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 1: Account Creation */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-sage" />
                </div>
                <CardTitle className="text-3xl font-serif text-forest mb-2">
                  Welcome to CatStays
                </CardTitle>
                <CardDescription className="text-base text-forest/70">
                  Create your account to get started
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {!accountCreated ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-forest mb-2 block">Your Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        className="rounded-xl h-12 text-lg"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-forest mb-2 block">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                        className="rounded-xl h-12 text-lg"
                        autoComplete="email"
                      />
                      <p className="text-xs text-forest/60 mt-2">
                        We'll use this for your login and send the confirmation after setup.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="password" className="text-forest mb-2 block">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a secure password"
                        value={data.password}
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        className="rounded-xl h-12 text-lg"
                        autoComplete="new-password"
                      />
                      <p className="text-xs text-forest/60 mt-2">
                        At least 8 characters
                      </p>
                    </div>

                    <div className="bg-cream-dark rounded-2xl p-6 mt-4">
                      <h4 className="font-semibold text-forest mb-3">Your trial includes:</h4>
                      <ul className="space-y-2 text-sm text-forest/70">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-sage" />
                          <span>Full access to every CatStays feature for 14 days</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-sage" />
                          <span>Premium website, dashboard, customer portal, and marketing tools</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-sage" />
                          <span>Booking, payment, and customer communication setup</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-sage" />
                          <span>No credit card required to start</span>
                        </li>
                      </ul>
                    </div>

                    {createAccountError && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{createAccountError}</span>
                      </div>
                    )}

                    <Button 
                      onClick={handleCreateAccount}
                      disabled={!data.name || !data.email || !data.password || (data.password || '').length < 8 || isSaving}
                      size="lg"
                      className="w-full bg-sage hover:bg-sage-dark text-white rounded-xl py-6 text-lg shadow-lg mt-4"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving Details...
                        </>
                      ) : (
                        <>
                          Continue Setup
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-forest/60 mt-4">
                      Your account is created when you publish your cattery. By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5 text-center py-6 px-4">
                    <div className="relative w-24 h-24 mx-auto mb-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C46A3A]/20 to-[#0A1128]/10 rounded-full blur-xl"></div>
                      <div className="relative w-24 h-24 rounded-full bg-[#F8F7F5] flex items-center justify-center border-2 border-[#C46A3A]/20 shadow-sm">
                        <img src={logoIcon} alt="CatStays" className="w-16 h-16" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-3xl font-serif font-semibold text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        Account ready
                      </h3>
                      <p className="text-lg text-[#0A1128]/70">
                        Keep going while the setup is fresh. We will handle email confirmation at the end.
                      </p>
                    </div>

                    <Button
                      onClick={handleNext}
                      size="lg"
                      className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-7 text-lg shadow-lg"
                    >
                      Continue Setup
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Cattery Details + Import */}
        {step === 2 && !showTemplateSelection && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-8">
                <CardTitle className="text-3xl font-serif text-forest mb-2">
                  Tell us about your cattery
                </CardTitle>
                <CardDescription className="text-lg text-forest/70">
                  This helps us customize your website and booking system
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="businessName" className="text-forest mb-2 block">Cattery Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g., Whiskers Haven Cattery"
                      value={data.businessName}
                      onChange={(e) => setData({ ...data, businessName: e.target.value })}
                      className="rounded-xl h-12 text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-forest mb-2 block">Location *</Label>
                    <AddressAutocomplete
                      id="location"
                      placeholder="Start typing your address..."
                      value={data.location}
                      onChange={(value) => setData({ ...data, location: value, address: data.address || value })}
                      className="rounded-xl h-12 text-lg"
                    />
                    <p className="text-xs text-forest/60 mt-2">
                      Start typing and select from suggestions, or enter manually
                    </p>
                  </div>

                  {/* Website Import Section */}
                  <div className="border-t border-sage/10 pt-6 mt-8">
                    <div className="mb-4">
                      <h4 className="font-semibold text-forest mb-1">Import your existing website (optional)</h4>
                      <p className="text-sm text-forest/70">
                        We'll automatically pull your logo, images, and text
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="websiteUrl" className="text-forest mb-2 block">Website URL</Label>
                      <div className="flex gap-3">
                        <Input
                          id="websiteUrl"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={data.websiteUrl}
                          onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                          className="rounded-xl h-12 text-lg flex-1"
                          disabled={data.isImporting || data.importComplete}
                        />
                        <Button
                          onClick={handleImportWebsite}
                          disabled={!data.websiteUrl || data.isImporting || data.importComplete}
                          className="bg-sage hover:bg-sage-dark text-white rounded-xl px-6"
                        >
                          {data.isImporting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : data.importComplete ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Imported
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Import
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {data.isImporting && (
                      <div className="bg-sage/5 rounded-2xl p-6 mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Loader2 className="w-5 h-5 text-sage animate-spin" />
                          <span className="font-semibold text-forest">Fetching your website...</span>
                        </div>
                        <p className="text-sm text-forest/70">
                          We're reading your site and extracting your business name, description, contact details, and images.
                        </p>
                        <div className="mt-4">
                          <Progress value={66} className="h-2" />
                        </div>
                      </div>
                    )}

                    {data.importError && !data.isImporting && !data.importComplete && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mt-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-red-700">Import failed</p>
                          <p className="text-sm text-red-600 mt-0.5">{data.importError}</p>
                          <button
                            onClick={() => setData(prev => ({ ...prev, importError: '' }))}
                            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                          >
                            Try a different URL or continue without importing
                          </button>
                        </div>
                      </div>
                    )}

                    {data.importComplete && (
                      <div className="bg-[#F8F7F5] border border-[#C46A3A]/30 rounded-2xl p-6 mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Check className="w-5 h-5 text-[#C46A3A]" />
                          <span className="font-semibold text-[#0A1128]">Import Successful!</span>
                        </div>
                        <p className="text-sm text-[#0A1128]/80 mb-3">
                          We've extracted your content and images. Click Continue to customize your website.
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <Button
                            onClick={handleNext}
                            className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl"
                          >
                            Continue to Website Builder
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <button
                            onClick={() => setData(prev => ({
                              ...prev,
                              importComplete: false,
                              importError: '',
                              websiteUrl: '',
                              importSourceUrl: '',
                              sourceUrl: '',
                              sourceHost: '',
                              previewImportRecord: null,
                              previewImportRecordId: '',
                              previewRecordStatus: 'draft',
                              selectedTemplate: null,
                            }))}
                            className="text-sm text-[#0A1128]/60 underline hover:text-[#0A1128]"
                          >
                            Try a different URL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* "Or" divider + Start from scratch option */}
                    <div className="mt-6">
                      <p className="text-center text-forest/70 mb-4">Or</p>
                      <div className="bg-cream-dark rounded-2xl p-6 text-center">
                        <h4 className="font-semibold text-forest mb-2">Start from scratch</h4>
                        <p className="text-sm text-forest/70 mb-4">
                          We'll generate a beautiful website template for you to customize
                        </p>
                        <Button
                          onClick={() => setShowTemplateSelection(true)}
                          variant="outline"
                          className="rounded-xl"
                        >
                          Start from Template
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={!data.businessName || !data.location}
                    className="bg-sage hover:bg-sage-dark text-white rounded-xl px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Template Selection Screen */}
        {step === 2 && showTemplateSelection && (
          <div className="max-w-6xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-8 text-center">
                <CardTitle className="text-4xl font-serif text-forest mb-2">
                  Choose your starting style
                </CardTitle>
                <CardDescription className="text-lg text-forest/70">
                  Pick a design to get started — you can customise everything later
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                {/* Template Grid */}
                <div className="grid md:grid-cols-4 gap-5 mb-8">
                  {templateOptionsForData(data).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`group relative bg-white rounded-2xl border-2 hover:border-[#C46A3A] hover:shadow-xl transition-all duration-300 overflow-hidden text-left ${
                        data.selectedTemplate === template.id ? 'border-[#C46A3A] shadow-xl' : 'border-sage/20'
                      }`}
                    >
                      <div className="aspect-[4/3] bg-[#F8F7F5] p-4">
                        <div className="h-full rounded-xl overflow-hidden border border-[#0A1128]/10 shadow-sm bg-white">
                          <OnboardingTemplateSnapshot template={template.id} data={data} />
                        </div>
                      </div>
                      <div className="p-4 bg-white min-h-[116px]">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-forest">{template.name}</h3>
                          {template.sourceOnly && (
                            <Badge className="bg-[#0A1128] text-white hover:bg-[#0A1128]">Scraped</Badge>
                          )}
                        </div>
                        <p className="text-sm text-forest/70 leading-snug">{template.description}</p>
                      </div>
                      <div className="absolute inset-0 bg-[#C46A3A]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </button>
                  ))}
                </div>

                {/* Reassurance message */}
                <p className="text-center text-sm text-forest/60 italic">
                  You can change this anytime
                </p>

                {/* Back button */}
                <div className="flex justify-center mt-6">
                  <Button
                    onClick={() => setShowTemplateSelection(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Website Builder (Previously Step 4) */}
        {step === 3 && (
          <div className="w-full max-w-none mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-6 sm:p-8">
                <CardTitle className="text-3xl font-serif text-forest mb-2">
                  Design your website
                </CardTitle>
                <CardDescription className="text-lg text-forest/70">
                  Customize your website and see it live
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-5 lg:p-6">
                <WebsiteBuilder
                  data={data}
                  setData={setData}
                  onNext={handleNext}
                  onBack={handleBack}
                  onAIRegenerate={handleAIRegenerate}
                  onChangeTemplate={() => {
                    setShowTemplateSelection(true);
                    setStep(2); // Go back to step 2 to show template selection
                  }}
                  showImportBanner={data.importComplete}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Booking Setup (Previously Step 5) */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-8">
                <CardTitle className="text-3xl font-serif text-forest mb-2">
                  Set your booking rules
                </CardTitle>
                <CardDescription className="text-lg text-forest/70">
                  Configure check-in times and deposit requirements
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <BookingRulesForm data={data} setData={setData} />

                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-sage hover:bg-sage-dark text-white rounded-xl px-8"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 5: Full Website Preview (Previously Step 6) */}
        {step === 5 && (
          <div className="max-w-6xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-white to-cream p-8 text-center">
                <CardTitle className="text-3xl font-serif text-forest mb-2">
                  Preview Your Complete Platform
                </CardTitle>
                <CardDescription className="text-lg text-forest/70">
                  See how your website and dashboard look to customers and staff
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <FullWebsitePreview data={data} />

                <div className="grid md:grid-cols-3 gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setStep(3)}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Edit Colors
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => window.open('/tenant/' + data.subdomain, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Site
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={handleSaveProgress}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save For Later
                  </Button>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-sage hover:bg-sage-dark text-white rounded-xl px-8 shadow-lg"
                  >
                    Looks Great! Publish Website
                    <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Choose Plan */}
        {step === 6 && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-forest to-forest/80 p-12 text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-4xl font-serif mb-4">
                  Choose Your Plan
                </CardTitle>
                <CardDescription className="text-lg text-white/90">
                  Pick the plan that fits your cattery. Start with a 14-day free trial.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-6 rounded-2xl bg-[#F8F7F5] border border-[#C46A3A]/20 p-5 text-center">
                  <p className="text-sm font-semibold text-[#0A1128]">
                    Every trial starts with full Premium access for 14 days. Your selected plan only applies after the trial.
                  </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8 items-stretch">
                  {(Object.entries(planDetails) as Array<[PlanTier, typeof planDetails[PlanTier]]>).map(([tier, plan]) => {
                    const isSelected = selectedPlan === tier;
                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedPlan(tier)}
                        className={`text-left rounded-2xl border-2 p-6 transition-all focus:outline-none relative h-full flex flex-col ${
                          isSelected
                            ? 'border-[#C46A3A] bg-[#C46A3A]/5 ring-2 ring-[#C46A3A]/20'
                            : 'border-forest/10 hover:border-[#C46A3A]/40 bg-white'
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-6">
                            <span className="bg-[#C46A3A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {plan.badge}
                            </span>
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-3 mb-4 mt-1">
                          <div>
                            <span className="text-xl font-semibold text-forest block">{plan.name}</span>
                            <p className="text-sm text-forest/60 mt-2 leading-snug">{plan.description}</p>
                          </div>
                          {isSelected && (
                            <span className="bg-[#C46A3A] text-white text-xs font-semibold px-2 py-1 rounded-full">Selected</span>
                          )}
                        </div>
                        <div className="mb-5">
                          <span className="text-4xl font-bold text-forest">${plan.price}</span>
                          <span className="text-forest/60 ml-1">NZD/month</span>
                        </div>
                        <ul className="space-y-2 text-sm text-forest/80 flex-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-[#C46A3A] flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-4">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-sage to-sage-dark hover:opacity-90 text-white rounded-xl px-8 shadow-lg"
                  >
                    Continue with {planDetails[selectedPlan].name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 7: Publish */}
        {step === 7 && (
          <div className="max-w-3xl mx-auto">
            <Card className="border-sage/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-sage to-sage-dark p-12 text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-4xl font-serif mb-4">
                  Ready to Publish?
                </CardTitle>
                <CardDescription className="text-lg text-white/90">
                  Start your 14-day free trial to make your website live
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-forest mb-2 block">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={data.email}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                      className="rounded-xl h-12 text-lg"
                    />
                    <p className="text-xs text-forest/60 mt-2">
                      We'll send you login details and setup reminders
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subdomain" className="text-forest mb-2 block">Your Website URL *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        placeholder="yourname"
                        value={data.subdomain}
                        onChange={(e) => setData({ ...data, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                        className="rounded-xl h-12 text-lg flex-1"
                      />
                      <span className="text-forest/60">.catstays.app</span>
                    </div>
                  </div>

                  <div className="bg-[#C46A3A]/10 border border-[#C46A3A]/30 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#C46A3A] mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-[#0A1128] mb-2">
                          14-Day Full-Access Trial
                        </h4>
                        <ul className="space-y-1 text-sm text-[#0A1128]/80">
                          <li>✓ Premium features unlocked during the trial</li>
                          <li>✓ No credit card required to publish today</li>
                          <li>✓ Selected plan after trial: {planDetails[selectedPlan].name} (${planDetails[selectedPlan].price} NZD/month)</li>
                          <li>✓ Upgrade or change plans anytime from your dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#0A1128]/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0A1128] flex items-center justify-center shadow-lg flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-[#0A1128] mb-2">
                          Billing and Stripe setup come next
                        </h3>
                        <p className="text-sm text-[#0A1128]/70 leading-relaxed">
                          You can publish the trial now. From the dashboard, connect Stripe for customer payments and add billing before the trial ends.
                        </p>
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800 font-medium">{paymentError}</p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-[#0A1128]/10"></div>
                    </div>
                  </div>

                  <div className="bg-cream-dark rounded-2xl p-6">
                    <h4 className="font-semibold text-forest mb-3">What happens next:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-sm font-bold flex-shrink-0">
                          1
                        </div>
                        <p className="text-sm text-forest/70">Your website goes live immediately at {data.subdomain}.catstays.app</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-sm font-bold flex-shrink-0">
                          2
                        </div>
                        <p className="text-sm text-forest/70">We'll send your email confirmation after setup</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center text-sage text-sm font-bold flex-shrink-0">
                          3
                        </div>
                        <p className="text-sm text-forest/70">Start accepting bookings right away!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button 
                    onClick={handleBack}
                    variant="outline"
                    className="rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handlePublish}
                    disabled={!data.email || !data.subdomain || isProcessingPayment}
                    className="bg-gradient-to-r from-sage to-sage-dark hover:opacity-90 text-white rounded-xl px-12 py-6 text-lg shadow-xl disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5 mr-2" />
                        Publish Website & Start Trial
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 8: Success */}
        {step === 8 && (
          <SuccessScreen 
            subdomain={data.subdomain}
            onGoToWebsite={() => window.open(`https://${data.subdomain}.catstays.app`, '_blank', 'noopener,noreferrer')}
            onContinueToDataImport={() => {
              setStep(9);
              localStorage.setItem('catstays_onboarding', JSON.stringify({
                step: 9,
                data,
                accountCreated,
              }));
            }}
            businessData={data}
            subscriptionTier={selectedPlan}
            trialFullAccess
          />
        )}

        {/* Step 9: Data Import */}
        {step === 9 && (
          <DataImportPrompt
            onImport={() => setShowDataImportFlow(true)}
            onSkip={handleGoToDashboard}
          />
        )}

        {/* Data Import Flow Modal */}
        {showDataImportFlow && (
          <DataImportFlow
            onComplete={handleGoToDashboard}
            onCancel={() => setShowDataImportFlow(false)}
          />
        )}
      </div>
    </div>
  );
}
