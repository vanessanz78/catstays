import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Wand2, Plus, X, ChevronDown, ChevronUp, Check, GripVertical } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

/**
 * Website Editor Panel - Sections ordered to match the generated preview (top to bottom)
 * Order: Hero -> About -> Why Choose story -> Facilities -> Care Approach -> Suites -> Services -> Source sections -> FAQ -> Gallery -> Reviews -> Owner Story -> Contact -> Footer -> Social
 */

interface WebsiteEditorPanelEnhancedProps {
  data: any;
  setData: (data: any) => void;
  onAIRegenerate?: (field: string) => void;
  isRegenerating?: boolean;
}

export function WebsiteEditorPanelEnhanced({ data, setData, onAIRegenerate, isRegenerating }: WebsiteEditorPanelEnhancedProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [draggingServiceIndex, setDraggingServiceIndex] = useState<number | null>(null);
  const sectionTitles = {
    hero: 'Home / Hero',
    care: data.whyChooseUsHeading || 'Why Choose Story',
    careApproach: data.careApproachHeading || 'Care Approach',
    about: data.aboutHeading || 'About',
    facilities: data.facilitiesHeading || 'Facilities',
    suites: data.suitesHeading || 'Suites / Rooms',
    services: data.additionalServicesHeading || 'Extra Care / Services',
    gallery: data.galleryHeading || 'Gallery',
    reviews: data.testimonialsHeading || 'Reviews',
    faq: data.faqHeading || 'Chatbot FAQ Knowledge',
    owner: data.ownerData?.title || 'The People Behind The Care',
    contact: data.contactHeading || 'Contact / Location',
    custom: 'Embedded / Custom Sections',
    social: 'Social Media',
    footer: 'Footer Links',
  };

  const handleAIClick = (field: string) => {
    if (onAIRegenerate) {
      onAIRegenerate(field);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const heroImagePositionX = numberWithFallback(data.heroImageObjectPositionX, 50);
  const heroImagePositionY = numberWithFallback(data.heroImageObjectPositionY, 50);
  const heroImageScale = numberWithFallback(data.heroImageScale, 100);

  // Helper to render icon options
  const renderIconSelect = (value: string, onChange: (value: string) => void, className?: string) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-9 px-3 rounded-lg border border-gray-300 text-sm ${className || ''}`}
    >
      <option value="Shield">🛡️ Shield (Licensed & Insured)</option>
      <option value="Heart">❤️ Heart (Loving Care)</option>
      <option value="Award">🏆 Award (Experience)</option>
      <option value="Star">⭐ Star (Quality)</option>
      <option value="Clock">🕐 Clock (24/7 Care)</option>
      <option value="Camera">📷 Camera (Photo Updates)</option>
      <option value="Scissors">✂️ Scissors (Grooming)</option>
      <option value="Stethoscope">🩺 Stethoscope (Health Care)</option>
      <option value="Zap">⚡ Zap (Energy / Therapy)</option>
      <option value="Car">🚗 Car (Transport)</option>
      <option value="Plane">✈️ Plane (Airport)</option>
      <option value="CalendarCheck">📅 Calendar (Bookings)</option>
      <option value="Home">🏠 Home (Comfortable)</option>
      <option value="Users">👥 Users (Family Run)</option>
      <option value="CheckCircle">✓ Check (Verified)</option>
      <option value="Sparkles">✨ Sparkles (Premium)</option>
    </select>
  );

  const renderAnchorSelect = (value: string, onChange: (value: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 rounded-lg border border-gray-300"
    >
      <option value="">None</option>
      <option value="#booking">Booking strip</option>
      <option value="#about">About</option>
      <option value="#care">Care approach</option>
      <option value="#facilities">Facilities</option>
      <option value="#suites">Suites / rooms</option>
      <option value="#services">Extra care / services</option>
      <option value="#gallery">Gallery</option>
      <option value="#reviews">Reviews</option>
      <option value="#faqs">FAQs</option>
      <option value="#location">Location</option>
      <option value="#virtual-tour">Virtual tour</option>
      <option value="#contact">Contact</option>
    </select>
  );

  const defaultCareFeatures = [
    { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
    { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
    { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' },
  ];
  const careFeatures = data.whyChooseUsFeatures || defaultCareFeatures;

  const setCareFeature = (index: number, updates: Record<string, any>) => {
    const newFeatures = [...careFeatures];
    newFeatures[index] = { ...newFeatures[index], ...updates };
    setData({ ...data, whyChooseUsFeatures: newFeatures });
  };

  const removeCareFeature = (index: number) => {
    setData({ ...data, whyChooseUsFeatures: careFeatures.filter((_: any, i: number) => i !== index) });
  };

  const addCareFeature = () => {
    const newFeatures = [...careFeatures, { icon: 'Shield', title: '', description: '', isNew: true }];
    setData({ ...data, whyChooseUsFeatures: newFeatures });
    toggleExpanded(`why-choose-${newFeatures.length - 1}`);
  };

  const getSuiteBulletPoints = (suite: any) => {
    if (Array.isArray(suite?.features)) return suite.features;
    if (Array.isArray(suite?.amenities)) return suite.amenities;
    return [];
  };

  const setSuiteAt = (index: number, updates: Record<string, any>) => {
    const newSuites = [...(data.suites || [])];
    newSuites[index] = { ...(newSuites[index] || {}), ...updates };
    setData({ ...data, suites: newSuites });
  };

  const setSuiteBulletPoints = (index: number, bulletPoints: string[]) => {
    setSuiteAt(index, {
      features: bulletPoints,
      amenities: bulletPoints,
    });
  };

  const defaultAdditionalServices = [
    { icon: 'Heart', title: 'Extra Comfort Check', price: '$8/day', description: 'Additional wellbeing check during the stay' },
    { icon: 'Stethoscope', title: 'Medication Administration', price: '$10/day', description: 'Careful medication management' },
    { icon: 'Heart', title: 'Special Diet', price: '$15/day', description: 'Custom meal preparation' },
    { icon: 'Clock', title: 'Extended Playtime', price: '$20/day', description: 'Extra one-on-one attention' },
  ];
  const additionalServices = Array.isArray(data.additionalServices) ? data.additionalServices : defaultAdditionalServices;

  const setAdditionalServices = (services: any[]) => {
    setData({ ...data, additionalServices: services });
  };

  const setAdditionalService = (index: number, updates: Record<string, any>) => {
    const newServices = [...additionalServices];
    newServices[index] = { ...(newServices[index] || {}), ...updates };
    setAdditionalServices(newServices);
  };

  const removeAdditionalService = (index: number) => {
    setAdditionalServices(additionalServices.filter((_: any, i: number) => i !== index));
  };

  const moveAdditionalService = (fromIndex: number | null, toIndex: number) => {
    if (fromIndex === null || fromIndex === toIndex || !additionalServices[fromIndex]) return;
    const newServices = [...additionalServices];
    const [moved] = newServices.splice(fromIndex, 1);
    newServices.splice(toIndex, 0, moved);
    setAdditionalServices(newServices);
  };

  const generatedFooterLinks: any[] = [
    { label: 'Home', href: '#home' },
    data.aboutHeading || data.aboutText ? { label: 'About', href: '#about' } : null,
    data.careApproachHeading || data.whyChooseUsHeading ? { label: 'Care', href: '#care' } : null,
    data.facilitiesHeading || data.facilitiesImage ? { label: 'Facilities', href: '#facilities' } : null,
    Array.isArray(data.suites) && data.suites.length ? { label: 'Suites', href: '#suites' } : null,
    Array.isArray(data.additionalServices) && data.additionalServices.length ? { label: 'Extra Care', href: '#services' } : null,
    Array.isArray(data.galleryImages) && data.galleryImages.length ? { label: 'Gallery', href: '#gallery' } : null,
    Array.isArray(data.testimonials) && data.testimonials.some((review: any) => review?.showOnWebsite !== false) ? { label: 'Reviews', href: '#reviews' } : null,
    ...(Array.isArray(data.customSections)
      ? data.customSections
          .filter((section: any) => section?.heading || section?.title)
          .map((section: any) => ({
            label: section.heading || section.title,
            href: `#${String(section.id || section.heading || section.title || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`,
          }))
      : []),
    Array.isArray(data.faqs) && data.faqs.some((faq: any) => faq?.showOnWebsite !== false) ? { label: 'FAQs', href: '#faqs' } : null,
    { label: 'Location', href: '#location' },
    data.virtualTourUrl || data.locationData?.virtualTourUrl ? { label: 'Virtual Tour', href: '#virtual-tour' } : null,
    { label: 'Contact', href: '#contact' },
  ].filter(Boolean);
  const footerLinks: any[] = Array.isArray(data.footerLinks) && data.footerLinks.length ? data.footerLinks : generatedFooterLinks;

  const setFooterLink = (index: number, updates: Record<string, string>) => {
    const links = [...footerLinks];
    links[index] = { ...(links[index] || {}), ...updates };
    setData({ ...data, footerLinks: links });
  };

  const renderCarePointEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Care Points</Label>
        <Button
          size="sm"
          variant="outline"
          onClick={addCareFeature}
          className="text-xs h-7"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Feature
        </Button>
      </div>

      {careFeatures.map((feature: any, index: number) => {
        const isExpanded = expandedItems[`why-choose-${index}`] || feature.isNew;
        const isComplete = feature.title && feature.description;

        return (
          <div key={index} className="border rounded-lg bg-gray-50">
            {!isExpanded ? (
              <div className="flex items-center justify-between p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.title || `Feature ${index + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(`why-choose-${index}`)}
                    className="h-7 w-7 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCareFeature(index)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                  <div className="flex items-center gap-1">
                    {feature.isNew && isComplete && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setCareFeature(index, { isNew: false });
                          toggleExpanded(`why-choose-${index}`);
                        }}
                        className="h-7 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(`why-choose-${index}`)}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCareFeature(index)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Icon</Label>
                  {renderIconSelect(feature.icon || 'Shield', (value) => setCareFeature(index, { icon: value }))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Title</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIClick(`whyChooseUsFeature${index}Title`)}
                      disabled={isRegenerating}
                      className="text-xs h-6"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Button>
                  </div>
                  <Input
                    value={feature.title || ''}
                    onChange={(e) => setCareFeature(index, { title: e.target.value })}
                    placeholder="Feature title"
                    className="h-9 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Description</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIClick(`whyChooseUsFeature${index}Description`)}
                      disabled={isRegenerating}
                      className="text-xs h-6"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Button>
                  </div>
                  <Input
                    value={feature.description || ''}
                    onChange={(e) => setCareFeature(index, { description: e.target.value })}
                    placeholder="Feature description"
                    className="h-9 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <Accordion type="multiple" defaultValue={['hero']} className="flex flex-col gap-2">
      {/* HERO SECTION */}
      <AccordionItem value="hero" className="order-1 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.hero}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Hero Eyebrow</Label>
            <Input
              value={data.heroEyebrow ?? 'A home away from home'}
              onChange={(e) => setData({ ...data, heroEyebrow: e.target.value })}
              placeholder="A home away from home"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hero Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('heroHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.heroHeading || ''}
              onChange={(e) => setData({ ...data, heroHeading: e.target.value })}
              placeholder="Welcome to Our Cattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Hero Subheading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('heroSubheading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.heroSubheading || ''}
              onChange={(e) => setData({ ...data, heroSubheading: e.target.value })}
              placeholder="Premium care for your feline friends"
              className="rounded-lg"
              rows={2}
            />
          </div>

          <ImageUpload
            label="Hero Image"
            value={data.heroImage || ''}
            onChange={(url, meta) => setData({
              ...data,
              heroImage: url,
              heroImageOwned: meta?.owned ?? data.heroImageOwned,
              heroImageSourceUrl: meta?.sourceUrl ?? data.heroImageSourceUrl,
              heroImageStoragePath: meta?.storagePath ?? data.heroImageStoragePath,
            })}
          />

          <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <HeroImageControl
              label="Horizontal"
              value={heroImagePositionX}
              min={0}
              max={100}
              onChange={(value) => setData({ ...data, heroImageObjectPositionX: value })}
            />
            <HeroImageControl
              label="Vertical"
              value={heroImagePositionY}
              min={0}
              max={100}
              onChange={(value) => setData({ ...data, heroImageObjectPositionY: value })}
            />
            <HeroImageControl
              label="Zoom"
              value={heroImageScale}
              min={100}
              max={180}
              onChange={(value) => setData({ ...data, heroImageScale: value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Button Text</Label>
              <Input
                value={data.heroPrimaryCtaText ?? 'Discover Our Suites'}
                onChange={(e) => setData({ ...data, heroPrimaryCtaText: e.target.value })}
                placeholder="Discover Our Suites"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Button Link</Label>
              {renderAnchorSelect(data.heroPrimaryCtaHref ?? '#suites', (value) => setData({ ...data, heroPrimaryCtaHref: value }))}
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Text</Label>
              <Input
                value={data.heroSecondaryCtaText ?? 'Our Care Approach'}
                onChange={(e) => setData({ ...data, heroSecondaryCtaText: e.target.value })}
                placeholder="Our Care Approach"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Link</Label>
              {renderAnchorSelect(data.heroSecondaryCtaHref ?? '#care', (value) => setData({ ...data, heroSecondaryCtaHref: value }))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. WHY CHOOSE STORY SECTION */}
      <AccordionItem value="why-choose-us" className="order-3 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.care}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.whyChooseEyebrow ?? 'Why choose us'}
              onChange={(e) => setData({ ...data, whyChooseEyebrow: e.target.value })}
              placeholder="Why choose us"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('whyChooseUsHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.whyChooseUsHeading || 'Why Choose Us'}
              onChange={(e) => setData({ ...data, whyChooseUsHeading: e.target.value })}
              placeholder="Why Choose Us"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Copy</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('whyChooseUsText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.whyChooseUsText || ''}
              onChange={(e) => setData({ ...data, whyChooseUsText: e.target.value })}
              placeholder="Tell visitors why this cattery is a good fit"
              className="rounded-lg"
              rows={4}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 3. ABOUT SECTION */}
      <AccordionItem value="about" className="order-2 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.about}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>About Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('aboutHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.aboutHeading || 'Our Story'}
              onChange={(e) => setData({ ...data, aboutHeading: e.target.value })}
              placeholder="Our Story"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>About Text</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('aboutText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.aboutText || ''}
              onChange={(e) => setData({ ...data, aboutText: e.target.value })}
              placeholder="Tell your story..."
              className="rounded-lg"
              rows={5}
            />
          </div>

          <ImageUpload
            label="About Image"
            value={data.aboutImage || ''}
            onChange={(url) => setData({ ...data, aboutImage: url })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 4. FACILITIES SECTION */}
      <AccordionItem value="facilities" className="order-4 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.facilities}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.facilitiesEyebrow ?? 'Premium accommodation'}
              onChange={(e) => setData({ ...data, facilitiesEyebrow: e.target.value })}
              placeholder="Premium accommodation"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Facilities Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('facilitiesHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.facilitiesHeading || 'Our Facilities'}
              onChange={(e) => setData({ ...data, facilitiesHeading: e.target.value })}
              placeholder="Our Facilities"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Facilities Text</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('facilitiesText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.facilitiesText || ''}
              onChange={(e) => setData({ ...data, facilitiesText: e.target.value })}
              placeholder="Describe your facilities..."
              className="rounded-lg"
              rows={4}
            />
          </div>

          <ImageUpload
            label="Facilities Image"
            value={data.facilitiesImage || ''}
            onChange={(url) => setData({ ...data, facilitiesImage: url })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 5. CARE APPROACH CARDS */}
      <AccordionItem value="care-approach" className="order-5 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.careApproach}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.careApproachEyebrow ?? 'Care Approach'}
              onChange={(e) => setData({ ...data, careApproachEyebrow: e.target.value })}
              placeholder="Care Approach"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('careApproachHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.careApproachHeading || data.whyChooseUsHeading || 'Why choose us'}
              onChange={(e) => setData({ ...data, careApproachHeading: e.target.value })}
              placeholder="Why choose us"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Copy</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('careApproachText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.careApproachText ?? data.whyChooseUsText ?? ''}
              onChange={(e) => setData({ ...data, careApproachText: e.target.value })}
              placeholder="Describe the care approach these cards support"
              className="rounded-lg"
              rows={4}
            />
          </div>

          {renderCarePointEditor()}
        </AccordionContent>
      </AccordionItem>

      {/* 6. SUITES SECTION */}
      <AccordionItem value="our-suites" className="order-6 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.suites}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('suitesHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.suitesHeading || 'Our Suites'}
              onChange={(e) => setData({ ...data, suitesHeading: e.target.value })}
              placeholder="Our Suites"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Suite Types</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newSuites = [...(data.suites || []), { name: '', description: '', price: '', image: '', features: [], amenities: [], isNew: true }];
                  setData({ ...data, suites: newSuites });
                  toggleExpanded(`suite-${newSuites.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Suite
              </Button>
            </div>

            {(data.suites || []).map((suite: any, index: number) => {
              const isExpanded = expandedItems[`suite-${index}`] || suite.isNew;
              const isComplete = suite.name && suite.description;
              const suiteBulletPoints = getSuiteBulletPoints(suite);

              return (
                <div key={index} className="border rounded-lg bg-gray-50">
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {suite.image && (
                          <img
                            src={suite.image}
                            alt={suite.name}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-700 block truncate">
                            {suite.name || `Suite ${index + 1}`}
                          </span>
                          {suite.price && (
                            <span className="text-xs text-gray-500 block truncate">
                              {suite.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(`suite-${index}`)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newSuites = (data.suites || []).filter((_: any, i: number) => i !== index);
                            setData({ ...data, suites: newSuites });
                          }}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Suite {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {suite.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const newSuites = [...(data.suites || [])];
                                newSuites[index] = { ...newSuites[index], isNew: false };
                                setData({ ...data, suites: newSuites });
                                toggleExpanded(`suite-${index}`);
                              }}
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpanded(`suite-${index}`)}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSuites = (data.suites || []).filter((_: any, i: number) => i !== index);
                              setData({ ...data, suites: newSuites });
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Suite Name</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`suite${index}Name`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Input
                          value={suite.name || ''}
                          onChange={(e) => {
                            setSuiteAt(index, { name: e.target.value });
                          }}
                          placeholder="e.g., Standard Suite"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Description</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`suite${index}Description`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Textarea
                          value={suite.description || ''}
                          onChange={(e) => {
                            setSuiteAt(index, { description: e.target.value });
                          }}
                          placeholder="Suite description"
                          className="rounded-lg text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Price (Optional)</Label>
                        <Input
                          value={suite.price || ''}
                          onChange={(e) => {
                            setSuiteAt(index, { price: e.target.value });
                          }}
                          placeholder="e.g., $50/night"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <ImageUpload
                        label="Suite Image"
                        value={suite.image || ''}
                        onChange={(url, meta) => {
                          setSuiteAt(index, {
                            image: url,
                            imageOwned: meta?.owned,
                            imageSourceUrl: meta?.sourceUrl,
                            imageStoragePath: meta?.storagePath,
                          });
                        }}
                      />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Bullet Points</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSuiteBulletPoints(index, [...suiteBulletPoints, ''])}
                            className="h-7 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Bullet
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {suiteBulletPoints.map((feature: string, featureIndex: number) => (
                            <div key={featureIndex} className="flex items-center gap-2">
                              <Input
                                value={feature || ''}
                                onChange={(e) => {
                                  const nextBulletPoints = [...suiteBulletPoints];
                                  nextBulletPoints[featureIndex] = e.target.value;
                                  setSuiteBulletPoints(index, nextBulletPoints);
                                }}
                                placeholder="e.g., Daily care"
                                className="h-9 rounded-lg text-sm"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const nextBulletPoints = suiteBulletPoints.filter((_: string, i: number) => i !== featureIndex);
                                  setSuiteBulletPoints(index, nextBulletPoints);
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 7. EXTRA CARE / SERVICES SECTION */}
      <AccordionItem value="additional-services" className="order-7 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.services}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.additionalServicesEyebrow ?? 'Additional Services'}
              onChange={(e) => setData({ ...data, additionalServicesEyebrow: e.target.value })}
              placeholder="Additional Services"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('additionalServicesHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.additionalServicesHeading || 'Our Services'}
              onChange={(e) => setData({ ...data, additionalServicesHeading: e.target.value })}
              placeholder="Our Services"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Services</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newServices = [...additionalServices, { icon: 'Heart', title: '', description: '', price: '', isNew: true }];
                  setAdditionalServices(newServices);
                  toggleExpanded(`additional-${newServices.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Service
              </Button>
            </div>

            {additionalServices.map((service: any, index: number) => {
              const isExpanded = expandedItems[`additional-${index}`] || service.isNew;
              const isComplete = service.title && service.description;

              return (
                <div
                  key={index}
                  draggable={!isExpanded}
                  onDragStart={(event) => {
                    setDraggingServiceIndex(index);
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    moveAdditionalService(draggingServiceIndex, index);
                    setDraggingServiceIndex(null);
                  }}
                  onDragEnd={() => setDraggingServiceIndex(null)}
                  className={`border rounded-lg bg-gray-50 ${draggingServiceIndex === index ? 'opacity-60' : ''}`}
                >
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {service.title || `Service ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(`additional-${index}`)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAdditionalService(index)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Service {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {service.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setAdditionalService(index, { isNew: false });
                                toggleExpanded(`additional-${index}`);
                              }}
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpanded(`additional-${index}`)}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAdditionalService(index)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Icon</Label>
                        {renderIconSelect(service.icon || 'Heart', (value) => setAdditionalService(index, { icon: value }))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Service Title</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`additionalService${index}Title`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Input
                          value={service.title || ''}
                          onChange={(e) => setAdditionalService(index, { title: e.target.value })}
                          placeholder="e.g., Extra Comfort Check"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Description</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`additionalService${index}Description`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Textarea
                          value={service.description || ''}
                          onChange={(e) => setAdditionalService(index, { description: e.target.value })}
                          placeholder="Service description"
                          className="rounded-lg text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Price (Optional)</Label>
                        <Input
                          value={service.price || ''}
                          onChange={(e) => setAdditionalService(index, { price: e.target.value })}
                          placeholder="e.g., $25"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 10. GALLERY SECTION */}
      <AccordionItem value="gallery" className="order-10 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.gallery}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('galleryHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.galleryHeading || 'Gallery'}
              onChange={(e) => setData({ ...data, galleryHeading: e.target.value })}
              placeholder="Gallery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Gallery Images</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const images = data.galleryImages || [];
                  setData({ ...data, galleryImages: [...images, ''] });
                }}
                className="text-xs h-7"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Image
              </Button>
            </div>

            {(Array.isArray(data.galleryImages) ? data.galleryImages : []).map((img: string, index: number) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <ImageUpload
                    value={img}
                    onChange={(url) => {
                      const images = [...(data.galleryImages || [])];
                      images[index] = url;
                      setData({ ...data, galleryImages: images });
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const images = (data.galleryImages || []).filter((_: any, i: number) => i !== index);
                    setData({ ...data, galleryImages: images });
                  }}
                  className="mt-8 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 11. REVIEWS SECTION */}
      <AccordionItem value="testimonials" className="order-11 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.reviews}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.testimonialsEyebrow || 'Reviews'}
              onChange={(e) => setData({ ...data, testimonialsEyebrow: e.target.value })}
              placeholder="Reviews"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('testimonialsHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.testimonialsHeading || 'What Our Clients Say'}
              onChange={(e) => setData({ ...data, testimonialsHeading: e.target.value })}
              placeholder="What Our Clients Say"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Reviews</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const testimonials = data.testimonials || [];
                  setData({ ...data, testimonials: [...testimonials, { name: '', text: '', rating: 5 }] });
                }}
                className="text-xs h-7"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Testimonial
              </Button>
            </div>

            {(Array.isArray(data.testimonials) ? data.testimonials : []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                No reviews captured yet.
              </p>
            ) : null}

            {(Array.isArray(data.testimonials) ? data.testimonials : []).map((testimonial: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Testimonial {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const testimonials = (data.testimonials || []).filter((_: any, i: number) => i !== index);
                      setData({ ...data, testimonials: testimonials });
                    }}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={testimonial.showOnWebsite !== false}
                    onChange={(e) => {
                      const testimonials = [...(data.testimonials || [])];
                      testimonials[index] = { ...testimonials[index], showOnWebsite: e.target.checked };
                      setData({ ...data, testimonials });
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Show on website
                </label>

                <div className="space-y-2">
                  <Label className="text-xs">Customer Name</Label>
                  <Input
                    value={testimonial.name || ''}
                    onChange={(e) => {
                      const testimonials = [...(data.testimonials || [])];
                      testimonials[index] = { ...testimonials[index], name: e.target.value };
                      setData({ ...data, testimonials: testimonials });
                    }}
                    placeholder="John Doe"
                    className="h-9 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Testimonial</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIClick(`testimonial${index}Text`)}
                      disabled={isRegenerating}
                      className="text-xs h-6"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Button>
                  </div>
                  <Textarea
                    value={testimonial.text || ''}
                    onChange={(e) => {
                      const testimonials = [...(data.testimonials || [])];
                      testimonials[index] = { ...testimonials[index], text: e.target.value };
                      setData({ ...data, testimonials: testimonials });
                    }}
                    placeholder="Great experience..."
                    className="rounded-lg text-sm"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Rating</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          const testimonials = [...(data.testimonials || [])];
                          testimonials[index] = { ...testimonials[index], rating: star };
                          setData({ ...data, testimonials: testimonials });
                        }}
                        className="text-2xl transition-colors"
                      >
                        <span style={{ color: star <= (testimonial.rating || 5) ? '#F59E0B' : '#D1D5DB' }}>★</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 9. CHATBOT FAQ KNOWLEDGE */}
      <AccordionItem value="faq" className="order-[9] border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.faq}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Section Eyebrow</Label>
            <Input
              value={data.faqEyebrow || 'Questions and answers'}
              onChange={(e) => setData({ ...data, faqEyebrow: e.target.value })}
              placeholder="Questions and answers"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Section Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('faqHeading')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.faqHeading || 'Frequently Asked Questions'}
              onChange={(e) => setData({ ...data, faqHeading: e.target.value })}
              placeholder="Frequently Asked Questions"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Questions</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const faqs = data.faqs || [];
                  setData({ ...data, faqs: [...faqs, { question: '', answer: '' }] });
                }}
                className="text-xs h-7"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>

            {(Array.isArray(data.faqs) ? data.faqs : []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                No FAQs captured yet.
              </p>
            ) : null}

            {(Array.isArray(data.faqs) ? data.faqs : []).map((faq: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const faqs = (data.faqs || []).filter((_: any, i: number) => i !== index);
                      setData({ ...data, faqs: faqs });
                    }}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={faq.showOnWebsite !== false}
                    onChange={(e) => {
                      const faqs = [...(data.faqs || [])];
                      faqs[index] = { ...faqs[index], showOnWebsite: e.target.checked };
                      setData({ ...data, faqs });
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Show on website and chatbot
                </label>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Question</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIClick(`faq${index}Question`)}
                      disabled={isRegenerating}
                      className="text-xs h-6"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Button>
                  </div>
                  <Input
                    value={faq.question || ''}
                    onChange={(e) => {
                      const faqs = [...(data.faqs || [])];
                      faqs[index] = { ...faqs[index], question: e.target.value };
                      setData({ ...data, faqs: faqs });
                    }}
                    placeholder="What time is check-in?"
                    className="h-9 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Answer</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIClick(`faq${index}Answer`)}
                      disabled={isRegenerating}
                      className="text-xs h-6"
                    >
                      <Wand2 className="w-3 h-3 mr-1" />
                      AI
                    </Button>
                  </div>
                  <Textarea
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const faqs = [...(data.faqs || [])];
                      faqs[index] = { ...faqs[index], answer: e.target.value };
                      setData({ ...data, faqs: faqs });
                    }}
                    placeholder="Check-in is at 9am..."
                    className="rounded-lg text-sm"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 12. OWNER STORY SECTION */}
      <AccordionItem value="owner-story" className="order-12 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.owner}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Owner Story Heading</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('ownerTitle')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Input
              value={data.ownerData?.title || ''}
              onChange={(e) => setData({ ...data, ownerData: { ...(data.ownerData || {}), title: e.target.value } })}
              placeholder="About the people behind the care"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Owner Story Text</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAIClick('ownerText')}
                disabled={isRegenerating}
                className="text-xs h-7"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                AI
              </Button>
            </div>
            <Textarea
              value={data.ownerData?.text || ''}
              onChange={(e) => setData({ ...data, ownerData: { ...(data.ownerData || {}), text: e.target.value } })}
              placeholder="Tell the owner story..."
              className="rounded-lg"
              rows={6}
            />
          </div>

          <ImageUpload
            label="Owner Image"
            value={data.ownerData?.image || ''}
            onChange={(url) => setData({ ...data, ownerData: { ...(data.ownerData || {}), image: url } })}
          />
        </AccordionContent>
      </AccordionItem>

      {/* 13. CONTACT / LOCATION SECTION */}
      <AccordionItem value="contact" className="order-13 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.contact}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Business Address</Label>
            <Input
              value={data.address || ''}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="123 Cat Lane, Feline City, FC 12345"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={data.phone || ''}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              value={data.email || ''}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              placeholder="hello@cattery.com"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Hours of Operation</Label>
            <Textarea
              value={data.hours || ''}
              onChange={(e) => setData({
                ...data,
                hours: e.target.value,
                contactData: { ...(data.contactData || {}), hours: e.target.value },
              })}
              placeholder="Mon-Fri: 9am-6pm&#10;Sat-Sun: 10am-4pm"
              className="rounded-lg"
              rows={3}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 8. CUSTOM SECTIONS */}
      <AccordionItem value="custom-sections" className="order-8 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.custom}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="space-y-2">
            <Label>Virtual Tour Embed URL</Label>
            <Input
              value={data.virtualTourUrl || data.locationData?.virtualTourUrl || ''}
              onChange={(e) => setData({
                ...data,
                virtualTourUrl: e.target.value,
                locationData: { ...(data.locationData || {}), virtualTourUrl: e.target.value },
              })}
              placeholder="https://www.google.com/maps/embed?..."
              className="rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Add your own sections</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newSections = [...(data.customSections || []), { heading: '', description: '', media: '', isNew: true }];
                  setData({ ...data, customSections: newSections });
                  toggleExpanded(`custom-${newSections.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Section
              </Button>
            </div>

            {(data.customSections || []).map((section: any, index: number) => {
              const isExpanded = expandedItems[`custom-${index}`] || section.isNew;
              const isComplete = section.heading && section.description;

              return (
                <div key={index} className="border rounded-lg bg-gray-50">
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-700">
                          {section.heading || `Section ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(`custom-${index}`)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newSections = (data.customSections || []).filter((_: any, i: number) => i !== index);
                            setData({ ...data, customSections: newSections });
                          }}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Section {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {section.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const newSections = [...(data.customSections || [])];
                                newSections[index] = { ...newSections[index], isNew: false };
                                setData({ ...data, customSections: newSections });
                                toggleExpanded(`custom-${index}`);
                              }}
                              className="h-7 text-xs bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleExpanded(`custom-${index}`)}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newSections = (data.customSections || []).filter((_: any, i: number) => i !== index);
                              setData({ ...data, customSections: newSections });
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Heading</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`customSection${index}Heading`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Input
                          value={section.heading || ''}
                          onChange={(e) => {
                            const newSections = [...(data.customSections || [])];
                            newSections[index] = { ...newSections[index], heading: e.target.value };
                            setData({ ...data, customSections: newSections });
                          }}
                          placeholder="e.g., Special Offers"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Description</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`customSection${index}Description`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Textarea
                          value={section.description || ''}
                          onChange={(e) => {
                            const newSections = [...(data.customSections || [])];
                            newSections[index] = { ...newSections[index], description: e.target.value };
                            setData({ ...data, customSections: newSections });
                          }}
                          placeholder="Describe this section..."
                          className="rounded-lg text-sm"
                          rows={3}
                        />
                      </div>

                      <ImageUpload
                        label="Photo/Video"
                        value={section.media || ''}
                        onChange={(url) => {
                          const newSections = [...(data.customSections || [])];
                          newSections[index] = { ...newSections[index], media: url };
                          setData({ ...data, customSections: newSections });
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 15. SOCIAL MEDIA */}
      <AccordionItem value="social-media" className="order-[15] border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.social}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <p className="text-sm text-gray-600 mb-4">Add your social media links to display icons in the footer</p>

          <div className="space-y-2">
            <Label>Facebook URL</Label>
            <Input
              value={data.facebookUrl || ''}
              onChange={(e) => setData({ ...data, facebookUrl: e.target.value })}
              placeholder="https://facebook.com/yourcattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>Instagram URL</Label>
            <Input
              value={data.instagramUrl || ''}
              onChange={(e) => setData({ ...data, instagramUrl: e.target.value })}
              placeholder="https://instagram.com/yourcattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>TikTok URL</Label>
            <Input
              value={data.tiktokUrl || ''}
              onChange={(e) => setData({ ...data, tiktokUrl: e.target.value })}
              placeholder="https://tiktok.com/@yourcattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>YouTube URL</Label>
            <Input
              value={data.youtubeUrl || ''}
              onChange={(e) => setData({ ...data, youtubeUrl: e.target.value })}
              placeholder="https://youtube.com/@yourcattery"
              className="rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <Label>X (Twitter) URL</Label>
            <Input
              value={data.xUrl || ''}
              onChange={(e) => setData({ ...data, xUrl: e.target.value })}
              placeholder="https://x.com/yourcattery"
              className="rounded-lg"
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 14. FOOTER */}
      <AccordionItem value="footer" className="order-[14] border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.footer}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <p className="text-sm text-gray-600 mb-4">
            Footer links are generated from the real sections on this page, so visitors do not land on broken or misspelled anchors.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Quick Links</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setData({
                  ...data,
                  footerLinks: [...footerLinks, { label: '', href: '#home' }],
                })}
                className="text-xs h-7"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3">
              {footerLinks.map((link: any, index: number) => (
                <div key={`${link.label}-${link.href}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={link.label || ''}
                        onChange={(e) => setFooterLink(index, { label: e.target.value })}
                        placeholder="FAQs"
                        className="h-9 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Section</Label>
                      {renderAnchorSelect(link.href || '#home', (value) => setFooterLink(index, { href: value }))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setData({ ...data, footerLinks: footerLinks.filter((_: any, i: number) => i !== index) })}
                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Footer Summary</Label>
            <Textarea
              value={data.footerAbout || data.aboutText || ''}
              onChange={(e) => setData({ ...data, footerAbout: e.target.value })}
              placeholder="Short footer introduction"
              className="rounded-lg"
              rows={3}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function numberWithFallback(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function HeroImageControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-600">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        className="w-full accent-[#C46A3A]"
      />
    </label>
  );
}
