export const TENANT = '7f6d029f-b727-4645-83be-db6ec56d1b46';
export const PROJECT = 'iwyoezwqorddkmqnjbif';
const encoder = new TextEncoder();
export const hash = async value => [...new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export function isoDate(value) {
  if (!value) return null;
  const parts=String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const result=parts?`${parts[3]}-${parts[2]}-${parts[1]}`:String(value).slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(result)||new Date(result+'T12:00:00Z').toISOString().slice(0,10)!==result)throw Error('Invalid source date');
  return result;
}
const apiDate=s=>`${s.slice(8,10)}/${s.slice(5,7)}/${s.slice(0,4)}`;
export function sourceTime(value) {
  if(!value)return null;
  const m=String(value).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if(!m)throw Error('Invalid source time');
  let h=Number(m[1]); if(m[3]){if(h<1||h>12)throw Error('Invalid source time');h=(h%12)+(m[3].toUpperCase()==='PM'?12:0);}
  if(h>23||Number(m[2])>59)throw Error('Invalid source time');
  return `${String(h).padStart(2,'0')}:${m[2]}:00`;
}
export function splitRange(range) {
  const a=Date.parse(range.from),b=Date.parse(range.to);
  if(a>=b)throw Error('Source daily row limit reached; a complete export is required');
  const mid=a+Math.floor((b-a)/86400000/2)*86400000;
  return [{from:range.from,to:new Date(mid).toISOString().slice(0,10)}, {from:new Date(mid+86400000).toISOString().slice(0,10),to:range.to}];
}
const text=x=>String(x??'').trim();
const cents=x=>Math.round(Number(x)*100);
export const paymentSignature=p=>JSON.stringify([isoDate(p.date||p.paid_on),cents(p.amount),text(p.payment_method||p.legacy_payment_type).toLowerCase(),text(p.description??p.legacy_description).replace(/^(\d+)\.0$/,'$1')]);
export function planPayments(incoming, existing, expectedReceived) {
  if(!Number.isFinite(Number(expectedReceived))||incoming.some(p=>!Number.isFinite(Number(p.amount))))throw Error('Invalid payment evidence');
  if(Math.abs(incoming.reduce((s,p)=>s+cents(p.amount),0)-cents(expectedReceived))>1)throw Error('Invoice payment evidence does not reconcile');
  const pool=new Map();
  for(const p of existing.filter(p=>!p.legacy_deleted)){const key=paymentSignature(p);pool.set(key,[...(pool.get(key)||[]),p]);}
  const extra=[]; const occurrences=new Map();
  for(const p of incoming){const sig=paymentSignature(p),n=(occurrences.get(sig)||0)+1;occurrences.set(sig,n);
    if(pool.get(sig)?.length)pool.get(sig).pop();else extra.push({row:p,signature:sig,occurrence:n});}
  if([...pool.values()].some(p=>p.length))throw Error('Source payment removals or amendments need an export review; no inferred deletion');
  const deleted=new Set(existing.filter(p=>p.legacy_deleted).map(paymentSignature));
  if(extra.some(p=>deleted.has(p.signature)))throw Error('Previously deleted payment needs export review; no reactivation');
  return extra;
}
export function clients(env) {
  const dbUrl=env.SUPABASE_URL,dbKey=env.SUPABASE_SERVICE_ROLE_KEY,key=env.REVELATION_PETS_API_KEY;
  if(!dbUrl||new URL(dbUrl).hostname!==`${PROJECT}.supabase.co`||!dbKey||!key)throw Error('Sync configuration mismatch');
  return {
    async db(path,body,method='POST') {
      const r=await fetch(`${dbUrl}/rest/v1/${path}`,{method,redirect:'error',headers:{apikey:dbKey,Authorization:`Bearer ${dbKey}`,'Content-Type':'application/json',Prefer:'return=representation'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(30000)});
      if(!r.ok)throw Error(`Database operation failed: ${path.split('?')[0]} (${r.status})`);
      return r.status===204?null:r.json();
    },
    async source(endpoint,params) {
      if(!['customers','bookings','booking','payments'].includes(endpoint))throw Error('Unsupported source endpoint');
      const r=await fetch(`https://us.revelationpets.com/api/${encodeURIComponent(key)}/${endpoint}?${new URLSearchParams(params)}`,{redirect:'error',headers:{Accept:'application/json'},signal:AbortSignal.timeout(30000)});
      if(!r.ok)throw Error(`Revelation ${endpoint} request failed (${r.status})`);
      const result=await r.json();
      if(endpoint==='booking' ? !result||Array.isArray(result)||!result.booking_id : !Array.isArray(result))throw Error('Unexpected source response; no import performed');
      return result;
    },
  };
}
export async function processTick(env, force=false, transport=clients(env)) {
  const {db,source}=transport;
  const job=await db('rpc/catstays_claim_legacy_sync',{force_start:force});
  if(!job)return {idle:true};
  const run=job.import_run_id,cp=job.checkpoint;let queue=[...job.queue],phase=job.phase;
  const rpc=(name,records)=>db(`rpc/catstays_import_legacy_${name}`,{target_import_run_id:run,records});
  const query=(table,filter,columns='*')=>db(`${table}?cattery_id=eq.${TENANT}&${filter}&select=${encodeURIComponent(columns)}&limit=1000`,undefined,'GET');
  const archive=async(name,rows)=>{
    const json=JSON.stringify(rows),sum=await hash(json);
    const file=await db('rpc/catstays_stage_legacy_source_file',{target_import_run_id:run,report_type:'api_sync',source_file_name:`${sum.slice(0,16)}-${name}`,source_sha256:sum,byte_size:encoder.encode(json).length,row_count:rows.length,headline_totals:{},archive_notes:'Read-only API source response. Export-only data is not inferred.'});
    for(let start=0;start<rows.length;start+=100){const part=await Promise.all(rows.slice(start,start+100).map(async(r,i)=>({row_number:start+i+1,external_id:String(r.booking_id||r.id||''),record_checksum:await hash(JSON.stringify(r)),raw_record:r})));
      await db('rpc/catstays_stage_legacy_source_records',{target_source_file_id:file,records:part});}
  };
  const warn=async(type,ref)=>{
    // Stable warning identity across lease retries.
    const prior=await query('legacy_reconciliation_issues',`import_run_id=eq.${run}&issue_type=eq.${type}&details->>reference=eq.${encodeURIComponent(ref)}`,'id');
    if(!prior.length)await db('legacy_reconciliation_issues',{cattery_id:TENANT,import_run_id:run,issue_type:type,severity:'warning',summary:'API information requires review; original response is preserved.',details:{reference:ref}});
    cp.warnings=(cp.warnings||0)+1;
  };
  try {
    if(phase==='customers'||phase==='bookings') {
      const range=queue.shift(),rows=await source(phase,{from_date:apiDate(range.from),to_date:apiDate(range.to)});
      if(rows.length>=1000){queue.unshift(...splitRange(range));}
      else {
        await archive(`${phase}-${range.from}-${range.to}.json`,rows);cp.source_pages++;
        if(phase==='customers') {
          for(let offset=0;offset<rows.length;offset+=100){
            const chunk=rows.slice(offset,offset+100);if(!chunk.length)continue;
            if(chunk.some(c=>!/^\d+$/.test(String(c.id))))throw Error('Invalid source customer identity');
            const old=await query('customers',`external_source=eq.revelation_pets&external_id=in.(${chunk.map(c=>c.id).join(',')})`);
            const map=new Map(old.map(c=>[c.external_id,c]));
            await rpc('customers',chunk.map(c=>{const o=map.get(String(c.id)),b=o?.legacy_metadata?._revelation_source||{};return {
              external_id:String(c.id),customer_name:c.name,email:c.email||'',phone:c.mobile||c.telephone||null,
              address:['address_line1','address_line2','city','postcode'].map(k=>c[k]).filter(Boolean).join(', '),notes:c.note||null,
              created_at:o?.created_at||null,legacy_account_balance:b.legacy_account_balance??o?.legacy_account_balance??null,
              legacy_total_spent:b.legacy_total_spent??o?.legacy_total_spent??null,legacy_last_booking:b.legacy_last_booking??o?.legacy_last_booking??null,
              legacy_metadata:{api:c}};}));
            const allPets=chunk.flatMap(c=>(c.pets||[]).map(p=>({...p,owner_external_id:String(c.id)})));
            for(let catOffset=0;catOffset<allPets.length;catOffset+=100){
              const pets=allPets.slice(catOffset,catOffset+100);
              if(pets.some(p=>!/^\d+$/.test(String(p.id))))throw Error('Invalid source cat identity');
              const oldCats=await query('cats',`external_source=eq.revelation_pets&external_id=in.(${pets.map(p=>p.id).join(',')})`);
              const cats=new Map(oldCats.map(p=>[p.external_id,p]));
              await rpc('cats',pets.map(p=>{const o=cats.get(String(p.id)),b=o?.legacy_metadata?._revelation_source||{};return {external_id:String(p.id),owner_external_id:p.owner_external_id,cat_name:p.name,breed:p.breed||null,
                age:b.age??o?.age??null,medical_notes:b.medical_notes??o?.medical_notes??null,dietary_requirements:b.dietary_requirements??o?.dietary_requirements??null,legacy_metadata:{api:p}};}));
            }
          }
        } else {
          const seen=new Map(cp.detail_queue.map(x=>[x.id,x]));
          for(const b of rows){if(!/^\d+$/.test(String(b.id))||!/^\d+$/.test(String(b.booking_id)))throw Error('Invalid source booking identity');let departure=null;try{departure=isoDate(b.boarding_to_date);}catch{}seen.set(String(b.id),{id:String(b.id),reference:String(b.booking_id),departure});}
          cp.detail_queue=[...seen.values()];
        }
      }
      if(!queue.length){
        if(phase==='customers'){phase='bookings';queue=[{from:'2000-01-01',to:`${Number(job.local_day.slice(0,4))+10}-12-31`}];}
        else {phase='details';queue=cp.detail_queue.sort((a,b)=>Number(b.departure>=job.local_day)-Number(a.departure>=job.local_day)||b.reference.localeCompare(a.reference,undefined,{numeric:true}));delete cp.detail_queue;}
      }
    } else if(phase==='details') {
      const deadline=Date.now()+45000;
      let done=0;
      // A short durable batch bounds runtime and keeps the provider request rate low.
      while(queue.length && done<40 && Date.now()<deadline){
        const item=queue[0],d=await source('booking',{id:item.id});
        if(String(d.booking_id)!==item.reference)throw Error('Booking response identity mismatch');
        await archive(`booking-${item.id}.json`,[d]);
        const found=await query('bookings',`external_source=eq.revelation_pets&external_id=eq.${item.reference}`);
        const old=found[0];
        const candidates=d.customer_email?await query('customers',`external_source=eq.revelation_pets&email=eq.${encodeURIComponent(d.customer_email)}`):[];
        let owner=candidates.length===1?candidates[0]:null;
        if(!owner && candidates.length===0 && old?.customer_id){const previous=await query('customers',`id=eq.${old.customer_id}`);if(previous[0]&&text(previous[0].name)===text(d.customer_name))owner=previous[0];}
        let start=null,end=null;try{start=isoDate(d.boarding_from_date);end=isoDate(d.boarding_to_date);}catch{}
        if(!owner||!start||!end||end<start){await warn('api_booking_identity_or_dates',item.reference);queue.shift();done++;cp.processed++;continue;}
        const cats=await query('cats',`customer_id=eq.${owner.id}&external_source=eq.revelation_pets`);
        const selected=new Set(),assignments=[];let ambiguous=false;
        const rooms=await query('rooms','is_active=eq.true','id,name,room_count');
        for(const line of d.overnights||[]){
          const whole=cats.filter(c=>text(c.name).toLowerCase()===text(line.pet).toLowerCase());
          const matches=whole.length===1?[whole]:text(line.pet).split(',').map(label=>cats.filter(c=>text(c.name).toLowerCase()===text(label).toLowerCase()));
          const m=text(line.run).match(/^`?\s*(Private|Indoor|Comm)(?:unal)?(?:\s+Room)?\s*(\d+)$/i);
          const room=m?rooms.find(r=>r.name.toLowerCase().startsWith(m[1].toLowerCase())):null;
          let lineStart=null,lineEnd=null;try{lineStart=isoDate(line.from_date);lineEnd=isoDate(line.to_date);}catch{}
          if(matches.some(m=>m.length!==1)||!room||Number(m[2])<1||Number(m[2])>room.room_count||!lineStart||!lineEnd||lineStart<start||lineEnd>end||lineEnd<lineStart){ambiguous=true;continue;}
          for(const match of matches){const c=match[0];selected.add(c.external_id);assignments.push({cat_external_id:c.external_id,room_id:room.id,room_unit_number:Number(m[2]),starts_on:lineStart,ends_on:lineEnd});}
        }
        const cancelled=d.cancelled==='Yes',pending=d.pending==='Yes';
        const status=cancelled?'cancelled':pending?'pending':old&&old.status!=='cancelled'&&old.status!=='pending'?old.status:'confirmed';
        const amount=Number(d.total_amount),outstanding=Number(d.outstanding_amount);
        if(!Number.isFinite(amount)||!Number.isFinite(outstanding))throw Error('Invalid source booking amount');
        await rpc('bookings',[{external_id:item.reference,customer_external_id:owner.external_id,legacy_reference:item.reference,
          legacy_customer_name:d.customer_name,legacy_pet_names:[...new Set((d.overnights||[]).map(x=>x.pet))].join(', '),
          check_in:start,check_out:end,check_in_time:sourceTime(d.boarding_arriving),check_out_time:sourceTime(d.boarding_departing),
          status,payment_status:outstanding<=0?'paid':amount-outstanding>0?'partial':'unpaid',notes:d.notes||null,
          legacy_amount:amount,legacy_monies_received:amount-outstanding,legacy_outstanding:outstanding,
          number_of_cats:selected.size||old?.number_of_cats||1,room_arrangement:old?.room_arrangement||'shared',
          legacy_run_name:[...new Set((d.overnights||[]).map(x=>x.run))].join(', '),created_at:old?.created_at||null,
          cancellation_reason:old?.cancellation_reason||null,cancellation_note:old?.cancellation_note||null,
          source_record_checksum:await hash(JSON.stringify(d))}]);
        const saved=(await query('bookings',`external_source=eq.revelation_pets&external_id=eq.${item.reference}`))[0];
        if(!saved)throw Error('Booking import did not persist');
        if(saved.customer_id!==owner.id||saved.check_in!==start||saved.check_out!==end){await warn('api_staff_edited_booking_review',item.reference);}
        else if(ambiguous||!selected.size){await warn('api_room_or_cat_review',item.reference);}
        else {await rpc('booking_relations',[{external_id:item.reference,cat_external_ids:[...selected],assignments,
          split_stay:assignments.some(a=>a.starts_on!==start||a.ends_on!==end)||new Set(assignments.map(a=>a.cat_external_id)).size<assignments.length}]);}
        // Existing invoice transactions are matched as a multiset; absence never deletes money.
        if(d.invoice_id && Array.isArray(d.payments)){
          const invoice=text(d.invoice_id);const oldPayments=await query('payments',`external_source=eq.revelation_pets&legacy_invoice_id=eq.${encodeURIComponent(invoice)}`);
          try {
            const otherBooking=oldPayments.some(p=>p.booking_id && p.booking_id!==saved.id);
            if(otherBooking)throw Error('Shared invoice requires review');
            const extra=planPayments(d.payments,oldPayments,amount-outstanding);
            if(extra.length){const rows=await Promise.all(extra.map(async x=>({external_id:'api-'+await hash(`${invoice}:${x.signature}:${x.occurrence}`),
              booking_external_id:item.reference,customer_external_id:owner.external_id,paid_on:isoDate(x.row.date),amount:Number(x.row.amount),legacy_deleted:false,
              legacy_invoice_id:invoice,legacy_description:text(x.row.description),legacy_payment_type:text(x.row.payment_method),legacy_customer_name:d.customer_name})));
              await rpc('payments',rows);}
          } catch(error) {if(String(error.message).startsWith('Database'))throw error;await warn('api_payment_reconciliation_review',item.reference);}
        }
        queue.shift();done++;cp.processed++;
      }
      if(!queue.length)phase='complete';
    }
    await db('rpc/catstays_checkpoint_legacy_sync',{job_id:job.id,token:job.lease_token,next_phase:phase,next_queue:queue,next_checkpoint:cp});
    return {job:job.id,phase,processed:cp.processed,remaining:queue.length,warnings:cp.warnings};
  } catch(error) {
    const safe=String(error.message).replaceAll(env.REVELATION_PETS_API_KEY,'[REDACTED]').slice(0,450);
    await db('rpc/catstays_checkpoint_legacy_sync',{job_id:job.id,token:job.lease_token,next_phase:job.phase,next_queue:job.queue,next_checkpoint:job.checkpoint,failure:safe});
    throw Error(safe);
  }
}
