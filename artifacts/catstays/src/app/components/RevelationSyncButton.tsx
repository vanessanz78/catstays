import { useEffect, useSyncExternalStore } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase/client';
import { syncSummaryText } from '../lib/syncSummary';
const tenant = '7f6d029f-b727-4645-83be-db6ec56d1b46';
let state = { busy:false, message:'', error:false };
const listeners = new Set<() => void>();
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let limitTimer: ReturnType<typeof setTimeout> | undefined;
const subscribe = (listener:()=>void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => state;
function update(next:Partial<typeof state>) {
  state={...state,...next}; listeners.forEach(listener=>listener());
  if (next.message) { clearTimeout(hideTimer); hideTimer=setTimeout(()=>update({message:''}),12000); }
}
async function api(path:string, body?:object) {
  const {data}=await supabase.auth.getSession();
  if (!data.session) throw new Error('Sign in again to sync.');
  const response=await fetch(`/api/revelation-sync/${path}`, {
    method:body?'POST':'GET', headers:{Authorization:`Bearer ${data.session.access_token}`,'Content-Type':'application/json'},
    ...(body?{body:JSON.stringify(body)}:{}),
    signal:AbortSignal.timeout(120000),
  });
  const result=await response.json();
  if (!response.ok) throw new Error(result.error || 'Unable to sync. Please try again.');
  return result;
}
function refreshBookings() {
  window.dispatchEvent(new Event('catstays-sync-completed'));
  window.dispatchEvent(new Event('catstays:bookings-changed'));
}
async function startSync() {
  if (state.busy) {
    generation++;
    clearTimeout(timer);
    clearTimeout(limitTimer);
    update({busy:false,error:false,message:'Sync stopped. Any completed changes are saved.'});
    return;
  }
  const current=++generation;
  update({busy:true,error:false,message:'Checking Revelation Pets for new and changed bookings…'});
  try {
    const result=await api('request',{catteryId:tenant});
    if(current!==generation)return;
    if(!result.success || !result.jobId)throw new Error('Sync could not be started.');
    // No idle polling. Each explicit click permits at most five minutes of batches.
    const until=Math.min(Date.now()+300000,Date.parse(result.until)||Date.now()+300000);
    limitTimer=setTimeout(()=>{
      if(current!==generation)return;
      generation++;clearTimeout(timer);
      refreshBookings();
      update({busy:false,error:false,message:'Sync paused after its bounded update. New and changed records are saved.'});
    },Math.max(0,until-Date.now()));
    const poll=async()=>{
      if(current!==generation)return;
      try {
        const progress=await api(`step/${encodeURIComponent(result.jobId)}`,{catteryId:tenant});
        if(current!==generation)return;
        if(progress.status==='completed') {
          clearTimeout(limitTimer);
          refreshBookings();
          update({busy:false,error:false,message:syncSummaryText(progress.changes)});
        } else if(progress.status==='paused') {
          clearTimeout(limitTimer);
          refreshBookings();
          update({busy:false,error:false,message:'Sync paused after its bounded update. New and changed records are saved.'});
        } else if(progress.status==='failed') {
          clearTimeout(limitTimer);
          refreshBookings();
          update({busy:false,error:true,message:'Sync couldn’t finish. Please try again.'});
        } else { timer=setTimeout(()=>void poll(),5000); }
      } catch(failure) {
        clearTimeout(limitTimer);
        if(current===generation) update({busy:false,error:true,message:failure instanceof Error?failure.message:'Could not check sync progress. Please try again.'});
      }
    };
    void poll();
  } catch(failure) {
    if(current===generation)update({busy:false,error:true,message:failure instanceof Error?failure.message:'Unable to sync.'});
  }
}
export function RevelationSyncButton() {
  const {cattery}=useAuth();
  const current=useSyncExternalStore(subscribe,snapshot);
  if(cattery?.id!==tenant)return null;
  return <button type="button" aria-label={current.busy?'Stop Revelation Pets sync':'Sync with Revelation Pets'} aria-busy={current.busy} title={current.busy?'Stop sync':'Sync with Revelation Pets'} onClick={()=>void startSync()} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#C46A3A] hover:bg-[#C46A3A]/10 focus-visible:ring-2 focus-visible:ring-[#C46A3A]">
    <RefreshCw className={`h-4 w-4 ${current.busy?'animate-spin':''}`} />
  </button>;
}
// One toast host for mobile/desktop icons, kept alive across navigation.
export function RevelationSyncToast() {
  const {cattery}=useAuth();
  const current=useSyncExternalStore(subscribe,snapshot);
  useEffect(()=>{
    if(cattery?.id!==tenant){generation++;clearTimeout(timer);clearTimeout(hideTimer);clearTimeout(limitTimer);update({busy:false,message:'',error:false});}
  },[cattery?.id]);
  if(cattery?.id!==tenant||!current.message)return null;
  return <div role={current.error?'alert':'status'} className={`fixed bottom-5 right-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border bg-white p-4 shadow-xl sm:max-w-md ${current.error?'border-red-200 text-red-800':'border-[#E8DED4] text-[#2d3e2f]'}`}>
    <p className="text-sm font-medium">{current.message}</p>
    <button aria-label="Dismiss sync message" onClick={()=>update({message:''})} className="shrink-0 p-1"><X className="h-4 w-4" /></button>
  </div>;
}
