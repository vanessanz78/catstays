import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowLeft,
  ArrowRight,
  Cat,
  Check,
  CheckCircle2,
  FileUp,
  GitMerge,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';
import {
  DEFAULT_CUSTOMER_PROFILE_CHOICE,
  customerDirectoryMetrics,
  customerMatchesDirectorySearch,
  mergedCustomerProfile,
  type CustomerProfileChoice,
  type CustomerProfileField,
} from '../../lib/customerDirectory';
import { normalizeBookingSetup } from '../../lib/bookingSetup';

type Customer = ReturnType<typeof useCustomers>['customers'][number];
type Booking = ReturnType<typeof useBookings>['bookings'][number];

type StaffCustomerDirectoryProps = {
  customers: Customer[];
  bookings: Booking[];
  isLoading: boolean;
  createCustomer: ReturnType<typeof useCustomers>['createCustomer'];
  addCat: ReturnType<typeof useCustomers>['addCat'];
  mergeCustomers: ReturnType<typeof useCustomers>['mergeCustomers'];
  refetchBookings: ReturnType<typeof useBookings>['refetch'];
};

const customerFields: Array<{ key: CustomerProfileField; label: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email address' },
  { key: 'phone', label: 'Mobile number' },
  { key: 'address', label: 'Address' },
  { key: 'notes', label: 'Internal notes' },
];

function money(value: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
}

