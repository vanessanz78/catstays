import { useState } from 'react';
import { BookingBar, BookingSearchData } from './BookingBar';
import { AvailableRooms } from './AvailableRooms';
import { BookingFlowModal } from './BookingFlowModal';

interface BookingSystemWrapperProps {
  primaryColor?: string;
  accentColor?: string;
  isPreview?: boolean;
  style?: 'overlay' | 'below';
  children?: React.ReactNode;
}

type ViewState = 'search' | 'rooms' | 'booking';

interface Room {
  id: string;
  name: string;
  capacity: number;
  price: number;
  features: string[];
  image: string;
  available: boolean;
}

export function BookingSystemWrapper({
  primaryColor = '#0A1128',
  accentColor = '#C46A3A',
  isPreview = false,
  style = 'overlay',
  children
}: BookingSystemWrapperProps) {
  const [view, setView] = useState<ViewState>('search');
  const [searchData, setSearchData] = useState<BookingSearchData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleBookingSearch = (data: BookingSearchData) => {
    setSearchData(data);
    setView('rooms');
  };

  const handleBackToSearch = () => {
    setView('search');
    setSearchData(null);
  };

  const handleBookRoom = (room: any) => {
    setSelectedRoom(room);
    setView('booking');
  };

  const handleCloseBooking = () => {
    setView('search');
    setSelectedRoom(null);
    setSearchData(null);
  };

  const handleCompleteBooking = async (bookingData: any) => {
    console.log('Booking completed:', bookingData);
    
    // In production, this would send to backend
    if (!isPreview) {
      try {
        // TODO: Send to backend API
        // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(bookingData) });
      } catch (error) {
        console.error('Booking error:', error);
      }
    }
  };

  return (
    <>
      {/* Search View */}
      {view === 'search' && children}

      {/* Available Rooms View */}
      {view === 'rooms' && searchData && (
        <AvailableRooms
          checkIn={searchData.checkIn}
          checkOut={searchData.checkOut}
          numberOfCats={searchData.numberOfCats}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onBack={handleBackToSearch}
          onBookRoom={handleBookRoom}
        />
      )}

      {/* Booking Flow Modal */}
      {view === 'booking' && selectedRoom && searchData && (
        <BookingFlowModal
          room={selectedRoom}
          checkIn={searchData.checkIn}
          checkOut={searchData.checkOut}
          numberOfCats={searchData.numberOfCats}
          primaryColor={primaryColor}
          accentColor={accentColor}
          onClose={handleCloseBooking}
          onComplete={handleCompleteBooking}
        />
      )}

      {/* Show booking bar only in search view */}
      {view === 'search' && (
        <BookingBar
          primaryColor={primaryColor}
          accentColor={accentColor}
          isPreview={isPreview}
          onBookingSearch={handleBookingSearch}
          style={style}
        />
      )}
    </>
  );
}
