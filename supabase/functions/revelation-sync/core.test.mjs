import test from 'node:test';
import assert from 'node:assert/strict';
import {isoDate,sourceTime,splitRange,planPayments,processTick,clients,PROJECT,pendingAccommodationCost} from './core.mjs';

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
test('API-only booking identity confidence uses the numeric database contract',async()=>{
  const f=fixture();await tick(f);
  const row=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
  assert.equal(row.customer_match_confidence,1);
  assert.equal(typeof row.customer_match_confidence,'number');
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

test('operational customer discovery advances to current range, not year 2000',async()=>{
 const f=fixture('customers',{queue:[{from:'2026-08-27',to:'2026-09-04'}]});
 f.job.checkpoint.scope='operational';f.job.checkpoint.bookings_from='2026-08-04';
 await tick(f);assert.equal(f.calls.at(-1).body.next_queue[0].from,'2026-08-04');
});
test('changes-only customer discovery fails closed to today when its booking watermark is absent',async()=>{
 const f=fixture('customers',{queue:[{from:'2026-09-02',to:'2026-09-04'}]});
 f.job.checkpoint.scope='changes_only';
 await tick(f);assert.equal(f.calls.at(-1).body.next_queue[0].from,f.job.local_day);
});
test('fresh booking discovery includes newly created and pending references first',async()=>{
 const f=fixture('bookings',{queue:[{from:'2026-08-04',to:'2036-12-31'}]});
 f.sourceRows=[{id:1,booking_id:100,boarding_to_date:'10/09/2026'},{id:2,booking_id:101,boarding_to_date:'03/10/2026',pending:'Yes'},{id:3,booking_id:102,boarding_to_date:'28/09/2026'}];
 await tick(f);assert.deepEqual(f.calls.at(-1).body.next_queue.map(x=>x.reference),['102','101','100']);
});
test('changes-only discovery stores no unchanged booking-list archive and loads observed checksums',async()=>{
 const f=fixture('bookings',{queue:[{from:'2026-09-03',to:'2036-12-31'}]});
 f.job.checkpoint.scope='changes_only';
 f.sourceRows=[{id:1,booking_id:100,boarding_to_date:'10/09/2026'}];
 await tick(f);
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_stage_legacy_source_file'));
 assert.ok(f.calls.some(c=>c.path==='rpc/catstays_observed_source_bookings'));
 assert.deepEqual(f.calls.at(-1).body.next_checkpoint.observed_checksums,{});
});
test('source pending status is retained and cancelled takes precedence',async()=>{
 for(const [pending,cancelled,status] of [['Yes','No','pending'],['Yes','Yes','cancelled'],['No','No','confirmed']]){
  const f=fixture();f.detail.pending=pending;f.detail.cancelled=cancelled;f.existing.status='pending';await tick(f);
  assert.equal(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0].status,status);
 }
});
test('expired manual window does not start a source detail request',async()=>{
 const f=fixture();f.job.manual_until=new Date(Date.now()-1000).toISOString();let reads=0;
 f.source=async()=>{reads++;return f.detail;};await tick(f);assert.equal(reads,0);assert.equal(f.calls.at(-1).body.next_queue.length,1);
});
test('operational missing owner uses exact source identity, not a guessed name',async()=>{
 const f=fixture();f.job.checkpoint.scope='operational';let fetched=false;const original=f.db;
 f.db=async(path,body)=>path.startsWith('customers?')&&!fetched?[]:original(path,body);
 f.source=async(endpoint,params)=>{if(endpoint==='booking')return f.detail;assert.equal(params.keywords,f.owner.email);fetched=true;return [{id:2,name:f.owner.name,email:f.owner.email,pets:[{id:3,name:'Test Cat'}]}];};
 await tick(f);assert.ok(f.calls.some(c=>c.path==='rpc/catstays_import_legacy_customers'));
 assert.ok(f.calls.some(c=>c.path==='rpc/catstays_import_legacy_bookings'));
});

test('existing future booking detail changes reach the same external identity',async()=>{
 const f=fixture();f.job.checkpoint.scope='operational';
 Object.assign(f.detail,{boarding_from_date:'05/09/2026',boarding_to_date:'12/09/2026',boarding_arriving:'10:30 AM',boarding_departing:'4:00 PM',notes:'Changed collection instructions',total_amount:140,outstanding_amount:90});
 f.detail.overnights[0]={pet:'Test Cat',run:'Private Room 2',from_date:'05/09/2026',to_date:'12/09/2026'};
 Object.assign(f.existing,{check_in:'2026-09-05',check_out:'2026-09-12'});
 await tick(f);
 const row=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
 assert.equal(row.external_id,'100');assert.equal(row.check_in,'2026-09-05');assert.equal(row.check_out,'2026-09-12');
 assert.equal(row.notes,'Changed collection instructions');assert.equal(row.check_in_time,'10:30:00');assert.equal(row.legacy_outstanding,90);
 assert.equal(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_booking_relations').body.records[0].assignments[0].room_unit_number,2);
});

test('verified unchanged full response avoids repeat database imports',async()=>{
 const f=fixture();f.job.checkpoint.scope='operational';
 const {hash}=await import('./core.mjs');f.job.checkpoint.checked_checksums={'100':await hash(JSON.stringify(f.detail))};
 const out=await tick(f);assert.equal(out.processed,1);
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_bookings'));
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_stage_legacy_source_file'));
});
test('changes-only sync does not revisit an unchanged previously observed warning',async()=>{
 const f=fixture();f.job.checkpoint.scope='changes_only';
 const {hash}=await import('./core.mjs');f.job.checkpoint.observed_checksums={'100':await hash(JSON.stringify(f.detail))};
 const out=await tick(f);assert.equal(out.processed,1);
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_bookings'));
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_stage_legacy_source_file'));
 assert.ok(!f.calls.some(c=>c.body?.issue_type));
});
test('a note-only change invalidates a verified snapshot',async()=>{
 const f=fixture();f.job.checkpoint.scope='operational';
 const {hash}=await import('./core.mjs');f.job.checkpoint.checked_checksums={'100':await hash(JSON.stringify(f.detail))};
 f.detail.notes='New source note';await tick(f);
 assert.equal(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0].notes,'New source note');
});
test('no verified snapshot always processes full relationships and payments',async()=>{
 const f=fixture();f.job.checkpoint.scope='operational';f.job.checkpoint.checked_checksums={};await tick(f);
 assert.ok(f.calls.some(c=>c.path==='rpc/catstays_import_legacy_booking_relations'));
 assert.ok(f.calls.some(c=>c.path==='rpc/catstays_import_legacy_payments'));
});

const quoteInput=()=>({start:'2026-09-30',end:'2026-10-03',
 assignments:[{cat_external_id:'1',room_id:'room',room_unit_number:15,starts_on:'2026-09-30',ends_on:'2026-10-03'}],
 rooms:[{id:'room',price_per_night:20}],settings:{pricingRates:[{numberOfCats:'1',price:'20'}],chargeTax:true,taxRate:'15'}});
test('pending price includes both dates and GST before confirmation',()=>{
 assert.equal(pendingAccommodationCost(quoteInput()),92);
});
test('pending shared room uses its occupancy rate; separate rooms price independently',()=>{
 const q=quoteInput();q.assignments.push({...q.assignments[0],cat_external_id:'2'});
 q.settings.pricingRates.push({numberOfCats:'2',price:'35'});
 assert.equal(pendingAccommodationCost(q),161);
 q.assignments[1].room_unit_number=16;
 assert.equal(pendingAccommodationCost(q),184);
});
test('pending same-day and tax-free stays work; missing rates and overlaps fail closed',()=>{
 const q=quoteInput();q.end=q.start;q.settings.chargeTax=false;assert.equal(pendingAccommodationCost(q),20);
 q.settings.pricingRates=[];q.rooms=[];assert.throws(()=>pendingAccommodationCost(q));
 const overlap=quoteInput();overlap.assignments.push({...overlap.assignments[0]});
 assert.throws(()=>pendingAccommodationCost(overlap));
});
function unpricedFixture(){
 const f=fixture();f.existing.status='pending';f.existing.total_amount=0;
 Object.assign(f.detail,{pending:'Yes',total_amount:0,outstanding_amount:0,payments:[]});
 const db=f.db;f.db=async(path,body)=>{
  if(path.startsWith('catteries?'))return [{website_settings:{pricingRates:[{numberOfCats:1,price:20}],chargeTax:true,taxRate:15}}];
  if(path.startsWith('booking_adjustments?'))return [];
  return db(path,body);
 };return f;
}
test('zero source pending imports persist a cost while remaining pending and unpaid',async()=>{
 const f=unpricedFixture();await tick(f);
 const r=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
 assert.equal(r.legacy_amount,230);assert.equal(r.legacy_outstanding,230);assert.equal(r.legacy_monies_received,0);
 assert.equal(r.status,'pending');assert.equal(r.payment_status,'unpaid');
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_payments'));
 const archived=f.calls.find(c=>c.path==='rpc/catstays_stage_legacy_source_records').body.records[0].raw_record;
 assert.equal(archived.total_amount,0);
});
test('an existing pending quote is preserved on repeated zero-source sync',async()=>{
 const f=unpricedFixture();Object.assign(f.existing,{total_amount:120,legacy_outstanding:120,legacy_metadata:{_revelation_source:{total_amount:120}}});await tick(f);
 const r=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
 assert.equal(r.legacy_amount,120);
});
test('existing adjustments and payments prevent inferred repricing',async()=>{
 for(const type of ['adjustment','payment']){
  const f=unpricedFixture(),db=f.db;
  f.db=async(p,b)=>type==='adjustment'&&p.startsWith('booking_adjustments?')?[{id:'keep'}]:db(p,b);
  if(type==='payment')f.payments=[pay()];
  await tick(f);
  assert.equal(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0].legacy_amount,0);
  assert.ok(f.calls.some(c=>c.body?.issue_type==='api_pending_pricing_review'));
 }
});
test('unchanged checksum must not skip an unpriced pending request',async()=>{
 const f=unpricedFixture();const {hash}=await import('./core.mjs');
 f.job.checkpoint.scope='operational';f.job.checkpoint.checked_checksums={'100':await hash(JSON.stringify(f.detail))};
 await tick(f);assert.equal(f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0].legacy_amount,230);
});

test('pending quote preserves existing receipt snapshots without creating payments',async()=>{
 const f=unpricedFixture();Object.assign(f.existing,{total_amount:120,legacy_outstanding:70,legacy_monies_received:50,legacy_metadata:{_revelation_source:{total_amount:120}}});
 await tick(f);
 const r=f.calls.find(c=>c.path==='rpc/catstays_import_legacy_bookings').body.records[0];
 assert.equal(r.legacy_amount,120);assert.equal(r.legacy_outstanding,70);assert.equal(r.legacy_monies_received,50);
 assert.ok(!f.calls.some(c=>c.path==='rpc/catstays_import_legacy_payments'));
});
test('missing coverage for one cat is rejected even if another cat is present',()=>{
 const q=quoteInput();q.assignments.push({...q.assignments[0],cat_external_id:'2',starts_on:'2026-10-01'});
 assert.throws(()=>pendingAccommodationCost(q),/Gap/);
});
