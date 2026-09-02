"""Build an exact-ID private migration bundle. Never edits source archives."""
import csv, gzip, hashlib, json, re, sys
from decimal import Decimal
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse, parse_qs

root=Path(sys.argv[1]); out=Path(sys.argv[2]); issues=[]
def jl(path): return [json.loads(x) for x in (root/path).read_text().splitlines() if x.strip()]
def cr(path):
    with (root/path).open(newline='') as f: return list(csv.DictReader(f))
def fields(p): return {f['name']:f.get('value','') for f in p.get('fields',[])}
def idstr(v): return str(v or '').strip()
def date(v):
    if not v: return None
    for fmt in ['%d/%m/%Y','%Y-%m-%d']:
        try: return datetime.strptime(v,fmt).date().isoformat()
        except ValueError: pass
    raise ValueError('Unrecognised source date')
def time(v):
    if not v:return None
    for fmt in ['%I:%M %p','%H:%M','%H:%M:%S']:
        try:return datetime.strptime(v.strip(),fmt).time().isoformat()
        except ValueError:pass
    raise ValueError('Unrecognised source time')
def source_customer(a):
    return dict(customer_name=a['name'],email=a.get('email',''),phone=a.get('mobile') or a.get('telephone'),
      address=', '.join(a.get(k,'') or '' for k in ['address_line1','address_line2','city','postcode']).strip(', '),
      notes=a.get('note'),external_source='revelation_pets',external_id=str(a['id']),legacy_metadata={'api':a})
customers={r['external_id']:r for r in cr('prepared/revelation-customers.csv')}
for c in customers.values():
    c['legacy_metadata']=json.loads(c['legacy_metadata'])
    for k in ['legacy_account_balance','legacy_total_spent']: c[k]=float(c[k]) if c[k] else None
    for k in ['created_at','legacy_last_booking']:c[k]=c[k] or None
api_customers=jl('api/customers.jsonl')
api_pets={str(p['id']):dict(p,owner_id=str(c['id'])) for c in api_customers for p in c.get('pets',[])}
for a in api_customers:
    if str(a['id']) not in customers:customers[str(a['id'])]=source_customer(a)
    else: customers[str(a['id'])]['legacy_metadata']['api']=a
for p in (root/'source/historical-customer-profiles').glob('*.json'):
    a=json.loads(p.read_text()); f=fields(a); eid=str(a['requested_id'])
    if not f.get('customer[name]') or eid in customers:continue
    customers[eid]=dict(customer_name=f['customer[name]'],email=f.get('customer[email]',''),
      phone=f.get('customer[mobile]') or f.get('customer[telephone]'),
      address=', '.join(f.get('customer['+x+']','') for x in ['addressLine1','addressLine2','city','postcode']).strip(', '),
      notes=f.get('customer[note]'),external_source='revelation_pets',external_id=eid,legacy_metadata={'historical_profile':a})
crosswalk={r['export_alias']:r['api_pet_id'] for r in json.loads((root/'prepared/cat-external-id-crosswalk.json').read_text())}
cats={}; unmatched=[]
for c in cr('prepared/revelation-cats.csv'):
    c['legacy_metadata']=json.loads(c['legacy_metadata']); alias=c['external_id']; eid=crosswalk.get(alias)
    if eid:
        c['external_id']=eid;c['legacy_metadata']['export_alias']=alias
        if eid in cats:raise ValueError('Duplicate cat ID in crosswalk')
        cats[eid]=c
    else:unmatched.append(c)
for p in (root/'source/cat-profile-identity-review').glob('*.json'):
    a=json.loads(p.read_text()); f=fields(a); eid=str(a['pet_id'])
    owners=parse_qs(urlparse(a.get('resolved_url','')).query).get('id',[])
    if not a.get('available') or not f.get('pet[name]') or len(owners)!=1 or owners[0] not in customers:continue
    if eid in cats:cats[eid]['legacy_metadata']['source_profile']=a;continue
    cats[eid]=dict(cat_name=f['pet[name]'],owner_external_id=owners[0],breed=f.get('pet[breed]'),
      age=f.get('pet[age]'),medical_notes=f.get('pet[medication2]'),dietary_requirements=f.get('pet[dietary]'),
      external_id=eid,external_source='revelation_pets',legacy_metadata={'source_profile':a})
