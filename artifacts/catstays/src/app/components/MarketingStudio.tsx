import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Download,
  Facebook,
  FileText,
  Image as ImageIcon,
  Instagram,
  Mail,
  Megaphone,
  Palette,
  Quote,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

type TemplateId = 'instagram-post' | 'instagram-story' | 'facebook-post' | 'review-card' | 'flyer' | 'email-banner';
type LayoutStyle = 'premium' | 'minimal' | 'playful';

interface MarketingStudioProps {
  businessData: {
    catteryId: string;
    businessName: string;
    location: string;
    subdomain: string;
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    heroHeading?: string;
    heroSubheading?: string;
    aboutText?: string;
    phone?: string;
    email?: string;
    address?: string;
    pricePerNight?: string;
    heroImage?: string;
    galleryImages?: Array<string | { url?: string; caption?: string }>;
    headingFont?: string;
    subheadingFont?: string;
    roomTypes?: Array<{
      name: string;
      numberOfRooms: string;
      maxCatsPerRoom: string;
    }>;
    servicesData?: any;
  };
  promotions?: MarketingPromotion[];
}

type TemplateSpec = {
  id: TemplateId;
  label: string;
  size: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
};

export type MarketingPromotion = {
  id: string;
  name: string;
  code: string;
  detail: string;
  cta: string;
};

type MarketingDraft = {
  template: TemplateId;
  headline: string;
  subheadline: string;
  caption: string;
  ctaText: string;
  layoutStyle: LayoutStyle;
  imageUrl: string;
  primaryColor: string;
  accentColor: string;
  promotionId: string;
};

type SourceImage = {
  url: string;
  label: string;
  source: string;
};

const templates: TemplateSpec[] = [
  { id: 'instagram-post', label: 'Instagram Post', size: '1080 x 1080', width: 1080, height: 1080, icon: Instagram },
  { id: 'instagram-story', label: 'Instagram Story', size: '1080 x 1920', width: 1080, height: 1920, icon: Smartphone },
  { id: 'facebook-post', label: 'Facebook Post', size: '1200 x 630', width: 1200, height: 630, icon: Facebook },
  { id: 'review-card', label: 'Review Card', size: '1080 x 1350', width: 1080, height: 1350, icon: Quote },
  { id: 'flyer', label: 'Print Flyer', size: 'A4 portrait', width: 1240, height: 1754, icon: FileText },
  { id: 'email-banner', label: 'Email Banner', size: '1200 x 600', width: 1200, height: 600, icon: Mail },
];

const fallbackImages = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1600&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1573865526739-10c1de0e0ef2?w=1600&h=1600&fit=crop',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1600&h=1600&fit=crop',
];

function uploadedImagesKey(catteryId: string) {
  return `catstays_marketing_uploaded_images_v2_${catteryId}`;
}

