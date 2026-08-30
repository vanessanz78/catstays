import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Send,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/hooks/useBookings';
import { useCustomers, type CustomerWithCats } from '@/hooks/useCustomers';
import { supabase } from '@/utils/supabase/client';
import { sendCustomerMessage } from '@/utils/email';
import { messageMatchesQuery, messagesForCustomer, quickCustomerMessage } from '@/app/lib/customerMessages';
import { NotificationBell } from '../../components/NotificationBell';
import { RightMenu } from '../../components/RightMenu';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

type CustomerMessage = {
  id: string;
  cattery_id: string;
  customer_id: string | null;
  booking_id: string | null;
  channel: 'email' | 'sms' | 'portal' | 'internal';
  direction: 'inbound' | 'outbound';
  subject: string | null;
  body: string;
  status: 'draft' | 'queued' | 'sent' | 'delivered' | 'failed' | 'read' | 'archived';
  sent_at: string | null;
  created_at: string;
};

const fieldClass = 'mt-1 w-full rounded-xl border border-[#D9D1C8] bg-white px-3 text-[#0A1128] outline-none focus:border-[#C46A3A] focus:ring-2 focus:ring-[#C46A3A]/15';

function displayDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function statusClass(status: CustomerMessage['status']) {
  if (status === 'sent' || status === 'delivered' || status === 'read') return 'bg-[#7DAF7B] text-white hover:bg-[#7DAF7B]';
  if (status === 'failed') return 'bg-red-600 text-white hover:bg-red-600';
  if (status === 'draft') return 'bg-[#768098] text-white hover:bg-[#768098]';
  return 'bg-[#C46A3A] text-white hover:bg-[#C46A3A]';
}

