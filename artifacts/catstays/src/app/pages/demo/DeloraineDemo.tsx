import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Globe, LayoutDashboard, Monitor, Smartphone, Tablet, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { FullWebsitePreview } from '../onboarding/FullWebsitePreview';
import {
  buildPreviewDataFromScrape,
  defaultDelorainePreviewData,
  DELORAINE_SOURCE_URL,
  fallbackDeloraineScrape,
  rememberCatteryPreview,
  type DelorainePreviewData,
} from '../../lib/deloraineDemo';

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
  const [previewData, setPreviewData] = useState<DelorainePreviewData>(defaultDelorainePreviewData);
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

  useEffect(() => {
    let cancelled = false;

    async function loadDeloraine() {
      try {
        const response = await fetch('/api/website/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: DELORAINE_SOURCE_URL }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Import failed');
        }
        if (cancelled) return;
        const importedPreview = buildPreviewDataFromScrape(payload);
        setPreviewData(importedPreview);
        rememberCatteryPreview(payload, importedPreview);
      } catch {
        if (cancelled) return;
        const fallbackPreview = buildPreviewDataFromScrape(fallbackDeloraineScrape);
        setPreviewData(fallbackPreview);
        rememberCatteryPreview(fallbackDeloraineScrape, fallbackPreview);
      }
    }

    loadDeloraine();
    return () => {
      cancelled = true;
    };
  }, []);

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
            <Link to="/signup">
              <Button className="bg-[#A85A30] text-white hover:bg-[#8A3F20]">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section
        className="relative min-h-[390px] overflow-visible"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(16,37,31,.86), rgba(16,37,31,.42)), url(${previewData.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto flex min-h-[390px] max-w-7xl flex-col justify-end px-5 py-6 sm:px-8 lg:px-10">
          <div className="max-w-3xl pb-6 text-white">
            <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {previewData.businessName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/88">
              {previewData.heroSubheading}
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-[#0A1128]/10 bg-[#0A1128] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-2.5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex flex-wrap items-center gap-2">
            {modeOptions.map(({ mode, label, href, icon: Icon, description }) => {
              const active = previewMode === mode;
              return (
                <Link
                  key={mode}
                  to={href}
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
