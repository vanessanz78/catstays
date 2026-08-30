import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Edit3, Loader2, Megaphone, PauseCircle, PlayCircle, Plus, Search, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { effectivePromotionStatus, normalizePromotionCode, promotionMatchesQuery, promotionOffer, type CatteryPromotion } from '@/app/lib/marketingCampaigns';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

type PromotionDraft = {
  name: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  valid_from: string;
  valid_to: string;
  minimum_days: string;
  maximum_uses: string;
  status: 'draft' | 'active';
  terms: string;
};

const emptyDraft: PromotionDraft = {
  name: '', code: '', discount_type: 'percentage', discount_value: '', valid_from: '', valid_to: '',
  minimum_days: '1', maximum_uses: '', status: 'active', terms: '',
};

const fieldClass = 'mt-1 h-11 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function dateLabel(value: string | null) {
  if (!value) return 'No end date';
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusTone(status: ReturnType<typeof effectivePromotionStatus>) {
  if (status === 'active') return 'bg-[#2D7A42] text-white hover:bg-[#2D7A42]';
  if (status === 'expired') return 'bg-[#768098] text-white hover:bg-[#768098]';
  if (status === 'paused') return 'bg-amber-600 text-white hover:bg-amber-600';
  return 'bg-[#0A1128] text-white hover:bg-[#0A1128]';
}

