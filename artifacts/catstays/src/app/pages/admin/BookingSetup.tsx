import { useState } from 'react';
import { BookingRulesForm } from '../onboarding/BookingRulesForm';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router';

export function BookingSetup() {
  // Load saved booking rules from localStorage or use defaults
  const getSavedData = () => {
    const saved = localStorage.getItem('bookingRules');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      morningStart: '08:00',
      morningEnd: '12:00',
      afternoonStart: '14:00',
      afternoonEnd: '18:00',
      bookingInterval: '30',
      depositPercentage: '25',
      pricePerNight: '45',
      openByAppointmentOnly: false,
      roomTypes: [
        { name: 'Standard Suite', numberOfRooms: '10', maxCatsPerRoom: '1', sameFamilyOnly: false },
        { name: 'Family Suite', numberOfRooms: '5', maxCatsPerRoom: '3', sameFamilyOnly: true }
      ],
      pricingRates: [
        { numberOfCats: '2', price: '75', discountType: 'percentage', discountValue: '15' },
        { numberOfCats: '3', price: '100', discountType: 'percentage', discountValue: '20' }
      ],
      discounts: [
        { name: 'Extended Stay (7+ nights)', type: 'percentage', value: '10' },
        { name: 'Return Customer', type: 'percentage', value: '5' }
      ],
      blockOutDates: [
        { name: 'Christmas / New Years', startDate: '2024-12-20', endDate: '2025-01-10' }
      ],
      cancellationPolicy: 'Full refund if cancelled 7+ days before check-in. 50% refund if cancelled 3-6 days before. No refund if cancelled within 2 days of check-in.'
    };
  };

  const [data, setData] = useState(getSavedData());

  const handleSave = () => {
    localStorage.setItem('bookingRules', JSON.stringify(data));
    alert('Booking setup saved successfully!');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-[#F6F4EF] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" style={{ color: '#2d3e2f' }} />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Booking Setup
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Configure booking rules, pricing & availability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <RightMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <Card className="border-sage/20 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-white to-cream">
            <CardTitle className="text-2xl font-serif text-forest">
              Booking Rules & Pricing
            </CardTitle>
            <p className="text-sm text-forest/70">
              Configure check-in times, pricing, discounts, and availability
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <BookingRulesForm data={data} setData={setData} />

            <div className="mt-8 flex gap-3">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-[#7DAF7B] hover:bg-[#6a9e6a] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}