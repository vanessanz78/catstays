import { useEffect, useRef, useState } from 'react';
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
  PREVIEW_SOURCE_TOKEN_STORAGE_KEY,
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
import { sourceRebuildHtmlFromData } from '../../lib/sourceRebuildPreview';
import { normalizeWebsiteImportUrl } from '../../lib/websiteImportUrl';
import { supabase } from '@/utils/supabase/client';

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
  const [importError, setImportError] = useState('');
  const preserveTemporaryPreviewRef = useRef(false);

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
  const selectedTemplateRef = useRef<PreviewTemplateId>(selectedTemplate);

  useEffect(() => {
    selectedTemplateRef.current = selectedTemplate;
  }, [selectedTemplate]);

  const modeHref = (href: string) => href;

  const selectTemplate = (template: PreviewTemplateId) => {
    selectedTemplateRef.current = template;
    saveSelectedDemoTemplate(template);
    const nextData = dataForTemplate(previewData, template);
    setPreviewData(nextData);
  };

  const persistSelectedPreviewForSignup = () => {
    preserveTemporaryPreviewRef.current = true;
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
    const abandonOnPageExit = () => {
      if (preserveTemporaryPreviewRef.current) return;
      void abandonSavedTemporaryPreview();
    };

    window.addEventListener('pagehide', abandonOnPageExit);
    return () => {
      window.removeEventListener('pagehide', abandonOnPageExit);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadImportedWebsite() {
      try {
        const savedPreview = await fetchSavedTemporaryPreview();
        if (savedPreview && sameSourceUrl(savedPreview.sourceUrl, requestedImportUrl)) {
          if (cancelled) return;
          const importedPreview = previewDataForScrape(migrateDeloraineAssetsInValue(savedPreview));
          setImportError('');
          setPreviewData(dataForTemplate(importedPreview, selectedTemplateRef.current));
          return;
        }

        const request = await scrapeRequestForUrl(requestedImportUrl);
        const response = await fetch('/api/website/scrape', {
          method: 'POST',
          headers: request.headers,
          body: JSON.stringify(request.body),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Import failed');
        }
        if (cancelled) return;
        const importedPreview = previewDataForScrape(migrateDeloraineAssetsInValue(payload as ImportedCatteryScrape));
        setImportError('');
        setPreviewData(dataForTemplate(importedPreview, selectedTemplateRef.current));
      } catch (error) {
        if (cancelled) return;
        setImportError((error as Error).message || 'Import failed');
        if (!isDeloraineRequest(requestedImportUrl)) {
          setPreviewData((current) => {
            if (hasImportedPreviewData(current, requestedImportUrl)) return current;
            return current;
          });
          return;
        }
        const fallbackScrape = isDeloraineRequest(requestedImportUrl)
          ? fallbackDeloraineScrape
          : buildFallbackScrapeForUrl(requestedImportUrl);
        const fallbackPreview = previewDataForScrape(migrateDeloraineAssetsInValue(fallbackScrape));
        setPreviewData(dataForTemplate(fallbackPreview, selectedTemplateRef.current));
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
          <Link
            to="/"
            onClick={() => {
              void abandonSavedTemporaryPreview();
            }}
            className="flex items-center gap-2 text-sm font-semibold text-white hover:text-white/85"
          >
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
      {importError && !isDeloraineRequest(requestedImportUrl) && (
        <div className="border-b border-[#C46A3A]/30 bg-[#fff7ed] px-5 py-3 text-sm font-semibold text-[#8A3F20] sm:px-8 lg:px-10">
          Imported preview could not refresh from the source site. Keeping the last imported preview instead of replacing it with generic fallback content.
        </div>
      )}

      <main className={previewMode === 'website' ? 'w-full bg-[#111923] px-4 pb-10 pt-6 sm:px-8 lg:px-10' : 'mx-auto w-full px-4 py-4 sm:px-6 lg:px-8'}>
        <FullWebsitePreview
          data={previewData}
          controlledMode={previewMode}
          controlledDevice={deviceType}
          showControls={false}
          showInfoCard={false}
          forceFrame={previewMode === 'website'}
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
    const rebuildHtml = sourceRebuildHtmlFromData(data);
    return (
      <div className="relative h-36 overflow-hidden bg-white">
        <iframe
          src={rebuildHtml ? undefined : sourceUrl}
          srcDoc={rebuildHtml || undefined}
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
  rememberTemporaryPreviewSource(scrape);
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
  const storedPreviewUrl =
    window.sessionStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
    window.localStorage.getItem(PREVIEW_URL_STORAGE_KEY) ||
    window.sessionStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
    window.localStorage.getItem(IMPORT_URL_STORAGE_KEY) ||
    '';
  const requestedUrl = normalizeWebsiteImportUrl(
    sourceParam ||
      (explicitPreviewSource ? storedPreviewUrl : nonDeloraineUrl(storedPreviewUrl)) ||
      DELORAINE_SOURCE_URL,
    DELORAINE_SOURCE_URL,
  );

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

function isDeloraineRequest(requestedUrl: string): boolean {
  return /delorainecattery\.com/i.test(requestedUrl);
}

function nonDeloraineUrl(value: string): string {
  return value && !isDeloraineRequest(value) ? value : '';
}

async function scrapeRequestForUrl(url: string): Promise<{
  headers: Record<string, string>;
  body: Record<string, unknown>;
}> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const catteryId = accessToken ? readStoredCatteryId() : '';
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: {
      url,
      previewSourceToken: readSavedPreviewSourceToken(),
      persistPreview: true,
      ...(catteryId ? { catteryId } : {}),
    },
  };
}

async function fetchSavedTemporaryPreview(): Promise<ImportedCatteryScrape | null> {
  const token = readSavedPreviewSourceToken();
  if (!token) return null;
  const response = await fetch(`/api/website/preview-source?previewSourceToken=${encodeURIComponent(token)}`);
  if (response.status === 404) {
    clearTemporaryPreviewSource();
    return null;
  }
  if (!response.ok) return null;
  return await response.json() as ImportedCatteryScrape;
}

function readStoredCatteryId(): string {
  const accountId = stringFromStoredJson('catstays_account', ['catteryId']);
  if (accountId) return accountId;
  return stringFromStoredJson('catstays_onboarding', ['data', 'provisionedCatteryId']);
}

function readSavedPreviewSourceToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY) ||
    window.sessionStorage.getItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY) ||
    '';
}

function rememberTemporaryPreviewSource(scrape: ImportedCatteryScrape) {
  if (typeof window === 'undefined' || !scrape.previewSourceToken) return;
  window.localStorage.setItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY, scrape.previewSourceToken);
  window.sessionStorage.setItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY, scrape.previewSourceToken);
}