export function AdminPromotions() {
  const { cattery, user } = useAuth();
  const [promotions, setPromotions] = useState<CatteryPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [draft, setDraft] = useState<PromotionDraft>(emptyDraft);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const loadPromotions = async () => {
    if (!cattery?.id) { setPromotions([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('cattery_promotions')
      .select('id,cattery_id,name,code,discount_type,discount_value,valid_from,valid_to,minimum_days,maximum_uses,usage_count,status,terms,created_at,updated_at')
      .eq('cattery_id', cattery.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    if (error) setNotice({ tone: 'error', text: `Promotions could not be loaded. ${error.message}` });
    else setPromotions((data || []).map((row) => ({ ...row, discount_value: Number(row.discount_value) })) as CatteryPromotion[]);
    setLoading(false);
  };

  useEffect(() => { void loadPromotions(); }, [cattery?.id]);

  const filteredPromotions = useMemo(() => promotions.filter((promotion) => promotionMatchesQuery(promotion, search)), [promotions, search]);
  const activeCount = promotions.filter((promotion) => effectivePromotionStatus(promotion) === 'active').length;
  const totalUses = promotions.reduce((sum, promotion) => sum + promotion.usage_count, 0);

  const openNew = () => { setEditingId(''); setDraft(emptyDraft); setNotice(null); setEditorOpen(true); };
  const openEdit = (promotion: CatteryPromotion) => {
    setEditingId(promotion.id);
    setDraft({
      name: promotion.name, code: promotion.code, discount_type: promotion.discount_type, discount_value: String(promotion.discount_value),
      valid_from: promotion.valid_from || '', valid_to: promotion.valid_to || '', minimum_days: String(promotion.minimum_days),
      maximum_uses: promotion.maximum_uses === null ? '' : String(promotion.maximum_uses),
      status: promotion.status === 'draft' ? 'draft' : 'active', terms: promotion.terms || '',
    });
    setNotice(null); setEditorOpen(true);
  };

  const savePromotion = async () => {
    const value = Number(draft.discount_value);
    const minimumDays = Number.parseInt(draft.minimum_days || '1', 10);
    const maximumUses = draft.maximum_uses ? Number.parseInt(draft.maximum_uses, 10) : null;
    if (!cattery?.id || !user || !draft.name.trim() || !draft.code.trim() || !Number.isFinite(value) || value <= 0) {
      setNotice({ tone: 'error', text: 'Add a promotion name, code, and discount greater than zero.' }); return;
    }
    if (draft.discount_type === 'percentage' && value > 100) { setNotice({ tone: 'error', text: 'A percentage discount cannot be more than 100%.' }); return; }
    if (draft.valid_from && draft.valid_to && draft.valid_from > draft.valid_to) { setNotice({ tone: 'error', text: 'The end date must be on or after the start date.' }); return; }
    setBusy('save'); setNotice(null);
    const payload = {
      cattery_id: cattery.id, name: draft.name.trim(), code: normalizePromotionCode(draft.code), discount_type: draft.discount_type,
      discount_value: value, valid_from: draft.valid_from || null, valid_to: draft.valid_to || null,
      minimum_days: Math.max(1, Number.isFinite(minimumDays) ? minimumDays : 1),
      maximum_uses: maximumUses && maximumUses > 0 ? maximumUses : null, status: draft.status,
      terms: draft.terms.trim() || null, created_by: user.id,
    };
    const result = editingId
      ? await supabase.from('cattery_promotions').update(payload).eq('id', editingId).eq('cattery_id', cattery.id)
      : await supabase.from('cattery_promotions').insert(payload);
    if (result.error) {
      const duplicate = result.error.code === '23505' ? ' That code is already used by another promotion.' : '';
      setNotice({ tone: 'error', text: `Promotion could not be saved.${duplicate || ` ${result.error.message}`}` });
    } else {
      setEditorOpen(false); setNotice({ tone: 'success', text: `${draft.name.trim()} was saved to this cattery.` }); await loadPromotions();
    }
    setBusy('');
  };

  const togglePromotion = async (promotion: CatteryPromotion) => {
    if (!cattery?.id) return;
    const nextStatus = promotion.status === 'paused' ? 'active' : 'paused';
    setBusy(promotion.id);
    const { error } = await supabase.from('cattery_promotions').update({ status: nextStatus }).eq('id', promotion.id).eq('cattery_id', cattery.id);
    if (error) setNotice({ tone: 'error', text: `Promotion could not be updated. ${error.message}` });
    else { setNotice({ tone: 'success', text: `${promotion.name} is now ${nextStatus}.` }); await loadPromotions(); }
    setBusy('');
  };

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><RightMenu /></div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p><h1 className="truncate text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1></div></div>
            <NotificationBell />
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Marketing</p><h2 className="text-3xl font-semibold">Promotions</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">Create genuine cattery offers and reusable promotion codes. Every record belongs only to this cattery.</p></div>
            <Button onClick={openNew} className="bg-[#C46A3A] hover:bg-[#A85A30]"><Plus className="mr-2 h-4 w-4" />New promotion</Button>
          </div>
          {notice && <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p>{notice.text}</p></div>}
          <div className="grid gap-4 sm:grid-cols-3">
            {[{ label: 'Active offers', value: activeCount, icon: Megaphone }, { label: 'Promotion uses', value: totalUses, icon: Tag }, { label: 'Saved offers', value: promotions.length, icon: CalendarDays }].map(({ label, value, icon: Icon }) => <Card key={label} className="border-[#E8DED4] bg-white"><CardContent className="flex items-center gap-4 p-5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#C46A3A]/10"><Icon className="h-5 w-5 text-[#C46A3A]" /></span><span><span className="block text-2xl font-semibold">{value}</span><span className="text-sm text-[#4E5871]">{label}</span></span></CardContent></Card>)}
          </div>
          {editorOpen && <Card className="border-[#C46A3A]/30 bg-white shadow-md"><CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold">{editingId ? 'Edit promotion' : 'Create promotion'}</h3><p className="mt-1 text-sm text-[#4E5871]">Use clear dates and terms so staff can quote the offer consistently.</p></div><Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold sm:col-span-2">Promotion name<input className={fieldClass} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className="text-sm font-semibold">Promotion code<input className={`${fieldClass} font-mono uppercase`} value={draft.code} onChange={(event) => setDraft({ ...draft, code: normalizePromotionCode(event.target.value) })} /></label>
              <label className="text-sm font-semibold">Initial status<select className={fieldClass} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PromotionDraft['status'] })}><option value="active">Active</option><option value="draft">Draft</option></select></label>
              <label className="text-sm font-semibold">Discount type<select className={fieldClass} value={draft.discount_type} onChange={(event) => setDraft({ ...draft, discount_type: event.target.value as PromotionDraft['discount_type'] })}><option value="percentage">Percentage</option><option value="fixed">Fixed NZD amount</option></select></label>
              <label className="text-sm font-semibold">Discount value<input type="number" min="0.01" step="0.01" className={fieldClass} value={draft.discount_value} onChange={(event) => setDraft({ ...draft, discount_value: event.target.value })} /></label>
              <label className="text-sm font-semibold">Valid from<input type="date" className={fieldClass} value={draft.valid_from} onChange={(event) => setDraft({ ...draft, valid_from: event.target.value })} /></label>
              <label className="text-sm font-semibold">Valid until<input type="date" className={fieldClass} value={draft.valid_to} onChange={(event) => setDraft({ ...draft, valid_to: event.target.value })} /></label>
              <label className="text-sm font-semibold">Minimum stay days<input type="number" min="1" className={fieldClass} value={draft.minimum_days} onChange={(event) => setDraft({ ...draft, minimum_days: event.target.value })} /></label>
              <label className="text-sm font-semibold">Maximum uses (optional)<input type="number" min="1" className={fieldClass} value={draft.maximum_uses} onChange={(event) => setDraft({ ...draft, maximum_uses: event.target.value })} /></label>
              <label className="text-sm font-semibold sm:col-span-2">Terms (optional)<input className={fieldClass} value={draft.terms} onChange={(event) => setDraft({ ...draft, terms: event.target.value })} /></label>
            </div>
            <div className="rounded-xl bg-[#F8F1EC] p-4 text-sm"><strong>Preview:</strong> {draft.name || 'Promotion name'} · {draft.discount_value ? promotionOffer({ discount_type: draft.discount_type, discount_value: Number(draft.discount_value) }) : 'discount'} · code <span className="font-mono font-semibold">{draft.code || 'CODE'}</span></div>
            <Button onClick={() => void savePromotion()} disabled={busy === 'save'} className="w-full bg-[#C46A3A] hover:bg-[#A85A30]">{busy === 'save' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}{editingId ? 'Save changes' : 'Create promotion'}</Button>
          </CardContent></Card>}
          <Card className="min-w-0 border-[#E8DED4] bg-white shadow-sm"><CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-[#E8DED4] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-semibold">Your promotions</h3><p className="mt-1 text-sm text-[#4E5871]">Pause an offer without losing its history.</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768098]" /><input aria-label="Search promotions" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D1C8] pl-9 pr-3 outline-none focus:border-[#C46A3A]" /></div></div>
            {loading ? <div className="grid min-h-56 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C46A3A]" /></div> : filteredPromotions.length ? <div className="divide-y divide-[#E8DED4]">{filteredPromotions.map((promotion) => {
              const status = effectivePromotionStatus(promotion);
              return <article key={promotion.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="text-lg font-semibold">{promotion.name}</h4><Badge className={statusTone(status)}>{status}</Badge><Badge variant="outline" className="font-mono">{promotion.code}</Badge></div><p className="mt-2 text-sm text-[#4E5871]">{promotionOffer(promotion)} · minimum {promotion.minimum_days} day{promotion.minimum_days === 1 ? '' : 's'} · ends {dateLabel(promotion.valid_to)}</p>{promotion.terms && <p className="mt-1 text-sm text-[#768098]">{promotion.terms}</p>}</div><div className="flex flex-col gap-2 sm:flex-row"><Button variant="outline" onClick={() => openEdit(promotion)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button><Button variant="outline" disabled={busy === promotion.id || status === 'expired'} onClick={() => void togglePromotion(promotion)}>{promotion.status === 'paused' ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}{promotion.status === 'paused' ? 'Resume' : 'Pause'}</Button></div></div></article>;
            })}</div> : <div className="p-10 text-center"><Megaphone className="mx-auto h-10 w-10 text-[#C46A3A]" /><h3 className="mt-4 text-xl font-semibold">{search ? 'No matching promotions' : 'No promotions yet'}</h3><p className="mt-2 text-sm text-[#4E5871]">{search ? 'Try a different name, code, or term.' : 'Create the cattery’s first offer above.'}</p></div>}
          </CardContent></Card>
          <p className="text-xs leading-5 text-[#768098]">Promotion codes are stored as staff-managed offer records. The Social Media workspace can reuse them in ready-to-share posts. Usage remains zero until a future booking-redemption step records it.</p>
        </main>
      </div>
    </div>
  );
}