function shortDate(value: string) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#E8DED4] bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function CustomerPicker({
  label,
  customers,
  selected,
  excludedCustomerId,
  onSelect,
}: {
  label: string;
  customers: Customer[];
  selected: Customer | null;
  excludedCustomerId?: string;
  onSelect: (customer: Customer | null) => void;
}) {
  const [query, setQuery] = useState('');
  const matches = query.trim()
    ? customers
      .filter((customer) => customer.id !== excludedCustomerId)
      .filter((customer) => customerMatchesDirectorySearch(customer, query))
      .slice(0, 8)
    : [];

  if (selected) {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-[#0A1128]">{label}</p>
        <div className="flex items-start justify-between gap-3 rounded-xl border border-[#C46A3A]/30 bg-[#FFF8F2] p-4">
          <div className="min-w-0">
            <p className="font-semibold text-[#0A1128]">{selected.name}</p>
            <p className="truncate text-sm text-[#4E5871]">{selected.email}</p>
            <p className="mt-1 text-xs text-[#768098]">
              ID {selected.id.slice(0, 8)} · {(selected.cats || []).map((cat) => cat.name).join(', ') || 'No cats'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setQuery('');
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#E8DED4] bg-white text-[#4E5871] hover:bg-[#F8F7F5]"
            aria-label={`Change ${label.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-[#0A1128]">
        {label}
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-[#E8DED4] bg-white px-3 focus-within:border-[#C46A3A]">
          <Search className="h-4 w-4 shrink-0 text-[#C46A3A]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a name, ID, email, phone, or cat…"
            className="min-w-0 flex-1 bg-transparent py-3 font-normal outline-none"
          />
        </span>
      </label>
      {query.trim() && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-[#E8DED4] bg-white p-1 shadow-xl">
          {matches.length > 0 ? matches.map((customer) => (
            <button
              type="button"
              key={customer.id}
              onClick={() => {
                onSelect(customer);
                setQuery('');
              }}
              className="w-full rounded-lg px-3 py-3 text-left hover:bg-[#FFF8F2]"
            >
              <p className="font-semibold text-[#0A1128]">{customer.name}</p>
              <p className="truncate text-sm text-[#4E5871]">{customer.email} · {customer.phone || 'No phone'}</p>
              <p className="mt-0.5 text-xs text-[#768098]">
                ID {customer.id.slice(0, 8)} · {(customer.cats || []).map((cat) => cat.name).join(', ') || 'No cats'}
              </p>
            </button>
          )) : (
            <p className="px-3 py-4 text-sm text-[#4E5871]">No matching customers.</p>
          )}
        </div>
      )}
    </div>
  );
}

function MergeCustomersModal({
  customers,
  mergeCustomers,
  refetchBookings,
  onClose,
}: {
  customers: Customer[];
  mergeCustomers: StaffCustomerDirectoryProps['mergeCustomers'];
  refetchBookings: StaffCustomerDirectoryProps['refetchBookings'];
  onClose: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [primary, setPrimary] = useState<Customer | null>(null);
  const [secondary, setSecondary] = useState<Customer | null>(null);
  const [choices, setChoices] = useState<CustomerProfileChoice>({ ...DEFAULT_CUSTOMER_PROFILE_CHOICE });
  const [keepPortalFrom, setKeepPortalFrom] = useState<'primary' | 'secondary'>('primary');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState('');

  const profile = primary && secondary ? mergedCustomerProfile(primary, secondary, choices) : null;
  const canClose = !merging;

  const goToChoices = () => {
    if (!primary || !secondary) return;
    setChoices({ ...DEFAULT_CUSTOMER_PROFILE_CHOICE });
    setKeepPortalFrom(primary.user_id ? 'primary' : secondary.user_id ? 'secondary' : 'primary');
    setMergeError('');
    setStep(2);
  };

  const confirmMerge = async () => {
    if (!primary || !secondary || !profile) return;
    setMerging(true);
    setMergeError('');
    const { error } = await mergeCustomers({
      primaryCustomerId: primary.id,
      secondaryCustomerId: secondary.id,
      profile,
      keepPortalFrom,
    });
    if (error) {
      setMergeError(errorMessage(error, 'The customers could not be merged. Nothing was changed.'));
      setMerging(false);
      return;
    }
    await refetchBookings();
    setMerging(false);
    setStep(4);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A1128]/55 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && canClose) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="merge-customer-title"
        className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl bg-[#F8F7F5] shadow-2xl sm:max-w-5xl sm:rounded-2xl"
      >
        <header className="sticky top-0 z-30 flex items-start justify-between gap-4 border-b border-[#E8DED4] bg-white px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Merge customers · Step {Math.min(step, 3)} of 3</p>
            <h3 id="merge-customer-title" className="text-2xl font-semibold text-[#0A1128]">
              {step === 1 && 'Choose two customers'}
              {step === 2 && 'Choose the details to keep'}
              {step === 3 && 'Confirm the merge'}
              {step === 4 && 'All done'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            aria-label="Close customer merge"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DED4] text-[#4E5871] hover:bg-[#F8F7F5] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          {mergeError && (
            <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {mergeError}
            </p>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#DDE4F2] bg-[#EEF2FF] p-4 text-sm text-[#33415F]">
                Search starts as you type. The customers can be duplicates, family members, or any two records you want to combine.
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <CustomerPicker
                  label="Customer 1 · default details"
                  customers={customers}
                  selected={primary}
                  excludedCustomerId={secondary?.id}
                  onSelect={setPrimary}
                />
                <CustomerPicker
                  label="Customer 2 · account to combine"
                  customers={customers}
                  selected={secondary}
                  excludedCustomerId={primary?.id}
                  onSelect={setSecondary}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={goToChoices}
                  disabled={!primary || !secondary}
                  className="h-12 rounded-xl bg-[#C46A3A] px-6 text-white hover:bg-[#A85A30]"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && primary && secondary && (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#D7E5D6] bg-[#EFF7ED] p-4 text-sm text-[#314B35]">
                Customer 1 is selected by default. Cats, bookings, payments, credits, messages, documents, and history from both customers are always combined.
              </div>
              <div className="overflow-hidden rounded-xl border border-[#E8DED4] bg-white">
                <div className="grid grid-cols-[7rem_1fr_1fr] border-b border-[#E8DED4] bg-[#F8F7F5] text-sm font-semibold text-[#0A1128] sm:grid-cols-[10rem_1fr_1fr]">
                  <div className="p-3">Field</div>
                  <div className="border-l border-[#E8DED4] p-3">Customer 1</div>
                  <div className="border-l border-[#E8DED4] p-3">Customer 2</div>
                </div>
                {customerFields.map(({ key, label }) => (
                  <div key={key} className="grid grid-cols-[7rem_1fr_1fr] border-b border-[#E8DED4] text-sm last:border-b-0 sm:grid-cols-[10rem_1fr_1fr]">
                    <div className="p-3 font-medium text-[#4E5871]">{label}</div>
                    {(['primary', 'secondary'] as const).map((source) => {
                      const customer = source === 'primary' ? primary : secondary;
                      const value = customer[key] || 'Not saved';
                      return (
                        <label key={source} className={`cursor-pointer border-l border-[#E8DED4] p-3 ${choices[key] === source ? 'bg-[#FFF8F2]' : 'bg-white'}`}>
                          <span className="flex items-start gap-2">
                            <input
                              type="radio"
                              name={`merge-${key}`}
                              checked={choices[key] === source}
                              onChange={() => setChoices((current) => ({ ...current, [key]: source }))}
                              className="mt-0.5 accent-[#C46A3A]"
                            />
                            <span className={`min-w-0 break-words ${customer[key] ? 'text-[#0A1128]' : 'italic text-[#9AA1B2]'}`}>{value}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>

              {(primary.user_id || secondary.user_id) && (
                <div className="rounded-xl border border-[#E8DED4] bg-white p-4">
                  <p className="font-semibold text-[#0A1128]">Customer portal login</p>
                  <p className="mt-1 text-sm text-[#4E5871]">Only one login can remain attached to the merged profile. The other login is not deleted.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {(['primary', 'secondary'] as const).map((source) => {
                      const customer = source === 'primary' ? primary : secondary;
                      const hasLogin = Boolean(customer.user_id);
                      return (
                        <label key={source} className={`rounded-lg border p-3 ${keepPortalFrom === source ? 'border-[#C46A3A] bg-[#FFF8F2]' : 'border-[#E8DED4]'} ${hasLogin ? 'cursor-pointer' : 'opacity-55'}`}>
                          <span className="flex items-start gap-2">
                            <input
                              type="radio"
                              name="merge-portal"
                              disabled={!hasLogin}
                              checked={keepPortalFrom === source}
                              onChange={() => setKeepPortalFrom(source)}
                              className="mt-0.5 accent-[#C46A3A]"
                            />
                            <span className="text-sm"><strong>{customer.name}</strong><br />{hasLogin ? customer.email : 'No portal login linked'}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button type="button" onClick={() => setStep(3)} className="h-12 rounded-xl bg-[#C46A3A] px-6 text-white hover:bg-[#A85A30]">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && primary && secondary && profile && (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="rounded-2xl border border-[#F0C9B2] bg-[#FFF8F2] p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#C46A3A]" />
                  <div>
                    <h4 className="font-semibold text-[#0A1128]">One final check</h4>
                    <p className="mt-1 text-sm text-[#4E5871]">
                      <strong>{secondary.name}</strong> will be combined into <strong>{primary.name}</strong>. The second profile will then be removed, but its original details remain in the private merge audit.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#E8DED4] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Merged customer</p>
                <h4 className="mt-1 text-xl font-semibold text-[#0A1128]">{profile.name}</h4>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div><dt className="text-[#768098]">Email</dt><dd className="break-all text-[#0A1128]">{profile.email}</dd></div>
                  <div><dt className="text-[#768098]">Phone</dt><dd className="text-[#0A1128]">{profile.phone || 'Not saved'}</dd></div>
                  <div><dt className="text-[#768098]">Address</dt><dd className="text-[#0A1128]">{profile.address || 'Not saved'}</dd></div>
                  <div><dt className="text-[#768098]">Cats combined</dt><dd className="text-[#0A1128]">{[...(primary.cats || []), ...(secondary.cats || [])].map((cat) => cat.name).join(', ') || 'No cats'}</dd></div>
                </dl>
              </div>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={merging} className="h-12 rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button type="button" onClick={confirmMerge} disabled={merging} className="h-12 rounded-xl bg-[#0A1128] px-6 text-white hover:bg-[#19233D]">
                  {merging ? 'Merging safely…' : 'Confirm and merge'}
                  {!merging && <GitMerge className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mx-auto max-w-xl py-8 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#DCEFD9] text-[#32633B]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h4 className="mt-5 text-3xl font-semibold text-[#0A1128]">Great, all done</h4>
              <p className="mt-2 text-[#4E5871]">The customer details and all related records are now together in one account.</p>
              <Button type="button" onClick={onClose} className="mt-6 h-12 rounded-xl bg-[#C46A3A] px-8 text-white hover:bg-[#A85A30]">
                Back to customers
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function StaffCustomerDirectory({
  customers,
  bookings,
  isLoading,
  createCustomer,
  addCat,
  mergeCustomers,
  refetchBookings,
}: StaffCustomerDirectoryProps) {
  const { cattery } = useAuth();
  const bookingSetup = normalizeBookingSetup(cattery?.website_settings);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showMergeCustomers, setShowMergeCustomers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', catName: '' });

  const rows = useMemo(() => customers
    .filter((customer) => customerMatchesDirectorySearch(customer, searchQuery))
    .map((customer) => ({
      customer,
      metrics: customerDirectoryMetrics(
        customer.id,
        bookings,
        customer.customer_credit_ledger || [],
        { chargeTax: bookingSetup.chargeTax, taxRate: bookingSetup.taxRate },
      ),
    })), [bookingSetup.chargeTax, bookingSetup.taxRate, bookings, customers, searchQuery]);

  const closeAddCustomer = () => {
    if (saving) return;
    setShowAddCustomer(false);
    setSaveError('');
  };

  const handleAddCustomer = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    const { data: customer, error } = await createCustomer({
      name: newCustomer.name.trim(),
      email: newCustomer.email.trim(),
      phone: newCustomer.phone.trim() || undefined,
    });
    if (error || !customer) {
      setSaveError(errorMessage(error, 'The customer could not be added.'));
      setSaving(false);
      return;
    }
    if (newCustomer.catName.trim()) {
      const { error: catError } = await addCat(customer.id, { name: newCustomer.catName.trim() });
      if (catError) {
        setSaveError(errorMessage(catError, 'The customer was added, but the cat could not be added.'));
        setSaving(false);
        return;
      }
    }
    setNewCustomer({ name: '', email: '', phone: '', catName: '' });
    setSaving(false);
    setShowAddCustomer(false);
  };

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden bg-gradient-to-br from-white via-white to-[#FFF3E8]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Customer directory</p>
            <h3 className="mt-1 text-2xl font-semibold text-[#0A1128]">Every customer, cat, stay, and balance</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#4E5871]">Search immediately by customer, ID, contact detail, or cat name.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" onClick={() => setShowAddCustomer(true)} className="h-11 rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">
              <Plus className="mr-2 h-4 w-4" /> Add customer
            </Button>
            <Link to="/staff-dashboard/smart-import">
              <Button type="button" variant="outline" className="h-11 w-full rounded-xl border-[#D8C8BA] bg-white">
                <FileUp className="mr-2 h-4 w-4" /> Import / export
              </Button>
            </Link>
            <Button type="button" variant="outline" onClick={() => setShowMergeCustomers(true)} disabled={customers.length < 2} className="h-11 rounded-xl border-[#0A1128] bg-[#0A1128] text-white hover:bg-[#19233D] hover:text-white">
              <GitMerge className="mr-2 h-4 w-4" /> Merge customers
            </Button>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 rounded-xl border border-[#E8DED4] bg-white px-4 py-3 shadow-sm focus-within:border-[#C46A3A]">
          <Search className="h-5 w-5 shrink-0 text-[#C46A3A]" />
          <span className="sr-only">Search customer directory</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search customer name, ID, email, phone, or cat…"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#0A1128] outline-none placeholder:text-[#768098]"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear customer search" className="text-[#768098] hover:text-[#0A1128]">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </Panel>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#0A1128]">{searchQuery.trim() ? `${rows.length} matching customers` : `${customers.length} customers`}</h3>
            <p className="text-sm text-[#4E5871]">Outstanding means unpaid booking money. Account balance shows available customer credit.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="rounded-xl bg-[#F8F7F5] p-5 text-sm text-[#4E5871]">Loading customers…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D8C8BA] bg-[#F8F7F5] px-5 py-12 text-center">
            <Users className="mx-auto h-9 w-9 text-[#C46A3A]" />
            <h4 className="mt-3 font-semibold text-[#0A1128]">{searchQuery.trim() ? 'No matching customers' : 'No customers yet'}</h4>
            <p className="mt-1 text-sm text-[#4E5871]">{searchQuery.trim() ? 'Try part of a name, customer ID, contact detail, or cat name.' : 'Add your first customer or import your existing customer list.'}</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 lg:hidden">
              {rows.map(({ customer, metrics }) => (
                <article key={customer.id} className="rounded-2xl border border-[#E8DED4] bg-[#F8F7F5] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[#0A1128]">{customer.name}</h4>
                      <p className="text-xs text-[#768098]">ID {customer.id.slice(0, 8)} · Joined {shortDate(customer.created_at)}</p>
                    </div>
                    {metrics.outstanding > 0 && <Badge className="shrink-0 bg-[#F9E1D1] text-[#8A4E2B] hover:bg-[#F9E1D1]">Owing {money(metrics.outstanding)}</Badge>}
                  </div>
                  <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div><p className="text-xs font-medium uppercase tracking-wide text-[#768098]">Contact</p><a href={`mailto:${customer.email}`} className="break-all text-[#0A1128] hover:text-[#C46A3A]">{customer.email}</a><br />{customer.phone ? <a href={`tel:${customer.phone}`} className="text-[#0A1128] hover:text-[#C46A3A]">{customer.phone}</a> : <span className="text-[#9AA1B2]">No phone</span>}</div>
                    <div><p className="text-xs font-medium uppercase tracking-wide text-[#768098]">Last booking</p>{metrics.lastBooking ? <Link to={`/staff-dashboard/bookings?booking=${metrics.lastBooking.id}`} className="text-[#0A1128] hover:text-[#C46A3A]">{shortDate(metrics.lastBooking.check_in)} · {metrics.lastBookingDays} {metrics.lastBookingDays === 1 ? 'day' : 'days'}</Link> : <span className="text-[#9AA1B2]">No bookings</span>}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {(customer.cats || []).map((cat) => <Badge key={cat.id} variant="outline" className="bg-white"><Cat className="mr-1 h-3 w-3" />{cat.name}</Badge>)}
                    {(customer.cats || []).length === 0 && <span className="text-xs text-[#9AA1B2]">No cats</span>}
                    <span className="ml-auto text-sm font-semibold text-[#32633B]">{metrics.creditBalance > 0 ? `${money(metrics.creditBalance)} credit` : 'No credit'}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[1100px] w-full border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase tracking-wide text-[#768098]">
                    {['Customer', 'Contact', 'Cats', 'Joined', 'Last booking', 'Outstanding', 'Account balance'].map((heading) => (
                      <th key={heading} className="border-b border-[#E8DED4] px-3 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ customer, metrics }) => (
                    <tr key={customer.id} className="group hover:bg-[#FFF8F2]">
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top"><p className="font-semibold text-[#0A1128]">{customer.name}</p><p className="mt-0.5 text-xs text-[#768098]">ID {customer.id.slice(0, 8)}</p></td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top"><a href={`mailto:${customer.email}`} className="block max-w-56 truncate text-[#0A1128] hover:text-[#C46A3A]">{customer.email}</a>{customer.phone ? <a href={`tel:${customer.phone}`} className="text-[#4E5871] hover:text-[#C46A3A]">{customer.phone}</a> : <span className="text-[#9AA1B2]">No phone</span>}</td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top"><div className="flex max-w-52 flex-wrap gap-1">{(customer.cats || []).map((cat) => <Badge key={cat.id} variant="outline" className="bg-white"><Cat className="mr-1 h-3 w-3" />{cat.name}</Badge>)}{(customer.cats || []).length === 0 && <span className="text-[#9AA1B2]">—</span>}</div></td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top whitespace-nowrap text-[#4E5871]">{shortDate(customer.created_at)}</td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top">{metrics.lastBooking ? <Link to={`/staff-dashboard/bookings?booking=${metrics.lastBooking.id}`} className="font-medium text-[#0A1128] hover:text-[#C46A3A]">{shortDate(metrics.lastBooking.check_in)}<span className="block text-xs font-normal text-[#768098]">{metrics.lastBookingDays} {metrics.lastBookingDays === 1 ? 'day' : 'days'}</span></Link> : <span className="text-[#9AA1B2]">No bookings</span>}</td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top font-semibold"><span className={metrics.outstanding > 0 ? 'text-[#A14F2A]' : 'text-[#4E5871]'}>{money(metrics.outstanding)}</span></td>
                      <td className="border-b border-[#EEE7DF] px-3 py-4 align-top font-semibold"><span className={metrics.creditBalance > 0 ? 'text-[#32633B]' : 'text-[#4E5871]'}>{money(metrics.creditBalance)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0A1128]/45 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAddCustomer(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="add-customer-title" className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h3 id="add-customer-title" className="text-2xl font-semibold text-[#0A1128]">Add customer</h3><p className="mt-1 text-sm text-[#4E5871]">Add their first cat now, or leave it blank until their booking.</p></div>
              <button type="button" onClick={closeAddCustomer} aria-label="Close add customer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E8DED4] text-[#4E5871] hover:bg-[#F8F7F5]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              {saveError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}
              {[
                { key: 'name', label: 'Name', type: 'text', required: true, autoComplete: 'name' },
                { key: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
                { key: 'phone', label: 'Mobile number (optional)', type: 'tel', required: false, autoComplete: 'tel' },
                { key: 'catName', label: "First cat's name (optional)", type: 'text', required: false, autoComplete: 'off' },
              ].map((field) => (
                <label key={field.key} className="block text-sm font-semibold text-[#0A1128]">
                  {field.label}
                  <input required={field.required} type={field.type} autoComplete={field.autoComplete} value={newCustomer[field.key as keyof typeof newCustomer]} onChange={(event) => setNewCustomer((current) => ({ ...current, [field.key]: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-[#E8DED4] bg-white px-3 py-3 font-normal outline-none focus:border-[#C46A3A]" />
                </label>
              ))}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={closeAddCustomer} disabled={saving} className="h-11 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={saving} className="h-11 rounded-xl bg-[#C46A3A] text-white hover:bg-[#A85A30]">{saving ? 'Adding customer…' : <><Check className="mr-2 h-4 w-4" />Add customer</>}</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showMergeCustomers && (
        <MergeCustomersModal
          customers={customers}
          mergeCustomers={mergeCustomers}
          refetchBookings={refetchBookings}
          onClose={() => setShowMergeCustomers(false)}
        />
      )}
    </div>
  );
}
