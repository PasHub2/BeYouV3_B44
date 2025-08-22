
import React, { useState, useEffect } from 'react';
import { CircleMembership, User, Moment } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Users, 
  Crown,
  CheckCircle2,
  Coins,
  ArrowLeft,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen, // Rules Icon
  Gift // Rewards Icon
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MomentDetailView from "../components/moments/MomentDetailView";

// Enhanced Dual Moment Card for Circle Detail
function EnhancedDualMomentCard({ moment, user, onViewDetail }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipPictures = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const mainImage = isFlipped ? moment.front_camera_url : moment.back_camera_url;
  const secondaryImage = isFlipped ? moment.back_camera_url : moment.front_camera_url;

  // FIXED: Trust Circle Badge Logic
  const circleShare = moment.circle_shares && moment.circle_shares.length > 0 ? moment.circle_shares[0] : null;
  
  const BadgeDisplay = () => {
    if (!circleShare) return null;

    switch (circleShare.circle_id) {
      case 'trust_circle':
        return (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg flex items-center gap-1.5">
            <Users className="w-3 h-3 text-white" />
            <span className="text-white text-xs pr-1">Trust Circle</span>
          </div>
        );
      case 'photography_community':
        return (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-purple-300" />
            <span className="text-white text-xs pr-1">Photography</span>
          </div>
        );
      case 'asics_run_club':
        return (
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg flex items-center gap-1.5">
            <Award className="w-3 h-3 text-blue-300" />
            <span className="text-white text-xs pr-1">ASICS</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto relative cursor-pointer"
      layout
      onClick={() => onViewDetail(moment)}
    >
      <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {mainImage ? (
          <img src={mainImage} alt={moment.title || 'Moment'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-600" />
          </div>
        )}

        <BadgeDisplay />

        {secondaryImage && (
          <button
            onClick={handleFlipPictures}
            className="absolute bottom-3 right-3 w-16 h-20 rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 hover:scale-105"
          >
            <img src={secondaryImage} alt="Switch view" className="w-full h-full object-cover" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Content Curation Tabs for Photography Community
function ContentCurationTabs({ moments, onMomentsUpdate }) {
  const [activeTab, setActiveTab] = useState('recent');

  const tabs = [
    { id: 'hot', label: '🔥 Hot Shots', icon: '🔥' },
    { id: 'recent', label: '📅 Recent', icon: '📅' },
    { id: 'hall', label: '🏆 Hall of Fame', icon: '🏆' }
  ];

  const sortedMoments = React.useMemo(() => {
    switch (activeTab) {
      case 'hot':
        return [...moments].sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
      case 'hall':
        return [...moments].sort((a, b) => (b.appreciation_count || 0) - (a.appreciation_count || 0));
      case 'recent':
      default:
        return [...moments].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
  }, [moments, activeTab]);

  React.useEffect(() => {
    onMomentsUpdate(sortedMoments);
  }, [sortedMoments, onMomentsUpdate]);

  return (
    <div className="flex border-b border-white/10 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-amber-400 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Re-implemented Getting Started Guide with Blue Design and Tabs
function GettingStartedGuide({ circle, userPostCount }) {
  const [activeTab, setActiveTab] = useState('badges');
  const [isExpanded, setIsExpanded] = useState(userPostCount < 3);

  const tabs = [
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'rules', label: 'Rules', icon: BookOpen },
  ];

  const getProgress = (requirement) => {
    return Math.min((userPostCount / requirement) * 100, 100);
  };
  
  if (!isExpanded) {
    return (
      <div className="mb-6">
        <Button onClick={() => setIsExpanded(true)} variant="outline" className="w-full bg-blue-900/20 border-blue-500/30 text-blue-200 hover:bg-blue-900/40">
          <Info className="w-4 h-4 mr-2" />
          Show Getting Started Guide
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 bg-blue-900/40 border border-blue-500/30 text-white">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-300" />
            <h3 className="text-lg font-bold text-white">Getting Started</h3>
          </div>
          <button onClick={() => setIsExpanded(false)} className="text-white/70 hover:text-white">
            <ChevronUp className="w-5 h-5" />
          </button>
        </div>

        {/* Tab System */}
        <div className="flex border-b border-blue-500/30 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-400 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'badges' && (
            <div className="space-y-4">
              {circle.badges.map((badge, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{badge.name}</span>
                    <span className="text-xs text-white/70">{userPostCount}/{badge.requirement} Posts</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${getProgress(badge.requirement)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'rewards' && (
            <ul className="space-y-2 text-sm list-disc list-inside text-white/90">
               {circle.badges.map((badge, index) => (
                <li key={index}><strong>{badge.name}:</strong> {badge.reward}</li>
              ))}
            </ul>
          )}
          {activeTab === 'rules' && (
            <ul className="space-y-2 text-sm list-disc list-inside text-white/90">
              {circle.guidelines.map((rule, index) => (
                <li key={index}>{rule}</li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CircleDetail() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [circleId, setCircleId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [youTokenBalance, setYouTokenBalance] = useState(147);
  const [moments, setMoments] = useState([]);
  const [selectedMoment, setSelectedMoment] = useState(null);
  const [userPostCount, setUserPostCount] = useState(0);
  const [sortedMoments, setSortedMoments] = useState([]);

  // Circle data
  const circleData = {
    'photography_community': {
      name: 'Photography Community',
      description: 'Share stunning moments and connect with fellow photographers',
      longDescription: 'Join our vibrant community of photography enthusiasts! Share your best shots, get feedback from peers, and discover new techniques. From landscapes to portraits, street photography to macro - all styles welcome.',
      icon: Camera,
      memberCount: 2100,
      joinCost: 2,
      type: 'community',
      badges: [
        { name: 'Bronze Explorer', requirement: 5, reward: 'Featured in our weekly gallery', level: 'bronze' },
        { name: 'Silver Adventurer', requirement: 15, reward: 'Unlock exclusive photo filters', level: 'silver' },
        { name: 'Gold Champion', requirement: 30, reward: 'Access to pro workshops', level: 'gold' }
      ],
      guidelines: [
        'Post original photography only',
        'Be respectful in comments',
        'Share constructive feedback',
        'Tag your photos appropriately'
      ]
    },
    'asics_run_club': {
      name: 'ASICS Run Club',
      description: 'Track progress and unlock exclusive ASICS experiences',
      longDescription: 'Join the official ASICS Run Club to track your progress, participate in virtual challenges, and unlock exclusive rewards and experiences from ASICS.',
      icon: Users,
      memberCount: 3400,
      joinCost: 5,
      type: 'commercial',
      badges: [
        { name: 'Runner', requirement: 10, reward: '10% ASICS discount voucher', level: 'bronze' },
        { name: 'Athlete', requirement: 25, reward: 'Early access to new gear', level: 'silver' },
        { name: 'Champion', requirement: 50, reward: 'VIP invites to ASICS events', level: 'gold' }
      ],
      guidelines: [
        'Log authentic workout moments',
        'Respect other members privacy',
        'Follow community challenges',
        'Use proper workout etiquette'
      ]
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Get circle ID from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');
      setCircleId(id);

      try {
        const user = await User.me();
        setCurrentUser(user);

        let membership = null;
        if (user?.id && id) {
          // Check if user is already a member
          const memberships = await CircleMembership.filter({ 
            user_id: user.id, 
            circle_id: id 
          });
          
          membership = memberships.length > 0 ? memberships[0] : null;
          setIsJoined(!!membership);
          setUserPostCount(membership ? membership.post_count : 0);
          
          if (membership) {
            // Load circle moments if joined
            const circleMoments = await Moment.filter({ 
              'circle_shares.circle_id': id 
            }, '-created_date');
            setMoments(circleMoments);
            setSortedMoments(circleMoments); // Initialize sorted moments
          }
        }
      } catch (error) {
        console.error("Error loading circle data:", error);
      }
      setLoading(false);
    };

    loadData();
  }, [circleId, navigate]);

  const handleJoinCircle = async () => {
    if (!currentUser || !circleId || isJoined) return;

    const circle = circleData[circleId];
    if (youTokenBalance < circle.joinCost) {
      alert(`You need ${circle.joinCost - youTokenBalance} more YOU Tokens to join this circle.`);
      return;
    }

    try {
      await CircleMembership.create({
        circle_id: circleId,
        user_id: currentUser.id,
        role: 'member',
        badge_level: 'none',
        post_count: 0,
      });

      setIsJoined(true);
      setYouTokenBalance(prev => prev - circle.joinCost);
      setUserPostCount(0); // Reset or set to 0 posts for new member
      
      // Load circle moments after joining
      const circleMoments = await Moment.filter({ 
        'circle_shares.circle_id': circleId 
      }, '-created_date');
      setMoments(circleMoments);
      setSortedMoments(circleMoments);
      
    } catch (error) {
      console.error('Error joining circle:', error);
      alert('Failed to join circle. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-32">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#A8B5A0] rounded-full animate-spin" />
      </div>
    );
  }
  
  const currentCircle = circleData[circleId];
  if (!circleId || !currentCircle) {
    return (
      <div className="min-h-screen bg-black p-4 pb-32">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-white mb-4">Circle not found</h1>
          <Button onClick={() => navigate(createPageUrl("Circles"))}>
            Back to Circles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <currentCircle.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{currentCircle.name}</h1>
            <p className="text-white/60 text-sm">{currentCircle.memberCount.toLocaleString()} members</p>
          </div>
        </div>

        <p className="text-white/80 text-sm mb-4 leading-relaxed">{currentCircle.longDescription}</p>

        {/* FIXED HIERARCHY for joined users: Create Post Button, Status, Getting Started Guide */}
        {isJoined ? (
          <>
            {/* Joined status text */}
            <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>Joined • {userPostCount} posts contributed</span>
            </div>

            {/* CREATE POST BUTTON - Above Getting Started Guide */}
            <motion.div whileTap={{ scale: 0.98 }} className="mb-6">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 py-3 text-base rounded-xl font-semibold"
                onClick={() => navigate(createPageUrl(`Capture?from=${circleId}`))}
              >
                <Camera className="w-4 h-4 mr-2" />
                Create Post for this Circle
              </Button>
            </motion.div>

            <GettingStartedGuide circle={currentCircle} userPostCount={userPostCount} />
          </>
        ) : (
          <Button
            onClick={handleJoinCircle}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white mb-6 h-12"
            disabled={youTokenBalance < currentCircle.joinCost}
          >
            <Coins className="w-4 h-4 mr-2" />
            Join for {currentCircle.joinCost} YOU Tokens
          </Button>
        )}

        {/* COMMUNITY MOMENTS with Content Curation */}
        <h2 className="text-xl font-bold text-white mb-4">Community Moments</h2>
        
        {isJoined ? (
          moments.length > 0 ? (
            <>
              {circleId === 'photography_community' && (
                <ContentCurationTabs 
                  moments={moments} 
                  onMomentsUpdate={setSortedMoments} 
                />
              )}
              <div className="grid gap-4">
                {(circleId === 'photography_community' ? sortedMoments : moments).map((moment) => (
                  <EnhancedDualMomentCard
                    key={moment.id}
                    moment={moment}
                    user={currentUser}
                    onViewDetail={setSelectedMoment}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h4 className="font-semibold text-white mb-2">No moments yet</h4>
                <p className="text-white/60 text-sm">Be the first to share a moment in this circle!</p>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Join to see moments</h4>
              <p className="text-white/60 text-sm">Become a member to view and share moments in this circle.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Moment Detail View */}
      {selectedMoment && (
        <MomentDetailView
          moment={selectedMoment}
          user={currentUser}
          onClose={() => setSelectedMoment(null)}
        />
      )}
    </div>
  );
}
