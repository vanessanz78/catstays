import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, Globe, LayoutDashboard, RefreshCw, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { FullWebsitePreview } from '../onboarding/FullWebsitePreview';
import {
  buildPreviewDataFromScrape,
  defaultDelorainePreviewData,
  DELORAINE_SOURCE_URL,
  fallbackDeloraineScrape,
  rememberCatteryPreview,
  type DelorainePreviewData,
  type ImportedCatteryScrape,
} from '../../lib/deloraineDemo';

type DemoMode = 'website' | 'dashboard' | 'client';

interface DeloraineDemoPageProps {
  initialMode?: DemoMode;
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
  const [scrape, setScrape] = useState<ImportedCatteryScrape>(fallbackDeloraineScrape);
  const [previewData, setPreviewData] = useState<DelorainePreviewData>(defaultDelorainePreviewData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadDeloraine() {
      setLoading(true);
      setError('');
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
        setScrape(payload);
        setPreviewData(importedPreview);
        rememberCatteryPreview(payload, importedPreview);
      } catch (err) {
        if (cancelled) return;
        const fallbackPreview = buildPreviewDataFromScrape(fallbackDeloraineScrape);
        setScrape(fallbackDeloraineScrape);
        setPreviewData(fallbackPreview);
        rememberCatteryPreview(fallbackDeloraineScrape, fallbackPreview);
        setError(err instanceof Error ? err.message : 'Import failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDeloraine();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const importSummary = useMemo(() => {
    const scripts = scrape.extractedFrom?.scripts ?? 0;
    const apiServices = scrape.extractedFrom?.apiServices ? 'rooms' : 'website';
    const imageCount = scrape.images?.length ?? 0;
    return `${imageCount} images, ${apiServices}, ${scripts} bundle pass${scripts === 1 ? '' : 'es'}`;
  }, [scrape]);

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#10251f]">
      <section
        className="relative min-h-[420px] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(16,37,31,.86), rgba(16,37,31,.42)), url(${previewData.heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="mx-auto flex min-h-[420px] max-w-7xl flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/" className="text-sm font-semibold text-white/90 hover:text-white">
              CatStays
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/25 bg-white/15 text-white hover:bg-white/20">
                {loading ? 'Importing live site' : 'Imported demo'}
              </Badge>
              <a href={DELORAINE_SOURCE_URL} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-[#21483f]">
                  <ExternalLink className="h-4 w-4" />
                  Source
                </Button>
              </a>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white hover:text-[#21483f]"
                onClick={() => setRefreshKey((key) => key + 1)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="max-w-3xl pb-6 text-white">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              Live cattery import demo
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {previewData.businessName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/88">
              {previewData.heroSubheading}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/demo/deloraine">
                <Button className="bg-white text-[#21483f] hover:bg-white/90">
                  <Globe className="h-4 w-4" />
                  Website
                </Button>
              </Link>
              <Link to="/demo/deloraine-dashboard">
                <Button className="bg-[#b77a35] text-white hover:bg-[#a96f2f]">
                  <LayoutDashboard className="h-4 w-4" />
                  Staff demo
                </Button>
              </Link>
              <Link to="/demo/deloraine-client">
                <Button className="bg-white/15 text-white hover:bg-white/25">
                  <UserRound className="h-4 w-4" />
                  Client portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#21483f]/12 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-[#21483f]">
              {scrape.sourceHost || 'delorainecattery.com'} to delorainecattery.catstays.app
            </p>
            <p className="text-sm text-[#21483f]/65">{importSummary}</p>
          </div>
          {error ? (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
              Fallback loaded
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800">
              Live scrape ready
            </Badge>
          )}
        </div>

        <FullWebsitePreview data={previewData} initialMode={initialMode} initialDevice="desktop" />
      </main>
    </div>
  );
}
