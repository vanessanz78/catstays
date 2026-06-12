import { type MouseEvent, useRef, useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, HeartHandshake, ShieldCheck, Sparkles, X } from 'lucide-react';
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
}

const trustIcons = [ShieldCheck, HeartHandshake, Sparkles, CalendarCheck];
const vanessaDemoImage = '/assets/marketing/vanessa-and-cat.png';

export function CatstaysTemplateSite({
  data,
  templateId,
  embedded = false,
}: CatstaysTemplateSiteProps) {
  const template = normalizePreviewTemplateId(templateId || data.selectedTemplate || 'conversion-focus');
  const content = buildCatstaysTemplateContent(data);
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);

  const handlePreviewBookingAction = (event: MouseEvent<HTMLElement>) => {
    if (!embedded) return;
    event.preventDefault();
    setShowPreviewNotice(true);
  };

  if (template === 'editorial-guide') {
    return <EditorialTemplate content={content} embedded={embedded} onPreviewBookingAction={handlePreviewBookingAction} showPreviewNotice={showPreviewNotice} onDismissPreviewNotice={() => setShowPreviewNotice(false)} />;
  }
  if (template === 'modern-showcase') {
    return <ShowcaseTemplate content={content} embedded={embedded} onPreviewBookingAction={handlePreviewBookingAction} showPreviewNotice={showPreviewNotice} onDismissPreviewNotice={() => setShowPreviewNotice(false)} />;
  }
  return <FocusTemplate content={content} embedded={embedded} onPreviewBookingAction={handlePreviewBookingAction} showPreviewNotice={showPreviewNotice} onDismissPreviewNotice={() => setShowPreviewNotice(false)} />;
}

function TemplateHeader({
  content,
  dark = false,
  onPreviewBookingAction,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  dark?: boolean;
  onPreviewBookingAction?: (event: MouseEvent<HTMLElement>) => void;
}) {
  const links = [
    ['Home', '#home'],
    ['About', '#about'],
    ['Rooms', '#suites'],
    ['Care', '#care'],
    ['Gallery', '#gallery'],
    ['Reviews', '#reviews'],
    ['Contact', '#contact'],
  ];

  return (
    <header className={dark ? 'bg-[#1f241b] text-white' : 'bg-white text-[#222] border-b border-[#222]/10'}>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-5">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl leading-tight sm:text-3xl">{content.business.name}</h1>
          <p className={`text-[11px] uppercase tracking-[0.18em] ${dark ? 'text-white/70' : 'text-[#8c7b63]'}`}>
            {content.business.tagline}
          </p>
        </div>
        <nav className="hidden items-center gap-7 text-xs font-bold uppercase tracking-[0.08em] lg:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hover:opacity-70">
              {label}
            </a>
          ))}
        </nav>
        <a href="#booking" onClick={onPreviewBookingAction} className={`shrink-0 rounded-md px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] ${dark ? 'bg-white text-[#1f241b]' : 'bg-[#1f241b] text-white'}`}>
          Book Now
        </a>
      </div>
    </header>
  );
}

