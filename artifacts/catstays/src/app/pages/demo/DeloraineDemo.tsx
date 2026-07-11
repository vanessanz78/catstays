import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ArrowLeft, CheckCircle, Globe, LayoutDashboard, Monitor, Smartphone, Tablet, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { CatstaysTemplateSite } from '../onboarding/CatstaysTemplateSite';
import { FullWebsitePreview } from '../onboarding/FullWebsitePreview';
import {
  buildFallbackScrapeForUrl,
  DELORAINE_SOURCE_URL,
  fallbackDeloraineScrape,
  IMPORT_URL_STORAGE_KEY,
  migrateDeloraineAssetsInValue,
  PREVIEW_SOURCE_INTENT_STORAGE_KEY,
  PREVIEW_URL_STORAGE_KEY,
  rememberCatteryPreview,
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

const demoTemplateStorageKey = 'catstays_demo_template';

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
  const location = useLocation();
  const [requestedImportUrl] = useState(() => readRequestedImportUrl());
  const [previewData, setPreviewData] = useState<DelorainePreviewData>(() => readInitialPreviewData(requestedImportUrl));
  const [previewMode, setPreviewMode] = useState<DemoMode>(initialMode);
  const [hoveredMode, setHoveredMode] = useState<DemoMode | null>(null);
  const [deviceType, setDeviceTypeState] = useState<DeviceMode>('desktop');

  useEffect(() => {
    setPreviewMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (location.hash) return;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [location.pathname, location.search, location.hash]);

  const setDeviceType = (device: DeviceMode) => {
    setDeviceTypeState(device);
  };

  const selectedTemplate = normalizePreviewTemplateId(previewData.selectedTemplate || 'original');
  const modeHref = (href: string) => href;

  const selectTemplate = (template: PreviewTemplateId) => {
    const nextData = dataForTemplate(previewData, template);
    setPreviewData(nextData);
    saveSelectedDemoTemplate(template);
  };

  const persistSelectedPreviewForSignup = () => {
    const nextData = dataForTemplate(previewData, selectedTemplate);
    saveSelectedDemoTemplate(selectedTemplate);
    try {
      window.localStorage.setItem('catstays_onboarding', JSON.stringify({
        step: 2,
        data: lightweightPreviewState(nextData, requestedImportUrl),
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
        const importedPreview = previewDataForScrape(migrateDeloraineAssetsInValue(payload as ImportedCatteryScrape));
        setPreviewData(importedPreview);
      } catch {
        if (cancelled) return;
        const fallbackScrape = isDeloraineRequest(requestedImportUrl)
          ? fallbackDeloraineScrape
          : buildFallbackScrapeForUrl(requestedImportUrl);
        const fallbackPreview = previewDataForScrape(migrateDeloraineAssetsInValue(fallbackScrape));
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
      <nav data-catstays-demo-header className="sticky top-0 z-50 border-b border-[#C46A3A]/40 bg-[#0A1128] text-white shadow-sm">
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

      <main className={previewMode === 'website' && deviceType === 'desktop' ? 'w-full p-0' : 'mx-auto w-full px-4 py-4 sm:px-6 lg:px-8'}>
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
              <div
                key={template.id}
                className={`group relative rounded-xl border bg-white/6 p-3 text-left text-white transition ${
                  active
                    ? 'border-[#C46A3A] shadow-lg shadow-black/25'
                    : 'border-white/14 hover:border-[#C46A3A]/70 hover:bg-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTemplate(template.id)}
                  aria-pressed={active}
                  aria-label={`${data.businessName} ${template.name} ${templateDescription(template.id)}`}
                  className="absolute inset-0 z-20 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#F5C08A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111923]"
                />
                <div className="pointer-events-none relative z-10 overflow-hidden rounded-lg border border-current/15 bg-white">
                  <TemplateSnapshot template={template.id} data={data} />
                  {active && (
                    <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C46A3A] text-white shadow">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <div className="pointer-events-none relative z-10 mt-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold">{template.name}</h3>
                    <p className="mt-0.5 text-xs leading-5 text-white/60">
                      {templateDescription(template.id)}
                    </p>
                  </div>
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full border ${
                      active ? 'border-[#C46A3A] bg-[#C46A3A]' : 'border-white/40'
                    }`}
                  />
                </div>
              </div>
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
  const miniatureScale = 0.22;
  const miniatureStyle = {
    width: `${100 / miniatureScale}%`,
    height: `${100 / miniatureScale}%`,
    transform: `scale(${miniatureScale})`,
    transformOrigin: 'top left',
  };

  if (template === 'original') {
    const sourceUrl = sourceUrlForSnapshot(data);
    return (
      <div className="relative h-36 overflow-hidden bg-white">
        <iframe
          src={sourceUrl}
          title={`${data.businessName || 'Original website'} thumbnail`}
          loading="lazy"
          className="absolute left-0 top-0 border-0 bg-white"
          style={miniatureStyle}
        />
      </div>
    );
  }

  return (
    <div className="relative h-36 overflow-hidden bg-white">
      <div className="absolute left-0 top-0" style={miniatureStyle}>
        <CatstaysTemplateSite data={data} templateId={template} embedded />
      </div>
    </div>
  );
}

function sourceUrlForSnapshot(data: DelorainePreviewData) {
  const record = (data as any).previewImportRecord as PreviewImportRecord | undefined;
  const sourceUrl = record?.source?.url || (data as any).importSourceUrl || (data as any).sourceUrl || DELORAINE_SOURCE_URL;
  const trimmedUrl = String(sourceUrl).trim();
  if (!trimmedUrl) return DELORAINE_SOURCE_URL;
  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
}

function templateLabel(template: PreviewTemplateId) {
  return previewTemplateCards.find((card) => card.id === template)?.name || 'Focus';
}

function templateDescription(template: PreviewTemplateId) {
  if (template === 'original') return 'Owner site';
  if (template === 'conversion-focus') return 'Booking first';
  if (template === 'editorial-guide') return 'Story led';
  return 'Image led';
}

function previewDataForScrape(scrape: ImportedCatteryScrape): DelorainePreviewData {
  const record = buildPreviewImportRecord(scrape);
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

function readRequestedImportUrl(): string {
  if (typeof window === 'undefined') return DELORAINE_SOURCE_URL;

  const sourceParam = new URLSearchParams(window.location.search).get('source');
  const sourceIntent = window.sessionStorage.getItem(PREVIEW_SOURCE_INTENT_STORAGE_KEY);
  const explicitPreviewSource = sourceIntent === 'form-submit';
  const requestedUrl =
    explicitPreviewSource
      ? window.sessionStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
        window.localStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
        window.sessionStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
        window.localStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
        sourceParam ||
        DELORAINE_SOURCE_URL
      : DELORAINE_SOURCE_URL;

  window.localStorage.setItem(PREVIEW_URL_STORAGE_KEY, requestedUrl);
  window.sessionStorage.setItem(PREVIEW_URL_STORAGE_KEY, requestedUrl);
  return requestedUrl;
}

function readInitialPreviewData(requestedUrl: string): DelorainePreviewData {
  if (isDeloraineRequest(requestedUrl)) return previewDataForScrape(fallbackDeloraineScrape);
  return previewDataForScrape(buildFallbackScrapeForUrl(requestedUrl));
}

function isDeloraineRequest(requestedUrl: string): boolean {
  return /delorainecattery\.com/i.test(requestedUrl);
}

function lightweightPreviewState(previewData: DelorainePreviewData, requestedUrl: string) {
  const record = (previewData as any).previewImportRecord as PreviewImportRecord | undefined;
  return {
    websiteUrl: (previewData as any).importSourceUrl || previewData.sourceUrl || requestedUrl,
    importSourceUrl: (previewData as any).importSourceUrl || previewData.sourceUrl || requestedUrl,
    sourceUrl: previewData.sourceUrl || requestedUrl,
    sourceHost: (previewData as any).sourceHost,
    selectedTemplate: previewData.selectedTemplate,
    previewImportRecordId: record?.id || (previewData as any).previewImportRecordId || '',
    previewRecordStatus: (previewData as any).previewRecordStatus || record?.status || 'preview',
    importComplete: true,
  };
}
