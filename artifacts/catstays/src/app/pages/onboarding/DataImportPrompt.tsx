import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { 
  Upload, 
  Database, 
  ArrowRight,
  Shield,
  Users,
  Calendar,
  Cat
} from 'lucide-react';

interface DataImportPromptProps {
  onImport: () => void;
  onSkip: () => void;
}

export function DataImportPrompt({ onImport, onSkip }: DataImportPromptProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-[#0A1128]/10 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-[#F8F7F5] to-white p-12 text-center border-b border-[#0A1128]/5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C46A3A]/10 to-[#4F6F5A]/10 flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-[#C46A3A]" />
          </div>
          <CardTitle className="text-4xl font-serif font-bold text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Bring your data with you
          </CardTitle>
          <CardDescription className="text-lg text-[#0A1128]/60">
            Move your existing customers, pets, and bookings into CatStays in minutes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-12">
          {/* What You Can Import */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-[#F8F7F5] border border-blue-100">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Customers</h3>
              <p className="text-sm text-[#0A1128]/60">Contact details & history</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-[#F8F7F5] border border-green-100">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Cat className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Pets</h3>
              <p className="text-sm text-[#0A1128]/60">Profiles & preferences</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-[#F8F7F5] border border-purple-100">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Bookings</h3>
              <p className="text-sm text-[#0A1128]/60">Past & upcoming stays</p>
            </div>
          </div>

          {/* Primary Question */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-semibold text-[#0A1128] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Would you like to import your existing data now?
            </h3>
            <p className="text-[#0A1128]/60">
              Our AI will automatically organize everything for you — no manual setup required
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-4 max-w-md mx-auto mb-8">
            <Button
              size="lg"
              className="w-full bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-8 py-7 text-lg shadow-xl hover:shadow-lg transition-all"
              onClick={onImport}
            >
              <Upload className="w-5 h-5 mr-3" />
              Import My Data
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-xl py-6 text-base border-[#0A1128]/20 hover:bg-[#F8F7F5]"
              onClick={onSkip}
            >
              I'll do this later
            </Button>
          </div>

          {/* Supporting Info */}
          <div className="flex items-start gap-3 max-w-2xl mx-auto bg-gradient-to-br from-[#F8F7F5] to-white rounded-2xl p-6 border border-[#0A1128]/5">
            <Shield className="w-5 h-5 text-[#4F6F5A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#0A1128]/70 mb-2">
                <strong className="text-[#0A1128]">Your data is private and secure.</strong> Only you can access it.
              </p>
              <p className="text-sm text-[#0A1128]/60">
                You can import your data anytime from your dashboard settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
