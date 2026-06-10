import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Menu, 
  Bell, 
  User, 
  Lock, 
  CreditCard,
  Database,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';

export function AdminSettings() {
  return (
    <div className="min-h-screen bg-[#F8F7F5] pb-24">
      <header className="bg-white border-b border-[#0A1128]/10 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-[#0A1128]" />
            <h1 className="text-2xl font-serif font-bold text-[#0A1128]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Settings
            </h1>
          </div>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <div className="space-y-4">
          {/* Account Settings */}
          <Card className="border-[#0A1128]/10 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-[#0A1128]/5 pb-4">
              <CardTitle className="text-lg font-semibold text-[#0A1128] flex items-center gap-2">
                <User className="w-5 h-5 text-[#C46A3A]" />
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/admin/settings/profile" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors border-b border-[#0A1128]/5 last:border-0">
                <div>
                  <p className="font-medium text-[#0A1128]">Profile</p>
                  <p className="text-sm text-[#0A1128]/60">Update your business details</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
              
              <Link to="/admin/settings/password" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors border-b border-[#0A1128]/5 last:border-0">
                <div>
                  <p className="font-medium text-[#0A1128]">Password & Security</p>
                  <p className="text-sm text-[#0A1128]/60">Change password, 2FA</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-[#0A1128]/10 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-[#0A1128]/5 pb-4">
              <CardTitle className="text-lg font-semibold text-[#0A1128] flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#C46A3A]" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/admin/settings/notifications" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors">
                <div>
                  <p className="font-medium text-[#0A1128]">Email & SMS Preferences</p>
                  <p className="text-sm text-[#0A1128]/60">Manage notification settings</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
            </CardContent>
          </Card>

          {/* Billing */}
          <Card className="border-[#0A1128]/10 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-[#0A1128]/5 pb-4">
              <CardTitle className="text-lg font-semibold text-[#0A1128] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C46A3A]" />
                Billing & Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/admin/settings/billing" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors border-b border-[#0A1128]/5 last:border-0">
                <div>
                  <p className="font-medium text-[#0A1128]">Payment Method</p>
                  <p className="text-sm text-[#0A1128]/60">Manage cards and invoices</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
              
              <Link to="/admin/settings/subscription" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors border-b border-[#0A1128]/5 last:border-0">
                <div>
                  <p className="font-medium text-[#0A1128]">Subscription Plan</p>
                  <p className="text-sm text-[#0A1128]/60">Upgrade or manage your plan</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
            </CardContent>
          </Card>

          {/* Data Import & Export - NEW */}
          <Card className="border-2 border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#F8F7F5] rounded-2xl shadow-lg">
            <CardHeader className="border-b border-[#0A1128]/5 pb-4">
              <CardTitle className="text-lg font-semibold text-[#0A1128] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#C46A3A]" />
                Data Import & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/admin/settings/data" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/80 transition-colors">
                <div>
                  <p className="font-medium text-[#0A1128]">Import & Export Data</p>
                  <p className="text-sm text-[#0A1128]/60">Import customers, pets, bookings or export backups</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#C46A3A]" />
              </Link>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-[#0A1128]/10 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-[#0A1128]/5 pb-4">
              <CardTitle className="text-lg font-semibold text-[#0A1128] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C46A3A]" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Link to="/admin/settings/privacy" className="flex items-center justify-between p-4 hover:bg-[#F8F7F5]/50 transition-colors">
                <div>
                  <p className="font-medium text-[#0A1128]">Data & Privacy</p>
                  <p className="text-sm text-[#0A1128]/60">Control how your data is used</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0A1128]/30" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Removed BottomNav component */}
    </div>
  );
}