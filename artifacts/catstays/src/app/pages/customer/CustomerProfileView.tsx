import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, Save, Eye, EyeOff, User, Mail, Phone, MapPin, Lock } from 'lucide-react';

type PreviewDevice = 'mobile' | 'tablet' | 'desktop';

interface CustomerProfileViewProps {
  onBack: () => void;
  primaryColor?: string;
  accentColor?: string;
  previewDevice?: PreviewDevice;
}

export function CustomerProfileView({ 
  onBack,
  primaryColor = '#0A1128', 
  accentColor = '#C46A3A',
  previewDevice
}: CustomerProfileViewProps) {
  const [activeSection, setActiveSection] = useState<'personal' | 'contact' | 'security'>('personal');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isPreviewMobile = previewDevice === 'mobile';
  const twoColumnGridClass = isPreviewMobile ? 'grid gap-4' : 'grid md:grid-cols-2 gap-4';

  // Personal Information
  const [firstName, setFirstName] = useState('Sarah');
  const [lastName, setLastName] = useState('Johnson');
  const [email, setEmail] = useState('sarah.johnson@email.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');

  // Address
  const [address, setAddress] = useState('123 Main Street');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zipCode, setZipCode] = useState('94102');
  const [country, setCountry] = useState('United States');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('John Johnson');
  const [emergencyPhone, setEmergencyPhone] = useState('+1 (555) 987-6543');
  const [emergencyRelation, setEmergencyRelation] = useState('Spouse');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    setIsSaving(true);
    // Simulate password change
    setTimeout(() => {
      setIsSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password changed successfully!');
    }, 1000);
  };

  return (
    <main className={isPreviewMobile ? 'container mx-auto px-4 py-6 max-w-4xl' : 'container mx-auto px-4 py-8 max-w-4xl'}>
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mb-6"
        style={{ color: accentColor }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className={isPreviewMobile ? 'grid gap-4' : 'grid md:grid-cols-4 gap-6'}>
        {/* Sidebar Navigation */}
        <div className={isPreviewMobile ? undefined : 'md:col-span-1'}>
          <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('personal')}
                  className="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2"
                  style={{
                    backgroundColor: activeSection === 'personal' ? `${accentColor}15` : 'transparent',
                    color: activeSection === 'personal' ? accentColor : primaryColor
                  }}
                >
                  <User className="w-4 h-4" />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveSection('contact')}
                  className="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2"
                  style={{
                    backgroundColor: activeSection === 'contact' ? `${accentColor}15` : 'transparent',
                    color: activeSection === 'contact' ? accentColor : primaryColor
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Contact Details
                </button>
                <button
                  onClick={() => setActiveSection('security')}
                  className="w-full text-left px-3 py-2 rounded-lg transition flex items-center gap-2"
                  style={{
                    backgroundColor: activeSection === 'security' ? `${accentColor}15` : 'transparent',
                    color: activeSection === 'security' ? accentColor : primaryColor
                  }}
                >
                  <Lock className="w-4 h-4" />
                  Security
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className={isPreviewMobile ? 'space-y-4' : 'md:col-span-3 space-y-6'}>
          {/* Personal Information */}
          {activeSection === 'personal' && (
            <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
              <CardHeader>
                <CardTitle style={{ color: primaryColor }}>Personal Information</CardTitle>
                <CardDescription>Update your basic account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={twoColumnGridClass}>
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>First Name</Label>
                    <Input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>Last Name</Label>
                    <Input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: primaryColor }}>
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label style={{ color: primaryColor }}>
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="pt-4">
                  <Button 
                    style={{ backgroundColor: accentColor, color: 'white' }}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Details */}
          {activeSection === 'contact' && (
            <>
              <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
                <CardHeader>
                  <CardTitle style={{ color: primaryColor }}>Address</CardTitle>
                  <CardDescription>Your primary mailing address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>Street Address</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className={twoColumnGridClass}>
                    <div className="space-y-2">
                      <Label style={{ color: primaryColor }}>City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label style={{ color: primaryColor }}>State/Province</Label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div className={twoColumnGridClass}>
                    <div className="space-y-2">
                      <Label style={{ color: primaryColor }}>ZIP/Postal Code</Label>
                      <Input
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label style={{ color: primaryColor }}>Country</Label>
                      <Input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
                <CardHeader>
                  <CardTitle style={{ color: primaryColor }}>Emergency Contact</CardTitle>
                  <CardDescription>Person to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>Full Name</Label>
                    <Input
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>Phone Number</Label>
                    <Input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label style={{ color: primaryColor }}>Relationship</Label>
                    <Input
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g., Spouse, Parent, Friend"
                    />
                  </div>
                  <div className="pt-4">
                    <Button 
                      style={{ backgroundColor: accentColor, color: 'white' }}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <Card className="border" style={{ borderColor: `${primaryColor}20` }}>
              <CardHeader>
                <CardTitle style={{ color: primaryColor }}>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label style={{ color: primaryColor }}>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: primaryColor }}>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: `${primaryColor}70` }}>
                    Password must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label style={{ color: primaryColor }}>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    style={{ backgroundColor: accentColor, color: 'white' }}
                    onClick={handlePasswordChange}
                    disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