for eid,p in api_pets.items():
    if eid not in cats:
        cats[eid]=dict(cat_name=p['name'],owner_external_id=p['owner_id'],breed=p.get('breed'),external_id=eid,
          external_source='revelation_pets',legacy_metadata={'api_pet':p})
for c in unmatched:
    # Keep unresolved export-only records with their stable export alias. Avoid
    # creating duplicates when an exact source profile already supplies the cat.
    choices=[p for p in cats.values() if p['owner_external_id']==c['owner_external_id'] and p['cat_name'].casefold()==c['cat_name'].casefold()]
    if not choices:cats[c['external_id']]=c
    else:issues.append({'type':'ambiguous_export_cat_archived','external_id':c['external_id']})
rels={r['reference']:r for r in jl('prepared/booking-exact-relationships.jsonl')}
details={str(r['booking_id']):r for r in jl('api/booking-details-including-report-only.jsonl')}
bookings=[]; relations=[]
rooms={'private':('fd4f4a86-2da7-4700-88a7-0aae486c438a',17),'indoor':('e98a540f-d9c1-411b-9200-7a632aba76b1',8),'comm':('b03dc84e-f31b-4045-a56c-6d794177e07f',25)}
for b in cr('prepared/booking-candidates-exact-linked.csv'):
    eid=b['external_id']; relation=rels[eid]; d=details.get(eid)
    for k in ['legacy_amount','legacy_tax_amount','legacy_monies_received','legacy_outstanding','customer_match_confidence']:
        b[k]=float(b[k]) if b[k] else None
    b['number_of_cats']=int(b['number_of_cats'] or 1)
    b['possible_customer_external_ids']=json.loads(b['possible_customer_external_ids'])
    for k in ['check_in','check_out','check_in_time','check_out_time','created_at']:b[k]=b[k] or None
    # Never carry a name-match fallback when exact source ownership is unknown.
    owner_ids=relation['customer_external_ids']
    b['customer_external_id']=owner_ids[0] if len(owner_ids)==1 and owner_ids[0] in customers else None
    if not b['check_in'] or not b['check_out']:
        issues.append({'type':'dateless_booking_archived','external_id':eid});continue
    if b['check_out']<b['check_in']:
        issues.append({'type':'invalid_cancelled_booking_dates_archived','external_id':eid,'source_booking':b});continue
    if d:
        b['check_in_time']=time(d.get('boarding_arriving')) or b['check_in_time']
        b['check_out_time']=time(d.get('boarding_departing')) or b['check_out_time']
        b['notes']=d.get('notes')
    bookings.append(b)
    known=[cid for cid in relation['cat_external_ids'] if cid in cats]
    missing=set(relation['cat_external_ids'])-set(known)
    if missing:issues.append({'type':'missing_historical_cat','external_id':eid,'cat_ids':sorted(missing)})
    assignments=[]
    for o in (d or {}).get('overnights',[]):
        pet_label=o.get('pet','').strip().casefold()
        candidates=[cid for cid in known if cats[cid]['cat_name'].strip().casefold()==pet_label]
        if len(candidates)!=1:
            pet_labels=[x.strip() for x in pet_label.split(',')]
            matches=[[cid for cid in known if cats[cid]['cat_name'].strip().casefold()==label] for label in pet_labels]
            candidates=[m[0] for m in matches] if all(len(m)==1 for m in matches) else []
        m=re.fullmatch(r'`?\s*(Private|Indoor|Comm)(?:unal)?(?:\s+Room)?\s*(\d+)',o.get('run','').strip(),re.I)
        if not candidates or len(set(candidates))!=len(candidates) or not m:
            issues.append({'type':'unmapped_cat_room_line','external_id':eid,'source_line':o});continue
        room_id,maximum=rooms[m[1].lower()]; unit=int(m[2])
        if unit<1 or unit>maximum:
            issues.append({'type':'historical_room_outside_current_inventory','external_id':eid,'source_room':o['run']});continue
        for cid in candidates:
            assignments.append(dict(cat_external_id=cid,room_id=room_id,room_unit_number=unit,
              starts_on=date(o['from_date']),ends_on=date(o['to_date'])))
    assignments=list({json.dumps(a,sort_keys=True):a for a in assignments}.values())
    split=any(a['starts_on']!=b['check_in'] or a['ends_on']!=b['check_out'] for a in assignments) or len({a['cat_external_id'] for a in assignments})<len(assignments)
    relations.append(dict(external_id=eid,cat_external_ids=known,assignments=assignments,split_stay=split))
