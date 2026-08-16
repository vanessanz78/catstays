import { useMemo, useRef, useState } from 'react';
import { Check, Edit3, Image as ImageIcon, LayoutTemplate, MapPin, Palette, Save, Type, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { ImageUpload } from './ImageUpload';
import { CatstaysTemplateSite } from '../pages/onboarding/CatstaysTemplateSite';
import { buildCatstaysTemplateContent } from '../lib/previewTemplates';

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
  const [inlineMessage, setInlineMessage] = useState('');
  const activeInlineElement = useRef<HTMLElement | null>(null);
  const templateContent = useMemo(() => buildCatstaysTemplateContent(data), [data]);
  const sourceSections = useMemo(() => (Array.isArray(data.sourceSections) ? data.sourceSections : []), [data.sourceSections]);
  const editableSourceSections = useMemo(
    () => (sourceSections.length ? sourceSections : templateContent.sourceSections ?? []),
    [sourceSections, templateContent.sourceSections],
  );
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
    const nextSections = [...editableSourceSections];
    nextSections[index] = { ...(nextSections[index] || {}), ...patch };
    setData({ ...data, sourceSections: nextSections });
  };

  const updateSourceSectionItem = (sectionIndex: number, itemIndex: number, patch: Record<string, any>) => {
    const section = editableSourceSections[sectionIndex] || {};
    const nextItems = [...(Array.isArray(section.items) ? section.items : [])];
    nextItems[itemIndex] = { ...(nextItems[itemIndex] || {}), ...patch };
    updateSourceSection(sectionIndex, { items: nextItems });
  };

  const updateSourceSectionImage = (sectionIndex: number, imageIndex: number, value: string) => {
    const section = editableSourceSections[sectionIndex] || {};
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

  const handleInlinePreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!editMode) return;

    const target = event.target as HTMLElement | null;
    if (!target || target.closest('input, textarea, select, [role="dialog"], [data-inline-editor-ignore="true"]')) return;

    const image = target.closest('img');
    if (image) {
      event.preventDefault();
      event.stopPropagation();
      replaceInlineImage(image as HTMLImageElement);
      return;
    }

    const element = target.closest('h1, h2, h3, h4, p, a, span, blockquote, li, button');
    if (!(element instanceof HTMLElement)) return;
    if (!element.innerText.trim() || element.querySelector('input, textarea, select')) return;

    event.preventDefault();
    event.stopPropagation();
    beginInlineTextEdit(element);
  };

  const beginInlineTextEdit = (element: HTMLElement) => {
    if (activeInlineElement.current && activeInlineElement.current !== element) {
      activeInlineElement.current.blur();
    }

    activeInlineElement.current = element;
    const originalText = element.innerText.trim();
    element.dataset.inlineOriginalText = originalText;
    element.contentEditable = 'true';
    element.spellcheck = true;
    element.classList.add('catstays-inline-editing');
    setInlineMessage('Editing text on the page.');

    const finishEdit = (save: boolean) => {
      element.contentEditable = 'false';
      element.spellcheck = false;
      element.classList.remove('catstays-inline-editing');
      element.removeEventListener('blur', handleBlur);
      element.removeEventListener('keydown', handleKeyDown);
      activeInlineElement.current = null;

      const nextText = element.innerText.trim();
      if (!save || !nextText || nextText === originalText) {
        element.innerText = originalText;
        setInlineMessage(save ? '' : 'Inline edit cancelled.');
        return;
      }

      const didUpdate = updateInlineText(originalText, nextText, element);
      setInlineMessage(didUpdate ? 'Page text updated. Save when you are ready.' : 'Use the side panel for that text.');
      if (!didUpdate) element.innerText = originalText;
    };

    const handleBlur = () => finishEdit(true);
    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault();
        finishEdit(false);
      }
      if ((keyboardEvent.metaKey || keyboardEvent.ctrlKey) && keyboardEvent.key === 'Enter') {
        keyboardEvent.preventDefault();
        finishEdit(true);
      }
    };

    element.addEventListener('blur', handleBlur);
    element.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => {
      element.focus();
      selectElementText(element);
    }, 0);
  };

  const updateInlineText = (oldText: string, nextText: string, element: HTMLElement) => {
    const sectionId = element.closest('section[id], footer[id]')?.id || '';
    const tagName = element.tagName.toLowerCase();
    const exactDataUpdate = patchDirectField(oldText, nextText, sectionId, tagName);
    if (exactDataUpdate) {
      setData(exactDataUpdate);
      return true;
    }

    const sourceUpdate = patchSourceSectionText(oldText, nextText, sectionId);
    if (sourceUpdate) {
      setData({ ...data, sourceSections: sourceUpdate });
      return true;
    }

    return false;
  };

  const patchDirectField = (oldText: string, nextText: string, sectionId: string, tagName: string) => {
    const patches = [
      ['businessName', [templateContent.business.name, data.businessName]],
      ['tagline', [templateContent.business.tagline, data.tagline]],
      ['heroEyebrow', [templateContent.hero.eyebrow, data.heroEyebrow]],
      ['heroHeading', [templateContent.hero.heading, data.heroHeading]],
      ['heroSubheading', [templateContent.hero.text, data.heroSubheading]],
      ['heroPrimaryCtaText', [templateContent.hero.primaryButton, data.heroPrimaryCtaText]],
      ['heroSecondaryCtaText', [templateContent.hero.secondaryButton, data.heroSecondaryCtaText]],
      ['ctaText', [templateContent.hero.button, data.ctaText]],
      ['bookingText', [templateContent.booking.text, data.bookingText]],
      ['bookingBannerText', [templateContent.booking.bannerText, data.bookingBannerText]],
      ['primaryCta', [templateContent.booking.primaryCta, data.primaryCta]],
      ['aboutHeading', [templateContent.about.title, data.aboutHeading]],
      ['aboutText', [templateContent.about.text, data.aboutText]],
      ['whyChooseUsHeading', [templateContent.whyChoose.title, templateContent.sectionHeadings.care, data.whyChooseUsHeading]],
      ['whyChooseUsText', [templateContent.whyChoose.text, data.whyChooseUsText]],
      ['facilitiesHeading', [templateContent.facilities.title, templateContent.sectionHeadings.facilities, data.facilitiesHeading]],
      ['facilitiesText', [templateContent.facilities.text, data.facilitiesText]],
      ['suitesHeading', [templateContent.sectionHeadings.suites, data.suitesHeading]],
      ['additionalServicesHeading', [templateContent.sectionHeadings.services, data.additionalServicesHeading]],
      ['galleryHeading', [templateContent.sectionHeadings.gallery, data.galleryHeading]],
      ['testimonialsHeading', [templateContent.sectionHeadings.reviews, data.testimonialsHeading]],
      ['contactHeading', [templateContent.sectionHeadings.contact, data.contactHeading]],
      ['phone', [templateContent.footer.phone, data.phone]],
      ['email', [templateContent.footer.email, data.email]],
      ['address', [templateContent.footer.address, data.address]],
      ['hours', [templateContent.footer.hours, data.hours]],
      ['footerAbout', [templateContent.footer.about, data.footerAbout]],
    ] as Array<[string, unknown[]]>;

    const exactPatch = patches.find(([, values]) => values.some((value) => sameInlineText(value, oldText)));
    if (exactPatch) return { ...data, [exactPatch[0]]: nextText };

    if (sectionId === 'location') {
      if (tagName.startsWith('h')) return { ...data, locationData: { ...(data.locationData || {}), heading: nextText } };
      return { ...data, locationData: { ...(data.locationData || {}), text: nextText } };
    }

    if (sectionId === 'contact') {
      if (tagName.startsWith('h')) return { ...data, contactHeading: nextText };
      if (sameInlineText(oldText, templateContent.footer.phone)) return { ...data, phone: nextText };
      if (sameInlineText(oldText, templateContent.footer.email)) return { ...data, email: nextText };
      if (sameInlineText(oldText, templateContent.footer.hours)) return { ...data, hours: nextText };
    }

    return patchCollectionText(oldText, nextText);
  };

  const patchCollectionText = (oldText: string, nextText: string) => {
    const collectionChecks = [
      { key: 'whyChooseUsFeatures', titleKey: 'title', textKey: 'description', items: templateContent.whyChoose.items },
      { key: 'facilityFeatures', titleKey: 'title', textKey: 'description', items: templateContent.facilities.items },
      { key: 'additionalServices', titleKey: 'title', textKey: 'description', items: templateContent.services },
      { key: 'suites', titleKey: 'name', textKey: 'description', items: templateContent.suites },
      { key: 'testimonials', titleKey: 'name', textKey: 'text', items: templateContent.testimonials },
      { key: 'faqs', titleKey: 'question', textKey: 'answer', items: templateContent.faqs },
    ];

    for (const collection of collectionChecks) {
      const currentItems = Array.isArray(data[collection.key]) ? data[collection.key] : collection.items;
      const index = collection.items.findIndex((item: any) => (
        sameInlineText(item.title, oldText) ||
        sameInlineText(item.name, oldText) ||
        sameInlineText(item.author, oldText) ||
        sameInlineText(item.question, oldText) ||
        sameInlineText(item.text, oldText) ||
        sameInlineText(item.quote, oldText) ||
        sameInlineText(item.answer, oldText)
      ));
      if (index < 0) continue;

      const nextItems = [...currentItems];
      const currentItem = { ...(nextItems[index] || collection.items[index]) };
      const templateItem = collection.items[index] as any;
      const matchedTitle = sameInlineText(templateItem?.title, oldText) ||
        sameInlineText(templateItem?.name, oldText) ||
        sameInlineText(templateItem?.author, oldText) ||
        sameInlineText(templateItem?.question, oldText);
      nextItems[index] = {
        ...currentItem,
        [matchedTitle ? collection.titleKey : collection.textKey]: nextText,
      };
      return { ...data, [collection.key]: nextItems };
    }

    return null;
  };

  const patchSourceSectionText = (oldText: string, nextText: string, sectionId: string) => {
    const targetIndex = editableSourceSections.findIndex((section: any) => section?.anchor === sectionId || section?.id === sectionId);
    const sectionIndexes = targetIndex >= 0
      ? [targetIndex]
      : editableSourceSections.map((_: any, index: number) => index);

    for (const sectionIndex of sectionIndexes) {
      const section = editableSourceSections[sectionIndex] || {};
      const nextSections = [...editableSourceSections];
      if (sameInlineText(section.title, oldText)) {
        nextSections[sectionIndex] = { ...section, title: nextText };
        return nextSections;
      }
      if (sameInlineText(section.text, oldText)) {
        nextSections[sectionIndex] = { ...section, text: nextText };
        return nextSections;
      }

      const items = Array.isArray(section.items) ? section.items : [];
      const itemIndex = items.findIndex((item: any) => sameInlineText(item.title, oldText) || sameInlineText(item.text, oldText) || sameInlineText(item.price, oldText));
      if (itemIndex >= 0) {
        const item = items[itemIndex] || {};
        const nextItems = [...items];
        const key = sameInlineText(item.title, oldText) ? 'title' : sameInlineText(item.price, oldText) ? 'price' : 'text';
        nextItems[itemIndex] = { ...item, [key]: nextText };
        nextSections[sectionIndex] = { ...section, items: nextItems };
        return nextSections;
      }
    }

    return null;
  };

  const replaceInlineImage = (image: HTMLImageElement) => {
    const currentUrl = image.currentSrc || image.src || '';
    const nextUrl = window.prompt('Image URL:', unproxyImageUrl(currentUrl));
    if (!nextUrl) return;

    const sectionId = image.closest('section[id], footer[id]')?.id || '';
    const sourceUpdate = patchSourceSectionImage(currentUrl, nextUrl, sectionId);
    if (sourceUpdate) {
      setData({ ...data, sourceSections: sourceUpdate });
      setInlineMessage('Image updated. Save when you are ready.');
      return;
    }

    if (sectionId === 'home') {
      setData({ ...data, heroImage: nextUrl });
      setInlineMessage('Hero image updated. Save when you are ready.');
      return;
    }
    if (sectionId === 'about') {
      setData({ ...data, aboutImage: nextUrl });
      setInlineMessage('About image updated. Save when you are ready.');
      return;
    }
    if (sectionId === 'facilities') {
      setData({ ...data, facilitiesImage: nextUrl });
      setInlineMessage('Facilities image updated. Save when you are ready.');
      return;
    }
    if (sectionId === 'owner') {
      setData({ ...data, ownerData: { ...(data.ownerData || {}), image: nextUrl } });
      setInlineMessage('Image updated. Save when you are ready.');
      return;
    }

    const galleryImages = normalizeImages(data.galleryImages).length ? normalizeImages(data.galleryImages) : templateContent.gallery.map((item) => item.image);
    const galleryIndex = galleryImages.findIndex((url) => sameImageUrl(url, currentUrl));
    if (galleryIndex >= 0) {
      const nextImages = [...galleryImages];
      nextImages[galleryIndex] = nextUrl;
      setData({ ...data, galleryImages: nextImages });
      setInlineMessage('Gallery image updated. Save when you are ready.');
      return;
    }

    setData({ ...data, heroImage: nextUrl });
    setInlineMessage('Image updated. Save when you are ready.');
  };

  const patchSourceSectionImage = (oldUrl: string, nextUrl: string, sectionId: string) => {
    const targetIndex = editableSourceSections.findIndex((section: any) => section?.anchor === sectionId || section?.id === sectionId);
    const sectionIndexes = targetIndex >= 0
      ? [targetIndex]
      : editableSourceSections.map((_: any, index: number) => index);

    for (const sectionIndex of sectionIndexes) {
      const section = editableSourceSections[sectionIndex] || {};
      const images = Array.isArray(section.images) ? section.images : [];
      const imageIndex = images.findIndex((item: any) => sameImageUrl(item?.image, oldUrl));
      if (imageIndex >= 0) {
        const nextImages = [...images];
        nextImages[imageIndex] = { ...(nextImages[imageIndex] || {}), image: nextUrl };
        const nextSections = [...editableSourceSections];
        nextSections[sectionIndex] = { ...section, images: nextImages };
        return nextSections;
      }

      const items = Array.isArray(section.items) ? section.items : [];
      const itemIndex = items.findIndex((item: any) => sameImageUrl(item?.image, oldUrl));
      if (itemIndex >= 0) {
        const nextItems = [...items];
        nextItems[itemIndex] = { ...(nextItems[itemIndex] || {}), image: nextUrl };
        const nextSections = [...editableSourceSections];
        nextSections[sectionIndex] = { ...section, items: nextItems };
        return nextSections;
      }
    }

    return null;
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
          <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            <EditBlockButton active={activeBlock === 'home'} icon={<Type className={blockIconClass} />} label="Home" onClick={() => openEditor('home')} />
            <EditBlockButton active={activeBlock === 'about'} icon={<Type className={blockIconClass} />} label="About" onClick={() => openEditor('about')} />
            <EditBlockButton active={activeBlock === 'location'} icon={<MapPin className={blockIconClass} />} label="Location" onClick={() => openEditor('location')} />
            <EditBlockButton active={activeBlock === 'contact'} icon={<MapPin className={blockIconClass} />} label="Contact" onClick={() => openEditor('contact')} />
            <EditBlockButton active={activeBlock === 'gallery'} icon={<ImageIcon className={blockIconClass} />} label="Gallery" onClick={() => openEditor('gallery')} />
            <EditBlockButton active={activeBlock === 'design'} icon={<Palette className={blockIconClass} />} label="Design" onClick={() => openEditor('design')} />
            {editableSourceSections.map((section: any, index: number) => (
              <EditBlockButton
                key={`${section.id || section.title}-${index}`}
                active={activeBlock === `source-${index}`}
                icon={<LayoutTemplate className={blockIconClass} />}
                label={section.title || `Section ${index + 1}`}
                onClick={() => openEditor(`source-${index}`)}
              />
            ))}
          </div>
          <p className="text-sm text-white/75">{inlineMessage || 'Click text to edit it on the page. Click photos to replace them.'}</p>
          </div>
        </div>
      ) : null}

      <main className="w-full bg-[#101820] px-0 py-0">
        <style>{`
          .catstays-editable-preview [data-catstays-template-root] h1,
          .catstays-editable-preview [data-catstays-template-root] h2,
          .catstays-editable-preview [data-catstays-template-root] h3,
          .catstays-editable-preview [data-catstays-template-root] h4,
          .catstays-editable-preview [data-catstays-template-root] p,
          .catstays-editable-preview [data-catstays-template-root] a,
          .catstays-editable-preview [data-catstays-template-root] span,
          .catstays-editable-preview [data-catstays-template-root] blockquote,
          .catstays-editable-preview [data-catstays-template-root] li,
          .catstays-editable-preview [data-catstays-template-root] button,
          .catstays-editable-preview [data-catstays-template-root] img {
            cursor: text;
          }
          .catstays-editable-preview [data-catstays-template-root] img {
            cursor: pointer;
          }
          .catstays-editable-preview .catstays-inline-editing {
            outline: 3px solid #C46A3A;
            outline-offset: 4px;
            background: rgba(255, 255, 255, 0.82);
            color: #0A1128 !important;
            cursor: text;
          }
        `}</style>
        <div
          className={`mx-auto w-full max-w-none bg-white ${editMode ? 'catstays-editable-preview' : ''}`}
          onClickCapture={handleInlinePreviewClick}
        >
          <CatstaysTemplateSite data={data} templateId={templateId} embedded={false} previewDevice="desktop" />
        </div>
      </main>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#f8f7f5] p-0 sm:max-w-[500px]">
          <SheetHeader className="shrink-0 border-b border-[#eadfd6] bg-white p-5 pr-12">
            <SheetTitle className="font-serif text-2xl text-[#0A1128]">{editorTitle(activeBlock, editableSourceSections)}</SheetTitle>
            <SheetDescription>Edit the selected part of the page, then save when you are happy.</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 pb-10">{renderEditor()}</div>
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
      const locationSectionIndex = editableSourceSections.findIndex((section: any) => section?.role === 'location');
      const locationSection = locationSectionIndex >= 0 ? editableSourceSections[locationSectionIndex] : null;
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
      const section = editableSourceSections[sectionIndex];
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

function selectElementText(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function sameInlineText(value: unknown, text: string) {
  return normalizeInlineText(value) === normalizeInlineText(text);
}

function normalizeInlineText(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function sameImageUrl(value: unknown, url: string) {
  const a = unproxyImageUrl(String(value ?? ''));
  const b = unproxyImageUrl(url);
  return Boolean(a && b && (a === b || a.endsWith(b) || b.endsWith(a)));
}

function unproxyImageUrl(url: string) {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const proxiedUrl = parsedUrl.searchParams.get('url');
    return proxiedUrl || parsedUrl.href;
  } catch {
    return url;
  }
}

function normalizeImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images
    .map((image: any) => (typeof image === 'string' ? image : image?.url || image?.image || ''))
    .filter(Boolean);
}
