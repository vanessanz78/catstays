export function syncSummaryText(changes:Record<string,{added:number;updated:number}>={}) {
  const parts:string[]=[];
  for(const [key,singular] of [['bookings','booking'],['customers','customer'],['cats','cat'],['payments','payment']] as const){
    const counts=changes[key];
    for(const action of ['added','updated'] as const){
      const count=Number(counts?.[action]||0);
      if(Number.isFinite(count)&&count>0)parts.push(`${count} ${singular}${count===1?'':'s'} ${action}`);
    }
  }
  return parts.length?`Sync complete: ${parts.join(', ')}.`:'Sync complete. No changes since the last sync.';
}