export function AdminMessages() {
  const [searchParams] = useSearchParams();
  const requestedCustomerId = searchParams.get('customer') || '';
  const { cattery, user } = useAuth();
  const { customers, loading: customersLoading } = useCustomers();
  const { bookings } = useBookings();
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState(requestedCustomerId);
  const [customerSearch, setCustomerSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [draftId, setDraftId] = useState('');
  const [busy, setBusy] = useState<'load' | 'draft' | 'send' | ''>('');
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const loadMessages = async () => {
    if (!cattery?.id) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    setBusy('load');
    setLoadingMessages(true);
    const { data, error } = await supabase
      .from('customer_messages')
      .select('id,cattery_id,customer_id,booking_id,channel,direction,subject,body,status,sent_at,created_at')
      .eq('cattery_id', cattery.id)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });
    if (error) setNotice({ tone: 'error', text: `Messages could not be loaded. ${error.message}` });
    else setMessages((data || []) as CustomerMessage[]);
    setLoadingMessages(false);
    setBusy('');
  };

  useEffect(() => { void loadMessages(); }, [cattery?.id]);

  useEffect(() => {
    if (requestedCustomerId && customers.some((customer) => customer.id === requestedCustomerId)) {
      setSelectedCustomerId(requestedCustomerId);
      return;
    }
    if (selectedCustomerId && customers.some((customer) => customer.id === selectedCustomerId)) return;
    const firstWithHistory = customers.find((customer) => messages.some((message) => message.customer_id === customer.id));
    setSelectedCustomerId(firstWithHistory?.id || customers[0]?.id || '');
  }, [customers, messages, requestedCustomerId, selectedCustomerId]);

  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) || null;
  const customerBookings = bookings.filter((booking) => booking.customer?.id === selectedCustomerId);
  const conversation = useMemo(
    () => messagesForCustomer(messages, selectedCustomerId).filter((message) => messageMatchesQuery(message, historySearch)),
    [historySearch, messages, selectedCustomerId],
  );
  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => [customer.name, customer.email, customer.phone || '', ...customer.cats.map((cat) => cat.name)]
      .some((value) => value.toLowerCase().includes(query)));
  }, [customerSearch, customers]);

  const selectCustomer = (customer: CustomerWithCats) => {
    setSelectedCustomerId(customer.id);
    setSubject('');
    setBody('');
    setBookingId('');
    setDraftId('');
    setNotice(null);
  };

  const saveDraft = async () => {
    if (!cattery?.id || !selectedCustomer || !user || !subject.trim() || !body.trim()) {
      setNotice({ tone: 'error', text: 'Choose a customer and add a subject and message before saving.' });
      return;
    }
    setBusy('draft');
    setNotice(null);
    const payload = {
      cattery_id: cattery.id,
      customer_id: selectedCustomer.id,
      booking_id: bookingId || null,
      channel: 'email',
      direction: 'outbound',
      subject: subject.trim(),
      body: body.trim(),
      status: 'draft',
      created_by: user.id,
    };
    const result = draftId
      ? await supabase.from('customer_messages').update(payload).eq('id', draftId).eq('cattery_id', cattery.id).select('id').single()
      : await supabase.from('customer_messages').insert(payload).select('id').single();
    if (result.error || !result.data) setNotice({ tone: 'error', text: `Draft could not be saved. ${result.error?.message || 'Try again.'}` });
    else {
      setDraftId(result.data.id);
      setNotice({ tone: 'success', text: `Draft saved for ${selectedCustomer.name}. Nothing has been sent.` });
      await loadMessages();
    }
    setBusy('');
  };

  const sendMessage = async () => {
    if (!cattery?.id || !selectedCustomer || !subject.trim() || !body.trim()) {
      setNotice({ tone: 'error', text: 'Choose a customer and add a subject and message before sending.' });
      return;
    }
    setBusy('send');
    setNotice(null);
    const result = await sendCustomerMessage({
      catteryId: cattery.id,
      customerId: selectedCustomer.id,
      bookingId: bookingId || undefined,
      draftId: draftId || undefined,
      subject: subject.trim(),
      body: body.trim(),
    });
    if (!result.success) setNotice({ tone: 'error', text: result.error || 'The email could not be sent.' });
    else {
      setNotice({ tone: 'success', text: `Email sent to ${selectedCustomer.email} and saved in this conversation.` });
      setSubject('');
      setBody('');
      setBookingId('');
      setDraftId('');
      await loadMessages();
    }
    setBusy('');
  };

  const continueDraft = (message: CustomerMessage) => {
    setSubject(message.subject || '');
    setBody(message.body);
    setBookingId(message.booking_id || '');
    setDraftId(message.id);
    setNotice({ tone: 'success', text: 'Draft reopened. Review it before sending.' });
  };

  const isLoading = customersLoading || loadingMessages;

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#C46A3A]">Customer communication</p>
              <h2 className="text-3xl font-semibold">Messages</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#4E5871]">Send real customer emails, keep drafts, and see the cattery conversation history in one place.</p>
            </div>
            <Button variant="outline" onClick={() => void loadMessages()} disabled={busy === 'load'}>
              <RefreshCw className={`mr-2 h-4 w-4 ${busy === 'load' ? 'animate-spin' : ''}`} />Refresh
            </Button>
          </div>

          {notice && (
            <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${notice.tone === 'success' ? 'border-[#7DAF7B] bg-[#EDF6EC] text-[#2D5830]' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {notice.tone === 'success' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
              <p>{notice.text}</p>
            </div>
          )}

          {isLoading ? (
            <Card><CardContent className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#C46A3A]" /></CardContent></Card>
          ) : customers.length === 0 ? (
            <Card><CardContent className="p-10 text-center"><UserRound className="mx-auto h-10 w-10 text-[#C46A3A]" /><h3 className="mt-4 text-xl font-semibold">Add a customer before sending a message</h3><p className="mt-2 text-sm text-[#4E5871]">Messages are always connected to a real customer record and email address.</p><Link to="/staff-dashboard/customers"><Button className="mt-5 bg-[#C46A3A] hover:bg-[#A85A30]">Open customers</Button></Link></CardContent></Card>
          ) : (
            <div className="grid min-w-0 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
              <Card className="min-w-0 overflow-hidden border-[#E8DED4] bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="border-b border-[#E8DED4] p-4">
                    <label className="text-sm font-semibold" htmlFor="message-customer-search">Customers</label>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768098]" />
                      <input id="message-customer-search" value={customerSearch} onChange={(event) => setCustomerSearch(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9D1C8] pl-9 pr-3 outline-none focus:border-[#C46A3A]" aria-label="Search customers" />
                    </div>
                  </div>
                  <div className="max-h-80 divide-y divide-[#E8DED4] overflow-y-auto xl:max-h-[calc(100vh-18rem)]">
                    {filteredCustomers.map((customer) => {
                      const latest = messages.find((message) => message.customer_id === customer.id);
                      return (
                        <button key={customer.id} type="button" onClick={() => selectCustomer(customer)} className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${customer.id === selectedCustomerId ? 'bg-[#F8F1EC]' : 'hover:bg-[#FBF9F5]'}`}>
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0A1128] text-xs font-semibold text-white">{initials(customer.name)}</span>
                          <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{customer.name}</span><span className="block truncate text-xs text-[#4E5871]">{latest?.subject || customer.email}</span></span>
                          {messages.some((message) => message.customer_id === customer.id && message.status === 'draft') && <Badge variant="outline">Draft</Badge>}
                        </button>
                      );
                    })}
                    {filteredCustomers.length === 0 && <p className="p-6 text-center text-sm text-[#4E5871]">No matching customer.</p>}
                  </div>
                </CardContent>
              </Card>

              {selectedCustomer && (
                <div className="min-w-0 space-y-5">
                  <Card className="border-[#E8DED4] bg-white shadow-sm">
                    <CardContent className="space-y-5 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 border-b border-[#E8DED4] pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0"><h3 className="truncate text-xl font-semibold">New message to {selectedCustomer.name}</h3><p className="mt-1 break-all text-sm text-[#4E5871]">{selectedCustomer.email}{selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : ''}</p></div>
                        {draftId && <Badge className="w-fit bg-[#768098] hover:bg-[#768098]">Editing saved draft</Badge>}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-semibold">Related booking
                          <select value={bookingId} onChange={(event) => setBookingId(event.target.value)} className={`${fieldClass} h-11`}>
                            <option value="">No booking selected</option>
                            {customerBookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.cat_names || 'Cat stay'} · {booking.check_in} to {booking.check_out}</option>)}
                          </select>
                        </label>
                        <label className="text-sm font-semibold">Email subject
                          <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={180} className={`${fieldClass} h-11`} />
                        </label>
                      </div>
                      <label className="block text-sm font-semibold">Message
                        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={8} maxLength={12000} className={`${fieldClass} min-h-44 py-3`} />
                      </label>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="outline" onClick={() => setBody(quickCustomerMessage(selectedCustomer.name, cattery?.name || 'Your cattery'))}>Quick reply</Button>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button variant="outline" onClick={() => void saveDraft()} disabled={Boolean(busy)}><Save className="mr-2 h-4 w-4" />{busy === 'draft' ? 'Saving…' : 'Save draft'}</Button>
                          <Button onClick={() => void sendMessage()} disabled={Boolean(busy)} className="bg-[#C46A3A] hover:bg-[#A85A30]"><Send className="mr-2 h-4 w-4" />{busy === 'send' ? 'Sending…' : 'Send email'}</Button>
                        </div>
                      </div>
                      <p className="text-xs leading-5 text-[#768098]">Sending is blocked unless the dashboard history row is saved first. Customer replies go to the cattery email address.</p>
                    </CardContent>
                  </Card>

                  <Card className="min-w-0 border-[#E8DED4] bg-white shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex flex-col gap-3 border-b border-[#E8DED4] p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div><h3 className="text-xl font-semibold">Conversation history</h3><p className="mt-1 text-sm text-[#4E5871]">Website enquiries, drafts, and emails for this customer.</p></div>
                        <div className="relative sm:w-64"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768098]" /><input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} className="h-10 w-full rounded-xl border border-[#D9D1C8] pl-9 pr-3 outline-none focus:border-[#C46A3A]" aria-label="Search conversation" /></div>
                      </div>
                      {conversation.length ? (
                        <div className="divide-y divide-[#E8DED4]">
                          {conversation.map((message) => (
                            <article key={message.id} className={`p-5 ${message.direction === 'inbound' ? 'bg-[#FBF9F5]' : 'bg-white'}`}>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{message.direction === 'inbound' ? selectedCustomer.name : cattery?.name}</span><Badge className={statusClass(message.status)}>{message.status}</Badge><Badge variant="outline">{message.channel}</Badge></div><h4 className="mt-2 break-words font-medium">{message.subject || 'No subject'}</h4></div>
                                <span className="shrink-0 text-xs text-[#768098]">{displayDate(message.sent_at || message.created_at)}</span>
                              </div>
                              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#4E5871]">{message.body}</p>
                              {(message.status === 'draft' || message.status === 'failed') && message.direction === 'outbound' && <Button variant="outline" size="sm" className="mt-4" onClick={() => continueDraft(message)}><FileText className="mr-2 h-4 w-4" />Continue {message.status}</Button>}
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="p-10 text-center"><MessageSquare className="mx-auto h-10 w-10 text-[#C46A3A]" /><h4 className="mt-4 font-semibold">No messages for this customer yet</h4><p className="mt-2 text-sm text-[#4E5871]">Write the first message above, or wait for a website enquiry.</p></div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          <div className="rounded-xl border border-[#E8DED4] bg-white p-5 text-sm leading-6 text-[#4E5871]"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#C46A3A]" /><p><strong className="text-[#0A1128]">Delivery:</strong> CatStays sends from its verified email service, uses the cattery email for replies, records delivery status, and alerts linked client accounts through their installed app.</p></div></div>
        </main>
      </div>
    </div>
  );
}
