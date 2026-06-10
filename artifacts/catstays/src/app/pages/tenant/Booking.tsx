import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function TenantBooking() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Book Your Cat's Stay</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Complete the form below to reserve</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arrival Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number of Cats</Label>
              <Input type="number" min="1" max="3" defaultValue="1" />
            </div>
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input placeholder="Sarah Johnson" />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input placeholder="021 123 4567" />
            </div>
            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <Link to="/site/booking-flow">
              <Button className="w-full" size="lg">Continue to Payment</Button>
            </Link>
          </CardContent>
        </Card>
        
        <div className="text-center mt-8">
          <Link to="/site" className="text-purple-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}