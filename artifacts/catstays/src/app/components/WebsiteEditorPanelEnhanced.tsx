import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Wand2, Plus, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

/**
 * Website Editor Panel - Sections ordered to match the generated preview (top to bottom)
 * Order: Hero -> About -> Care Approach -> Facilities -> Owner Story -> Gallery -> Suites -> Services -> Reviews -> Contact -> Footer -> Chatbot
 */

interface WebsiteEditorPanelEnhancedProps {
  data: any;
  setData: (data: any) => void;
  onAIRegenerate?: (field: string) => void;
  isRegenerating?: boolean;
}

export function WebsiteEditorPanelEnhanced({ data, setData, onAIRegenerate, isRegenerating }: WebsiteEditorPanelEnhancedProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const sectionTitles = {
    hero: 'Home / Hero',
    care: data.whyChooseUsHeading || 'Care Approach',
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
      <option value="#booking">Booking strip</option>
      <option value="#about">About</option>
      <option value="#care">Care approach</option>
      <option value="#facilities">Facilities</option>
      <option value="#suites">Suites / rooms</option>
      <option value="#services">Extra care / services</option>
      <option value="#gallery">Gallery</option>
      <option value="#reviews">Reviews</option>
      <option value="#location">Location</option>
      <option value="#virtual-tour">Virtual tour</option>
      <option value="#contact">Contact</option>
    </select>
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
            onChange={(url) => setData({ ...data, heroImage: url })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary Button Text</Label>
              <Input
                value={data.heroPrimaryCtaText || 'Discover Our Suites'}
                onChange={(e) => setData({ ...data, heroPrimaryCtaText: e.target.value })}
                placeholder="Discover Our Suites"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Primary Button Link</Label>
              {renderAnchorSelect(data.heroPrimaryCtaHref || '#suites', (value) => setData({ ...data, heroPrimaryCtaHref: value }))}
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Text</Label>
              <Input
                value={data.heroSecondaryCtaText || 'Our Care Approach'}
                onChange={(e) => setData({ ...data, heroSecondaryCtaText: e.target.value })}
                placeholder="Our Care Approach"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary Button Link</Label>
              {renderAnchorSelect(data.heroSecondaryCtaHref || '#care', (value) => setData({ ...data, heroSecondaryCtaHref: value }))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 2. CARE APPROACH SECTION */}
      <AccordionItem value="why-choose-us" className="order-3 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.care}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Care Points</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newFeatures = [...(data.whyChooseUsFeatures || [
                    { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                    { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                    { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                  ]), { icon: 'Shield', title: '', description: '', isNew: true }];
                  setData({ ...data, whyChooseUsFeatures: newFeatures });
                  toggleExpanded(`why-choose-${newFeatures.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Feature
              </Button>
            </div>

            {(data.whyChooseUsFeatures || [
              { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
              { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
              { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
            ]).map((feature: any, index: number) => {
              const isExpanded = expandedItems[`why-choose-${index}`] || feature.isNew;
              const isComplete = feature.title && feature.description;

              return (
                <div key={index} className="border rounded-lg bg-gray-50">
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
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
                          onClick={() => {
                            const newFeatures = (data.whyChooseUsFeatures || [
                              { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                              { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                              { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                            ]).filter((_: any, i: number) => i !== index);
                            setData({ ...data, whyChooseUsFeatures: newFeatures });
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
                        <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {feature.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const newFeatures = [...(data.whyChooseUsFeatures || [])];
                                newFeatures[index] = { ...newFeatures[index], isNew: false };
                                setData({ ...data, whyChooseUsFeatures: newFeatures });
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
                            onClick={() => {
                              const newFeatures = (data.whyChooseUsFeatures || [
                                { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                                { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                                { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                              ]).filter((_: any, i: number) => i !== index);
                              setData({ ...data, whyChooseUsFeatures: newFeatures });
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Icon</Label>
                        {renderIconSelect(feature.icon || 'Shield', (value) => {
                          const newFeatures = [...(data.whyChooseUsFeatures || [
                            { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                            { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                            { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                          ])];
                          newFeatures[index] = { ...newFeatures[index], icon: value };
                          setData({ ...data, whyChooseUsFeatures: newFeatures });
                        })}
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
                          onChange={(e) => {
                            const newFeatures = [...(data.whyChooseUsFeatures || [
                              { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                              { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                              { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                            ])];
                            newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                            setData({ ...data, whyChooseUsFeatures: newFeatures });
                          }}
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
                          onChange={(e) => {
                            const newFeatures = [...(data.whyChooseUsFeatures || [
                              { icon: 'Shield', title: 'Licensed & Insured', description: 'Fully certified cattery' },
                              { icon: 'Heart', title: 'Loving Care', description: 'Individual attention daily' },
                              { icon: 'Award', title: '15+ Years Experience', description: 'Trusted by thousands' }
                            ])];
                            newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                            setData({ ...data, whyChooseUsFeatures: newFeatures });
                          }}
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

          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <Label>Facility Features</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newFeatures = [...(data.facilityFeatures || []), { title: '', description: '', isNew: true }];
                  setData({ ...data, facilityFeatures: newFeatures });
                  toggleExpanded(`facility-${newFeatures.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Feature
              </Button>
            </div>

            {(data.facilityFeatures || []).map((feature: any, index: number) => {
              const isExpanded = expandedItems[`facility-${index}`] || feature.isNew;
              const isComplete = feature.title && feature.description;

              return (
                <div key={index} className="border rounded-lg bg-gray-50">
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-700">
                          {feature.title || `Feature ${index + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpanded(`facility-${index}`)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newFeatures = (data.facilityFeatures || []).filter((_: any, i: number) => i !== index);
                            setData({ ...data, facilityFeatures: newFeatures });
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
                        <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {feature.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const newFeatures = [...(data.facilityFeatures || [])];
                                newFeatures[index] = { ...newFeatures[index], isNew: false };
                                setData({ ...data, facilityFeatures: newFeatures });
                                toggleExpanded(`facility-${index}`);
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
                            onClick={() => toggleExpanded(`facility-${index}`)}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newFeatures = (data.facilityFeatures || []).filter((_: any, i: number) => i !== index);
                              setData({ ...data, facilityFeatures: newFeatures });
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Feature Title</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`facilityFeature${index}Title`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Input
                          value={feature.title || ''}
                          onChange={(e) => {
                            const newFeatures = [...(data.facilityFeatures || [])];
                            newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                            setData({ ...data, facilityFeatures: newFeatures });
                          }}
                          placeholder="e.g., Climate Control"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Description</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAIClick(`facilityFeature${index}Description`)}
                            disabled={isRegenerating}
                            className="text-xs h-6"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            AI
                          </Button>
                        </div>
                        <Input
                          value={feature.description || ''}
                          onChange={(e) => {
                            const newFeatures = [...(data.facilityFeatures || [])];
                            newFeatures[index] = { ...newFeatures[index], description: e.target.value };
                            setData({ ...data, facilityFeatures: newFeatures });
                          }}
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
        </AccordionContent>
      </AccordionItem>

      {/* 5. SUITES SECTION */}
      <AccordionItem value="our-suites" className="order-7 border rounded-xl px-4 bg-white">
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
                  const newSuites = [...(data.suites || []), { name: '', description: '', price: '', image: '', isNew: true }];
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
                            const newSuites = [...(data.suites || [])];
                            newSuites[index] = { ...newSuites[index], name: e.target.value };
                            setData({ ...data, suites: newSuites });
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
                            const newSuites = [...(data.suites || [])];
                            newSuites[index] = { ...newSuites[index], description: e.target.value };
                            setData({ ...data, suites: newSuites });
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
                            const newSuites = [...(data.suites || [])];
                            newSuites[index] = { ...newSuites[index], price: e.target.value };
                            setData({ ...data, suites: newSuites });
                          }}
                          placeholder="e.g., $50/night"
                          className="h-9 rounded-lg text-sm"
                        />
                      </div>

                      <ImageUpload
                        label="Suite Image"
                        value={suite.image || ''}
                        onChange={(url) => {
                          const newSuites = [...(data.suites || [])];
                          newSuites[index] = { ...newSuites[index], image: url };
                          setData({ ...data, suites: newSuites });
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

      {/* 6. EXTRA CARE / SERVICES SECTION */}
      <AccordionItem value="additional-services" className="order-8 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.services}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
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
                  const newServices = [...(data.additionalServices || []), { title: '', description: '', price: '', isNew: true }];
                  setData({ ...data, additionalServices: newServices });
                  toggleExpanded(`additional-${newServices.length - 1}`);
                }}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Service
              </Button>
            </div>

            {(Array.isArray(data.additionalServices) ? data.additionalServices : [
              { title: 'Extra Comfort Check', price: '$8/day', description: 'Additional wellbeing check during the stay' },
              { title: 'Medication Administration', price: '$10/day', description: 'Careful medication management' },
              { title: 'Special Diet', price: '$15/day', description: 'Custom meal preparation' },
              { title: 'Extended Playtime', price: '$20/day', description: 'Extra one-on-one attention' }
            ]).map((service: any, index: number) => {
              const isExpanded = expandedItems[`additional-${index}`] || service.isNew;
              const isComplete = service.title && service.description;

              return (
                <div key={index} className="border rounded-lg bg-gray-50">
                  {!isExpanded ? (
                    <div className="flex items-center justify-between p-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
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
                          onClick={() => {
                            const newServices = (data.additionalServices || []).filter((_: any, i: number) => i !== index);
                            setData({ ...data, additionalServices: newServices });
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
                        <span className="text-sm font-medium text-gray-700">Service {index + 1}</span>
                        <div className="flex items-center gap-1">
                          {service.isNew && isComplete && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const newServices = [...(data.additionalServices || [])];
                                newServices[index] = { ...newServices[index], isNew: false };
                                setData({ ...data, additionalServices: newServices });
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
                            onClick={() => {
                              const newServices = (data.additionalServices || []).filter((_: any, i: number) => i !== index);
                              setData({ ...data, additionalServices: newServices });
                            }}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
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
                          onChange={(e) => {
                            const newServices = [...(data.additionalServices || [])];
                            newServices[index] = { ...newServices[index], title: e.target.value };
                            setData({ ...data, additionalServices: newServices });
                          }}
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
                          onChange={(e) => {
                            const newServices = [...(data.additionalServices || [])];
                            newServices[index] = { ...newServices[index], description: e.target.value };
                            setData({ ...data, additionalServices: newServices });
                          }}
                          placeholder="Service description"
                          className="rounded-lg text-sm"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Price (Optional)</Label>
                        <Input
                          value={service.price || ''}
                          onChange={(e) => {
                            const newServices = [...(data.additionalServices || [])];
                            newServices[index] = { ...newServices[index], price: e.target.value };
                            setData({ ...data, additionalServices: newServices });
                          }}
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

      {/* 7. GALLERY SECTION */}
      <AccordionItem value="gallery" className="order-6 border rounded-xl px-4 bg-white">
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

            {(Array.isArray(data.galleryImages) ? data.galleryImages : [
              'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=800&h=800&fit=crop',
              'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&h=800&fit=crop'
            ]).map((img: string, index: number) => (
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

      {/* 8. REVIEWS SECTION */}
      <AccordionItem value="testimonials" className="order-9 border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.reviews}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
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

            {(Array.isArray(data.testimonials) ? data.testimonials : [
              { name: 'Sarah M.', text: 'Absolutely wonderful! My cat Whiskers loves it here.', rating: 5 },
              { name: 'James T.', text: 'Professional, caring, and spotlessly clean. Highly recommend!', rating: 5 },
              { name: 'Emma L.', text: 'I travel worry-free knowing my cats are in great hands.', rating: 5 }
            ]).map((testimonial: any, index: number) => (
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
      <AccordionItem value="faq" className="order-[14] border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.faq}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
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

            {(Array.isArray(data.faqs) ? data.faqs : [
              { question: 'What are your check-in times?', answer: 'Check-in is between 9 AM - 12 PM, and check-out is 3 PM - 6 PM.' },
              { question: 'Do you require vaccinations?', answer: 'Yes, all cats must be up-to-date on vaccinations for everyone\'s safety.' },
              { question: 'Can I visit my cat during their stay?', answer: 'We recommend letting cats settle in, but video updates are sent daily.' }
            ]).map((faq: any, index: number) => (
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

      {/* 10. OWNER STORY SECTION */}
      <AccordionItem value="owner-story" className="order-5 border rounded-xl px-4 bg-white">
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

      {/* 11. CONTACT / LOCATION SECTION */}
      <AccordionItem value="contact" className="order-10 border rounded-xl px-4 bg-white">
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
              onChange={(e) => setData({ ...data, hours: e.target.value })}
              placeholder="Mon-Fri: 9am-6pm&#10;Sat-Sun: 10am-4pm"
              className="rounded-lg"
              rows={3}
            />
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* 12. CUSTOM SECTIONS */}
      <AccordionItem value="custom-sections" className="order-11 border rounded-xl px-4 bg-white">
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

      {/* 13. SOCIAL MEDIA */}
      <AccordionItem value="social-media" className="order-12 border rounded-xl px-4 bg-white">
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
      <AccordionItem value="footer" className="order-[13] border rounded-xl px-4 bg-white">
        <AccordionTrigger className="hover:no-underline py-4">
          <span className="font-semibold">{sectionTitles.footer}</span>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <p className="text-sm text-gray-600 mb-4">
            Footer links are generated from the real sections on this page, so visitors do not land on broken or misspelled anchors.
          </p>

          <div className="space-y-2">
            <Label>Quick Links</Label>
            <div className="flex flex-wrap gap-2">
              {['Home', 'About', 'Care', 'Facilities', 'Suites', 'Gallery', 'Reviews', 'Location', data.virtualTourUrl ? 'Virtual Tour' : '', 'Contact'].filter(Boolean).map((label) => (
                <span key={label} className="rounded-full border border-[#C46A3A]/30 bg-[#F8F7F5] px-3 py-1 text-xs font-semibold text-[#0A1128]">
                  {label}
                </span>
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
