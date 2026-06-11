import { Link } from 'react-router';
import { CalendarDays, Cat, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useSubdomainCattery } from '@/contexts/SubdomainContext';

export function ClientPortalEntry() {
  const { cattery } = useSubdomainCattery();
  const businessName = cattery?.name || 'Deloraine Cattery';
  const bookingPath = cattery ? '/booking-flow' : '/site/booking-flow';
  const websitePath = cattery ? '/' : '/site';

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-[#0A1128]">
      <header className="border-b border-[#0A1128]/10 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[#C46A3A]">Client portal</p>
            <h1 className="text-xl font-semibold">{businessName}</h1>
          </div>
          <Link to={websitePath}>
            <Button variant="outline" className="rounded-lg border-[#0A1128]/15">
              Back to website
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-5xl place-items-center px-4 py-10">
        <Card className="w-full max-w-3xl rounded-lg border-[#E8DED4] shadow-sm">
          <CardContent className="p-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[#C46A3A]/10">
              <Lock className="h-7 w-7 text-[#C46A3A]" />
            </div>
            <div className="text-center">
              <h2 className="mb-3 text-2xl font-semibold">Your client portal</h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-[#4E5871]">
                Cat owners can manage bookings, cat profiles, invoices, and stay updates from {businessName}. Signed-in customers see their own private details only.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarDays, title: 'Bookings', text: 'Request, view, and manage stays.' },
                { icon: Cat, title: 'Cat profiles', text: 'Keep care notes and details together.' },
                { icon: Mail, title: 'Updates', text: 'Receive stay photos and messages.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg border border-[#E8DED4] bg-white p-4">
                    <Icon className="mb-3 h-5 w-5 text-[#C46A3A]" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[#4E5871]">{item.text}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={bookingPath}>
                <Button className="rounded-lg bg-[#C46A3A] text-white hover:bg-[#A85A30]">
                  Make a booking
                </Button>
              </Link>
              <Link to="/customer">
                <Button variant="outline" className="rounded-lg border-[#0A1128]/15">
                  Open demo portal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