function clearTemporaryPreviewSource() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(PREVIEW_SOURCE_TOKEN_STORAGE_KEY);
}

async function abandonSavedTemporaryPreview() {
  const token = readSavedPreviewSourceToken();
  if (!token) return;
  try {
    await fetch('/api/website/preview-source/abandon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previewSourceToken: token }),
      keepalive: true,
    });
  } catch {
    // Expiry cleanup still removes abandoned temporary previews server-side.
  } finally {
    clearTemporaryPreviewSource();
  }
}

function readStoredPreviewData(requestedUrl: string): DelorainePreviewData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('catstays_onboarding');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: Record<string, unknown> };
    const data = parsed.data as unknown as DelorainePreviewData | undefined;
    if (!data || !hasImportedPreviewData(data, requestedUrl)) return null;
    return data;
  } catch {
    return null;
  }
}

function hasImportedPreviewData(data: Record<string, any> | null | undefined, requestedUrl: string): boolean {
  if (!data) return false;
  const dataUrl = data.importSourceUrl || data.sourceUrl || data.websiteUrl || data.previewImportRecord?.source?.url || '';
  if (!sameSourceUrl(dataUrl, requestedUrl)) return false;
  const serialized = JSON.stringify([
    data.previewImportRecord?.media,
    data.galleryData,
    data.sourceArchive,
    data.siteContentLibrary,
  ]);
  return /static\.wixstatic\.com|sourceArchive|siteContentLibrary|galleryImages/i.test(serialized) && !/images\.unsplash\.com/i.test(serialized);
}

function sameSourceUrl(left: unknown, right: unknown): boolean {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  return normalizeWebsiteImportUrl(left, '').replace(/\/$/, '') === normalizeWebsiteImportUrl(right, '').replace(/\/$/, '');
}

function stringFromStoredJson(storageKey: string, path: string[]): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return '';
    let current: unknown = JSON.parse(raw);
    for (const key of path) {
      if (!current || typeof current !== 'object') return '';
      current = (current as Record<string, unknown>)[key];
    }
    return typeof current === 'string' ? current.trim() : '';
  } catch {
    return '';
  }
}

function lightweightPreviewState(previewData: DelorainePreviewData, requestedUrl: string) {
  const record = (previewData as any).previewImportRecord as PreviewImportRecord | undefined;
  return {
    ...previewData,
    websiteUrl: (previewData as any).importSourceUrl || previewData.sourceUrl || requestedUrl,
    importSourceUrl: (previewData as any).importSourceUrl || previewData.sourceUrl || requestedUrl,
    sourceUrl: previewData.sourceUrl || requestedUrl,
    sourceHost: (previewData as any).sourceHost,
    selectedTemplate: previewData.selectedTemplate,
    liveTemplate: (previewData as any).liveTemplate || previewData.selectedTemplate,
    previewImportRecordId: record?.id || (previewData as any).previewImportRecordId || '',
    contentSourceId: record?.source.contentSourceId || (previewData as any).contentSourceId || '',
    contentSourceHash: record?.source.contentHash || (previewData as any).contentSourceHash || '',
    contentSourceImportVersion: record?.source.importVersion || (previewData as any).contentSourceImportVersion || '',
    previewSourceId: record?.source.previewSourceId || (previewData as any).previewSourceId || '',
    previewSourceToken: record?.source.previewSourceToken || (previewData as any).previewSourceToken || readSavedPreviewSourceToken(),
    previewSourceExpiresAt: record?.source.previewSourceExpiresAt || (previewData as any).previewSourceExpiresAt || '',
    previewRecordStatus: (previewData as any).previewRecordStatus || record?.status || 'preview',
    importComplete: true,
  };
}
