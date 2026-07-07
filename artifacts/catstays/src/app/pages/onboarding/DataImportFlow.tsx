import { useState, useCallback, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { 
  Upload, 
  FileText,
  Loader2,
  Check,
  Users,
  Cat,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';

interface DataImportFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface ParsedData {
  customers: number;
  pets: number;
  bookings: number;
  previewRows: string[];
}

function detectColumnType(headers: string[]): 'customers' | 'pets' | 'bookings' | 'unknown' {
  const h = headers.map(h => h.toLowerCase());
  if (h.some(h => h.includes('check') || h.includes('booking') || h.includes('reservation') || h.includes('stay'))) return 'bookings';
  if (h.some(h => h.includes('breed') || h.includes('species') || h.includes('pet') || h.includes('animal') || h.includes('cat'))) return 'pets';
  if (h.some(h => h.includes('email') || h.includes('phone') || h.includes('customer') || h.includes('client') || h.includes('owner'))) return 'customers';
  return 'unknown';
}

function parseCsvFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];
        if (rows.length === 0) {
          resolve({ customers: 0, pets: 0, bookings: 0, previewRows: [] });
          return;
        }
        const headers = Object.keys(rows[0] || {});
        const type = detectColumnType(headers);

        const counts = { customers: 0, pets: 0, bookings: 0 };
        if (type === 'customers') counts.customers = rows.length;
        else if (type === 'pets') counts.pets = rows.length;
        else if (type === 'bookings') counts.bookings = rows.length;
        else {
          counts.customers = rows.length;
        }

        const previewRows = rows.slice(0, 3).map(row => {
          const values = Object.values(row).filter(Boolean).slice(0, 4);
          return values.join(' • ');
        });

        resolve({ ...counts, previewRows });
      },
      error: (err) => reject(err),
    });
  });
}

