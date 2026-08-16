import { useMemo, useState } from 'react';
import { Check, Edit3, Image as ImageIcon, LayoutTemplate, MapPin, Palette, Save, Type, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { ImageUpload } from './ImageUpload';
import { CatstaysTemplateSite } from '../pages/onboarding/CatstaysTemplateSite';

type EditBlockId = 'home' | 'about' | 'location' | 'contact' | 'gallery' | 'design' | `source-${number}`;

interface InlineWebsiteEditorProps {
  data: Record<string, any>;
  setData: (data: Record<string, any>) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving?: boolean;
  saveError?: string;
}

const blockIconClass = 'h-4 w-4 shrink-0';

export function InlineWebsiteEditor({
  data,
  setData,
  onSave,
  onBack,
  isSaving = false,
  saveError = '',
}: InlineWebsiteEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [activeBlock, setActiveBlock] = useState<EditBlockId>('home');
  const [sheetOpen, setSheetOpen] = useState(false);
  const sourceSections = useMemo(() => (Array.isArray(data.sourceSections) ? data.sourceSections : []), [data.sourceSections]);
  const templateId = data.liveTemplate || data.selectedTemplate || 'conversion-focus';

  const openEditor = (block: EditBlockId) => {
    setActiveBlock(block);
    setSheetOpen(true);
    setEditMode(true);
  };

  const updateField = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  const updateNested = (field: string, patch: Record<string, any>) => {
    setData({ ...data, [field]: { ...(data[field] || {}), ...patch } });
  };

  const updateSourceSection = (index: number, patch: Record<string, any>) => {
    const nextSections = [...sourceSections];
    nextSections[index] = { ...(nextSections[index] || {}), ...patch };
    setData({ ...data, sourceSections: nextSections });
  };

  const updateSourceSectionItem = (sectionIndex: number, itemIndex: number, patch: Record<string, any>) => {
    const section = sourceSections[sectionIndex] || {};
    const nextItems = [...(Array.isArray(section.items) ? section.items : [])];
    nextItems[itemIndex] = { ...(nextItems[itemIndex] || {}), ...patch };
    updateSourceSection(sectionIndex, { items: nextItems });
  };

  const updateSourceSectionImage = (sectionIndex: number, imageIndex: number, value: string) => {
    const section = sourceSections[sectionIndex] || {};
    const nextImages = [...(Array.isArray(section.images) ? section.images : [])];
    nextImages[imageIndex] = { ...(nextImages[imageIndex] || {}), image: value };
    updateSourceSection(sectionIndex, { images: nextImages });
  };

  const addGalleryImage = (url: string) => {
    const currentImages = normalizeImages(data.galleryImages);
    setData({ ...data, galleryImages: [...currentImages, url] });
  };

  const updateGalleryImage = (index: number, url: string) => {
    const currentImages = normalizeImages(data.galleryImages);
    const nextImages = [...currentImages];
    nextImages[index] = url;
    setData({ ...data, galleryImages: nextImages });
  };

  const removeGalleryImage = (index: number) => {
    const nextImages = normalizeImages(data.galleryImages).filter((_, itemIndex) => itemIndex !== index);
    setData({ ...data, galleryImages: nextImages });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f6f4ef]">
      <div className="sticky top-[73px] z-30 border-b border-[#e7ded4] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack} className="h-10 rounded-full border-[#e3d7cd]">
              Back
            </Button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-[#C46A3A]">Website</p>
              <h2 className="truncate font-serif text-2xl font-semibold text-[#0A1128]">{data.businessName || 'Your website'}</h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={editMode ? 'default' : 'outline'}
              onClick={() => {
                setEditMode((current) => !current);
                if (!editMode) setSheetOpen(true);
              }}
              className={editMode ? 'rounded-full bg-[#C46A3A] text-white hover:bg-[#a9572e]' : 'rounded-full border-[#e3d7cd]'}
            >
              {editMode ? <Check className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
              {editMode ? 'Editing' : 'Edit page'}
            </Button>
            <Button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-full bg-[#0A1128] text-white hover:bg-[#16213f]"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        {saveError ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</div>
        ) : null}
      </div>

      {editMode ? (
        <div className="sticky top-[151px] z-20 border-b border-[#e7ded4] bg-[#0A1128] px-4 py-3 shadow-sm md:px-6">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            <EditBlockButton active={activeBlock === 'home'} icon={<Type className={blockIconClass} />} label="Home" onClick={() => openEditor('home')} />
            <EditBlockButton active={activeBlock === 'about'} icon={<Type className={blockIconClass} />} label="About" onClick={() => openEditor('about')} />
            <EditBlockButton active={activeBlock === 'location'} icon={<MapPin className={blockIconClass} />} label="Location" onClick={() => openEditor('location')} />
            <EditBlockButton active={activeBlock === 'contact'} icon={<MapPin className={blockIconClass} />} label="Contact" onClick={() => openEditor('contact')} />
            <EditBlockButton active={activeBlock === 'gallery'} icon={<ImageIcon className={blockIconClass} />} label="Gallery" onClick={() => openEditor('gallery')} />
            <EditBlockButton active={activeBlock === 'design'} icon={<Palette className={blockIconClass} />} label="Design" onClick={() => openEditor('design')} />
            {sourceSections.map((section: any, index: number) => (
              <EditBlockButton
                key={`${section.id || section.title}-${index}`}
                active={activeBlock === `source-${index}`}
                icon={<LayoutTemplate className={blockIconClass} />}
                label={section.title || `Section ${index + 1}`}
                onClick={() => openEditor(`source-${index}`)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <main className="w-full bg-[#101820] px-0 py-0">
        <div className="mx-auto w-full max-w-none bg-white">
          <CatstaysTemplateSite data={data} templateId={templateId} embedded={false} previewDevice="desktop" />
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full overflow-y-auto bg-[#f8f7f5] p-0 sm:max-w-[500px]">
          <SheetHeader className="border-b border-[#eadfd6] bg-white p-5 pr-12">
            <SheetTitle className="font-serif text-2xl text-[#0A1128]">{editorTitle(activeBlock, sourceSections)}</SheetTitle>
            <SheetDescription>Edit the selected part of the page, then save when you are happy.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5 p-5">{renderEditor()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );

  function renderEditor() {
    if (activeBlock === 'home') {
      return (
        <>
          <Field label="Business name" value={data.businessName || ''} onChange={(value) => updateField('businessName', value)} />
          <Field label="Location label" value={data.location || ''} onChange={(value) => updateField('location', value)} />
          <Field label="Hero heading" value={data.heroHeading || ''} onChange={(value) => updateField('heroHeading', value)} />
          <LongField label="Hero text" value={data.heroSubheading || ''} onChange={(value) => updateField('heroSubheading', value)} rows={4} />
          <ImageUpload label="Hero image" value={data.heroImage || ''} onChange={(url) => updateField('heroImage', url)} />
          <Field label="Primary button text" value={data.heroPrimaryCtaText || ''} onChange={(value) => updateField('heroPrimaryCtaText', value)} />
          <Field label="Secondary button text" value={data.heroSecondaryCtaText || ''} onChange={(value) => updateField('heroSecondaryCtaText', value)} />
        </>
      );
    }

    if (activeBlock === 'about') {
      return (
        <>
          <Field label="About heading" value={data.aboutHeading || ''} onChange={(value) => updateField('aboutHeading', value)} />
          <LongField label="About text" value={data.aboutText || ''} onChange={(value) => updateField('aboutText', value)} rows={8} />
          <ImageUpload label="About image" value={data.aboutImage || ''} onChange={(url) => updateField('aboutImage', url)} />
        </>
      );
    }

    if (activeBlock === 'location') {
      const locationData = data.locationData || {};
      const locationSectionIndex = sourceSections.findIndex((section: any) => section?.role === 'location');
      const locationSection = locationSectionIndex >= 0 ? sourceSections[locationSectionIndex] : null;
      return (
        <>
          <Field label="Location heading" value={locationData.heading || ''} onChange={(value) => updateNested('locationData', { heading: value })} />
          <LongField label="Location description" value={locationData.text || data.address || ''} onChange={(value) => updateNested('locationData', { text: value })} rows={5} />
          <LongField label="Directions" value={locationData.directions || ''} onChange={(value) => updateNested('locationData', { directions: value })} rows={6} />
          <Field label="Address" value={data.address || ''} onChange={(value) => updateField('address', value)} />
          <Field label="Virtual tour URL" value={data.virtualTourUrl || locationData.virtualTourUrl || ''} onChange={(value) => {
            setData({ ...data, virtualTourUrl: value, locationData: { ...(data.locationData || {}), virtualTourUrl: value } });
          }} />
          {locationSection ? (
            <SourceSectionEditor
              section={locationSection}
              sectionIndex={locationSectionIndex}
              updateSourceSection={updateSourceSection}
              updateSourceSectionItem={updateSourceSectionItem}
              updateSourceSectionImage={updateSourceSectionImage}
            />
          ) : null}
        </>
      );
    }

    if (activeBlock === 'contact') {
      return (
        <>
          <Field label="Phone" value={data.phone || ''} onChange={(value) => updateField('phone', value)} />
          <Field label="Email" value={data.email || ''} onChange={(value) => updateField('email', value)} />
          <LongField label="Hours" value={data.hours || data.contactData?.hours || ''} onChange={(value) => {
            setData({ ...data, hours: value, contactData: { ...(data.contactData || {}), hours: value } });
          }} rows={4} />
          <LongField label="Contact intro" value={data.contactData?.text || ''} onChange={(value) => updateNested('contactData', { text: value })} rows={4} />
        </>
      );
    }

    if (activeBlock === 'gallery') {
      const images = normalizeImages(data.galleryImages);
      return (
        <>
          <ImageUpload label="Add photo" value="" onChange={addGalleryImage} />
          <div className="space-y-3">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="rounded-xl border border-[#eadfd6] bg-white p-3">
                <div className="mb-3 h-32 overflow-hidden rounded-lg bg-[#f4eee8]">
                  {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="flex gap-2">
                  <Input value={image} onChange={(event) => updateGalleryImage(index, event.target.value)} />
                  <Button type="button" variant="outline" onClick={() => removeGalleryImage(index)} className="shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeBlock === 'design') {
      return (
        <>
          <Field label="Primary color" value={data.primaryColor || '#0A1128'} onChange={(value) => updateField('primaryColor', value)} type="color" />
          <Field label="Accent color" value={data.accentColor || '#C46A3A'} onChange={(value) => updateField('accentColor', value)} type="color" />
          <Field label="Background color" value={data.backgroundColor || '#F8F7F5'} onChange={(value) => updateField('backgroundColor', value)} type="color" />
          <Field label="Heading font" value={data.headingFont || 'Playfair Display'} onChange={(value) => updateField('headingFont', value)} />
          <Field label="Body font" value={data.bodyFont || 'Inter'} onChange={(value) => updateField('bodyFont', value)} />
        </>
      );
    }

    if (activeBlock.startsWith('source-')) {
      const sectionIndex = Number(activeBlock.replace('source-', ''));
      const section = sourceSections[sectionIndex];
      if (!section) return <p className="text-sm text-[#6b7280]">This section is not available.</p>;
      return (
        <SourceSectionEditor
          section={section}
          sectionIndex={sectionIndex}
          updateSourceSection={updateSourceSection}
          updateSourceSectionItem={updateSourceSectionItem}
          updateSourceSectionImage={updateSourceSectionImage}
        />
      );
    }

    return null;
  }
}

function EditBlockButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
        active
          ? 'border-[#C46A3A] bg-[#C46A3A] text-white'
          : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
      }`}
    >
      {icon}
      <span className="max-w-[180px] truncate">{label}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg bg-white" />
    </div>
  );
}

function LongField({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} className="rounded-lg bg-white" />
    </div>
  );
}

function SourceSectionEditor({
  section,
  sectionIndex,
  updateSourceSection,
  updateSourceSectionItem,
  updateSourceSectionImage,
}: {
  section: any;
  sectionIndex: number;
  updateSourceSection: (index: number, patch: Record<string, any>) => void;
  updateSourceSectionItem: (sectionIndex: number, itemIndex: number, patch: Record<string, any>) => void;
  updateSourceSectionImage: (sectionIndex: number, imageIndex: number, value: string) => void;
}) {
  const items = Array.isArray(section.items) ? section.items : [];
  const images = Array.isArray(section.images) ? section.images : [];

  return (
    <div className="space-y-5">
      <Field label="Section title" value={section.title || ''} onChange={(value) => updateSourceSection(sectionIndex, { title: value })} />
      <LongField label="Section text" value={section.text || ''} onChange={(value) => updateSourceSection(sectionIndex, { text: value })} rows={7} />

      {items.length ? (
        <div className="space-y-3">
          <Label>Content blocks</Label>
          {items.map((item: any, itemIndex: number) => (
            <div key={`${item.title}-${itemIndex}`} className="space-y-3 rounded-xl border border-[#eadfd6] bg-white p-3">
              <Field label="Title" value={item.title || ''} onChange={(value) => updateSourceSectionItem(sectionIndex, itemIndex, { title: value })} />
              <LongField label="Text" value={item.text || ''} onChange={(value) => updateSourceSectionItem(sectionIndex, itemIndex, { text: value })} rows={4} />
            </div>
          ))}
        </div>
      ) : null}

      {images.length ? (
        <div className="space-y-3">
          <Label>Section photos</Label>
          {images.map((image: any, imageIndex: number) => (
            <div key={`${image.image}-${imageIndex}`} className="rounded-xl border border-[#eadfd6] bg-white p-3">
              <ImageUpload
                value={image.image || ''}
                onChange={(url) => updateSourceSectionImage(sectionIndex, imageIndex, url)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function editorTitle(block: EditBlockId, sourceSections: any[]) {
  if (block === 'home') return 'Home';
  if (block === 'about') return 'About';
  if (block === 'location') return 'Location';
  if (block === 'contact') return 'Contact';
  if (block === 'gallery') return 'Gallery';
  if (block === 'design') return 'Design';
  if (block.startsWith('source-')) {
    const index = Number(block.replace('source-', ''));
    return sourceSections[index]?.title || `Section ${index + 1}`;
  }
  return 'Edit page';
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((image: any) => (typeof image === 'string' ? image : image?.url || image?.image || ''))
    .filter(Boolean);
}
