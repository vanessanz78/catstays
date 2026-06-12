import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, CheckCircle, Globe, LayoutDashboard, Monitor, Smartphone, Tablet, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FullWebsitePreview } from '../onboarding/FullWebsitePreview';
import {
  buildFallbackScrapeForUrl,
  DELORAINE_SOURCE_URL,
  fallbackDeloraineScrape,
  IMPORT_URL_STORAGE_KEY,
  PREVIEW_DATA_STORAGE_KEY,
  PREVIEW_URL_STORAGE_KEY,
  rememberCatteryPreview,
  sourceMatchesRequest,
  type DelorainePreviewData,
  type ImportedCatteryScrape,
} from '../../lib/deloraineDemo';
import {
  buildPreviewImportRecord,
  dataFromPreviewRecord,
  normalizePreviewTemplateId,
  previewTemplateCards,
  savePreviewImportRecord,
  type PreviewImportRecord,
  type PreviewTemplateId,
} from '../../lib/previewTemplates';

type DemoMode = 'website' | 'dashboard' | 'client';
type DeviceMode = 'mobile' | 'tablet' | 'desktop';

interface DeloraineDemoPageProps {
  initialMode?: DemoMode;
}

const modeOptions: Array<{
  mode: DemoMode;
  label: string;
  href: string;
  icon: typeof Globe;
  description: string;
}> = [
  {
    mode: 'website',
    label: 'Website',
    href: '/demo/deloraine',
    icon: Globe,
    description: 'Preview the imported customer-facing website exactly as visitors will browse it.',
  },
  {
    mode: 'dashboard',
    label: 'Staff demo',
    href: '/demo/deloraine-dashboard',
    icon: LayoutDashboard,
    description: 'Preview the staff workspace for bookings, customers, rooms, payments, and daily operations.',
  },
  {
    mode: 'client',
    label: 'Client portal',
    href: '/demo/deloraine-client',
    icon: UserRound,
    description: 'Clients can view bookings, manage pet profiles, and receive photo updates.',
  },
];

const deviceOptions: Array<{
  device: DeviceMode;
  label: string;
  icon: typeof Smartphone;
}> = [
  { device: 'mobile', label: 'Mobile', icon: Smartphone },
  { device: 'tablet', label: 'Tablet', icon: Tablet },
  { device: 'desktop', label: 'Desktop', icon: Monitor },
];

const demoDeviceStorageKey = 'catstays_demo_device';
const demoTemplateStorageKey = 'catstays_demo_template';

function readSavedDemoDevice(): DeviceMode {
  if (typeof window === 'undefined') return 'desktop';
  const savedDevice = window.localStorage.getItem(demoDeviceStorageKey);
  return savedDevice === 'mobile' || savedDevice === 'tablet' || savedDevice === 'desktop'
    ? savedDevice
    : 'desktop';
}

export function DeloraineDemo() {
  return <DeloraineDemoPage initialMode="website" />;
}

export function DeloraineDemoDashboard() {
  return <DeloraineDemoPage initialMode="dashboard" />;
}

export function DeloraineDemoClientPortal() {
  return <DeloraineDemoPage initialMode="client" />;
}

