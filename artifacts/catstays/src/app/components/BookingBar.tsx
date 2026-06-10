import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Users, Loader2 } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

interface BookingBarProps {
  primaryColor?: string;
  accentColor?: string;
  isPreview?: boolean;
  onBookingSearch?: (data: BookingSearchData) => void;
  style?: 'overlay' | 'below';
}

export interface BookingSearchData {
  checkIn: string;
  checkOut: string;
  numberOfCats: number;
}

export function BookingBar({ 
  primaryColor = '#0A1128', 
  accentColor = '#C46A3A',
  isPreview = false,
  onBookingSearch,
  style = 'overlay'
}: BookingBarProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfCats, setNumberOfCats] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{checkIn?: string; checkOut?: string}>({});
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);

  // Close calendars when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (checkInRef.current && !checkInRef.current.contains(event.target as Node)) {
        setShowCheckInCalendar(false);
      }
      if (checkOutRef.current && !checkOutRef.current.contains(event.target as Node)) {
        setShowCheckOutCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateDates = () => {
    const newErrors: {checkIn?: string; checkOut?: string} = {};
    
    if (!checkIn) {
      newErrors.checkIn = 'Please select check-in date';
    }
    if (!checkOut) {
      newErrors.checkOut = 'Please select check-out date';
    }
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      newErrors.checkOut = 'Check-out must be after check-in';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckAvailability = async () => {
    if (!validateDates()) return;

    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));

    if (onBookingSearch) {
      onBookingSearch({ checkIn, checkOut, numberOfCats });
    }

    setIsLoading(false);
  };

  const isOverlay = style === 'overlay';

  return (
    <div 
      className={`
        ${isOverlay ? 'bg-white/95 backdrop-blur-sm shadow-2xl' : 'bg-white shadow-lg'} 
        rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-gray-100
        ${isOverlay ? 'mx-2 sm:mx-4 md:mx-8 -mt-12 sm:-mt-14 md:-mt-20 relative z-10' : ''}
        w-full max-w-full
      `}
    >
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:gap-3">
        {/* Check-in Date */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2" style={{ color: primaryColor }}>
            Check-in
          </label>
          <div className="relative" ref={checkInRef}>
            <Calendar 
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer z-10" 
              style={{ color: accentColor }}
              onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
            />
            <input
              type="text"
              value={checkIn ? format(new Date(checkIn), 'MMM dd, yyyy') : ''}
              readOnly
              onClick={() => setShowCheckInCalendar(!showCheckInCalendar)}
              className={`w-full pl-8 sm:pl-11 h-10 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer border border-gray-300 bg-white px-2 sm:px-3 text-sm ${errors.checkIn ? 'border-red-500' : ''}`}
              placeholder="Select date"
            />
            {showCheckInCalendar && (
              <div className="absolute left-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-xl border border-gray-200 p-3">
                <DayPicker
                  mode="single"
                  selected={checkIn ? new Date(checkIn) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setCheckIn(format(date, 'yyyy-MM-dd'));
                      setErrors({ ...errors, checkIn: undefined });
                      setShowCheckInCalendar(false);
                    }
                  }}
                  disabled={{ before: new Date() }}
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 1}
                  styles={{
                    day_selected: {
                      backgroundColor: accentColor,
                      color: 'white',
                    },
                  }}
                />
              </div>
            )}
          </div>
          {errors.checkIn && <p className="text-xs text-red-500 mt-1">{errors.checkIn}</p>}
        </div>

        {/* Check-out Date */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2" style={{ color: primaryColor }}>
            Check-out
          </label>
          <div className="relative" ref={checkOutRef}>
            <Calendar 
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 cursor-pointer z-10" 
              style={{ color: accentColor }}
              onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
            />
            <input
              type="text"
              value={checkOut ? format(new Date(checkOut), 'MMM dd, yyyy') : ''}
              readOnly
              onClick={() => setShowCheckOutCalendar(!showCheckOutCalendar)}
              className={`w-full pl-8 sm:pl-11 h-10 sm:h-12 rounded-lg sm:rounded-xl cursor-pointer border border-gray-300 bg-white px-2 sm:px-3 text-sm ${errors.checkOut ? 'border-red-500' : ''}`}
              placeholder="Select date"
            />
            {showCheckOutCalendar && (
              <div className="absolute left-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-xl border border-gray-200 p-3">
                <DayPicker
                  mode="single"
                  selected={checkOut ? new Date(checkOut) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setCheckOut(format(date, 'yyyy-MM-dd'));
                      setErrors({ ...errors, checkOut: undefined });
                      setShowCheckOutCalendar(false);
                    }
                  }}
                  disabled={{ before: checkIn ? new Date(checkIn) : new Date() }}
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 1}
                  styles={{
                    day_selected: {
                      backgroundColor: accentColor,
                      color: 'white',
                    },
                  }}
                />
              </div>
            )}
          </div>
          {errors.checkOut && <p className="text-xs text-red-500 mt-1">{errors.checkOut}</p>}
        </div>

        {/* Number of Cats */}
        <div className="flex-1 md:flex-initial md:w-40 min-w-0">
          <label className="block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2" style={{ color: primaryColor }}>
            Cats
          </label>
          <div className="relative">
            <Users className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
            <select
              value={numberOfCats}
              onChange={(e) => setNumberOfCats(Number(e.target.value))}
              className="w-full h-10 sm:h-12 pl-8 sm:pl-11 pr-3 sm:pr-4 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-offset-0 focus:border-transparent appearance-none bg-white cursor-pointer text-sm"
              style={{ 
                focusRing: `2px solid ${primaryColor}`,
              }}
            >
              <option value={1}>1 cat</option>
              <option value={2}>2 cats</option>
              <option value={3}>3 cats</option>
              <option value={4}>4+ cats</option>
            </select>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-end">
          <Button
            onClick={handleCheckAvailability}
            disabled={isLoading}
            className="w-full md:w-auto h-10 sm:h-12 px-4 sm:px-8 rounded-lg sm:rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base whitespace-nowrap"
            style={{ 
              backgroundColor: accentColor,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </Button>
        </div>
      </div>

      {/* Preview Mode Indicator */}
      {isPreview && (
        <div className="mt-2 sm:mt-3 text-xs text-gray-500 text-center md:text-left">
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live preview
          </span>
        </div>
      )}
    </div>
  );
}