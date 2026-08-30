import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarClock, CheckCircle2, Clipboard, Edit3, ExternalLink, Facebook, Instagram, Loader2, Save, Search, Send, Share2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { buildSocialCaption, effectivePromotionStatus, socialPostMatchesQuery, type CatteryPromotion, type CatterySocialPost } from '@/app/lib/marketingCampaigns';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

type Tone = 'availability' | 'care' | 'promotion';
const fieldClass = 'mt-1 h-11 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function postDate(post: CatterySocialPost) {
  const value = post.scheduled_for || post.published_at || post.updated_at || post.created_at;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function postStatusTone(status: CatterySocialPost['status']) {
  if (status === 'published') return 'bg-[#2D7A42] text-white hover:bg-[#2D7A42]';
  if (status === 'scheduled') return 'bg-[#C46A3A] text-white hover:bg-[#C46A3A]';
  return 'bg-[#768098] text-white hover:bg-[#768098]';
}

export function AdminSocial() {
  const { cattery, user } = useAuth();
  const settings = (cattery?.website_settings || {}) as Record<string, any>;
  const socialLinks = (settings.socialLinks || {}) as Record<string, string>;
  const websiteUrl = cattery?.slug ? `https://${cattery.slug}.catstays.app` : 'https://catstays.app';
  const [promotions, setPromotions] = useState<CatteryPromotion[]>([]);
  const [posts, setPosts] = useState<CatterySocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tone, setTone] = useState<Tone>('availability');
  const [promotionId, setPromotionId] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['Facebook', 'Instagram']);
  const [schedule, setSchedule] = useState('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const loadWorkspace = async () => {
    if (!cattery?.id) { setPosts([]); setPromotions([]); setLoading(false); return; }
    setLoading(true);
    const [promotionResult, postsResult] = await Promise.all([
      supabase.from('cattery_promotions').select('id,cattery_id,name,code,discount_type,discount_value,valid_from,valid_to,minimum_days,maximum_uses,usage_count,status,terms,created_at,updated_at').eq('cattery_id', cattery.id).neq('status', 'archived').order('created_at', { ascending: false }),
      supabase.from('cattery_social_posts').select('id,cattery_id,promotion_id,title,caption,platforms,image_url,status,scheduled_for,published_at,created_at,updated_at').eq('cattery_id', cattery.id).neq('status', 'archived').order('updated_at', { ascending: false }),
    ]);
    if (promotionResult.error || postsResult.error) setNotice({ tone: 'error', text: `Social workspace could not be loaded. ${promotionResult.error?.message || postsResult.error?.message}` });
    else {
      setPromotions((promotionResult.data || []).map((row) => ({ ...row, discount_value: Number(row.discount_value) })) as CatteryPromotion[]);
      setPosts((postsResult.data || []) as CatterySocialPost[]);
    }
    setLoading(false);
  };

  useEffect(() => { void loadWorkspace(); }, [cattery?.id]);

  const selectedPromotion = promotions.find((promotion) => promotion.id === promotionId) || null;
  const activePromotions = promotions.filter((promotion) => effectivePromotionStatus(promotion) === 'active');
  const filteredPosts = useMemo(() => posts.filter((post) => socialPostMatchesQuery(post, search)), [posts, search]);

  const generateCaption = () => {
    if (tone === 'promotion' && !selectedPromotion) { setNotice({ tone: 'error', text: 'Choose an active promotion before creating promotion copy.' }); return; }
    const nextCaption = buildSocialCaption({ catteryName: cattery?.name || 'Your cattery', location: cattery?.city, websiteUrl, tone, promotion: selectedPromotion });
    setCaption(nextCaption);
    if (!title.trim()) setTitle(tone === 'promotion' && selectedPromotion ? selectedPromotion.name : tone === 'care' ? 'How we care for cats' : 'Bookings available');
    setNotice({ tone: 'success', text: 'A cattery-specific draft is ready. Review every word before sharing.' });
  };

  const resetComposer = () => { setEditingId(''); setTitle(''); setCaption(''); setTone('availability'); setPromotionId(''); setSchedule(''); setPlatforms(['Facebook', 'Instagram']); };

  const editPost = (post: CatterySocialPost) => {
    setEditingId(post.id); setTitle(post.title); setCaption(post.caption); setPromotionId(post.promotion_id || '');
    setPlatforms(post.platforms); setSchedule(post.scheduled_for ? post.scheduled_for.slice(0, 16) : '');
    setNotice({ tone: 'success', text: 'Post opened in the composer. Saving will update the existing record.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savePost = async (status: 'draft' | 'scheduled') => {
    if (!cattery?.id || !user || !title.trim() || !caption.trim() || platforms.length === 0) { setNotice({ tone: 'error', text: 'Add a title, caption, and at least one platform.' }); return; }
    if (status === 'scheduled' && !schedule) { setNotice({ tone: 'error', text: 'Choose a date and time before scheduling.' }); return; }
    setBusy(status); setNotice(null);
    const payload = {
      cattery_id: cattery.id, promotion_id: promotionId || null, title: title.trim(), caption: caption.trim(), platforms,
      status, scheduled_for: status === 'scheduled' ? new Date(schedule).toISOString() : null, created_by: user.id,
    };
    const result = editingId
      ? await supabase.from('cattery_social_posts').update(payload).eq('id', editingId).eq('cattery_id', cattery.id)
      : await supabase.from('cattery_social_posts').insert(payload);
    if (result.error) setNotice({ tone: 'error', text: `Post could not be saved. ${result.error.message}` });
    else { setNotice({ tone: 'success', text: status === 'scheduled' ? 'Post added to the content schedule. CatStays will not publish it automatically.' : 'Draft saved to this cattery.' }); resetComposer(); await loadWorkspace(); }
    setBusy('');
  };

  const copyCaption = async (value = caption) => {
    if (!value.trim()) { setNotice({ tone: 'error', text: 'Create or open a caption before copying.' }); return; }
    try { await navigator.clipboard.writeText(value); setNotice({ tone: 'success', text: 'Caption copied. Paste it into the social app you choose.' }); }
    catch { setNotice({ tone: 'error', text: 'Your browser blocked clipboard access. Select the caption and copy it manually.' }); }
  };

  const shareCaption = async () => {
    if (!caption.trim()) { setNotice({ tone: 'error', text: 'Create or open a caption before sharing.' }); return; }
    if (!navigator.share) { await copyCaption(); return; }
    try { await navigator.share({ title: title || cattery?.name || 'CatStays post', text: caption, url: websiteUrl }); }
    catch (error) { if ((error as Error).name !== 'AbortError') setNotice({ tone: 'error', text: 'The share sheet could not be opened. Copy the caption instead.' }); }
  };

  const markPublished = async (post: CatterySocialPost) => {
    if (!cattery?.id) return;
    setBusy(post.id);
    const { error } = await supabase.from('cattery_social_posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', post.id).eq('cattery_id', cattery.id);
    if (error) setNotice({ tone: 'error', text: `Post could not be updated. ${error.message}` });
    else { setNotice({ tone: 'success', text: `${post.title} was marked as published.` }); await loadWorkspace(); }
    setBusy('');
  };

  const togglePlatform = (platform: string) => setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]);

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><div className="flex min-w-0 items-center gap-3"><div className="lg:hidden"><RightMenu /></div><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p><h1 className="truncate text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1></div></div><NotificationBell /></div></header>
        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Marketing</p><h2 className="text-3xl font-semibold">Social Media</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">Create, save, schedule, copy, and share posts using this cattery’s real details and promotions.</p></div>
          {notice && <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>{notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}<p>{notice.text}</p></div>}
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="min-w-0 border-[#E8DED4] bg-white shadow-sm"><CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-semibold">Post composer</h3><p className="mt-1 text-sm text-[#4E5871]">Start with a safe template, then make it sound like you.</p></div>{editingId && <Button variant="outline" onClick={resetComposer}>New post</Button>}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Post type<select className={fieldClass} value={tone} onChange={(event) => { const next = event.target.value as Tone; setTone(next); if (next !== 'promotion') setPromotionId(''); }}><option value="availability">Booking availability</option><option value="care">Cattery care</option><option value="promotion">Promotion</option></select></label>
                <label className="text-sm font-semibold">Promotion<select className={fieldClass} value={promotionId} onChange={(event) => { setPromotionId(event.target.value); setTone('promotion'); }} disabled={tone !== 'promotion'}><option value="">Choose an active promotion</option>{activePromotions.map((promotion) => <option key={promotion.id} value={promotion.id}>{promotion.name} · {promotion.code}</option>)}</select></label>
              </div>
              <Button variant="outline" className="w-full" onClick={generateCaption}><Sparkles className="mr-2 h-4 w-4 text-[#C46A3A]" />Create cattery-specific draft</Button>
              <label className="block text-sm font-semibold">Internal title<input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} /></label>
              <label className="block text-sm font-semibold">Caption<textarea className={`${fieldClass} min-h-56 py-3`} value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={5000} /></label>
              <div><p className="text-sm font-semibold">Platforms</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{['Facebook', 'Instagram'].map((platform) => <button type="button" key={platform} onClick={() => togglePlatform(platform)} className={`flex h-12 items-center justify-between rounded-xl border px-4 text-left ${platforms.includes(platform) ? 'border-[#C46A3A] bg-[#F8F1EC]' : 'border-[#D9D1C8] bg-white'}`}><span className="flex items-center gap-2">{platform === 'Facebook' ? <Facebook className="h-4 w-4" /> : <Instagram className="h-4 w-4" />}{platform}</span>{platforms.includes(platform) && <CheckCircle2 className="h-4 w-4 text-[#C46A3A]" />}</button>)}</div></div>
              <label className="block text-sm font-semibold">Schedule date and time (optional)<input type="datetime-local" className={fieldClass} value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Button variant="outline" onClick={() => void copyCaption()}><Clipboard className="mr-2 h-4 w-4" />Copy</Button><Button variant="outline" onClick={() => void shareCaption()}><Share2 className="mr-2 h-4 w-4" />Share</Button><Button variant="outline" onClick={() => void savePost('draft')} disabled={Boolean(busy)}><Save className="mr-2 h-4 w-4" />{busy === 'draft' ? 'Saving…' : 'Save draft'}</Button><Button onClick={() => void savePost('scheduled')} disabled={Boolean(busy)} className="bg-[#C46A3A] hover:bg-[#A85A30]"><CalendarClock className="mr-2 h-4 w-4" />{busy === 'scheduled' ? 'Saving…' : 'Add to schedule'}</Button></div>
              <p className="text-xs leading-5 text-[#768098]">Scheduling records your content plan inside CatStays. It does not publish to Facebook or Instagram automatically. Use Share or Copy when you are ready.</p>
            </CardContent></Card>
            <div className="space-y-5">
              <Card className="border-[#E8DED4] bg-white"><CardContent className="p-5"><h3 className="font-semibold">Website and profiles</h3><a href={websiteUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-between rounded-xl border border-[#D9D1C8] p-3 text-sm hover:border-[#C46A3A]"><span className="truncate">Open cattery website</span><ExternalLink className="h-4 w-4 shrink-0" /></a>{[['Facebook', socialLinks.facebook], ['Instagram', socialLinks.instagram]].map(([name, url]) => url ? <a key={name} href={url} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-between rounded-xl border border-[#D9D1C8] p-3 text-sm hover:border-[#C46A3A]"><span>{name} profile</span><ExternalLink className="h-4 w-4" /></a> : <p key={name} className="mt-2 rounded-xl bg-[#F8F7F5] p-3 text-xs text-[#768098]">{name} profile is not yet added in Edit Website.</p>)}</CardContent></Card>
              <Card className="border-[#E8DED4] bg-white"><CardContent className="p-5"><h3 className="font-semibold">Workspace status</h3><div className="mt-3 space-y-2 text-sm text-[#4E5871]"><p>{posts.filter((post) => post.status === 'draft').length} saved drafts</p><p>{posts.filter((post) => post.status === 'scheduled').length} scheduled posts</p><p>{activePromotions.length} active promotions available</p></div></CardContent></Card>
            </div>
          </div>
          <Card className="min-w-0 border-[#E8DED4] bg-white shadow-sm"><CardContent className="p-0"><div className="flex flex-col gap-3 border-b border-[#E8DED4] p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-xl font-semibold">Saved and scheduled posts</h3><p className="mt-1 text-sm text-[#4E5871]">A durable content history for this cattery.</p></div><div className="relative sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768098]" /><input aria-label="Search social posts" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D1C8] pl-9 pr-3 outline-none focus:border-[#C46A3A]" /></div></div>
            {loading ? <div className="grid min-h-56 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C46A3A]" /></div> : filteredPosts.length ? <div className="divide-y divide-[#E8DED4]">{filteredPosts.map((post) => <article key={post.id} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold">{post.title}</h4><Badge className={postStatusTone(post.status)}>{post.status}</Badge>{post.platforms.map((platform) => <Badge key={platform} variant="outline">{platform}</Badge>)}</div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#4E5871]">{post.caption}</p><p className="mt-2 text-xs text-[#768098]">{postDate(post)}</p></div><div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col"><Button variant="outline" onClick={() => editPost(post)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button><Button variant="outline" onClick={() => void copyCaption(post.caption)}><Clipboard className="mr-2 h-4 w-4" />Copy</Button>{post.status !== 'published' && <Button variant="outline" disabled={busy === post.id} onClick={() => void markPublished(post)}><Send className="mr-2 h-4 w-4" />Mark published</Button>}</div></div></article>)}</div> : <div className="p-10 text-center"><Share2 className="mx-auto h-10 w-10 text-[#C46A3A]" /><h3 className="mt-4 text-xl font-semibold">{search ? 'No matching posts' : 'No saved posts yet'}</h3><p className="mt-2 text-sm text-[#4E5871]">{search ? 'Try another caption, platform, or status.' : 'Create a draft in the composer above.'}</p></div>}
          </CardContent></Card>
        </main>
      </div>
    </div>
  );
}