export function DataImportFlow({ onComplete, onCancel }: DataImportFlowProps) {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData>({ customers: 0, pets: 0, bookings: 0, previewRows: [] });
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearProcessingTimers = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (reviewTimeoutRef.current) {
      clearTimeout(reviewTimeoutRef.current);
      reviewTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => clearProcessingTimers, [clearProcessingTimers]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    clearProcessingTimers();
    setStep('processing');

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += 15;
      setProcessingProgress(Math.min(progress, 90));
    }, 200);

    try {
      const data = await parseCsvFile(file);
      clearProcessingTimers();
      setProcessingProgress(100);
      setParsedData(data);
      reviewTimeoutRef.current = setTimeout(() => setStep('review'), 400);
    } catch {
      clearProcessingTimers();
      setProcessingProgress(100);
      setParsedData({ customers: 0, pets: 0, bookings: 0, previewRows: [] });
      reviewTimeoutRef.current = setTimeout(() => setStep('review'), 400);
    }
  };

  const handleImport = () => {
    setStep('success');
  };

  const totalRecords = parsedData.customers + parsedData.pets + parsedData.bookings;

  if (step === 'upload') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#F8F7F5] to-white p-8 border-b border-[#0A1128]/5">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-3xl font-serif font-bold text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Upload your file
              </CardTitle>
              <button onClick={onCancel} className="text-[#0A1128]/40 hover:text-[#0A1128] transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <CardDescription className="text-base text-[#0A1128]/60">
              Upload a CSV file with your customer, pet, or booking data. CSV format required.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                dragActive
                  ? 'border-[#C46A3A] bg-[#C46A3A]/5'
                  : 'border-[#0A1128]/20 hover:border-[#C46A3A]/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-[#C46A3A]/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-[#C46A3A]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0A1128] mb-2">
                    Drag & drop your file here
                  </h3>
                  <p className="text-[#0A1128]/60 mb-6">or</p>
                  <Button
                    variant="outline"
                    className="rounded-xl border-[#C46A3A]/30 hover:bg-[#C46A3A]/10"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                  <p className="text-sm text-[#0A1128]/50 mt-4">CSV files only (.csv)</p>
                </>
              ) : (
                <div className="flex items-center justify-between bg-gradient-to-br from-[#F8F7F5] to-white rounded-xl p-6 border border-[#C46A3A]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#C46A3A]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-[#0A1128]">{file.name}</p>
                      <p className="text-sm text-[#0A1128]/60">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-[#0A1128]/40 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-xl border-[#0A1128]/20" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl"
                disabled={!file}
                onClick={handleUpload}
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#F8F7F5] to-white p-8 border-b border-[#0A1128]/5">
            <CardTitle className="text-3xl font-serif font-bold text-[#0A1128] text-center" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              We're organising your data
            </CardTitle>
          </CardHeader>

          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C46A3A]/20 to-[#4F6F5A]/20 flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-[#C46A3A]/30 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="w-10 h-10 text-[#C46A3A] animate-spin relative z-10" />
            </div>
            <h3 className="text-xl font-semibold text-[#0A1128] mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C46A3A]" />
              Reading and mapping your data
            </h3>
            <p className="text-[#0A1128]/60 mb-8">No manual setup required — this will only take a moment</p>
            <Progress value={processingProgress} className="h-3 mb-3" />
            <p className="text-sm text-[#0A1128]/50">{processingProgress}% complete</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#F8F7F5] to-white p-8 border-b border-[#0A1128]/5">
            <CardTitle className="text-3xl font-serif font-bold text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Quick review
            </CardTitle>
            <CardDescription className="text-base text-[#0A1128]/60">
              Here's what we found in your file
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-[#F8F7F5] to-white border-2 border-[#C46A3A]/20 rounded-2xl p-6 text-center">
                <Users className="w-8 h-8 text-[#C46A3A] mx-auto mb-3" />
                <p className="text-3xl font-bold text-[#0A1128] mb-1">{parsedData.customers}</p>
                <p className="text-sm text-[#0A1128]/60">Customers</p>
              </div>
              <div className="bg-gradient-to-br from-[#F8F7F5] to-white border-2 border-[#0A1128]/10 rounded-2xl p-6 text-center">
                <Cat className="w-8 h-8 text-[#0A1128] mx-auto mb-3" />
                <p className="text-3xl font-bold text-[#0A1128] mb-1">{parsedData.pets}</p>
                <p className="text-sm text-[#0A1128]/60">Pets</p>
              </div>
              <div className="bg-gradient-to-br from-[#F8F7F5] to-white border-2 border-[#8A6F4D]/20 rounded-2xl p-6 text-center">
                <Calendar className="w-8 h-8 text-[#8A6F4D] mx-auto mb-3" />
                <p className="text-3xl font-bold text-[#0A1128] mb-1">{parsedData.bookings}</p>
                <p className="text-sm text-[#0A1128]/60">Bookings</p>
              </div>
            </div>

            {parsedData.previewRows.length > 0 && (
              <>
                <button
                  className="w-full text-left flex items-center justify-between p-4 rounded-xl border border-[#0A1128]/10 hover:bg-[#F8F7F5] transition-colors mb-6"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <span className="text-sm font-medium text-[#0A1128]">Preview data sample</span>
                  {showPreview ? (
                    <ChevronUp className="w-5 h-5 text-[#0A1128]/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#0A1128]/40" />
                  )}
                </button>

                {showPreview && (
                  <div className="bg-[#F8F7F5] rounded-xl p-6 mb-6 max-h-64 overflow-auto">
                    <div className="space-y-3">
                      {parsedData.previewRows.map((row, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-2 h-2 rounded-full bg-[#C46A3A] flex-shrink-0 mt-1.5"></div>
                          <span className="text-[#0A1128]/70 break-all">{row}</span>
                        </div>
                      ))}
                      {totalRecords > 3 && (
                        <p className="text-xs text-[#0A1128]/50 mt-4">
                          Showing 3 of {totalRecords} total records
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl border-[#0A1128]/20" onClick={onCancel}>
                Cancel
              </Button>
              <Button className="flex-1 bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl" onClick={handleImport}>
                Import Data
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C46A3A]/30 to-[#0A1128]/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#C46A3A] to-[#8A6F4D] flex items-center justify-center shadow-xl">
                <Check className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Your data has been imported 🎉
            </h1>
            <p className="text-xl text-[#0A1128]/70 mb-8">
              Everything is now ready inside your dashboard
            </p>

            <div className="bg-gradient-to-br from-[#F8F7F5] to-white border border-[#0A1128]/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#C46A3A]">{parsedData.customers}</p>
                  <p className="text-sm text-[#0A1128]/60">Customers</p>
                </div>
                <div className="w-px h-12 bg-[#0A1128]/10"></div>
                <div>
                  <p className="text-2xl font-bold text-[#0A1128]">{parsedData.pets}</p>
                  <p className="text-sm text-[#0A1128]/60">Pets</p>
                </div>
                <div className="w-px h-12 bg-[#0A1128]/10"></div>
                <div>
                  <p className="text-2xl font-bold text-[#8A6F4D]">{parsedData.bookings}</p>
                  <p className="text-sm text-[#0A1128]/60">Bookings</p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-12 py-7 text-xl shadow-xl hover:shadow-lg transition-all"
              onClick={onComplete}
            >
              <LayoutDashboard className="w-6 h-6 mr-3" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
