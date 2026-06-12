import { type MouseEvent, useState } from 'react';
import { CalendarCheck, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import {
  buildCatstaysTemplateContent,
  normalizePreviewTemplateId,
  type PreviewTemplateId,
} from '../../lib/previewTemplates';

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
    ['Suites', '#suites'],
    ['About', '#about'],
    ['Care', '#care'],
    ['Gallery', '#gallery'],
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
        <TestimonialBanner content={content} imageSrc={vanessaDemoImage} />
      </main>
      <TemplateFooter content={content} dark />
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
    { title: content.about.title, text: content.about.text, image: content.about.image, eyebrow: 'Thoughtful spaces' },
    { title: content.features[0]?.title || 'Personalised care', text: content.features[0]?.text || content.hero.text, image: content.gallery[1]?.image || content.hero.image, eyebrow: 'Expert care' },
    { title: content.features[1]?.title || 'Peace of mind', text: content.features[1]?.text || content.footer.about, image: content.gallery[2]?.image || content.hero.image, eyebrow: 'Peace of mind' },
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
            <a href="#about" className="mt-8 w-max rounded-md bg-[#1f241b] px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
              Our Approach
            </a>
          </div>
        </section>

        {sections.map((section, index) => (
          <section key={section.title} id={index === 0 ? 'about' : index === 1 ? 'care' : undefined} className="mx-auto grid max-w-[1400px] scroll-mt-28 md:grid-cols-2">
            <div className={`flex flex-col justify-center bg-white px-8 py-14 md:px-20 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">{section.eyebrow}</p>
              <h2 className="text-3xl leading-[1.12] md:text-5xl">{section.title}</h2>
              <div className="my-6 h-px w-14 bg-[#b58b4a]" />
              <p className="max-w-lg text-base leading-7">{section.text}</p>
            </div>
            <img src={section.image} alt="" className="h-[420px] w-full object-cover md:h-[520px]" />
          </section>
        ))}

        <ConversionBanner content={content} />
        <GalleryStrip content={content} />
        <SuitesGrid content={content} compact />
      </main>
      <TemplateFooter content={content} />
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

        <section id="gallery" className="mx-auto grid max-w-[1400px] scroll-mt-28 gap-4 px-6 py-6 md:grid-cols-4">
          {content.gallery.slice(0, 4).map((item) => (
            <img key={item.image} src={item.image} alt="" className="h-72 w-full object-cover" />
          ))}
        </section>

        <AboutSplit content={content} />
        <FeatureRow content={content} />
        <SuitesGrid content={content} />
        <ConversionBanner content={content} />
      </main>
      <TemplateFooter content={content} />
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
  return (
    <section id="suites" className={`mx-auto max-w-[1400px] scroll-mt-28 px-6 text-center ${compact ? 'py-14' : 'py-20'}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#b58b4a]">Our Suites</p>
      <h2 className="text-3xl leading-tight md:text-5xl">Beautiful suites for every kind of cat</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#444]">Spacious, serene and stylish suites designed for your cat's comfort.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-4">
        {content.suites.slice(0, 4).map((suite) => (
          <article key={suite.title} className="overflow-hidden rounded-md border border-[#222]/10 bg-white text-left shadow-sm">
            <img src={suite.image} alt="" className="h-56 w-full object-cover" />
            <div className="p-5 text-center">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.08em]">{suite.title}</h3>
              <p className="text-sm leading-6 text-[#444]">{suite.text}</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em]">View Suite</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ConversionBanner({ content }: { content: ReturnType<typeof buildCatstaysTemplateContent> }) {
  return (
    <section id="booking" className="scroll-mt-28 bg-[#24311c] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl leading-tight">Ready to book your cat's holiday?</h2>
          <p className="mt-2 text-sm text-white/80">{content.booking.bannerText}</p>
        </div>
        <a href="#contact" className="w-max rounded-md border border-white/60 px-7 py-4 text-xs font-bold uppercase tracking-[0.1em] text-white">
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
        {content.gallery.slice(0, 4).map((item) => (
          <figure key={item.image} className="overflow-hidden bg-white shadow-sm">
            <img src={item.image} alt="" className="h-64 w-full object-cover" />
            <figcaption className="px-4 py-3 text-sm text-[#444]">{item.caption}</figcaption>
          </figure>
        ))}
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
          <p className="text-sm leading-7">Home<br />Suites<br />About<br />Care<br />Gallery</p>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.16em]">Contact</h4>
          <p className="text-sm leading-7">{content.footer.phone}<br />{content.footer.email}<br />{content.footer.address}</p>
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
          <p className="mt-1 text-sm text-white/75">Get started to publish your site and take real bookings in your dashboard.</p>
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
