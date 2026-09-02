import { useMemo, useRef, useState } from 'react';
import Papa from 'papaparse';
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers } from '@/hooks/useCustomers';
import { useRooms } from '@/hooks/useRooms';
import { supabase } from '@/utils/supabase/client';
import { fetchAllRows } from '@/app/lib/fetchAllRows';
import { RevelationSyncStatus } from '../../components/RevelationSyncStatus';
import {
  buildSmartImportPreview,
  type SmartImportKind,
  type SmartImportPreviewRow,
  type SmartImportSourceRow,
} from '@/app/lib/smartImport';

const IMPORT_TYPES: Array<{
  kind: SmartImportKind;
  label: string;
  description: string;
  template: string[];
}> = [
  {
    kind: 'customers',
    label: 'Customers',
    description: 'Names, emails, phone numbers, addresses, and notes.',
    template: ['customer_name,email,phone,address,notes'],
  },
  {
    kind: 'cats',
    label: 'Cats',
    description: 'Cat profiles matched to existing customers by owner email or exact name.',
    template: ['cat_name,owner_email,breed,age,medical_notes,dietary_requirements'],
  },
  {
    kind: 'rooms',
    label: 'Rooms',
    description: 'Room names, daily pricing, capacity, descriptions, and amenities.',
    template: ['room_name,room_type,description,price_per_day,capacity,amenities,is_active'],
  },
  {
    kind: 'bookings',
    label: 'Bookings',
    description: 'Bookings matched to existing customers and rooms before they are saved.',
    template: ['customer_email,room_name,check_in_date,check_out_date,check_in_time,check_out_time,cat_names,total_amount,booking_status,payment_status,notes'],
  },
];

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
function downloadCsv(fileName: string, rows: unknown[][]) {
  const body = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importLabel(kind: SmartImportKind | null) {
  return IMPORT_TYPES.find((item) => item.kind === kind)?.label || 'records';
}

export function SmartImport() {
  const { cattery } = useAuth();
  const { customers, refetch: refetchCustomers } = useCustomers();
  const { rooms, refetch: refetchRooms } = useRooms();
  const { bookings, refetch: refetchBookings } = useBookings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingKindRef = useRef<SmartImportKind>('customers');
  const [kind, setKind] = useState<SmartImportKind | null>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<SmartImportPreviewRow[]>([]);
  const [parseError, setParseError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<SmartImportKind | null>(null);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const context = useMemo(() => ({
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      external_source: customer.external_source,
      external_id: customer.external_id,
      cats: customer.cats.map((cat) => ({
        name: cat.name,
        external_source: cat.external_source,
        external_id: cat.external_id,
      })),
    })),
    rooms: rooms.map((room) => ({ id: room.id, name: room.name })),
    bookingKeys: bookings
      .filter((booking) => booking.customer?.id && booking.room?.id)
      .map((booking) => `${booking.customer!.id}|${booking.room!.id}|${booking.check_in}|${booking.check_out}`),
  }), [bookings, customers, rooms]);

  const readyRows = preview.filter((row) => !row.duplicate && row.errors.length === 0);
  const invalidRows = preview.filter((row) => row.errors.length > 0);
  const duplicateRows = preview.filter((row) => row.duplicate);
  const visiblePreview = preview.slice(0, 200);

  const chooseFile = (nextKind: SmartImportKind) => {
    pendingKindRef.current = nextKind;
    setKind(nextKind);
    setFileName('');
    setPreview([]);
    setParseError('');
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const parseFile = (file: File) => {
    const nextKind = pendingKindRef.current;
    setKind(nextKind);
    setFileName(file.name);
    setParseError('');
    setMessage(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setPreview([]);
      setParseError('Choose a CSV file. Excel and Google Sheets can both save or download as CSV.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPreview([]);
      setParseError('This file is larger than 10 MB. Split it into smaller CSV files and import them separately.');
      return;
    }

    Papa.parse<SmartImportSourceRow>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const parserErrors = results.errors.filter((error) => error.type !== 'FieldMismatch');
        if (!results.meta.fields?.length || results.data.length === 0) {
          setPreview([]);
          setParseError('No data rows were found. Use the template headings and add at least one row.');
          return;
        }
        if (parserErrors.length) {
          setPreview([]);
          setParseError(`The CSV could not be read: ${parserErrors[0].message}`);
          return;
        }
        setPreview(buildSmartImportPreview(nextKind, results.data, context));
      },
      error: (error) => {
        setPreview([]);
        setParseError(`The CSV could not be read: ${error.message}`);
      },
    });
  };

  const importReadyRows = async () => {
    if (!kind || !cattery?.id || readyRows.length === 0) return;
    setSaving(true);
    setMessage(null);
    const payloads = readyRows.map((row) => ({ ...row.payload, cattery_id: cattery.id }));
    const { error } = kind === 'customers'
      ? await supabase.rpc('catstays_import_customers', {
        target_cattery_id: cattery.id,
        records: payloads,
      })
      : await supabase.from(kind).insert(payloads);
    if (error) {
      setMessage({ kind: 'error', text: `Nothing was imported. ${error.message}` });
      setSaving(false);
      return;
    }

    if (kind === 'customers' || kind === 'cats') await refetchCustomers();
    if (kind === 'rooms') await refetchRooms();
    if (kind === 'bookings') await refetchBookings();
    setMessage({ kind: 'success', text: `${readyRows.length} ${importLabel(kind).toLowerCase()} imported into ${cattery.name}.` });
    setPreview([]);
    setFileName('');
    setSaving(false);
  };

  const downloadTemplate = (nextKind: SmartImportKind) => {
    const item = IMPORT_TYPES.find((entry) => entry.kind === nextKind)!;
    downloadCsv(`catstays-${nextKind}-template.csv`, item.template.map((line) => line.split(',')));
  };

  const exportData = async (nextKind: SmartImportKind) => {
    if (!cattery?.id) return;
    setExporting(nextKind);
    setMessage(null);
    const columns = nextKind === 'customers' ? 'name,email,phone,address,notes,created_at'
      : nextKind === 'cats' ? 'name,breed,age,medical_notes,dietary_requirements,customer:customers(name,email)'
      : nextKind === 'rooms' ? 'name,type,description,price_per_night,capacity,amenities,is_active'
      : 'check_in,check_out,check_in_time,check_out_time,status,payment_status,total_amount,cat_names,notes,customer:customers(name,email),room:rooms(name)';
    // These four allowlisted export shapes differ; avoid a combinatorial typed select union.
    const exportClient: any = supabase;
    const { data, error } = await fetchAllRows<Record<string, any>>((from,to) => exportClient.from(nextKind)
      .select(columns,{count:'exact'}).eq('cattery_id',cattery.id).order('id').range(from,to));
    if (error) {
      setMessage({ kind: 'error', text: `Export could not be created. ${error.message}` });
      setExporting(null);
      return;
    }

    const records = (data || []) as Array<Record<string, any>>;
    if (nextKind === 'customers') {
      downloadCsv('catstays-customers.csv', [
        ['customer_name', 'email', 'phone', 'address', 'notes', 'created_at'],
        ...records.map((row) => [row.name, row.email, row.phone, row.address, row.notes, row.created_at]),
      ]);
    } else if (nextKind === 'cats') {
      downloadCsv('catstays-cats.csv', [
        ['cat_name', 'owner_name', 'owner_email', 'breed', 'age', 'medical_notes', 'dietary_requirements'],
        ...records.map((row) => [row.name, row.customer?.name, row.customer?.email, row.breed, row.age, row.medical_notes, row.dietary_requirements]),
      ]);
    } else if (nextKind === 'rooms') {
      downloadCsv('catstays-rooms.csv', [
        ['room_name', 'room_type', 'description', 'price_per_day', 'capacity', 'amenities', 'is_active'],
        ...records.map((row) => [row.name, row.type, row.description, row.price_per_night, row.capacity, (row.amenities || []).join(' | '), row.is_active]),
      ]);
    } else {
      downloadCsv('catstays-bookings.csv', [
        ['customer_name', 'customer_email', 'room_name', 'check_in_date', 'check_out_date', 'check_in_time', 'check_out_time', 'cat_names', 'total_amount', 'booking_status', 'payment_status', 'notes'],
        ...records.map((row) => [row.customer?.name, row.customer?.email, row.room?.name, row.check_in, row.check_out, row.check_in_time, row.check_out_time, row.cat_names, row.total_amount, row.status, row.payment_status, row.notes]),
      ]);
    }
    setMessage({ kind: 'success', text: `${records.length} ${importLabel(nextKind).toLowerCase()} exported as CSV.` });
    setExporting(null);
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Data tools</p>
            <h2 className="text-3xl font-semibold">Smart Import</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">
              Move real customer, cat, room, and booking records into CatStays. Every CSV is checked and previewed before anything is saved.
            </p>
          </div>

          <RevelationSyncStatus catteryId={cattery?.id} />

          {message && (
            <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${message.kind === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {message.kind === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <p>{message.text}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {IMPORT_TYPES.map((item) => (
              <Card key={item.kind} className="border-[#E8DED4] bg-white shadow-sm">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#F6ECE6] text-[#C46A3A]"><FileSpreadsheet className="h-5 w-5" /></div>
                  <h3 className="text-lg font-semibold">{item.label}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[#4E5871]">{item.description}</p>
                  <div className="mt-5 grid gap-2">
                    <Button onClick={() => chooseFile(item.kind)} className="bg-[#C46A3A] hover:bg-[#A85A30]"><Upload className="mr-2 h-4 w-4" />Choose CSV</Button>
                    <Button variant="outline" onClick={() => downloadTemplate(item.kind)}>Download template</Button>
                    <Button variant="ghost" onClick={() => void exportData(item.kind)} disabled={exporting !== null}>
                      {exporting === item.kind ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Export current data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            aria-label="Choose CSV file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) parseFile(file);
            }}
          />

          {(fileName || parseError || preview.length > 0) && (
            <Card className="overflow-hidden border-[#E8DED4] bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-[#E8DED4] p-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">Review {importLabel(kind)}</h3>
                      {fileName && <Badge variant="outline" className="max-w-full truncate">{fileName}</Badge>}
                    </div>
                    <p className="mt-2 text-sm text-[#4E5871]">Duplicates are skipped. Rows with errors are never saved.</p>
                  </div>
                  {preview.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                      <Badge className="bg-[#7DAF7B] hover:bg-[#7DAF7B]">{readyRows.length} ready</Badge>
                      <Badge variant="outline">{duplicateRows.length} duplicates</Badge>
                      <Badge variant="destructive">{invalidRows.length} need fixing</Badge>
                    </div>
                  )}
                </div>

                {parseError && <div className="m-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-5 w-5 shrink-0" /><p>{parseError}</p></div>}

                {preview.length > 0 && (
                  <>
                    <div className="max-h-[36rem] divide-y divide-[#E8DED4] overflow-y-auto">
                      {visiblePreview.map((row) => (
                        <div key={row.rowNumber} className="grid gap-3 p-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-start sm:px-5">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[#768098]">Row {row.rowNumber}</span>
                          <div className="min-w-0">
                            <p className="break-words font-medium">{row.summary}</p>
                            {row.errors.map((error) => <p key={error} className="mt-1 text-sm text-red-700">{error}</p>)}
                            {row.warnings.map((warning) => <p key={warning} className="mt-1 text-sm text-amber-700">{warning}</p>)}
                          </div>
                          <Badge className={row.errors.length ? 'bg-red-600 hover:bg-red-600' : row.duplicate ? 'bg-[#768098] hover:bg-[#768098]' : 'bg-[#7DAF7B] hover:bg-[#7DAF7B]'}>
                            {row.errors.length ? 'Fix row' : row.duplicate ? 'Skip' : 'Ready'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {preview.length > visiblePreview.length && (
                      <p className="border-t border-[#E8DED4] bg-white px-5 py-3 text-sm text-[#4E5871]">
                        Showing the first {visiblePreview.length} of {preview.length} rows. Every row will still be checked and imported.
                      </p>
                    )}
                    <div className="flex flex-col gap-3 border-t border-[#E8DED4] bg-[#FBF9F5] p-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-[#4E5871]">Only the {readyRows.length} ready row{readyRows.length === 1 ? '' : 's'} will be added to {cattery?.name || 'this cattery'}.</p>
                      <Button onClick={() => void importReadyRows()} disabled={saving || readyRows.length === 0} className="bg-[#C46A3A] hover:bg-[#A85A30]">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import {readyRows.length} ready row{readyRows.length === 1 ? '' : 's'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          <div className="rounded-xl border border-[#E8DED4] bg-white p-5 text-sm leading-6 text-[#4E5871]">
            <p className="font-semibold text-[#0A1128]">Safe import workflow</p>
            <p className="mt-1">Download the template, keep its first-row headings, add your data, then save as CSV. CatStays checks the file in your browser and writes only approved rows through the signed-in cattery account and its database access rules.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
