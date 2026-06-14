import { type CSSProperties, type MouseEvent, useRef, useState } from 'react';
import {
  Award,
  CalendarCheck,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Facebook,
  HeartHandshake,
  Home,
  Instagram,
  LogIn,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plane,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  buildCatstaysTemplateContent,
  normalizePreviewTemplateId,
  type PreviewTemplateId,
} from '../../lib/previewTemplates';
import { ChatWidget } from '../../components/ChatWidget';

interface CatstaysTemplateSiteProps {
  data: Record<string, any>;
  templateId?: PreviewTemplateId | string | null;
  embedded?: boolean;
  previewDevice?: PreviewDevice;
}

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';
type PreviewNoticeKind = 'booking' | 'contact';

const trustIcons = [ShieldCheck, HeartHandshake, Sparkles, CalendarCheck];
const facilityIcons = [ShieldCheck, Sparkles, Camera, Clock, HeartHandshake, CalendarCheck];
const serviceIcons = [Scissors, Stethoscope, Zap, Car, Plane, ShieldCheck, HeartHandshake, CalendarCheck];
const namedCareIcons = {
  Shield: ShieldCheck,
  Heart: HeartHandshake,
  Award,
  Star,
  Clock,
  Camera,
  Home,
  Users,
  CheckCircle,
  Sparkles,
};

export function CatstaysTemplateSite({
  data,
  templateId,
  embedded = false,
  previewDevice = 'desktop',
}: CatstaysTemplateSiteProps) {
  const template = normalizePreviewTemplateId(templateId || data.selectedTemplate || 'conversion-focus');
  const content = buildCatstaysTemplateContent(data);
  const [previewNoticeKind, setPreviewNoticeKind] = useState<PreviewNoticeKind | null>(null);

  const handlePreviewBookingAction = (event: MouseEvent<HTMLElement>) => {
    if (!embedded) return;
    event.preventDefault();
    setPreviewNoticeKind('booking');
  };

  const handlePreviewBookingInteraction = () => {
    if (embedded) setPreviewNoticeKind('booking');
  };

  const handlePreviewContactAction = (event: MouseEvent<HTMLElement>) => {
    if (!embedded) return;
    event.preventDefault();
    setPreviewNoticeKind('contact');
  };

  const handlePreviewAnchorClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!embedded) return;
    const href = event.currentTarget.getAttribute('href') || '';
    if (!href.startsWith('#') || href.length < 2) return;

    const didScroll = scrollInsidePreview(event.currentTarget, href);
    if (didScroll) event.preventDefault();
  };

  if (template === 'editorial-guide') {
    return <EditorialTemplate content={content} embedded={embedded} previewDevice={previewDevice} onPreviewAnchorClick={handlePreviewAnchorClick} onPreviewBookingAction={handlePreviewBookingAction} onPreviewBookingInteraction={handlePreviewBookingInteraction} onPreviewContactAction={handlePreviewContactAction} previewNoticeKind={previewNoticeKind} onDismissPreviewNotice={() => setPreviewNoticeKind(null)} />;
  }
  if (template === 'modern-showcase') {
    return <ShowcaseTemplate content={content} embedded={embedded} previewDevice={previewDevice} onPreviewAnchorClick={handlePreviewAnchorClick} onPreviewBookingAction={handlePreviewBookingAction} onPreviewBookingInteraction={handlePreviewBookingInteraction} onPreviewContactAction={handlePreviewContactAction} previewNoticeKind={previewNoticeKind} onDismissPreviewNotice={() => setPreviewNoticeKind(null)} />;
  }
  return <FocusTemplate content={content} embedded={embedded} previewDevice={previewDevice} onPreviewAnchorClick={handlePreviewAnchorClick} onPreviewBookingAction={handlePreviewBookingAction} onPreviewBookingInteraction={handlePreviewBookingInteraction} onPreviewContactAction={handlePreviewContactAction} previewNoticeKind={previewNoticeKind} onDismissPreviewNotice={() => setPreviewNoticeKind(null)} />;
}

function templateRootStyle(content: ReturnType<typeof buildCatstaysTemplateContent>): CSSProperties {
  return {
    '--catstays-primary': content.theme.primaryColor,
    '--catstays-accent': content.theme.accentColor,
    '--catstays-bg': content.theme.backgroundColor,
    '--catstays-heading-font': fontFamilyFor(content.theme.headingFont, 'heading'),
    '--catstays-body-font': fontFamilyFor(content.theme.bodyFont, 'body'),
    backgroundColor: content.theme.backgroundColor,
    fontFamily: 'var(--catstays-body-font)',
  } as CSSProperties;
}

function fontFamilyFor(font: string, role: 'heading' | 'body') {
  const fonts: Record<string, string> = {
    playfair: '"Playfair Display", Georgia, serif',
    merriweather: 'Merriweather, Georgia, serif',
    poppins: 'Poppins, Arial, sans-serif',
    montserrat: 'Montserrat, Arial, sans-serif',
    inter: 'Inter, Arial, sans-serif',
    nunito: 'Nunito, Arial, sans-serif',
    lato: 'Lato, Arial, sans-serif',
    opensans: '"Open Sans", Arial, sans-serif',
    roboto: 'Roboto, Arial, sans-serif',
  };

  return fonts[font] || (role === 'heading' ? fonts.playfair : fonts.inter);
}

