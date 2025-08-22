import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, LogOut, Bell, Shield, Palette, HelpCircle, Code, Trash2, Trophy, Coins, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Settings() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  // Mock trust and token data
  const trustData = {
    currentLevel: 'Silver',
    connections: 8,
    nextLevelConnections: 15,
    benefits: [
      'Access to Premium Circles',
      'Creator Tools Unlocked',
      'Higher Token Earnings',
      'Priority Support'
    ],
    nextBenefits: [
      'Exclusive Gold Circles',
      'Partnership Opportunities',
      'Advanced Analytics',
      'Custom Circle Creation'
    ]
  };

  const tokenData = {
    available: 156,
    stakedInTrust: 72,
    investedInCircles: 240,
    dailyEarnings: 24,
    weeklyPotential: '50-150',
    monthlyActual: 89,
    circleROI: [
      { name: 'Photography Community', invested: 120, earned: 340, roi: 183 },
      { name: 'ASICS Run Club', invested: 180, earned: 278, roi: 156 },
      { name: 'Local Fitness', invested: 60, earned: 87, roi: 145 }
    ]
  };

  const trustConnections = [
    { id: 1, name: 'Sarah M.', avatar: null, mutualTrust: true, stakedAmount: 12, riskLevel: 'low' },
    { id: 2, name: 'Mike K.', avatar: null, mutualTrust: true, stakedAmount: 15, riskLevel: 'low' },
    { id: 3, name: 'Lisa R.', avatar: null, mutualTrust: false, stakedAmount: 24, riskLevel: 'medium' },
    { id: 4, name: 'John D.', avatar: null, mutualTrust: true, stakedAmount: 12, riskLevel: 'low' },
    { id: 5, name: 'Emma W.', avatar: null, mutualTrust: true, stakedAmount: 9, riskLevel: 'low' },
  ];

  const handleResetAppState = () => {
    localStorage.removeItem('beyou_onboarding_complete');
    localStorage.removeItem('beyou_simulation_mode');
    window.location.href = createPageUrl("You");
  };

  const getTrustLevelIcon = (level) => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎' };
    return icons[level] || '🥉';
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-green-400 bg-green-500/10 border-green-400/20',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-400/20',
      high: 'text-red-400 bg-red-500/10 border-red-400/20'
    };
    return colors[level] || colors.low;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const menuItems = [
    { title: "Account Settings", icon: User, page: "" },
    { title: "Notifications", icon: Bell, page: "" },
    { title: "Privacy & Security", icon: Shield, page: "" },
    { title: "Appearance", icon: Palette, page: "" },
    { title: "Help & Support", icon: HelpCircle, page: "" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24 md:p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Settings</h1>

        <div className="space-y-6 md:space-y-8">
          {/* Trust Level & Progress */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-400/20">
            <CardHeader>
              <button
                onClick={() => toggleSection('trust')}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  🏆 Trust Level & Progress
                </CardTitle>
                <span className="text-blue-300">
                  {expandedSection === 'trust' ? '−' : '+'}
                </span>
              </button>
            </CardHeader>
            {expandedSection === 'trust' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="space-y-4 border-t border-blue-400/20 pt-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">{getTrustLevelIcon(trustData.currentLevel)}</div>
                    <div className="text-xl font-bold text-white mb-1">{trustData.currentLevel} Level</div>
                    <div className="text-blue-300 text-sm">
                      {trustData.connections}/{trustData.nextLevelConnections} connections to Gold
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Progress to Gold Level</span>
                      <span className="text-blue-300">{Math.round((trustData.connections / trustData.nextLevelConnections) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(trustData.connections / trustData.nextLevelConnections) * 100} 
                      className="h-2 bg-white/10" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-400/20">
                      <h4 className="text-green-300 font-semibold mb-2">Current Benefits</h4>
                      <ul className="text-green-200/80 text-sm space-y-1">
                        {trustData.benefits.map((benefit, i) => (
                          <li key={i}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-400/20">
                      <h4 className="text-amber-300 font-semibold mb-2">Next Level Benefits</h4>
                      <ul className="text-amber-200/80 text-sm space-y-1">
                        {trustData.nextBenefits.map((benefit, i) => (
                          <li key={i}>• {benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-center text-white/60 text-sm">
                    <p>Estimated upgrade time: <span className="text-amber-300">~12 days</span></p>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>

          {/* Token Economics */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-400/20">
            <CardHeader>
              <button
                onClick={() => toggleSection('tokens')}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  💰 Token Economics
                </CardTitle>
                <span className="text-amber-300">
                  {expandedSection === 'tokens' ? '−' : '+'}
                </span>
              </button>
            </CardHeader>
            {expandedSection === 'tokens' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="space-y-4 border-t border-amber-400/20 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{tokenData.available}</div>
                      <div className="text-amber-300 text-sm">Available YOU</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">+{tokenData.dailyEarnings}</div>
                      <div className="text-green-300 text-sm">Daily Earnings</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-blue-400 text-sm">Staked in Trust</div>
                      <div className="text-white font-semibold">{tokenData.stakedInTrust} YOU</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-purple-400 text-sm">Circle Investments</div>
                      <div className="text-white font-semibold">{tokenData.investedInCircles} YOU</div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                    <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Circle ROI Performance
                    </h4>
                    <div className="space-y-2">
                      {tokenData.circleROI.map((circle, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-white/80">{circle.name}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white/60">{circle.invested} → {circle.earned}</span>
                            <span className="text-green-400 font-semibold">+{circle.roi}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-white/80 text-sm">
                      Weekly potential: <span className="text-amber-300">{tokenData.weeklyPotential} YOU (~€2-6)</span>
                    </p>
                    <p className="text-green-400 text-sm font-medium">
                      This month earned: €{tokenData.monthlyActual} • Top members earn €50+ monthly
                    </p>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>

          {/* Trust Network */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-400/20">
            <CardHeader>
              <button
                onClick={() => toggleSection('network')}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  👥 Trust Network
                </CardTitle>
                <span className="text-purple-300">
                  {expandedSection === 'network' ? '−' : '+'}
                </span>
              </button>
            </CardHeader>
            {expandedSection === 'network' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="space-y-4 border-t border-purple-400/20 pt-4">
                  <div className="grid grid-cols-3 gap-3">
                    {trustConnections.map((connection) => (
                      <div key={connection.id} className="text-center">
                        <div className="relative mb-2">
                          <Avatar className="w-12 h-12 mx-auto">
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                              {connection.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          {connection.mutualTrust && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">↔️</span>
                            </div>
                          )}
                        </div>
                        <div className="text-white text-xs font-medium">{connection.name}</div>
                        <div className="text-white/60 text-xs">💰 {connection.stakedAmount} YOU</div>
                        <div className={`text-xs px-1 py-0.5 rounded mt-1 ${getRiskColor(connection.riskLevel)}`}>
                          {connection.riskLevel}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-400/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-semibold text-sm">Risk Management</span>
                    </div>
                    <ul className="text-yellow-200/80 text-xs space-y-1">
                      <li>• Higher risk connections require more YOU tokens</li>
                      <li>• Monitor suspicious activity patterns</li>
                      <li>• Mutual trust reduces staking costs</li>
                    </ul>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </Card>

          {/* General Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button key={item.title} className="w-full flex items-center justify-between p-3 md:p-4 rounded-lg hover:bg-white/5 transition-colors text-left">
                    <div className="flex items-center gap-3 md:gap-4">
                      <item.icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      <span className="text-sm md:text-base">{item.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Developer Tools */}
          <Card className="bg-red-500/10 border-red-400/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-300 text-lg md:text-xl">
                <Code className="w-4 h-4 md:w-5 md:h-5" />
                Developer Tools
              </CardTitle>
              <CardDescription className="text-red-300/70 text-sm md:text-base">
                These options are for testing and will not be in the final product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full text-sm md:text-base py-2 md:py-3"
                onClick={handleResetAppState}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset App to New User State
              </Button>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button variant="outline" className="w-full border-white/20 hover:bg-white/5 text-sm md:text-base py-2 md:py-3">
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}