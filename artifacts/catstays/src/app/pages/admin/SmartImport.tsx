import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Upload,
  Users,
  Cat,
  Calendar,
  DoorOpen,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Download,
  Edit2,
  Trash2,
  Home,
  Eye,
  ArrowLeft,
  Check,
  X
} from 'lucide-react';
import { Link } from 'react-router';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-4cdbd524`;

type ImportStep = 'dashboard' | 'processing' | 'mapping' | 'newFields' | 'preview' | 'confirm' | 'success';
type ImportType = 'customers' | 'cats' | 'bookings' | 'rooms' | null;

interface ColumnMapping {
  userColumn: string;
  systemField: string;
  confidence: number;
  needsConfirmation: boolean;
}

interface NewField {
  name: string;
  type: string;
  include: boolean;
}

export function SmartImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('dashboard');
  const [importType, setImportType] = useState<ImportType>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mappingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProcessingTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (mappingTimeoutRef.current) {
      clearTimeout(mappingTimeoutRef.current);
      mappingTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearProcessingTimers, [clearProcessingTimers]);
  
  // Sample data for field mapping
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([
    { userColumn: 'Customer Name', systemField: 'Name', confidence: 98, needsConfirmation: false },
    { userColumn: 'Phone Number', systemField: 'Phone', confidence: 95, needsConfirmation: false },
    { userColumn: 'Email Address', systemField: 'Email', confidence: 99, needsConfirmation: false },
    { userColumn: 'Address', systemField: 'Address', confidence: 92, needsConfirmation: false },
    { userColumn: 'Emergency Contact', systemField: 'Emergency Contact', confidence: 65, needsConfirmation: true },
  ]);

  const [newFields, setNewFields] = useState<NewField[]>([
    { name: 'Feeding Instructions', type: 'text', include: true },
    { name: 'Vet Contact', type: 'text', include: true },
    { name: 'Medication Notes', type: 'textarea', include: true },
  ]);

  const [previewData] = useState([
    { id: 1, name: 'Sarah Johnson', phone: '021-555-0123', email: 'sarah@email.com', address: '123 Main St, Auckland' },
    { id: 2, name: 'Mike Chen', phone: '021-555-0124', email: 'mike@email.com', address: '456 Queen St, Wellington' },
    { id: 3, name: 'Emma Wilson', phone: '021-555-0125', email: 'emma@email.com', address: '789 King St, Christchurch' },
  ]);

  const importCards = [
    {
      type: 'customers' as ImportType,
      icon: Users,
      title: 'Import Customers',
      description: 'Upload your customer database with contact details',
      color: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-600',
    },
    {
      type: 'cats' as ImportType,
      icon: Cat,
      title: 'Import Cats',
      description: 'Add cat profiles with medical and dietary information',
      color: 'from-terracotta/10 to-terracotta/5',
      iconColor: 'text-terracotta',
    },
    {
      type: 'bookings' as ImportType,
      icon: Calendar,
      title: 'Import Bookings',
      description: 'Transfer your past and future booking records',
      color: 'from-sage/10 to-sage/5',
      iconColor: 'text-sage',
    },
    {
      type: 'rooms' as ImportType,
      icon: DoorOpen,
      title: 'Import Rooms',
      description: 'Set up your room types and capacity information',
      color: 'from-purple-500/10 to-purple-500/5',
      iconColor: 'text-purple-600',
    },
  ];

  const handleFileUpload = (file: File) => {
    clearProcessingTimers();
    setUploadedFile(file);
    setCurrentStep('processing');
    setProcessingProgress(0);
    
    // Simulate AI processing
    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 10;
      setProcessingProgress(progress);
      if (progress >= 100) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        mappingTimeoutRef.current = setTimeout(() => setCurrentStep('mapping'), 500);
      }
    }, 200);
  };

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
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      handleFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleMappingChange = (index: number, newValue: string) => {
    const updated = [...columnMappings];
    updated[index].systemField = newValue;
    setColumnMappings(updated);
  };

  const toggleNewField = (index: number) => {
    const updated = [...newFields];
    updated[index].include = !updated[index].include;
    setNewFields(updated);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-navy/10 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/staff-dashboard">
                  <Button variant="ghost" size="sm" className="text-navy/70 hover:text-navy">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-serif font-semibold text-navy">
                Smart Import & Data Setup
              </h1>
              <p className="text-navy/60 mt-1">
                Upload your files and we'll automatically organize everything for you
              </p>
            </div>
            <Badge className="bg-terracotta/10 text-terracotta border-terracotta/20">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* SCREEN 1: Import Dashboard */}
        {currentStep === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {importCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.type}
                    className="border-navy/10 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                    onClick={() => setImportType(card.type)}
                  >
                    <div className={`bg-gradient-to-br ${card.color} p-8 flex items-center justify-center`}>
                      <div className={`w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center ${card.iconColor}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-serif text-navy group-hover:text-terracotta transition-colors">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                          isDragging && importType === card.type
                            ? 'border-terracotta bg-terracotta/5'
                            : 'border-navy/20 hover:border-terracotta/50 hover:bg-terracotta/5'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-8 h-8 text-navy/40 mx-auto mb-3" />
                        <p className="text-sm text-navy/70 mb-3">
                          Drag & drop your file here, or
                        </p>
                        <label className="cursor-pointer">
                          <Button className="bg-terracotta hover:bg-terracotta-dark text-white">
                            Choose File
                          </Button>
                          <input
                            type="file"
                            className="hidden"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-xs text-navy/50 mt-3">
                          Supports CSV and Excel files
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Export Section */}
            <Card className="border-navy/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-navy flex items-center gap-2">
                  <Download className="w-5 h-5 text-terracotta" />
                  Export Your Data
                </CardTitle>
                <CardDescription>
                  Download your existing CatStays data in CSV or Excel format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  <Button variant="outline" className="border-navy/20 text-navy hover:bg-navy/5">
                    <Users className="w-4 h-4 mr-2" />
                    Export Customers
                  </Button>
                  <Button variant="outline" className="border-navy/20 text-navy hover:bg-navy/5">
                    <Cat className="w-4 h-4 mr-2" />
                    Export Cats
                  </Button>
                  <Button variant="outline" className="border-navy/20 text-navy hover:bg-navy/5">
                    <Calendar className="w-4 h-4 mr-2" />
                    Export Bookings
                  </Button>
                  <Button variant="outline" className="border-navy/20 text-navy hover:bg-navy/5">
                    <DoorOpen className="w-4 h-4 mr-2" />
                    Export Rooms
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SCREEN 2: AI Processing */}
        {currentStep === 'processing' && (
          <Card className="border-navy/10 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta/20 to-sage/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Sparkles className="w-10 h-10 text-terracotta" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-navy mb-3">
                We're organizing your data…
              </h2>
              <p className="text-navy/60 mb-8">
                Our AI is matching your columns to the right fields
              </p>
              <Progress value={processingProgress} className="h-3 mb-4" />
              <p className="text-sm text-navy/50">{processingProgress}% complete</p>
            </CardContent>
          </Card>
        )}

        {/* SCREEN 3: Field Mapping */}
        {currentStep === 'mapping' && (
          <div className="space-y-6">
            <Card className="border-navy/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-navy">
                  Review & Confirm Your Data
                </CardTitle>
                <CardDescription>
                  We've matched your columns to our system fields. Please review and adjust if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {columnMappings.map((mapping, index) => (
                    <div
                      key={index}
                      className="grid md:grid-cols-2 gap-4 p-4 rounded-xl bg-cream border border-navy/10"
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-5 h-5 text-navy/40" />
                        <div>
                          <p className="text-sm font-medium text-navy">{mapping.userColumn}</p>
                          <p className="text-xs text-navy/50">Your column</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ArrowRight className="w-4 h-4 text-navy/30 hidden md:block" />
                        <Select
                          value={mapping.systemField}
                          onValueChange={(value) => handleMappingChange(index, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Name">Name</SelectItem>
                            <SelectItem value="Phone">Phone</SelectItem>
                            <SelectItem value="Email">Email</SelectItem>
                            <SelectItem value="Address">Address</SelectItem>
                            <SelectItem value="Emergency Contact">Emergency Contact</SelectItem>
                            <SelectItem value="Notes">Notes</SelectItem>
                          </SelectContent>
                        </Select>
                        {!mapping.needsConfirmation ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <Check className="w-3 h-3 mr-1" />
                            {mapping.confidence}%
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Confirm
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-navy/20 text-navy"
                onClick={() => setCurrentStep('dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="bg-terracotta hover:bg-terracotta-dark text-white"
                onClick={() => setCurrentStep('newFields')}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 4: New Fields */}
        {currentStep === 'newFields' && (
          <div className="space-y-6">
            <Card className="border-navy/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-navy">
                  New Fields Detected
                </CardTitle>
                <CardDescription>
                  We found some fields that aren't in our system yet. Would you like to add them?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {newFields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-xl bg-cream border border-navy/10"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={field.include}
                          onCheckedChange={() => toggleNewField(index)}
                        />
                        <div>
                          <p className="text-sm font-medium text-navy">{field.name}</p>
                          <p className="text-xs text-navy/50">Will be added as a custom field</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-navy/20 text-navy">
                        {field.type}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Custom fields will be added to your system
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        These new fields will appear in your customer profiles and can be edited anytime.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-navy/20 text-navy"
                onClick={() => setCurrentStep('mapping')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="bg-terracotta hover:bg-terracotta-dark text-white"
                onClick={() => setCurrentStep('preview')}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 5: Data Preview */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <Card className="border-navy/10 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-serif text-navy">
                  Preview Your Data
                </CardTitle>
                <CardDescription>
                  Review your imported data. You can edit or remove any incorrect entries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-navy/5 border-b border-navy/10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-navy/70 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-navy/70 uppercase">Phone</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-navy/70 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-navy/70 uppercase">Address</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-navy/70 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy/10">
                      {previewData.map((row) => (
                        <tr key={row.id} className="hover:bg-cream/50 transition-colors">
                          <td className="px-4 py-3 text-sm text-navy">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-navy/70">{row.phone}</td>
                          <td className="px-4 py-3 text-sm text-navy/70">{row.email}</td>
                          <td className="px-4 py-3 text-sm text-navy/70">{row.address}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 className="w-4 h-4 text-navy/60" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Trash2 className="w-4 h-4 text-red-600/60" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                className="border-navy/20 text-navy"
                onClick={() => setCurrentStep('newFields')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="bg-terracotta hover:bg-terracotta-dark text-white"
                onClick={() => setCurrentStep('confirm')}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 6: Confirm Import */}
        {currentStep === 'confirm' && (
          <div className="space-y-6">
            <Card className="border-navy/10 shadow-lg max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-navy">
                  Ready to Import
                </CardTitle>
                <CardDescription>
                  Here's a summary of what will be imported into your CatStays account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-3xl font-bold text-navy">120</p>
                      <p className="text-sm text-navy/60">Customers</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-terracotta/10 to-terracotta/5 border border-terracotta/20">
                      <Cat className="w-8 h-8 text-terracotta mx-auto mb-2" />
                      <p className="text-3xl font-bold text-navy">85</p>
                      <p className="text-sm text-navy/60">Cats</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-sage/10 to-sage/5 border border-sage/20">
                      <Calendar className="w-8 h-8 text-sage mx-auto mb-2" />
                      <p className="text-3xl font-bold text-navy">240</p>
                      <p className="text-sm text-navy/60">Bookings</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          This action cannot be undone
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          All data will be imported into your account. You can edit or delete individual records later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                className="border-navy/20 text-navy"
                onClick={() => setCurrentStep('preview')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                className="bg-terracotta hover:bg-terracotta-dark text-white px-8"
                onClick={() => setCurrentStep('success')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Everything
              </Button>
            </div>
          </div>
        )}

        {/* SCREEN 7: Success */}
        {currentStep === 'success' && (
          <Card className="border-navy/10 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-semibold text-navy mb-3">
                Your Data Is Ready
              </h2>
              <p className="text-navy/60 mb-8">
                Everything has been successfully imported and organized. You're all set!
              </p>
              
              <div className="grid md:grid-cols-3 gap-3 mb-8">
                <Link to="/staff-dashboard">
                  <Button className="w-full bg-terracotta hover:bg-terracotta-dark text-white">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/staff-dashboard/customers">
                  <Button variant="outline" className="w-full border-navy/20 text-navy hover:bg-navy/5">
                    <Users className="w-4 h-4 mr-2" />
                    View Customers
                  </Button>
                </Link>
                <Link to="/staff-dashboard/bookings">
                  <Button variant="outline" className="w-full border-navy/20 text-navy hover:bg-navy/5">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
              </div>

              <Button
                variant="ghost"
                className="text-navy/60"
                onClick={() => {
                  setCurrentStep('dashboard');
                  setUploadedFile(null);
                  setProcessingProgress(0);
                }}
              >
                Import More Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