function TemplateHeader({
  content,
  dark = false,
  onPreviewAnchorClick,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  dark?: boolean;
  onPreviewAnchorClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const links = [
    ['Home', '#home'],
    ['About', '#about'],
    ['Care', '#care'],
    ['Facilities', '#facilities'],
    ['Suites', '#suites'],
    ['Gallery', '#gallery'],
    ['Contact', '#contact'],
  ];

  return (
    <header className={dark ? 'bg-[#0A1128] text-white' : 'bg-white text-[#222] border-b border-[#222]/10'}>
      <div className="catstays-header-inner mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">{content.business.name}</h1>
          <p className={`text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-white/70' : 'text-[#8c7b63]'}`}>
            {content.business.tagline}
          </p>
        </div>
        <nav className="catstays-preview-nav hidden items-center gap-5 text-xs font-bold uppercase tracking-[0.08em] lg:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} onClick={onPreviewAnchorClick} className="hover:opacity-70">
              {label}
            </a>
          ))}
        </nav>
        <a href="#booking" onClick={onPreviewAnchorClick} className={`catstays-mobile-full shrink-0 rounded-md px-5 py-3 text-center text-xs font-bold uppercase tracking-[0.1em] ${dark ? 'bg-white text-[#0A1128]' : 'bg-[#0A1128] text-white'}`}>
          Book Now
        </a>
      </div>
    </header>
  );
}

function FocusTemplate({
  content,
  embedded,
  previewDevice,
  onPreviewAnchorClick,
  onPreviewBookingAction,
  onPreviewBookingInteraction,
  onPreviewContactAction,
  previewNoticeKind,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  previewDevice: PreviewDevice;
  onPreviewAnchorClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  onPreviewBookingInteraction: () => void;
  onPreviewContactAction: (event: MouseEvent<HTMLElement>) => void;
  previewNoticeKind: PreviewNoticeKind | null;
  onDismissPreviewNotice: () => void;
}) {
  return (
    <div data-catstays-template-root data-catstays-preview-device={previewDevice} className="catstays-template bg-[#f8f5ef] text-[#222]" style={templateRootStyle(content)}>
      <CatstaysPreviewDeviceStyles />
      <TemplateHeader content={content} onPreviewAnchorClick={onPreviewAnchorClick} />
      <PreviewBookingNotice kind={previewNoticeKind} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="catstays-stack mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 md:py-20">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8c7b63]">{content.hero.eyebrow}</p>
            <h2 className="max-w-xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{content.hero.heading}</h2>
            <div className="my-6 h-px w-14 bg-[#b58b4a]" />
            <p className="max-w-lg text-base leading-7 text-[#333]">{content.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={content.hero.primaryHref || '#suites'} onClick={onPreviewAnchorClick} className="rounded-md bg-[#0A1128] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
                {content.hero.primaryButton}
              </a>
              <a href={content.hero.secondaryHref || '#care'} onClick={onPreviewAnchorClick} className="rounded-md border border-[#0A1128]/45 px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-[#0A1128]">
                {content.hero.secondaryButton}
              </a>
            </div>
          </div>
          <img src={content.hero.image} alt="" className="catstays-template-section-image h-[420px] w-full object-cover md:h-[620px]" />
        </section>

        <section id="booking" className="relative z-10 mx-auto w-full max-w-[1400px] scroll-mt-28 px-6 md:-mt-16">
          <div className="catstays-booking-strip grid gap-5 rounded-md border border-[#222]/15 bg-white/95 p-6 shadow-xl md:grid-cols-[1.4fr_1fr_1fr_0.85fr_1fr] md:items-end md:p-8">
            <div>
              <h3 className="text-3xl leading-tight">Book your cat's stay</h3>
              <p className="mt-3 text-sm leading-6 text-[#555]">{content.booking.text}</p>
            </div>
            {['Check-in', 'Check-out'].map((label) => (
              <label key={label} className="block">
                <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em]">
                  <CalendarCheck className="h-4 w-4 text-[#8c5b32]" />
                  {label}
                </span>
                <input type="date" onFocus={onPreviewBookingInteraction} className="h-[58px] w-full rounded-md border border-[#222]/15 bg-white px-4 font-sans text-sm text-[#222]" />
              </label>
            ))}
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em]">Cats</span>
              <select onFocus={onPreviewBookingInteraction} onChange={onPreviewBookingInteraction} defaultValue="1" className="h-[58px] w-full rounded-md border border-[#222]/15 bg-white px-4 font-sans text-sm text-[#222]">
                <option value="1">1 cat</option>
                <option value="2">2 cats</option>
                <option value="3">3 cats</option>
                <option value="4">4+ cats</option>
              </select>
            </label>
            <button type="button" onClick={onPreviewBookingAction} className="flex h-[58px] items-center justify-center rounded-md bg-[#0A1128] px-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-white">
              {content.booking.primaryCta}
            </button>
          </div>
        </section>

        <AboutSplit content={content} imageFirst onPreviewAnchorClick={onPreviewAnchorClick} />
        <FeatureRow content={content} />
        <FacilitiesDetailSection content={content} />
        <OwnerStorySection content={content} />
        <GalleryStrip content={content} />
        <SuitesGrid content={content} />
        <ServicesGrid content={content} />
        <ReviewsSection content={content} />
        <LocationSection content={content} />
        <VirtualTourSection content={content} />
        <ContactFormSection content={content} onPreviewContactAction={onPreviewContactAction} />
      </main>
      <TemplateFooter content={content} dark onPreviewAnchorClick={onPreviewAnchorClick} />
      <ChatWidget accentColor={content.theme.accentColor} businessName={content.business.name} knowledge={content} />
    </div>
  );
}

