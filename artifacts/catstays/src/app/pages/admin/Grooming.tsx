import { useState } from 'react';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  ArrowLeft, 
  Plus, 
  Calendar,
  Clock,
  Scissors,
  User,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Crown,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { format, addDays, subDays } from 'date-fns';

export function Grooming() {
  const navigate = useNavigate();
  
  // Check subscription tier - normally this would come from a context or API
  // For demo purposes, we'll use localStorage
  const getSubscriptionTier = () => {
    const tier = localStorage.getItem('subscriptionTier');
    return tier || 'basic'; // 'basic', 'professional', 'premium'
  };

  const [subscriptionTier, setSubscriptionTier] = useState(getSubscriptionTier());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    petName: '',
    ownerName: '',
    service: 'Full Groom',
    time: '09:00',
    phone: '',
    email: '',
    notes: ''
  });
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      petName: 'Whiskers',
      ownerName: 'Sarah Johnson',
      service: 'Full Groom',
      time: '09:00',
      duration: 60,
      price: 65,
      status: 'confirmed',
      phone: '021 123 4567',
      email: 'sarah@example.com',
      notes: 'Needs gentle handling, sensitive around paws'
    },
    {
      id: 2,
      petName: 'Luna',
      ownerName: 'Mike Chen',
      service: 'Bath & Brush',
      time: '10:30',
      duration: 45,
      price: 45,
      status: 'confirmed',
      phone: '021 234 5678',
      email: 'mike@example.com',
      notes: ''
    },
    {
      id: 3,
      petName: 'Oliver',
      ownerName: 'Emma Wilson',
      service: 'Nail Trim',
      time: '14:00',
      duration: 15,
      price: 20,
      status: 'pending',
      phone: '021 345 6789',
      email: 'emma@example.com',
      notes: ''
    }
  ]);

  const groomingServices = [
    { name: 'Full Groom', duration: 60, price: 65 },
    { name: 'Bath & Brush', duration: 45, price: 45 },
    { name: 'Nail Trim', duration: 15, price: 20 },
    { name: 'Ear Cleaning', duration: 15, price: 15 },
    { name: 'De-matting', duration: 30, price: 40 }
  ];

  const handlePreviousDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  const handleUpgrade = () => {
    navigate('/subscription/upgrade');
  };

  const handleCreateAppointment = () => {
    const selectedService = groomingServices.find(s => s.name === newAppointment.service);
    if (!selectedService) return;

    const newId = Math.max(...appointments.map(a => a.id), 0) + 1;
    const newAppt = {
      id: newId,
      ...newAppointment,
      duration: selectedService.duration,
      price: selectedService.price,
      status: 'pending'
    };

    setAppointments([...appointments, newAppt]);
    setShowNewAppointment(false);
    setNewAppointment({
      petName: '',
      ownerName: '',
      service: 'Full Groom',
      time: '09:00',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleDeleteAppointment = (id: number) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const handleCompleteAppointment = (id: number) => {
    setAppointments(appointments.map(a => 
      a.id === id ? { ...a, status: 'completed' } : a
    ));
  };

  // If not on Professional or Premium tier, show upgrade screen
  if (subscriptionTier === 'basic') {
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
                  Grooming Module
                </h1>
                <p className="text-sm" style={{ color: '#6b7a6d' }}>
                  Manage grooming appointments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <RightMenu />
            </div>
          </div>
        </div>

        {/* Upgrade Screen */}
        <div className="max-w-2xl mx-auto p-4 md:p-6 min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Card className="border-2 border-[#C46A3A]/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C46A3A] to-[#C46A3A]/70 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-[#0A1128] mb-3">
                Unlock the Grooming Module
              </h2>
              
              <p className="text-lg text-[#0A1128]/70 mb-6">
                The Grooming Module is available on Professional and Premium plans
              </p>

              <div className="bg-[#F8F7F5] rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-[#0A1128] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                  Features included:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0A1128]/80">
                      Dedicated grooming appointment calendar
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0A1128]/80">
                      Customizable service types and pricing
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0A1128]/80">
                      Automated booking confirmations and reminders
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0A1128]/80">
                      Client notes and grooming history
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#7DAF7B] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[#0A1128]/80">
                      Revenue tracking separate from boarding
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleUpgrade}
                  className="flex-1 bg-[#C46A3A] hover:bg-[#A85A30] text-white"
                  size="lg"
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Professional
                </Button>
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Back to Dashboard
                </Button>
              </div>

              <p className="text-xs text-[#0A1128]/50 mt-6">
                Starting at $49/month • 14-day free trial available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main grooming interface for Professional/Premium tiers
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
                Grooming Appointments
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>
                Manage your grooming schedule
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
      <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
        {/* Date Navigation */}
        <Card className="mb-6 border-sage/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePreviousDay}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: '#7DAF7B' }} />
              </Button>
              
              <div className="text-center">
                <h2 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h2>
                <p className="text-sm" style={{ color: '#6b7a6d' }}>
                  {appointments.length} appointments scheduled
                </p>
              </div>

              <Button
                onClick={handleNextDay}
                variant="ghost"
                size="icon"
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" style={{ color: '#7DAF7B' }} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* New Appointment Button */}
        <Button
          onClick={() => setShowNewAppointment(true)}
          className="w-full mb-6 bg-[#7DAF7B] hover:bg-[#6a9e6a] text-white"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Grooming Appointment
        </Button>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="border-sage/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#7DAF7B]/10 flex items-center justify-center flex-shrink-0">
                      <Scissors className="w-6 h-6" style={{ color: '#7DAF7B' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[#2d3e2f]">
                        {appointment.petName}
                      </h3>
                      <p className="text-sm text-[#6b7a6d]">{appointment.ownerName}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      appointment.status === 'confirmed' 
                        ? 'bg-[#7DAF7B] hover:bg-[#7DAF7B]' 
                        : 'bg-[#C46A3A] hover:bg-[#C46A3A]'
                    }
                  >
                    {appointment.status}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[#6b7a6d]">
                    <Clock className="w-4 h-4" />
                    <span>{appointment.time} ({appointment.duration} mins)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6b7a6d]">
                    <Scissors className="w-4 h-4" />
                    <span>{appointment.service}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6b7a6d]">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6b7a6d]">
                    <DollarSign className="w-4 h-4" />
                    <span>${appointment.price}</span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="bg-[#F8F7F5] rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#2d3e2f]">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCompleteAppointment(appointment.id)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteAppointment(appointment.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {appointments.length === 0 && (
            <Card className="border-dashed border-2 border-sage/20">
              <CardContent className="p-12 text-center">
                <Scissors className="w-12 h-12 mx-auto mb-4 text-[#6b7a6d]/30" />
                <h3 className="text-lg font-semibold text-[#2d3e2f] mb-2">
                  No appointments scheduled
                </h3>
                <p className="text-sm text-[#6b7a6d] mb-4">
                  Create your first grooming appointment to get started
                </p>
                <Button
                  onClick={() => setShowNewAppointment(true)}
                  className="bg-[#7DAF7B] hover:bg-[#6a9e6a] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowNewAppointment(false)}
        >
          <Card 
            className="max-w-lg w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="bg-gradient-to-br from-white to-cream">
              <CardTitle className="text-xl font-serif text-forest">New Grooming Appointment</CardTitle>
              <p className="text-sm text-forest/70">Create a new grooming appointment</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-forest/70">Pet Name *</Label>
                  <Input
                    value={newAppointment.petName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, petName: e.target.value })}
                    placeholder="e.g., Whiskers"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-forest/70">Owner Name *</Label>
                  <Input
                    value={newAppointment.ownerName}
                    onChange={(e) => setNewAppointment({ ...newAppointment, ownerName: e.target.value })}
                    placeholder="e.g., Sarah Johnson"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-forest/70">Service *</Label>
                  <select
                    value={newAppointment.service}
                    onChange={(e) => setNewAppointment({ ...newAppointment, service: e.target.value })}
                    className="w-full mt-1 h-10 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage focus:border-transparent bg-white"
                  >
                    {groomingServices.map((service) => (
                      <option key={service.name} value={service.name}>
                        {service.name} - ${service.price} ({service.duration} mins)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-forest/70">Time *</Label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-forest/70">Phone *</Label>
                  <Input
                    type="tel"
                    value={newAppointment.phone}
                    onChange={(e) => setNewAppointment({ ...newAppointment, phone: e.target.value })}
                    placeholder="021 123 4567"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-forest/70">Email</Label>
                  <Input
                    type="email"
                    value={newAppointment.email}
                    onChange={(e) => setNewAppointment({ ...newAppointment, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-forest/70">Notes</Label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Any special requirements or notes..."
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sage focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateAppointment}
                  className="flex-1 bg-[#7DAF7B] hover:bg-[#6a9e6a] text-white"
                  disabled={!newAppointment.petName || !newAppointment.ownerName || !newAppointment.phone}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Appointment
                </Button>
                <Button
                  onClick={() => setShowNewAppointment(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}