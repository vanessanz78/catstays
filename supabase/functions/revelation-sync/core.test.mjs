import test from 'node:test';
import assert from 'node:assert/strict';
import {isoDate,sourceTime,splitRange,planPayments,processTick,clients,PROJECT} from './core.mjs';

test('dates preserve NZ calendar days and reject invalid dates',()=>{
  assert.equal(isoDate('02/09/2026'),'2026-09-02');assert.equal(isoDate(null),null);
  assert.throws(()=>isoDate('31/02/2026'));assert.throws(()=>isoDate('not a date'));
});
test('AM PM conversion includes noon and midnight',()=>{
  assert.equal(sourceTime('12:00 AM'),'00:00:00');assert.equal(sourceTime('12:00 PM'),'12:00:00');assert.equal(sourceTime('4:40 PM'),'16:40:00');
  assert.throws(()=>sourceTime('25:00'));assert.throws(()=>sourceTime('13:00 PM'));
});
test('range split has no skipped or overlapping day',()=>{
  assert.deepEqual(splitRange({from:'2026-01-01',to:'2026-01-04'}),[{from:'2026-01-01',to:'2026-01-02'},{from:'2026-01-03',to:'2026-01-04'}]);
  assert.throws(()=>splitRange({from:'2026-01-01',to:'2026-01-01'}));
});
const pay=(amount=50)=>({date:'01/09/2026',amount,payment_method:'Cash',description:'123'});
test('payments are repeat-safe including identical legitimate payments',()=>{
  const rows=[pay(),pay()];assert.equal(planPayments(rows,[pay()],100).length,1);assert.equal(planPayments(rows,rows,100).length,0);
});
test('numeric exported references normalize without inventing an identity',()=>{
  assert.equal(planPayments([pay()],[{paid_on:'2026-09-01',amount:50,legacy_payment_type:'Cash',legacy_description:'123.0'}],50).length,0);
});
test('negative refund is retained and receipts must reconcile',()=>{
  assert.equal(planPayments([pay(),pay(-20)],[pay()],30)[0].row.amount,-20);assert.throws(()=>planPayments([pay()],[],60));
});
test('missing and amended payments never infer a deletion',()=>{
  assert.throws(()=>planPayments([],[pay()],0));assert.throws(()=>planPayments([pay(40)],[pay()],40));
});
test('deleted payment is never resurrected',()=>{
  assert.throws(()=>planPayments([pay()],[{...pay(),legacy_deleted:true}],50));
});
test('invalid money evidence fails closed',()=>{
  assert.throws(()=>planPayments([pay('bad')],[],0));assert.throws(()=>planPayments([],[],NaN));
});
test('credentials and tenant host are required',()=>{
  assert.throws(()=>clients({}));assert.throws(()=>clients({SUPABASE_URL:'https://other.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test',REVELATION_PETS_API_KEY:'test'}));
  assert.ok(clients({SUPABASE_URL:`https://${PROJECT}.supabase.co`,SUPABASE_SERVICE_ROLE_KEY:'test',REVELATION_PETS_API_KEY:'test'}));
});