function EditorialTemplate({
  content,
  embedded,
  previewDevice,
  onPreviewAnchorClick,
  onPreviewBookingAction,
  onPreviewBookingInteraction,
  onPreviewContactAction,
  previewNoticeKind,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  previewDevice: PreviewDevice;
  onPreviewAnchorClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  onPreviewBookingInteraction: () => void;
  onPreviewContactAction: (event: MouseEvent<HTMLElement>) => void;
  previewNoticeKind: PreviewNoticeKind | null;
  onDismissPreviewNotice: () => void;
}) {
  const sections = [
    { id: 'about', title: content.about.title, text: content.about.text, image: content.about.image, eyebrow: `About ${content.business.name}` },
    { id: 'care', title: content.whyChoose.title, text: content.whyChoose.text, image: content.gallery[1]?.image || content.hero.image, eyebrow: 'Why choose us' },
    { id: 'facilities', title: content.facilities.title, text: content.facilities.text, image: content.facilities.image, eyebrow: 'Premium accommodation' },
  ];

  return (
    <div data-catstays-template-root data-catstays-preview-device={previewDevice} className="catstays-template bg-[#f8f5ef] text-[#222]" style={templateRootStyle(content)}>
      <CatstaysPreviewDeviceStyles />
      <TemplateHeader content={content} onPreviewAnchorClick={onPreviewAnchorClick} />
      <PreviewBookingNotice kind={previewNoticeKind} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="catstays-stack mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
          <img src={content.hero.image} alt="" className="catstays-template-section-image h-[420px] w-full object-cover md:h-[560px]" />
          <div className="flex flex-col justify-center bg-white px-8 py-14 md:px-20">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">{content.hero.eyebrow}</p>
            <h2 className="text-4xl leading-[1.08] md:text-6xl">{content.hero.heading}</h2>
            <div className="my-6 h-px w-14 bg-[#b58b4a]" />
            <p className="max-w-lg text-base leading-7">{content.hero.text}</p>
            <a href="#booking" onClick={onPreviewAnchorClick} className="catstays-mobile-full mt-8 w-max rounded-md bg-[#0A1128] px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.1em] text-white">
              Book Now
            </a>
          </div>
        </section>

        <ConversionBanner content={content} onPreviewBookingAction={onPreviewBookingAction} onPreviewBookingInteraction={onPreviewBookingInteraction} />

        {sections.map((section, index) => (
          <section key={section.title} id={section.id} className="catstays-stack mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
            <div className={`flex flex-col justify-center bg-white px-8 py-14 md:px-20 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">{section.eyebrow}</p>
              <h2 className="text-3xl leading-[1.12] md:text-5xl">{section.title}</h2>
              <div className="my-6 h-px w-14 bg-[#b58b4a]" />
              <p className="max-w-lg text-base leading-7">{section.text}</p>
            </div>
            <img src={section.image} alt="" className="catstays-template-section-image h-full min-h-[420px] w-full object-cover md:min-h-[560px]" />
          </section>
        ))}

        <FeatureRow content={content} />
        <FacilitiesDetailSection content={content} />
        <SuitesGrid content={content} compact />
        <ServicesGrid content={content} />
        <GalleryStrip content={content} />
        <ReviewsSection content={content} />
        <OwnerStorySection content={content} />
        <LocationSection content={content} />
        <VirtualTourSection content={content} />
        <ContactFormSection content={content} onPreviewContactAction={onPreviewContactAction} />
      </main>
      <TemplateFooter content={content} onPreviewAnchorClick={onPreviewAnchorClick} />
      <ChatWidget accentColor={content.theme.accentColor} businessName={content.business.name} knowledge={content} />
    </div>
  );
}

function ShowcaseTemplate({
  content,
  embedded,
  previewDevice,
  onPreviewAnchorClick,
  onPreviewBookingAction,
  onPreviewBookingInteraction,
  onPreviewContactAction,
  previewNoticeKind,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  previewDevice: PreviewDevice;
  onPreviewAnchorClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  onPreviewBookingInteraction: () => void;
  onPreviewContactAction: (event: MouseEvent<HTMLElement>) => void;
  previewNoticeKind: PreviewNoticeKind | null;
  onDismissPreviewNotice: () => void;
}) {
  return (
    <div data-catstays-template-root data-catstays-preview-device={previewDevice} className="catstays-template bg-[#f8f6f1] text-[#222]" style={templateRootStyle(content)}>
      <CatstaysPreviewDeviceStyles />
      <TemplateHeader content={content} dark onPreviewAnchorClick={onPreviewAnchorClick} />
      <PreviewBookingNotice kind={previewNoticeKind} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="relative min-h-[620px] scroll-mt-28 overflow-hidden">
          <img src={content.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto flex min-h-[620px] max-w-[1400px] flex-col justify-end px-6 pb-16 text-white md:pb-24">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-white/75">{content.hero.eyebrow}</p>
            <h2 className="max-w-4xl text-5xl leading-[1.02] md:text-7xl">{content.hero.heading}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">{content.hero.text}</p>
            <a href="#booking" onClick={onPreviewAnchorClick} className="catstays-mobile-full mt-8 w-max rounded-md bg-white px-7 py-4 text-center text-xs font-bold uppercase tracking-[0.1em] text-[#0A1128]">
              {content.hero.button}
            </a>
          </div>
        </section>

        <ConversionBanner content={content} onPreviewBookingAction={onPreviewBookingAction} onPreviewBookingInteraction={onPreviewBookingInteraction} />
        <ShowcaseGalleryRail content={content} />

        <AboutSplit content={content} onPreviewAnchorClick={onPreviewAnchorClick} />
        <FeatureRow content={content} />
        <FacilitiesDetailSection content={content} />
        <SuitesGrid content={content} />
        <ServicesGrid content={content} />
        <ReviewsSection content={content} />
        <OwnerStorySection content={content} />
        <LocationSection content={content} />
        <VirtualTourSection content={content} />
        <ContactFormSection content={content} onPreviewContactAction={onPreviewContactAction} />
      </main>
      <TemplateFooter content={content} onPreviewAnchorClick={onPreviewAnchorClick} />
      <ChatWidget accentColor={content.theme.accentColor} businessName={content.business.name} knowledge={content} />
    </div>
  );
}

function FeatureRow({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const features = content.whyChoose.items.slice(0, 4);

  return (
    <section id="care" className="scroll-mt-28 bg-white px-6 py-16 text-center">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Care Approach</p>
        <h2 className="mx-auto max-w-3xl text-3xl leading-tight md:text-5xl">{content.sectionHeadings.care}</h2>
        {content.whyChoose.text ? <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-[#444]">{content.whyChoose.text}</p> : null}
        {features.length ? <div className="catstays-card-grid mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = careIconFor(feature.icon, index);
            return (
              <div key={feature.title} className="bg-[#f8f5ef] p-7 shadow-sm">
                <Icon className="mx-auto mb-5 h-7 w-7 text-[#8c7b63]" />
                <h3 className="mb-3 text-xl">{feature.title}</h3>
                <p className="text-sm leading-6 text-[#444]">{feature.text}</p>
              </div>
            );
          })}
        </div> : null}
      </div>
    </section>
  );
}

function careIconFor(icon: string | undefined, index: number) {
  if (icon && icon in namedCareIcons) return namedCareIcons[icon as keyof typeof namedCareIcons];
  return trustIcons[index] || ShieldCheck;
}

function ShowcaseGalleryRail({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const images = content.gallery
    .filter((item) => item.image !== content.hero.image)
    .slice(0, 8);
  const railImages = images.length >= 3 ? images : content.gallery.slice(0, 8);

  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="relative scroll-mt-28 bg-[#f8f6f1] py-8">
      <div className="mb-5 flex items-center justify-between px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Gallery</p>
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[#222]">{content.sectionHeadings.gallery}</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => scrollRail(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollRail(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={railRef} className="flex snap-x gap-5 overflow-x-auto px-6 pb-2 [scrollbar-width:thin]">
        {railImages.map((item, index) => (
          <figure key={`${item.image}-${index}`} className="min-w-[78vw] snap-start overflow-hidden bg-white shadow-sm sm:min-w-[46vw] lg:min-w-[31vw]">
            <img src={item.image} alt="" className="h-[320px] w-full object-cover" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function AboutSplit({
  content,
  imageFirst = false,
  onPreviewAnchorClick,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  imageFirst?: boolean;
  onPreviewAnchorClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <section id="about" className="catstays-stack mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
      <img src={content.about.image} alt="" className={`catstays-template-section-image h-[460px] w-full object-cover ${imageFirst ? '' : 'md:order-2'}`} />
      <div className="flex flex-col justify-center bg-white px-8 py-14 md:px-20">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8c7b63]">About {content.business.name}</p>
        <h2 className="text-3xl leading-[1.12] md:text-5xl">{content.about.title}</h2>
        <div className="my-6 h-px w-14 bg-[#b58b4a]" />
        <p className="text-base leading-7 text-[#333]">{content.about.text}</p>
        <a href="#contact" onClick={onPreviewAnchorClick} className="catstays-mobile-full mt-8 w-max rounded-md bg-[#0A1128] px-6 py-4 text-center text-xs font-bold uppercase tracking-[0.1em] text-white">
          More About Us
        </a>
      </div>
    </section>
  );
}

function SuitesGrid({ content, compact = false }: { content: ReturnType<typeof buildCatstaysTemplateContent>; compact?: boolean }) {
  const [activeSuite, setActiveSuite] = useState<(ReturnType<typeof buildCatstaysTemplateContent>['suites'][number]) | null>(null);

  return (
    <section id="suites" className={`mx-auto max-w-[1400px] scroll-mt-28 px-6 text-center ${compact ? 'py-14' : 'py-20'}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Our Suites</p>
      <h2 className="text-3xl leading-tight md:text-5xl">{content.sectionHeadings.suites}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#444]">Spacious, serene and stylish suites designed for your cat's comfort.</p>
      <div className="catstays-card-grid mx-auto mt-10 grid max-w-[1120px] gap-6 md:grid-cols-2 xl:grid-cols-3">
        {content.suites.map((suite) => (
          <article key={suite.title} className="flex overflow-hidden rounded-md border border-[#222]/10 bg-white text-left shadow-sm">
            <div className="flex w-full flex-col">
            <img src={suite.image} alt="" className="h-56 w-full object-cover" />
            <div className="flex flex-1 flex-col p-5 text-center">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.08em]">{suite.title}</h3>
              {suite.price ? <p className="mb-3 text-sm font-bold text-[#8c5b32]">{suite.price}</p> : null}
              <p className="text-sm leading-6 text-[#444]">{suite.text}</p>
              {suite.features.length ? (
                <ul className="mt-4 space-y-2 text-left text-xs leading-5 text-[#555]">
                  {suite.features.slice(0, 4).map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
              ) : null}
              <button type="button" onClick={() => setActiveSuite(suite)} className="mx-auto mt-auto rounded-md border border-[#0A1128]/20 bg-[#0A1128] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
                View Suite
              </button>
            </div>
            </div>
          </article>
        ))}
      </div>
      {activeSuite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8" role="dialog" aria-modal="true">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white text-left shadow-2xl">
            <button type="button" onClick={() => setActiveSuite(null)} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[#222] shadow">
              <X className="h-5 w-5" />
            </button>
            <img src={activeSuite.image} alt="" className="h-72 w-full object-cover" />
            <div className="p-7 md:p-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Suite Details</p>
              <h3 className="font-serif text-4xl leading-tight">{activeSuite.title}</h3>
              {activeSuite.price ? <p className="mt-3 text-base font-bold text-[#8c5b32]">{activeSuite.price}</p> : null}
              <p className="mt-5 text-base leading-8 text-[#333]">{activeSuite.text}</p>
              {activeSuite.features.length ? (
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {activeSuite.features.map((feature) => (
                    <div key={feature} className="rounded-md border border-[#222]/10 bg-[#f8f5ef] px-4 py-3 text-sm text-[#333]">
                      {feature}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ConversionBanner({
  content,
  onPreviewBookingAction,
  onPreviewBookingInteraction,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  onPreviewBookingAction?: (event: MouseEvent<HTMLElement>) => void;
  onPreviewBookingInteraction?: () => void;
}) {
  return (
    <section id="booking" className="scroll-mt-28 bg-[#0A1128] px-6 py-12 text-white">
      <div className="catstays-booking-strip mx-auto grid w-full max-w-[1400px] gap-5 md:grid-cols-[1.35fr_1fr_1fr_0.85fr_1fr] md:items-end">
        <div>
          <h2 className="text-3xl leading-tight">Book your cat's stay</h2>
          <p className="mt-2 text-sm text-white/80">{content.booking.bannerText}</p>
        </div>
        {['Check-in', 'Check-out'].map((label) => (
          <label key={label} className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/80">
              <CalendarCheck className="h-4 w-4" />
              {label}
            </span>
            <input type="date" onFocus={onPreviewBookingInteraction} className="h-[58px] w-full rounded-md border border-white/20 bg-white px-4 font-sans text-sm text-[#222]" />
          </label>
        ))}
        <label className="block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-white/80">Cats</span>
          <select onFocus={onPreviewBookingInteraction} onChange={onPreviewBookingInteraction} defaultValue="1" className="h-[58px] w-full rounded-md border border-white/20 bg-white px-4 font-sans text-sm text-[#222]">
            <option value="1">1 cat</option>
            <option value="2">2 cats</option>
            <option value="3">3 cats</option>
            <option value="4">4+ cats</option>
          </select>
        </label>
        <button type="button" onClick={onPreviewBookingAction} className="flex h-[58px] items-center justify-center rounded-md border border-white/60 px-7 text-xs font-bold uppercase tracking-[0.1em] text-white">
          {content.booking.primaryCta}
        </button>
      </div>
    </section>
  );
}

function GalleryStrip({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const images = content.gallery.slice(0, 16);
  if (!images.length) return null;

  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 460, behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="mx-auto max-w-[1400px] scroll-mt-28 px-6 py-16">
      <div className="mb-10 flex flex-col gap-5 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Gallery</p>
          <h2 className="text-3xl leading-tight md:text-5xl">{content.sectionHeadings.gallery}</h2>
        </div>
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => scrollRail(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollRail(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={railRef} className="flex snap-x gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
        {images.map((item, index) => (
          <figure key={`${item.image}-${index}`} className="min-w-[82vw] snap-start overflow-hidden bg-white shadow-sm sm:min-w-[46vw] lg:min-w-[31vw]">
            <img src={item.image} alt="" className="h-72 w-full object-cover" />
          </figure>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  if (!content.services.length) return null;

  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 460, behavior: 'smooth' });
  };

  return (
    <section id="services" className="mx-auto max-w-[1400px] scroll-mt-28 px-6 py-16">
      <div className="mb-10 flex flex-col gap-5 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Additional Services</p>
          <h2 className="max-w-3xl text-3xl leading-tight md:text-5xl">{content.sectionHeadings.services}</h2>
        </div>
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => scrollRail(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => scrollRail(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div ref={railRef} className="flex snap-x gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
        {content.services.map((service, index) => {
          const Icon = serviceIconFor(service.title, index);
          return (
          <article key={service.title} className="flex min-w-[82vw] snap-start flex-col border border-[#222]/10 bg-white p-7 shadow-sm sm:min-w-[420px] lg:min-w-[460px]">
              <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-[#f8f5ef] text-[#8c5b32]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-2xl leading-tight">{service.title}</h3>
              {service.price ? <p className="mt-2 text-sm font-bold text-[#8c5b32]">{service.price}</p> : null}
              <p className="mt-4 text-sm leading-6 text-[#444]">{service.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ReviewsSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  if (!content.testimonials.length) return null;

  const reviews = content.testimonials.slice(0, 10);
  const scrollRail = (direction: -1 | 1) => {
    railRef.current?.scrollBy({ left: direction * 460, behavior: 'smooth' });
  };

  return (
    <section id="reviews" className="scroll-mt-28 bg-white px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col gap-5 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Reviews</p>
            <h2 className="text-3xl leading-tight md:text-5xl">{content.sectionHeadings.reviews}</h2>
          </div>
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => scrollRail(-1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scrollRail(1)} className="grid h-10 w-10 place-items-center rounded-full border border-[#222]/15 bg-white text-[#222] shadow-sm">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div ref={railRef} className="flex snap-x gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
          {reviews.map((testimonial) => (
            <article key={`${testimonial.author}-${testimonial.quote}`} className="min-w-[82vw] snap-start border border-[#222]/10 bg-[#f8f5ef] p-7 shadow-sm sm:min-w-[420px] lg:min-w-[460px]">
              <p className="text-3xl leading-none text-[#b58b4a]">"</p>
              <blockquote className="mt-3 text-base italic leading-7 text-[#333]">{testimonial.quote}</blockquote>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em]">{testimonial.author}</p>
              {testimonial.location ? <p className="mt-1 text-sm text-[#666]">{testimonial.location}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilitiesDetailSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  if (!content.facilities.items.length) return null;

  return (
    <section id="facilities" className="scroll-mt-28 bg-white px-6 py-16">
      <div className="catstays-stack mx-auto max-w-[1400px]">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <img src={content.facilities.image} alt="" className="catstays-template-section-image h-[420px] w-full rounded-md object-cover shadow-sm md:h-[500px]" />
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Facilities</p>
            <h2 className="text-3xl leading-tight md:text-5xl">{content.facilities.title}</h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[#444]">{content.facilities.text}</p>
          </div>
        </div>
        <div className="catstays-card-grid mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {content.facilities.items.map((item, index) => {
            const Icon = facilityIcons[index % facilityIcons.length] || ShieldCheck;
            return (
              <article key={item.title} className="rounded-md border border-[#222]/10 bg-[#f8f5ef] p-5">
                <Icon className="mb-4 h-6 w-6 text-[#8c5b32]" />
                <h3 className="font-serif text-xl leading-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#444]">{item.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OwnerStorySection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  if (!content.owner.text) return null;

  return (
    <section id="owner" className="catstays-stack mx-auto grid max-w-[1400px] scroll-mt-28 gap-8 bg-white px-6 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-0 md:py-0">
      <img src={content.owner.image} alt="" className="catstays-owner-image h-[360px] w-full rounded-md object-cover object-[50%_58%] sm:h-[420px] md:h-[460px] md:max-h-[500px] lg:h-[500px]" />
      <div className="flex flex-col justify-center px-8 py-14 md:px-20">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">The people behind the care</p>
        <h2 className="text-3xl leading-[1.12] md:text-5xl">{content.owner.title}</h2>
        <div className="my-6 h-px w-14 bg-[#b58b4a]" />
        <p className="text-base leading-8 text-[#333]">{content.owner.text}</p>
      </div>
    </section>
  );
}

function LocationSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const address = content.footer.address || content.locationDetails.text || content.business.location;
  const hasLocation = address || content.locationDetails.text || content.locationDetails.directions;
  if (!hasLocation) return null;

  const mapUrl = safeMapUrl(address);

  return (
    <section id="location" className="scroll-mt-28 bg-[#f8f5ef] px-6 py-16">
      <div className="catstays-stack mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-[#222]/10 bg-white p-8 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Location</p>
          <h2 className="text-3xl leading-tight md:text-5xl">{content.locationDetails.heading}</h2>
          {content.locationDetails.text ? <p className="mt-5 text-base leading-7 text-[#333]">{content.locationDetails.text}</p> : null}
          {content.locationDetails.directions ? <p className="mt-5 text-sm leading-7 text-[#555]">{content.locationDetails.directions}</p> : null}
          <div className="mt-7 space-y-3 text-sm leading-6 text-[#444]">
            {address ? (
              <p className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{address}</span>
              </p>
            ) : null}
            {content.footer.phone ? (
              <p className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{content.footer.phone}</span>
              </p>
            ) : null}
            {content.footer.email ? (
              <p className="flex gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{content.footer.email}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-[#222]/10 bg-white shadow-sm">
          {mapUrl ? (
            <iframe
              title={`${content.business.name} location map`}
              src={mapUrl}
              className="h-[430px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="grid h-[430px] place-items-center bg-[#0A1128] p-8 text-center text-white">
              <div>
                <MapPin className="mx-auto mb-4 h-8 w-8 text-[#F5C08A]" />
                <p className="font-serif text-3xl">{content.business.location || content.business.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function VirtualTourSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const virtualTourUrl = embeddableVirtualTourUrl(content.locationDetails.virtualTourUrl, content.contentLibrary.sourceHost);
  if (!virtualTourUrl) return null;

  return (
    <section id="virtual-tour" className="scroll-mt-28 bg-white px-6 py-16">
      <div className="mx-auto max-w-[1400px]">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Virtual Tour</p>
        <h2 className="mb-8 text-3xl leading-tight md:text-5xl">Take a look around</h2>
        <div className="overflow-hidden rounded-md border border-[#222]/10 bg-[#f8f5ef] shadow-sm">
          <iframe
            title={`${content.business.name} virtual tour`}
            src={virtualTourUrl}
            className="h-[520px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </section>
  );
}

function ContactFormSection({
  content,
  onPreviewContactAction,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  onPreviewContactAction: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <section id="contact" className="scroll-mt-28 bg-[#f8f5ef] px-6 py-16">
      <div className="catstays-stack mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-md border border-[#222]/10 bg-white p-8 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Contact</p>
          <h2 className="text-3xl leading-tight md:text-5xl">{content.sectionHeadings.contact}</h2>
          <p className="mt-5 text-base leading-7 text-[#444]">Ask a question, arrange a visit, or start a booking enquiry.</p>
          <div className="mt-7 space-y-4 text-sm leading-6 text-[#444]">
            {content.footer.phone ? (
              <p className="flex gap-3">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{content.footer.phone}</span>
              </p>
            ) : null}
            {content.footer.email ? (
              <p className="flex gap-3">
                <Mail className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{content.footer.email}</span>
              </p>
            ) : null}
            {content.footer.hours ? (
              <p className="flex gap-3">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-[#8c5b32]" />
                <span>{content.footer.hours}</span>
              </p>
            ) : null}
          </div>
        </div>
        <form className="rounded-md border border-[#222]/10 bg-white p-8 shadow-sm">
          <div className="mb-5 rounded-md border border-[#b58b4a]/30 bg-[#f8f5ef] p-4 text-sm leading-6 text-[#444]">
            Preview enquiries are not sent yet. Once live, messages are captured in the CatStays dashboard inbox and can also notify the business email.
          </div>
          <div className="catstays-form-grid grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#222]">
              First name
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" placeholder="Your first name" />
            </label>
            <label className="block text-sm font-bold text-[#222]">
              Last name
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" placeholder="Your last name" />
            </label>
            <label className="block text-sm font-bold text-[#222]">
              Email
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" placeholder="you@example.com" type="email" />
            </label>
            <label className="block text-sm font-bold text-[#222]">
              Phone
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" placeholder="Your phone number" />
            </label>
            <label className="block text-sm font-bold text-[#222]">
              Check-in
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" type="date" />
            </label>
            <label className="block text-sm font-bold text-[#222]">
              Check-out
              <input className="mt-2 h-12 w-full rounded-md border border-[#222]/15 px-4 font-sans text-sm" type="date" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-bold text-[#222]">
            Message
            <textarea className="mt-2 min-h-32 w-full rounded-md border border-[#222]/15 px-4 py-3 font-sans text-sm" placeholder="Tell us about your cat and the care they need." />
          </label>
          <button type="button" onClick={onPreviewContactAction} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0A1128] px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white">
            <MessageSquare className="h-4 w-4" />
            Send enquiry
          </button>
        </form>
      </div>
    </section>
  );
}

function serviceIconFor(title: string, index: number) {
  const normalized = title.toLowerCase();
  if (normalized.includes('brush') || normalized.includes('groom')) return Scissors;
  if (normalized.includes('medicine') || normalized.includes('vet')) return Stethoscope;
  if (normalized.includes('blanket') || normalized.includes('electric')) return Zap;
  if (normalized.includes('airport')) return Plane;
  if (normalized.includes('pickup') || normalized.includes('drop')) return Car;
  if (normalized.includes('hour') || normalized.includes('time')) return Clock;
  return serviceIcons[index % serviceIcons.length] || HeartHandshake;
}

function safeMapUrl(address: string) {
  if (!address) return '';
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function scrollInsidePreview(link: HTMLElement, href: string) {
  const root = link.closest('[data-catstays-template-root]');
  const scrollRoot = link.closest('[data-preview-mode="true"]') as HTMLElement | null;
  const targetId = href.slice(1);
  const target = root?.querySelector(`[id="${targetId.replace(/"/g, '\\"')}"]`) as HTMLElement | null;

  if (!target) return false;

  const offset = previewStickyOffset();

  if (scrollRoot && scrollRoot.scrollHeight > scrollRoot.clientHeight + 8) {
    const targetTop = target.getBoundingClientRect().top - scrollRoot.getBoundingClientRect().top + scrollRoot.scrollTop;
    scrollRoot.scrollTo({ top: Math.max(targetTop - offset, 0), behavior: 'smooth' });
    return true;
  }

  window.scrollTo({
    top: Math.max(window.scrollY + target.getBoundingClientRect().top - offset, 0),
    behavior: 'smooth',
  });
  return true;
}

function previewStickyOffset() {
  const header = document.querySelector('[data-catstays-demo-header]') as HTMLElement | null;
  return (header?.getBoundingClientRect().height || 80) + 16;
}

function embeddableVirtualTourUrl(rawUrl: string, sourceHost?: string) {
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

function CatstaysPreviewDeviceStyles() {
  return (
    <style>{`
      [data-catstays-template-root] {
        scroll-behavior: smooth;
        background-color: var(--catstays-bg, #F8F7F5) !important;
        font-family: var(--catstays-body-font, Inter, Arial, sans-serif);
      }

      [data-catstays-template-root] h1,
      [data-catstays-template-root] h2,
      [data-catstays-template-root] h3,
      [data-catstays-template-root] h4,
      [data-catstays-template-root] .font-serif {
        font-family: var(--catstays-heading-font, Georgia, serif) !important;
      }

      [data-catstays-template-root] .font-sans,
      [data-catstays-template-root] input,
      [data-catstays-template-root] select,
      [data-catstays-template-root] textarea,
      [data-catstays-template-root] button {
        font-family: var(--catstays-body-font, Inter, Arial, sans-serif) !important;
      }

      [data-catstays-template-root] [class*="bg-[#0A1128]"],
      [data-catstays-template-root] [class*="bg-[#1f241b]"],
      [data-catstays-template-root] [class*="bg-[#24311c]"] {
        background-color: var(--catstays-primary, #0A1128) !important;
      }

      [data-catstays-template-root] [class*="text-[#0A1128]"],
      [data-catstays-template-root] [class*="text-[#1f241b]"] {
        color: var(--catstays-primary, #0A1128) !important;
      }

      [data-catstays-template-root] [class*="border-[#0A1128]"],
      [data-catstays-template-root] [class*="border-[#1f241b]"] {
        border-color: var(--catstays-primary, #0A1128) !important;
      }

      [data-catstays-template-root] [class*="bg-[#A85A30]"],
      [data-catstays-template-root] [class*="bg-[#C46A3A]"],
      [data-catstays-template-root] [class*="bg-[#b58b4a]"] {
        background-color: var(--catstays-accent, #C46A3A) !important;
      }

      [data-catstays-template-root] [class*="text-[#A85A30]"],
      [data-catstays-template-root] [class*="text-[#C46A3A]"],
      [data-catstays-template-root] [class*="text-[#F5C08A]"],
      [data-catstays-template-root] [class*="text-[#b58b4a]"],
      [data-catstays-template-root] [class*="text-[#8c7b63]"],
      [data-catstays-template-root] [class*="text-[#8c5b32]"] {
        color: var(--catstays-accent, #C46A3A) !important;
      }

      [data-catstays-template-root] [class*="border-[#A85A30]"],
      [data-catstays-template-root] [class*="border-[#C46A3A]"],
      [data-catstays-template-root] [class*="border-[#b58b4a]"] {
        border-color: var(--catstays-accent, #C46A3A) !important;
      }

      [data-catstays-template-root] [class*="bg-[#f8f5ef]"],
      [data-catstays-template-root] [class*="bg-[#f8f6f1]"],
      [data-catstays-template-root] [class*="bg-[#f8f7f5]"] {
        background-color: var(--catstays-bg, #F8F7F5) !important;
      }

      [data-catstays-template-root] .catstays-template-section-image,
      [data-catstays-template-root] .catstays-owner-image,
      [data-catstays-template-root] figure,
      [data-catstays-template-root] article,
      [data-catstays-template-root] .catstays-card-grid > div {
        border-radius: 0.375rem;
        overflow: hidden;
      }

      [data-catstays-preview-device="mobile"].catstays-template,
      [data-catstays-preview-device="tablet"].catstays-template {
        overflow-wrap: anywhere;
      }

      [data-catstays-preview-device="mobile"] .catstays-preview-nav,
      [data-catstays-preview-device="tablet"] .catstays-preview-nav {
        display: none !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-header-inner {
        align-items: flex-start !important;
        flex-direction: column !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-mobile-full {
        width: 100% !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-mobile-full {
        max-width: 100% !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-stack,
      [data-catstays-preview-device="mobile"] .catstays-booking-strip,
      [data-catstays-preview-device="mobile"] .catstays-card-grid,
      [data-catstays-preview-device="mobile"] .catstays-form-grid,
      [data-catstays-preview-device="mobile"] .catstays-footer-grid,
      [data-catstays-preview-device="mobile"] .catstays-founder-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-stack {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-card-grid,
      [data-catstays-preview-device="tablet"] .catstays-footer-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-booking-strip {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-template-section-image {
        height: 320px !important;
        min-height: 0 !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-template-section-image {
        height: 420px !important;
        min-height: 0 !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-owner-image {
        height: 340px !important;
        min-height: 0 !important;
        object-position: 50% 60% !important;
      }

      [data-catstays-preview-device="tablet"] .catstays-owner-image {
        height: 520px !important;
        min-height: 0 !important;
        object-position: 50% 60% !important;
      }

      [data-catstays-preview-device="mobile"] .catstays-booking-strip {
        padding: 1rem !important;
      }

      [data-catstays-preview-device="mobile"] h2 {
        font-size: clamp(2rem, 11vw, 3rem) !important;
        line-height: 1.08 !important;
      }

      [data-catstays-preview-device="tablet"] h2 {
        font-size: clamp(2.6rem, 7vw, 4.2rem) !important;
      }
    `}</style>
  );
}

function TemplateFooter({
  content,
  dark = false,
  onPreviewAnchorClick,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  dark?: boolean;
  onPreviewAnchorClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const linkClass = `block underline-offset-4 hover:underline ${dark ? 'text-white/75 hover:text-white' : 'text-[#444] hover:text-[#222]'}`;
  const virtualTourUrl = embeddableVirtualTourUrl(content.locationDetails.virtualTourUrl, content.contentLibrary.sourceHost);
  const socialLinkClass = `inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${dark ? 'border-white/15 text-white/75 hover:border-white/40 hover:text-white' : 'border-[#222]/10 text-[#444] hover:border-[#222]/30 hover:text-[#222]'}`;

  return (
    <footer id="footer" className={`scroll-mt-28 px-6 py-14 ${dark ? 'bg-[#0A1128] text-white' : 'bg-white text-[#222]'}`}>
      <div className="catstays-footer-grid mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <h3 className="mb-2 font-serif text-3xl">{content.business.name}</h3>
          <p className={`mb-6 max-w-md text-sm uppercase tracking-[0.14em] ${dark ? 'text-[#F5C08A]' : 'text-[#8c7b63]'}`}>{content.business.tagline}</p>
          <p className={`max-w-md text-sm leading-6 ${dark ? 'text-white/70' : 'text-[#444]'}`}>{content.footer.about}</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Quick Links</h4>
          <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <a href="#home" onClick={onPreviewAnchorClick} className={linkClass}>Home</a>
            <a href="#about" onClick={onPreviewAnchorClick} className={linkClass}>About</a>
            <a href="#care" onClick={onPreviewAnchorClick} className={linkClass}>Care</a>
            <a href="#facilities" onClick={onPreviewAnchorClick} className={linkClass}>Facilities</a>
            <a href="#suites" onClick={onPreviewAnchorClick} className={linkClass}>Rooms</a>
            <a href="#services" onClick={onPreviewAnchorClick} className={linkClass}>Extra Care</a>
            <a href="#gallery" onClick={onPreviewAnchorClick} className={linkClass}>Gallery</a>
            <a href="#reviews" onClick={onPreviewAnchorClick} className={linkClass}>Reviews</a>
            <a href="#location" onClick={onPreviewAnchorClick} className={linkClass}>Location</a>
            {virtualTourUrl ? <a href="#virtual-tour" onClick={onPreviewAnchorClick} className={linkClass}>Virtual Tour</a> : null}
          </nav>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Contact</h4>
          <p className="text-sm leading-7">{content.footer.phone}<br />{content.footer.email}<br />{content.footer.address}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {content.footer.facebook ? (
              <a href={content.footer.facebook} target="_blank" rel="noreferrer" className={socialLinkClass} aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {content.footer.instagram ? (
              <a href={content.footer.instagram} target="_blank" rel="noreferrer" className={socialLinkClass} aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Hours</h4>
          <p className="text-sm leading-7">{content.footer.hours}</p>
          <a href="/login" className={`mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold ${dark ? 'border-white/20 text-white/80 hover:border-white/45 hover:text-white' : 'border-[#222]/10 text-[#222] hover:border-[#222]/30'}`}>
            <LogIn className="h-4 w-4" />
            Host Login
          </a>
        </div>
      </div>
      <div className={`mt-10 border-t pt-6 text-center text-xs ${dark ? 'border-white/15 text-white/55' : 'border-[#222]/10 text-[#666]'}`}>
        (c) 2026 {content.business.name}. All rights reserved.
      </div>
    </footer>
  );
}

function PreviewBookingNotice({ kind, onDismiss }: { kind: PreviewNoticeKind | null; onDismiss: () => void }) {
  if (!kind) return null;

  const message =
    kind === 'contact'
      ? 'Get started to publish your site, connect the enquiry form, and capture messages in your CatStays dashboard inbox with email notifications.'
      : 'Get started to publish your site, connect the booking agent, and send bookings into your dashboard.';

  return (
    <div className="fixed left-1/2 top-20 z-50 max-h-[calc(100vh-6rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-y-auto rounded-lg border border-[#F5C08A]/40 bg-[#0A1128] p-4 text-white shadow-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">This is a preview version.</p>
          <p className="mt-1 text-sm text-white/75">{message}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a href="/signup" className="rounded-md bg-[#A85A30] px-4 py-2 text-sm font-semibold text-white">
            Get started
          </a>
          <button type="button" onClick={onDismiss} className="rounded-md border border-white/20 px-3 py-2 text-sm text-white/80">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