export function MarketingStudio({ businessData, promotions = [] }: MarketingStudioProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const selectedTemplate = templates.find((item) => item.id === 'instagram-post') || templates[0];
  const sourceImages = useMemo(() => collectSourceImages(businessData), [businessData]);
  const firstImage = sourceImages[0]?.url || fallbackImages[0];
  const [draft, setDraft] = useState<MarketingDraft>(() => ({
    template: selectedTemplate.id,
    headline: businessData.heroHeading || 'Now Taking Bookings',
    subheadline: businessData.heroSubheading || 'Safe, loving care for your cat',
    caption: defaultCaption(businessData.businessName, businessData.location),
    ctaText: 'Book Now',
    layoutStyle: 'premium',
    imageUrl: firstImage,
    primaryColor: businessData.primaryColor || '#0A1128',
    accentColor: businessData.accentColor || '#C46A3A',
    promotionId: '',
  }));

  useEffect(() => {
    setDraft((current) => {
      if (current.imageUrl) return current;
      return { ...current, imageUrl: firstImage };
    });
  }, [firstImage]);

  const template = templates.find((item) => item.id === draft.template) || templates[0];
  const selectedPromotion = promotions.find((item) => item.id === draft.promotionId) || null;
  const canvasRatio = template.width / template.height;
  const previewStyle = template.id === 'instagram-story'
    ? 'max-h-[720px] max-w-[405px]'
    : template.id === 'flyer'
      ? 'max-h-[720px] max-w-[509px]'
      : 'max-h-[660px] max-w-[760px]';
  const activeCaption = selectedPromotion
    ? promotionCaption(draft, businessData, selectedPromotion)
    : draft.caption;

  const patchDraft = (patch: Partial<MarketingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const chooseTemplate = (templateId: TemplateId) => {
    const nextTemplate = templates.find((item) => item.id === templateId) || template;
    setDraft((current) => ({
      ...current,
      template: nextTemplate.id,
      headline: headlineForTemplate(nextTemplate.id, current.headline, businessData.businessName),
    }));
  };

  const applyPromotion = (promotionId: string) => {
    const promotion = promotions.find((item) => item.id === promotionId) || null;
    setDraft((current) => ({
      ...current,
      promotionId,
      headline: promotion ? promotion.name : current.headline,
      ctaText: promotion?.cta || current.ctaText,
      caption: promotion ? promotionCaption(current, businessData, promotion) : current.caption,
    }));
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || '');
      if (!url) return;
      const uploaded = loadUploadedImages(businessData.catteryId);
      const next = uniqueImages([url, ...uploaded]).slice(0, 24);
      localStorage.setItem(uploadedImagesKey(businessData.catteryId), JSON.stringify(next));
      patchDraft({ imageUrl: url });
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = '';
  };

  const rotateImage = (direction: 1 | -1) => {
    const images = sourceImages.map((image) => image.url);
    if (!images.length) return;
    const currentIndex = Math.max(0, images.indexOf(draft.imageUrl));
    const nextIndex = (currentIndex + direction + images.length) % images.length;
    patchDraft({ imageUrl: images[nextIndex] });
  };

  const regenerateCopy = () => {
    const variants = copyVariants(businessData.businessName, businessData.location, selectedPromotion);
    const currentIndex = variants.findIndex((item) => item.headline === draft.headline);
    const next = variants[(currentIndex + 1 + variants.length) % variants.length] || variants[0];
    patchDraft({
      headline: next.headline,
      subheadline: next.subheadline,
      caption: next.caption,
      ctaText: next.ctaText,
    });
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(activeCaption);
  };

  const sharePack = async () => {
    const shareData = {
      title: `${businessData.businessName} marketing post`,
      text: activeCaption,
      url: websiteUrl(businessData),
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${activeCaption}\n\n${websiteUrl(businessData)}`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.warn('[CatStays] Marketing share failed', error);
    }
  };

  const downloadAsset = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await drawMarketingCanvas(ctx, canvas, draft, template, businessData, selectedPromotion);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessData.subdomain || 'catstays'}-${template.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="space-y-6">
      <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C46A3A]/25 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C46A3A]">
            <Sparkles className="h-4 w-4" />
            Marketing Studio
          </div>
          <h2 className="font-serif text-4xl font-semibold leading-tight text-[#0A1128]">
            Create reusable posts, offers, and client-ready graphics.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#0A1128]/65">
            Choose a format, use cattery photos, write the caption once, then download or share the ready-to-post asset.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={sharePack} variant="outline" className="gap-2 rounded-xl border-[#0A1128]/15">
            <Send className="h-4 w-4" />
            Share Pack
          </Button>
          <Button onClick={downloadAsset} className="gap-2 rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
        </div>
      </header>

      <section className="grid min-w-0 items-start gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#C46A3A] text-sm font-bold text-white">1</span>
              <h3 className="font-semibold text-[#0A1128]">Choose a template</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((item) => {
                const Icon = item.icon;
                const active = item.id === draft.template;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseTemplate(item.id)}
                    className={`min-h-[118px] rounded-2xl border p-4 text-left transition ${
                      active ? 'border-[#C46A3A] bg-[#C46A3A]/5 shadow-sm' : 'border-[#0A1128]/10 bg-white hover:border-[#C46A3A]/40'
                    }`}
                  >
                    <Icon className={`mb-5 h-5 w-5 ${active ? 'text-[#C46A3A]' : 'text-[#0A1128]/45'}`} />
                    <div className="text-sm font-bold text-[#0A1128]">{item.label}</div>
                    <div className="mt-1 text-xs text-[#0A1128]/55">{item.size}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#C46A3A]" />
              <h3 className="font-semibold text-[#0A1128]">Promotion campaign</h3>
            </div>
            <select
              value={draft.promotionId}
              onChange={(event) => applyPromotion(event.target.value)}
              className="w-full rounded-xl border border-[#0A1128]/15 bg-white px-4 py-3 text-sm text-[#0A1128] outline-none focus:border-[#C46A3A]"
            >
              <option value="">{promotions.length > 0 ? 'No promotion' : 'No active promotions saved'}</option>
              {promotions.map((promotion) => (
                <option key={promotion.id} value={promotion.id}>
                  {promotion.name} - {promotion.code}
                </option>
              ))}
            </select>
            <p className="mt-3 rounded-xl bg-[#F6F4EF] p-3 text-xs leading-5 text-[#0A1128]/60">
              {selectedPromotion ? selectedPromotion.detail : 'Promotions can feed the post headline, CTA, and caption without rebuilding the asset.'}
            </p>
          </div>

          <div className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#C46A3A]" />
              <h3 className="font-semibold text-[#0A1128]">Photo library</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sourceImages.slice(0, 12).map((image) => (
                <button
                  key={`${image.source}-${image.url}`}
                  type="button"
                  onClick={() => patchDraft({ imageUrl: image.url })}
                  className={`group aspect-square overflow-hidden rounded-xl border ${
                    draft.imageUrl === image.url ? 'border-[#C46A3A] ring-2 ring-[#C46A3A]/20' : 'border-[#0A1128]/10'
                  }`}
                  title={`${image.source}: ${image.label}`}
                >
                  <img src={image.url} alt={image.label} className="h-full w-full object-cover transition group-hover:scale-105" />
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => rotateImage(-1)} className="gap-2 rounded-xl border-[#0A1128]/15">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button type="button" variant="outline" onClick={() => rotateImage(1)} className="gap-2 rounded-xl border-[#0A1128]/15">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <Button type="button" onClick={() => uploadInputRef.current?.click()} className="mt-3 w-full gap-2 rounded-xl bg-[#0A1128] text-white hover:bg-[#0A1128]/90">
              <Upload className="h-4 w-4" />
              Upload photo
            </Button>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-3xl font-semibold text-[#0A1128]">Live preview</h3>
                <p className="mt-1 text-sm text-[#0A1128]/55">{template.label} ({template.size})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={regenerateCopy} className="gap-2 rounded-xl border-[#0A1128]/15">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate copy
                </Button>
                <Button type="button" variant="outline" onClick={copyCaption} className="gap-2 rounded-xl border-[#0A1128]/15">
                  <Copy className="h-4 w-4" />
                  Copy caption
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-[#F6F4EF] p-4 sm:p-8">
              <div
                className={`relative mx-auto w-full overflow-hidden rounded-2xl bg-[#0A1128] shadow-2xl ${previewStyle}`}
                style={{ aspectRatio: `${canvasRatio}`, containerType: 'inline-size' }}
              >
                <img src={draft.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div
                  className={`absolute inset-0 ${
                    draft.layoutStyle === 'minimal'
                      ? 'bg-[#0A1128]/35'
                      : draft.layoutStyle === 'playful'
                        ? 'bg-gradient-to-br from-[#0A1128]/20 via-transparent to-[#C46A3A]/85'
                        : 'bg-gradient-to-b from-[#0A1128]/70 via-[#0A1128]/15 to-[#C46A3A]/85'
                  }`}
                />
                <PreviewContent draft={draft} template={template} businessData={businessData} promotion={selectedPromotion} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              <div>
                <Label htmlFor="marketing-headline">Headline</Label>
                <Input
                  id="marketing-headline"
                  value={draft.headline}
                  onChange={(event) => patchDraft({ headline: event.target.value })}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="marketing-subheadline">Subheadline</Label>
                <Input
                  id="marketing-subheadline"
                  value={draft.subheadline}
                  onChange={(event) => patchDraft({ subheadline: event.target.value })}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="marketing-cta">Button text</Label>
                <Input
                  id="marketing-cta"
                  value={draft.ctaText}
                  onChange={(event) => patchDraft({ ctaText: event.target.value })}
                  className="mt-2 rounded-xl"
                />
              </div>
              <div>
                <Label>Layout style</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['premium', 'minimal', 'playful'] as LayoutStyle[]).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => patchDraft({ layoutStyle: style })}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize ${
                        draft.layoutStyle === style ? 'bg-[#C46A3A] text-white' : 'bg-[#F6F4EF] text-[#0A1128]'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="font-semibold text-[#0A1128]">Post caption</h3>
                <Button type="button" variant="outline" size="sm" onClick={copyCaption} className="gap-2 rounded-xl">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={activeCaption}
                onChange={(event) => patchDraft({ caption: event.target.value, promotionId: '' })}
                rows={8}
                className="resize-none rounded-xl"
              />
            </div>

            <div className="rounded-2xl border border-[#0A1128]/10 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#C46A3A]" />
                <h3 className="font-semibold text-[#0A1128]">Brand colours</h3>
              </div>
              <div className="space-y-4">
                <ColourInput label="Navy" value={draft.primaryColor} onChange={(value) => patchDraft({ primaryColor: value })} />
                <ColourInput label="Copper" value={draft.accentColor} onChange={(value) => patchDraft({ accentColor: value })} />
              </div>
              <div className="mt-5 rounded-xl bg-[#F6F4EF] p-4 text-sm leading-6 text-[#0A1128]/65">
                Uploaded photos stay in this browser for this cattery only. Website photos and saved promotions come from the current cattery account.
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function PreviewContent({
  draft,
  template,
  businessData,
  promotion,
}: {
  draft: MarketingDraft;
  template: TemplateSpec;
  businessData: MarketingStudioProps['businessData'];
  promotion: MarketingPromotion | null;
}) {
  const isWide = template.id === 'facebook-post' || template.id === 'email-banner';
  const isStory = template.id === 'instagram-story';
  const isReview = template.id === 'review-card';
  const isFlyer = template.id === 'flyer';
  const businessUrl = websiteUrl(businessData).replace(/^https?:\/\//, '');
  const type = previewTypeScale(template.id);

  return (
    <div className="absolute inset-0 flex flex-col justify-between p-[7.5%] text-white">
      <div className="flex items-start gap-4">
        <div className="max-w-[76%]">
          <div className="font-bold uppercase leading-tight tracking-[0.24em] text-white/85" style={{ fontSize: type.eyebrow }}>
            {promotion ? promotion.code : businessData.location || 'Cat boarding'}
          </div>
          <div className="mt-2 h-1 w-16 rounded-full" style={{ backgroundColor: draft.accentColor }} />
        </div>
      </div>

      <div className={`${isWide ? 'max-w-[58%]' : isFlyer ? 'max-w-[78%]' : 'max-w-[82%]'} ${isReview ? 'rounded-3xl bg-white/92 p-[6%] text-[#0A1128]' : ''}`}>
        {isReview && <div className="mb-4" style={{ fontSize: type.stars }}>*****</div>}
        <h4
          className="max-h-[4.2em] overflow-hidden font-serif font-bold leading-[1.02]"
          style={{
            color: isReview ? draft.primaryColor : '#FFFFFF',
            fontSize: type.headline,
          }}
        >
          {draft.headline}
        </h4>
        <p
          className="mt-[4%] max-h-[5.4em] max-w-3xl overflow-hidden font-medium leading-[1.18]"
          style={{
            color: isReview ? 'rgba(10,17,40,0.72)' : 'rgba(255,255,255,0.92)',
            fontSize: type.subheadline,
          }}
        >
          {draft.subheadline}
        </p>
        {!isReview && (
          <div
            className="mt-[6%] inline-flex max-w-full rounded-full bg-white px-[6%] py-[2.4%] font-bold leading-none shadow-lg"
            style={{ color: draft.accentColor, fontSize: type.cta }}
          >
            {draft.ctaText}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 font-bold leading-tight" style={{ fontSize: type.footer }}>
        <span className="max-w-[54%] truncate">{businessData.businessName}</span>
        <span className="max-w-[44%] truncate rounded-full bg-white/18 px-4 py-2">{businessUrl}</span>
      </div>
    </div>
  );
}

function previewTypeScale(template: TemplateId) {
  if (template === 'instagram-story') {
    return {
      eyebrow: 'clamp(10px, 3cqw, 16px)',
      headline: 'clamp(38px, 12cqw, 82px)',
      subheadline: 'clamp(18px, 5.5cqw, 34px)',
      cta: 'clamp(15px, 4.2cqw, 28px)',
      footer: 'clamp(12px, 3.3cqw, 20px)',
      stars: 'clamp(18px, 5cqw, 32px)',
    };
  }

  if (template === 'flyer') {
    return {
      eyebrow: 'clamp(9px, 2.5cqw, 14px)',
      headline: 'clamp(34px, 8.2cqw, 58px)',
      subheadline: 'clamp(16px, 3.9cqw, 26px)',
      cta: 'clamp(14px, 3.3cqw, 22px)',
      footer: 'clamp(11px, 2.8cqw, 18px)',
      stars: 'clamp(18px, 4cqw, 28px)',
    };
  }

  if (template === 'facebook-post' || template === 'email-banner') {
    return {
      eyebrow: 'clamp(9px, 1.7cqw, 13px)',
      headline: 'clamp(30px, 6cqw, 56px)',
      subheadline: 'clamp(15px, 2.9cqw, 26px)',
      cta: 'clamp(13px, 2.4cqw, 20px)',
      footer: 'clamp(11px, 1.8cqw, 16px)',
      stars: 'clamp(17px, 3cqw, 26px)',
    };
  }

  if (template === 'review-card') {
    return {
      eyebrow: 'clamp(9px, 2.2cqw, 14px)',
      headline: 'clamp(34px, 7.4cqw, 64px)',
      subheadline: 'clamp(16px, 3.7cqw, 28px)',
      cta: 'clamp(14px, 3cqw, 22px)',
      footer: 'clamp(11px, 2.4cqw, 17px)',
      stars: 'clamp(18px, 4.4cqw, 34px)',
    };
  }

  return {
    eyebrow: 'clamp(9px, 2cqw, 14px)',
    headline: 'clamp(32px, 7.4cqw, 62px)',
    subheadline: 'clamp(16px, 3.8cqw, 28px)',
    cta: 'clamp(14px, 3cqw, 22px)',
    footer: 'clamp(11px, 2.3cqw, 17px)',
    stars: 'clamp(18px, 4cqw, 30px)',
  };
}

function canvasHeadlineSize(template: TemplateId, width: number) {
  if (template === 'instagram-story') return width * 0.078;
  if (template === 'flyer') return width * 0.052;
  if (template === 'facebook-post' || template === 'email-banner') return width * 0.048;
  if (template === 'review-card') return width * 0.058;
  return width * 0.058;
}

function ColourInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={normaliseColour(value)}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-14 rounded-lg border border-[#0A1128]/15 bg-white"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl font-mono" />
      </div>
    </div>
  );
}

async function drawMarketingCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  draft: MarketingDraft,
  template: TemplateSpec,
  businessData: MarketingStudioProps['businessData'],
  promotion: MarketingPromotion | null,
) {
  ctx.fillStyle = draft.primaryColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = await loadImage(draft.imageUrl);
  if (img) {
    drawCoverImage(ctx, img, 0, 0, canvas.width, canvas.height);
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, `${hexToRgba(draft.primaryColor, 0.82)}`);
  gradient.addColorStop(0.52, 'rgba(10,17,40,0.18)');
  gradient.addColorStop(1, `${hexToRgba(draft.accentColor, 0.9)}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pad = Math.round(canvas.width * 0.075);
  ctx.fillStyle = 'rgba(255,255,255,0.86)';
  ctx.font = `700 ${Math.max(24, canvas.width * 0.026)}px sans-serif`;
  ctx.letterSpacing = '6px';
  ctx.fillText((promotion?.code || businessData.location || 'CAT BOARDING').toUpperCase(), pad, pad + 28);
  ctx.letterSpacing = '0px';

  const headlineSize = canvasHeadlineSize(template.id, canvas.width);
  const subheadlineSize = Math.max(26, canvas.width * (template.id === 'flyer' ? 0.027 : 0.031));
  const headlineLines = template.id === 'flyer' ? 3 : 4;
  const subheadlineLines = template.id === 'flyer' ? 4 : 3;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `700 ${headlineSize}px serif`;
  wrapText(ctx, draft.headline, pad, canvas.height * 0.42, canvas.width - pad * 2, headlineSize * 1.06, headlineLines);

  ctx.font = `500 ${subheadlineSize}px sans-serif`;
  wrapText(ctx, draft.subheadline, pad, canvas.height * 0.6, canvas.width - pad * 2, subheadlineSize * 1.34, subheadlineLines);

  ctx.font = `700 ${Math.max(24, canvas.width * 0.028)}px sans-serif`;
  const buttonWidth = Math.min(canvas.width * 0.36, Math.max(canvas.width * 0.24, ctx.measureText(draft.ctaText).width + canvas.width * 0.08));
  const buttonHeight = canvas.height * 0.055;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, pad, canvas.height * 0.75, buttonWidth, buttonHeight, buttonHeight / 2);
  ctx.fill();
  ctx.fillStyle = draft.accentColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(draft.ctaText, pad + buttonWidth / 2, canvas.height * 0.75 + buttonHeight / 2);

  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `700 ${Math.max(22, canvas.width * 0.028)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(websiteUrl(businessData).replace(/^https?:\/\//, ''), canvas.width / 2, canvas.height - pad);
}

function collectSourceImages(businessData: MarketingStudioProps['businessData']): SourceImage[] {
  const images: SourceImage[] = [];
  const add = (url: unknown, label: string, source: string) => {
    if (typeof url !== 'string' || !isImageUrl(url)) return;
    images.push({ url, label, source });
  };

  add(businessData.heroImage, 'Website hero', 'Website');
  for (const image of businessData.galleryImages || []) {
    if (typeof image === 'string') add(image, 'Gallery photo', 'Website');
    else add(image?.url, image?.caption || 'Gallery photo', 'Website');
  }

  for (const url of loadUploadedImages(businessData.catteryId)) add(url, 'Uploaded photo', 'This cattery');

  fallbackImages.forEach((url, index) => add(url, `Fallback cat photo ${index + 1}`, 'Fallback'));

  const seen = new Set<string>();
  return images.filter((image) => {
    const key = image.url.split('?')[0].toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadUploadedImages(catteryId: string): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(uploadedImagesKey(catteryId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function uniqueImages(images: string[]) {
  const seen = new Set<string>();
  return images.filter((url) => {
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function isImageUrl(url: string) {
  return /^data:image\//i.test(url) || /^https?:\/\/.+\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(url) || /images\.unsplash\.com/i.test(url);
}

function websiteUrl(businessData: MarketingStudioProps['businessData']) {
  const subdomain = businessData.subdomain || businessData.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'cattery';
  return `https://${subdomain}.catstays.app`;
}

function defaultCaption(name: string, location: string) {
  return `${name} gives cats a calm, comfortable place to stay while their people are away.${location ? ` Based in ${location}.` : ''}\n\nBook your cat's stay today.`;
}

function promotionCaption(draft: MarketingDraft, businessData: MarketingStudioProps['businessData'], promotion: MarketingPromotion) {
  return `${promotion.name} at ${businessData.businessName}\n\n${promotion.detail}\n\nUse code ${promotion.code} when you book.\n\n${draft.ctaText}: ${websiteUrl(businessData)}`;
}

function copyVariants(name: string, location: string, promotion: MarketingPromotion | null) {
  if (promotion) {
    return [
      {
        headline: promotion.name,
        subheadline: promotion.detail,
        ctaText: promotion.cta,
        caption: `${promotion.name} at ${name}. Use code ${promotion.code} when you book.`,
      },
      {
        headline: 'Limited rooms available',
        subheadline: 'Give your cat a comfortable stay while you are away.',
        ctaText: promotion.cta,
        caption: `${name} has limited cattery spaces available. ${promotion.detail}`,
      },
    ];
  }
  return [
    {
      headline: 'Now Taking Bookings',
      subheadline: 'Safe, loving care for your cat',
      ctaText: 'Book Now',
      caption: defaultCaption(name, location),
    },
    {
      headline: 'A calm stay for your cat',
      subheadline: 'Comfortable rooms, attentive care, and reassuring updates',
      ctaText: 'Book Now',
      caption: `${name} offers careful, calm cat boarding${location ? ` in ${location}` : ''}. Book now to reserve a room.`,
    },
    {
      headline: 'Your cat deserves a holiday too',
      subheadline: 'Private rooms, gentle care, and reassuring contact',
      ctaText: 'Plan Their Stay',
      caption: `Planning time away? ${name} helps your cat settle in with gentle care and a comfortable space of their own.`,
    },
  ];
}

function headlineForTemplate(template: TemplateId, fallback: string, businessName: string) {
  if (template === 'review-card') return 'Loved your stay?';
  if (template === 'flyer') return businessName;
  return fallback;
}

function normaliseColour(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#0A1128';
}

function hexToRgba(hex: string, alpha: number) {
  const value = normaliseColour(hex).replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function drawCoverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const imageRatio = img.width / img.height;
  const targetRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = x;
  let offsetY = y;

  if (imageRatio > targetRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    offsetX = x - (drawWidth - width) / 2;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    offsetY = y - (drawHeight - height) / 2;
  }

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
    if (lines.length >= maxLines) break;
  }

  if (line && lines.length < maxLines) lines.push(line);
  lines.slice(0, maxLines).forEach((item, index) => {
    ctx.fillText(item, x, y + index * lineHeight);
  });
}
