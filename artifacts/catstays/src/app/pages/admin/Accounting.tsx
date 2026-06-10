import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { 
  Menu, 
  Camera, 
  Upload, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Plus,
  Download,
  Trash2,
  Loader2,
  Receipt,
  Calendar,
  PieChart,
  User,
  Home,
  Cat,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../components/ui/sheet';
import { format } from 'date-fns';

interface Expense {
  id: number;
  merchant: string;
  amount: number;
  gst: number;
  category: string;
  date: string;
  description: string;
  receiptUrl?: string;
}

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  catNames: string[];
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  nights: number;
  receivedDate: string;
  specialRequirements: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance & Repairs', color: 'bg-blue-500' },
  { value: 'consumables', label: 'Consumables & Amenities', color: 'bg-purple-500' },
  { value: 'cleaning', label: 'Cleaning Services', color: 'bg-green-500' },
  { value: 'utilities', label: 'Utilities', color: 'bg-yellow-500' },
  { value: 'furnishings', label: 'Furnishings & Equipment', color: 'bg-orange-500' },
  { value: 'marketing', label: 'Marketing & Advertising', color: 'bg-pink-500' },
  { value: 'insurance', label: 'Insurance', color: 'bg-red-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

// Mock revenue data from bookings
const MOCK_REVENUE = {
  direct: 4850,
  channel: 3200,
  total: 8050
};

export function AdminAccounting() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      merchant: 'Mitre 10',
      amount: 234.50,
      gst: 30.59,
      category: 'maintenance',
      date: '2026-03-15',
      description: 'Paint and brushes for room refresh'
    },
    {
      id: 2,
      merchant: 'Countdown',
      amount: 156.80,
      gst: 20.45,
      category: 'consumables',
      date: '2026-03-14',
      description: 'Cat food, treats, and litter'
    },
    {
      id: 3,
      merchant: 'Clean & Tidy Ltd',
      amount: 320.00,
      gst: 41.74,
      category: 'cleaning',
      date: '2026-03-12',
      description: 'Deep clean of all rooms'
    },
    {
      id: 4,
      merchant: 'Contact Energy',
      amount: 187.25,
      gst: 24.42,
      category: 'utilities',
      date: '2026-03-10',
      description: 'Monthly electricity bill'
    },
  ]);

  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    merchant: '',
    amount: 0,
    gst: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Sample bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: 1,
      customerName: "Lisa Anderson",
      customerEmail: "lisa@email.com",
      customerPhone: "021 123 4567",
      catNames: ["Bella"],
      checkIn: "2026-03-26",
      checkOut: "2026-04-02",
      roomType: "Private Room",
      roomNumber: "9",
      status: "confirmed",
      paymentStatus: "paid",
      total: 210,
      nights: 7,
      receivedDate: "2026-03-15T10:30:00",
      specialRequirements: "Bella loves salmon treats"
    },
    {
      id: 2,
      customerName: "James Brown",
      customerEmail: "james@email.com",
      customerPhone: "021 234 5678",
      catNames: ["Oliver"],
      checkIn: "2026-03-25",
      checkOut: "2026-03-29",
      roomType: "Indoor Room",
      roomNumber: "5",
      status: "confirmed",
      paymentStatus: "paid",
      total: 120,
      nights: 4,
      receivedDate: "2026-03-16T14:20:00",
      specialRequirements: ""
    },
    {
      id: 3,
      customerName: "Sarah Johnson",
      customerEmail: "sarah@email.com",
      customerPhone: "021 345 6789",
      catNames: ["Whiskers", "Luna"],
      checkIn: "2026-03-18",
      checkOut: "2026-03-25",
      roomType: "Private Room",
      roomNumber: "3",
      status: "confirmed",
      paymentStatus: "pending",
      total: 280,
      nights: 7,
      receivedDate: "2026-03-10T09:15:00",
      specialRequirements: "Both cats need medication at 8am daily"
    },
    {
      id: 4,
      customerName: "Mike Chen",
      customerEmail: "mike@email.com",
      customerPhone: "021 456 7890",
      catNames: ["Shadow"],
      checkIn: "2026-03-20",
      checkOut: "2026-03-27",
      roomType: "Indoor Room",
      roomNumber: "7",
      status: "confirmed",
      paymentStatus: "unpaid",
      total: 140,
      nights: 7,
      receivedDate: "2026-03-12T16:45:00",
      specialRequirements: "Shadow is shy, needs quiet room"
    },
  ]);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGstPaid = expenses.reduce((sum, exp) => sum + exp.gst, 0);
  const gstCollected = MOCK_REVENUE.total * 0.15; // 15% GST on revenue
  const gstOwed = gstCollected - totalGstPaid;
  const netProfit = MOCK_REVENUE.total - totalExpenses;
  const profitMargin = (netProfit / MOCK_REVENUE.total) * 100;

  // Calculate expenses by category
  const expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({
    ...cat,
    total: expenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(cat => cat.total > 0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingReceipt(true);
    
    // Simulate AI OCR processing
    setTimeout(() => {
      // Mock extracted data
      const mockExtractedData = {
        merchant: 'The Warehouse',
        amount: 89.95,
        gst: 11.74,
        category: 'furnishings',
        date: new Date().toISOString().split('T')[0],
        description: 'Cat beds and scratching posts',
        receiptUrl: URL.createObjectURL(file)
      };

      setNewExpense(mockExtractedData);
      setIsProcessingReceipt(false);
      setShowAddExpense(true);
    }, 2000);
  };

  const handleCameraCapture = () => {
    // Trigger file input to open camera on mobile
    const fileInput = document.getElementById('receipt-camera') as HTMLInputElement;
    fileInput?.click();
  };

  const handleAddExpense = () => {
    if (!newExpense.merchant || !newExpense.amount || !newExpense.category) {
      return;
    }

    const expense: Expense = {
      id: expenses.length + 1,
      merchant: newExpense.merchant!,
      amount: newExpense.amount!,
      gst: newExpense.gst || newExpense.amount! * 0.13043, // Calculate GST (15/115)
      category: newExpense.category!,
      date: newExpense.date!,
      description: newExpense.description || '',
      receiptUrl: newExpense.receiptUrl
    };

    setExpenses([...expenses, expense]);
    setShowAddExpense(false);
    setNewExpense({
      merchant: '',
      amount: 0,
      gst: 0,
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const getCategoryLabel = (value: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === value)?.color || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0A1128]">Accounting & GST</h1>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="gst">GST</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-700" />
                    <div className="text-xs text-green-700">Revenue</div>
                  </div>
                  <div className="text-2xl font-bold text-green-900">${MOCK_REVENUE.total.toLocaleString()}</div>
                  <div className="text-xs text-green-700 mt-1">This month</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingDown className="w-4 h-4 text-red-700" />
                    <div className="text-xs text-red-700">Expenses</div>
                  </div>
                  <div className="text-2xl font-bold text-red-900">${totalExpenses.toLocaleString()}</div>
                  <div className="text-xs text-red-700 mt-1">This month</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-blue-700" />
                    <div className="text-xs text-blue-700">Net Profit</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">${netProfit.toLocaleString()}</div>
                  <div className="text-xs text-blue-700 mt-1">{profitMargin.toFixed(1)}% margin</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <div className="text-xs text-amber-700">GST Owed</div>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">${gstOwed.toLocaleString()}</div>
                  <div className="text-xs text-amber-700 mt-1">To IRD</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start bg-[#C46A3A] hover:bg-[#C46A3A]/90 h-9"
                  onClick={() => setShowAddExpense(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Expense
                </Button>
                <Button 
                  className="w-full justify-start bg-[#0A1128] hover:bg-[#0A1128]/90 h-9"
                  onClick={handleCameraCapture}
                  disabled={isProcessingReceipt}
                >
                  {isProcessingReceipt ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  {isProcessingReceipt ? 'Processing...' : 'Capture Receipt'}
                </Button>
                <input 
                  id="receipt-camera"
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => setActiveTab('reports')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-9"
                  onClick={() => setActiveTab('gst')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  File GST Return
                </Button>
              </CardContent>
            </Card>

            {/* Expenses Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expensesByCategory.map((cat) => (
                  <div key={cat.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      <span className="text-sm">{cat.label}</span>
                    </div>
                    <span className="font-semibold">${cat.total.toFixed(2)}</span>
                  </div>
                ))}
                {expensesByCategory.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No expenses recorded yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#0A1128]">All Expenses</h2>
              <Button 
                size="sm"
                className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 h-8"
                onClick={() => setShowAddExpense(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-[#0A1128]">{expense.merchant}</div>
                        <div className="text-sm text-gray-600 mt-1">{expense.description}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`${getCategoryColor(expense.category)} text-white text-xs`}
                          >
                            {getCategoryLabel(expense.category)}
                          </Badge>
                          <span className="text-xs text-gray-500">{expense.date}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-[#0A1128]">${expense.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">GST: ${expense.gst.toFixed(2)}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {expenses.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-4">No expenses recorded yet</p>
                  <Button 
                    className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 h-9"
                    onClick={() => setShowAddExpense(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Expense
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#0A1128]">Profit & Loss Statement</h2>
              <Button size="sm" variant="outline" className="h-8">
                <Download className="w-4 h-4 mr-1" />
                Export PDF
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Direct Bookings</span>
                  <span className="font-semibold">${MOCK_REVENUE.direct.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Channel Bookings</span>
                  <span className="font-semibold">${MOCK_REVENUE.channel.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Revenue</span>
                  <span className="text-green-600">${MOCK_REVENUE.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {expensesByCategory.map((cat) => (
                  <div key={cat.value} className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="text-gray-600">{cat.label}</span>
                    </div>
                    <span className="font-semibold">${cat.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t font-semibold">
                  <span>Total Expenses</span>
                  <span className="text-red-600">${totalExpenses.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-blue-700 mb-1">Net Profit</div>
                    <div className="text-3xl font-bold text-blue-900">${netProfit.toFixed(2)}</div>
                    <div className="text-sm text-blue-700 mt-1">
                      {profitMargin.toFixed(1)}% profit margin
                    </div>
                  </div>
                  <PieChart className="w-12 h-12 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GST & Tax Tab */}
          <TabsContent value="gst" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">GST Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">GST Collected (on sales)</span>
                  <span className="font-semibold">${gstCollected.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST Paid (on expenses)</span>
                  <span className="font-semibold">${totalGstPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-semibold">GST Owed to IRD</span>
                  <span className="text-lg font-bold text-[#C46A3A]">${gstOwed.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File GST Return</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-900">Next Filing Due</div>
                      <div className="text-sm text-blue-700">28 March 2026</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filing Period</Label>
                  <Select defaultValue="march-2026">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="march-2026">March 2026</SelectItem>
                      <SelectItem value="february-2026">February 2026</SelectItem>
                      <SelectItem value="january-2026">January 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-[#C46A3A] hover:bg-[#C46A3A]/90 h-9">
                  <FileText className="w-4 h-4 mr-2" />
                  File GST Return
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  This will prepare your GST return for submission to IRD
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tax Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  The following expense categories may be tax deductible:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-1.5" />
                    <span>Business operating expenses (utilities, cleaning, maintenance)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-1.5" />
                    <span>Consumables and supplies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-1.5" />
                    <span>Marketing and advertising costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C46A3A] mt-1.5" />
                    <span>Insurance premiums</span>
                  </li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  Consult with your accountant for specific tax advice
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              {isProcessingReceipt ? 'AI is reading your receipt...' : 'Enter expense details or upload a receipt'}
            </DialogDescription>
          </DialogHeader>

          {isProcessingReceipt ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-[#C46A3A] mb-4" />
              <p className="text-sm text-gray-600">Processing receipt...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full h-9"
                  onClick={handleCameraCapture}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-9"
                  onClick={() => {
                    const input = document.getElementById('receipt-upload') as HTMLInputElement;
                    input?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <input 
                  id="receipt-upload"
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="merchant">Merchant / Supplier</Label>
                  <Input
                    id="merchant"
                    value={newExpense.merchant || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })}
                    placeholder="e.g., Mitre 10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="amount">Amount (incl GST)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newExpense.amount || ''}
                      onChange={(e) => {
                        const amount = parseFloat(e.target.value);
                        const gst = amount * 0.13043; // GST component (15/115)
                        setNewExpense({ ...newExpense, amount, gst });
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gst">GST</Label>
                    <Input
                      id="gst"
                      type="number"
                      step="0.01"
                      value={newExpense.gst?.toFixed(2) || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newExpense.category || ''} 
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newExpense.description || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="What was this expense for?"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpense(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-[#C46A3A] hover:bg-[#C46A3A]/90 h-9"
              onClick={handleAddExpense}
              disabled={!newExpense.merchant || !newExpense.amount || !newExpense.category}
            >
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}