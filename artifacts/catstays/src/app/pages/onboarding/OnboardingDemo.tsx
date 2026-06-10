import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Check, 
  ArrowRight, 
  MousePointer, 
  Save, 
  Mail, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router';

export function OnboardingDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8F7F5] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#0A1128] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Onboarding Wizard - New Features
          </h1>
          <p className="text-[#0A1128]/60">
            Clickable steps, auto-save, account creation, and email confirmation
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Clickable Steps */}
          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-[#C46A3A]" />
                </div>
                <CardTitle className="text-xl">Clickable Step Navigation</CardTitle>
              </div>
              <CardDescription>
                Jump between any step after creating your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#F8F7F5] rounded-xl p-4 border border-[#0A1128]/10">
                  <h4 className="font-medium text-[#0A1128] mb-2">Features:</h4>
                  <ul className="space-y-2 text-sm text-[#0A1128]/70">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C46A3A] mt-0.5" />
                      <span>Click any step indicator dot to jump directly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C46A3A] mt-0.5" />
                      <span>Visual feedback: ring highlight on current step</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C46A3A] mt-0.5" />
                      <span>Completed steps show checkmarks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C46A3A] mt-0.5" />
                      <span>Disabled until account is created (Step 1)</span>
                    </li>
                  </ul>
                </div>

                {/* Demo Step Indicators */}
                <div className="bg-white rounded-xl p-4 border border-[#0A1128]/10">
                  <p className="text-xs text-[#0A1128]/60 mb-3">Preview:</p>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          num === 2 
                            ? 'bg-[#4F6F5A] text-white ring-4 ring-[#4F6F5A]/20' 
                            : num < 2
                            ? 'bg-[#4F6F5A] text-white'
                            : 'bg-[#FAF7F2] text-[#0A1128]/40'
                        }`}>
                          {num < 2 ? <Check className="w-4 h-4" /> : num}
                        </div>
                        <span className="text-xs text-[#0A1128]/60">Step {num}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto-Save */}
          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Save className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-xl">Auto-Save Progress</CardTitle>
              </div>
              <CardDescription>
                Never lose your work - saves automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#F8F7F5] rounded-xl p-4 border border-[#0A1128]/10">
                  <h4 className="font-medium text-[#0A1128] mb-2">Saves When:</h4>
                  <ul className="space-y-2 text-sm text-[#0A1128]/70">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Moving to next step</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowLeft className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Going back to previous step</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <MousePointer className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Clicking any step indicator</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Leaving the page (auto-save on exit)</span>
                    </li>
                  </ul>
                </div>

                {/* Demo Save Badge */}
                <div className="bg-white rounded-xl p-4 border border-[#0A1128]/10 flex items-center justify-between">
                  <span className="text-sm text-[#0A1128]/70">Visual feedback:</span>
                  <Badge className="bg-[#4F6F5A] text-white shadow-lg px-3 py-1 rounded-full">
                    <Check className="w-3 h-3 mr-1" />
                    Progress Saved
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Creation */}
          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#C46A3A]/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-[#C46A3A]" />
                </div>
                <CardTitle className="text-xl">Account Creation (Step 1)</CardTitle>
              </div>
              <CardDescription>
                Simplified signup before onboarding begins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#F8F7F5] rounded-xl p-4 border border-[#0A1128]/10">
                  <h4 className="font-medium text-[#0A1128] mb-2">Required Fields:</h4>
                  <ul className="space-y-2 text-sm text-[#0A1128]/70">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C46A3A]"></div>
                      <span>Your Name</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C46A3A]"></div>
                      <span>Email Address</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#C46A3A]"></div>
                      <span>Password (min. 8 characters)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">
                        Account created immediately
                      </p>
                      <p className="text-xs text-green-800">
                        No waiting - start setup right away
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation */}
          <Card className="border-[#0A1128]/10">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Email Confirmation</CardTitle>
              </div>
              <CardDescription>
                Verify your email with a click-to-confirm link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-[#F8F7F5] rounded-xl p-4 border border-[#0A1128]/10">
                  <h4 className="font-medium text-[#0A1128] mb-2">Flow:</h4>
                  <ol className="space-y-2 text-sm text-[#0A1128]/70 list-decimal list-inside">
                    <li>Account created → Email sent</li>
                    <li>User clicks link in email</li>
                    <li>Opens /confirm-email page</li>
                    <li>Account verified ✓</li>
                    <li>Returns to onboarding</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Confirmation optional
                      </p>
                      <p className="text-xs text-blue-800">
                        Users can continue setup and confirm later
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl"
                  onClick={() => navigate('/confirm-email?token=demo123')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Preview Confirmation Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="border-[#C46A3A]/20 bg-gradient-to-br from-white to-[#FAF7F2]">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#0A1128] mb-2">
                  Try the New Onboarding Flow
                </h2>
                <p className="text-[#0A1128]/70">
                  Experience clickable steps, auto-save, and streamlined account creation
                </p>
              </div>
              <Button
                onClick={() => navigate('/onboarding')}
                size="lg"
                className="bg-[#C46A3A] hover:bg-[#A85A30] text-white rounded-xl px-8 py-6 shadow-lg whitespace-nowrap"
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison */}
        <Card className="border-[#0A1128]/10 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">What's Changed</CardTitle>
            <CardDescription>Comparison of old vs new onboarding experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#0A1128]/10">
                    <th className="text-left p-3 font-semibold text-[#0A1128]">Feature</th>
                    <th className="text-left p-3 font-semibold text-red-700">Before</th>
                    <th className="text-left p-3 font-semibold text-green-700">After</th>
                  </tr>
                </thead>
                <tbody className="text-[#0A1128]/70">
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-3 font-medium">Step Navigation</td>
                    <td className="p-3">Linear (Next/Back only)</td>
                    <td className="p-3 text-green-700">✓ Click any step</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-3 font-medium">Save Progress</td>
                    <td className="p-3">Manual "Save" button</td>
                    <td className="p-3 text-green-700">✓ Auto-save on every move</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-3 font-medium">Exit Option</td>
                    <td className="p-3">None</td>
                    <td className="p-3 text-green-700">✓ "Back to CatStays" button</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-3 font-medium">First Step</td>
                    <td className="p-3">Informational welcome</td>
                    <td className="p-3 text-green-700">✓ Account creation form</td>
                  </tr>
                  <tr className="border-b border-[#0A1128]/5">
                    <td className="p-3 font-medium">Email Verification</td>
                    <td className="p-3">None</td>
                    <td className="p-3 text-green-700">✓ Click-to-confirm email</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">Account Required</td>
                    <td className="p-3">Browse all steps freely</td>
                    <td className="p-3 text-green-700">✓ Create account first</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
