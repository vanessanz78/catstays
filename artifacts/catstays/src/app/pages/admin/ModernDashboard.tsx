import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Plus } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { RightMenu } from '../../components/RightMenu';
import { NotificationBell } from '../../components/NotificationBell';
import { OccupancySummary } from '../../components/OccupancySummary';

export function ModernDashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkedInIds, setCheckedInIds] = useState<number[]>([]);
  const [checkedOutIds, setCheckedOutIds] = useState<number[]>([]);

  // Sample data - Expanded for testing
  const arrivals = [
    {
      id: 1,
      catName: "Whiskers",
      ownerName: "Sarah Johnson",
      room: "3",
      time: "9:00am",
      paymentStatus: "paid"
    },
    {
      id: 2,
      catName: "Luna & Shadow",
      ownerName: "Mike Chen",
      room: "7",
      time: "9:30am",
      paymentStatus: "deposit"
    },
    {
      id: 3,
      catName: "Mittens",
      ownerName: "Emma Wilson",
      room: "12",
      time: "11:15am",
      paymentStatus: "unpaid"
    },
    {
      id: 6,
      catName: "Ginger",
      ownerName: "Patricia Davis",
      room: "15",
      time: "2:00pm",
      paymentStatus: "paid"
    },
    {
      id: 7,
      catName: "Smokey & Bandit",
      ownerName: "Robert Martinez",
      room: "10",
      time: "3:30pm",
      paymentStatus: "deposit"
    },
    {
      id: 8,
      catName: "Princess",
      ownerName: "Jennifer Lopez",
      room: "16",
      time: "4:30pm",
      paymentStatus: "paid"
    }
  ];

  const departures = [
    {
      id: 4,
      catName: "Tiger",
      ownerName: "John Smith",
      room: "5",
      time: "10:00am",
      paymentStatus: "paid"
    },
    {
      id: 5,
      catName: "Fluffy",
      ownerName: "Lisa Brown",
      room: "2",
      time: "2:30pm",
      paymentStatus: "balance"
    },
    {
      id: 9,
      catName: "Boots",
      ownerName: "Michael Thompson",
      room: "9",
      time: "4:00pm",
      paymentStatus: "paid"
    },
    {
      id: 10,
      catName: "Oreo",
      ownerName: "Amanda Clarke",
      room: "11",
      time: "5:00pm",
      paymentStatus: "paid"
    }
  ];

  const currentBoarders = [
    { catName: "Oliver", room: "1", owner: "James Taylor", checkIn: "Mar 10", checkOut: "Mar 18" },
    { catName: "Bella", room: "4", owner: "Anna Lee", checkIn: "Mar 13", checkOut: "Mar 20" },
    { catName: "Charlie", room: "6", owner: "Tom Davis", checkIn: "Mar 14", checkOut: "Mar 17" },
    { catName: "Coco & Milo", room: "8", owner: "Rachel Green", checkIn: "Mar 12", checkOut: "Mar 19" },
    { catName: "Simba", room: "13", owner: "David White", checkIn: "Mar 11", checkOut: "Mar 18" },
    { catName: "Nala", room: "14", owner: "Sophie Martin", checkIn: "Mar 15", checkOut: "Mar 22" },
    { catName: "Max", room: "17", owner: "Paul Wilson", checkIn: "Mar 14", checkOut: "Mar 21" },
    { catName: "Lucy", room: "1", owner: "Kate Brown", checkIn: "Mar 13", checkOut: "Mar 17" },
    { catName: "Felix", room: "3", owner: "George Harris", checkIn: "Mar 10", checkOut: "Mar 20" },
    { catName: "Misty", room: "7", owner: "Helen Clark", checkIn: "Mar 15", checkOut: "Mar 19" },
    { catName: "Pepper", room: "12", owner: "Chris Evans", checkIn: "Mar 14", checkOut: "Mar 18" },
    { catName: "Socks", room: "15", owner: "Diana Prince", checkIn: "Mar 12", checkOut: "Mar 17" },
  ];

  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handleCheckIn = (id: number) => {
    setCheckedInIds([...checkedInIds, id]);
  };

  const handleCheckOut = (id: number) => {
    setCheckedOutIds([...checkedOutIds, id]);
  };

  const isCheckedIn = (id: number) => checkedInIds.includes(id);
  const isCheckedOut = (id: number) => checkedOutIds.includes(id);

  const handleCardClick = (id: number, e: React.MouseEvent) => {
    // Only navigate if not clicking on a button
    const target = e.target as HTMLElement;
    if (target.tagName !== 'BUTTON' && !target.closest('button')) {
      navigate(`/admin/bookings?id=${id}`);
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-[#2A9D8F] hover:bg-[#2A9D8F] text-white text-xs">Paid</Badge>;
      case "deposit":
        return <Badge className="bg-[#E9C46A] hover:bg-[#E9C46A] text-[#2d3e2f] text-xs">Deposit</Badge>;
      case "balance":
        return <Badge className="bg-[#E9C46A] hover:bg-[#E9C46A] text-[#2d3e2f] text-xs">Balance Due</Badge>;
      case "unpaid":
        return <Badge className="bg-[#E63946] hover:bg-[#E63946] text-white text-xs">Unpaid</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F4EF' }}>
      {/* Warm Header - with safe area padding for phone notches */}
      <header className="bg-white shadow-sm sticky top-0 z-40" style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
        <div className="w-full px-5 py-5">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold" style={{ color: '#2d3e2f' }}>
                Today
              </h1>
              <p className="text-sm" style={{ color: '#6b7a6d' }}>Deloraine Cattery</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <RightMenu />
            </div>
          </div>
        </div>

        {/* Date Swiper */}
        <div className="border-t border-sage/10 py-3 px-5">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePreviousDay}
              className="rounded-full hover:bg-[#7DAF7B]/10"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#7DAF7B' }} />
            </Button>
            
            <div className="text-center">
              <div className="font-serif font-semibold text-lg" style={{ color: '#2d3e2f' }}>
                {format(selectedDate, 'EEEE')}
              </div>
              <div className="text-sm" style={{ color: '#6b7a6d' }}>
                {format(selectedDate, 'dd MMMM yyyy')}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNextDay}
              className="rounded-full hover:bg-[#7DAF7B]/10"
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#7DAF7B' }} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-5 py-6 space-y-6">
        {/* Arrivals Today */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-semibold flex items-center gap-2" style={{ color: '#2d3e2f' }}>
              <span className="text-2xl">🐾</span> Arrivals Today
            </h2>
            <Link to="/admin/bookings?new=true">
              <Button className="rounded-xl text-white shadow-md" style={{ backgroundColor: '#7DAF7B' }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Booking
              </Button>
            </Link>
          </div>
          
          {arrivals.length === 0 ? (
            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="py-8 text-center" style={{ color: '#6b7a6d' }}>
                <p>No arrivals scheduled today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {arrivals.map((arrival) => (
                <Card 
                  key={arrival.id} 
                  className="border-[#7DAF7B]/20 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
                  style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}
                  onClick={(e) => handleCardClick(arrival.id, e)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold" style={{ color: '#2d3e2f' }}>
                          {arrival.catName}
                        </h3>
                        <p className="text-sm" style={{ color: '#6b7a6d' }}>
                          {arrival.ownerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#7DAF7B' }}>
                          <Clock className="w-4 h-4" />
                          {arrival.time}
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#6b7a6d' }}>
                          Room {arrival.room}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-sage/10">
                      {getPaymentBadge(arrival.paymentStatus)}
                      <Button 
                        size="sm" 
                        className="bg-[#7DAF7B] hover:bg-[#7DAF7B]/90 text-white rounded-xl shadow-sm"
                        onClick={() => handleCheckIn(arrival.id)}
                        disabled={isCheckedIn(arrival.id)}
                      >
                        {isCheckedIn(arrival.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Checked In
                          </>
                        ) : (
                          "Check In"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Departures Today */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
            <span className="text-2xl">🐾</span> Departures Today
          </h2>
          
          {departures.length === 0 ? (
            <Card className="border-[#7DAF7B]/20 shadow-sm" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
              <CardContent className="py-8 text-center" style={{ color: '#6b7a6d' }}>
                <p>No departures scheduled today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {departures.map((departure) => (
                <Card 
                  key={departure.id} 
                  className="border-[#7DAF7B]/20 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
                  style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}
                  onClick={(e) => handleCardClick(departure.id, e)}
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold" style={{ color: '#2d3e2f' }}>
                          {departure.catName}
                        </h3>
                        <p className="text-sm" style={{ color: '#6b7a6d' }}>
                          {departure.ownerName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium" style={{ color: '#E9C46A' }}>
                          <Clock className="w-4 h-4" />
                          {departure.time}
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#6b7a6d' }}>
                          Room {departure.room}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-sage/10">
                      {getPaymentBadge(departure.paymentStatus)}
                      <Button 
                        size="sm" 
                        className="bg-[#E9C46A] hover:bg-[#E9C46A]/90 text-[#2d3e2f] rounded-xl shadow-sm"
                        onClick={() => handleCheckOut(departure.id)}
                        disabled={isCheckedOut(departure.id)}
                      >
                        {isCheckedOut(departure.id) ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Checked Out
                          </>
                        ) : (
                          "Check Out"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Currently Boarding */}
        <section>
          <h2 className="text-xl font-serif font-semibold mb-4 flex items-center gap-2" style={{ color: '#2d3e2f' }}>
            <span className="text-2xl">🐾</span> Currently Boarding
          </h2>
          
          <Card className="border-[#7DAF7B]/20 shadow-md" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: '#2d3e2f' }}>
                {currentBoarders.length} cats enjoying their stay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {currentBoarders.map((boarder, index) => (
                  <div 
                    key={index} 
                    className="border border-[#7DAF7B]/20 rounded-xl p-3 hover:bg-[#7DAF7B]/5 transition-colors"
                  >
                    <div className="font-semibold text-sm truncate" style={{ color: '#2d3e2f' }}>
                      {boarder.catName}
                    </div>
                    <div className="text-xs truncate mt-1" style={{ color: '#6b7a6d' }}>
                      {boarder.owner}
                    </div>
                    <div className="text-xs mt-2 font-medium" style={{ color: '#7DAF7B' }}>
                      Room {boarder.room}
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/admin/room-planner" className="block mt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-[#7DAF7B] text-[#7DAF7B] hover:bg-[#7DAF7B]/5 rounded-xl"
                >
                  View Room Planner
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Occupancy Summary */}
        <section>
          <OccupancySummary />
        </section>

        {/* Quick Actions */}
        <section className="pt-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <Link to="/admin/photo-updates" className="block">
              <Card className="border-[#D97B3C]/20 shadow-md hover:shadow-lg transition-all cursor-pointer" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm font-medium" style={{ color: '#2d3e2f' }}>Photo Updates</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/admin/cat-update-generator" className="block">
              <Card className="border-[#D97B3C]/20 shadow-md hover:shadow-lg transition-all cursor-pointer" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-sm font-medium" style={{ color: '#2d3e2f' }}>AI Updates</p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/admin/insights" className="block">
              <Card className="border-[#D97B3C]/20 shadow-md hover:shadow-lg transition-all cursor-pointer" style={{ borderRadius: '16px', backgroundColor: '#FFFFFF' }}>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium" style={{ color: '#2d3e2f' }}>Insights</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}