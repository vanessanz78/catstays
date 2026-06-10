import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Star, Check, ArrowLeft } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface Room {
  id: string;
  name: string;
  capacity: number;
  price: number;
  features: string[];
  image: string;
  available: boolean;
}

interface AvailableRoomsProps {
  checkIn: string;
  checkOut: string;
  numberOfCats: number;
  primaryColor?: string;
  accentColor?: string;
  onBack: () => void;
  onBookRoom: (room: Room) => void;
}

export function AvailableRooms({
  checkIn,
  checkOut,
  numberOfCats,
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  onBack,
  onBookRoom
}: AvailableRoomsProps) {
  const nights = differenceInDays(new Date(checkOut), new Date(checkIn));

  // Mock room data - in production this would come from backend
  const allRooms: Room[] = [
    {
      id: '1',
      name: 'Standard Suite',
      capacity: 1,
      price: 35,
      features: ['Cozy space', 'Daily play session', 'Photo updates', 'Climate controlled'],
      image: 'https://images.unsplash.com/photo-1672764788664-9f5844477a0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      available: true
    },
    {
      id: '2',
      name: 'Premium Suite',
      capacity: 2,
      price: 55,
      features: ['Spacious room', 'Extra playtime', 'Video calls', 'Premium bedding', 'Window view'],
      image: 'https://images.unsplash.com/photo-1662118821764-68db771a95ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      available: true
    },
    {
      id: '3',
      name: 'Luxury Villa',
      capacity: 3,
      price: 85,
      features: ['Private villa', 'Garden access', 'Premium treats', '24/7 monitoring', 'Comfort checks'],
      image: 'https://images.unsplash.com/photo-1574114908319-2efa632834d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      available: true
    },
    {
      id: '4',
      name: 'VIP Penthouse',
      capacity: 4,
      price: 120,
      features: ['Ultimate luxury', 'Private outdoor area', 'Gourmet meals', 'Concierge service', 'Daily photo updates'],
      image: 'https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
      available: true
    }
  ];

  // Filter rooms based on capacity
  const availableRooms = allRooms.filter(room => room.capacity >= numberOfCats && room.available);

  const calculateTotal = (roomPrice: number) => {
    const subtotal = roomPrice * nights;
    const tax = subtotal * 0.15; // 15% GST
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      perNight: roomPrice
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            Available Rooms
          </h1>
          <p className="text-gray-600">
            {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' → '}
            {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' • '}
            {nights} night{nights !== 1 ? 's' : ''}
            {' • '}
            {numberOfCats} cat{numberOfCats !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-sm font-medium text-gray-700">
            {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Room Cards */}
        {availableRooms.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {availableRooms.map((room) => {
              const pricing = calculateTotal(room.price);
              const isPopular = room.id === '2';

              return (
                <Card key={room.id} className="overflow-hidden hover:shadow-xl transition-shadow relative">
                  {isPopular && (
                    <div
                      className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-semibold text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      Most Popular
                    </div>
                  )}

                  {/* Room Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-1" style={{ color: primaryColor }}>
                          {room.name}
                        </CardTitle>
                        <CardDescription>
                          Sleeps up to {room.capacity} cat{room.capacity !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: accentColor }}>
                          ${pricing.total.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">total</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      {room.features.map((feature, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-700">
                          <Check className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: accentColor }} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>${pricing.perNight}/night × {nights} nights</span>
                        <span>${pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (15%)</span>
                        <span>${pricing.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t" style={{ color: primaryColor }}>
                        <span>Total</span>
                        <span>${pricing.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <Button
                      onClick={() => onBookRoom(room)}
                      className="w-full h-12 rounded-xl font-semibold text-white"
                      style={{ backgroundColor: isPopular ? accentColor : primaryColor }}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">
                No rooms available for {numberOfCats} cat{numberOfCats !== 1 ? 's' : ''} on these dates.
              </p>
              <Button onClick={onBack} variant="outline">
                Try Different Dates
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
