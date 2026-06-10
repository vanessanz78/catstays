import { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { 
  Upload,
  FileText,
  Sparkles,
  Users,
  PawPrint,
  Calendar,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
  Brain,
  Zap,
  Download
} from 'lucide-react';

type ImportStep = 'upload' | 'processing' | 'results' | 'success';

interface ImportResults {
  customers: number;
  pets: number;
  bookings: number;
  preview: {
    customers: Array<{ name: string; email: string; phone: string }>;
    pets: Array<{ name: string; breed: string; owner: string }>;
    bookings: Array<{ customer: string; dates: string; room: string }>;
  };
}

export function SmartDataImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showIcons, setShowIcons] = useState({ customers: false, pets: false, bookings: false });
  const [results, setResults] = useState<ImportResults | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate AI processing
  useEffect(() => {
    if (currentStep === 'processing') {
      // Progress animation
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      // Icon reveal animation
      setTimeout(() => setShowIcons({ customers: true, pets: false, bookings: false }), 800);
      setTimeout(() => setShowIcons({ customers: true, pets: true, bookings: false }), 1400);
      setTimeout(() => setShowIcons({ customers: true, pets: true, bookings: true }), 2000);

      // Move to results
      setTimeout(() => {
        setResults({
          customers: 124,
          pets: 87,
          bookings: 312,
          preview: {
            customers: [
              { name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0123' },
              { name: 'Mike Chen', email: 'mike@email.com', phone: '555-0124' },
              { name: 'Emma Davis', email: 'emma@email.com', phone: '555-0125' },
            ],
            pets: [
              { name: 'Fluffy', breed: 'Persian', owner: 'Sarah Johnson' },
              { name: 'Whiskers', breed: 'Maine Coon', owner: 'Mike Chen' },
              { name: 'Shadow', breed: 'British Shorthair', owner: 'Emma Davis' },
            ],
            bookings: [
              { customer: 'Sarah Johnson', dates: 'Mar 20-25, 2026', room: 'Deluxe Suite' },
              { customer: 'Mike Chen', dates: 'Apr 1-5, 2026', room: 'Standard Room' },
              { customer: 'Emma Davis', dates: 'Apr 10-15, 2026', room: 'Premium Villa' },
            ],
          },
        });
        setCurrentStep('results');
      }, 3000);

      return () => clearInterval(progressInterval);
    }
  }, [currentStep]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setFileName(file.name);
      setCurrentStep('processing');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setCurrentStep('processing');
    }
  };

  const handleImport = () => {
    setCurrentStep('success');
    // Confetti would trigger here
  };

  // STEP 1: UPLOAD
  if (currentStep === 'upload') {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#C46A3A]/10 text-[#C46A3A] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Import
            </div>
            <h1 className="text-5xl font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
              Bring your data with you
            </h1>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter' }}>
              Upload your CSV or Excel file and let AI do the rest
            </p>
          </div>

          {/* Drag & Drop Zone */}
          <Card
            className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-[#C46A3A] bg-[#C46A3A]/5 scale-105'
                : 'border-gray-300 hover:border-[#C46A3A]/50 hover:bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-16 text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 transition-all duration-300 ${
                isDragging ? 'bg-[#C46A3A] scale-110' : 'bg-[#C46A3A]/10'
              }`}>
                <Upload className={`w-10 h-10 transition-colors ${
                  isDragging ? 'text-white' : 'text-[#C46A3A]'
                }`} />
              </div>

              <h3 className="text-2xl font-bold text-[#0A1128] mb-3" style={{ fontFamily: 'Playfair Display' }}>
                Drop your file here
              </h3>
              <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter' }}>
                or click to browse
              </p>

              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CSV
                </div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </div>
              </div>
            </div>
          </Card>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-gray-900">Customers</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-50 text-purple-600 mb-3">
                <PawPrint className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-gray-900">Pets</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-gray-900">Bookings</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: PROCESSING
  if (currentStep === 'processing') {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
              We're organizing your data
            </h1>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter' }}>
              Our AI is mapping your data automatically
            </p>
          </div>

          {/* AI Animation */}
          <div className="relative mb-12">
            <div className="flex items-center justify-center gap-8">
              {/* File Icon */}
              <div className="relative">
                <div className="w-20 h-20 bg-white rounded-xl shadow-lg flex items-center justify-center animate-pulse">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName}
                </div>
              </div>

              {/* Arrow with particles */}
              <div className="relative">
                <ArrowRight className="w-8 h-8 text-[#C46A3A] animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-[#C46A3A] rounded-full animate-ping"
                      style={{
                        animationDelay: `${i * 200}ms`,
                        left: `${i * 10}px`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI Brain */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C46A3A] to-[#A85A30] rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Brain className="w-12 h-12 text-white" />
                  <div className="absolute inset-0 rounded-full bg-[#C46A3A] opacity-50 animate-ping" />
                </div>
                <Zap className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-bounce" />
              </div>

              {/* Arrow */}
              <div className="relative">
                <ArrowRight className="w-8 h-8 text-[#C46A3A] animate-pulse" />
              </div>

              {/* Structured Data Icons */}
              <div className="flex flex-col gap-3">
                {/* Customers */}
                <div
                  className={`w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-500 ${
                    showIcons.customers ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                >
                  <Users className="w-8 h-8 text-blue-600" />
                </div>

                {/* Pets */}
                <div
                  className={`w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-500 ${
                    showIcons.pets ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: '200ms' }}
                >
                  <PawPrint className="w-8 h-8 text-purple-600" />
                </div>

                {/* Bookings */}
                <div
                  className={`w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center transition-all duration-500 ${
                    showIcons.bookings ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: '400ms' }}
                >
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Card className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Processing...</span>
                <span className="font-semibold text-[#C46A3A]">{processingProgress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C46A3A] to-[#A85A30] rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>

            {/* Status Messages */}
            <div className="mt-6 space-y-2">
              <div className={`flex items-center gap-2 text-sm transition-opacity ${
                processingProgress > 30 ? 'opacity-100' : 'opacity-0'
              }`}>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Analyzing file structure</span>
              </div>
              <div className={`flex items-center gap-2 text-sm transition-opacity ${
                processingProgress > 60 ? 'opacity-100' : 'opacity-0'
              }`}>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Mapping data fields</span>
              </div>
              <div className={`flex items-center gap-2 text-sm transition-opacity ${
                processingProgress > 90 ? 'opacity-100' : 'opacity-0'
              }`}>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Validating records</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // STEP 3: RESULTS
  if (currentStep === 'results' && results) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-5xl font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
              We found your data
            </h1>
            <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter' }}>
              Everything looks great and ready to import
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Customers */}
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A1128]">{results.customers}</div>
                  <div className="text-sm text-gray-600">Customers</div>
                </div>
              </div>
            </Card>

            {/* Pets */}
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <PawPrint className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A1128]">{results.pets}</div>
                  <div className="text-sm text-gray-600">Pets</div>
                </div>
              </div>
            </Card>

            {/* Bookings */}
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A1128]">{results.bookings}</div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview Tables */}
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
              Data Preview
            </h3>

            {/* Customers Preview */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">Customers (showing 3 of {results.customers})</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {results.preview.customers.map((customer, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 px-4 text-gray-900">{customer.name}</td>
                        <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                        <td className="py-3 px-4 text-gray-600">{customer.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pets Preview */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <PawPrint className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-700">Pets (showing 3 of {results.pets})</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Breed</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {results.preview.pets.map((pet, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 px-4 text-gray-900">{pet.name}</td>
                        <td className="py-3 px-4 text-gray-600">{pet.breed}</td>
                        <td className="py-3 px-4 text-gray-600">{pet.owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bookings Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-gray-700">Bookings (showing 3 of {results.bookings})</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Dates</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Room</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {results.preview.bookings.map((booking, i) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 px-4 text-gray-900">{booking.customer}</td>
                        <td className="py-3 px-4 text-gray-600">{booking.dates}</td>
                        <td className="py-3 px-4 text-gray-600">{booking.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* CTA */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setCurrentStep('upload');
                setFileName('');
                setProcessingProgress(0);
                setResults(null);
              }}
            >
              Cancel
            </Button>
            <Button
              size="lg"
              className="bg-[#C46A3A] hover:bg-[#A85A30] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
              onClick={handleImport}
            >
              Import Data
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: SUCCESS
  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Confetti Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                backgroundColor: ['#C46A3A', '#4F6F5A', '#FFD700', '#FF69B4', '#87CEEB'][i % 5],
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-2xl w-full text-center relative z-10">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-2xl animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Header */}
          <h1 className="text-6xl font-bold text-[#0A1128] mb-4" style={{ fontFamily: 'Playfair Display' }}>
            Your data is ready 🎉
          </h1>
          <p className="text-2xl text-gray-600 mb-8" style={{ fontFamily: 'Inter' }}>
            Successfully imported {results?.customers} customers, {results?.pets} pets, and {results?.bookings} bookings
          </p>

          {/* Success Stats */}
          <Card className="p-8 mb-8 bg-white/80 backdrop-blur">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{results?.customers}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">{results?.pets}</div>
                <div className="text-sm text-gray-600">Pets</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">{results?.bookings}</div>
                <div className="text-sm text-gray-600">Bookings</div>
              </div>
            </div>
          </Card>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#C46A3A] hover:bg-[#A85A30] text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all group"
              onClick={() => window.location.href = '/admin'}
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
              onClick={() => {
                setCurrentStep('upload');
                setFileName('');
                setProcessingProgress(0);
                setResults(null);
              }}
            >
              <Download className="w-5 h-5 mr-2" />
              Import More Data
            </Button>
          </div>

          {/* Footer Message */}
          <p className="mt-8 text-gray-500 text-sm">
            That was ridiculously easy, wasn't it? 😊
          </p>
        </div>
      </div>
    );
  }

  return null;
}
