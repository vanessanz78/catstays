// v2.4: Color scheme updated to match brand palette
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../components/ui/sheet';
import { RoomPlannerTimeline } from './RoomPlannerTimeline';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Plus,
  Calendar as CalendarIcon,
  List,
  Users,
  Settings,
  Home,
  Menu,
  X,
  BarChart3,
  TrendingUp,
  DollarSign,
  LayoutGrid,
  BookOpen,
  CreditCard,
  MessageSquare,
  Megaphone,
  Share2,
  Camera,
  Upload,
  Search,
  Filter,
  FileSpreadsheet,
  Wand2,
  Send,
  Bell,
  Zap,
  Tag,
  Percent,
  Globe,
  Mail,
  Phone,
  MapPin,
  Eye,
  Download,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Receipt,
  FileText,
  Edit,
  ChevronUp,
  Trash2,
  UserPlus,
  Copy,
  Instagram,
  Facebook,
  Twitter,
  Sparkles,
  Image as ImageIcon,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  ThumbsUp,
  Heart,
  MessageCircle,
  ToggleLeft,
  ToggleRight,
  Palette,
  Type,
  Lock,
  User,
  Scissors,
  Crown,
  Brush,
  Droplet,
  Save
} from 'lucide-react';
import { format, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { NotificationBell } from '../../components/NotificationBell';
import { Input } from '../../components/ui/input';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

type Page = 'home' | 'overview' | 'calendar' | 'room-planner' | 'bookings' | 'customers' | 'smart-import' | 'accounting' | 'financials' | 'templates' | 'promotions' | 'social' | 'cat-updates' | 'insights' | 'settings' | 'grooming' | 'payment' | 'website-editor' | 'booking-setup' | 'marketing' | 'subscription';

interface DashboardPreviewMockProps {
  businessName?: string;
}

// Dashboard Preview Mock Component - Self-contained preview for onboarding
export function DashboardPreviewMock({ businessName = 'Purrfect Haven' }: DashboardPreviewMockProps) {
  // All hooks must be at the top level - React Rules of Hooks
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [checkedInIds, setCheckedInIds] = useState<number[]>([]);
  const [checkedOutIds, setCheckedOutIds] = useState<number[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // February 2026 to show bookings
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  
  // Page-specific state (must be declared unconditionally to follow Rules of Hooks)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [showTestTemplate, setShowTestTemplate] = useState(false);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [templateContent, setTemplateContent] = useState('');
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    type: 'Email' as 'Email' | 'SMS',
    trigger: '',
    content: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [activePromos, setActivePromos] = useState<number[]>([1, 2]);
  const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
  const [showPromotionDrawer, setShowPromotionDrawer] = useState(false);
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [promotionForm, setPromotionForm] = useState({
    name: '',
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    expiryDate: '',
    maxUses: ''
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'facebook']);
  const [sentUpdates, setSentUpdates] = useState<number[]>([]);
  const [showAIPostGenerator, setShowAIPostGenerator] = useState(false);
  const [showPostSchedule, setShowPostSchedule] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [showPostDrawer, setShowPostDrawer] = useState(false);
  const [aiPostContent, setAiPostContent] = useState('');
  const [postScheduleDate, setPostScheduleDate] = useState('');
  const [postScheduleTime, setPostScheduleTime] = useState('');
  const [selectedPostPlatforms, setSelectedPostPlatforms] = useState<string[]>([]);
  const [showUploadPhotos, setShowUploadPhotos] = useState(false);
  const [selectedCatForUpdate, setSelectedCatForUpdate] = useState<any | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [showBrandColors, setShowBrandColors] = useState(false);
  const [showTypography, setShowTypography] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showWebsiteEditor, setShowWebsiteEditor] = useState(false);
  const [showMarketingKit, setShowMarketingKit] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [businessInfo, setBusinessInfo] = useState({
    name: businessName,
    email: 'contact@catstays.com',
    phone: '+1 (555) 123-4567',
    address: '123 Cat Street, Meowtown'
  });
  const [bookingSettings, setBookingSettings] = useState({
    minStay: '1',
    advanceBooking: '30',
    checkIn: '14:00',
    checkOut: '11:00'
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookings: true,
    emailPayments: true,
    emailMessages: true,
    smsBookings: false,
    smsPayments: true
  });
  const [drawerHeight, setDrawerHeight] = useState(75);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(75);
  const [editMode, setEditMode] = useState(false);
  const [editedBooking, setEditedBooking] = useState<any>(null);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amountPaid: '',
    paymentMethod: '',
    paymentNotes: ''
  });
  const [showNewBookingDrawer, setShowNewBookingDrawer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    catNames: '',
    notes: ''
  });
  const [showImportDrawer, setShowImportDrawer] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  
  // New Booking Form State
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    selectedPets: [] as string[],
    checkInDate: '',
    checkOutDate: '',
    dropOffTime: '09:00',
    pickUpTime: '16:00',
    roomAssignments: {} as Record<string, string>, // petName -> roomNumber
    additionalServices: [] as string[],
    discountCode: '',
    comments: '',
    miscChargeDescription: '',
    miscChargeAmount: '',
    miscChargeType: 'fixed' as 'fixed' | 'percentage'
  });
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showDateRangeCalendar, setShowDateRangeCalendar] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [showRoomPlanner, setShowRoomPlanner] = useState(false);
  const [roomPlannerPet, setRoomPlannerPet] = useState<string | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | null>(null);
  const [calendarSelectedBooking, setCalendarSelectedBooking] = useState<any | null>(null);
  const [bookingsTab, setBookingsTab] = useState<'latest' | 'all'>('latest');
  const [bookingsSortBy, setBookingsSortBy] = useState<'arrival' | 'departure' | 'received'>('received');
  const [bookingsSortDirection, setBookingsSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Mock customer database - in state so changes persist
  const [mockCustomers, setMockCustomers] = useState([
    { name: 'Sarah Johnson', email: 'sarah@email.com', phone: '021 123 4567', pets: ['Whiskers', 'Mittens'] },
    { name: 'Mike Chen', email: 'mike@email.com', phone: '021 234 5678', pets: ['Luna', 'Shadow'] },
    { name: 'Emma Wilson', email: 'emma@email.com', phone: '021 345 6789', pets: ['Oliver'] },
    { name: 'James Brown', email: 'james@email.com', phone: '021 456 7890', pets: ['Bella'] },
    { name: 'Lisa Anderson', email: 'lisa@email.com', phone: '021 567 8901', pets: ['Simba'] }
  ]);

  // REMOVED: Scroll lock was causing issues in preview mode
  // When inside FullWebsitePreview, we don't want to manipulate document.body
  // The preview has its own scroll isolation via data-preview-mode
  // This prevents the scroll-to-top bug when clicking buttons inside the preview

  // Handle drag events for booking detail modal
  useEffect(() => {
    if (isDragging) {
      const handleDragMove = (e: MouseEvent | TouchEvent) => {
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const windowHeight = window.innerHeight;
        const dragDelta = dragStartY - clientY;
        const heightDelta = (dragDelta / windowHeight) * 100;
        const newHeight = Math.min(95, Math.max(25, dragStartHeight + heightDelta));
        setDrawerHeight(newHeight);
      };

      const handleDragEnd = () => {
        setIsDragging(false);
        // Snap to closest position
        if (drawerHeight < 40) {
          setSelectedBooking(null);
          setEditedBooking(null);
        } else if (drawerHeight < 60) {
          setDrawerHeight(50);
        } else if (drawerHeight < 85) {
          setDrawerHeight(75);
        } else {
          setDrawerHeight(95);
        }
      };
      
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, dragStartY, dragStartHeight, drawerHeight]);

  // Generate dynamic arrivals and departures based on selected date
  const getBookingsForDate = (date: Date) => {
    const dayOfMonth = date.getDate();
    const dateKey = dayOfMonth % 7; // Create variation based on day
    
    const allArrivals = [
      [
        { id: 1, catName: "Whiskers", ownerName: "Sarah Johnson", room: "3", time: "9:00am", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 5), 'MMM d'), phone: "021 123 4567", email: "sarah@email.com", specialNeeds: "Needs medication twice daily", diet: "Grain-free only" },
        { id: 2, catName: "Luna & Shadow", ownerName: "Mike Chen", room: "7", time: "9:30am", paymentStatus: "deposit", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 6), 'MMM d'), phone: "021 234 5678", email: "mike@email.com", specialNeeds: "Keep together in same room", diet: "Standard" },
        { id: 3, catName: "Mittens", ownerName: "Emma Wilson", room: "12", time: "11:15am", paymentStatus: "unpaid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 4), 'MMM d'), phone: "021 345 6789", email: "emma@email.com", specialNeeds: "Shy, needs quiet space", diet: "Wet food preferred" },
      ],
      [
        { id: 4, catName: "Oliver", ownerName: "James Brown", room: "5", time: "10:00am", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 4), 'MMM d'), phone: "021 456 7890", email: "james@email.com", specialNeeds: "None", diet: "Standard" },
        { id: 5, catName: "Bella", ownerName: "Lisa Anderson", room: "9", time: "2:30pm", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 7), 'MMM d'), phone: "021 567 8901", email: "lisa@email.com", specialNeeds: "Senior cat, gentle handling", diet: "Senior formula" },
      ],
      [
        { id: 6, catName: "Simba", ownerName: "Tom Davis", room: "8", time: "8:30am", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 3), 'MMM d'), phone: "021 678 9012", email: "tom@email.com", specialNeeds: "Very energetic, needs playtime", diet: "High protein" },
        { id: 7, catName: "Cleo", ownerName: "Anna White", room: "4", time: "1:00pm", paymentStatus: "deposit", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 5), 'MMM d'), phone: "021 789 0123", email: "anna@email.com", specialNeeds: "Allergic to fish", diet: "Chicken only" },
      ],
      [
        { id: 8, catName: "Felix", ownerName: "Mark Lee", room: "15", time: "10:30am", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 6), 'MMM d'), phone: "021 890 1234", email: "mark@email.com", specialNeeds: "Indoor only, scared of outdoors", diet: "Standard" },
      ],
      [
        { id: 9, catName: "Charlie", ownerName: "Sophie Martin", room: "2", time: "9:15am", paymentStatus: "unpaid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 4), 'MMM d'), phone: "021 901 2345", email: "sophie@email.com", specialNeeds: "Doesn't like other cats", diet: "Raw food diet" },
        { id: 10, catName: "Milo", ownerName: "David Clark", room: "11", time: "3:00pm", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 8), 'MMM d'), phone: "021 012 3456", email: "david@email.com", specialNeeds: "Loves attention", diet: "Mix of wet and dry" },
      ],
      [
        { id: 11, catName: "Nala", ownerName: "Rachel Green", room: "6", time: "11:00am", paymentStatus: "deposit", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 5), 'MMM d'), phone: "021 123 5678", email: "rachel@email.com", specialNeeds: "Pregnant, due in 2 weeks", diet: "Kitten formula" },
      ],
      [
        { id: 12, catName: "Oscar", ownerName: "Ben Taylor", room: "14", time: "2:00pm", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 3), 'MMM d'), phone: "021 234 6789", email: "ben@email.com", specialNeeds: "Diabetic, insulin required", diet: "Special diabetic food" },
        { id: 13, catName: "Smokey", ownerName: "Jennifer Moore", room: "10", time: "8:00am", paymentStatus: "paid", checkIn: format(date, 'MMM d'), checkOut: format(addDays(date, 6), 'MMM d'), phone: "021 345 7890", email: "jennifer@email.com", specialNeeds: "Very vocal, normal behavior", diet: "Standard" },
      ],
    ];

    const allDepartures = [
      [
        { id: 14, catName: "Oliver", ownerName: "James Brown", room: "5", time: "10:00am", paymentStatus: "paid", checkIn: format(subDays(date, 4), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 456 7890", email: "james@email.com", specialNeeds: "None", diet: "Standard" },
        { id: 15, catName: "Bella", ownerName: "Lisa Anderson", room: "9", time: "2:30pm", paymentStatus: "paid", checkIn: format(subDays(date, 7), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 567 8901", email: "lisa@email.com", specialNeeds: "Senior cat", diet: "Senior formula" },
      ],
      [
        { id: 16, catName: "Max", ownerName: "Chris Evans", room: "3", time: "9:00am", paymentStatus: "deposit", checkIn: format(subDays(date, 5), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 456 8901", email: "chris@email.com", specialNeeds: "None", diet: "Standard" },
      ],
      [
        { id: 17, catName: "Lucy", ownerName: "Emma Stone", room: "7", time: "11:30am", paymentStatus: "paid", checkIn: format(subDays(date, 3), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 567 9012", email: "emma.s@email.com", specialNeeds: "Loves treats", diet: "Premium brand" },
        { id: 18, catName: "Tiger", ownerName: "Robert King", room: "12", time: "4:00pm", paymentStatus: "paid", checkIn: format(subDays(date, 6), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 678 0123", email: "robert@email.com", specialNeeds: "Large cat, needs space", diet: "High protein" },
      ],
      [
        { id: 19, catName: "Princess", ownerName: "Victoria Hall", room: "8", time: "10:30am", paymentStatus: "unpaid", checkIn: format(subDays(date, 4), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 789 1234", email: "victoria@email.com", specialNeeds: "Picky eater", diet: "Gourmet wet food" },
      ],
      [
        { id: 20, catName: "Duke", ownerName: "Michael Scott", room: "4", time: "1:00pm", paymentStatus: "paid", checkIn: format(subDays(date, 8), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 890 2345", email: "michael@email.com", specialNeeds: "Playful, needs toys", diet: "Standard" },
      ],
      [
        { id: 21, catName: "Snowball", ownerName: "Lisa Simpson", room: "2", time: "3:30pm", paymentStatus: "paid", checkIn: format(subDays(date, 5), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 901 3456", email: "lisa.s@email.com", specialNeeds: "White coat, indoor only", diet: "Sensitive stomach formula" },
        { id: 22, catName: "Garfield", ownerName: "Jon Arbuckle", room: "11", time: "9:30am", paymentStatus: "deposit", checkIn: format(subDays(date, 7), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 012 4567", email: "jon@email.com", specialNeeds: "Loves lasagna (no really)", diet: "Weight management" },
      ],
      [
        { id: 23, catName: "Socks", ownerName: "Bill Clinton", room: "6", time: "2:00pm", paymentStatus: "paid", checkIn: format(subDays(date, 3), 'MMM d'), checkOut: format(date, 'MMM d'), phone: "021 123 6789", email: "bill@email.com", specialNeeds: "Friendly with everyone", diet: "Standard" },
      ],
    ];

    return {
      arrivals: allArrivals[dateKey] || allArrivals[0],
      departures: allDepartures[dateKey] || allDepartures[0],
    };
  };

  const { arrivals, departures } = getBookingsForDate(selectedDate);

  const recentBookings = [
    { id: 6, catName: "Simba", ownerName: "Tom Davis", checkIn: "Mar 20", checkOut: "Mar 25", room: "8", status: "confirmed" },
    { id: 7, catName: "Cleo", ownerName: "Anna White", checkIn: "Mar 22", checkOut: "Mar 28", room: "4", status: "pending" },
    { id: 8, catName: "Felix", ownerName: "Mark Lee", checkIn: "Mar 24", checkOut: "Mar 30", room: "15", status: "confirmed" },
  ];

  const handleCheckIn = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCheckedInIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCheckOut = (id: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCheckedOutIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handlePreviousDay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedDate(subDays(selectedDate, 1));
  };
  const handleNextDay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedDate(addDays(selectedDate, 1));
  };
  
  const handleViewBooking = (booking: any, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedBooking(booking);
    setEditedBooking({ ...booking });
    setDrawerHeight(75);
    setEditMode(false);
  };

  const menuItems = [
    { id: 'home', icon: Home, label: 'Today', description: 'Check-ins & departures' },
    { id: 'overview', icon: BarChart3, label: 'Overview', description: 'Metrics & activity' },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar', description: 'Month view' },
    { id: 'room-planner', icon: LayoutGrid, label: 'Room Planner', description: 'Visual room grid' },
    { id: 'bookings', icon: BookOpen, label: 'Bookings', description: 'All reservations' },
    { id: 'customers', icon: Users, label: 'Customers', description: 'Contact details' },
    { id: 'grooming', icon: Scissors, label: 'Grooming', description: 'Grooming appointments', badge: 'PRO' },
    { id: 'smart-import', icon: Upload, label: 'Smart Import', description: 'Import your data', badge: 'AI' },
    { id: 'accounting', icon: CreditCard, label: 'Accounting', description: 'Payments & invoices' },
    { id: 'financials', icon: DollarSign, label: 'Financials', description: 'Revenue & expenses' },
    { id: 'payment', icon: CreditCard, label: 'Payment Setup', description: 'Stripe integration' },
    { id: 'templates', icon: FileText, label: 'Templates', description: 'Email & SMS automation' },
    { id: 'promotions', icon: Megaphone, label: 'Promotions', description: 'Special offers' },
    { id: 'social', icon: Share2, label: 'Social Media', description: 'Post generator' },
    { id: 'cat-updates', icon: Camera, label: 'Cat Updates', description: 'Photo updates' },
    { id: 'website-editor', icon: Globe, label: 'Website', description: 'Edit your website' },
    { id: 'booking-setup', icon: Settings, label: 'Booking Setup', description: 'Rules & pricing' },
    { id: 'marketing', icon: Download, label: 'Marketing Kit', description: 'Download materials' },
    { id: 'insights', icon: BarChart3, label: 'Insights', description: 'Analytics & reports' },
    { id: 'subscription', icon: Crown, label: 'Subscription', description: 'Manage your plan' },
    { id: 'settings', icon: Settings, label: 'Settings', description: 'Configure platform' },
  ];

  const handleMenuItemClick = (item: any, e?: React.MouseEvent) => {
    // Prevent any scroll-to-top behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setCurrentPage(item.id as Page);
    setMenuOpen(false);
  };

  // Header Component (used on all pages)
  const Header = () => (
    <div className="bg-white border-b border-[#0A1128]/10 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(true);
            }} 
            className="p-2 hover:bg-[#0A1128]/5 rounded-lg"
          >
            <Menu className="w-5 h-5 text-[#0A1128]" />
          </button>
          <div>
            
            <div className="font-semibold text-[#0A1128]">{businessName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mr-2">
          <NotificationBell />
        </div>
      </div>
    </div>
  );

  // Menu Overlay
  const MenuOverlay = () => (
    <>
      {menuOpen && (
        <div 
          className="absolute inset-0 bg-black/20 z-40 overflow-hidden"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(false);
          }}
          onTouchMove={(e) => e.preventDefault()}
          onWheel={(e) => e.preventDefault()}
        />
      )}
      <div
        className={`absolute top-0 left-0 bottom-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px', maxWidth: '75%' }}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-[#0A1128] p-4 border-b border-white/10 z-10">
          <h2 className="text-xl font-serif font-semibold text-white">
            Dashboard
          </h2>
          <p className="text-sm text-white/70">{businessName}</p>
        </div>

        {/* Scrollable Menu Content */}
        <nav className="overflow-y-auto overflow-x-hidden overscroll-contain" style={{ height: 'calc(100% - 80px)' }}>
          <div className="p-2 pb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => handleMenuItemClick(item, e)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl mb-1 transition-all ${
                    isActive
                      ? 'bg-[#C46A3A] text-white'
                      : 'text-[#0A1128] hover:bg-[#0A1128]/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-white/20' : 'bg-[#0A1128]/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#C46A3A]'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-semibold ${isActive ? 'text-white' : 'text-[#0A1128]'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-[#0A1128]/60'}`}>
                      {item.description}
                    </div>
                    {item.badge && (
                      <Badge className="ml-2" variant="secondary">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );

  // Booking Detail Drawer
  const BookingDetailModal = () => {
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
      setIsDragging(true);
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragStartY(clientY);
      setDragStartHeight(drawerHeight);
    };

    const handleSave = () => {
      setSelectedBooking(editedBooking);
      setEditMode(false);
    };

    const handleFieldChange = (field: string, value: string) => {
      setEditedBooking(prev => ({ ...prev, [field]: value }));
    };

    if (!selectedBooking || !editedBooking) return null;

    return (
      <>
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-[9998]"
          onClick={() => {
            setSelectedBooking(null);
            setEditedBooking(null);
            setDrawerHeight(75);
            setEditMode(false);
          }}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
          style={{ 
            height: `${drawerHeight}vh`,
            maxHeight: '85vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag Handle */}
          <div 
            className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4 cursor-grab active:cursor-grabbing select-none z-10 rounded-t-[24px]"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                {editMode ? 'Edit Booking' : 'Booking Details'}
              </h2>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBooking(null);
                  setEditedBooking(null);
                  setDrawerHeight(75);
                  setEditMode(false);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
              >
                <X className="w-5 h-5 text-[#0A1128]" />
              </button>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto px-5 pb-6"
            style={{ 
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain'
            }}
            onClick={(e) => {
              // Close date pickers when clicking outside them
              const target = e.target as HTMLElement;
              if (!target.closest('.relative')) {
                setShowCheckInPicker(false);
                setShowCheckOutPicker(false);
              }
            }}
          >
            {/* Cat & Owner Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C46A3A]" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-[#0A1128]/60 mb-1">Cat Name</div>
                  {editMode ? (
                    <Input
                      value={editedBooking.catName}
                      onChange={(e) => handleFieldChange('catName', e.target.value)}
                      className="font-semibold"
                    />
                  ) : (
                    <div className="font-semibold text-[#0A1128] text-lg">{editedBooking.catName}</div>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="text-sm text-[#0A1128]/60 mb-1">Owner</div>
                  {editMode ? (
                    <Input
                      value={editedBooking.ownerName}
                      onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                      className="font-semibold"
                    />
                  ) : (
                    <div className="font-semibold text-[#0A1128]">{editedBooking.ownerName}</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">Phone</div>
                    {editMode ? (
                      <Input
                        value={editedBooking.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                      />
                    ) : (
                      <a href={`tel:${editedBooking.phone}`} className="text-[#C46A3A] hover:underline flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {editedBooking.phone}
                      </a>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">Email</div>
                    {editMode ? (
                      <Input
                        value={editedBooking.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        type="email"
                      />
                    ) : (
                      <a href={`mailto:${editedBooking.email}`} className="text-[#C46A3A] hover:underline flex items-center gap-1 text-sm">
                        <Mail className="w-3.5 h-3.5" />
                        {editedBooking.email.split('@')[0]}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stay Details */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#C46A3A]" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">Check-in</div>
                    {editMode ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowCheckInPicker(!showCheckInPicker);
                            setShowCheckOutPicker(false);
                          }}
                          className="w-full px-3 py-2 text-left border border-[#0A1128]/20 rounded-md hover:border-[#C46A3A] transition-colors mb-1 font-semibold text-[#0A1128]"
                        >
                          {editedBooking.checkIn}
                        </button>
                        {showCheckInPicker && (
                          <div 
                            className="absolute z-[10000] mt-1 bg-white rounded-lg shadow-xl border border-[#0A1128]/10 p-2 left-0 right-0"
                            style={{ maxWidth: '280px' }}
                          >
                            <DayPicker
                              mode="single"
                              selected={new Date()}
                              onSelect={(date) => {
                                if (date) {
                                  handleFieldChange('checkIn', format(date, 'MMM d'));
                                  setShowCheckInPicker(false);
                                }
                              }}
                              disabled={{ before: new Date() }}
                              className="text-sm"
                              styles={{
                                months: { fontSize: '0.875rem' },
                                caption: { fontSize: '0.875rem' },
                                day: { fontSize: '0.75rem' },
                              }}
                            />
                          </div>
                        )}
                        <Input
                          value={editedBooking.time}
                          onChange={(e) => handleFieldChange('time', e.target.value)}
                          placeholder="e.g. 9:15am"
                          className="text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-[#0A1128]">{editedBooking.checkIn}</div>
                        <div className="text-sm text-[#0A1128]/60">{editedBooking.time}</div>
                      </>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">Check-out</div>
                    {editMode ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowCheckOutPicker(!showCheckOutPicker);
                            setShowCheckInPicker(false);
                          }}
                          className="w-full px-3 py-2 text-left border border-[#0A1128]/20 rounded-md hover:border-[#C46A3A] transition-colors font-semibold text-[#0A1128]"
                        >
                          {editedBooking.checkOut}
                        </button>
                        {showCheckOutPicker && (
                          <div 
                            className="absolute z-[10000] mt-1 bg-white rounded-lg shadow-xl border border-[#0A1128]/10 p-2 left-0 right-0"
                            style={{ maxWidth: '280px' }}
                          >
                            <DayPicker
                              mode="single"
                              selected={new Date()}
                              onSelect={(date) => {
                                if (date) {
                                  handleFieldChange('checkOut', format(date, 'MMM d'));
                                  setShowCheckOutPicker(false);
                                }
                              }}
                              disabled={{ before: new Date() }}
                              className="text-sm"
                              styles={{
                                months: { fontSize: '0.875rem' },
                                caption: { fontSize: '0.875rem' },
                                day: { fontSize: '0.75rem' },
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-semibold text-[#0A1128]">{editedBooking.checkOut}</div>
                    )}
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="text-sm text-[#0A1128]/60 mb-1">Room Number</div>
                  {editMode ? (
                    <Input
                      value={editedBooking.room}
                      onChange={(e) => handleFieldChange('room', e.target.value)}
                    />
                  ) : (
                    <div className="font-semibold text-[#0A1128]">Room {editedBooking.room}</div>
                  )}
                </div>
                
                {/* Payment Information */}
                <div className="border-t pt-3 space-y-3">
                  <div>
                    <div className="text-sm text-[#0A1128]/60 mb-1">Payment Status</div>
                    {editMode ? (
                      <select
                        value={editedBooking.paymentStatus}
                        onChange={(e) => {
                          handleFieldChange('paymentStatus', e.target.value);
                          if (e.target.value === 'unpaid') {
                            setPaymentDetails({ amountPaid: '', paymentMethod: '', paymentNotes: '' });
                          }
                        }}
                        className="w-full px-3 py-2 border border-[#0A1128]/20 rounded-md"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="deposit">Deposit</option>
                        <option value="paid">Paid</option>
                      </select>
                    ) : (
                      <Badge variant={editedBooking.paymentStatus === 'paid' ? 'default' : editedBooking.paymentStatus === 'deposit' ? 'secondary' : 'destructive'}>
                        {editedBooking.paymentStatus}
                      </Badge>
                    )}
                  </div>

                  {/* Show payment details fields when Deposit or Paid is selected in edit mode */}
                  {editMode && (editedBooking.paymentStatus === 'deposit' || editedBooking.paymentStatus === 'paid') && (
                    <div className="space-y-3 p-3 bg-[#F8F7F5] rounded-lg">
                      <div>
                        <div className="text-sm text-[#0A1128]/60 mb-1">Amount Paid</div>
                        <Input
                          type="text"
                          value={paymentDetails.amountPaid}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, amountPaid: e.target.value }))}
                          placeholder="$0.00"
                        />
                      </div>
                      
                      <div>
                        <div className="text-sm text-[#0A1128]/60 mb-1">Payment Method <span className="text-[#C46A3A]">*</span></div>
                        <select
                          value={paymentDetails.paymentMethod}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                          className="w-full px-3 py-2 border border-[#0A1128]/20 rounded-md"
                        >
                          <option value="">Select method...</option>
                          <option value="credit-card">Credit Card</option>
                          <option value="bank-transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                        </select>
                      </div>
                      
                      <div>
                        <div className="text-sm text-[#0A1128]/60 mb-1">Notes (Optional)</div>
                        <Input
                          value={paymentDetails.paymentNotes}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, paymentNotes: e.target.value }))}
                          placeholder="e.g. Paid at drop-off"
                        />
                      </div>

                      {/* Outstanding Balance Calculation */}
                      {paymentDetails.amountPaid && (
                        <div className="pt-3 border-t border-[#0A1128]/10 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#0A1128]/60">Total Booking Cost:</span>
                            <span className="font-semibold">$350.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#0A1128]/60">Amount Paid:</span>
                            <span className="font-semibold">{paymentDetails.amountPaid}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-[#0A1128]/10">
                            <span className="text-[#0A1128] font-semibold">Outstanding Balance:</span>
                            <span className="font-bold text-[#C46A3A]">
                              ${Math.max(0, 350 - parseFloat(paymentDetails.amountPaid.replace(/[^0-9.]/g, '') || '0')).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Care Information */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#C46A3A]" />
                  Care Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-[#0A1128]/60 mb-1">Diet</div>
                  {editMode ? (
                    <Input
                      value={editedBooking.diet}
                      onChange={(e) => handleFieldChange('diet', e.target.value)}
                    />
                  ) : (
                    <div className="text-[#0A1128]">{editedBooking.diet}</div>
                  )}
                </div>
                <div className="border-t pt-3">
                  <div className="text-sm text-[#0A1128]/60 mb-1">Special Needs</div>
                  {editMode ? (
                    <textarea
                      value={editedBooking.specialNeeds}
                      onChange={(e) => handleFieldChange('specialNeeds', e.target.value)}
                      className="w-full px-3 py-2 border border-[#0A1128]/20 rounded-md min-h-[80px]"
                    />
                  ) : (
                    <div className="text-[#0A1128]">{editedBooking.specialNeeds}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixed Bottom Actions */}
          <div className="flex-shrink-0 bg-white border-t border-[#0A1128]/10 px-5 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {editMode ? (
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditedBooking({ ...selectedBooking });
                    setEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={handleSave}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => window.open(`tel:${editedBooking.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Owner
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditMode(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };



  // New Booking Drawer
  const NewBookingDrawer = () => {
    if (!showNewBookingDrawer) return null;

    // Filter customers based on search - search by customer name OR pet name
    const filteredCustomers = mockCustomers.filter(c => {
      const searchTerm = bookingForm.customerName.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(searchTerm);
      const petMatch = c.pets.some(pet => pet.toLowerCase().includes(searchTerm));
      return nameMatch || petMatch;
    });

    const handleCustomerSelect = (customer: typeof mockCustomers[0]) => {
      setBookingForm(prev => ({
        ...prev,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        selectedPets: []
      }));
      setShowCustomerDetails(true);
    };

    const handlePetToggle = (petName: string) => {
      setBookingForm(prev => ({
        ...prev,
        selectedPets: prev.selectedPets.includes(petName)
          ? prev.selectedPets.filter(p => p !== petName)
          : [...prev.selectedPets, petName]
      }));
    };

    const handleAddPet = () => {
      if (newPetName.trim()) {
        if (isNewCustomer) {
          // For new customers, just add to booking form's selected pets
          setBookingForm(prev => ({
            ...prev,
            selectedPets: [...prev.selectedPets, newPetName.trim()]
          }));
        } else {
          // For existing customers, update mockCustomers
          setMockCustomers(prev => 
            prev.map(c => 
              c.name === bookingForm.customerName 
                ? { ...c, pets: [...c.pets, newPetName.trim()] }
                : c
            )
          );
        }
        setNewPetName('');
        setShowAddPet(false);
      }
    };

    const handleAddNewCustomer = () => {
      setIsNewCustomer(true);
      setShowCustomerDetails(true);
      // Clear email and phone fields for new customer entry
      setBookingForm(prev => ({
        ...prev,
        customerEmail: '',
        customerPhone: ''
      }));
    };

    const handleSaveNewCustomer = () => {
      if (bookingForm.customerName && bookingForm.customerEmail && bookingForm.customerPhone) {
        const newCustomer = {
          name: bookingForm.customerName,
          email: bookingForm.customerEmail,
          phone: bookingForm.customerPhone,
          pets: bookingForm.selectedPets
        };
        setMockCustomers(prev => [...prev, newCustomer]);
        setIsNewCustomer(false);
      }
    };

    // Calculate price dynamically
    const calculateTotalPrice = () => {
      if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return 0;
      
      const checkIn = new Date(bookingForm.checkInDate);
      const checkOut = new Date(bookingForm.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const basePrice = 30; // per night per cat
      let total = nights * bookingForm.selectedPets.length * basePrice;
      
      // Additional services
      if (bookingForm.additionalServices.includes('grooming')) total += 45 * bookingForm.selectedPets.length;
      if (bookingForm.additionalServices.includes('medication')) total += 15 * nights * bookingForm.selectedPets.length;
      if (bookingForm.additionalServices.includes('premium-food')) total += 10 * nights * bookingForm.selectedPets.length;
      
      // Miscellaneous charge
      if (bookingForm.miscChargeAmount) {
        const amount = parseFloat(bookingForm.miscChargeAmount);
        if (!isNaN(amount)) {
          if (bookingForm.miscChargeType === 'percentage') {
            total += total * (amount / 100);
          } else {
            total += amount;
          }
        }
      }
      
      // Discount (applied after misc charges)
      let discountAmount = 0;
      if (bookingForm.discountCode === 'FIRST10') discountAmount = total * 0.1;
      if (bookingForm.discountCode === 'SUMMER20') discountAmount = total * 0.2;
      if (bookingForm.discountCode === 'LOYALTY15') discountAmount = total * 0.15;
      if (bookingForm.discountCode === 'REFER25') discountAmount = total * 0.25;
      
      total -= discountAmount;
      
      return total;
    };

    const calculatePriceBreakdown = () => {
      if (!bookingForm.checkInDate || !bookingForm.checkOutDate) return null;
      
      const checkIn = new Date(bookingForm.checkInDate);
      const checkOut = new Date(bookingForm.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      const basePrice = 30;
      const roomRate = nights * bookingForm.selectedPets.length * basePrice;
      
      const services = {
        grooming: bookingForm.additionalServices.includes('grooming') ? 45 * bookingForm.selectedPets.length : 0,
        medication: bookingForm.additionalServices.includes('medication') ? 15 * nights * bookingForm.selectedPets.length : 0,
        premiumFood: bookingForm.additionalServices.includes('premium-food') ? 10 * nights * bookingForm.selectedPets.length : 0
      };
      
      let miscCharge = 0;
      let subtotal = roomRate + services.grooming + services.medication + services.premiumFood;
      
      if (bookingForm.miscChargeAmount) {
        const amount = parseFloat(bookingForm.miscChargeAmount);
        if (!isNaN(amount)) {
          if (bookingForm.miscChargeType === 'percentage') {
            miscCharge = subtotal * (amount / 100);
          } else {
            miscCharge = amount;
          }
        }
      }
      
      subtotal += miscCharge;
      
      let discountAmount = 0;
      let discountName = '';
      if (bookingForm.discountCode === 'FIRST10') { discountAmount = subtotal * 0.1; discountName = 'First Timer (10%)'; }
      if (bookingForm.discountCode === 'SUMMER20') { discountAmount = subtotal * 0.2; discountName = 'Summer Special (20%)'; }
      if (bookingForm.discountCode === 'LOYALTY15') { discountAmount = subtotal * 0.15; discountName = 'Loyalty Reward (15%)'; }
      if (bookingForm.discountCode === 'REFER25') { discountAmount = subtotal * 0.25; discountName = 'Referral (25%)'; }
      
      return {
        nights,
        roomRate,
        services,
        miscCharge,
        miscDescription: bookingForm.miscChargeDescription,
        miscType: bookingForm.miscChargeType,
        miscAmount: bookingForm.miscChargeAmount,
        subtotal,
        discountAmount,
        discountName,
        total: subtotal - discountAmount
      };
    };

    const totalPrice = calculateTotalPrice();
    const depositAmount = totalPrice * 0.3;
    const breakdown = calculatePriceBreakdown();

    const selectedCustomer = mockCustomers.find(c => c.name === bookingForm.customerName);
    const availableRooms = [1, 3, 4, 5, 7, 8, 9, 12, 13, 16, 17, 19];
    const dropOffTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
    const pickUpTimes = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'];

    return (
      <>
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-[9998]"
          onClick={() => setShowNewBookingDrawer(false)}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
          style={{ 
            height: '85vh',
            maxHeight: '90vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-br from-[#0A1128] to-[#0A1128]/95 px-5 pt-2 pb-5 rounded-t-[24px]">
            <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">
                  New Booking
                </h2>
                <p className="text-sm text-white/70 mt-1">Create a reservation for your guest</p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowNewBookingDrawer(false);
                  setIsNewCustomer(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg -mr-2"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 bg-[#F8F7F5]" style={{ WebkitOverflowScrolling: 'touch' } as any}>
            <div className="space-y-4">
              {/* Customer Search */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <Search className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Find Customer *</label>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0A1128]/40" />
                  <input
                    key="customer-search-input"
                    type="text"
                    value={bookingForm.customerName}
                    onChange={(e) => {
                      setBookingForm(prev => ({ ...prev, customerName: e.target.value }));
                    }}
                    placeholder="Search by pet name or owner name..."
                    autoComplete="off"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 text-base transition-all bg-[#F8F7F5] hover:bg-white"
                  />
                </div>
                
                {/* Customer search results */}
                {bookingForm.customerName && filteredCustomers.length > 0 && bookingForm.customerName !== selectedCustomer?.name && !isNewCustomer && (
                  <div className="mt-2 bg-white border border-[#0A1128]/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredCustomers.map((customer, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full text-left px-4 py-3 hover:bg-[#0A1128]/5 border-b border-[#0A1128]/5 last:border-0"
                      >
                        <div className="font-semibold text-[#0A1128]">{customer.name}</div>
                        <div className="text-sm text-[#0A1128]/60">{customer.pets.join(', ')}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Add New Customer button */}
                {bookingForm.customerName && filteredCustomers.length === 0 && !isNewCustomer && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleAddNewCustomer}
                      className="w-full py-3 px-4 border-2 border-dashed border-[#C46A3A]/30 rounded-xl text-[#C46A3A] font-medium hover:border-[#C46A3A] hover:bg-[#C46A3A]/5 flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add "{bookingForm.customerName}" as New Customer
                    </button>
                  </div>
                )}
                
                {/* Customer Details - Expandable or Editable for New Customers */}
                {(selectedCustomer || isNewCustomer) && (
                  <div className="mt-3">
                    {!isNewCustomer && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowCustomerDetails(!showCustomerDetails);
                        }}
                        className="flex items-center justify-between w-full py-2 text-sm font-medium text-[#0A1128]/70"
                      >
                        <span>Customer Details</span>
                        {showCustomerDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                    {(showCustomerDetails || isNewCustomer) && (
                      <div className="mt-2 space-y-3 p-3 bg-[#0A1128]/5 rounded-lg">
                        {isNewCustomer ? (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-[#0A1128]/70 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                Email *
                              </label>
                              <input
                                key="customer-email-input"
                                type="email"
                                value={bookingForm.customerEmail}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                placeholder="customer@email.com"
                                autoComplete="off"
                                className="w-full px-3 py-2 border-2 border-[#0A1128]/10 rounded-lg focus:border-[#C46A3A] focus:outline-none text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-[#0A1128]/70 flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                Phone *
                              </label>
                              <input
                                key="customer-phone-input"
                                type="tel"
                                value={bookingForm.customerPhone}
                                onChange={(e) => setBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                placeholder="021 123 4567"
                                autoComplete="off"
                                className="w-full px-3 py-2 border-2 border-[#0A1128]/10 rounded-lg focus:border-[#C46A3A] focus:outline-none text-sm"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center text-sm">
                              <Mail className="w-4 h-4 mr-2 text-[#0A1128]/60" />
                              <span className="text-[#0A1128]">{selectedCustomer?.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="w-4 h-4 mr-2 text-[#0A1128]/60" />
                              <span className="text-[#0A1128]">{selectedCustomer?.phone}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pet Selection */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Select Pet(s) *</label>
                </div>
                {(selectedCustomer || isNewCustomer) ? (
                  <div className="space-y-2">
                    {/* Show existing pets for existing customers */}
                    {selectedCustomer && selectedCustomer.pets.map((pet, idx) => (
                      <label key={idx} className="flex items-center p-3 bg-[#0A1128]/5 rounded-lg cursor-pointer hover:bg-[#0A1128]/10">
                        <input
                          type="checkbox"
                          checked={bookingForm.selectedPets.includes(pet)}
                          onChange={() => handlePetToggle(pet)}
                          className="w-5 h-5 rounded border-2 border-[#0A1128]/30 text-[#C46A3A] focus:ring-[#C46A3A] mr-3"
                        />
                        <span className="font-medium text-[#0A1128]">{pet}</span>
                      </label>
                    ))}
                    {/* Show selected pets for new customers */}
                    {isNewCustomer && bookingForm.selectedPets.map((pet, idx) => (
                      <div key={idx} className="flex items-center p-3 bg-[#0A1128]/5 rounded-lg">
                        <span className="font-medium text-[#0A1128] flex-1">{pet}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setBookingForm(prev => ({
                              ...prev,
                              selectedPets: prev.selectedPets.filter(p => p !== pet)
                            }));
                          }}
                          className="text-[#0A1128]/40 hover:text-[#C46A3A]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {!showAddPet ? (
                      <button
                        type="button"
                        onClick={() => setShowAddPet(true)}
                        className="w-full py-3 border-2 border-dashed border-[#0A1128]/20 rounded-lg text-[#C46A3A] font-medium hover:border-[#C46A3A] hover:bg-[#C46A3A]/5 flex items-center justify-center"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Pet
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          key="new-pet-name-input"
                          type="text"
                          value={newPetName}
                          onChange={(e) => setNewPetName(e.target.value)}
                          autoComplete="off"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPet();
                            } else if (e.key === 'Escape') {
                              setShowAddPet(false);
                              setNewPetName('');
                            }
                          }}
                          onBlur={() => {
                            // Only close if the input is empty
                            if (!newPetName.trim()) {
                              setShowAddPet(false);
                            }
                          }}
                          placeholder="Pet name"
                          className="flex-1 px-3 py-2 border-2 border-[#0A1128]/20 rounded-lg focus:border-[#C46A3A] focus:outline-none"
                        />
                        <Button 
                          type="button"
                          onMouseDown={(e) => e.preventDefault()} 
                          onClick={handleAddPet} 
                          className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                        >
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-[#0A1128]/60 p-3 bg-[#0A1128]/5 rounded-lg">
                    Select a customer first to see their pets
                  </div>
                )}
              </div>

              {/* Booking Dates & Times */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <CalendarIcon className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Booking Dates & Times *</label>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[#0A1128]/60 mb-1.5 block font-medium">Check-In Date</label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCheckInCalendar(true);
                      }}
                      className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl hover:border-[#C46A3A] focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 text-left transition-all bg-[#F8F7F5] hover:bg-white"
                    >
                      <span className={bookingForm.checkInDate ? 'text-[#0A1128] font-medium' : 'text-[#0A1128]/40'}>
                        {bookingForm.checkInDate ? format(new Date(bookingForm.checkInDate), 'MMM d, yyyy') : 'Select date'}
                      </span>
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-[#0A1128]/60 mb-1.5 block font-medium">Check-Out Date</label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowCheckOutCalendar(true);
                      }}
                      className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl hover:border-[#C46A3A] focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 text-left transition-all bg-[#F8F7F5] hover:bg-white"
                    >
                      <span className={bookingForm.checkOutDate ? 'text-[#0A1128] font-medium' : 'text-[#0A1128]/40'}>
                        {bookingForm.checkOutDate ? format(new Date(bookingForm.checkOutDate), 'MMM d, yyyy') : 'Select date'}
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#0A1128]/60 mb-1.5 block font-medium">Drop-off Time</label>
                    <select
                      value={bookingForm.dropOffTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookingForm(prev => ({ ...prev, dropOffTime: value }));
                      }}
                      className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all font-medium"
                    >
                      {dropOffTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#0A1128]/60 mb-1.5 block font-medium">Pick-up Time</label>
                    <select
                      value={bookingForm.pickUpTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBookingForm(prev => ({ ...prev, pickUpTime: value }));
                      }}
                      className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all font-medium"
                    >
                      {pickUpTimes.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Assignment */}
              {bookingForm.selectedPets.length > 0 && (
                <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                      <LayoutGrid className="w-4 h-4 text-[#C46A3A]" />
                    </div>
                    <label className="text-base font-semibold text-[#0A1128]">Room Assignment *</label>
                  </div>
                  {bookingForm.selectedPets.map((pet, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <label className="text-xs text-[#0A1128]/60 mb-1.5 block font-medium">{pet}</label>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRoomPlannerPet(pet);
                          setShowRoomPlanner(true);
                        }}
                        className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none text-left flex items-center justify-between hover:bg-white hover:border-[#C46A3A] transition-all bg-[#F8F7F5]"
                      >
                        <span className={bookingForm.roomAssignments[pet] ? 'text-[#0A1128] font-medium' : 'text-[#0A1128]/40'}>
                          {bookingForm.roomAssignments[pet] ? `Room ${bookingForm.roomAssignments[pet]}` : 'Select from room planner...'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#0A1128]/40" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Additional Services - Collapsible */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAdditionalServices(!showAdditionalServices);
                  }}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                      <Sparkles className="w-4 h-4 text-[#C46A3A]" />
                    </div>
                    <span className="text-base font-semibold text-[#0A1128]">Additional Services</span>
                  </div>
                  {showAdditionalServices ? <ChevronUp className="w-5 h-5 text-[#0A1128]/40" /> : <ChevronDown className="w-5 h-5 text-[#0A1128]/40" />}
                </button>
                {showAdditionalServices && (
                  <div className="space-y-2 pt-2">
                    {[
                      { id: 'grooming', name: 'Grooming', price: 45 },
                      { id: 'medication', name: 'Medication Administration', price: 15 },
                      { id: 'premium-food', name: 'Premium Food', price: 10 }
                    ].map(service => (
                      <label key={service.id} className="flex items-center justify-between p-3 bg-[#0A1128]/5 rounded-lg cursor-pointer hover:bg-[#0A1128]/10">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={bookingForm.additionalServices.includes(service.id)}
                            onChange={() => {
                              setBookingForm(prev => ({
                                ...prev,
                                additionalServices: prev.additionalServices.includes(service.id)
                                  ? prev.additionalServices.filter(s => s !== service.id)
                                  : [...prev.additionalServices, service.id]
                              }));
                            }}
                            className="w-5 h-5 rounded border-2 border-[#0A1128]/30 text-[#C46A3A] focus:ring-[#C46A3A] mr-3"
                          />
                          <span className="font-medium text-[#0A1128]">{service.name}</span>
                        </div>
                        <span className="text-sm text-[#0A1128]/60">${service.price}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Miscellaneous Charge */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <DollarSign className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Miscellaneous Charge</label>
                </div>
                <div className="space-y-3">
                  <input
                    key="misc-charge-description-input"
                    type="text"
                    value={bookingForm.miscChargeDescription}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, miscChargeDescription: e.target.value }))}
                    placeholder="Description (e.g., Extra cleaning, Late pickup)"
                    autoComplete="off"
                    className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        key="misc-charge-amount-input"
                        type="text"
                        value={bookingForm.miscChargeAmount}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, miscChargeAmount: e.target.value }))}
                        placeholder="Amount"
                        autoComplete="off"
                        className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all"
                      />
                    </div>
                    <select
                      value={bookingForm.miscChargeType}
                      onChange={(e) => {
                        const value = e.target.value as 'fixed' | 'percentage';
                        setBookingForm(prev => ({ ...prev, miscChargeType: value }));
                      }}
                      className="px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all font-medium"
                    >
                      <option value="fixed">$ Fixed</option>
                      <option value="percentage">% Percent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Discount */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <Percent className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Discount</label>
                </div>
                <select
                  value={bookingForm.discountCode}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBookingForm(prev => ({ ...prev, discountCode: value }));
                  }}
                  className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 bg-[#F8F7F5] hover:bg-white transition-all font-medium"
                >
                  <option value="">No discount</option>
                  <option value="FIRST10">First Timer (10% off)</option>
                  <option value="SUMMER20">Summer Special (20% off)</option>
                  <option value="LOYALTY15">Loyalty Reward (15% off)</option>
                  <option value="REFER25">Referral (25% off)</option>
                </select>
              </div>

              {/* Comments */}
              <div className="bg-white border border-[#0A1128]/10 rounded-2xl p-5 shadow-[0_2px_8px_rgba(10,17,40,0.06)]">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[#C46A3A]/10 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-4 h-4 text-[#C46A3A]" />
                  </div>
                  <label className="text-base font-semibold text-[#0A1128]">Additional Notes</label>
                </div>
                <textarea
                  value={bookingForm.comments}
                  onChange={(e) => {
                    const value = e.target.value;
                    setBookingForm(prev => ({ ...prev, comments: value }));
                  }}
                  placeholder="Any special requests or notes..."
                  rows={3}
                  className="w-full px-3.5 py-3 border-2 border-[#0A1128]/10 rounded-xl focus:border-[#C46A3A] focus:outline-none focus:ring-4 focus:ring-[#C46A3A]/10 resize-none bg-[#F8F7F5] hover:bg-white transition-all"
                />
              </div>

              {/* Price Summary */}
              {breakdown && (
                <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-serif font-bold text-lg mb-4 pb-3 border-b border-white/20">Price Breakdown</h3>
                  
                  <div className="space-y-2.5 mb-4">
                    {/* Room Rate */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="opacity-90">Room Rate ({breakdown.nights} night{breakdown.nights > 1 ? 's' : ''} × {bookingForm.selectedPets.length} cat{bookingForm.selectedPets.length > 1 ? 's' : ''})</span>
                      <span className="font-medium">${breakdown.roomRate.toFixed(2)}</span>
                    </div>
                    
                    {/* Additional Services */}
                    {breakdown.services.grooming > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Grooming</span>
                        <span className="font-medium">${breakdown.services.grooming.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.services.medication > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Medication Administration</span>
                        <span className="font-medium">${breakdown.services.medication.toFixed(2)}</span>
                      </div>
                    )}
                    {breakdown.services.premiumFood > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">Premium Food</span>
                        <span className="font-medium">${breakdown.services.premiumFood.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Miscellaneous Charge */}
                    {breakdown.miscCharge > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="opacity-90">{breakdown.miscDescription}</span>
                        <span className="font-medium">${breakdown.miscCharge.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Discount */}
                  {breakdown.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm mb-4 pb-4 border-b border-white/20">
                      <span className="opacity-90">{breakdown.discountName}</span>
                      <span className="font-medium text-[#C46A3A]">-${breakdown.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Total */}
                  <div className="flex justify-between items-center mb-3 pt-3 border-t border-white/20">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-2xl font-bold">${breakdown.total.toFixed(2)}</span>
                  </div>
                  
                  {/* Deposit */}
                  <div className="flex justify-between items-center bg-white/10 rounded-lg p-3">
                    <span className="text-sm font-medium">Deposit Required (30%)</span>
                    <span className="text-lg font-bold text-[#C46A3A]">${depositAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-white border-t border-[#0A1128]/10 px-5 py-3.5 shadow-[0_-2px_12px_-1px_rgba(0,0,0,0.06)]">
            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                className="flex-1 h-12 border-2 border-[#0A1128]/20 hover:bg-[#0A1128]/5 hover:border-[#0A1128]/30 font-semibold text-base transition-all"
                onClick={() => {
                  setShowNewBookingDrawer(false);
                  setIsNewCustomer(false);
                  // Reset form
                  setBookingForm({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    selectedPets: [],
                    checkInDate: '',
                    checkOutDate: '',
                    dropOffTime: '09:00',
                    pickUpTime: '16:00',
                    roomAssignments: {},
                    additionalServices: [],
                    discountCode: '',
                    comments: '',
                    miscChargeDescription: '',
                    miscChargeAmount: '',
                    miscChargeType: 'fixed'
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                className="flex-1 h-12 bg-gradient-to-r from-[#C46A3A] to-[#C46A3A]/90 hover:from-[#C46A3A]/90 hover:to-[#C46A3A]/80 text-white font-bold text-base shadow-lg shadow-[#C46A3A]/25 transition-all"
                onClick={() => {
                  // If new customer, save to mockCustomers
                  if (isNewCustomer && bookingForm.customerName && bookingForm.customerEmail && bookingForm.customerPhone) {
                    const newCustomer = {
                      name: bookingForm.customerName,
                      email: bookingForm.customerEmail,
                      phone: bookingForm.customerPhone,
                      pets: bookingForm.selectedPets
                    };
                    setMockCustomers(prev => [...prev, newCustomer]);
                  }
                  
                  // Create new booking
                  const totalPrice = calculateTotalPrice();
                  const newBooking = {
                    id: Date.now(),
                    catName: bookingForm.selectedPets.join(', '),
                    ownerName: bookingForm.customerName,
                    checkIn: format(new Date(bookingForm.checkInDate), 'MMM dd'),
                    checkOut: format(new Date(bookingForm.checkOutDate), 'MMM dd'),
                    room: Object.values(bookingForm.roomAssignments).join(', ') || 'TBD',
                    status: 'confirmed',
                    amount: `$${totalPrice.toFixed(0)}`,
                    date: new Date(bookingForm.checkInDate)
                  };
                  
                  setBookings(prev => [newBooking, ...prev]);
                  setShowNewBookingDrawer(false);
                  setIsNewCustomer(false);
                  
                  // Reset form
                  setBookingForm({
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    selectedPets: [],
                    checkInDate: '',
                    checkOutDate: '',
                    dropOffTime: '09:00',
                    pickUpTime: '16:00',
                    roomAssignments: {},
                    additionalServices: [],
                    discountCode: '',
                    comments: '',
                    miscChargeDescription: '',
                    miscChargeAmount: '',
                    miscChargeType: 'fixed'
                  });
                }}
                disabled={!bookingForm.customerName || bookingForm.selectedPets.length === 0 || !bookingForm.checkInDate || !bookingForm.checkOutDate || (isNewCustomer && (!bookingForm.customerEmail || !bookingForm.customerPhone))}
              >
                Create Booking
              </Button>
            </div>
          </div>
        </div>

        {/* Check-In Date Modal Calendar */}
        {showCheckInCalendar && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-[10000]"
              onClick={() => setShowCheckInCalendar(false)}
            />
            <div 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-[10001] max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-lg text-[#0A1128]">Select Check-In Date</h3>
                <button 
                  onClick={() => setShowCheckInCalendar(false)}
                  className="p-1 hover:bg-[#0A1128]/5 rounded-lg"
                >
                  <X className="w-5 h-5 text-[#0A1128]" />
                </button>
              </div>
              <DayPicker
                mode="range"
                selected={
                  bookingForm.checkInDate && bookingForm.checkOutDate
                    ? { 
                        from: new Date(bookingForm.checkInDate), 
                        to: new Date(bookingForm.checkOutDate) 
                      }
                    : bookingForm.checkInDate
                    ? { from: new Date(bookingForm.checkInDate), to: undefined }
                    : undefined
                }
                onSelect={(range) => {
                  if (range?.from) {
                    setBookingForm(prev => ({ 
                      ...prev, 
                      checkInDate: format(range.from!, 'yyyy-MM-dd'),
                      checkOutDate: range.to ? format(range.to, 'yyyy-MM-dd') : prev.checkOutDate
                    }));
                    // If they selected both dates in range mode, close modal
                    if (range.to) {
                      setShowCheckInCalendar(false);
                    }
                  }
                }}
                disabled={{ before: new Date() }}
                className="mx-auto"
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCheckInCalendar(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90"
                  onClick={() => setShowCheckInCalendar(false)}
                  disabled={!bookingForm.checkInDate}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Check-Out Date Modal Calendar */}
        {showCheckOutCalendar && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-[10000]"
              onClick={() => setShowCheckOutCalendar(false)}
            />
            <div 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 z-[10001] max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-lg text-[#0A1128]">Select Check-Out Date</h3>
                <button 
                  onClick={() => setShowCheckOutCalendar(false)}
                  className="p-1 hover:bg-[#0A1128]/5 rounded-lg"
                >
                  <X className="w-5 h-5 text-[#0A1128]" />
                </button>
              </div>
              <DayPicker
                mode="single"
                selected={bookingForm.checkOutDate ? new Date(bookingForm.checkOutDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setBookingForm(prev => ({ 
                      ...prev, 
                      checkOutDate: format(date, 'yyyy-MM-dd')
                    }));
                  }
                }}
                disabled={
                  bookingForm.checkInDate 
                    ? { before: addDays(new Date(bookingForm.checkInDate), 1) }
                    : { before: new Date() }
                }
                className="mx-auto"
              />
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowCheckOutCalendar(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90"
                  onClick={() => setShowCheckOutCalendar(false)}
                  disabled={!bookingForm.checkOutDate}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  // Customer Add/Edit Drawer
  const CustomerDrawer = () => {
    if (!showCustomerDrawer) return null;

    const handleSaveCustomer = () => {
      // In a real app, this would save to database
      setShowCustomerDrawer(false);
      setEditingCustomer(null);
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        catNames: '',
        notes: ''
      });
    };

    return (
      <>
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-[9998]"
          onClick={() => {
            setShowCustomerDrawer(false);
            setEditingCustomer(null);
          }}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
          style={{ 
            height: '80vh',
            maxHeight: '85vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4">
            <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button 
                onClick={() => {
                  setShowCustomerDrawer(false);
                  setEditingCustomer(null);
                }}
                className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
              >
                <X className="w-5 h-5 text-[#0A1128]" />
              </button>
            </div>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {/* Customer Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#0A1128] mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#0A1128]/70 mb-1 block">Name</label>
                    <Input
                      value={customerFormData.name}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer name"
                      className="bg-white border-[#0A1128]/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#0A1128]/70 mb-1 block">Email</label>
                    <Input
                      type="email"
                      value={customerFormData.email}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                      className="bg-white border-[#0A1128]/10"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#0A1128]/70 mb-1 block">Phone</label>
                    <Input
                      type="tel"
                      value={customerFormData.phone}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="bg-white border-[#0A1128]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Cat Info Section */}
              <div>
                <h3 className="text-sm font-semibold text-[#0A1128] mb-3">Cat Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#0A1128]/70 mb-1 block">Cat Names</label>
                    <Input
                      value={customerFormData.catNames}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, catNames: e.target.value }))}
                      placeholder="Whiskers, Mittens (comma separated)"
                      className="bg-white border-[#0A1128]/10"
                    />
                    <p className="text-xs text-[#0A1128]/50 mt-1">Separate multiple cats with commas</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#0A1128]/70 mb-1 block">Special Notes (Optional)</label>
                    <textarea
                      value={customerFormData.notes}
                      onChange={(e) => setCustomerFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Dietary requirements, medications, preferences..."
                      className="w-full min-h-[100px] px-3 py-2 bg-white border border-[#0A1128]/10 rounded-md text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 border-t border-[#0A1128]/10 p-4 bg-white flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-[#0A1128]/20"
              onClick={() => {
                setShowCustomerDrawer(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
              onClick={handleSaveCustomer}
            >
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Import File Drawer
  const ImportDrawer = () => {
    if (!showImportDrawer) return null;

    return (
      <>
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-[9998]"
          onClick={() => setShowImportDrawer(false)}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
          style={{ 
            height: '75vh',
            maxHeight: '80vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4">
            <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                Upload Data
              </h2>
              <button 
                onClick={() => setShowImportDrawer(false)}
                className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
              >
                <X className="w-5 h-5 text-[#0A1128]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-[#0A1128]/20 rounded-xl p-8 text-center bg-[#F8F7F5]">
                <Upload className="w-12 h-12 text-[#C46A3A] mx-auto mb-3" />
                <h3 className="font-semibold text-[#0A1128] mb-1">
                  Drop your file here
                </h3>
                <p className="text-sm text-[#0A1128]/60 mb-4">
                  or click to browse
                </p>
                <Button className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                  Select File
                </Button>
                <p className="text-xs text-[#0A1128]/40 mt-3">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              {/* Info */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-[#0A1128] mb-2">What we'll import</h4>
                  <ul className="text-sm text-[#0A1128]/70 space-y-1">
                    <li>• Customer names and contact details</li>
                    <li>• Cat names and preferences</li>
                    <li>• Booking dates and room assignments</li>
                    <li>• Payment information</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-[#0A1128]/10 p-4 bg-white">
            <Button 
              variant="outline" 
              className="w-full border-[#0A1128]/20"
              onClick={() => setShowImportDrawer(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Transaction Details Drawer
  const TransactionDrawer = () => {
    if (!showTransactionDrawer || !selectedTransaction) return null;

    return (
      <>
        <div 
          className="absolute inset-0 bg-black/20 transition-opacity duration-300 z-[9998]"
          onClick={() => {
            setShowTransactionDrawer(false);
            setSelectedTransaction(null);
          }}
        />
        <div 
          className="absolute left-0 right-0 bottom-0 bg-white rounded-t-[24px] transition-all duration-300 shadow-2xl flex flex-col overflow-hidden z-[9999]"
          style={{ 
            height: '70vh',
            maxHeight: '75vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-[#0A1128]/10 px-5 pt-2 pb-4">
            <div className="w-12 h-1.5 bg-[#0A1128]/20 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-semibold text-[#0A1128]">
                Transaction Details
              </h2>
              <button 
                onClick={() => {
                  setShowTransactionDrawer(false);
                  setSelectedTransaction(null);
                }}
                className="p-2 hover:bg-[#0A1128]/5 rounded-lg -mr-2"
              >
                <X className="w-5 h-5 text-[#0A1128]" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {/* Amount */}
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-[#0A1128]">
                  ${selectedTransaction.amount}
                </div>
                <Badge 
                  variant={
                    selectedTransaction.status === 'paid' ? 'default' : 
                    selectedTransaction.status === 'pending' ? 'secondary' : 
                    'destructive'
                  }
                  className="mt-2"
                >
                  {selectedTransaction.status}
                </Badge>
              </div>

              {/* Details */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#0A1128]/60">Customer</span>
                    <span className="text-sm font-semibold text-[#0A1128]">{selectedTransaction.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#0A1128]/60">Invoice</span>
                    <span className="text-sm font-semibold text-[#0A1128]">{selectedTransaction.invoice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#0A1128]/60">Date</span>
                    <span className="text-sm font-semibold text-[#0A1128]">{selectedTransaction.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#0A1128]/60">Payment Method</span>
                    <span className="text-sm font-semibold text-[#0A1128]">{selectedTransaction.method}</span>
                  </div>
                </CardContent>
              </Card>

              {selectedTransaction.status === 'pending' && (
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-[#0A1128]/10 p-4 bg-white">
            <Button 
              variant="outline" 
              className="w-full border-[#0A1128]/20"
              onClick={() => {
                setShowTransactionDrawer(false);
                setSelectedTransaction(null);
              }}
            >
              Close
            </Button>
          </div>
        </div>
      </>
    );
  };

  // Memoize the NewBookingDrawer to prevent recreation on every render
  const memoizedNewBookingDrawer = useMemo(() => NewBookingDrawer(), [
    showNewBookingDrawer,
    bookingForm,
    isNewCustomer,
    newPetName,
    showCheckInCalendar,
    showCheckOutCalendar,
    showAddPet,
    showCustomerDetails,
    showAdditionalServices,
    mockCustomers
  ]);

  // Today Page
  if (currentPage === 'home') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        
        <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(100% - 64px)' }}>
          <div className="w-full px-5 py-4">
            {/* New Booking Button */}
            <Button 
              type="button"
              className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white rounded-md text-base font-semibold px-3 py-6"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNewBookingDrawer(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Booking
          </Button>

          {/* Date Selector */}
          <div className="bg-white rounded-2xl shadow-sm flex items-center justify-between p-4 my-4">
            <button type="button" onClick={(e) => handlePreviousDay(e)} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-[#0A1128]" />
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#0A1128]">{format(selectedDate, 'EEEE')}</div>
              <div className="text-sm text-[#0A1128]/60">{format(selectedDate, 'MMMM d, yyyy')}</div>
            </div>
            <button type="button" onClick={(e) => handleNextDay(e)} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
              <ChevronRight className="w-5 h-5 text-[#0A1128]" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-[#0A1128] text-white border-0 shadow-sm rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{arrivals.length}</div>
                <div className="text-xs opacity-90">Arrivals</div>
              </CardContent>
            </Card>
            <Card className="bg-white text-[#0A1128]/60 border-0 shadow-sm rounded-3xl">
              <CardContent className="p-4 text-center bg-[#C46A3A] rounded-[20px]">
                <div className="text-2xl font-bold text-white">{departures.length}</div>
                <div className="text-xs text-white">Departures</div>
              </CardContent>
            </Card>
            <Card className="bg-white text-[#0A1128]/60 border-0 shadow-sm rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#0A1128]">15/20</div>
                <div className="text-xs">Occupied</div>
              </CardContent>
            </Card>
          </div>

          {/* Arrivals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Arrivals Today</CardTitle>
              <Badge variant="secondary">{arrivals.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {arrivals.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-start justify-between p-3 bg-[#F8F7F5] rounded-xl cursor-pointer hover:bg-[#F8F7F5]/80 transition-colors"
                  onClick={(e) => handleViewBooking(booking, e)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#0A1128]">{booking.catName}</div>
                    <div className="text-sm text-[#0A1128]/60">{booking.ownerName}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#0A1128]/50">Room {booking.room}</span>
                      <span className="text-xs text-[#0A1128]/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {booking.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={booking.paymentStatus === 'paid' ? 'default' : booking.paymentStatus === 'deposit' ? 'secondary' : 'destructive'}>
                      {booking.paymentStatus}
                    </Badge>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCheckIn(booking.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        checkedInIds.includes(booking.id)
                          ? 'bg-[#C46A3A]/20 text-[#C46A3A]'
                          : 'bg-[#0A1128] text-white hover:bg-[#0A1128]/90'
                      }`}
                    >
                      {checkedInIds.includes(booking.id) ? (
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Checked In</span>
                      ) : (
                        'Check In'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Departures */}
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Departures Today</CardTitle>
              <Badge variant="secondary">{departures.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {departures.map((booking) => (
                <div 
                  key={booking.id} 
                  className="flex items-start justify-between p-3 bg-[#F8F7F5] rounded-xl cursor-pointer hover:bg-[#F8F7F5]/80 transition-colors"
                  onClick={(e) => handleViewBooking(booking, e)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-[#0A1128]">{booking.catName}</div>
                    <div className="text-sm text-[#0A1128]/60">{booking.ownerName}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[#0A1128]/50">Room {booking.room}</span>
                      <span className="text-xs text-[#0A1128]/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {booking.time}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCheckOut(booking.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      checkedOutIds.includes(booking.id)
                        ? 'bg-[#C46A3A]/20 text-[#C46A3A]'
                        : 'bg-[#0A1128] text-white hover:bg-[#0A1128]/90'
                    }`}
                  >
                    {checkedOutIds.includes(booking.id) ? (
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Checked Out</span>
                    ) : (
                      'Check Out'
                    )}
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Occupancy Section - Simplified and Clickable */}
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Occupancy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { room: '1', status: 'available', cat: null, booking: null },
                { room: '2', status: 'occupied', cat: 'Charlie', booking: { id: 21, catName: 'Charlie', ownerName: 'Sophie Martin', room: '2', checkIn: 'Mar 18', checkOut: 'Mar 22', time: '10:00am', phone: '021 987 6543', email: 'sophie@email.com', specialNeeds: 'Loves treats', diet: 'Wet food preferred', paymentStatus: 'paid' } },
                { room: '3', status: 'occupied', cat: 'Whiskers', booking: { id: 1, catName: 'Whiskers', ownerName: 'Sarah Johnson', room: '3', checkIn: 'Mar 20', checkOut: 'Mar 23', time: '9:00am', phone: '021 123 4567', email: 'sarah@email.com', specialNeeds: 'Needs medication twice daily', diet: 'Grain-free only', paymentStatus: 'paid' } },
                { room: '4', status: 'occupied', cat: 'Cleo', booking: { id: 22, catName: 'Cleo', ownerName: 'Anna White', room: '4', checkIn: 'Mar 19', checkOut: 'Mar 26', time: '11:30am', phone: '021 555 1234', email: 'anna@email.com', specialNeeds: 'Shy with other cats', diet: 'Sensitive stomach food', paymentStatus: 'deposit' } },
                { room: '5', status: 'occupied', cat: 'Oliver', booking: { id: 5, catName: 'Oliver', ownerName: 'James Brown', room: '5', checkIn: 'Mar 18', checkOut: 'Mar 22', time: '2:00pm', phone: '021 444 5555', email: 'james@email.com', specialNeeds: 'None', diet: 'Regular', paymentStatus: 'paid' } },
                { room: '6', status: 'occupied', cat: 'Nala', booking: { id: 23, catName: 'Nala', ownerName: 'Rachel Green', room: '6', checkIn: 'Mar 19', checkOut: 'Mar 23', time: '8:30am', phone: '021 333 4444', email: 'rachel@email.com', specialNeeds: 'Very playful', diet: 'Any', paymentStatus: 'paid' } },
                { room: '7', status: 'occupied', cat: 'Luna & Shadow', booking: { id: 2, catName: 'Luna & Shadow', ownerName: 'Mike Chen', room: '7', checkIn: 'Mar 20', checkOut: 'Mar 24', time: '1:00pm', phone: '021 234 5678', email: 'mike@email.com', specialNeeds: 'Keep together', diet: 'Dry food', paymentStatus: 'paid' } },
                { room: '8', status: 'occupied', cat: 'Simba', booking: { id: 4, catName: 'Simba', ownerName: 'Tom Davis', room: '8', checkIn: 'Mar 17', checkOut: 'Mar 21', time: '3:30pm', phone: '021 777 8888', email: 'tom@email.com', specialNeeds: 'Senior cat', diet: 'Senior formula', paymentStatus: 'paid' } },
                { room: '9', status: 'occupied', cat: 'Bella', booking: { id: 6, catName: 'Bella', ownerName: 'Lisa Anderson', room: '9', checkIn: 'Mar 20', checkOut: 'Mar 25', time: '10:30am', phone: '021 666 7777', email: 'lisa@email.com', specialNeeds: 'Indoor only', diet: 'Regular', paymentStatus: 'pending' } },
                { room: '10', status: 'occupied', cat: 'Smokey', booking: { id: 24, catName: 'Smokey', ownerName: 'Jennifer Moore', room: '10', checkIn: 'Mar 19', checkOut: 'Mar 24', time: '9:15am', phone: '021 222 3333', email: 'jennifer@email.com', specialNeeds: 'Diabetic', diet: 'Special diet', paymentStatus: 'paid' } },
                { room: '11', status: 'occupied', cat: 'Milo', booking: { id: 3, catName: 'Milo', ownerName: 'David Clark', room: '11', checkIn: 'Mar 20', checkOut: 'Mar 26', time: '4:00pm', phone: '021 888 9999', email: 'david@email.com', specialNeeds: 'Loves heights', diet: 'Grain-free', paymentStatus: 'deposit' } },
                { room: '12', status: 'occupied', cat: 'Mittens', booking: { id: 25, catName: 'Mittens', ownerName: 'Emma Wilson', room: '12', checkIn: 'Mar 18', checkOut: 'Mar 22', time: '11:00am', phone: '021 111 2222', email: 'emma@email.com', specialNeeds: 'Declawed', diet: 'Wet food only', paymentStatus: 'paid' } },
                { room: '13', status: 'available', cat: null, booking: null },
                { room: '14', status: 'occupied', cat: 'Oscar', booking: { id: 26, catName: 'Oscar', ownerName: 'Ben Taylor', room: '14', checkIn: 'Mar 17', checkOut: 'Mar 21', time: '2:30pm', phone: '021 444 5555', email: 'ben@email.com', specialNeeds: 'Very vocal', diet: 'Any', paymentStatus: 'paid' } },
                { room: '15', status: 'occupied', cat: 'Felix', booking: { id: 27, catName: 'Felix', ownerName: 'Mark Lee', room: '15', checkIn: 'Mar 19', checkOut: 'Mar 24', time: '12:00pm', phone: '021 555 6666', email: 'mark@email.com', specialNeeds: 'Shy', diet: 'Regular', paymentStatus: 'paid' } },
                { room: '16', status: 'available', cat: null, booking: null },
                { room: '17', status: 'available', cat: null, booking: null },
                { room: '18', status: 'occupied', cat: 'Max', booking: { id: 7, catName: 'Max', ownerName: 'Chris Evans', room: '18', checkIn: 'Mar 16', checkOut: 'Mar 20', time: '8:00am', phone: '021 999 0000', email: 'chris@email.com', specialNeeds: 'Aggressive eater', diet: 'Separate feeding', paymentStatus: 'paid' } },
                { room: '19', status: 'available', cat: null, booking: null },
                { room: '20', status: 'occupied', cat: 'Tiger', booking: { id: 8, catName: 'Tiger', ownerName: 'Robert King', room: '20', checkIn: 'Mar 16', checkOut: 'Mar 20', time: '4:30pm', phone: '021 777 8888', email: 'robert@email.com', specialNeeds: 'Outdoor cat', diet: 'High protein', paymentStatus: 'paid' } },
              ].filter(room => room.status === 'occupied').map((room) => (
                <div 
                  key={room.room}
                  onClick={() => {
                    if (room.booking) {
                      handleViewBooking(room.booking);
                    }
                  }}
                  className="p-3 rounded-xl bg-[#F8F7F5] border border-[#0A1128]/10 cursor-pointer hover:bg-[#F8F7F5]/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold text-[#0A1128] mb-0.5">
                        {room.cat}
                      </div>
                      <div className="text-sm text-[#0A1128]/60 mb-1">
                        {room.booking?.ownerName}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#0A1128]/50">
                        <span>Room {room.room}</span>
                        <span>•</span>
                        <span>{room.booking?.checkIn} - {room.booking?.checkOut}</span>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        room.booking?.paymentStatus === 'paid' ? 'default' : 
                        room.booking?.paymentStatus === 'deposit' ? 'secondary' : 
                        'destructive'
                      }
                      className="flex-shrink-0"
                    >
                      {room.booking?.paymentStatus === 'paid' ? 'Paid' : 
                       room.booking?.paymentStatus === 'deposit' ? 'Deposit' : 
                       'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        </div>
        
        {MenuOverlay()}
        {BookingDetailModal()}
        {memoizedNewBookingDrawer}
        <RoomPlannerTimeline 
          showRoomPlanner={showRoomPlanner}
          roomPlannerPet={roomPlannerPet}
          bookingForm={bookingForm}
          setShowRoomPlanner={setShowRoomPlanner}
          setRoomPlannerPet={setRoomPlannerPet}
          setBookingForm={setBookingForm}
        />\n      </div>
    );
  }

  // Overview Page
  if (currentPage === 'overview') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-y-auto overflow-x-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 pb-20">
          <div className="mb-6">
            <h1 className="text-2xl font-serif font-semibold text-[#0A1128]">Overview</h1>
            <p className="text-sm text-[#0A1128]/60">Dashboard metrics & activity</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/80 text-white">
              <CardContent className="p-4">
                <div className="text-sm opacity-90 mb-1">Today</div>
                <div className="text-3xl font-bold">{arrivals.length}</div>
                <div className="text-xs opacity-75">Arrivals</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#C46A3A] to-[#C46A3A]/80 text-white">
              <CardContent className="p-4">
                <div className="text-sm opacity-90 mb-1">Today</div>
                <div className="text-3xl font-bold">{departures.length}</div>
                <div className="text-xs opacity-75">Departures</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Card */}
          <Card className="bg-gradient-to-br from-[#C46A3A] to-[#C46A3A]/80 text-white mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-lg">
                <DollarSign className="w-5 h-5" />
                This Week's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">$2,450</div>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <TrendingUp className="w-4 h-4" />
                <span>+12% from last week</span>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Current Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-[#0A1128]/60">Rooms Occupied</span>
                    <span className="font-semibold text-[#0A1128]">15/20 (75%)</span>
                  </div>
                  <div className="w-full bg-[#0A1128]/10 rounded-full h-3">
                    <div className="bg-[#C46A3A] h-3 rounded-full transition-all" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div>
                    <div className="text-2xl font-bold text-[#0A1128]">15</div>
                    <div className="text-sm text-[#0A1128]/60">Occupied</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#7DAF7B]">5</div>
                    <div className="text-sm text-[#0A1128]/60">Available</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#F8F7F5]">
                <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#C46A3A]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">New booking confirmed</div>
                  <div className="text-xs text-[#0A1128]/60">Whiskers - Room 3</div>
                </div>
                <div className="text-xs text-[#0A1128]/40">5m ago</div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#F8F7F5]">
                <div className="w-10 h-10 rounded-full bg-[#0A1128]/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-[#0A1128]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">Payment received</div>
                  <div className="text-xs text-[#0A1128]/60">Luna & Shadow - $280</div>
                </div>
                <div className="text-xs text-[#0A1128]/40">1h ago</div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-[#F8F7F5]">
                <div className="w-10 h-10 rounded-full bg-[#7DAF7B]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#7DAF7B]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">Check-out completed</div>
                  <div className="text-xs text-[#0A1128]/60">Max - Room 3</div>
                </div>
                <div className="text-xs text-[#0A1128]/40">2h ago</div>
              </div>
              <div className="pt-3 border-t">
                <Button variant="ghost" className="w-full text-sm text-[#C46A3A] hover:text-[#C46A3A]/80">
                  View All Activity →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Insights Section */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#C46A3A]" />
                Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-transparent border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">
                    Your occupancy is up 12% this month
                  </div>
                  <div className="text-xs text-[#0A1128]/60 mt-1">
                    Great work! Keep it up.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-transparent border border-orange-100">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">
                    You have 3 unpaid bookings
                  </div>
                  <div className="text-xs text-[#0A1128]/60 mt-1">
                    Follow up to secure payments.
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-transparent border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#0A1128]">
                    Weekend bookings are your busiest period
                  </div>
                  <div className="text-xs text-[#0A1128]/60 mt-1">
                    Consider weekend pricing adjustments.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade/Monetization Section */}
          <Card className="mt-4 mb-6 bg-gradient-to-br from-[#C46A3A]/10 via-[#C46A3A]/5 to-transparent border-[#C46A3A]/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C46A3A]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0A1128] mb-1">
                    Grow your business
                  </h3>
                  <p className="text-sm text-[#0A1128]/70 mb-4">
                    Unlock automated reminders, advanced reporting, and more premium features
                  </p>
                  <Button 
                    className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={() => navigate('/upsell')}
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calendar Page
  if (currentPage === 'calendar') {
    const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    // Enhanced booking data with full details
    const calendarBookings = [
      { id: 1, petName: 'Oliver', ownerName: 'Sarah Johnson', room: 'Deluxe Suite 1', checkIn: new Date(2026, 1, 10), checkOut: new Date(2026, 1, 18), status: 'confirmed', amount: 450, phone: '021 123 4567', notes: 'Needs medication twice daily' },
      { id: 2, petName: 'Simba', ownerName: 'Emma Wilson', room: 'Deluxe Suite 2', checkIn: new Date(2026, 1, 12), checkOut: new Date(2026, 1, 18), status: 'confirmed', amount: 420, phone: '021 345 6789' },
      { id: 3, petName: 'Bella', ownerName: 'Lisa Anderson', room: 'Deluxe Suite 3', checkIn: new Date(2026, 1, 15), checkOut: new Date(2026, 1, 20), status: 'checked-in', amount: 440, phone: '021 567 8901', notes: 'Shy at first, needs quiet space' },
      { id: 4, petName: 'Charlie', ownerName: 'Mike Davis', room: 'Standard Room 2', checkIn: new Date(2026, 1, 17), checkOut: new Date(2026, 1, 22), status: 'confirmed', amount: 350, phone: '021 678 9012' },
      { id: 5, petName: 'Luna', ownerName: 'Rachel Green', room: 'Deluxe Suite 4', checkIn: new Date(2026, 1, 20), checkOut: new Date(2026, 1, 25), status: 'confirmed', amount: 280, phone: '021 789 0123' },
      { id: 6, petName: 'Milo', ownerName: 'James Brown', room: 'Standard Room 3', checkIn: new Date(2026, 1, 22), checkOut: new Date(2026, 1, 27), status: 'confirmed', amount: 320, phone: '021 890 1234' }
    ];

    const getBookingType = (booking: typeof calendarBookings[0], date: Date) => {
      if (isSameDay(booking.checkIn, date)) return 'arrival';
      if (isSameDay(booking.checkOut, date)) return 'departure';
      return 'staying';
    };

    const getBookingsForDay = (date: Date) => {
      return calendarBookings.filter(booking => date >= booking.checkIn && date <= booking.checkOut);
    };

    const bookings: Record<number, any[]> = {
      10: [{ cat: 'Oliver', type: 'arrival' }],
      12: [{ cat: 'Simba', type: 'arrival' }],
      15: [{ cat: 'Bella', type: 'arrival' }],
      17: [{ cat: 'Charlie', type: 'departure' }],
      18: [{ cat: 'Oliver', type: 'departure' }],
      20: [{ cat: 'Luna', type: 'arrival' }],
      22: [{ cat: 'Milo', type: 'arrival' }],
    };

    return (
      <>
        <div 
          className="h-full bg-[#F8F7F5] relative w-full overflow-y-auto overflow-x-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          <Header />
          <MenuOverlay />

          <div className="w-full px-5 py-4 pb-20">
            {/* Page Title */}
            <div className="mb-4">
              <h1 className="text-2xl font-serif font-semibold text-[#0A1128]">Calendar</h1>
              <p className="text-sm text-[#0A1128]/60">Click on any day to view bookings</p>
            </div>

            {/* Month Selector */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between mb-4">
              <button type="button" onClick={handlePreviousMonth} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
                <ChevronLeft className="w-5 h-5 text-[#0A1128]" />
              </button>
              <div className="text-center">
                <div className="text-xl font-bold text-[#0A1128]">{format(currentMonth, 'MMMM yyyy')}</div>
              </div>
              <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
                <ChevronRight className="w-5 h-5 text-[#0A1128]" />
              </button>
            </div>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`weekday-${index}`} className="text-center text-xs font-semibold text-[#0A1128]/60 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) }).map((day) => {
                    const dayNum = day.getDate();
                    const dayBookings = getBookingsForDay(day);
                    const hasArrivals = dayBookings.some(b => getBookingType(b, day) === 'arrival');
                    const hasDepartures = dayBookings.some(b => getBookingType(b, day) === 'departure');
                    
                    return (
                      <button
                        type="button"
                        key={day.toString()}
                        onClick={() => dayBookings.length > 0 && setCalendarSelectedDate(day)}
                        className={`aspect-square p-1 rounded-lg border transition-all ${
                          isToday(day)
                            ? 'bg-[#C46A3A] text-white border-[#C46A3A]'
                            : isSameMonth(day, currentMonth)
                            ? 'bg-white border-[#0A1128]/10 hover:border-[#C46A3A]/30 hover:bg-[#F8F7F5]'
                            : 'bg-[#F8F7F5] border-transparent text-[#0A1128]/30'
                        } ${dayBookings.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className="text-xs font-medium text-center">{dayNum}</div>
                        {dayBookings.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 justify-center">
                            {hasArrivals && <div className="w-1 h-1 rounded-full bg-green-500"></div>}
                            {hasDepartures && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[#0A1128]/60">Arrivals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[#0A1128]/60">Departures</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Day View Sheet */}
        {calendarSelectedDate && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setCalendarSelectedDate(null)}
          >
            <div 
              className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1128]">{format(calendarSelectedDate, 'EEEE, MMMM d, yyyy')}</h3>
                    <p className="text-sm text-[#0A1128]/60">{getBookingsForDay(calendarSelectedDate).length} booking(s) for this day</p>
                  </div>
                  <button type="button" onClick={() => setCalendarSelectedDate(null)} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
                    <X className="w-5 h-5 text-[#0A1128]" />
                  </button>
                </div>
                <div className="space-y-3">
                  {getBookingsForDay(calendarSelectedDate).map((booking) => {
                    const type = getBookingType(booking, calendarSelectedDate);
                    return (
                      <button type="button" key={booking.id} onClick={() => setCalendarSelectedBooking(booking)} className="w-full text-left">
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-[#0A1128]">{booking.petName}</div>
                                <div className="text-sm text-[#0A1128]/60">{booking.ownerName}</div>
                              </div>
                              <Badge className={type === 'arrival' ? 'bg-green-100 text-green-700 border-0' : type === 'departure' ? 'bg-blue-100 text-blue-700 border-0' : 'bg-[#0A1128]/10 text-[#0A1128] border-0'}>
                                {type === 'arrival' ? '→ Check-in' : type === 'departure' ? '← Check-out' : 'Staying'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-[#0A1128]/60">
                              <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span>{booking.room}</span></div>
                              <div className="flex items-center gap-2"><CalendarIcon className="w-3 h-3" /><span>{format(booking.checkIn, 'MMM d')} - {format(booking.checkOut, 'MMM d')}</span></div>
                              <div className="flex items-center gap-2"><DollarSign className="w-3 h-3" /><span>${booking.amount}</span></div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Sheet */}
        {calendarSelectedBooking && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={() => setCalendarSelectedBooking(null)}>
            <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[#0A1128]">Booking Details</h3>
                  <button type="button" onClick={() => setCalendarSelectedBooking(null)} className="p-2 hover:bg-[#0A1128]/5 rounded-lg">
                    <X className="w-5 h-5 text-[#0A1128]" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-[#0A1128]/60 block mb-1">Pet Name</label><div className="font-medium text-[#0A1128]">{calendarSelectedBooking.petName}</div></div>
                    <div><label className="text-xs text-[#0A1128]/60 block mb-1">Owner</label><div className="font-medium text-[#0A1128]">{calendarSelectedBooking.ownerName}</div></div>
                  </div>
                  <div><label className="text-xs text-[#0A1128]/60 block mb-1">Phone</label><div className="font-medium text-[#0A1128]">{calendarSelectedBooking.phone}</div></div>
                  <div><label className="text-xs text-[#0A1128]/60 block mb-1">Room</label><div className="font-medium text-[#0A1128]">{calendarSelectedBooking.room}</div></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-[#0A1128]/60 block mb-1">Check-in</label><div className="font-medium text-[#0A1128]">{format(calendarSelectedBooking.checkIn, 'MMM d, yyyy')}</div></div>
                    <div><label className="text-xs text-[#0A1128]/60 block mb-1">Check-out</label><div className="font-medium text-[#0A1128]">{format(calendarSelectedBooking.checkOut, 'MMM d, yyyy')}</div></div>
                  </div>
                  <div><label className="text-xs text-[#0A1128]/60 block mb-1">Total Amount</label><div className="text-2xl font-bold text-[#0A1128]">${calendarSelectedBooking.amount}</div></div>
                  <div><label className="text-xs text-[#0A1128]/60 block mb-1">Status</label><Badge className={calendarSelectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-700 border-0' : calendarSelectedBooking.status === 'checked-in' ? 'bg-blue-100 text-blue-700 border-0' : 'bg-yellow-100 text-yellow-700 border-0'}>{calendarSelectedBooking.status === 'checked-in' ? 'Checked In' : calendarSelectedBooking.status.charAt(0).toUpperCase() + calendarSelectedBooking.status.slice(1)}</Badge></div>
                  {calendarSelectedBooking.notes && (<div><label className="text-xs text-[#0A1128]/60 block mb-1">Notes</label><div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-[#0A1128]">{calendarSelectedBooking.notes}</div></div>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Bookings Page
  if (currentPage === 'bookings') {
    const defaultBookings = [
      { id: 1, catName: "Whiskers", ownerName: "Sarah Johnson", checkIn: "Mar 20", checkOut: "Mar 25", room: "3", status: "confirmed", amount: "$150", date: new Date('2024-03-20') },
      { id: 2, catName: "Luna & Shadow", ownerName: "Mike Chen", checkIn: "Mar 22", checkOut: "Mar 28", room: "7", status: "confirmed", amount: "$280", date: new Date('2024-03-22') },
      { id: 3, catName: "Mittens", ownerName: "Emma Wilson", checkIn: "Mar 24", checkOut: "Mar 30", room: "12", status: "pending", amount: "$180", date: new Date('2024-03-24') },
      { id: 4, catName: "Oliver", ownerName: "James Brown", checkIn: "Mar 25", checkOut: "Mar 29", room: "5", status: "confirmed", amount: "$120", date: new Date('2024-03-25') },
      { id: 5, catName: "Bella", ownerName: "Lisa Anderson", checkIn: "Mar 26", checkOut: "Apr 2", room: "9", status: "confirmed", amount: "$210", date: new Date('2024-03-26') },
      { id: 6, catName: "Simba", ownerName: "Tom Davis", checkIn: "Mar 18", checkOut: "Mar 23", room: "8", status: "confirmed", amount: "$150", date: new Date('2024-03-18') },
      { id: 7, catName: "Cleo", ownerName: "Anna White", checkIn: "Mar 19", checkOut: "Mar 26", room: "4", status: "pending", amount: "$210", date: new Date('2024-03-19') },
      { id: 8, catName: "Felix", ownerName: "Mark Lee", checkIn: "Mar 21", checkOut: "Mar 27", room: "15", status: "confirmed", amount: "$180", date: new Date('2024-03-21') },
    ];

    // Combine user-created bookings with default bookings
    const allBookings = [...bookings, ...defaultBookings];

    // Apply sorting
    const sortedBookings = [...allBookings].sort((a, b) => {
      let comparison = 0;
      
      if (bookingsSortBy === 'arrival') {
        const dateA = new Date(a.checkIn);
        const dateB = new Date(b.checkIn);
        comparison = dateA.getTime() - dateB.getTime();
      } else if (bookingsSortBy === 'departure') {
        const dateA = new Date(a.checkOut);
        const dateB = new Date(b.checkOut);
        comparison = dateA.getTime() - dateB.getTime();
      } else { // 'received'
        comparison = a.date.getTime() - b.date.getTime();
      }
      
      return bookingsSortDirection === 'asc' ? comparison : -comparison;
    });
    
    const latestBookings = sortedBookings.slice(0, 5);
    const displayBookings = bookingsTab === 'latest' ? latestBookings : sortedBookings;

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-serif font-semibold text-[#0A1128]">Bookings</h1>
            <p className="text-sm text-[#0A1128]/60">Manage all reservations</p>
          </div>

          {/* New Booking Button */}
          <Button 
            type="button"
            className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white rounded-md text-base font-semibold px-3 py-4 mb-4"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNewBookingDrawer(true);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Booking
          </Button>

          {/* Tab Switcher */}
          <div className="flex gap-2 bg-white rounded-lg p-1 mb-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBookingsTab('latest');
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                bookingsTab === 'latest'
                  ? 'bg-[#0A1128] text-white'
                  : 'text-[#0A1128]/60 hover:text-[#0A1128]'
              }`}
            >
              Latest Bookings
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBookingsTab('all');
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                bookingsTab === 'all'
                  ? 'bg-[#0A1128] text-white'
                  : 'text-[#0A1128]/60 hover:text-[#0A1128]'
              }`}
            >
              All Bookings
            </button>
          </div>

          {/* Sorting Controls */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-[#0A1128]/60">Sort by:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (bookingsSortBy === 'arrival') {
                    setBookingsSortDirection(bookingsSortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setBookingsSortBy('arrival');
                    setBookingsSortDirection('asc');
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  bookingsSortBy === 'arrival'
                    ? 'bg-[#C46A3A] text-white'
                    : 'bg-white text-[#0A1128]/60 hover:bg-[#0A1128]/5'
                }`}
              >
                Arrival
                {bookingsSortBy === 'arrival' && (
                  bookingsSortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (bookingsSortBy === 'departure') {
                    setBookingsSortDirection(bookingsSortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setBookingsSortBy('departure');
                    setBookingsSortDirection('asc');
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  bookingsSortBy === 'departure'
                    ? 'bg-[#C46A3A] text-white'
                    : 'bg-white text-[#0A1128]/60 hover:bg-[#0A1128]/5'
                }`}
              >
                Departure
                {bookingsSortBy === 'departure' && (
                  bookingsSortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (bookingsSortBy === 'received') {
                    setBookingsSortDirection(bookingsSortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setBookingsSortBy('received');
                    setBookingsSortDirection('desc');
                  }
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  bookingsSortBy === 'received'
                    ? 'bg-[#C46A3A] text-white'
                    : 'bg-white text-[#0A1128]/60 hover:bg-[#0A1128]/5'
                }`}
              >
                Received
                {bookingsSortBy === 'received' && (
                  bookingsSortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-3">
            {displayBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedBooking({
                    ...booking,
                    ownerName: booking.ownerName,
                    email: `${booking.ownerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                    phone: '021 123 4567',
                    time: '9:15am',
                    diet: 'Premium dry food, twice daily',
                    specialNeeds: booking.catName + ' loves treats',
                    paymentStatus: booking.status === 'confirmed' ? 'paid' : 'deposit'
                  });
                  setDrawerHeight(75);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[#0A1128]">{booking.catName}</div>
                      <div className="text-sm text-[#0A1128]/60">{booking.ownerName}</div>
                    </div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[#0A1128]/60">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{booking.checkIn} - {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0A1128]/60">
                      <Home className="w-3.5 h-3.5" />
                      <span>Room {booking.room}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center justify-between">
                    <span className="font-semibold text-[#0A1128]">{booking.amount}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#C46A3A]"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedBooking({
                          ...booking,
                          ownerName: booking.ownerName,
                          email: `${booking.ownerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                          phone: '021 123 4567',
                          time: '9:15am',
                          diet: 'Premium dry food, twice daily',
                          specialNeeds: booking.catName + ' loves treats',
                          paymentStatus: booking.status === 'confirmed' ? 'paid' : 'deposit'
                        });
                        setDrawerHeight(75);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Reuse BookingDetailModal globally */}
        {BookingDetailModal()}
      </div>
    );
  }

  // Room Planner Page
  if (currentPage === 'room-planner') {
    const rooms = Array.from({ length: 20 }, (_, i) => ({
      number: i + 1,
      type: i < 5 ? 'Private' : i < 12 ? 'Indoor' : 'Communal',
      status: i % 3 === 0 ? 'occupied' : i % 4 === 0 ? 'cleaning' : 'available'
    }));

    const dates = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'];

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Room Planner</h2>
            <p className="text-sm text-[#0A1128]/60">Visual room allocation grid</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-240px)]">
                <div className="inline-block min-w-full">
                  {/* Header Row with Dates */}
                  <div className="sticky top-0 bg-white z-10 border-b border-[#0A1128]/10">
                    <div className="flex">
                      <div className="w-32 flex-shrink-0 px-4 py-3 font-semibold text-xs text-[#0A1128] border-r border-[#0A1128]/10">
                        Room
                      </div>
                      <div className="flex flex-1" style={{ minWidth: `${dates.length * 120}px` }}>
                        {dates.map((date, idx) => (
                          <div 
                            key={`date-header-${idx}`} 
                            className="flex-1 min-w-[120px] text-center px-2 py-3 text-xs font-semibold text-[#0A1128]/60 border-r border-[#0A1128]/5"
                          >
                            <div>{date.split(' ')[0]}</div>
                            <div className="text-[#0A1128]/80">{date.split(' ')[1]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Room Rows with Booking Bars */}
                  {rooms.slice(0, 17).map((room) => {
                    // Sample bookings - different for each room
                    const getBookingsForRoom = (roomNum) => {
                      const allBookings = [
                        { roomNumber: 1, customerName: 'Carol Evans', catName: 'Memee', startDay: 0, duration: 4, color: '#7DAF7B' },
                        { roomNumber: 2, customerName: 'Kate McDonald', catName: 'Orla', startDay: 1, duration: 3, color: '#5B9BD5' },
                        { roomNumber: 3, customerName: 'Tanya Hodgson', catName: 'Silas & Sylvie', startDay: 0, duration: 4, color: '#5B9BD5' },
                        { roomNumber: 4, customerName: 'Geoff Copstick', catName: 'Mr Bingley', startDay: 3, duration: 3, color: '#7DAF7B' },
                        { roomNumber: 5, customerName: 'Jacki Jensen', catName: 'Bruno', startDay: 4, duration: 3, color: '#7DAF7B' },
                        { roomNumber: 6, customerName: 'Bonnie Clark', catName: '', startDay: 1, duration: 2, color: '#7DAF7B' },
                        { roomNumber: 7, customerName: '', catName: 'Note: 8am Sunday', startDay: 0, duration: 7, color: '#E8B4B8' },
                        { roomNumber: 8, customerName: 'Nicolas Novikov', catName: 'Dave', startDay: 0, duration: 5, color: '#5B9BD5' },
                        { roomNumber: 9, customerName: 'Gabriela McDonald', catName: '', startDay: 0, duration: 1, color: '#7DAF7B' },
                        { roomNumber: 10, customerName: 'Jacquiline', catName: 'Coco', startDay: 4, duration: 3, color: '#5B9BD5' },
                        { roomNumber: 11, customerName: 'Paul Cohen', catName: 'Theo', startDay: 2, duration: 5, color: '#5B9BD5' },
                        { roomNumber: 12, customerName: 'Sharie', catName: 'Lelo', startDay: 4, duration: 3, color: '#5B9BD5' },
                        { roomNumber: 13, customerName: 'Jacquiline', catName: 'Pippie', startDay: 4, duration: 3, color: '#5B9BD5' },
                        { roomNumber: 14, customerName: 'Carley Field', catName: 'Persi', startDay: 4, duration: 6, color: '#5B9BD5' },
                        { roomNumber: 15, customerName: 'Helen Taylor', catName: 'Baby', startDay: 5, duration: 2, color: '#5B9BD5' },
                        { roomNumber: 16, customerName: 'Paddles', catName: '', startDay: 5, duration: 2, color: '#5B9BD5' },
                        { roomNumber: 17, customerName: 'Paws Jones', catName: '', startDay: 5, duration: 2, color: '#5B9BD5' },
                      ];
                      return allBookings.filter(b => b.roomNumber === roomNum);
                    };
                    
                    const roomBookings = getBookingsForRoom(room.number);
                    
                    return (
                      <div key={room.number} className="border-b border-[#0A1128]/5 hover:bg-[#0A1128]/[0.02] transition-colors">
                        <div className="flex relative" style={{ minHeight: '56px' }}>
                          {/* Room Label */}
                          <div className="w-32 flex-shrink-0 px-4 py-3 flex items-center border-r border-[#0A1128]/10">
                            <div className="text-xs">
                              <div className="font-medium text-[#0A1128]">R{room.number}</div>
                              <div className="text-[10px] text-[#0A1128]/40">{room.type}</div>
                            </div>
                          </div>
                          
                          {/* Timeline Grid */}
                          <div className="flex flex-1 relative" style={{ minWidth: `${dates.length * 120}px` }}>
                            {/* Background grid cells */}
                            {dates.map((date, idx) => (
                              <div 
                                key={`grid-${room.number}-${idx}`}
                                className="flex-1 min-w-[120px] border-r border-[#0A1128]/5"
                              />
                            ))}
                            
                            {/* Booking Bars (absolutely positioned overlay) */}
                            <div className="absolute inset-0 flex items-center px-1 py-2">
                              {roomBookings.map((booking, idx) => {
                                const leftPercent = (booking.startDay / dates.length) * 100;
                                const widthPercent = (booking.duration / dates.length) * 100;
                                
                                return (
                                  <div
                                    key={`booking-${room.number}-${idx}`}
                                    className="absolute rounded-md px-2 py-1.5 cursor-pointer hover:opacity-90 hover:shadow-md transition-all shadow-sm"
                                    style={{
                                      left: `${leftPercent}%`,
                                      width: `${widthPercent}%`,
                                      backgroundColor: booking.color,
                                      minHeight: '36px'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBooking({
                                        ...booking,
                                        room: room.number,
                                        checkIn: dates[booking.startDay],
                                        checkOut: dates[Math.min(booking.startDay + booking.duration, dates.length - 1)],
                                        ownerName: booking.customerName,
                                        email: `${booking.customerName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                                        phone: '021 123 4567',
                                        time: '9:15am',
                                        diet: 'Premium dry food, twice daily',
                                        specialNeeds: booking.catName ? `${booking.catName} loves treats` : 'None',
                                        paymentStatus: booking.color === '#7DAF7B' ? 'paid' : booking.color === '#5B9BD5' ? 'deposit' : 'unpaid'
                                      });
                                      setDrawerHeight(75);
                                    }}
                                    title={`Click to view details - ${booking.customerName}${booking.catName ? ' - ' + booking.catName : ''}`}
                                  >
                                    <div className="text-white text-[10px] font-medium leading-tight truncate">
                                      {booking.catName && (
                                        <div className="truncate">{booking.catName}</div>
                                      )}
                                      {booking.customerName && (
                                        <div className="truncate opacity-90">{booking.customerName}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-3 border-t text-xs bg-[#F8F7F5]/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5B9BD5' }}></div>
                  <span className="text-[#0A1128]/60">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7DAF7B' }}></div>
                  <span className="text-[#0A1128]/60">Checked In</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E8B4B8' }}></div>
                  <span className="text-[#0A1128]/60">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reuse BookingDetailModal globally */}
        {BookingDetailModal()}

      </div>
    );
  }

  // Customers Page
  if (currentPage === 'customers') {
    const customers = [
      { id: 1, name: "Sarah Johnson", email: "sarah@email.com", phone: "021 123 4567", cats: ["Whiskers", "Luna"], bookings: 8 },
      { id: 2, name: "Mike Chen", email: "mike@email.com", phone: "021 234 5678", cats: ["Shadow"], bookings: 12 },
      { id: 3, name: "Emma Wilson", email: "emma@email.com", phone: "021 345 6789", cats: ["Milo", "Oscar"], bookings: 5 },
      { id: 4, name: "James Brown", email: "james@email.com", phone: "021 456 7890", cats: ["Oliver"], bookings: 3 },
      { id: 5, name: "Lisa Anderson", email: "lisa@email.com", phone: "021 567 8901", cats: ["Bella"], bookings: 15 },
    ];

    // Live search filter
    const filteredCustomers = customers.filter((customer) => {
      const searchLower = customerSearch.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower) ||
        customer.cats.some((cat) => cat.toLowerCase().includes(searchLower))
      );
    });

    const handleAddCustomer = () => {
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        catNames: '',
        notes: ''
      });
      setEditingCustomer(null);
      setShowCustomerDrawer(true);
    };

    const handleEditCustomer = (customer: any, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCustomerFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        catNames: customer.cats.join(', '),
        notes: ''
      });
      setEditingCustomer(customer);
      setShowCustomerDrawer(true);
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />
        <CustomerDrawer />

        <div className="w-full px-5 py-4">
          <div className="mb-4">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Customers</h2>
            <p className="text-sm text-[#0A1128]/60">Manage customer contacts</p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A1128]/40" />
              <Input 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers..." 
                className="pl-9 bg-white border-[#0A1128]/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#0A1128]/60">
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
                {customerSearch && ` matching "${customerSearch}"`}
              </p>
            </div>
            <Button 
              size="sm" 
              className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
              onClick={handleAddCustomer}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-[#0A1128]/40 mb-2">No customers found</div>
                <p className="text-sm text-[#0A1128]/60">
                  {customerSearch ? 'Try a different search term' : 'Add your first customer to get started'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <Card 
                  key={customer.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={(e) => handleEditCustomer(customer, e)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A1128]">{customer.name}</div>
                        <div className="text-sm text-[#0A1128]/60">{customer.email}</div>
                        <div className="text-sm text-[#0A1128]/60">{customer.phone}</div>
                      </div>
                      <Badge variant="secondary">{customer.bookings} bookings</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-[#0A1128]/50">Cats:</span>
                      <span className="text-[#0A1128]">{customer.cats.join(', ')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Templates Page
  if (currentPage === 'templates') {
    const templates = [
      { id: 1, name: "Booking Confirmation", type: "Email", trigger: "New booking created", sent: 45, icon: CheckCircle, status: 'active' },
      { id: 2, name: "Check-in Reminder", type: "SMS", trigger: "1 day before check-in", sent: 38, icon: Bell, status: 'active' },
      { id: 3, name: "Deposit Payment Request", type: "Email", trigger: "Manual send", sent: 22, icon: CreditCard, status: 'active' },
      { id: 4, name: "Thank You Message", type: "Email", trigger: "After check-out", sent: 40, icon: Heart, status: 'active' },
      { id: 5, name: "Balance Due Reminder", type: "Email", trigger: "3 days before check-in", sent: 18, icon: AlertCircle, status: 'active' },
      { id: 6, name: "Photo Update Notification", type: "SMS", trigger: "Manual send", sent: 0, icon: Camera, status: 'draft' },
    ];

    const handleEditTemplate = (template: any) => {
      setEditingTemplate(template);
      setTemplateContent(getTemplateContent(template.name));
      setShowTemplateEditor(true);
    };

    const handlePreviewTemplate = (template: any) => {
      setEditingTemplate(template);
      setShowTemplatePreview(true);
    };

    const handleTestMessage = (template: any) => {
      setEditingTemplate(template);
      setShowTestTemplate(true);
    };

    const handleNewTemplate = () => {
      setNewTemplateForm({
        name: '',
        type: 'Email',
        trigger: '',
        content: ''
      });
      setShowNewTemplate(true);
    };

    const handleSaveTemplate = () => {
      alert(`Template "${editingTemplate?.name}" saved successfully!`);
      setShowTemplateEditor(false);
    };

    const handleSendTest = () => {
      const testType = editingTemplate?.type === 'Email' ? 'email' : 'SMS';
      const testDestination = testType === 'email' ? testEmail : testPhone;
      alert(`✅ Test ${testType} sent to ${testDestination}!`);
      setShowTestTemplate(false);
      setTestEmail('');
      setTestPhone('');
    };

    const handleCreateTemplate = () => {
      alert(`New template "${newTemplateForm.name}" created successfully!`);
      setShowNewTemplate(false);
    };

    const getTemplateContent = (name: string) => {
      const contents: Record<string, string> = {
        "Booking Confirmation": "Hi {{customer_name}}, your booking for {{pet_name}} has been confirmed! Check-in: {{check_in_date}}. We can't wait to meet {{pet_name}}! 🐱",
        "Check-in Reminder": "Reminder: {{pet_name}}'s stay starts tomorrow at {{check_in_time}}. See you soon! 😊",
        "Deposit Payment Request": "Hi {{customer_name}}, please pay the deposit of {{deposit_amount}} to confirm your booking. {{payment_link}}",
        "Thank You Message": "Thank you for choosing us! We hope {{pet_name}} had a wonderful stay. We'd love to see you again! 💛",
        "Balance Due Reminder": "Hi {{customer_name}}, your balance of {{balance_amount}} is due. Please pay before check-in. {{payment_link}}",
        "Photo Update Notification": "We just posted a new photo of {{pet_name}}! Check it out: {{photo_link}} 📸"
      };
      return contents[name] || "";
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Message Templates</h2>
            <p className="text-sm text-[#0A1128]/60">Automated SMS & email messages</p>
          </div>

          {/* Status Card */}
          <Card className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Automation Active</h3>
                  <p className="text-sm opacity-90">5 templates running</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold">163</div>
              <div className="text-sm opacity-90">Messages sent this month</div>
            </CardContent>
          </Card>

          {/* Message Templates */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Email & SMS Templates</CardTitle>
              <Button 
                size="sm" 
                className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                onClick={handleNewTemplate}
              >
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTemplate(isSelected ? null : template.id);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                        : 'border-[#0A1128]/10 bg-white hover:border-[#C46A3A]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#C46A3A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[#0A1128] mb-1">{template.name}</div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {template.type === 'Email' ? <Mail className="w-3 h-3 mr-1 inline" /> : <MessageSquare className="w-3 h-3 mr-1 inline" />}
                              {template.type}
                            </Badge>
                            <Badge variant={template.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {template.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-[#0A1128]/60">
                            <Zap className="w-3.5 h-3.5 inline mr-1" />
                            {template.trigger}
                          </div>
                          <div className="text-xs text-[#0A1128]/40 mt-1">{template.sent} sent</div>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTemplate(template);
                            }}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Content
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTemplate(template);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestMessage(template);
                          }}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send Test {template.type}
                        </Button>
                        <div className="p-3 bg-[#F8F7F5] rounded-lg">
                          <div className="text-xs font-semibold text-[#0A1128]/60 mb-2">Template Preview</div>
                          <div className="text-sm text-[#0A1128]">
                            {getTemplateContent(template.name)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Template Variables Help */}
          <Card className="mb-20 bg-gradient-to-br from-[#0A1128]/5 to-[#C46A3A]/5 border-[#0A1128]/10">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-[#C46A3A] mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#0A1128] mb-2">Available Variables</h4>
                  <div className="text-sm text-[#0A1128]/70 space-y-1">
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{customer_name}}`}</code> Customer's name</p>
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{pet_name}}`}</code> Cat's name</p>
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{check_in_date}}`}</code> Check-in date</p>
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{total_amount}}`}</code> Total booking amount</p>
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{deposit_amount}}`}</code> Deposit amount</p>
                    <p><code className="bg-white px-2 py-0.5 rounded text-xs">{`{{payment_link}}`}</code> Secure payment link</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Editor Drawer */}
        {showTemplateEditor && editingTemplate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowTemplateEditor(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Edit Template</h3>
                  <p className="text-sm text-[#0A1128]/60">{editingTemplate.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTemplateEditor(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Template Name</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                    readOnly
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Message Content</label>
                  <textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] font-mono text-sm"
                    placeholder="Enter your message content..."
                  />
                  <p className="text-xs text-[#0A1128]/60 mt-2">
                    Use variables like {`{{customer_name}}`}, {`{{pet_name}}`}, {`{{check_in_date}}`}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={handleSaveTemplate}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTemplateEditor(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Preview Drawer */}
        {showTemplatePreview && editingTemplate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowTemplatePreview(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Preview Template</h3>
                  <p className="text-sm text-[#0A1128]/60">{editingTemplate.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTemplatePreview(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-[#F8F7F5] rounded-lg p-4 border-l-4 border-[#C46A3A]">
                  <div className="flex items-center gap-2 mb-3">
                    {editingTemplate.type === 'Email' ? (
                      <Mail className="w-5 h-5 text-[#C46A3A]" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-[#C46A3A]" />
                    )}
                    <span className="font-semibold text-[#0A1128]">{editingTemplate.type} Preview</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-[#0A1128] whitespace-pre-wrap">
                      {getTemplateContent(editingTemplate.name)
                        .replace(/\{\{customer_name\}\}/g, 'Sarah Johnson')
                        .replace(/\{\{pet_name\}\}/g, 'Whiskers')
                        .replace(/\{\{check_in_date\}\}/g, 'March 20, 2026')
                        .replace(/\{\{check_in_time\}\}/g, '2:00 PM')
                        .replace(/\{\{deposit_amount\}\}/g, '$75')
                        .replace(/\{\{balance_amount\}\}/g, '$150')
                        .replace(/\{\{total_amount\}\}/g, '$225')
                        .replace(/\{\{payment_link\}\}/g, 'https://catstays.app/pay/abc123')
                        .replace(/\{\{photo_link\}\}/g, 'https://catstays.app/photos/xyz789')}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-semibold mb-1">Sample Data Used:</p>
                      <p>• Customer: Sarah Johnson</p>
                      <p>• Cat: Whiskers</p>
                      <p>• Check-in: March 20, 2026</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => setShowTemplatePreview(false)}
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Test Template Drawer */}
        {showTestTemplate && editingTemplate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowTestTemplate(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Send Test {editingTemplate.type}</h3>
                  <p className="text-sm text-[#0A1128]/60">{editingTemplate.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTestTemplate(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-[#C46A3A]/10 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Send className="w-5 h-5 text-[#C46A3A] mt-0.5" />
                    <div className="text-sm text-[#0A1128]">
                      <p className="font-semibold mb-1">Test your template</p>
                      <p className="text-[#0A1128]/70">
                        {editingTemplate.type === 'Email' 
                          ? 'Enter your email address to receive a test email with sample data.' 
                          : 'Enter your phone number to receive a test SMS with sample data.'}
                      </p>
                    </div>
                  </div>
                </div>

                {editingTemplate.type === 'Email' ? (
                  <div>
                    <label className="text-sm font-medium text-[#0A1128] block mb-2">Email Address</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-[#0A1128] block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+64 21 123 4567"
                      className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                    />
                  </div>
                )}

                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <p className="text-xs font-semibold text-[#0A1128]/60 mb-2">Preview of test message:</p>
                  <p className="text-sm text-[#0A1128]">
                    {getTemplateContent(editingTemplate.name)
                      .replace(/\{\{customer_name\}\}/g, 'Sarah Johnson')
                      .replace(/\{\{pet_name\}\}/g, 'Whiskers')
                      .replace(/\{\{check_in_date\}\}/g, 'March 20, 2026')
                      .replace(/\{\{check_in_time\}\}/g, '2:00 PM')
                      .replace(/\{\{deposit_amount\}\}/g, '$75')
                      .replace(/\{\{balance_amount\}\}/g, '$150')
                      .replace(/\{\{total_amount\}\}/g, '$225')
                      .replace(/\{\{payment_link\}\}/g, 'https://catstays.app/pay/abc123')
                      .replace(/\{\{photo_link\}\}/g, 'https://catstays.app/photos/xyz789')}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={handleSendTest}
                    disabled={editingTemplate.type === 'Email' ? !testEmail : !testPhone}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Test {editingTemplate.type}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowTestTemplate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Template Drawer */}
        {showNewTemplate && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowNewTemplate(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Create New Template</h3>
                  <p className="text-sm text-[#0A1128]/60">Email or SMS message template</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNewTemplate(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateForm.name}
                    onChange={(e) => setNewTemplateForm({...newTemplateForm, name: e.target.value})}
                    placeholder="e.g., Birthday Greeting"
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Message Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewTemplateForm({...newTemplateForm, type: 'Email'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newTemplateForm.type === 'Email'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                          : 'border-[#0A1128]/10 bg-white'
                      }`}
                    >
                      <Mail className={`w-6 h-6 mx-auto mb-2 ${newTemplateForm.type === 'Email' ? 'text-[#C46A3A]' : 'text-[#0A1128]/40'}`} />
                      <p className="font-medium text-sm text-[#0A1128]">Email</p>
                    </button>
                    <button
                      onClick={() => setNewTemplateForm({...newTemplateForm, type: 'SMS'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newTemplateForm.type === 'SMS'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                          : 'border-[#0A1128]/10 bg-white'
                      }`}
                    >
                      <MessageSquare className={`w-6 h-6 mx-auto mb-2 ${newTemplateForm.type === 'SMS' ? 'text-[#C46A3A]' : 'text-[#0A1128]/40'}`} />
                      <p className="font-medium text-sm text-[#0A1128]">SMS</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Trigger</label>
                  <select
                    value={newTemplateForm.trigger}
                    onChange={(e) => setNewTemplateForm({...newTemplateForm, trigger: e.target.value})}
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                  >
                    <option value="">Select when to send...</option>
                    <option value="New booking created">New booking created</option>
                    <option value="1 day before check-in">1 day before check-in</option>
                    <option value="3 days before check-in">3 days before check-in</option>
                    <option value="After check-out">After check-out</option>
                    <option value="Manual send">Manual send</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Message Content</label>
                  <textarea
                    value={newTemplateForm.content}
                    onChange={(e) => setNewTemplateForm({...newTemplateForm, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] font-mono text-sm"
                    placeholder="Enter your message content..."
                  />
                  <p className="text-xs text-[#0A1128]/60 mt-2">
                    Use variables like {`{{customer_name}}`}, {`{{pet_name}}`}, {`{{check_in_date}}`}
                  </p>
                </div>

                <div className="bg-[#0A1128]/5 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-[#0A1128] mb-2">Available Variables:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{customer_name}}`}</code></p>
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{pet_name}}`}</code></p>
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{check_in_date}}`}</code></p>
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{total_amount}}`}</code></p>
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{deposit_amount}}`}</code></p>
                    <p><code className="bg-white px-2 py-0.5 rounded">{`{{payment_link}}`}</code></p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={handleCreateTemplate}
                    disabled={!newTemplateForm.name || !newTemplateForm.trigger || !newTemplateForm.content}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewTemplate(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Smart Import Page
  if (currentPage === 'smart-import') {
    const handleImportSpreadsheet = () => {
      setShowImportDrawer(true);
    };

    const handleImportCustomers = () => {
      alert('Opening customer import wizard...');
    };

    const handleImportBookings = () => {
      alert('Opening bookings import wizard...');
    };

    const handleDownloadTemplate = (type: string) => {
      alert(`Downloading ${type} template...`);
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />
        <ImportDrawer />

        <div className="w-full px-5 py-4 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Smart Import</h2>
            <p className="text-sm text-[#0A1128]/60">Import data from Excel, CSV, or existing systems</p>
          </div>

          {/* Smart Import Card */}
          <Card className="border-[#0A1128]/10 mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#C46A3A]/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#C46A3A]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-[#0A1128]">Smart Import</h3>
                  <p className="text-sm text-[#0A1128]/60">Automatically detect and map your data</p>
                </div>
              </div>
              <Button 
                className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                onClick={() => setShowImportDrawer(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </CardContent>
          </Card>

          {/* Import Options */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={handleImportSpreadsheet}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A1128]/10 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-[#C46A3A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#0A1128]">Import from Spreadsheet</h3>
                  <p className="text-sm text-[#0A1128]/60">Excel or Google Sheets</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={handleImportCustomers}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A1128]/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#C46A3A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#0A1128]">Import Customers</h3>
                  <p className="text-sm text-[#0A1128]/60">Upload contact details & cat info</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={handleImportBookings}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0A1128]/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#C46A3A]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#0A1128]">Import Bookings</h3>
                  <p className="text-sm text-[#0A1128]/60">Past & upcoming reservations</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </CardContent>
            </Card>
          </div>

          {/* Templates Section */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-[#C46A3A]" />
                Download Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => handleDownloadTemplate('Customer')}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#C46A3A]" />
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Customer Template</span>
                    <span className="text-xs text-[#0A1128]/60">Excel format (.xlsx)</span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-[#0A1128]/30" />
              </button>

              <button 
                onClick={() => handleDownloadTemplate('Booking')}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#C46A3A]" />
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Booking Template</span>
                    <span className="text-xs text-[#0A1128]/60">Excel format (.xlsx)</span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-[#0A1128]/30" />
              </button>

              <button 
                onClick={() => handleDownloadTemplate('Room')}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#C46A3A]" />
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Room Template</span>
                    <span className="text-xs text-[#0A1128]/60">Excel format (.xlsx)</span>
                  </div>
                </div>
                <Download className="w-5 h-5 text-[#0A1128]/30" />
              </button>
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Card className="mb-4 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] border-[#C46A3A]/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#C46A3A]" />
                Import Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#0A1128]/80">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <p>Download our template to ensure correct column formatting</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <p>Supported formats: Excel (.xlsx), CSV (.csv)</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <p>AI will automatically detect and map your columns</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C46A3A] mt-0.5 flex-shrink-0" />
                <p>Review and confirm all imports before finalizing</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Imports */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Recent Imports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0A1128]">Customers_2024.xlsx</div>
                    <div className="text-sm text-[#0A1128]/60">42 customers imported</div>
                  </div>
                </div>
                <div className="text-xs text-[#0A1128]/40">2 days ago</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0A1128]">Bookings_March.csv</div>
                    <div className="text-sm text-[#0A1128]/60">28 bookings imported</div>
                  </div>
                </div>
                <div className="text-xs text-[#0A1128]/40">5 days ago</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#0A1128]">Room_Setup.xlsx</div>
                    <div className="text-sm text-[#0A1128]/60">12 rooms imported</div>
                  </div>
                </div>
                <div className="text-xs text-[#0A1128]/40">1 week ago</div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Options */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#C46A3A]" />
                Connect External Systems
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => alert('Google Sheets integration coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl hover:shadow-md transition border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Google Sheets</span>
                    <span className="text-xs text-[#0A1128]/60">Sync data automatically</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>

              <button 
                onClick={() => alert('PetLinx integration coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition border border-purple-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">PetLinx</span>
                    <span className="text-xs text-[#0A1128]/60">Import from PetLinx</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>

              <button 
                onClick={() => alert('Gingr integration coming soon!')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl hover:shadow-md transition border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Gingr</span>
                    <span className="text-xs text-[#0A1128]/60">Import from Gingr</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Accounting Page
  if (currentPage === 'accounting') {
    const payments = [
      { id: 1, customer: "Sarah Johnson", catName: "Whiskers", bookingRef: "BK-2401", invoice: "INV-001", amount: 150, status: "paid", date: "Mar 15", bookingDate: "Mar 20-25", method: "Credit Card" },
      { id: 2, customer: "Mike Chen", catName: "Luna", bookingRef: "BK-2402", invoice: "INV-002", amount: 280, status: "paid", date: "Mar 16", bookingDate: "Mar 22-29", method: "Bank Transfer" },
      { id: 3, customer: "Emma Wilson", catName: "Mittens", bookingRef: "BK-2403", invoice: "INV-003", amount: 180, status: "pending", date: "Mar 17", bookingDate: "Mar 24-27", method: "Credit Card" },
      { id: 4, customer: "James Brown", catName: "Shadow", bookingRef: "BK-2404", invoice: "INV-004", amount: 120, status: "overdue", date: "Mar 10", bookingDate: "Mar 18-21", method: "Cash" },
      { id: 5, customer: "Lisa Anderson", catName: "Bella", bookingRef: "BK-2405", invoice: "INV-005", amount: 210, status: "paid", date: "Mar 18", bookingDate: "Mar 25-30", method: "Credit Card" },
    ];

    const handleViewBooking = (bookingRef: string) => {
      alert(`Opening booking ${bookingRef} details...`);
    };

    const handleExportAccounting = () => {
      alert('Exporting accounting transactions...');
    };

    const handleCreateInvoice = () => {
      alert('Creating new invoice...');
    };

    const handleViewReports = () => {
      alert('Opening financial reports...');
    };

    const filteredPayments = selectedFilter === 'all' 
      ? payments 
      : payments.filter(p => p.status === selectedFilter);

    const handleTransactionClick = (payment: any, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setSelectedTransaction(payment);
      setShowTransactionDrawer(true);
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />
        <TransactionDrawer />

        <div className="w-full px-5 py-4">
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Accounting</h2>
            <p className="text-sm text-[#0A1128]/60">Payments, invoices & financial reports</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-gradient-to-br from-[#0A1128]/90 to-[#0A1128] border-[#0A1128]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#C46A3A]" />
                  <div className="text-xs text-white/90">Paid</div>
                </div>
                <div className="text-2xl font-bold text-white">$640</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#C46A3A]/90 to-[#C46A3A] border-[#C46A3A]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-white" />
                  <div className="text-xs text-white/90">Pending</div>
                </div>
                <div className="text-2xl font-bold text-white">$300</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto my-4">
            {(['all', 'paid', 'pending', 'overdue'] as const).map((filter) => (
              <Button
                key={filter}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedFilter(filter);
                }}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                className={`capitalize ${
                  selectedFilter === filter
                    ? 'bg-[#C46A3A] hover:bg-[#C46A3A]/90'
                    : 'border-[#0A1128]/20'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>

          {/* Payments List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleExportAccounting}
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPayments.map((payment) => (
                <div 
                  key={payment.id} 
                  className="p-3 bg-[#F8F7F5] rounded-xl border border-[#0A1128]/10"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[#0A1128]">{payment.customer}</div>
                      <div className="text-sm text-[#C46A3A] font-medium mt-0.5">🐱 {payment.catName}</div>
                      <div className="text-sm text-[#0A1128]/60 mt-1">
                        {payment.bookingRef} • {payment.bookingDate}
                      </div>
                      <div className="text-xs text-[#0A1128]/40 mt-1">{payment.invoice} • {payment.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#0A1128] text-lg">${payment.amount}</div>
                      <Badge 
                        variant={
                          payment.status === 'paid' ? 'default' : 
                          payment.status === 'pending' ? 'secondary' : 
                          'destructive'
                        }
                        className={`mt-1 ${
                          payment.status === 'paid' ? 'bg-[#0A1128] hover:bg-[#0A1128]/90' : 
                          payment.status === 'pending' ? 'bg-[#C46A3A] hover:bg-[#C46A3A]/90' : ''
                        }`}
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-[#C46A3A] text-[#C46A3A] hover:bg-[#C46A3A]/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewBooking(payment.bookingRef);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View Booking Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={handleCreateInvoice}
            >
              <Receipt className="w-5 h-5 mb-1 text-[#C46A3A]" />
              <span className="text-sm">Create Invoice</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col"
              onClick={handleViewReports}
            >
              <FileText className="w-5 h-5 mb-1 text-[#C46A3A]" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Financials Page
  if (currentPage === 'financials') {
    // Mock financial data
    const currentYear = new Date().getFullYear();
    const totalRevenue = 48750;
    const totalExpenses = 18240;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);
    const gstCollected = (totalRevenue * 0.15).toFixed(0); // 15% NZ GST
    const avgBookingValue = (totalRevenue / 125).toFixed(0); // 125 bookings

    // Button handlers
    const handleAddExpense = () => {
      alert('Add Expense form would open here');
    };
    const handleExportPDF = () => {
      alert('Downloading P&L Statement as PDF...');
    };
    const handleExportCSV = () => {
      alert('Downloading P&L Statement as CSV...');
    };
    const handleDownloadTaxReport = () => {
      alert('Downloading Tax Report for your accountant...');
    };
    const handleManageStripe = () => {
      alert('Opening Stripe dashboard...');
    };
    const handleEditExpense = (expenseId: number) => {
      alert(`Editing expense #${expenseId}`);
    };
    const handleQuickReport = (reportType: string) => {
      alert(`Generating ${reportType} report...`);
    };

    const expenses = [
      { id: 1, date: 'Mar 15', category: 'Cat Food & Treats', description: 'Premium wet food bulk order', amount: 450, taxDeductible: true },
      { id: 2, date: 'Mar 12', category: 'Litter & Supplies', description: 'Clumping litter - 6 boxes', amount: 180, taxDeductible: true },
      { id: 3, date: 'Mar 10', category: 'Veterinary', description: 'Health check & vaccinations', amount: 320, taxDeductible: true },
      { id: 4, date: 'Mar 8', category: 'Utilities', description: 'Electricity bill', amount: 240, taxDeductible: true },
      { id: 5, date: 'Mar 5', category: 'Cleaning', description: 'Cleaning supplies & disinfectant', amount: 125, taxDeductible: true },
      { id: 6, date: 'Mar 3', category: 'Marketing', description: 'Google Ads campaign', amount: 150, taxDeductible: true },
      { id: 7, date: 'Mar 1', category: 'Insurance', description: 'Monthly liability insurance', amount: 280, taxDeductible: true },
    ];

    const monthlyRevenue = [
      { month: 'Jan', revenue: 3200, expenses: 1100 },
      { month: 'Feb', revenue: 3800, expenses: 1300 },
      { month: 'Mar', revenue: 4500, expenses: 1500 },
      { month: 'Apr', revenue: 4200, expenses: 1400 },
      { month: 'May', revenue: 5100, expenses: 1600 },
      { month: 'Jun', revenue: 5800, expenses: 1700 },
    ];

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Financials</h2>
            <p className="text-sm text-[#0A1128]/60">Track revenue, expenses & profitability</p>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="bg-gradient-to-br from-[#0A1128]/90 to-[#0A1128] border-[#0A1128]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#C46A3A]" />
                  <div className="text-xs text-white/90 font-medium">Revenue YTD</div>
                </div>
                <div className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</div>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUp className="w-3 h-3 text-[#C46A3A]" />
                  <span className="text-xs text-white/80">+18% vs last year</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#C46A3A]/90 to-[#C46A3A] border-[#C46A3A]">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-white" />
                  <div className="text-xs text-white/90 font-medium">Net Profit</div>
                </div>
                <div className="text-2xl font-bold text-white">${netProfit.toLocaleString()}</div>
                <div className="text-xs text-white/80 mt-1">{profitMargin}% margin</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#0A1128]/10 to-[#0A1128]/20 border-[#0A1128]/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-4 h-4 text-[#0A1128]" />
                  <div className="text-xs text-[#0A1128] font-medium">GST Collected</div>
                </div>
                <div className="text-2xl font-bold text-[#0A1128]">${gstCollected}</div>
                <div className="text-xs text-[#0A1128]/60 mt-1">NZ Sales Tax (15%)</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#C46A3A]/10 to-[#C46A3A]/20 border-[#C46A3A]/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-[#C46A3A]" />
                  <div className="text-xs text-[#0A1128] font-medium">Avg Booking</div>
                </div>
                <div className="text-2xl font-bold text-[#0A1128]">${avgBookingValue}</div>
                <div className="text-xs text-[#0A1128]/60 mt-1">Per reservation</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Revenue vs Expenses</span>
                <Badge variant="outline" className="text-xs">Last 6 months</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyRevenue.map((data, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#0A1128]">{data.month}</span>
                      <span className="text-sm text-[#0A1128]/60">
                        ${data.revenue.toLocaleString()} - ${data.expenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative h-6 bg-[#0A1128]/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#0A1128] rounded-full"
                        style={{ width: `${(data.revenue / 6000) * 100}%` }}
                      />
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#C46A3A]"
                        style={{ width: `${(data.expenses / 6000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0A1128]" />
                  <span className="text-[#0A1128]/60">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C46A3A]" />
                  <span className="text-[#0A1128]/60">Expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expense Management */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Expenses</CardTitle>
                <Button 
                  size="sm" 
                  className="bg-[#C46A3A] hover:bg-[#C46A3A]/90"
                  onClick={handleAddExpense}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div key={expense.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                        {expense.taxDeductible && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Tax Deductible
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm font-medium text-[#0A1128]">{expense.description}</div>
                      <div className="text-xs text-[#0A1128]/60 mt-1">{expense.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#0A1128]">${expense.amount}</div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 mt-1"
                        onClick={() => handleEditExpense(expense.id)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm font-medium text-[#0A1128]">Total Expenses</span>
                <span className="text-xl font-bold text-[#0A1128]">
                  ${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Profit & Loss Statement */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Profit & Loss</CardTitle>
                <Badge variant="outline">Year to Date</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm font-medium text-[#0A1128]">Total Revenue</span>
                  <span className="text-lg font-bold text-[#0A1128]">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-sm font-medium text-[#0A1128]">Total Expenses</span>
                  <span className="text-lg font-bold text-[#C46A3A]">-${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 bg-gradient-to-r from-[#0A1128]/10 to-[#C46A3A]/10 p-3 rounded-lg">
                  <span className="text-base font-bold text-[#0A1128]">Net Income</span>
                  <span className="text-2xl font-bold text-[#0A1128]">${netProfit.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleExportPDF}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleExportCSV}
                >
                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tax Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Tax Summary (NZ GST)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#0A1128]/5 rounded-lg">
                  <span className="text-sm text-[#0A1128]">GST Collected (15%)</span>
                  <span className="font-bold text-[#0A1128]">${(totalRevenue * 0.15).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#C46A3A]/10 rounded-lg">
                  <span className="text-sm text-[#0A1128]">Tax-Deductible Expenses</span>
                  <span className="font-bold text-[#0A1128]">${totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0A1128]/10 rounded-lg">
                  <span className="text-sm text-[#0A1128]">Estimated Tax Liability</span>
                  <span className="font-bold text-[#0A1128]">${((totalRevenue - totalExpenses) * 0.28).toFixed(0)}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={handleDownloadTaxReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Tax Report for Accountant
              </Button>
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col"
                  onClick={() => handleQuickReport('Monthly Summary')}
                >
                  <FileText className="w-5 h-5 mb-1 text-[#C46A3A]" />
                  <span className="text-xs">Monthly Summary</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col"
                  onClick={() => handleQuickReport('Tax Report')}
                >
                  <Receipt className="w-5 h-5 mb-1 text-[#C46A3A]" />
                  <span className="text-xs">Tax Report</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col"
                  onClick={() => handleQuickReport('Expense Analysis')}
                >
                  <BarChart3 className="w-5 h-5 mb-1 text-[#C46A3A]" />
                  <span className="text-xs">Expense Analysis</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col"
                  onClick={() => handleQuickReport('Revenue Sources')}
                >
                  <TrendingUp className="w-5 h-5 mb-1 text-[#C46A3A]" />
                  <span className="text-xs">Revenue Sources</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Processing */}
          <Card className="mb-20">
            <CardHeader>
              <CardTitle className="text-lg">Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Stripe Connected</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleManageStripe}
                  >
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                  <span className="text-sm text-[#0A1128]/60">Transaction Fees Paid</span>
                  <span className="font-bold text-[#0A1128]">${(totalRevenue * 0.029).toFixed(0)}</span>
                </div>
                <div className="text-xs text-[#0A1128]/60 mt-2">
                  Stripe fees: 2.9% + 30¢ per transaction
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Promotions Page
  if (currentPage === 'promotions') {
    const promotions = [
      { id: 1, name: "Early Bird Special", discount: "15%", code: "EARLY15", used: 12, expires: "Mar 31" },
      { id: 2, name: "Loyalty Reward", discount: "$20", code: "LOYAL20", used: 8, expires: "Apr 15" },
      { id: 3, name: "Weekend Getaway", discount: "10%", code: "WEEKEND", used: 0, expires: "Mar 25" },
    ];

    const togglePromo = (id: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setActivePromos(prev => 
        prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
      );
    };

    const handleViewPromotion = (promo: any) => {
      setSelectedPromotion(promo);
      setShowPromotionDrawer(true);
    };

    const handleEditPromotion = (promo: any) => {
      setPromotionForm({
        name: promo.name,
        code: promo.code,
        discountType: promo.discount.includes('%') ? 'percentage' : 'fixed',
        discountValue: promo.discount.replace(/[%$]/g, ''),
        expiryDate: promo.expires,
        maxUses: ''
      });
      setSelectedPromotion(promo);
      setShowPromotionDrawer(true);
    };

    const handleDeletePromotion = (promo: any) => {
      if (confirm(`Are you sure you want to delete "${promo.name}"?`)) {
        alert(`Promotion "${promo.name}" has been deleted.`);
        setShowPromotionDrawer(false);
      }
    };

    const handleCreatePromotion = () => {
      setPromotionForm({
        name: '',
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        maxUses: ''
      });
      setShowNewPromotion(true);
    };

    const handleSavePromotion = () => {
      alert(`Promotion "${promotionForm.name}" has been saved!`);
      setShowNewPromotion(false);
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Promotions</h2>
            <p className="text-sm text-[#0A1128]/60">Create special offers & discount codes</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="bg-gradient-to-br from-[#C46A3A] to-[#C46A3A]/80 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4" />
                  <div className="text-xs opacity-90">Active</div>
                </div>
                <div className="text-2xl font-bold">{activePromos.length}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <div className="text-xs opacity-90">Revenue</div>
                </div>
                <div className="text-2xl font-bold">$340</div>
              </CardContent>
            </Card>
          </div>

          {/* Create New Promo */}
          <Button 
            className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white py-6 mb-6"
            onClick={handleCreatePromotion}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Promotion
          </Button>

          {/* Active Promotions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Promotions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {promotions.map((promo) => {
                const isActive = activePromos.includes(promo.id);
                return (
                  <div
                    key={promo.id}
                    className="p-4 bg-[#F8F7F5] rounded-xl cursor-pointer hover:bg-[#0A1128]/5 transition-colors border-2 border-transparent hover:border-[#C46A3A]/20"
                    onClick={() => handleViewPromotion(promo)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-[#0A1128]">{promo.name}</div>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="text-sm text-[#0A1128]/60">
                          Code: <span className="font-mono font-semibold">{promo.code}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#C46A3A]">{promo.discount}</div>
                        <div className="text-xs text-[#0A1128]/40">off</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-[#0A1128]/60">
                        {promo.used} times used • Expires {promo.expires}
                      </div>
                      <button
                        onClick={(e) => togglePromo(promo.id, e)}
                        className="text-sm text-[#C46A3A] font-semibold"
                      >
                        {isActive ? (
                          <span className="flex items-center gap-1">
                            <ToggleRight className="w-4 h-4" /> Disable
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ToggleLeft className="w-4 h-4" /> Enable
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Promo Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Promotion Ideas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Percentage Discount', 'Fixed Amount Off', 'Free Night Stay', 'Referral Bonus'].map((idea) => (
                <div key={idea} className="flex items-center gap-2 p-2 text-sm text-[#0A1128]/70">
                  <Percent className="w-4 h-4 text-[#C46A3A]" />
                  {idea}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* View/Edit Promotion Drawer */}
        {showPromotionDrawer && selectedPromotion && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPromotionDrawer(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">{selectedPromotion.name}</h3>
                  <p className="text-sm text-[#0A1128]/60">Promotion Details</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPromotionDrawer(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Promotion Code */}
                <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white rounded-xl p-6 text-center">
                  <p className="text-sm opacity-90 mb-2">Promotion Code</p>
                  <p className="text-3xl font-bold font-mono tracking-wider">{selectedPromotion.code}</p>
                  <p className="text-lg mt-3 text-[#C46A3A] font-semibold">{selectedPromotion.discount} off</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8F7F5] rounded-lg p-4">
                    <p className="text-xs text-[#0A1128]/60 mb-1">Times Used</p>
                    <p className="text-2xl font-bold text-[#0A1128]">{selectedPromotion.used}</p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-lg p-4">
                    <p className="text-xs text-[#0A1128]/60 mb-1">Expires</p>
                    <p className="text-2xl font-bold text-[#0A1128]">{selectedPromotion.expires}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-[#C46A3A]/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0A1128] mb-1">Status</p>
                      <Badge variant={activePromos.includes(selectedPromotion.id) ? 'default' : 'secondary'} className="text-sm">
                        {activePromos.includes(selectedPromotion.id) ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePromo(selectedPromotion.id);
                      }}
                    >
                      {activePromos.includes(selectedPromotion.id) ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={() => handleEditPromotion(selectedPromotion)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Promotion
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePromotion(selectedPromotion)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Promotion
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPromotionDrawer(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create New Promotion Drawer */}
        {showNewPromotion && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowNewPromotion(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Create New Promotion</h3>
                  <p className="text-sm text-[#0A1128]/60">Set up a discount code</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNewPromotion(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Promotion Name</label>
                  <input
                    type="text"
                    value={promotionForm.name}
                    onChange={(e) => setPromotionForm({...promotionForm, name: e.target.value})}
                    placeholder="e.g., Summer Special"
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Discount Code</label>
                  <input
                    type="text"
                    value={promotionForm.code}
                    onChange={(e) => setPromotionForm({...promotionForm, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SUMMER25"
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Discount Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPromotionForm({...promotionForm, discountType: 'percentage'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        promotionForm.discountType === 'percentage'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                          : 'border-[#0A1128]/10 bg-white'
                      }`}
                    >
                      <Percent className={`w-6 h-6 mx-auto mb-2 ${promotionForm.discountType === 'percentage' ? 'text-[#C46A3A]' : 'text-[#0A1128]/40'}`} />
                      <p className="font-medium text-sm text-[#0A1128]">Percentage</p>
                    </button>
                    <button
                      onClick={() => setPromotionForm({...promotionForm, discountType: 'fixed'})}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        promotionForm.discountType === 'fixed'
                          ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                          : 'border-[#0A1128]/10 bg-white'
                      }`}
                    >
                      <DollarSign className={`w-6 h-6 mx-auto mb-2 ${promotionForm.discountType === 'fixed' ? 'text-[#C46A3A]' : 'text-[#0A1128]/40'}`} />
                      <p className="font-medium text-sm text-[#0A1128]">Fixed Amount</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Discount Value</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={promotionForm.discountValue}
                      onChange={(e) => setPromotionForm({...promotionForm, discountValue: e.target.value})}
                      placeholder={promotionForm.discountType === 'percentage' ? '15' : '20'}
                      className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1128]/40">
                      {promotionForm.discountType === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={promotionForm.expiryDate}
                    onChange={(e) => setPromotionForm({...promotionForm, expiryDate: e.target.value})}
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Maximum Uses (Optional)</label>
                  <input
                    type="number"
                    value={promotionForm.maxUses}
                    onChange={(e) => setPromotionForm({...promotionForm, maxUses: e.target.value})}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A]"
                  />
                </div>

                <div className="bg-[#C46A3A]/10 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Tag className="w-5 h-5 text-[#C46A3A] mt-0.5" />
                    <div className="text-sm text-[#0A1128]">
                      <p className="font-semibold mb-1">Preview</p>
                      <p className="text-[#0A1128]/70">
                        {promotionForm.code ? (
                          <>Code: <span className="font-mono font-bold">{promotionForm.code}</span> - {promotionForm.discountValue}{promotionForm.discountType === 'percentage' ? '%' : '$'} off</>
                        ) : (
                          'Fill in the details to preview your promotion'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                    onClick={handleSavePromotion}
                    disabled={!promotionForm.name || !promotionForm.code || !promotionForm.discountValue || !promotionForm.expiryDate}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Promotion
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowNewPromotion(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Social Media Page
  if (currentPage === 'social') {
    const posts = [
      { id: 1, text: "Meet our newest guest, Luna! 🐱", platforms: ['Instagram', 'Facebook'], date: "Mar 15", likes: 45 },
      { id: 2, text: "Cozy cat corner transformation ✨", platforms: ['Instagram'], date: "Mar 13", likes: 62 },
      { id: 3, text: "Spring special: 10% off bookings!", platforms: ['Facebook', 'Twitter'], date: "Mar 10", likes: 38 },
    ];

    const togglePlatform = (platform: string, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setSelectedPlatforms(prev =>
        prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
      );
    };

    const handleGeneratePost = () => {
      setShowAIPostGenerator(true);
      // Simulate AI generation
      setTimeout(() => {
        const aiPosts = [
          "🐱 Just welcomed the sweetest kitty, Mittens! Our luxury suites are purr-fect for your feline friend. Book your stay today! 🏨✨ #CatBoarding #LuxuryCatStay",
          "✨ Behind the scenes: How we create the ultimate cat paradise! From cozy beds to climbing towers, every detail matters. 🐾❤️ #CatLove #CatteryLife",
          "🌟 Special offer alert! Book 7 nights and get 1 night FREE! Give your cat the vacation they deserve. Limited time only! 📅 #CatHoliday #SpecialOffer",
          "😻 Meet our VIP guest this week! Look at that content face. Your cat could be this happy too! Book now for spring break. 🌸 #HappyCats #CatCare"
        ];
        setAiPostContent(aiPosts[Math.floor(Math.random() * aiPosts.length)]);
      }, 1500);
    };

    const handleViewPost = (post: any) => {
      setSelectedPost(post);
      setShowPostDrawer(true);
    };

    const handleSchedulePost = () => {
      alert(`Post scheduled for ${postScheduleDate} at ${postScheduleTime}!`);
      setShowAIPostGenerator(false);
      setPostScheduleDate('');
      setPostScheduleTime('');
    };

    const handlePublishNow = () => {
      const platformNames = selectedPostPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
      alert(`Post published to ${platformNames || 'selected platforms'}!`);
      setShowAIPostGenerator(false);
    };

    const handleViewSchedule = () => {
      setShowPostSchedule(true);
    };

    const handleDeletePost = (post: any) => {
      if (confirm(`Delete post: "${post.text}"?`)) {
        alert('Post deleted successfully!');
        setShowPostDrawer(false);
      }
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Social Media</h2>
            <p className="text-sm text-[#0A1128]/60">AI-powered post generator & scheduler</p>
          </div>

          {/* AI Post Generator */}
          <Card className="bg-gradient-to-br from-pink-600 to-pink-700 text-white mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Post Generator</h3>
                  <p className="text-sm opacity-90">Create engaging content in seconds</p>
                </div>
              </div>
              <Button 
                className="w-full bg-white text-pink-700 hover:bg-white/90"
                onClick={handleGeneratePost}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate New Post
              </Button>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connected Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
                { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
                { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
              ].map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={(e) => togglePlatform(platform.id, e)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-[#C46A3A]/10 border-2 border-[#C46A3A]'
                        : 'bg-white border-2 border-[#0A1128]/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-[#0A1128]">{platform.name}</span>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-[#C46A3A]" />}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card className="mb-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Posts</CardTitle>
              <Badge variant="secondary">{posts.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="p-4 bg-[#F8F7F5] rounded-xl cursor-pointer hover:bg-[#0A1128]/5 transition-colors border-2 border-transparent hover:border-[#C46A3A]/20"
                  onClick={() => handleViewPost(post)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[#0A1128] mb-2">{post.text}</div>
                      <div className="flex items-center gap-2">
                        {post.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <span className="text-[#0A1128]/60">{post.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[#0A1128]/60">
                        <Heart className="w-4 h-4" /> {post.likes}
                      </span>
                      <button className="text-[#C46A3A] font-semibold">View</button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Post Schedule */}
          <Button 
            variant="outline" 
            className="w-full py-6"
            onClick={handleViewSchedule}
          >
            <CalendarIcon className="w-5 h-5 mr-2 text-[#C46A3A]" />
            <span>View Post Schedule</span>
          </Button>
        </div>

        {/* AI Post Generator Drawer */}
        {showAIPostGenerator && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAIPostGenerator(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[75vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">AI Post Generator</h3>
                  <p className="text-sm text-[#0A1128]/60">Create engaging social media content</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAIPostGenerator(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {aiPostContent ? (
                  <>
                    {/* Generated Content */}
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border-2 border-pink-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-pink-600" />
                        <p className="font-semibold text-[#0A1128]">AI Generated Post</p>
                      </div>
                      <textarea
                        value={aiPostContent}
                        onChange={(e) => setAiPostContent(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>

                    {/* Platform Selection */}
                    <div>
                      <label className="text-sm font-medium text-[#0A1128] block mb-3">Select Platforms</label>
                      <div className="space-y-2">
                        {[
                          { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
                          { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700' },
                          { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
                        ].map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = selectedPostPlatforms.includes(platform.id);
                          return (
                            <button
                              key={platform.id}
                              onClick={() => {
                                setSelectedPostPlatforms(prev =>
                                  prev.includes(platform.id) 
                                    ? prev.filter(p => p !== platform.id) 
                                    : [...prev, platform.id]
                                );
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-[#C46A3A]/10 border-2 border-[#C46A3A]'
                                  : 'bg-white border-2 border-[#0A1128]/10'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-semibold text-[#0A1128]">{platform.name}</span>
                              </div>
                              {isSelected && <CheckCircle className="w-5 h-5 text-[#C46A3A]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Schedule Options */}
                    <div className="bg-[#F8F7F5] rounded-lg p-4">
                      <p className="font-semibold text-[#0A1128] mb-3">Schedule Post (Optional)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#0A1128]/60 block mb-1">Date</label>
                          <input
                            type="date"
                            value={postScheduleDate}
                            onChange={(e) => setPostScheduleDate(e.target.value)}
                            className="w-full px-3 py-2 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#0A1128]/60 block mb-1">Time</label>
                          <input
                            type="time"
                            value={postScheduleTime}
                            onChange={(e) => setPostScheduleTime(e.target.value)}
                            className="w-full px-3 py-2 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      {postScheduleDate && postScheduleTime ? (
                        <Button 
                          className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                          onClick={handleSchedulePost}
                          disabled={selectedPostPlatforms.length === 0}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Schedule Post
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                          onClick={handlePublishNow}
                          disabled={selectedPostPlatforms.length === 0}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish Now
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={handleGeneratePost}
                      >
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Another
                      </Button>

                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAIPostGenerator(false);
                          setAiPostContent('');
                          setSelectedPostPlatforms([]);
                        }}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 mb-4">
                      <Sparkles className="w-8 h-8 text-pink-600 animate-pulse" />
                    </div>
                    <p className="text-[#0A1128] font-semibold mb-2">Generating your post...</p>
                    <p className="text-sm text-[#0A1128]/60">AI is crafting engaging content for you</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Post Drawer */}
        {showPostDrawer && selectedPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPostDrawer(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Post Details</h3>
                  <p className="text-sm text-[#0A1128]/60">Published on {selectedPost.date}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPostDrawer(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Post Content */}
                <div className="bg-[#F8F7F5] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-[#C46A3A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0A1128]">Social Media Post</p>
                      <p className="text-xs text-[#0A1128]/60">{selectedPost.date}</p>
                    </div>
                  </div>
                  <p className="text-[#0A1128] leading-relaxed">{selectedPost.text}</p>
                </div>

                {/* Platforms */}
                <div>
                  <label className="text-sm font-medium text-[#0A1128] block mb-2">Published To</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary" className="px-3 py-1">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#F8F7F5] rounded-lg p-4 text-center">
                    <Heart className="w-5 h-5 text-[#C46A3A] mx-auto mb-1" />
                    <p className="text-2xl font-bold text-[#0A1128]">{selectedPost.likes}</p>
                    <p className="text-xs text-[#0A1128]/60">Likes</p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-lg p-4 text-center">
                    <MessageSquare className="w-5 h-5 text-[#C46A3A] mx-auto mb-1" />
                    <p className="text-2xl font-bold text-[#0A1128]">12</p>
                    <p className="text-xs text-[#0A1128]/60">Comments</p>
                  </div>
                  <div className="bg-[#F8F7F5] rounded-lg p-4 text-center">
                    <Share2 className="w-5 h-5 text-[#C46A3A] mx-auto mb-1" />
                    <p className="text-2xl font-bold text-[#0A1128]">8</p>
                    <p className="text-xs text-[#0A1128]/60">Shares</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Post
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePost(selectedPost)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </Button>

                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPostDrawer(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post Schedule Drawer */}
        {showPostSchedule && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowPostSchedule(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Post Schedule</h3>
                  <p className="text-sm text-[#0A1128]/60">Upcoming scheduled posts</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowPostSchedule(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {/* Scheduled Posts */}
                {[
                  { date: 'Mar 20, 2026', time: '10:00 AM', content: '🌸 Spring is here! Book your cat\'s stay now and enjoy 15% off!', platforms: ['Instagram', 'Facebook'] },
                  { date: 'Mar 22, 2026', time: '2:00 PM', content: '😻 Check out our new luxury cat suites! Your feline will love it here.', platforms: ['Instagram'] },
                  { date: 'Mar 25, 2026', time: '9:00 AM', content: '🐱 Weekend special: Extended play time for all our guests!', platforms: ['Facebook', 'Twitter'] },
                ].map((scheduledPost, idx) => (
                  <div key={idx} className="bg-[#F8F7F5] rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-[#C46A3A]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#0A1128] mb-1">{scheduledPost.date} at {scheduledPost.time}</p>
                        <p className="text-sm text-[#0A1128]/70 mb-2">{scheduledPost.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {scheduledPost.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPostSchedule(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Cat Updates Page
  if (currentPage === 'cat-updates') {
    const catUpdates = [
      { id: 1, catName: "Whiskers", owner: "Sarah Johnson", roomNumber: 3, lastUpdate: "2 hours ago", photos: 3 },
      { id: 2, catName: "Luna", owner: "Mike Chen", roomNumber: 7, lastUpdate: "4 hours ago", photos: 2 },
      { id: 3, catName: "Oliver", owner: "James Brown", roomNumber: 5, lastUpdate: "Yesterday", photos: 5 },
    ];

    const handleSendUpdate = (id: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setSentUpdates(prev => [...prev, id]);
      alert('Update sent successfully to the owner!');
    };

    const handleUploadPhotos = () => {
      setShowUploadPhotos(true);
    };

    const handleSelectCat = (cat: any) => {
      setSelectedCatForUpdate(cat);
      // Simulate uploaded photos
      setUploadedPhotos(['photo1.jpg', 'photo2.jpg', 'photo3.jpg']);
    };

    const handleGenerateCaption = () => {
      const captions = [
        `"Just finished my afternoon nap in the sunny window. The food here is purrfect! 😸"`,
        `"Having such a great time! The staff here gives the best chin scratches. Missing you! 🐱"`,
        `"Conquered the tallest climbing tower today! I'm the king of the castle! 👑"`,
        `"Made a new friend today. We share snacks and nap spots. Life is good! 😻"`
      ];
      setGeneratedCaption(captions[Math.floor(Math.random() * captions.length)]);
    };

    const handleSendPhotoUpdate = () => {
      if (selectedCatForUpdate) {
        alert(`Photo update sent to ${selectedCatForUpdate.owner} for ${selectedCatForUpdate.catName}!`);
        setShowUploadPhotos(false);
        setSelectedCatForUpdate(null);
        setUploadedPhotos([]);
        setGeneratedCaption('');
      }
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Cat Updates</h2>
            <p className="text-sm text-[#0A1128]/60">Send AI-generated photo updates to owners</p>
          </div>

          {/* AI Feature Card */}
          <Card className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Photo Captions</h3>
                  <p className="text-sm opacity-90">From your cat's perspective!</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 italic text-sm">
                "Just finished my afternoon nap in the sunny window. The food here is purrfect! 😸"
              </div>
            </CardContent>
          </Card>

          {/* Upload Photos */}
          <Button 
            className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white py-6 mb-6"
            onClick={handleUploadPhotos}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload New Photos
          </Button>

          {/* Pending Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Updates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {catUpdates.map((update) => {
                const isSent = sentUpdates.includes(update.id);
                return (
                  <div key={update.id} className="p-4 bg-[#F8F7F5] rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-[#C46A3A]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#0A1128]">{update.catName}</div>
                          <div className="text-sm text-[#0A1128]/60">{update.owner}</div>
                          <div className="text-xs text-[#0A1128]/40 mt-1">
                            Room {update.roomNumber} • {update.photos} photos
                          </div>
                        </div>
                      </div>
                      {isSent ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Ready</Badge>
                      )}
                    </div>
                    {!isSent && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => handleSendUpdate(update.id, e)}
                        >
                          <Wand2 className="w-3 h-3 mr-1" />
                          Generate AI Caption
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90"
                          onClick={(e) => handleSendUpdate(update.id, e)}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Update History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <Send className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Updates Sent</span>
                </div>
                <div className="text-lg font-bold text-[#0A1128]">87</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl">
                <div className="flex items-center gap-3">
                  <ThumbsUp className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Happy Owners</span>
                </div>
                <div className="text-lg font-bold text-[#0A1128]">98%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Photos Drawer */}
        {showUploadPhotos && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowUploadPhotos(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[75vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Upload Photos</h3>
                  <p className="text-sm text-[#0A1128]/60">Select a cat and add photos to their story</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowUploadPhotos(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {!selectedCatForUpdate ? (
                  <>
                    <div className="bg-[#0A1128]/5 rounded-lg p-4 mb-4">
                      <p className="text-sm text-[#0A1128] font-semibold mb-1">Select a Cat in Residence</p>
                      <p className="text-xs text-[#0A1128]/60">Choose which cat you'd like to add photos for</p>
                    </div>

                    {/* Cat Selection List */}
                    <div className="space-y-3">
                      {catUpdates.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleSelectCat(cat)}
                          className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition-colors border-2 border-transparent hover:border-[#C46A3A]/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-[#C46A3A]" />
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-[#0A1128]">{cat.catName}</p>
                              <p className="text-sm text-[#0A1128]/60">{cat.owner}</p>
                              <p className="text-xs text-[#0A1128]/40">Room {cat.roomNumber}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-[#0A1128]/40" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Selected Cat */}
                    <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 text-white rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-lg">{selectedCatForUpdate.catName}</p>
                          <p className="text-sm opacity-90">{selectedCatForUpdate.owner}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-white hover:bg-white/20"
                          onClick={() => {
                            setSelectedCatForUpdate(null);
                            setUploadedPhotos([]);
                            setGeneratedCaption('');
                          }}
                        >
                          Change
                        </Button>
                      </div>
                      <p className="text-xs opacity-75">Room {selectedCatForUpdate.roomNumber}</p>
                    </div>

                    {/* Upload Photos Area */}
                    <div className="border-2 border-dashed border-[#0A1128]/20 rounded-xl p-8 text-center bg-[#F8F7F5]">
                      <div className="w-16 h-16 rounded-full bg-[#C46A3A]/20 flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-[#C46A3A]" />
                      </div>
                      <p className="font-semibold text-[#0A1128] mb-2">Upload Photos</p>
                      <p className="text-sm text-[#0A1128]/60 mb-4">Tap to select photos from your device</p>
                      <Button className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Photos
                      </Button>
                    </div>

                    {/* Uploaded Photos Preview */}
                    {uploadedPhotos.length > 0 && (
                      <div className="bg-[#F8F7F5] rounded-lg p-4">
                        <p className="font-semibold text-[#0A1128] mb-3">Uploaded Photos ({uploadedPhotos.length})</p>
                        <div className="grid grid-cols-3 gap-2">
                          {uploadedPhotos.map((photo, idx) => (
                            <div key={idx} className="aspect-square bg-[#0A1128]/10 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-[#0A1128]/40" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Caption Generator */}
                    {uploadedPhotos.length > 0 && (
                      <>
                        <Button 
                          variant="outline"
                          className="w-full border-[#0A1128] text-[#0A1128]"
                          onClick={handleGenerateCaption}
                        >
                          <Wand2 className="w-4 h-4 mr-2" />
                          Generate AI Caption
                        </Button>

                        {generatedCaption && (
                          <div className="bg-gradient-to-br from-[#0A1128]/5 to-[#0A1128]/10 rounded-xl p-4 border-2 border-[#0A1128]/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-5 h-5 text-[#0A1128]" />
                              <p className="font-semibold text-[#0A1128]">AI Generated Caption</p>
                            </div>
                            <textarea
                              value={generatedCaption}
                              onChange={(e) => setGeneratedCaption(e.target.value)}
                              rows={4}
                              className="w-full px-4 py-3 border border-[#0A1128]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C46A3A] bg-white italic"
                            />
                          </div>
                        )}

                        {/* Send Update Button */}
                        <div className="space-y-3 pt-4">
                          <Button 
                            className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white py-6"
                            onClick={handleSendPhotoUpdate}
                            disabled={!generatedCaption}
                          >
                            <Send className="w-5 h-5 mr-2" />
                            Send Update to {selectedCatForUpdate.owner}
                          </Button>

                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowUploadPhotos(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Settings Page
  if (currentPage === 'settings') {
    const handleSaveSettings = () => {
      alert('Settings saved successfully!');
    };

    return (
      <div 
        className="h-full bg-[#F8F7F5] relative w-full overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="w-full px-5 py-4 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 60px)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-serif font-semibold text-[#0A1128]">Settings</h2>
            <p className="text-sm text-[#0A1128]/60">Configure your platform preferences</p>
          </div>

          {/* Business Info */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Business Name</label>
                <Input 
                  value={businessInfo.name} 
                  onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Email</label>
                <Input 
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                  type="email" 
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Phone</label>
                <Input 
                  value={businessInfo.phone}
                  onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                  type="tel" 
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Address</label>
                <Input 
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                  className="bg-white" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Website Settings */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C46A3A]" />
                Website Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => setShowBrandColors(true)}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#F8F7F5]/70 transition"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Brand Colors</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
              <button 
                onClick={() => setShowTypography(true)}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#F8F7F5]/70 transition"
              >
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Typography</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
              <button 
                onClick={() => setShowGallery(true)}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#F8F7F5]/70 transition"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Gallery Images</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
            </CardContent>
          </Card>

          {/* Marketing Tools */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                Marketing Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => setShowWebsiteEditor(true)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] rounded-xl hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] transition border border-[#C46A3A]/20"
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-[#C46A3A]" />
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Website Editor</span>
                    <span className="text-xs text-[#0A1128]/60">Customize your site design</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
              <button 
                onClick={() => setShowMarketingKit(true)}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] rounded-xl hover:from-[#C46A3A]/20 hover:to-[#F8F7F5] transition border border-[#C46A3A]/20"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-[#C46A3A]" />
                  <div className="text-left">
                    <span className="font-semibold text-[#0A1128] block">Marketing Kit</span>
                    <span className="text-xs text-[#0A1128]/60">Flyers, social posts & more</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
            </CardContent>
          </Card>

          {/* Booking Settings */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#C46A3A]" />
                Booking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Minimum Stay (nights)</label>
                <Input 
                  value={bookingSettings.minStay}
                  onChange={(e) => setBookingSettings({...bookingSettings, minStay: e.target.value})}
                  type="number" 
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Advance Booking (days)</label>
                <Input 
                  value={bookingSettings.advanceBooking}
                  onChange={(e) => setBookingSettings({...bookingSettings, advanceBooking: e.target.value})}
                  type="number" 
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Check-in Time</label>
                <Input 
                  value={bookingSettings.checkIn}
                  onChange={(e) => setBookingSettings({...bookingSettings, checkIn: e.target.value})}
                  type="time" 
                  className="bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0A1128]">Check-out Time</label>
                <Input 
                  value={bookingSettings.checkOut}
                  onChange={(e) => setBookingSettings({...bookingSettings, checkOut: e.target.value})}
                  type="time" 
                  className="bg-white" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-[#C46A3A]" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button 
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#F8F7F5]/70 transition"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
              <button 
                onClick={() => setShowNotifications(true)}
                className="w-full flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#F8F7F5]/70 transition"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#C46A3A]" />
                  <span className="font-semibold text-[#0A1128]">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSaveSettings}
            className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white py-6"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Save All Changes
          </Button>
        </div>

        {/* Brand Colors Drawer */}
        {showBrandColors && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowBrandColors(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Brand Colors</h3>
                  <p className="text-sm text-[#0A1128]/60">Customize your website colors</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowBrandColors(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <label className="text-sm font-medium text-[#0A1128] block mb-3">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#0A1128] border-2 border-[#0A1128]/20"></div>
                    <div>
                      <p className="font-semibold text-[#0A1128]">#0A1128</p>
                      <p className="text-sm text-[#0A1128]/60">Navy Blue</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <label className="text-sm font-medium text-[#0A1128] block mb-3">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#C46A3A] border-2 border-[#C46A3A]/20"></div>
                    <div>
                      <p className="font-semibold text-[#0A1128]">#C46A3A</p>
                      <p className="text-sm text-[#0A1128]/60">Terracotta</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <label className="text-sm font-medium text-[#0A1128] block mb-3">Background Color</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl bg-[#F8F7F5] border-2 border-[#0A1128]/20"></div>
                    <div>
                      <p className="font-semibold text-[#0A1128]">#F8F7F5</p>
                      <p className="text-sm text-[#0A1128]/60">Soft Cream</p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => {
                    alert('Brand colors saved!');
                    setShowBrandColors(false);
                  }}
                >
                  Save Colors
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Typography Drawer */}
        {showTypography && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowTypography(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Typography</h3>
                  <p className="text-sm text-[#0A1128]/60">Customize fonts & text styles</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowTypography(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <label className="text-sm font-medium text-[#0A1128] block mb-3">Heading Font</label>
                  <p className="text-3xl font-serif text-[#0A1128]">Playfair Display</p>
                  <p className="text-sm text-[#0A1128]/60 mt-2">Elegant serif for headings</p>
                </div>

                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <label className="text-sm font-medium text-[#0A1128] block mb-3">Body Font</label>
                  <p className="text-lg text-[#0A1128]">Inter</p>
                  <p className="text-sm text-[#0A1128]/60 mt-2">Clean sans-serif for body text</p>
                </div>

                <Button 
                  className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => {
                    alert('Typography saved!');
                    setShowTypography(false);
                  }}
                >
                  Save Typography
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Images Drawer */}
        {showGallery && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowGallery(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Gallery Images</h3>
                  <p className="text-sm text-[#0A1128]/60">Manage your website photos</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowGallery(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload New Images
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-square bg-[#F8F7F5] rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-[#0A1128]/20" />
                    </div>
                  ))}
                </div>

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowGallery(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Website Editor Drawer */}
        {showWebsiteEditor && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowWebsiteEditor(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Website Editor</h3>
                  <p className="text-sm text-[#0A1128]/60">Customize your site design</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowWebsiteEditor(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 rounded-xl p-6 text-white text-center">
                  <Globe className="w-12 h-12 mx-auto mb-3 opacity-90" />
                  <h4 className="font-bold text-lg mb-2">Your Website is Live!</h4>
                  <p className="text-sm opacity-90 mb-4">Visit your public booking site:</p>
                  <p className="font-mono text-[#C46A3A] bg-white/20 rounded-lg p-3">
                    {businessName.toLowerCase().replace(/\s+/g, '')}.catstays.com
                  </p>
                </div>

                <div className="space-y-3">
                  <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-[#C46A3A]" />
                      <span className="font-semibold text-[#0A1128]">Edit Hero Section</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                  </button>

                  <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-[#C46A3A]" />
                      <span className="font-semibold text-[#0A1128]">Update Gallery</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                  </button>

                  <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5 text-[#C46A3A]" />
                      <span className="font-semibold text-[#0A1128]">Manage Pages</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                  </button>
                </div>

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowWebsiteEditor(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Marketing Kit Drawer */}
        {showMarketingKit && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowMarketingKit(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Marketing Kit</h3>
                  <p className="text-sm text-[#0A1128]/60">Download marketing materials</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowMarketingKit(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                {[
                  { title: 'Business Flyer', desc: 'Print-ready PDF with your branding', icon: FileSpreadsheet },
                  { title: 'Social Media Pack', desc: 'Instagram & Facebook post templates', icon: Share2 },
                  { title: 'Business Cards', desc: 'Professional card design', icon: CreditCard },
                  { title: 'Email Signature', desc: 'Branded email footer template', icon: Mail }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#C46A3A]/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#C46A3A]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#0A1128]">{item.title}</p>
                          <p className="text-sm text-[#0A1128]/60">{item.desc}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowMarketingKit(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Drawer */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowChangePassword(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Change Password</h3>
                  <p className="text-sm text-[#0A1128]/60">Update your account password</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowChangePassword(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0A1128]">Current Password</label>
                  <Input type="password" className="bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0A1128]">New Password</label>
                  <Input type="password" className="bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#0A1128]">Confirm New Password</label>
                  <Input type="password" className="bg-white" />
                </div>

                <Button 
                  className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => {
                    alert('Password changed successfully!');
                    setShowChangePassword(false);
                  }}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Drawer */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowNotifications(false)}>
            <div 
              className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#0A1128]">Notifications</h3>
                  <p className="text-sm text-[#0A1128]/60">Manage notification preferences</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowNotifications(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <h4 className="font-semibold text-[#0A1128] mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'emailBookings', label: 'New Bookings' },
                      { key: 'emailPayments', label: 'Payment Received' },
                      { key: 'emailMessages', label: 'New Messages' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-[#0A1128]">{item.label}</span>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'bg-[#C46A3A]'
                              : 'bg-[#0A1128]/20'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F8F7F5] rounded-lg p-4">
                  <h4 className="font-semibold text-[#0A1128] mb-3">SMS Notifications</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'smsBookings', label: 'New Bookings' },
                      { key: 'smsPayments', label: 'Payment Received' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-[#0A1128]">{item.label}</span>
                        <button
                          onClick={() => setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                          })}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'bg-[#C46A3A]'
                              : 'bg-[#0A1128]/20'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            notificationSettings[item.key as keyof typeof notificationSettings]
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}></div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 text-white"
                  onClick={() => {
                    alert('Notification preferences saved!');
                    setShowNotifications(false);
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grooming Module Page
  if (currentPage === 'grooming') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C46A3A]/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#0A1128]">8</div>
                      <div className="text-xs text-[#0A1128]/60">This Week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0A1128]/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#0A1128]" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#0A1128]">$340</div>
                      <div className="text-xs text-[#0A1128]/60">Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Grooming Appointments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-[#C46A3A]" />
                    Today's Appointments
                  </CardTitle>
                  <Badge className="bg-[#C46A3A]">3 scheduled</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Appointment 1 */}
                <div className="bg-gradient-to-br from-[#C46A3A]/5 to-white rounded-xl p-4 border border-[#C46A3A]/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#0A1128]">Whiskers - Deluxe Bath & Brush</div>
                      <div className="text-sm text-[#0A1128]/60">Sarah Johnson</div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">10:00 AM</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>60 minutes</span>
                    <span className="text-[#0A1128]/30">•</span>
                    <span className="font-semibold text-[#C46A3A]">$45</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-[#C46A3A] hover:bg-[#C46A3A]/90">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>

                {/* Appointment 2 */}
                <div className="bg-gradient-to-br from-[#0A1128]/5 to-white rounded-xl p-4 border border-[#0A1128]/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#0A1128]">Luna - Nail Trim</div>
                      <div className="text-sm text-[#0A1128]/60">Mike Chen</div>
                    </div>
                    <Badge variant="secondary">2:30 PM</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>20 minutes</span>
                    <span className="text-[#0A1128]/30">•</span>
                    <span className="font-semibold text-[#C46A3A]">$20</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Appointment 3 */}
                <div className="bg-gradient-to-br from-[#0A1128]/5 to-white rounded-xl p-4 border border-[#0A1128]/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-[#0A1128]">Oliver - Full Spa Package</div>
                      <div className="text-sm text-[#0A1128]/60">Emma Davis</div>
                    </div>
                    <Badge variant="secondary">4:00 PM</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#0A1128]/70 mb-3">
                    <Clock className="w-4 h-4" />
                    <span>90 minutes</span>
                    <span className="text-[#0A1128]/30">•</span>
                    <span className="font-semibold text-[#C46A3A]">$85</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Grooming Services Offered */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-[#C46A3A]" />
                    Your Services
                  </CardTitle>
                  <Button size="sm" className="bg-[#C46A3A] hover:bg-[#C46A3A]/90">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Service 1 */}
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1128]">Deluxe Bath & Brush</div>
                      <div className="text-xs text-[#0A1128]/60">60 min • Most popular</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C46A3A]">$45</div>
                    <div className="text-xs text-[#0A1128]/40">12 booked</div>
                  </div>
                </div>

                {/* Service 2 */}
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1128]">Nail Trim & File</div>
                      <div className="text-xs text-[#0A1128]/60">20 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C46A3A]">$20</div>
                    <div className="text-xs text-[#0A1128]/40">8 booked</div>
                  </div>
                </div>

                {/* Service 3 */}
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1128]">Full Spa Package</div>
                      <div className="text-xs text-[#0A1128]/60">90 min • Premium</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C46A3A]">$85</div>
                    <div className="text-xs text-[#0A1128]/40">5 booked</div>
                  </div>
                </div>

                {/* Service 4 */}
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                      <Brush className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1128]">Brush & De-shedding</div>
                      <div className="text-xs text-[#0A1128]/60">45 min</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C46A3A]">$35</div>
                    <div className="text-xs text-[#0A1128]/40">6 booked</div>
                  </div>
                </div>

                {/* Service 5 */}
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-xl hover:bg-[#0A1128]/5 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                      <Droplet className="w-5 h-5 text-[#C46A3A]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A1128]">Ear Cleaning</div>
                      <div className="text-xs text-[#0A1128]/60">15 min • Add-on</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#C46A3A]">$15</div>
                    <div className="text-xs text-[#0A1128]/40">4 booked</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Week Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#C46A3A]" />
                  This Week's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Tomorrow */}
                <div>
                  <div className="text-sm font-semibold text-[#0A1128]/70 mb-2">Thursday, Mar 19</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-[#0A1128]/60 w-16">11:00 AM</div>
                        <div>
                          <div className="font-semibold text-[#0A1128] text-sm">Bella - Nail Trim</div>
                          <div className="text-xs text-[#0A1128]/60">Linda Park</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#C46A3A]">$20</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-[#0A1128]/60 w-16">3:00 PM</div>
                        <div>
                          <div className="font-semibold text-[#0A1128] text-sm">Max - Full Spa</div>
                          <div className="text-xs text-[#0A1128]/60">Tom Wilson</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#C46A3A]">$85</span>
                    </div>
                  </div>
                </div>

                {/* Friday */}
                <div>
                  <div className="text-sm font-semibold text-[#0A1128]/70 mb-2">Friday, Mar 20</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-[#0A1128]/60 w-16">10:00 AM</div>
                        <div>
                          <div className="font-semibold text-[#0A1128] text-sm">Simba - Deluxe Bath</div>
                          <div className="text-xs text-[#0A1128]/60">Rachel Green</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#C46A3A]">$45</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-xs font-bold text-[#0A1128]/60 w-16">1:30 PM</div>
                        <div>
                          <div className="font-semibold text-[#0A1128] text-sm">Chloe - Brush & De-shed</div>
                          <div className="text-xs text-[#0A1128]/60">Mark Anderson</div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-[#C46A3A]">$35</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button className="h-auto py-4 flex-col gap-2 bg-[#C46A3A] hover:bg-[#C46A3A]/90">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">New Appointment</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm">Service Settings</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">View Reports</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Client History</span>
                </Button>
              </CardContent>
            </Card>

            {/* PRO Feature Banner */}
            <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 rounded-xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-[#C46A3A]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">PRO Grooming Module</h3>
                    <Badge className="bg-[#C46A3A]">Active</Badge>
                  </div>
                  <p className="text-sm opacity-90 mb-3">
                    You're using all premium grooming features
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C46A3A]" />
                      <span>Unlimited grooming appointments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C46A3A]" />
                      <span>Custom service packages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C46A3A]" />
                      <span>Automated appointment reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#C46A3A]" />
                      <span>Grooming history & notes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Payment Integration Page
  if (currentPage === 'payment') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C46A3A]" />
                  Payment Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 rounded-xl p-6 text-white">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-2">Connect Stripe</h3>
                        <p className="text-sm opacity-90 mb-4">
                          Accept online payments from customers
                        </p>
                        <Button className="bg-white text-[#0A1128] hover:bg-white/90">
                          Connect Stripe Account
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Payment Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A]" />
                        <span className="text-sm">Online booking deposits</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A]" />
                        <span className="text-sm">Automatic invoicing</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A]" />
                        <span className="text-sm">Payment reminders</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Website Editor Page
  if (currentPage === 'website-editor') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C46A3A]" />
                  Website Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 rounded-xl p-6 text-white text-center">
                    <Globe className="w-12 h-12 mx-auto mb-3 opacity-90" />
                    <h4 className="font-bold text-lg mb-2">Your Website is Live!</h4>
                    <p className="text-sm opacity-90 mb-4">Visit your public booking site:</p>
                    <p className="font-mono text-[#C46A3A] bg-white/20 rounded-lg p-3">
                      {businessName.toLowerCase().replace(/\s+/g, '')}.catstays.com
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customize Your Site</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-[#C46A3A]" />
                          <span className="font-semibold text-[#0A1128]">Edit Hero Section</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                      </button>
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-[#C46A3A]" />
                          <span className="font-semibold text-[#0A1128]">Update Gallery</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                      </button>
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <Type className="w-5 h-5 text-[#C46A3A]" />
                          <span className="font-semibold text-[#0A1128]">Edit Content</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
                      </button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Booking Setup Page
  if (currentPage === 'booking-setup') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#C46A3A]" />
                  Booking Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Room Pricing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="font-semibold text-[#0A1128]">Standard Suite</span>
                        <span className="text-[#C46A3A] font-bold">$45/night</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="font-semibold text-[#0A1128]">Premium Suite</span>
                        <span className="text-[#C46A3A] font-bold">$65/night</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="font-semibold text-[#0A1128]">Luxury Penthouse</span>
                        <span className="text-[#C46A3A] font-bold">$95/night</span>
                      </div>
                      <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Room Type
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Booking Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="text-sm text-[#0A1128]">Minimum stay</span>
                        <span className="font-semibold text-[#0A1128]">1 night</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="text-sm text-[#0A1128]">Advance booking</span>
                        <span className="font-semibold text-[#0A1128]">24 hours</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <span className="text-sm text-[#0A1128]">Cancellation policy</span>
                        <span className="font-semibold text-[#0A1128]">48 hours</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Marketing Kit Page
  if (currentPage === 'marketing') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#C46A3A]" />
                  Marketing Kit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#C46A3A]/10 to-[#F8F7F5] rounded-xl p-6 border border-[#C46A3A]/20">
                    <h3 className="font-bold text-[#0A1128] mb-2">Download Marketing Materials</h3>
                    <p className="text-sm text-[#0A1128]/70">
                      Pre-designed flyers, business cards, and social media graphics for your cattery
                    </p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Available Materials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#C46A3A]" />
                          <div className="text-left">
                            <span className="font-semibold text-[#0A1128] block">Business Cards</span>
                            <span className="text-xs text-[#0A1128]/60">PDF, ready to print</span>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-[#C46A3A]" />
                      </button>
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-[#C46A3A]" />
                          <div className="text-left">
                            <span className="font-semibold text-[#0A1128] block">Flyer Templates</span>
                            <span className="text-xs text-[#0A1128]/60">A4/Letter size</span>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-[#C46A3A]" />
                      </button>
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-[#C46A3A]" />
                          <div className="text-left">
                            <span className="font-semibold text-[#0A1128] block">Social Media Pack</span>
                            <span className="text-xs text-[#0A1128]/60">Instagram, Facebook posts</span>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-[#C46A3A]" />
                      </button>
                      <button className="w-full p-4 bg-[#F8F7F5] rounded-xl flex items-center justify-between hover:bg-[#0A1128]/5 transition">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-[#C46A3A]" />
                          <div className="text-left">
                            <span className="font-semibold text-[#0A1128] block">Email Signatures</span>
                            <span className="text-xs text-[#0A1128]/60">HTML templates</span>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-[#C46A3A]" />
                      </button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Subscription Management Page
  if (currentPage === 'subscription') {
    return (
      <div 
        className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
        style={{ boxSizing: 'border-box' }}
      >
        <Header />
        <MenuOverlay />

        <div className="h-[calc(100%-64px)] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#C46A3A]" />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-[#0A1128] to-[#0A1128]/90 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">Starter Plan</h3>
                        <p className="text-sm opacity-90">Currently active</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">$49</div>
                        <div className="text-sm opacity-90">/month</div>
                      </div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3 mb-4">
                      <div className="text-sm opacity-90 mb-1">Next billing date</div>
                      <div className="font-semibold">April 18, 2026</div>
                    </div>
                    <Button className="w-full bg-white text-[#0A1128] hover:bg-white/90">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to PRO
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Plan Features</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A] flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">Up to 20 rooms</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A] flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">Online booking system</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A] flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">Customer portal</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#C46A3A] flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">Email & SMS notifications</span>
                      </div>
                      <div className="flex items-center gap-3 opacity-40">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">AI photo updates <Badge variant="secondary" className="ml-1 text-xs">PRO</Badge></span>
                      </div>
                      <div className="flex items-center gap-3 opacity-40">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm text-[#0A1128]">Grooming module <Badge variant="secondary" className="ml-1 text-xs">PRO</Badge></span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Billing History</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <div>
                          <span className="text-sm font-semibold text-[#0A1128] block">Mar 18, 2026</span>
                          <span className="text-xs text-[#0A1128]/60">Starter Plan</span>
                        </div>
                        <span className="font-bold text-[#0A1128]">$49.00</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#F8F7F5] rounded-lg">
                        <div>
                          <span className="text-sm font-semibold text-[#0A1128] block">Feb 18, 2026</span>
                          <span className="text-xs text-[#0A1128]/60">Starter Plan</span>
                        </div>
                        <span className="font-bold text-[#0A1128]">$49.00</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for any other pages
  return (
    <div 
      className="h-full bg-[#F8F7F5] w-full relative overflow-hidden" 
      style={{ boxSizing: 'border-box' }}
    >
      <Header />
      <MenuOverlay />

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="capitalize flex items-center gap-2">
              {menuItems.find(item => item.id === currentPage)?.icon && (
                <span className="w-8 h-8 rounded-lg bg-[#C46A3A]/10 flex items-center justify-center">
                  {(() => {
                    const Icon = menuItems.find(item => item.id === currentPage)?.icon!;
                    return <Icon className="w-4 h-4 text-[#C46A3A]" />;
                  })()}
                </span>
              )}
              {menuItems.find(item => item.id === currentPage)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#0A1128]/5 flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const Icon = menuItems.find(item => item.id === currentPage)?.icon!;
                  return <Icon className="w-8 h-8 text-[#0A1128]/30" />;
                })()}
              </div>
              <p className="text-[#0A1128]/60 mb-2">
                This page is available in your full dashboard.
              </p>
              <p className="text-sm text-[#0A1128]/40">
                Use the menu to explore other sections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
