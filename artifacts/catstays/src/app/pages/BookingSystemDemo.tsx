import { BookingSystem } from '../components/BookingSystem';

export default function BookingSystemDemo() {
  // Mock room data
  const mockRooms = [
    {
      id: 'standard',
      name: 'Standard Suite',
      price: 45,
      description: 'Comfortable accommodation with plenty of space',
      image: 'https://images.unsplash.com/photo-1606214174585-fe31582dc6ee?w=400&h=300&fit=crop',
      maxCats: 1
    },
    {
      id: 'deluxe',
      name: 'Deluxe Suite',
      price: 65,
      description: 'Premium suite with extra amenities and play areas',
      image: 'https://images.unsplash.com/photo-1571988840298-3b5301d5109b?w=400&h=300&fit=crop',
      maxCats: 2
    },
    {
      id: 'luxury',
      name: 'Luxury Villa',
      price: 95,
      description: 'Ultimate luxury with private outdoor access',
      image: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=400&h=300&fit=crop',
      maxCats: 3
    }
  ];

  return (
    <BookingSystem
      primaryColor="#0A1128"
      accentColor="#C46A3A"
      backgroundColor="#F8F7F5"
      businessName="Whiskers Retreat"
      rooms={mockRooms}
      isPreview={true}
    />
  );
}
