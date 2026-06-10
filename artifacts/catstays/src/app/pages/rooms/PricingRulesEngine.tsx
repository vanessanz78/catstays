import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Percent,
  Calendar,
  Clock,
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';
import { getPricingRules, savePricingRules } from '../../utils/roomPlannerStorage';
import { PricingRule } from '../../types/room-planner';

export function PricingRulesEngine() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setRules(getPricingRules());
  }, []);

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
    setHasChanges(true);
  };

  const handleUpdateMultiplier = (ruleId: string, value: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, multiplier: value } : rule
    ));
    setHasChanges(true);
  };

  const handleUpdateFixedAmount = (ruleId: string, value: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, fixedAmount: value } : rule
    ));
    setHasChanges(true);
  };

  const handleSave = () => {
    savePricingRules(rules);
    setHasChanges(false);
  };

  const handleReset = () => {
    setRules(getPricingRules());
    setHasChanges(false);
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'weekend': return Calendar;
      case 'seasonal': return Sparkles;
      case 'last_minute': return Clock;
      case 'extended_stay': return TrendingDown;
      case 'gap_filler': return TrendingDown;
      case 'holiday': return Sparkles;
      case 'weekday': return TrendingDown;
      default: return DollarSign;
    }
  };

  const getRuleColor = (type: string) => {
    switch (type) {
      case 'weekend': return 'from-[#87CEEB]/10 to-[#87CEEB]/5 border-[#87CEEB]/30';
      case 'seasonal': return 'from-[#E6E6FA]/10 to-[#E6E6FA]/5 border-[#E6E6FA]/30';
      case 'last_minute': return 'from-[#FFD700]/10 to-[#FFD700]/5 border-[#FFD700]/30';
      case 'extended_stay': return 'from-[#8FBC8F]/10 to-[#8FBC8F]/5 border-[#8FBC8F]/30';
      case 'gap_filler': return 'from-[#FF7F7F]/10 to-[#FF7F7F]/5 border-[#FF7F7F]/30';
      case 'holiday': return 'from-purple-50 to-purple-100/30 border-purple-200';
      case 'weekday': return 'from-green-50 to-green-100/30 border-green-200';
      default: return 'from-gray-50 to-gray-100/30 border-gray-200';
    }
  };

  const groupedRules = {
    premium: rules.filter(r => r.type === 'weekend' || r.type === 'holiday' || r.type === 'seasonal'),
    discount: rules.filter(r => r.type === 'extended_stay' || r.type === 'weekday' || r.type === 'last_minute' || r.type === 'gap_filler')
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="border-[#8FBC8F]/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1128]">Dynamic Pricing Rules</h2>
              <p className="text-sm text-gray-500">Configure automatic price adjustments for different scenarios</p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSave} className="bg-[#8FBC8F] hover:bg-[#8FBC8F]/90 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Pricing Rules */}
      <Card className="border-[#FF7F7F]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#FF7F7F]/10 to-transparent border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF7F7F]" />
            <div>
              <CardTitle className="text-lg">Premium Pricing (Increase Rates)</CardTitle>
              <CardDescription>Charge more during high-demand periods</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groupedRules.premium.map((rule) => {
              const Icon = getRuleIcon(rule.type);
              const isPercentage = rule.multiplier !== undefined;
              
              return (
                <Card key={rule.id} className={`bg-gradient-to-br ${getRuleColor(rule.type)} border-2 transition-all ${rule.enabled ? 'shadow-md' : 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${rule.enabled ? 'bg-[#FF7F7F]/20' : 'bg-gray-200'} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${rule.enabled ? 'text-[#FF7F7F]' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#0A1128]">{rule.name}</h3>
                          <p className="text-xs text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </div>

                    {rule.enabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          {isPercentage ? 'Price Multiplier' : 'Fixed Amount'}
                        </Label>
                        <div className="flex items-center gap-2">
                          {isPercentage ? (
                            <>
                              <Input
                                type="number"
                                value={((rule.multiplier || 1) - 1) * 100}
                                onChange={(e) => handleUpdateMultiplier(rule.id, 1 + parseFloat(e.target.value) / 100)}
                                className="w-24 h-9 text-center"
                                min="-50"
                                max="100"
                                step="5"
                              />
                              <Percent className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                (x{rule.multiplier?.toFixed(2)})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-semibold text-gray-700">$</span>
                              <Input
                                type="number"
                                value={rule.fixedAmount || 0}
                                onChange={(e) => handleUpdateFixedAmount(rule.id, parseFloat(e.target.value))}
                                className="w-24 h-9 text-center"
                                min="-50"
                                max="50"
                                step="1"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Discount Pricing Rules */}
      <Card className="border-[#8FBC8F]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#8FBC8F]/10 to-transparent border-b">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-[#8FBC8F]" />
            <div>
              <CardTitle className="text-lg">Discount Pricing (Reduce Rates)</CardTitle>
              <CardDescription>Attract more bookings during slower periods</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groupedRules.discount.map((rule) => {
              const Icon = getRuleIcon(rule.type);
              const isPercentage = rule.multiplier !== undefined;
              
              return (
                <Card key={rule.id} className={`bg-gradient-to-br ${getRuleColor(rule.type)} border-2 transition-all ${rule.enabled ? 'shadow-md' : 'opacity-60'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${rule.enabled ? 'bg-[#8FBC8F]/20' : 'bg-gray-200'} flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${rule.enabled ? 'text-[#8FBC8F]' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#0A1128]">{rule.name}</h3>
                          <p className="text-xs text-gray-600">{rule.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => handleToggleRule(rule.id)}
                      />
                    </div>

                    {rule.enabled && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                          {isPercentage ? 'Discount Percentage' : 'Discount Amount'}
                        </Label>
                        <div className="flex items-center gap-2">
                          {isPercentage ? (
                            <>
                              <Input
                                type="number"
                                value={Math.abs(((rule.multiplier || 1) - 1) * 100)}
                                onChange={(e) => handleUpdateMultiplier(rule.id, 1 - parseFloat(e.target.value) / 100)}
                                className="w-24 h-9 text-center"
                                min="0"
                                max="50"
                                step="5"
                              />
                              <Percent className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                (x{rule.multiplier?.toFixed(2)})
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg font-semibold text-gray-700">$</span>
                              <Input
                                type="number"
                                value={Math.abs(rule.fixedAmount || 0)}
                                onChange={(e) => handleUpdateFixedAmount(rule.id, -parseFloat(e.target.value))}
                                className="w-24 h-9 text-center"
                                min="0"
                                max="50"
                                step="1"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Priority Information */}
      <Card className="border-[#87CEEB]/20 shadow-lg bg-gradient-to-br from-[#87CEEB]/5 to-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#87CEEB]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#87CEEB]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#0A1128] mb-2">Rule Priority Logic</h3>
              <p className="text-sm text-gray-600 mb-3">
                When multiple rules apply to the same booking, they are applied in this order:
              </p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Holiday/Special Event pricing (highest priority)</li>
                <li>Seasonal adjustments</li>
                <li>Weekend premiums</li>
                <li>Weekday discounts</li>
                <li>Extended stay discounts</li>
                <li>Last-minute/gap filler discounts</li>
                <li>Base room rate (fallback)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
