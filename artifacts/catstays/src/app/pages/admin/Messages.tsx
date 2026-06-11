import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Mail, Menu, Plus } from 'lucide-react';

export function AdminMessages() {
  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
      <header className="bg-white border-b border-[#0A1128]/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Messages</h1>
          <Link to="/staff-dashboard"><Button variant="ghost" size="icon"><Menu /></Button></Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4">
        <div className="rounded-lg border border-[#E8DED4] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#C46A3A]/10">
            <Mail className="h-6 w-6 text-[#C46A3A]" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">No owner messages yet</h2>
          <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-[#4E5871]">
            Customer questions and stay replies will appear here once bookings start coming through your website.
          </p>
          <Button className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
            <Plus className="mr-2 h-4 w-4" />
            Draft message
          </Button>
        </div>
      </main>
    </div>
  );
}
