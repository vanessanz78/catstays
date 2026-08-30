import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Image as ImageIcon, Loader2, RefreshCw, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { supabase } from '@/utils/supabase/client';
import { sendCatUpdate } from '@/utils/email';
import {
  buildCatUpdateCandidates,
  CAT_UPDATE_BUCKET,
  catUpdateFileError,
  normalizeCatUpdateCaption,
  safeCatUpdateFilename,
} from '@/app/lib/catUpdates';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

type CatUpdateHistory = {
  id: string;
  caption: string;
  storage_path: string;
  status: 'queued' | 'sent' | 'portal_only' | 'failed' | 'archived';
  email_sent_at: string | null;
  created_at: string;
  cat: { name: string } | null;
  customer: { name: string; email: string } | null;
  photoUrl?: string;
};

const fieldClass = 'mt-1 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function displayDate(value: string, includeTime = false) {
  const date = new Date(includeTime ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-NZ', includeTime
      ? { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
      : { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusLabel(status: CatUpdateHistory['status']) {
  if (status === 'sent') return 'Email & portal';
  if (status === 'portal_only') return 'Portal only';
  if (status === 'failed') return 'Email needs attention';
  return status === 'queued' ? 'Sending' : 'Archived';
}

function statusClass(status: CatUpdateHistory['status']) {
  if (status === 'sent') return 'bg-[#4F6F5A] text-white hover:bg-[#4F6F5A]';
  if (status === 'failed') return 'bg-red-600 text-white hover:bg-red-600';
  if (status === 'portal_only') return 'bg-[#768098] text-white hover:bg-[#768098]';
  return 'bg-[#C46A3A] text-white hover:bg-[#C46A3A]';
}

export function CatUpdateGenerator() {
  const { cattery } = useAuth();
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBookings();
  const candidates = useMemo(() => buildCatUpdateCandidates(bookings), [bookings]);
  const [selectedKey, setSelectedKey] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [history, setHistory] = useState<CatUpdateHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const selected = candidates.find((candidate) => candidate.key === selectedKey) || null;

  useEffect(() => {
    if (selectedKey && candidates.some((candidate) => candidate.key === selectedKey)) return;
    setSelectedKey(candidates[0]?.key || '');
  }, [candidates, selectedKey]);

  useEffect(() => () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const loadHistory = async () => {
    if (!cattery?.id) {
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('cat_updates')
      .select('id,caption,storage_path,status,email_sent_at,created_at,cat:cats(name),customer:customers(name,email)')
      .eq('cattery_id', cattery.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) {
      setNotice({ tone: 'error', text: `Photo update history could not be loaded. ${error.message}` });
      setHistory([]);
      setHistoryLoading(false);
      return;
    }
    const rows = (data || []) as unknown as CatUpdateHistory[];
    const withPhotos = await Promise.all(rows.map(async (row) => {
      const { data: signed } = await supabase.storage.from(CAT_UPDATE_BUCKET).createSignedUrl(row.storage_path, 60 * 60);
      return { ...row, photoUrl: signed?.signedUrl || '' };
    }));
    setHistory(withPhotos);
    setHistoryLoading(false);
  };

  useEffect(() => { void loadHistory(); }, [cattery?.id]);

  const choosePhoto = (file: File | null) => {
    const error = catUpdateFileError(file);
    if (error) {
      setPhoto(null);
      setPhotoPreview('');
      setNotice({ tone: 'error', text: error });
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file!));
    setNotice(null);
  };

  const clearComposer = () => {
    setPhoto(null);
    setPhotoPreview('');
    setCaption('');
    setFileInputKey((value) => value + 1);
  };

  const sendUpdate = async () => {
    const cleanCaption = normalizeCatUpdateCaption(caption);
    const photoError = catUpdateFileError(photo);
    if (!cattery?.id || !selected) {
      setNotice({ tone: 'error', text: 'Choose a cat from a real booking before sending an update.' });
      return;
    }
    if (photoError) {
      setNotice({ tone: 'error', text: photoError });
      return;
    }
    if (!cleanCaption) {
      setNotice({ tone: 'error', text: 'Write the update you want this customer to receive.' });
      return;
    }
    if (cleanCaption.length > 2000) {
      setNotice({ tone: 'error', text: 'Keep the update under 2,000 characters.' });
      return;
    }

    setBusy(true);
    setNotice(null);
    const storagePath = `${cattery.id}/${selected.bookingId}/${crypto.randomUUID()}-${safeCatUpdateFilename(photo!.name)}`;
    const { error: uploadError } = await supabase.storage.from(CAT_UPDATE_BUCKET).upload(storagePath, photo!, {
      cacheControl: '3600',
      contentType: photo!.type,
      upsert: false,
    });
    if (uploadError) {
      setNotice({ tone: 'error', text: `The photo could not be uploaded. ${uploadError.message}` });
      setBusy(false);
      return;
    }

    const result = await sendCatUpdate({
      catteryId: cattery.id,
      bookingId: selected.bookingId,
      customerId: selected.customerId,
      catId: selected.catId,
      storagePath,
      caption: cleanCaption,
    });
    if (!result.success) {
      if (!result.saved) await supabase.storage.from(CAT_UPDATE_BUCKET).remove([storagePath]);
      setNotice({ tone: 'error', text: result.error || 'The photo update could not be sent.' });
      if (result.saved) {
        clearComposer();
        await loadHistory();
      }
      setBusy(false);
      return;
    }

    setNotice({
      tone: 'success',
      text: result.emailSent
        ? `Photo update sent to ${selected.customerName} by email and saved in the client portal.`
        : `Photo update saved in ${selected.customerName}'s client portal. Add a valid customer email if you also want email delivery.`,
    });
    clearComposer();
    await loadHistory();
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F2EA] text-[#0A1128] lg:flex">
      <RightMenu mode="sidebar" />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-[#E8DED4] bg-white/95 shadow-sm backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="lg:hidden"><RightMenu /></div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Staff dashboard</p>
                <h1 className="truncate text-xl font-semibold">{cattery?.name || 'Your cattery'}</h1>
              </div>
            </div>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-24">
          <div>
            <h2 className="text-3xl font-serif font-semibold">Cat Updates</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">
              Share a photo when you choose. The update is private to the selected cat owner and appears in their client login.
            </p>
          </div>

          {notice && (
            <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#4F6F5A]/25 bg-[#EAF2EC] text-[#274432]' : 'border-red-200 bg-red-50 text-red-800'}`}>
              {notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <p>{notice.text}</p>
            </div>
          )}

          <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]">
            <Card className="min-w-0 rounded-2xl border-[#E8DED4] shadow-sm">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-xl font-semibold">1. Choose the booked cat</h3>
                  <p className="mt-1 text-sm text-[#4E5871]">Cancelled bookings and unlinked customer records are excluded.</p>
                </div>
                {bookingsLoading ? (
                  <div className="flex items-center gap-2 rounded-xl bg-[#F8F7F5] p-4 text-sm text-[#4E5871]"><Loader2 className="h-4 w-4 animate-spin" />Loading bookings…</div>
                ) : bookingsError ? (
                  <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">Bookings could not be loaded. {bookingsError}</p>
                ) : candidates.length ? (
                  <>
                    <label className="block text-sm font-medium">Cat and booking
                      <select className={`${fieldClass} h-12`} value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)}>
                        {candidates.map((candidate) => (
                          <option key={candidate.key} value={candidate.key}>
                            {candidate.catName} — {candidate.customerName} — {candidate.stayStatus}
                          </option>
                        ))}
                      </select>
                    </label>
                    {selected && (
                      <dl className="grid gap-3 rounded-xl bg-[#F8F7F5] p-4 text-sm sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        <div><dt className="text-xs uppercase tracking-wide text-[#768098]">Owner</dt><dd className="mt-1 break-words font-semibold">{selected.customerName}</dd><dd className="break-all text-xs text-[#4E5871]">{selected.customerEmail || 'No email saved'}</dd></div>
                        <div><dt className="text-xs uppercase tracking-wide text-[#768098]">Room</dt><dd className="mt-1 font-semibold">{selected.roomName}</dd></div>
                        <div className="sm:col-span-2 xl:col-span-1 2xl:col-span-2"><dt className="text-xs uppercase tracking-wide text-[#768098]">Stay</dt><dd className="mt-1 font-semibold">{displayDate(selected.checkIn)} – {displayDate(selected.checkOut)}</dd></div>
                      </dl>
                    )}
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#D9D1C8] p-6 text-center">
                    <Camera className="mx-auto h-8 w-8 text-[#C46A3A]" />
                    <p className="mt-3 font-semibold">No booked cats are available</p>
                    <p className="mt-1 text-sm leading-6 text-[#4E5871]">Add cats to a customer booking first, then return here to share an update.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="min-w-0 rounded-2xl border-[#E8DED4] shadow-sm">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <h3 className="text-xl font-semibold">2. Add the photo and message</h3>
                  <p className="mt-1 text-sm text-[#4E5871]">Nothing is generated or sent until you press Send photo update.</p>
                </div>
                <label className="block text-sm font-medium">Photo
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={`${fieldClass} min-h-12 py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F1E6DC] file:px-3 file:py-2 file:font-semibold file:text-[#7A3D22]`}
                    onChange={(event) => choosePhoto(event.target.files?.[0] || null)}
                  />
                  <span className="mt-1 block text-xs font-normal text-[#768098]">JPG, PNG or WebP, up to 8 MB. Photos remain private to staff and the linked customer.</span>
                </label>
                {photoPreview && (
                  <div className="overflow-hidden rounded-xl border border-[#E8DED4] bg-[#F8F7F5]">
                    <img src={photoPreview} alt="Selected cat update preview" className="max-h-[420px] w-full object-contain" />
                  </div>
                )}
                <label className="block text-sm font-medium">Message to the cat owner
                  <textarea
                    className={`${fieldClass} min-h-36 py-3`}
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    maxLength={2000}
                    placeholder={selected ? `Write a short, factual update about ${selected.catName}…` : 'Choose a booked cat first…'}
                  />
                  <span className="mt-1 block text-right text-xs font-normal text-[#768098]">{caption.length}/2,000</span>
                </label>
                <Button disabled={busy || !selected} onClick={() => void sendUpdate()} className="h-12 w-full rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                  {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                  Send photo update
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-[#E8DED4] shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-xl font-semibold">Update history</h3><p className="mt-1 text-sm text-[#4E5871]">The latest private updates sent by this cattery.</p></div>
                <Button variant="outline" disabled={historyLoading} onClick={() => void loadHistory()} className="rounded-xl"><RefreshCw className={`mr-2 h-4 w-4 ${historyLoading ? 'animate-spin' : ''}`} />Refresh</Button>
              </div>
              {historyLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F8F7F5] p-8 text-sm text-[#4E5871]"><Loader2 className="h-5 w-5 animate-spin" />Loading updates…</div>
              ) : history.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {history.map((update) => (
                    <article key={update.id} className="min-w-0 overflow-hidden rounded-xl border border-[#E8DED4] bg-white">
                      {update.photoUrl ? <img src={update.photoUrl} alt={`Update for ${update.cat?.name || 'cat'}`} className="aspect-[4/3] w-full object-cover" /> : <div className="grid aspect-[4/3] place-items-center bg-[#F8F7F5]"><ImageIcon className="h-8 w-8 text-[#768098]" /></div>}
                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-semibold">{update.cat?.name || 'Cat update'}</h4><p className="truncate text-xs text-[#4E5871]">{update.customer?.name || 'Customer'} · {displayDate(update.created_at, true)}</p></div><Badge className={statusClass(update.status)}>{statusLabel(update.status)}</Badge></div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#273149]">{update.caption}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-[#D9D1C8] p-8 text-center"><Camera className="mx-auto h-8 w-8 text-[#C46A3A]" /><p className="mt-3 font-semibold">No photo updates sent yet</p><p className="mt-1 text-sm text-[#4E5871]">Your first sent update will appear here.</p></div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