payments=[]
active_sheet=jl('prepared/05-payments-excluding-deleted-2000-2035.sheet-0.raw-rows.jsonl')
active_rows=[dict(zip(active_sheet[0]['values'],r['values'])) for r in active_sheet[1:]]
def payment_key(invoice,customer,pets,description,paid,method,amount):
    invoice=re.sub(r'\.0$','',str(invoice or '').strip())
    description=re.sub(r'^(\d+)\.0$',r'\1',str(description or '').strip())
    return ('' if invoice=='0' else invoice,str(customer or '').strip(),str(pets or '').strip(),
      description,date(paid),str(method or '').strip(),str(Decimal(str(amount).replace('$','').replace(',','')).quantize(Decimal('.01'))))
active_counter=Counter(payment_key(r['Invoice Id'],r['Customer'],r['Pet(s) Name'],r['Payment Description'],r['Payment Date'],r['Payment Type'],r['Payment Amount'])
  for r in active_rows if re.fullmatch(r'\d{2}/\d{2}/\d{4}',str(r.get('Payment Date',''))))
assert sum(active_counter.values())==10028, 'Unexpected active-payment source count'
invoice_refs=defaultdict(set)
for ref,d in details.items():
    if str(d.get('invoice_id','0'))!='0':invoice_refs[str(d['invoice_id'])].add(ref)
booked_ids={b['external_id'] for b in bookings}
for p in cr('prepared/payment-candidates.csv'):
    for k in ['amount','legacy_tax_amount']:p[k]=float(p[k]) if p[k] else None
    p['legacy_deleted']=p['legacy_deleted'].lower()=='true';p['paid_on']=p['paid_on'] or None
    pk=payment_key(p['legacy_invoice_id'],p['legacy_customer_name'],p['legacy_pet_names'],p['legacy_description'],p['paid_on'],p['legacy_payment_type'],p['amount'])
    p['legacy_deleted']=active_counter[pk]<=0
    if not p['legacy_deleted']:active_counter[pk]-=1
    refs=invoice_refs[p['legacy_invoice_id']]
    ref=next(iter(refs)) if len(refs)==1 else None
    p['booking_external_id']=ref if ref in booked_ids else None
    owner_ids=rels.get(ref,{}).get('customer_external_ids',[])
    p['customer_external_id']=owner_ids[0] if len(owner_ids)==1 and owner_ids[0] in customers else None
    payments.append(p)
assert sum(active_counter.values())==0, 'Unmatched active payment source rows'
assert sum(p['legacy_deleted'] for p in payments)==12, 'Deleted payment reconciliation mismatch'
payload={'format':1,'cattery_id':'7f6d029f-b727-4645-83be-db6ec56d1b46','source':'revelation_pets',
  'customers':list(customers.values()),'cats':list(cats.values()),'bookings':bookings,'relations':relations,'payments':payments,
  'issues':issues,'raw_sources':[]}
# Store raw reports and API records, including exceptions, for cloud retention.
for folder,patterns in [('prepared',['*.raw-records.jsonl','*.raw-rows.jsonl']),('api',['customers.jsonl','bookings.jsonl','payments.jsonl','booking-details-including-report-only.jsonl'])]:
    paths=set()
    for pattern in patterns:paths.update((root/folder).glob(pattern))
    for p in sorted(paths):
        data=p.read_bytes(); rows=[json.loads(x) for x in data.decode().splitlines() if x.strip()]
        payload['raw_sources'].append(dict(name=str(p.relative_to(root)),sha256=hashlib.sha256(data).hexdigest(),bytes=len(data),rows=rows))
data=json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode()
out.write_bytes(gzip.compress(data,mtime=0));out.chmod(0o600)
print(json.dumps({'counts':{k:len(payload[k]) for k in ['customers','cats','bookings','relations','payments','raw_sources']},
  'issues':dict(Counter(i['type'] for i in issues)),'active_payment_total':round(sum(p['amount'] for p in payments if not p['legacy_deleted']),2),
  'credit_total':round(sum(c.get('legacy_account_balance') or 0 for c in customers.values()),2),
  'compressed_bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()},indent=2))
