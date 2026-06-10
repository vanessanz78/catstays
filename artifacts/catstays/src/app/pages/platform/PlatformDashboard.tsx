import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  LayoutDashboard,
  Users,
  Globe,
  Calendar,
  Mail,
  UserCircle,
  CreditCard,
  BarChart3,
  MessageSquare,
  Settings,
  Search,
  TrendingUp,
  DollarSign,
  Activity,
  Eye,
  Edit,
  LogIn,
  Ban,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  Download,
  Filter
} from 'lucide-react';
const logoWordmark = '/assets/6461fe246edac7430bd3dd41a3c26b459650665f.png';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function PlatformDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const revenueData = [
    { month: 'Jan', revenue: 4500 },
    { month: 'Feb', revenue: 5200 },
    { month: 'Mar', revenue: 6100 },
    { month: 'Apr', revenue: 7300 },
    { month: 'May', revenue: 8900 },
    { month: 'Jun', revenue: 10200 },
  ];

  const businessData = [
    { name: 'Whisker Haven', owner: 'Sarah Johnson', email: 'sarah@whiskerhaven.com', website: 'whiskerhaven.catstays.app', plan: 'Professional', status: 'Active', joined: '2025-01-15' },
    { name: 'The Garden Cattery', owner: 'Mike Chen', email: 'mike@gardencattery.com', website: 'gardencattery.catstays.app', plan: 'Starter', status: 'Active', joined: '2025-02-03' },
    { name: 'Willow Creek Cattery', owner: 'Emma Wilson', email: 'emma@willowcreek.com', website: 'willowcreek.catstays.app', plan: 'Professional', status: 'Active', joined: '2025-02-20' },
    { name: 'Purrfect Paradise', owner: 'James Brown', email: 'james@purrfect.com', website: 'purrfect.catstays.app', plan: 'Enterprise', status: 'Active', joined: '2025-03-01' },
    { name: 'Cozy Cat Lodge', owner: 'Lisa Anderson', email: 'lisa@cozycatlodge.com', website: 'cozycatlodge.catstays.app', plan: 'Starter', status: 'Trial', joined: '2026-03-10' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'businesses', label: 'Businesses', icon: Users },
    { id: 'websites', label: 'Websites', icon: Globe },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'crm', label: 'CRM', icon: UserCircle },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'support', label: 'Support', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-screen flex bg-cream">
      {/* Left Sidebar */}
      <div className="w-64 bg-forest text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <img src={logoWordmark} alt="CatStays" className="h-10 w-auto" />
          <p className="text-xs text-white/60 mt-2">Platform Admin</p>
        </div>

        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    activeSection === item.id
                      ? 'bg-sage text-white shadow-lg'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-sage" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-white/60">admin@catstays.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-sage/10 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-forest">
                {navItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-forest/60 mt-1">
                Manage your CatStays platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 bg-cream border-sage/10"
                />
              </div>
              <Button variant="outline" className="border-sage/20 text-forest">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Dashboard View */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="border-sage/10 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-forest/70">
                      Total Websites
                    </CardTitle>
                    <Globe className="w-4 h-4 text-sage" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-forest">127</div>
                    <p className="text-xs text-forest/60 flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-sage/10 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-forest/70">
                      Active Businesses
                    </CardTitle>
                    <Users className="w-4 h-4 text-sage" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-forest">89</div>
                    <p className="text-xs text-forest/60 flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-sage/10 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-forest/70">
                      Monthly Revenue
                    </CardTitle>
                    <DollarSign className="w-4 h-4 text-sage" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-forest">$10.2K</div>
                    <p className="text-xs text-forest/60 flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">15%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-sage/10 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-forest/70">
                      Bookings Processed
                    </CardTitle>
                    <Calendar className="w-4 h-4 text-sage" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-forest">1,429</div>
                    <p className="text-xs text-forest/60 flex items-center gap-1 mt-1">
                      <ArrowUp className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">23%</span> from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-sage/10 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-forest">Revenue Growth</CardTitle>
                    <CardDescription>Monthly recurring revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" opacity={0.1} />
                        <XAxis dataKey="month" stroke="#1F2A44" opacity={0.5} />
                        <YAxis stroke="#1F2A44" opacity={0.5} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#C86B3C" fill="#C86B3C" opacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-sage/10 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-forest">Business Growth</CardTitle>
                    <CardDescription>New signups per month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2A44" opacity={0.1} />
                        <XAxis dataKey="month" stroke="#1F2A44" opacity={0.5} />
                        <YAxis stroke="#1F2A44" opacity={0.5} />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#C86B3C" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-sage/10 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-forest">Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: 'New business signed up', business: 'Cozy Cat Lodge', time: '2 hours ago', type: 'signup' },
                      { action: 'Website published', business: 'Whisker Haven', time: '5 hours ago', type: 'publish' },
                      { action: 'Payment received', business: 'The Garden Cattery', time: '1 day ago', type: 'payment' },
                      { action: 'Support ticket opened', business: 'Willow Creek Cattery', time: '2 days ago', type: 'support' },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-sage/5 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'signup' ? 'bg-green-100' :
                          activity.type === 'publish' ? 'bg-blue-100' :
                          activity.type === 'payment' ? 'bg-sage/10' :
                          'bg-rose/20'
                        }`}>
                          <Activity className="w-5 h-5 text-sage" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-forest">{activity.action}</p>
                          <p className="text-xs text-forest/60">{activity.business}</p>
                        </div>
                        <span className="text-xs text-forest/40">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Businesses View */}
          {activeSection === 'businesses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-sage/20 text-forest">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                  <Badge variant="outline" className="border-sage/20 text-forest">
                    {businessData.length} businesses
                  </Badge>
                </div>
                <Button className="bg-sage hover:bg-sage-dark text-white">
                  Add Business
                </Button>
              </div>

              <Card className="border-sage/10 shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-sage/5 border-b border-sage/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Business Name
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Owner
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Website
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Plan
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-forest/70 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sage/10">
                        {businessData.map((business, i) => (
                          <tr key={i} className="hover:bg-sage/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-forest">{business.name}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-forest/70">{business.owner}</div>
                              <div className="text-xs text-forest/50">{business.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <a href={`https://${business.website}`} className="text-sm text-sage hover:underline">
                                {business.website}
                              </a>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={
                                business.plan === 'Enterprise' ? 'bg-forest text-white' :
                                business.plan === 'Professional' ? 'bg-sage text-white' :
                                'bg-sage/10 text-sage'
                              }>
                                {business.plan}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={
                                business.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' :
                                'bg-rose/20 text-forest border-rose/30'
                              }>
                                {business.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-forest/70">{business.joined}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Eye className="w-4 h-4 text-forest/60" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="w-4 h-4 text-forest/60" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <LogIn className="w-4 h-4 text-forest/60" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="w-4 h-4 text-forest/60" />
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
            </div>
          )}

          {/* Other sections placeholder */}
          {!['dashboard', 'businesses'].includes(activeSection) && (
            <Card className="border-sage/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-serif text-forest">
                  {navItems.find(item => item.id === activeSection)?.label}
                </CardTitle>
                <CardDescription>This section is under construction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-forest/60">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Content coming soon...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}