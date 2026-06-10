import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  XCircle,
  Shield,
  User,
  Calendar,
  DollarSign,
  Home,
  Cat,
  Loader2
} from 'lucide-react';

import { projectId, publicAnonKey } from '@/utils/supabase/info';

export function BookingConfirmationDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; isReturningClient?: boolean } | null>(null);
  const [selectedTab, setSelectedTab] = useState<'new' | 'returning'>('new');
  
  const [formData, setFormData] = useState({
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@example.com',
    catName: 'Mittens',
    checkIn: '2026-04-01',
    checkOut: '2026-04-07',
    roomType: 'Deluxe Suite',
    totalPrice: 420,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524/bookings/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          isReturningClient: data.isReturningClient,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send confirmation email',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadSampleData = (type: 'new' | 'returning') => {
    if (type === 'new') {
      setFormData({
        customerName: 'Emily Thompson',
        customerEmail: 'emily.thompson@example.com',
        catName: 'Luna',
        checkIn: '2026-04-15',
        checkOut: '2026-04-22',
        roomType: 'Premium Suite',
        totalPrice: 490,
      });
    } else {
      setFormData({
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@example.com',
        catName: 'Mittens',
        checkIn: '2026-05-01',
        checkOut: '2026-05-08',
        roomType: 'Deluxe Suite',
        totalPrice: 490,
      });
    }
    setSelectedTab(type);
  };

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-forest mb-2">
              Booking Confirmation Email System
            </h1>
            <p className="text-forest/60">
              Test the Petcover Insurance integration for Deloraine Cattery
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <Shield className="w-4 h-4 mr-2" />
            Petcover Integrated
          </Badge>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card className="border-sage/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-forest">
                <Mail className="w-5 h-5 text-sage" />
                Send Test Booking Confirmation
              </CardTitle>
              <CardDescription>
                Choose between new or returning client to see different Petcover messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'new' | 'returning')}>
                <TabsList className="w-full bg-cream mb-6">
                  <TabsTrigger value="new" className="flex-1" onClick={() => loadSampleData('new')}>
                    New Client
                  </TabsTrigger>
                  <TabsTrigger value="returning" className="flex-1" onClick={() => loadSampleData('returning')}>
                    Returning Client
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="flex items-center gap-2">
                      <User className="w-4 h-4 text-sage" />
                      Customer Name
                    </Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      required
                      className="bg-cream border-sage/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sage" />
                      Customer Email
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      required
                      className="bg-cream border-sage/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catName" className="flex items-center gap-2">
                      <Cat className="w-4 h-4 text-sage" />
                      Cat Name
                    </Label>
                    <Input
                      id="catName"
                      value={formData.catName}
                      onChange={(e) => handleInputChange('catName', e.target.value)}
                      required
                      className="bg-cream border-sage/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sage" />
                        Check-in
                      </Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkIn}
                        onChange={(e) => handleInputChange('checkIn', e.target.value)}
                        required
                        className="bg-cream border-sage/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOut}
                        onChange={(e) => handleInputChange('checkOut', e.target.value)}
                        required
                        className="bg-cream border-sage/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomType" className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-sage" />
                      Room Type
                    </Label>
                    <Input
                      id="roomType"
                      value={formData.roomType}
                      onChange={(e) => handleInputChange('roomType', e.target.value)}
                      required
                      className="bg-cream border-sage/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalPrice" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-sage" />
                      Total Price (NZD)
                    </Label>
                    <Input
                      id="totalPrice"
                      type="number"
                      step="0.01"
                      value={formData.totalPrice}
                      onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value))}
                      required
                      className="bg-cream border-sage/10"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-sage hover:bg-sage-dark text-white mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Confirmation Email
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>

              {/* Result */}
              {result && (
                <div className={`mt-6 p-4 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.success ? 'Email Sent Successfully!' : 'Email Failed'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.success && result.isReturningClient !== undefined && (
                        <Badge className={`mt-2 ${
                          result.isReturningClient 
                            ? 'bg-blue-100 text-blue-700 border-blue-200' 
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {result.isReturningClient ? 'Returning Client Message' : 'New Client Message'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card className="border-sage/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-forest">Email Features</CardTitle>
                <CardDescription>Petcover Insurance Integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest">Smart Client Detection</h4>
                    <p className="text-sm text-forest/60">
                      Automatically detects if customer is new or returning based on email history
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest">Personalized Messages</h4>
                    <p className="text-sm text-forest/60">
                      Different Petcover messages for new vs. returning clients
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-forest">Professional Design</h4>
                    <p className="text-sm text-forest/60">
                      Beautiful HTML email with CatStays brand colors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Petcover Benefits Included
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>4 weeks complimentary insurance</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Promo code: <strong>CATTERY4WK</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Activate day before, during, or after stay</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Direct link to Petcover portal</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-sage/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-forest">Message Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 mb-2">
                    New Client
                  </Badge>
                  <p className="text-sm text-forest/70">
                    Introduces Petcover insurance offer with full details about the 4-week complimentary policy
                  </p>
                </div>
                <div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-2">
                    Returning Client
                  </Badge>
                  <p className="text-sm text-forest/70">
                    Reminds about the Petcover benefit and mentions discounted plans for existing customers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}