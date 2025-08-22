

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from '@/api/entities';
import {
  Users,
  Camera,
  BookOpen,
  X,
  Trophy,
  Coins,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Trust Level Modal Component
function TrustLevelModal({ isOpen, onClose, userTrustData }) {
  if (!isOpen) return null;

  const trustLevels = [
    {
      name: 'Bronze',
      icon: '🥉',
      requirement: '3 trusted connections',
      unlocks: ['Basic circles access', 'Community features'],
      youRequired: 36
    },
    {
      name: 'Silver',
      icon: '🥈',
      requirement: '8 trusted connections',
      unlocks: ['Premium circles', 'Creator tools', 'Higher earnings'],
      youRequired: 96
    },
    {
      name: 'Gold',
      icon: '🥇',
      requirement: '15 trusted connections',
      unlocks: ['Exclusive circles', 'Partnership opportunities'],
      youRequired: 180
    },
    {
      name: 'Diamond',
      icon: '💎',
      requirement: '25 trusted connections',
      unlocks: ['VIP access', 'Custom circles', 'Premium rewards'],
      youRequired: 300
    }
  ];

  const currentLevelIndex = trustLevels.findIndex(l => l.name === userTrustData?.trustLevel);
  const currentLevel = trustLevels[currentLevelIndex];
  const currentConnections = userTrustData?.trustConnections || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#111111] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Trust Level Requirements
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {trustLevels.map((level, index) => {
            const isCurrentLevel = level.name === currentLevel?.name;
            const isUnlocked = currentLevelIndex >= index;

            return (
              <div
                key={level.name}
                className={`p-4 rounded-xl border-2 ${
                  isCurrentLevel
                    ? 'border-amber-400/60 bg-amber-500/10'
                    : isUnlocked
                    ? 'border-green-400/40 bg-green-500/5'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{level.icon}</span>
                    <span className="font-semibold text-white">{level.name} Level</span>
                    {isCurrentLevel && (
                      <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-white/60 text-sm">{level.youRequired} YOU staked</span>
                </div>
                <p className="text-white/80 text-sm mb-2">{level.requirement}</p>
                <ul className="text-white/60 text-xs space-y-1">
                  {level.unlocks.map((unlock, i) => (
                    <li key={i}>• {unlock}</li>
                  ))}
                </ul>
                {!isUnlocked && (
                  <div className="mt-2 text-xs text-amber-300">
                    Need {parseInt(level.requirement.split(' ')[0]) - currentConnections} more connections
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
          <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How it works
          </h3>
          <ul className="text-blue-200/80 text-sm space-y-1">
            <li>• Build real connections with trusted friends</li>
            <li>• Stake YOU tokens to vouch for connections</li>
            <li>• Higher trust levels unlock premium circles</li>
            <li>• Earn rewards for successful trust decisions</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

// Token Details Modal Component
function TokenDetailsModal({ isOpen, onClose, tokenData }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-[#111111] rounded-2xl p-6 max-w-md w-full border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            YOU Token Balance
          </h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {tokenData?.youBalance || 156} YOU
            </div>
            <div className="text-green-400 text-sm flex items-center justify-center gap-1">
              +{tokenData?.dailyEarnings || 24} daily earnings
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-blue-400 text-sm">Staked in Trust</div>
              <div className="text-white font-semibold">{tokenData?.stakedInTrust || 72} YOU</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-purple-400 text-sm">Circle Investments</div>
              <div className="text-white font-semibold">{tokenData?.investedInCircles || 240} YOU</div>
            </div>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20">
            <h3 className="text-green-300 font-semibold mb-2">Circle ROI</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-white/80">
                <span>Photography Community:</span>
                <span className="text-green-400">+183%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>ASICS Run Club:</span>
                <span className="text-green-400">+156%</span>
              </div>
            </div>
          </div>

          <div className="text-center text-white/60 text-sm">
            <p>Weekly potential: <span className="text-amber-300">50-150 YOU (~€2-6)</span></p>
            <p className="mt-1">Top members earn <span className="text-green-400">€50+ monthly</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const navigationItems = [
  {
    title: "YOU",
    url: createPageUrl("You"),
    icon: BookOpen,
    id: "you"
  },
  {
    title: "Capture",
    url: createPageUrl("Capture"),
    icon: Camera,
    isCenter: true,
    id: "capture"
  },
  {
    title: "Circles",
    url: createPageUrl("Circles"),
    icon: Users,
    id: "circles"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDailyReminder, setShowDailyReminder] = useState(false);

  // Trust & Token state
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [userTrustData, setUserTrustData] = useState({
    trustLevel: 'Silver',
    trustConnections: 8,
    youBalance: 156,
    dailyEarnings: 24,
    stakedInTrust: 72,
    investedInCircles: 240
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Check if user should see daily reminder (mock logic)
      const lastMomentDate = user?.last_moment_date;
      const today = new Date().toDateString();

      if (!lastMomentDate || new Date(lastMomentDate).toDateString() !== today) {
        // Show reminder only if user has captured moments before but not today
        if (user?.moment_count > 0) {
          setShowDailyReminder(true);
          // Auto-hide after 10 seconds
          setTimeout(() => setShowDailyReminder(false), 10000);
        }
      }
    } catch (error) {
      console.log('User not logged in');
    }
  };

  const isActive = (url) => {
    if (url === createPageUrl("You") && (location.pathname === "/" || location.pathname === createPageUrl("You"))) {
      return true;
    }
    return location.pathname === url;
  };

  const getTrustLevelIcon = (level) => {
    const icons = { Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎' };
    return icons[level] || '🥉';
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <style>{`
        :root {
          --background: 228 17% 14%; /* #1a1f2e */
          --foreground: 210 20% 98%;
          --card: 225 14% 18%; /* #2d2a3d */
          --card-foreground: 210 20% 98%;
          --popover: 240 5% 15%; /* #2c2c2e */
          --popover-foreground: 210 20% 98%;
          --primary: 210 20% 98%;
          --primary-foreground: 228 17% 14%;
          --secondary: 225 14% 18%;
          --secondary-foreground: 210 20% 98%;
          --muted: 240 5% 15%;
          --muted-foreground: 217.9 10.6% 64.9%;
          --accent: 225 14% 18%;
          --accent-foreground: 210 20% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 20% 98%;
          --border: 225 14% 25%;
          --input: 240 5% 15%;
          --ring: 216 12.2% 83.9%;
        }

        body {
          background: #1a1f2e;
          color: #EAEAEA;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
        }

        /* Mobile Web App Optimizations */
        html {
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          overscroll-behavior: none;
        }
        
        /* Allow text selection in input fields */
        input, textarea, [contenteditable] {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }

        .mobile-header-seamless {
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: none !important;
        }

        .mobile-footer-zen {
          background: rgba(26, 31, 46, 0.95) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-top: 1px solid rgba(45, 42, 61, 0.3) !important;
          padding: 0.5rem 1rem;
          padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
          z-index: 1000 !important;
        }
        
        .nav-item-active-zen {
          color: white;
        }

        .nav-item-inactive-zen {
          color: #9ca3af;
        }

        /* PWA Viewport optimizations */
        @media (display-mode: standalone) {
          body {
            padding-top: env(safe-area-inset-top);
          }
        }

        @media (max-width: 767.98px) {
          .desktop-sidebar {
            display: none;
          }
          .main-content-wrapper {
            margin-left: 0 !important;
          }
        }
      `}</style>

      {/* Daily Reminder Banner */}
      <AnimatePresence>
        {showDailyReminder && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-800/80 to-blue-800/80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between p-3 max-w-md mx-auto">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Capture today's moment? ✨</span>
              </div>
              <button
                onClick={() => setShowDailyReminder(false)}
                className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="desktop-sidebar fixed left-0 top-0 h-full w-64 bg-[#2d2a3d] border-r border-[#2c2c2e] z-40 hidden md:block">
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.url);

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        active
                          ? 'bg-purple-600/20 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 main-content-wrapper bg-[#1a1f2e]">
          {/* Mobile Header Removed for YOU page fullscreen experience */}
          
          <main className="min-h-screen">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation - Updated for 3-icon layout */}
        <div className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50">
          <nav className="mobile-footer-zen">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);

                if (item.isCenter) {
                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      className="relative -mt-6"
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg"
                        style={{ boxShadow: '0 0 20px rgba(109, 40, 217, 0.4)' }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="flex flex-col items-center py-2 px-4 min-w-[60px]"
                  >
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Icon className={`w-6 h-6 transition-colors duration-200 ${active ? 'nav-item-active-zen' : 'nav-item-inactive-zen'}`} />
                    </motion.div>
                    <span className={`text-xs mt-1 transition-colors duration-200 ${active ? 'nav-item-active-zen' : 'nav-item-inactive-zen'}`}>
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Trust Level Modal */}
      <AnimatePresence>
        {showTrustModal && (
          <TrustLevelModal
            isOpen={showTrustModal}
            onClose={() => setShowTrustModal(false)}
            userTrustData={userTrustData}
          />
        )}
      </AnimatePresence>

      {/* Token Details Modal */}
      <AnimatePresence>
        {showTokenModal && (
          <TokenDetailsModal
            isOpen={showTokenModal}
            onClose={() => setShowTokenModal(false)}
            tokenData={userTrustData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

