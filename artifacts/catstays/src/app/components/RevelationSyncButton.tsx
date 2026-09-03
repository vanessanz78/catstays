import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { RevelationSyncStatus } from './RevelationSyncStatus';

export function RevelationSyncButton() {
  const { cattery } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  if (cattery?.id !== '7f6d029f-b727-4645-83be-db6ec56d1b46') return null;
  const sync = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error('Sign in again to sync.');
      const response = await fetch('/api/revelation-sync/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ catteryId: cattery.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Sync could not be queued.');
      setMessage(result.alreadyRunning ? 'A sync is already running. Its progress is shown below.' : 'Sync queued. It starts in the background within about a minute. You can close this window.');
      setRevision(value => value + 1);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not connect. Please try again.'); }
    finally { setBusy(false); }
  };
  return <>
    <button type="button" aria-label="Sync with Revelation Pets" title="Sync with Revelation Pets" onClick={() => setOpen(true)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#C46A3A] hover:bg-[#C46A3A]/10 focus-visible:ring-2 focus-visible:ring-[#C46A3A]">
      <RefreshCw className="h-4 w-4" />
    </button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Sync with Revelation Pets</DialogTitle><DialogDescription>Copy new bookings and changes into CatStays. Nothing is sent back to Revelation Pets and no customer messages are sent.</DialogDescription></DialogHeader>
        <p className="text-sm">CatStays-only bookings are kept. Changes made in both systems are flagged for review, not silently overwritten. A full check can take several hours; current and future booking details are checked first.</p>
        <Button disabled={busy} onClick={() => void sync()} className="w-full bg-[#C46A3A] text-white hover:bg-[#A85A30]"><RefreshCw className={`mr-2 h-4 w-4 ${busy ? 'animate-spin' : ''}`} />{busy ? 'Requesting sync…' : 'Sync now'}</Button>
        {message && <p role="status" className="text-sm text-emerald-800">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <RevelationSyncStatus key={revision} catteryId={cattery.id} />
        <Button variant="outline" onClick={() => window.location.reload()}>Reload dashboard data</Button>
      </DialogContent>
    </Dialog>
  </>;
}
