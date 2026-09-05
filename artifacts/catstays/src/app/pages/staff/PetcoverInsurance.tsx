import { useMemo, useState } from 'react';
import { ExternalLink, FileCheck2, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { usePetcoverApplications, type PetcoverApplication, type PetcoverApplicationStatus } from '@/hooks/usePetcoverApplications';
import { PETCOVER_DECLARATION_LABELS } from '../../lib/petcover';

const statusLabels: Record<PetcoverApplicationStatus, string> = {
  ready_to_submit: 'Ready to submit',
  submitted: 'Submitted to Petcover',
  active: 'Active',
  declined: 'Declined',
  ineligible: 'Ineligible',
};

const statusClasses: Record<PetcoverApplicationStatus, string> = {
  ready_to_submit: 'border-amber-200 bg-amber-50 text-amber-800',
  submitted: 'border-blue-200 bg-blue-50 text-blue-800',
  active: 'border-green-200 bg-green-50 text-green-800',
  declined: 'border-slate-200 bg-slate-100 text-slate-700',
  ineligible: 'border-red-200 bg-red-50 text-red-800',
};

function formatDate(value: string | null) {
  if (!value) return 'Not recorded';
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function applicationSearchText(application: PetcoverApplication) {
  return [
    application.customer?.name,
    application.customer?.email,
    application.cat?.name,
    application.cat?.breed,
    application.booking_id,
    application.policy_number,
  ].filter(Boolean).join(' ').toLowerCase();
}

function ApplicationCard({ application, onSaved }: { application: PetcoverApplication; onSaved: () => void }) {
  const { updateApplication } = usePetcoverApplications(false);
  const [status, setStatus] = useState<PetcoverApplicationStatus>(application.status);
  const [policyNumber, setPolicyNumber] = useState(application.policy_number || '');
  const [policyUrl, setPolicyUrl] = useState(application.policy_url || '');
  const [notes, setNotes] = useState(application.notes || '');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const declarationCount = PETCOVER_DECLARATION_LABELS.filter(({ key }) => application.declarations?.[key]).length;

  const save = async () => {
    setSaving(true);
    setSaveError('');
    const result = await updateApplication(application.id, {
      status,
      policy_number: policyNumber.trim() || null,
      policy_url: policyUrl.trim() || null,
      notes: notes.trim() || null,
    });
    if (result.error) setSaveError(result.error.message || 'The insurance record could not be updated.');
    else {
      onSaved();
      setOpen(false);
    }
    setSaving(false);
  };

  return (
    <article className="rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-[#0A1128]">{application.cat?.name || 'Cat record'}</h3>
            <Badge variant="outline" className={statusClasses[application.status]}>{statusLabels[application.status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-[#4E5871]">
            {application.customer?.name || 'Customer not linked'} · {application.booking ? `${formatDate(application.booking.check_in)} – ${formatDate(application.booking.check_out)}` : 'Booking not linked'}
          </p>
        </div>
        <p className="shrink-0 text-xs text-[#768098]">Added {formatDate(application.created_at)}</p>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-[#F8F7F5] p-3"><p className="text-xs uppercase tracking-wide text-[#768098]">Eligibility</p><p className="mt-1 font-medium text-[#0A1128]">{application.eligibility_reason || 'Review required'}</p></div>
        <div className="rounded-xl bg-[#F8F7F5] p-3"><p className="text-xs uppercase tracking-wide text-[#768098]">DOB</p><p className="mt-1 font-medium text-[#0A1128]">{formatDate(application.cat_date_of_birth)}</p></div>
        <div className="rounded-xl bg-[#F8F7F5] p-3"><p className="text-xs uppercase tracking-wide text-[#768098]">Declarations</p><p className="mt-1 font-medium text-[#0A1128]">{declarationCount}/{PETCOVER_DECLARATION_LABELS.length} confirmed</p></div>
        <div className="rounded-xl bg-[#F8F7F5] p-3"><p className="text-xs uppercase tracking-wide text-[#768098]">Microchip</p><p className="mt-1 break-all font-medium text-[#0A1128]">{application.microchip_number || 'Not recorded'}</p></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {application.booking && <Link to={`/staff-dashboard/bookings?booking=${application.booking.id}`} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#E8DED4] px-3 text-sm font-semibold text-[#0A1128] hover:border-[#C46A3A] hover:text-[#C46A3A]">Booking <ExternalLink className="h-3.5 w-3.5" /></Link>}
        {application.customer && <Link to={`/staff-dashboard/customers?search=${encodeURIComponent(application.customer.name)}`} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#E8DED4] px-3 text-sm font-semibold text-[#0A1128] hover:border-[#C46A3A] hover:text-[#C46A3A]">Customer <ExternalLink className="h-3.5 w-3.5" /></Link>}
        {application.policy_url && <a href={application.policy_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-[#E8DED4] px-3 text-sm font-semibold text-[#0A1128] hover:border-[#C46A3A] hover:text-[#C46A3A]">Petcover record <ExternalLink className="h-3.5 w-3.5" /></a>}
        <Button type="button" variant="outline" onClick={() => setOpen((value) => !value)} className="min-h-10 rounded-xl border-[#C46A3A]/40 text-[#A8562E]">{open ? 'Hide record tools' : 'Update record'}</Button>
      </div>

      {open && (
        <div className="mt-4 space-y-4 rounded-2xl border border-[#F0C9B2] bg-[#FFF8F2] p-4">
          <div className="rounded-xl border border-[#F0C9B2] bg-white p-3 text-sm text-[#4E5871]">
            Use this record to enter the details into the Petcover portal. CatStays does not activate cover or represent that a policy exists until Petcover confirms it.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#0A1128]">Petcover status<select value={status} onChange={(event) => setStatus(event.target.value as PetcoverApplicationStatus)} className="mt-1.5 h-11 w-full rounded-xl border border-[#E8DED4] bg-white px-3 font-normal"><option value="ready_to_submit">Ready to submit</option><option value="submitted">Submitted to Petcover</option><option value="active">Active</option><option value="declined">Declined</option><option value="ineligible">Ineligible</option></select></label>
            <label className="text-sm font-semibold text-[#0A1128]">Policy number (optional)<Input value={policyNumber} onChange={(event) => setPolicyNumber(event.target.value)} placeholder="Enter after Petcover confirms" className="mt-1.5 bg-white font-normal" /></label>
          </div>
          <label className="block text-sm font-semibold text-[#0A1128]">Petcover portal or policy link (optional)<Input type="url" value={policyUrl} onChange={(event) => setPolicyUrl(event.target.value)} placeholder="https://…" className="mt-1.5 bg-white font-normal" /></label>
          <label className="block text-sm font-semibold text-[#0A1128]">Staff notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Submission date, portal notes, or follow-up…" className="mt-1.5 w-full rounded-xl border border-[#E8DED4] bg-white p-3 font-normal outline-none focus:border-[#C46A3A]" /></label>
          {saveError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
          <div className="flex justify-end"><Button type="button" onClick={() => void save()} disabled={saving} className="rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">{saving ? 'Saving…' : 'Save insurance record'}</Button></div>
        </div>
      )}
    </article>
  );
}

export function PetcoverInsurance() {
  const { applications, loading, error, refetch } = usePetcoverApplications();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PetcoverApplicationStatus>('all');
  const visibleApplications = useMemo(() => applications.filter((application) => (
    (statusFilter === 'all' || application.status === statusFilter)
    && (!query.trim() || applicationSearchText(application).includes(query.trim().toLowerCase()))
  )), [applications, query, statusFilter]);
  const readyCount = applications.filter((application) => application.status === 'ready_to_submit').length;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#E8DED4] bg-gradient-to-br from-white via-white to-[#FFF3E8] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Petcover introductory offer</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0A1128]">Capture now, submit manually</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4E5871]">Collect the details for eligible first-time kittens and cats under 12 months, then enter them into the Petcover portal. This workspace never marks cover active without staff confirmation.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-[#0A1128] p-4 text-white"><ShieldCheck className="h-7 w-7 text-[#F4B183]" /><div><p className="text-2xl font-semibold">{readyCount}</p><p className="text-xs text-white/70">ready to submit</p></div></div>
        </div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">Offer and waiting-period wording must follow Petcover’s approved material. CatStays collects the details for staff to enter manually.</div>
      </section>

      <section className="rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#E8DED4] px-3 focus-within:border-[#C46A3A]"><Search className="h-4 w-4 text-[#C46A3A]" /><span className="sr-only">Search insurance records</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer, cat, booking, or policy number" className="min-w-0 flex-1 py-3 text-sm outline-none" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="h-12 rounded-xl border border-[#E8DED4] bg-white px-3 text-sm"><option value="all">All statuses ({applications.length})</option><option value="ready_to_submit">Ready to submit</option><option value="submitted">Submitted</option><option value="active">Active</option><option value="declined">Declined</option><option value="ineligible">Ineligible</option></select>
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Insurance records could not be loaded. {error}</p>}
      {loading ? <p className="rounded-2xl border border-[#E8DED4] bg-white p-6 text-sm text-[#4E5871]">Loading insurance records…</p> : visibleApplications.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#D8C8BA] bg-white px-5 py-12 text-center"><FileCheck2 className="mx-auto h-10 w-10 text-[#C46A3A]" /><h3 className="mt-3 font-semibold text-[#0A1128]">{applications.length ? 'No matching insurance records' : 'No Petcover records yet'}</h3><p className="mt-1 text-sm text-[#4E5871]">{applications.length ? 'Try another customer, cat, booking, or status.' : 'Records appear here when a customer or staff member selects the introductory offer during booking.'}</p></section>
      ) : (
        <div className="space-y-3">{visibleApplications.map((application) => <ApplicationCard key={application.id} application={application} onSaved={() => void refetch()} />)}</div>
      )}
    </div>
  );
}
