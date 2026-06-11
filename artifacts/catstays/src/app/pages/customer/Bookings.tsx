import { useNavigate } from 'react-router';
import { CustomerBookingsView } from './CustomerBookingsView';

export function CustomerBookings() {
  const navigate = useNavigate();

  return (
    <CustomerBookingsView
      onBack={() => navigate('/customer')}
      onCreateBooking={() => navigate('/site/booking-flow')}
      businessName="Deloraine Cattery"
      businessAddress="Deloraine, Tasmania"
      businessPhone="+61 3 6362 0000"
      businessEmail="hello@delorainecattery.com"
    />
  );
}
