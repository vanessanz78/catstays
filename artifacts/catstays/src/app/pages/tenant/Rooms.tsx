import { Link, useParams } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Home, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { useTenantCattery } from '@/hooks/useTenantCattery';

export function TenantRooms() {
  const { tenantId } = useParams();
  const { cattery, rooms, loading } = useTenantCattery(tenantId);
  const base = tenantId ? `/tenant/${tenantId}` : '/site';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-sage/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={base} className="flex items-center gap-2 text-forest/70 hover:text-forest transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-serif font-semibold">{cattery?.name || 'Cattery'}</span>
          </Link>
          <Link to={`${base}/booking-flow`}>
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-semibold text-forest mb-4">Rooms & Accommodations</h1>
          <p className="text-xl text-forest/70">Comfortable, safe spaces designed with your cat's wellbeing in mind</p>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-sage" />
            </div>
            <p className="text-forest/60 text-lg">No rooms listed yet. Please check back soon.</p>
            <Link to={base} className="text-sage hover:underline mt-4 inline-block">← Back to home</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, i) => {
              const colors = [
                { bg: 'from-sage-light/30 to-sage/20', accent: 'text-sage' },
                { bg: 'from-rose-light/30 to-rose/20', accent: 'text-rose' },
                { bg: 'from-cream-dark to-cream', accent: 'text-sage-dark' },
              ];
              const c = colors[i % colors.length];
              return (
                <Card key={room.id} className="border-sage/10 shadow-lg rounded-3xl hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                  <div className={`h-48 bg-gradient-to-br ${c.bg} flex items-center justify-center relative`}>
                    <Home className={`w-16 h-16 ${c.accent}`} />
                    {room.type && (
                      <Badge className="absolute top-4 right-4 bg-white/80 text-forest border-sage/20 capitalize">
                        {room.type}
                      </Badge>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl font-serif text-forest">{room.name}</CardTitle>
                    {room.description && <p className="text-forest/60 text-sm mt-1">{room.description}</p>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${c.accent}`}>${room.price_per_night}</span>
                      <span className="text-sm text-forest/60">per night</span>
                    </div>
                    <div className="text-sm text-forest/60">
                      Up to {room.capacity} cat{room.capacity > 1 ? 's' : ''}
                    </div>
                    {room.amenities?.length > 0 && (
                      <ul className="space-y-1">
                        {room.amenities.map(a => (
                          <li key={a} className="flex items-center gap-2 text-sm text-forest/70">
                            <Check className="w-4 h-4 text-sage flex-shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link to={`${base}/booking-flow`}>
                      <Button className="w-full mt-2 bg-sage hover:bg-sage-dark text-white rounded-xl">
                        Book This Room
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-20 bg-white rounded-3xl p-8 shadow-md border border-sage/10">
          <h2 className="text-3xl font-serif font-semibold text-forest mb-8 text-center">Included with Every Room</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Daily photo updates sent to you',
              'Premium cat food & fresh water',
              'Individual playtime & cuddles',
              'Medication administration if needed',
              'Clean bedding changed daily',
              'Safe & secure environment',
              'Staff on-site at all times',
              'Flexible drop-off & pick-up',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
                <span className="text-sm text-forest/70">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link to={`${base}/booking-flow`}>
            <Button className="bg-sage hover:bg-sage-dark text-white rounded-xl px-10 py-4 text-lg">
              <Calendar className="w-5 h-5 mr-2" />
              Request a Booking
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
