import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  LayoutGrid, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  ClipboardList,
  Settings,
  Home as HomeIcon
} from 'lucide-react';
import { RoomManagementDashboard } from './RoomManagementDashboard';
import { RoomCalendarTimeline } from './RoomCalendarTimeline';
import { PricingRulesEngine } from './PricingRulesEngine';
import { RoomPricingCalendar } from './RoomPricingCalendar';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { RoomStatusBoard } from './RoomStatusBoard';

type ViewType = 'rooms' | 'timeline' | 'pricing-rules' | 'pricing-calendar' | 'analytics' | 'status-board';

export function RoomPlannerDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('status-board');

  const navItems = [
    { id: 'status-board' as ViewType, label: 'Status Board', icon: ClipboardList, description: 'Today\'s activity' },
    { id: 'timeline' as ViewType, label: 'Calendar Timeline', icon: Calendar, description: 'Multi-room view' },
    { id: 'rooms' as ViewType, label: 'Room Management', icon: LayoutGrid, description: 'Manage rooms' },
    { id: 'pricing-rules' as ViewType, label: 'Pricing Rules', icon: DollarSign, description: 'Dynamic pricing' },
    { id: 'pricing-calendar' as ViewType, label: 'Pricing Calendar', icon: Settings, description: 'Rate heat map' },
    { id: 'analytics' as ViewType, label: 'Analytics', icon: BarChart3, description: 'Reports & insights' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5F0] to-[#E8E8E3]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8FBC8F] to-[#87CEEB] flex items-center justify-center shadow-md">
                <HomeIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0A1128]">Room Planner & Pricing</h1>
                <p className="text-sm text-gray-500">Comprehensive booking & revenue management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                  currentView === item.id
                    ? 'bg-[#8FBC8F] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-sm font-semibold">{item.label}</div>
                  <div className={`text-xs ${currentView === item.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        {currentView === 'rooms' && <RoomManagementDashboard />}
        {currentView === 'timeline' && <RoomCalendarTimeline />}
        {currentView === 'pricing-rules' && <PricingRulesEngine />}
        {currentView === 'pricing-calendar' && <RoomPricingCalendar />}
        {currentView === 'analytics' && <AnalyticsDashboard />}
        {currentView === 'status-board' && <RoomStatusBoard />}
      </div>
    </div>
  );
}
