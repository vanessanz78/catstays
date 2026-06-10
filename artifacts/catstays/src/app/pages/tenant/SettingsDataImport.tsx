import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Upload, 
  Download,
  Database,
  Shield,
  Users,
  Cat,
  Calendar,
  FileText,
  ChevronRight
} from 'lucide-react';
import { DataImportFlow } from '../onboarding/DataImportFlow';

export function SettingsDataImport() {
  const [showImportFlow, setShowImportFlow] = useState(false);
  const [exportType, setExportType] = useState<'customers' | 'pets' | 'bookings' | 'all' | null>(null);

  const handleExport = (type: 'customers' | 'pets' | 'bookings' | 'all') => {
    setExportType(type);
    // Simulate export - in production this would trigger a CSV/Excel download
    setTimeout(() => {
      alert(`Exporting ${type}... Download starting soon!`);
      setExportType(null);
    }, 1000);
  };

  const handleImportComplete = () => {
    setShowImportFlow(false);
    alert('Data imported successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Data Import & Export
        </h1>
        <p className="text-[#0A1128]/60">
          Import your existing data or export your CatStays data for backups
        </p>
      </div>

      {/* Import Section */}
      <Card className="border-[#0A1128]/10 shadow-lg rounded-2xl">
        <CardHeader className="border-b border-[#0A1128]/5 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C46A3A]/10 flex items-center justify-center flex-shrink-0">
              <Upload className="w-6 h-6 text-[#C46A3A]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-serif text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Import Data
              </CardTitle>
              <CardDescription className="text-base">
                Upload a CSV or Excel file to import customers, pets, and bookings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* What Can Be Imported */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-[#F8F7F5] border border-blue-100">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Customers</p>
                <p className="text-xs text-[#0A1128]/60">Contact details</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-[#F8F7F5] border border-green-100">
              <Cat className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Pets</p>
                <p className="text-xs text-[#0A1128]/60">Profiles & notes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-[#F8F7F5] border border-purple-100">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Bookings</p>
                <p className="text-xs text-[#0A1128]/60">Past & upcoming</p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-3 bg-gradient-to-br from-[#F8F7F5] to-white border border-[#0A1128]/10 rounded-xl p-4 mb-6">
            <Shield className="w-5 h-5 text-[#4F6F5A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#0A1128] font-medium mb-1">Your data is secure</p>
              <p className="text-sm text-[#0A1128]/60">
                All imports are encrypted and only accessible by you. Our AI automatically maps your data — no manual field mapping required.
              </p>
            </div>
          </div>

          {/* Import Button */}
          <Button
            size="lg"
            className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl py-6"
            onClick={() => setShowImportFlow(true)}
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Data from File
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className="border-[#0A1128]/10 shadow-lg rounded-2xl">
        <CardHeader className="border-b border-[#0A1128]/5 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#4F6F5A]/10 flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-[#4F6F5A]" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-serif text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Export Data
              </CardTitle>
              <CardDescription className="text-base">
                Download your data as CSV or Excel files for backups or migration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Export Customers */}
            <button
              onClick={() => handleExport('customers')}
              disabled={exportType === 'customers'}
              className="text-left p-6 rounded-xl border-2 border-[#0A1128]/10 hover:border-blue-200 hover:bg-blue-50/50 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Users className="w-6 h-6 text-blue-600" />
                <FileText className="w-5 h-5 text-[#0A1128]/20 group-hover:text-blue-600 transition-colors" />
              </div>
              <h4 className="font-semibold text-[#0A1128] mb-1">Export Customers</h4>
              <p className="text-sm text-[#0A1128]/60">Names, emails, phone numbers</p>
            </button>

            {/* Export Pets */}
            <button
              onClick={() => handleExport('pets')}
              disabled={exportType === 'pets'}
              className="text-left p-6 rounded-xl border-2 border-[#0A1128]/10 hover:border-green-200 hover:bg-green-50/50 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Cat className="w-6 h-6 text-green-600" />
                <FileText className="w-5 h-5 text-[#0A1128]/20 group-hover:text-green-600 transition-colors" />
              </div>
              <h4 className="font-semibold text-[#0A1128] mb-1">Export Pets</h4>
              <p className="text-sm text-[#0A1128]/60">Profiles, breeds, medical notes</p>
            </button>

            {/* Export Bookings */}
            <button
              onClick={() => handleExport('bookings')}
              disabled={exportType === 'bookings'}
              className="text-left p-6 rounded-xl border-2 border-[#0A1128]/10 hover:border-purple-200 hover:bg-purple-50/50 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                <FileText className="w-5 h-5 text-[#0A1128]/20 group-hover:text-purple-600 transition-colors" />
              </div>
              <h4 className="font-semibold text-[#0A1128] mb-1">Export Bookings</h4>
              <p className="text-sm text-[#0A1128]/60">Dates, rooms, payment status</p>
            </button>

            {/* Export All */}
            <button
              onClick={() => handleExport('all')}
              disabled={exportType === 'all'}
              className="text-left p-6 rounded-xl border-2 border-[#C46A3A]/30 bg-gradient-to-br from-[#C46A3A]/5 to-transparent hover:border-[#C46A3A] hover:bg-[#C46A3A]/10 transition-all group disabled:opacity-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Database className="w-6 h-6 text-[#C46A3A]" />
                <FileText className="w-5 h-5 text-[#C46A3A]/40 group-hover:text-[#C46A3A] transition-colors" />
              </div>
              <h4 className="font-semibold text-[#0A1128] mb-1">Export Full Dataset</h4>
              <p className="text-sm text-[#0A1128]/60">Complete backup of all data</p>
            </button>
          </div>

          {/* Export Note */}
          <div className="mt-6 p-4 bg-[#F8F7F5] rounded-xl">
            <p className="text-sm text-[#0A1128]/70">
              📁 Exports are generated as CSV files compatible with Excel, Google Sheets, and other tools.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Flow Modal */}
      {showImportFlow && (
        <DataImportFlow
          onComplete={handleImportComplete}
          onCancel={() => setShowImportFlow(false)}
        />
      )}
    </div>
  );
}