function fixture(phase='details',override={}) {
  const calls=[],job={id:'job',import_run_id:'run',lease_token:'lease',local_day:'2026-09-03',phase,queue:[{id:'1',reference:'100',departure:'2026-09-10'}],checkpoint:{processed:0,warnings:0,source_pages:0,detail_queue:[]},...override};
  const owner={id:'owner',external_id:'2',name:'Test Owner',email:'test@example.invalid'};
  const existing={id:'booking',external_id:'100',customer_id:'owner',check_in:'2026-09-01',check_out:'2026-09-10',status:'confirmed'};
  const detail={id:1,booking_id:100,customer_name:owner.name,customer_email:owner.email,boarding_from_date:'01/09/2026',boarding_to_date:'10/09/2026',total_amount:100,outstanding_amount:50,invoice_id:200,payments:[pay()],overnights:[{pet:'Test Cat',run:'Private Room 1',from_date:'01/09/2026',to_date:'10/09/2026'}]};
  const f={job,calls,detail,owner,existing,sourceRows:[],payments:[],db:async(path,body)=>{
    calls.push({path,body});
    if(path==='rpc/catstays_claim_legacy_sync')return f.job;
    if(path==='rpc/catstays_stage_legacy_source_file')return 'file';
    if(path.startsWith('bookings?'))return [f.existing];
    if(path.startsWith('customers?'))return f.owners||[f.owner];
    if(path.startsWith('cats?'))return [{id:'cat',external_id:'3',customer_id:'owner',name:'Test Cat'}];
    if(path.startsWith('rooms?'))return [{id:'room',name:'Private Room',room_count:17}];
    if(path.startsWith('payments?'))return f.payments;
    if(path.startsWith('legacy_reconciliation_issues?'))return [];
    return {};
  },source:async endpoint=>endpoint==='booking'?f.detail:f.sourceRows};
  return f;
}
const tick=f=>processTick({REVELATION_PETS_API_KEY:'test-secret'},false,f);
test('idle has no source calls or writes',async()=>{const f=fixture();f.job=null;assert.deepEqual(await tick(f),{idle:true});assert.equal(f.calls.length,1);});
test('full detail is archived and owner room cats payment linked before checkpoint',async()=>{
  const f=fixture();const out=await tick(f);assert.equal(out.phase,'complete');assert.equal(out.processed,1);
  assert.equal(f.calls.filter(c=>c.path==='rpc/catstays_import_legacy_payments').length,1);
  assert.equal(f.calls.filter(c=>c.path==='rpc/catstays_import_legacy_booking_relations').length,1);
  assert.equal(f.calls.at(-1).path,'rpc/catstays_checkpoint_legacy_sync');
});
test('ambiguous owner is archived and flagged not guessed',async()=>{
  const f=fixture();f.owners=[f.owner,{...f.owner,id:'another'}];await tick(f);
  assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_bookings'));
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_booking_identity_or_dates'));
});
test('invalid date does not stop other jobs or invent calendar dates',async()=>{
  const f=fixture();f.detail.boarding_to_date='31/02/2026';assert.equal((await tick(f)).phase,'complete');
  assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_bookings'));
});
test('room outside physical inventory is flagged not assigned',async()=>{
  const f=fixture();f.detail.overnights[0].run='Private Room 100';await tick(f);
  assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_booking_relations'));
});
test('staff edited dates keep their room relationships',async()=>{
  const f=fixture();f.existing.check_out='2026-09-12';await tick(f);
  assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_booking_relations'));
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_staff_edited_booking_review'));
});
test('export-only source fields survive API refreshes',async()=>{
  const f=fixture();Object.assign(f.existing,{legacy_tax_amount:13.04,legacy_booking_type:'Boarding',legacy_source:'Online',legacy_metadata:{belongs:'Deloraine',xero:'original'}});await tick(f);
  const row=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
  assert.equal(row.legacy_tax_amount,13.04);assert.equal(row.legacy_source,'Online');assert.equal(row.legacy_xero,'original');
});
test('shared invoice cannot duplicate existing money',async()=>{
  const f=fixture();f.payments=[{...pay(),booking_id:'other-booking'}];await tick(f);
  assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_payments'));
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_payment_reconciliation_review'));
});
test('failure retains original queue for retry and redacts credentials',async()=>{
  const f=fixture();f.source=async()=>{throw Error('test-secret source failed');};await assert.rejects(()=>tick(f),/REDACTED/);
  assert.equal(f.calls.at(-1).body.next_queue.length,1);assert.ok(!f.calls.at(-1).body.failure.includes('test-secret'));
});
test('capped booking ranges split before import',async()=>{
  const f=fixture('bookings',{queue:[{from:'2026-01-01',to:'2026-12-31'}]});f.sourceRows=Array(1000).fill({});await tick(f);
  assert.equal(f.calls.at(-1).body.next_queue.length,2);assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_stage_legacy_source_file'));
});
test('customer pets are imported in bounded bulk batches',async()=>{
  const f=fixture('customers',{queue:[{from:'2026-01-01',to:'2026-12-31'}]});
  f.sourceRows=Array.from({length:100},(_,i)=>({id:i+1,name:`Test ${i}`,email:'',pets:[{id:i+1,name:`Cat ${i}`}]}));await tick(f);
  assert.equal(f.calls.filter(c=>c.path==='rpc/catstays_import_legacy_cats').length,1);
  assert.equal(f.calls.at(-1).body.next_phase,'bookings');
});
test('blank source customer names are archived and flagged without blocking valid profiles',async()=>{
  const f=fixture('customers',{queue:[{from:'2026-01-01',to:'2026-12-31'}]});
  f.sourceRows=[{id:1,name:' ',pets:[{id:2,name:'Not linked'}]},{id:3,name:'Valid',pets:[{id:4,name:''},{id:5,name:'Valid cat'}]}];await tick(f);
  assert.equal(f.calls.find(c=>c.path==='rpc/catstays_stage_legacy_source_records').body.records.length,2);
  assert.deepEqual(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_customers').body.records.map(c=>c.external_id),['3']);
  assert.deepEqual(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_cats').body.records.map(c=>c.external_id),['5']);
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_customer_missing_name'));
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_cat_missing_name'));
  assert.equal(f.calls.at(-1).body.next_phase,'bookings');
});