function DeloraineDemoPage({ initialMode = 'website' }: DeloraineDemoPageProps) {
  const [requestedImportUrl] = useState(() => readRequestedImportUrl());
  const [previewData, setPreviewData] = useState<DelorainePreviewData>(() => readInitialPreviewData(requestedImportUrl));
  const [previewMode, setPreviewMode] = useState<DemoMode>(initialMode);
  const [hoveredMode, setHoveredMode] = useState<DemoMode | null>(null);
  const [deviceType, setDeviceTypeState] = useState<DeviceMode>(() => readSavedDemoDevice());

  useEffect(() => {
    setPreviewMode(initialMode);
  }, [initialMode]);

  const setDeviceType = (device: DeviceMode) => {
    setDeviceTypeState(device);
    window.localStorage.setItem(demoDeviceStorageKey, device);
  };

  const selectedTemplate = normalizePreviewTemplateId(previewData.selectedTemplate || 'original');
  const modeHref = (href: string) => `${href}?source=${encodeURIComponent(requestedImportUrl)}`;

  const selectTemplate = (template: PreviewTemplateId) => {
    const nextData = dataForTemplate(previewData, template);
    setPreviewData(nextData);
    saveSelectedDemoTemplate(template);
    persistPreviewData(nextData);
  };

  const persistSelectedPreviewForSignup = () => {
    const nextData = dataForTemplate(previewData, selectedTemplate);
    saveSelectedDemoTemplate(selectedTemplate);
    persistPreviewData(nextData);
    try {
      window.localStorage.setItem('catstays_onboarding', JSON.stringify({
        step: 2,
        data: {
          ...nextData,
          websiteUrl: (nextData as any).importSourceUrl || nextData.sourceUrl || requestedImportUrl,
          importComplete: true,
        },
        accountCreated: false,
      }));
    } catch {
      // Continuing to signup still works without local persistence.
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadImportedWebsite() {
      try {
        const response = await fetch('/api/website/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: requestedImportUrl }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Import failed');
        }
        if (cancelled) return;
        const importedPreview = previewDataForScrape(payload as ImportedCatteryScrape);
        setPreviewData(importedPreview);
      } catch {
        if (cancelled) return;
        const fallbackScrape = isDeloraineRequest(requestedImportUrl)
          ? fallbackDeloraineScrape
          : buildFallbackScrapeForUrl(requestedImportUrl);
        const fallbackPreview = previewDataForScrape(fallbackScrape);
        setPreviewData(fallbackPreview);
      }
    }

    loadImportedWebsite();
    return () => {
      cancelled = true;
    };
  }, [requestedImportUrl]);

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#10251f]">
      <nav className="sticky top-0 z-50 border-b border-[#C46A3A]/40 bg-[#0A1128] text-white shadow-sm">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/85">
            <ArrowLeft className="h-4 w-4 text-[#D28A4A]" />
            Back to CatStays
          </Link>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="rounded-full border border-[#D28A4A]/50 bg-[#D28A4A]/15 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-[#F5C08A]">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/signup" onClick={persistSelectedPreviewForSignup}>
              <Button className="bg-[#A85A30] text-white hover:bg-[#8A3F20]">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-b border-[#0A1128]/10 bg-[#0A1128] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-2.5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex flex-wrap items-center gap-2">
            {modeOptions.map(({ mode, label, href, icon: Icon, description }) => {
              const active = previewMode === mode;
              return (
                <Link
                  key={mode}
                  to={modeHref(href)}
                  onClick={() => setPreviewMode(mode)}
                  onMouseEnter={() => setHoveredMode(mode)}
                  onMouseLeave={() => setHoveredMode(null)}
                  onFocus={() => setHoveredMode(mode)}
                  onBlur={() => setHoveredMode(null)}
                  className="group relative"
                  aria-label={`${label}: ${description}`}
                  title={description}
                >
                  <span
                    className={`inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                      active
                        ? 'bg-white text-[#0A1128]'
                        : 'bg-white/8 text-white ring-1 ring-white/20 hover:bg-white/15'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#C46A3A]' : 'text-[#F5C08A]'}`} />
                    {label}
                  </span>
                  <span
                    className={`pointer-events-none absolute left-0 top-full z-30 mt-2 w-72 rounded-md border border-[#C46A3A]/30 bg-[#0A1128] p-3 text-left text-xs leading-5 text-white shadow-xl transition ${
                      hoveredMode === mode
                        ? 'visible opacity-100'
                        : 'invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100'
                    }`}
                  >
                    {description}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-end">
            {deviceOptions.map(({ device, label, icon: Icon }) => {
              const active = deviceType === device;
              return (
                <button
                  key={device}
                  type="button"
                  onClick={() => setDeviceType(device)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition ${
                    active
                      ? 'bg-[#C46A3A] text-white'
                      : 'bg-white/8 text-white ring-1 ring-white/20 hover:bg-white/15'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {previewMode === 'website' && (
        <TemplatePreviewStrip
          data={previewData}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={selectTemplate}
        />
      )}

      <main className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
        <FullWebsitePreview
          data={previewData}
          controlledMode={previewMode}
          controlledDevice={deviceType}
          showControls={false}
          showInfoCard={false}
        />
      </main>
    </div>
  );
}

function TemplatePreviewStrip({
  data,
  selectedTemplate,
  onSelectTemplate,
}: {
  data: DelorainePreviewData;
  selectedTemplate: PreviewTemplateId;
  onSelectTemplate: (template: PreviewTemplateId) => void;
}) {
  return (
    <section className="border-b border-[#0A1128]/10 bg-[#111923] text-white">
      <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#F5C08A]">Website versions</p>
            <h2 className="font-serif text-2xl leading-tight">{data.businessName}</h2>
          </div>
          <p className="text-sm text-white/70">{templateLabel(selectedTemplate)} selected</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {previewTemplateCards.map((template) => {
            const active = selectedTemplate === template.id;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelectTemplate(template.id)}
                aria-pressed={active}
                className={`group rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-[#F5C08A] bg-white text-[#0A1128] shadow-lg shadow-black/25'
                    : 'border-white/14 bg-white/6 text-white hover:border-[#F5C08A]/70 hover:bg-white/10'
                }`}
              >
                <div className="relative overflow-hidden rounded-lg border border-current/15 bg-white">
                  <TemplateSnapshot template={template.id} data={data} />
                  {active && (
                    <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C46A3A] text-white shadow">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{template.name}</h3>
                    <p className={`mt-0.5 text-xs leading-5 ${active ? 'text-[#0A1128]/65' : 'text-white/60'}`}>
                      {templateDescription(template.id)}
                    </p>
                  </div>
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full border ${
                      active ? 'border-[#C46A3A] bg-[#C46A3A]' : 'border-white/40'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TemplateSnapshot({
  template,
  data,
}: {
  template: PreviewTemplateId;
  data: DelorainePreviewData;
}) {
  const heroImage = data.heroImage || data.galleryData?.galleryImages?.[0]?.url || '';
  const name = data.businessName || 'Your Cattery';
  const heading = data.heroHeading || name;

  if (template === 'editorial-guide') {
    return (
      <div className="grid h-36 grid-cols-2 bg-[#f8f5ef] text-[#222]">
        <div className="flex flex-col justify-center p-4">
          <span className="mb-2 h-1.5 w-14 rounded bg-[#b58b4a]/60" />
          <p className="line-clamp-4 font-serif text-xl leading-[1.05]">{heading}</p>
        </div>
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <img src={data.galleryData?.galleryImages?.[1]?.url || heroImage} alt="" className="h-full w-full object-cover" />
        <div className="flex flex-col justify-center p-4">
          <span className="mb-2 h-1.5 w-10 rounded bg-[#b58b4a]/60" />
          <span className="mb-1 h-2 rounded bg-[#222]/70" />
          <span className="h-2 w-2/3 rounded bg-[#222]/25" />
        </div>
      </div>
    );
  }

  if (template === 'modern-showcase') {
    return (
      <div className="relative h-36 overflow-hidden bg-[#1f241b]">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute left-4 top-3 h-2 w-20 rounded bg-white/80" />
        <div className="absolute bottom-5 left-4 right-12">
          <p className="line-clamp-3 font-serif text-2xl font-bold leading-[1.02] text-white">{heading}</p>
        </div>
        <div className="absolute bottom-3 left-4 flex gap-1">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-2 w-9 rounded bg-white/75" />
          ))}
        </div>
      </div>
    );
  }

  if (template === 'conversion-focus') {
    return (
      <div className="h-36 bg-[#f8f5ef] text-[#222]">
        <div className="grid h-[108px] grid-cols-[1fr_1.25fr]">
          <div className="flex flex-col justify-center p-4">
            <p className="line-clamp-3 font-serif text-xl leading-[1.05]">{heading}</p>
            <span className="mt-3 h-3 w-20 rounded bg-[#1f241b]" />
          </div>
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="mx-3 -mt-3 grid grid-cols-4 gap-1 rounded-md border border-[#222]/10 bg-white p-2 shadow">
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={`h-5 rounded ${index === 3 ? 'bg-[#1f241b]' : 'bg-[#efe7dd]'}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-36 bg-[#f8f5ef] text-white">
      <div className="flex h-6 items-center gap-1 bg-white px-3">
        <span className="h-2 w-2 rounded-full bg-[#C46A3A]" />
        <span className="h-2 w-2 rounded-full bg-[#F5C08A]" />
        <span className="h-2 w-2 rounded-full bg-[#8BA28B]" />
        <span className="ml-auto h-2 w-12 rounded bg-[#0A1128]/15" />
      </div>
      <div className="relative h-[114px] overflow-hidden">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-4 bottom-5">
          <p className="line-clamp-2 font-serif text-2xl font-bold leading-tight">{name}</p>
        </div>
        <div className="absolute bottom-2 left-4 right-4 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <span key={index} className="h-5 rounded bg-white/85" />
          ))}
        </div>
      </div>
    </div>
  );
}

function templateLabel(template: PreviewTemplateId) {
  return previewTemplateCards.find((card) => card.id === template)?.name || 'Focus';
}

function templateDescription(template: PreviewTemplateId) {
  if (template === 'original') return 'Scraped source';
  if (template === 'conversion-focus') return 'Booking first';
  if (template === 'editorial-guide') return 'Story led';
  return 'Image led';
}

function previewDataForScrape(scrape: ImportedCatteryScrape): DelorainePreviewData {
  const record = buildPreviewImportRecord(scrape);
  savePreviewImportRecord(record);
  const selectedTemplate = readSavedDemoTemplate() || record.selectedTemplate;
  const previewData = dataFromPreviewRecord(record, selectedTemplate, record.normalizedPreviewData) as DelorainePreviewData;
  rememberCatteryPreview(scrape, previewData);
  return previewData;
}

function dataForTemplate(data: DelorainePreviewData, template: PreviewTemplateId): DelorainePreviewData {
  const selectedTemplate = normalizePreviewTemplateId(template);
  const record = (data as any).previewImportRecord as PreviewImportRecord | undefined;

  if (record) {
    const nextData = dataFromPreviewRecord(record, selectedTemplate, data) as DelorainePreviewData;
    savePreviewImportRecord((nextData as any).previewImportRecord as PreviewImportRecord);
    return nextData;
  }

  return {
    ...data,
    selectedTemplate,
  };
}

function readSavedDemoTemplate(): PreviewTemplateId | null {
  if (typeof window === 'undefined') return null;
  const savedTemplate = window.localStorage.getItem(demoTemplateStorageKey) || window.sessionStorage.getItem(demoTemplateStorageKey);
  if (!savedTemplate) return null;
  return normalizePreviewTemplateId(savedTemplate);
}

function saveSelectedDemoTemplate(template: PreviewTemplateId) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(demoTemplateStorageKey, template);
  window.sessionStorage.setItem(demoTemplateStorageKey, template);
}

function persistPreviewData(previewData: DelorainePreviewData) {
  if (typeof window === 'undefined') return;

  try {
    const existingRaw =
      window.sessionStorage.getItem(PREVIEW_DATA_STORAGE_KEY) ||
      window.localStorage.getItem(PREVIEW_DATA_STORAGE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const payload = JSON.stringify({
      ...existing,
      previewData,
      selectedTemplate: previewData.selectedTemplate,
      savedAt: new Date().toISOString(),
    });
    window.sessionStorage.setItem(PREVIEW_DATA_STORAGE_KEY, payload);
    window.localStorage.setItem(PREVIEW_DATA_STORAGE_KEY, payload);
  } catch {
    // Storage is optional; the live in-memory preview is still updated.
  }
}

function readRequestedImportUrl(): string {
  if (typeof window === 'undefined') return DELORAINE_SOURCE_URL;

  const sourceParam = new URLSearchParams(window.location.search).get('source');
  const requestedUrl =
    sourceParam ||
    window.localStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
    window.sessionStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
    window.localStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
    window.sessionStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
    DELORAINE_SOURCE_URL;

  window.localStorage.setItem(PREVIEW_URL_STORAGE_KEY, requestedUrl);
  window.sessionStorage.setItem(PREVIEW_URL_STORAGE_KEY, requestedUrl);
  return requestedUrl;
}

function readInitialPreviewData(requestedUrl: string): DelorainePreviewData {
  const storedPreview = readStoredPreviewData(requestedUrl);
  if (storedPreview) return storedPreview;
  if (isDeloraineRequest(requestedUrl)) return previewDataForScrape(fallbackDeloraineScrape);
  return previewDataForScrape(buildFallbackScrapeForUrl(requestedUrl));
}

function readStoredPreviewData(requestedUrl: string): DelorainePreviewData | null {
  if (typeof window === 'undefined') return null;

  const raw =
    window.sessionStorage.getItem(PREVIEW_DATA_STORAGE_KEY) ||
    window.localStorage.getItem(PREVIEW_DATA_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      scrape?: ImportedCatteryScrape;
      previewData?: DelorainePreviewData;
      selectedTemplate?: string;
    };
    const sourceUrl = parsed.scrape?.sourceUrl || parsed.previewData?.sourceUrl || (parsed.previewData as any)?.importSourceUrl;
    if (!parsed.previewData || !sourceMatchesRequest(sourceUrl, requestedUrl)) return null;

    const selectedTemplate = readSavedDemoTemplate() || normalizePreviewTemplateId(parsed.selectedTemplate || parsed.previewData.selectedTemplate || 'original');
    if (parsed.scrape) {
      const record = buildPreviewImportRecord(parsed.scrape);
      savePreviewImportRecord(record);
      return dataFromPreviewRecord(record, selectedTemplate, parsed.previewData) as DelorainePreviewData;
    }

    return dataForTemplate(parsed.previewData, selectedTemplate);
  } catch {
    return null;
  }
}

function isDeloraineRequest(requestedUrl: string): boolean {
  return sourceMatchesRequest(DELORAINE_SOURCE_URL, requestedUrl);
}
