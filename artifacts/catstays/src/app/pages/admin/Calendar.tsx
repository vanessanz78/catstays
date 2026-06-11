import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ChevronLeft, ChevronRight, ArrowLeft, Plus, Menu, X, Edit, Trash2, Calendar as CalendarIcon, User, MapPin, DollarSign } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

interface Booking {
  id: number;
  petName: string;
  ownerName: string;
  room: string;
  checkIn: Date;
  checkOut: Date;
  status: 'confirmed' | 'checked-in' | 'checked-out';
  amount: number;
  phone: string;
  notes?: string;
}

export function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showDayView, setShowDayView] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Enhanced sample bookings with full details
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      petName: 'Oliver',
      ownerName: 'Sarah Johnson',
      room: 'Deluxe Suite 1',
      checkIn: new Date(2026, 2, 10),
      checkOut: new Date(2026, 2, 18),
      status: 'confirmed',
      amount: 450,
      phone: '021 123 4567',
      notes: 'Needs medication twice daily'
    },
    {
      id: 2,
      petName: 'Felix',
      ownerName: 'Mike Chen',
      room: 'Standard Room 2',
      checkIn: new Date(2026, 2, 10),
      checkOut: new Date(2026, 2, 20),
      status: 'confirmed',
      amount: 380,
      phone: '021 234 5678'
    },
    {
      id: 3,
      petName: 'Simba',
      ownerName: 'Emma Wilson',
      room: 'Deluxe Suite 2',
      checkIn: new Date(2026, 2, 11),
      checkOut: new Date(2026, 2, 18),
      status: 'confirmed',
      amount: 420,
      phone: '021 345 6789',
      notes: 'Very friendly, loves treats'
    },
    {
      id: 4,
      petName: 'Coco',
      ownerName: 'James Brown',
      room: 'Standard Room 3',
      checkIn: new Date(2026, 2, 12),
      checkOut: new Date(2026, 2, 19),
      status: 'checked-in',
      amount: 350,
      phone: '021 456 7890'
    },
    {
      id: 5,
      petName: 'Bella',
      ownerName: 'Lisa Anderson',
      room: 'Deluxe Suite 3',
      checkIn: new Date(2026, 2, 13),
      checkOut: new Date(2026, 2, 20),
      status: 'checked-in',
      amount: 440,
      phone: '021 567 8901',
      notes: 'Shy at first, needs quiet space'
    },
    {
      id: 6,
      petName: 'Max',
      ownerName: 'David Kim',
      room: 'Standard Room 4',
      checkIn: new Date(2026, 2, 14),
      checkOut: new Date(2026, 2, 21),
      status: 'confirmed',
      amount: 360,
      phone: '021 678 9012'
    },
    {
      id: 7,
      petName: 'Smokey',
      ownerName: 'Rachel Green',
      room: 'Deluxe Suite 4',
      checkIn: new Date(2026, 2, 24),
      checkOut: new Date(2026, 2, 28),
      status: 'confirmed',
      amount: 280,
      phone: '021 789 0123'
    }
  ]);

  const getBookingType = (booking: Booking, date: Date): 'arrival' | 'departure' | 'staying' => {
    if (isSameDay(booking.checkIn, date)) return 'arrival';
    if (isSameDay(booking.checkOut, date)) return 'departure';
    return 'staying';
  };

  const getBookingsForDay = (date: Date) => {
    return bookings.filter(booking => {
      return date >= booking.checkIn && date <= booking.checkOut;
    });
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayView(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  const handleDeleteBooking = (id: number) => {
    setBookings(bookings.filter(b => b.id !== id));
    setShowBookingDetails(false);
    setShowDayView(false);
  };

  const handleStatusChange = (id: number, newStatus: 'confirmed' | 'checked-in' | 'checked-out') => {
    setBookings(bookings.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    ));
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#0A1128]">Calendar View</h1>
            <p className="text-xs text-gray-500">Booking overview</p>
          </div>
          <Link to="/staff-dashboard">
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <div className="font-semibold text-[#0A1128]">{format(currentMonth, 'MMMM yyyy')}</div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 pb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Calendar</CardTitle>
            <CardDescription>Click on any day to view bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day) => {
                const dayBookings = getBookingsForDay(day);
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-20 border rounded p-1 text-left transition-colors hover:bg-gray-50 ${
                      isToday(day) ? 'bg-blue-50 border-blue-500' : 'bg-white'
                    } ${selectedDate && isSameDay(day, selectedDate) ? 'ring-2 ring-[#C46A3A]' : ''}`}
                  >
                    <div className={`text-xs font-semibold ${isToday(day) ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayBookings.slice(0, 2).map((booking) => {
                        const type = getBookingType(booking, day);
                        return (
                          <div
                            key={booking.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${
                              type === 'arrival'
                                ? 'bg-green-100 text-green-700'
                                : type === 'departure'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {booking.petName}
                          </div>
                        );
                      })}
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500 px-1">
                          +{dayBookings.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded" />
                <span>Arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded" />
                <span>Departure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded" />
                <span>Staying</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex gap-2">
          <Link to="/staff-dashboard/room-planner" className="flex-1">
            <Button className="w-full h-9" variant="outline">
              Switch to Room Planner
            </Button>
          </Link>
        </div>
      </main>

      {/* Day View Dialog */}
      <Dialog open={showDayView} onOpenChange={setShowDayView}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0A1128]">
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && getBookingsForDay(selectedDate).length} booking(s) for this day
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedDate && getBookingsForDay(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No bookings for this day</p>
              </div>
            ) : (
              selectedDate && getBookingsForDay(selectedDate).map((booking) => {
                const type = getBookingType(booking, selectedDate);
                return (
                  <Card 
                    key={booking.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleBookingClick(booking)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-[#0A1128]">{booking.petName}</div>
                          <div className="text-sm text-gray-600">{booking.ownerName}</div>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            type === 'arrival' 
                              ? 'bg-green-100 text-green-700'
                              : type === 'departure'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        >
                          {type === 'arrival' ? '→ Check-in' : type === 'departure' ? '← Check-out' : 'Staying'}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.room}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{format(booking.checkIn, 'MMM d')} - {format(booking.checkOut, 'MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />
                          <span>${booking.amount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDayView(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Details Dialog */}
      <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#0A1128]">Booking Details</DialogTitle>
            <DialogDescription>
              View and manage this booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <Label>Status</Label>
                <Select 
                  value={selectedBooking.status} 
                  onValueChange={(value: any) => handleStatusChange(selectedBooking.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="checked-in">Checked In</SelectItem>
                    <SelectItem value="checked-out">Checked Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pet & Owner Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pet Name</Label>
                  <Input value={selectedBooking.petName} readOnly className="bg-gray-50" />
                </div>
                <div>
                  <Label>Owner</Label>
                  <Input value={selectedBooking.ownerName} readOnly className="bg-gray-50" />
                </div>
              </div>

              {/* Contact */}
              <div>
                <Label>Phone</Label>
                <Input value={selectedBooking.phone} readOnly className="bg-gray-50" />
              </div>

              {/* Room */}
              <div>
                <Label>Room</Label>
                <Input value={selectedBooking.room} readOnly className="bg-gray-50" />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Check-in</Label>
                  <Input 
                    value={format(selectedBooking.checkIn, 'MMM d, yyyy')} 
                    readOnly 
                    className="bg-gray-50" 
                  />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input 
                    value={format(selectedBooking.checkOut, 'MMM d, yyyy')} 
                    readOnly 
                    className="bg-gray-50" 
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <Label>Total Amount</Label>
                <Input value={`$${selectedBooking.amount}`} readOnly className="bg-gray-50" />
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div>
                  <Label>Notes</Label>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
                    {selectedBooking.notes}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="flex-1 h-9"
                  onClick={() => {
                    setShowBookingDetails(false);
                    // In a real app, this would navigate to edit page
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 h-9"
                  onClick={() => {
                    if (confirm(`Delete booking for ${selectedBooking.petName}?`)) {
                      handleDeleteBooking(selectedBooking.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