function FocusTemplate({
  content,
  embedded,
  onPreviewBookingAction,
  showPreviewNotice,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  showPreviewNotice: boolean;
  onDismissPreviewNotice: () => void;
}) {
  return (
    <div className="bg-[#f8f5ef] text-[#222]" style={{ fontFamily: 'Georgia, serif' }}>
      <TemplateHeader content={content} onPreviewBookingAction={onPreviewBookingAction} />
      <PreviewBookingNotice visible={showPreviewNotice} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 md:py-20">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8c7b63]">{content.hero.eyebrow}</p>
            <h2 className="max-w-xl text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{content.hero.heading}</h2>
            <div className="my-6 h-px w-14 bg-[#b58b4a]" />
            <p className="max-w-lg text-base leading-7 text-[#333]">{content.hero.text}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#suites" className="rounded-md bg-[#1f241b] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
                Discover Our Suites
              </a>
              <a href="#about" className="rounded-md border border-[#1f241b]/45 px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-[#1f241b]">
                Our Care Approach
              </a>
            </div>
          </div>
          <img src={content.hero.image} alt="" className="h-[420px] w-full object-cover md:h-[620px]" />
        </section>

        <section id="booking" className="relative z-10 mx-auto max-w-[1320px] scroll-mt-28 px-6 md:-mt-16">
          <div className="grid gap-6 border border-[#222]/15 bg-white/95 p-6 shadow-xl md:grid-cols-[1.35fr_1fr_1fr_0.8fr_1fr] md:items-end md:p-8">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em]">Book your cat's stay</p>
              <h3 className="text-2xl leading-tight">{content.booking.text}</h3>
            </div>
            {['Check-in', 'Check-out', 'Cats'].map((label, index) => (
              <label key={label} className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em]">{label}</span>
                <span className="flex h-[58px] items-center rounded-md border border-[#222]/15 bg-white px-4 text-sm">
                  {index === 2 ? '1 Cat' : 'Select date'}
                </span>
              </label>
            ))}
            <button type="button" onClick={onPreviewBookingAction} className="flex h-[58px] items-center justify-center rounded-md bg-[#1f241b] px-5 text-center text-xs font-bold uppercase tracking-[0.1em] text-white">
              {content.booking.primaryCta}
            </button>
          </div>
        </section>

        <FeatureRow content={content} />
        <AboutSplit content={content} imageFirst />
        <GalleryStrip content={content} />
        <SuitesGrid content={content} />
        <ServicesGrid content={content} />
        <ReviewsSection content={content} />
        <FaqSection content={content} />
        <TestimonialBanner content={content} imageSrc={vanessaDemoImage} />
      </main>
      <TemplateFooter content={content} dark />
      <ChatWidget accentColor="#A85A30" businessName={content.business.name} />
    </div>
  );
}

function EditorialTemplate({
  content,
  embedded,
  onPreviewBookingAction,
  showPreviewNotice,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  showPreviewNotice: boolean;
  onDismissPreviewNotice: () => void;
}) {
  const sections = [
    { id: 'about', title: content.about.title, text: content.about.text, image: content.gallery[1]?.image || content.about.image, eyebrow: 'Thoughtful spaces' },
    { title: content.owner.title, text: content.owner.text, image: content.owner.image || content.gallery[2]?.image || content.hero.image, eyebrow: 'The people behind the care' },
    { title: content.commitment.title, text: content.commitment.text, image: content.gallery[3]?.image || content.gallery[2]?.image || content.hero.image, eyebrow: 'Peace of mind' },
  ];

  return (
    <div className="bg-[#f8f5ef] text-[#222]" style={{ fontFamily: 'Georgia, serif' }}>
      <TemplateHeader content={content} onPreviewBookingAction={onPreviewBookingAction} />
      <PreviewBookingNotice visible={showPreviewNotice} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
          <img src={content.hero.image} alt="" className="h-[420px] w-full object-cover md:h-[560px]" />
          <div className="flex flex-col justify-center bg-white px-8 py-14 md:px-20">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">{content.hero.eyebrow}</p>
            <h2 className="text-4xl leading-[1.08] md:text-6xl">{content.hero.heading}</h2>
            <div className="my-6 h-px w-14 bg-[#b58b4a]" />
            <p className="max-w-lg text-base leading-7">{content.hero.text}</p>
            <a href="#booking" onClick={onPreviewBookingAction} className="mt-8 w-max rounded-md bg-[#1f241b] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
              Book Now
            </a>
          </div>
        </section>

        {sections.map((section, index) => (
          <section key={section.title} id={section.id} className="mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
            <div className={`flex flex-col justify-center bg-white px-8 py-14 md:px-20 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">{section.eyebrow}</p>
              <h2 className="text-3xl leading-[1.12] md:text-5xl">{section.title}</h2>
              <div className="my-6 h-px w-14 bg-[#b58b4a]" />
              <p className="max-w-lg text-base leading-7">{section.text}</p>
            </div>
            <img src={section.image} alt="" className="h-[420px] w-full object-cover md:h-[520px]" />
          </section>
        ))}

        <FeatureRow content={content} />
        <SuitesGrid content={content} compact />
        <ServicesGrid content={content} />
        <ConversionBanner content={content} onPreviewBookingAction={onPreviewBookingAction} />
        <GalleryStrip content={content} />
        <ReviewsSection content={content} />
        <FaqSection content={content} />
        <LocationSection content={content} />
      </main>
      <TemplateFooter content={content} />
      <ChatWidget accentColor="#556b3f" businessName={content.business.name} />
    </div>
  );
}

function ShowcaseTemplate({
  content,
  embedded,
  onPreviewBookingAction,
  showPreviewNotice,
  onDismissPreviewNotice,
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  embedded: boolean;
  onPreviewBookingAction: (event: MouseEvent<HTMLElement>) => void;
  showPreviewNotice: boolean;
  onDismissPreviewNotice: () => void;
}) {
  return (
    <div className="bg-[#f8f6f1] text-[#222]" style={{ fontFamily: 'Georgia, serif' }}>
      <TemplateHeader content={content} dark onPreviewBookingAction={onPreviewBookingAction} />
      <PreviewBookingNotice visible={showPreviewNotice} onDismiss={onDismissPreviewNotice} />
      <main>
        <section id="home" className="relative min-h-[620px] scroll-mt-28 overflow-hidden">
          <img src={content.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto flex min-h-[620px] max-w-[1400px] flex-col justify-end px-6 pb-16 text-white md:pb-24">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-white/75">{content.hero.eyebrow}</p>
            <h2 className="max-w-4xl text-5xl leading-[1.02] md:text-7xl">{content.hero.heading}</h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90">{content.hero.text}</p>
            <a href="#booking" onClick={onPreviewBookingAction} className="mt-8 w-max rounded-md bg-white px-7 py-4 text-xs font-bold uppercase tracking-[0.1em] text-[#1f241b]">
              {content.hero.button}
            </a>
          </div>
        </section>

        <ShowcaseGalleryRail content={content} />

        <AboutSplit content={content} />
        <FeatureRow content={content} />
        <SuitesGrid content={content} />
        <ServicesGrid content={content} />
        <ReviewsSection content={content} />
        <FaqSection content={content} />
        <ConversionBanner content={content} onPreviewBookingAction={onPreviewBookingAction} />
      </main>
      <TemplateFooter content={content} />
      <ChatWidget accentColor="#556b3f" businessName={content.business.name} />
    </div>
  );
}

function FeatureRow({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  return (
    <section id="care" className="mx-auto grid max-w-[1400px] scroll-mt-28 gap-6 px-6 py-16 text-center md:grid-cols-4">
      {content.features.slice(0, 4).map((feature, index) => {
        const Icon = trustIcons[index] || ShieldCheck;
        return (
          <div key={feature.title} className="bg-white p-7 shadow-sm">
            <Icon className="mx-auto mb-5 h-7 w-7 text-[#8c7b63]" />
            <h3 className="mb-3 text-xl">{feature.title}</h3>
            <p className="text-sm leading-6 text-[#444]">{feature.text}</p>
          </div>
        );
      })}
    </section>
  );
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
          <h2 className="mt-2 font-serif text-3xl leading-tight text-[#222]">A visual look inside the stay</h2>
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
            <figcaption className="px-5 py-4 text-sm text-[#444]">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function AboutSplit({ content, imageFirst = false }: { content: ReturnType<typeof buildCatstaysTemplateContent>; imageFirst?: boolean }) {
  return (
    <section id="about" className="mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
      <img src={content.about.image} alt="" className={`h-[460px] w-full object-cover ${imageFirst ? '' : 'md:order-2'}`} />
      <div className="flex flex-col justify-center bg-white px-8 py-14 md:px-20">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#8c7b63]">About {content.business.name}</p>
        <h2 className="text-3xl leading-[1.12] md:text-5xl">{content.about.title}</h2>
        <div className="my-6 h-px w-14 bg-[#b58b4a]" />
        <p className="text-base leading-7 text-[#333]">{content.about.text}</p>
        <a href="#contact" className="mt-8 w-max rounded-md bg-[#1f241b] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
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
      <h2 className="text-3xl leading-tight md:text-5xl">Beautiful suites for every kind of cat</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#444]">Spacious, serene and stylish suites designed for your cat's comfort.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
              <button type="button" onClick={() => setActiveSuite(suite)} className="mx-auto mt-auto rounded-md border border-[#1f241b]/20 bg-[#1f241b] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white">
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
}: {
  content: ReturnType<typeof buildCatstaysTemplateContent>;
  onPreviewBookingAction?: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <section id="booking" className="scroll-mt-28 bg-[#24311c] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl leading-tight">Ready to book your cat's holiday?</h2>
          <p className="mt-2 text-sm text-white/80">{content.booking.bannerText}</p>
        </div>
        <a href="#contact" onClick={onPreviewBookingAction} className="w-max rounded-md border border-white/60 px-7 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
          {content.booking.primaryCta}
        </a>
      </div>
    </section>
  );
}

function GalleryStrip({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  return (
    <section id="gallery" className="mx-auto max-w-[1400px] scroll-mt-28 px-6 py-16">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Gallery</p>
      <h2 className="mb-10 text-center text-3xl leading-tight md:text-5xl">A closer look at the stay</h2>
      <div className="grid gap-5 md:grid-cols-4">
        {content.gallery.slice(0, 8).map((item) => (
          <figure key={item.image} className="overflow-hidden bg-white shadow-sm">
            <img src={item.image} alt="" className="h-64 w-full object-cover" />
            <figcaption className="px-4 py-3 text-sm text-[#444]">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ServicesGrid({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  if (!content.services.length) return null;

  return (
    <section id="services" className="mx-auto max-w-[1400px] scroll-mt-28 px-6 py-16">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Additional Services</p>
      <h2 className="mx-auto max-w-3xl text-center text-3xl leading-tight md:text-5xl">Extra care when your cat needs it</h2>
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {content.services.map((service) => (
          <article key={service.title} className="grid overflow-hidden border border-[#222]/10 bg-white shadow-sm sm:grid-cols-[180px_1fr]">
            <img src={service.image} alt="" className="h-full min-h-[190px] w-full object-cover" />
            <div className="p-6">
              <h3 className="font-serif text-2xl leading-tight">{service.title}</h3>
              {service.price ? <p className="mt-2 text-sm font-bold text-[#8c5b32]">{service.price}</p> : null}
              <p className="mt-4 text-sm leading-6 text-[#444]">{service.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewsSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  if (!content.testimonials.length) return null;

  return (
    <section id="reviews" className="scroll-mt-28 bg-white px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Reviews</p>
        <h2 className="text-center text-3xl leading-tight md:text-5xl">Trusted by cat families</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {content.testimonials.slice(0, 6).map((testimonial) => (
            <article key={`${testimonial.author}-${testimonial.quote}`} className="border border-[#222]/10 bg-[#f8f5ef] p-7 shadow-sm">
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

function FaqSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  if (!content.faqs.length) return null;

  return (
    <section id="faq" className="mx-auto max-w-[1000px] scroll-mt-28 px-6 py-16">
      <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">FAQ</p>
      <h2 className="text-center text-3xl leading-tight md:text-5xl">Useful things to know</h2>
      <div className="mt-10 divide-y divide-[#222]/10 border-y border-[#222]/10 bg-white">
        {content.faqs.map((faq) => (
          <div key={faq.question} className="px-6 py-6">
            <h3 className="font-serif text-xl leading-tight">{faq.question}</h3>
            <p className="mt-3 text-sm leading-7 text-[#444]">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LocationSection({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  const hasLocation = content.locationDetails.text || content.locationDetails.directions || content.locationDetails.virtualTourUrl;
  if (!hasLocation) return null;

  return (
    <section id="location" className="bg-[#f8f5ef] px-6 py-16">
      <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Location</p>
          <h2 className="text-3xl leading-tight md:text-5xl">{content.locationDetails.heading}</h2>
          {content.locationDetails.text ? <p className="mt-5 text-base leading-7 text-[#333]">{content.locationDetails.text}</p> : null}
          {content.locationDetails.directions ? <p className="mt-3 text-sm leading-6 text-[#555]">{content.locationDetails.directions}</p> : null}
        </div>
        <div className="border border-[#222]/10 bg-white p-7 shadow-sm">
          <h3 className="font-serif text-2xl">Contact details</h3>
          <p className="mt-4 text-sm leading-7 text-[#444]">{content.footer.phone}<br />{content.footer.email}<br />{content.footer.address}</p>
          {content.locationDetails.virtualTourUrl ? (
            <a href={content.locationDetails.virtualTourUrl} className="mt-5 inline-block rounded-md bg-[#1f241b] px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white">
              Virtual Tour
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TestimonialBanner({ content, light = false, imageSrc }: { content: ReturnType<typeof buildCatstaysTemplateContent>; light?: boolean; imageSrc?: string }) {
  const testimonial = content.testimonials[0];
  if (imageSrc) {
    return (
      <section className="bg-[#0A1128] px-6 py-14 text-white">
        <div className="mx-auto grid max-w-[1200px] overflow-hidden bg-white/6 md:grid-cols-[320px_1fr]">
          <img src={imageSrc} alt="Vanessa with a cat" className="h-full min-h-[320px] w-full object-cover" />
          <div className="flex flex-col justify-center px-8 py-10 md:px-12">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#F5C08A]">From the founder</p>
            <blockquote className="text-3xl italic leading-snug md:text-4xl">{testimonial.quote}</blockquote>
            <div className="mt-8 text-sm">
              <p className="font-bold uppercase tracking-[0.14em]">{testimonial.author}</p>
              <p className="mt-1 text-white/70">{content.business.name}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`grid items-center gap-8 px-8 py-12 md:grid-cols-[1fr_2fr_1fr] ${light ? 'bg-white' : 'bg-[#24311c] text-white'}`}>
      <div className="text-7xl leading-none">"</div>
      <blockquote className="text-center text-2xl italic leading-relaxed">{testimonial.quote}</blockquote>
      <div className="text-sm">
        <p className="font-bold uppercase tracking-[0.12em]">{testimonial.author}</p>
        <p className={light ? 'text-[#444]' : 'text-white/70'}>{content.business.name}</p>
      </div>
    </section>
  );
}

function TemplateFooter({ content, dark = false }: { content: ReturnType<typeof buildCatstaysTemplateContent>; dark?: boolean }) {
  return (
    <footer id="contact" className={`scroll-mt-28 px-6 py-14 ${dark ? 'bg-[#0A1128] text-white' : 'bg-white text-[#222]'}`}>
      <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <h3 className="mb-2 font-serif text-3xl">{content.business.name}</h3>
          <p className={`mb-6 max-w-md text-sm uppercase tracking-[0.14em] ${dark ? 'text-[#F5C08A]' : 'text-[#8c7b63]'}`}>{content.business.tagline}</p>
          <p className={`max-w-md text-sm leading-6 ${dark ? 'text-white/70' : 'text-[#444]'}`}>{content.footer.about}</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Quick Links</h4>
          <p className="text-sm leading-7">Home<br />About<br />Rooms<br />Care<br />Gallery<br />Reviews</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Contact</h4>
          <p className="text-sm leading-7">{content.footer.phone}<br />{content.footer.email}<br />{content.footer.address}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {content.footer.facebook ? <a href={content.footer.facebook} className="underline-offset-4 hover:underline">Facebook</a> : null}
            {content.footer.instagram ? <a href={content.footer.instagram} className="underline-offset-4 hover:underline">Instagram</a> : null}
            {content.locationDetails.virtualTourUrl ? <a href={content.locationDetails.virtualTourUrl} className="underline-offset-4 hover:underline">Virtual Tour</a> : null}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Hours</h4>
          <p className="text-sm leading-7">{content.footer.hours}</p>
        </div>
      </div>
      <div className={`mt-10 border-t pt-6 text-center text-xs ${dark ? 'border-white/15 text-white/55' : 'border-[#222]/10 text-[#666]'}`}>
        (c) 2026 {content.business.name}. All rights reserved.
      </div>
    </footer>
  );
}

function PreviewBookingNotice({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border border-[#F5C08A]/40 bg-[#0A1128] p-4 text-white shadow-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">This is a preview version.</p>
          <p className="mt-1 text-sm text-white/75">Get started to publish your site, connect the booking agent, and send bookings into your dashboard.</p>
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
