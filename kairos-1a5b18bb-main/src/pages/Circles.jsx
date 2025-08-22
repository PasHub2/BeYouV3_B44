
import React, { useState, useEffect, useCallback } from 'react';
import { CircleMembership, User, Moment } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Camera,
  Plus,
  Star,
  CheckCircle2,
  Coins,
  ArrowRight,
  UserPlus,
  Shield,
  Footprints,
  Award, // Already imported
  Trophy // Added Trophy import for trust level
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoggedOutView from '../components/auth/LoggedOutView';

// New CirclePreview component
function CirclePreview({ circle, isJoined }) {
  const [recentMoments, setRecentMoments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only load moments for commercial circles and if not already loading
    if (circle.type === 'commercial' && !loading) {
      loadRecentPosts();
    }
  }, [circle.id, circle.type]); // CRITICAL FIX: Removed 'loading' from dependency array to prevent infinite loop

  const loadRecentPosts = async () => {
    setLoading(true);
    try {
      const moments = await Moment.filter({
        'circle_shares.circle_id': circle.id
      }, '-created_date', 5); // Fetch up to 5 moments, sorted by created_date descending
      setRecentMoments(moments);
    } catch (error) {
      console.error('Error loading recent posts for circle', circle.id, ':', error);
    }
    setLoading(false);
  };

  // Trust Circle: No previews (minimal) - as per outline, though discoveryCircles doesn't contain it.
  if (circle.id === 'trust_circle') {
    return null;
  }

  // Community Circles: Badge Preview System
  if (circle.type === 'community') {
    return (
      <div className="mt-3 p-3 bg-amber-500/5 rounded-lg border border-amber-400/20">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-amber-200 text-sm font-medium">Active Achievements</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {circle.badges && circle.badges.length > 0 ? (
            circle.badges.map((badge, index) => (
              <span key={index} className="text-xs bg-amber-400/20 text-amber-200 px-2 py-1 rounded-full">
                {badge}
              </span>
            ))
          ) : (
            <span className="text-xs text-amber-300/60">No achievements yet</span>
          )}
        </div>
        <button className="text-amber-400 text-xs hover:text-amber-300 transition-colors">
          View All Achievements →
        </button>
      </div>
    );
  }

  // Commercial Circles: Story-Style Preview
  if (circle.type === 'commercial') {
    return (
      <div className="mt-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white/70 text-sm font-medium">Recent Activity</span>
        </div>
        <div className="flex gap-2">
          {loading ? (
             Array(5).fill(0).map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white/20 bg-gray-700/30 animate-pulse"
              />
            ))
          ) : recentMoments.length > 0 ? (
            recentMoments.slice(0, 5).map((moment) => (
              <div
                key={moment.id} // Use moment.id for key
                className="w-8 h-8 rounded-full border-2 border-white/30 bg-gray-800 overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                title={moment.title || 'Moment thumbnail'} // Added fallback title
              >
                {moment.back_camera_url ? ( // Check if URL exists
                  <img
                    src={moment.back_camera_url}
                    alt={moment.title || "Moment thumbnail"} // Alt text for accessibility
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white/50 text-xs">?</div> // Placeholder if no image
                )}
              </div>
            ))
          ) : (
            Array(5).fill(0).map((_, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white/20 bg-gray-700/30"
              />
            ))
          )}
        </div>
        {recentMoments.length === 0 && !loading && ( // Only show if no recent activity and not loading
          <p className="text-white/40 text-xs mt-2">No recent activity</p>
        )}
      </div>
    );
  }

  return null;
}

export default function Circles() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [youTokenBalance, setYouTokenBalance] = useState(147);
  const [joinedCircles, setJoinedCircles] = useState(new Set());
  const [favoriteCircles, setFavoriteCircles] = useState(new Set());
  const [trustConnections, setTrustConnections] = useState(0); // Assuming this is managed elsewhere or a mock

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        await loadUserCircleMemberships(user);
      } catch (userError) {
        console.log('User not logged in, using demo user');
        setCurrentUser({
          email: 'demo@example.com',
          username: 'Demo User',
          full_name: 'Demo User',
          id: 'demo-user-id'
        });
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const loadUserCircleMemberships = async (user) => {
    if (!user || !user.id) return;

    try {
      const memberships = await CircleMembership.filter({ user_id: user.id });
      const joinedSet = new Set(memberships.map(m => m.circle_id));
      setJoinedCircles(joinedSet);
    } catch (error) {
      console.error('Error loading circle memberships:', error);
    }
  };

  const handleJoinCircle = async (circle) => {
    if (!currentUser || joinedCircles.has(circle.id)) return;

    if (youTokenBalance < circle.joinCost) {
      alert(`You need ${circle.joinCost - youTokenBalance} more YOU Tokens to join this circle.`);
      return;
    }

    try {
      // Create membership in database
      await CircleMembership.create({
        circle_id: circle.id,
        user_id: currentUser.id,
        role: 'member',
        badge_level: 'none',
        post_count: 0,
      });

      // Update local state
      setJoinedCircles(prev => new Set([...prev, circle.id]));
      setYouTokenBalance(prev => prev - circle.joinCost);

      console.log(`Successfully joined ${circle.name} for ${circle.joinCost} tokens`);
    } catch (error) {
      console.error('Error joining circle:', error);
      alert('Failed to join circle. Please try again.');
    }
  };

  const handleEnterTrustCircle = useCallback(() => {
    navigate(createPageUrl("TrustCircle"));
  }, [navigate]);

  const toggleFavorite = (circleId) => {
    setFavoriteCircles(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(circleId)) {
        newFavorites.delete(circleId);
      } else {
        newFavorites.add(circleId);
      }
      return newFavorites;
    });
  };

  const handleCircleDetail = (circleId) => {
    navigate(createPageUrl(`CircleDetail?id=${circleId}`));
  };

  const enhancedDiscoveryCircles = [
    {
      id: 'photography_community',
      name: 'Photography Community',
      icon: Camera,
      memberCount: 2100,
      description: 'Share stunning moments and connect with fellow photographers',
      type: 'community',
      joinCost: 120,
      style: 'organic',
      trustRequired: 'Silver',
      tier: 'silver',
      estimatedEarnings: '50-150 YOU weekly',
      badges: ['🥇 Gold Explorer', '🥈 Silver Photographer', '🥉 Bronze Newcomer'],
      recentPosts: []
    },
    {
      id: 'asics_run_club',
      name: 'ASICS Run Club',
      icon: Footprints, // Changed back to Footprints, as Award was likely a mistake in outline and it's a run club
      memberCount: 3400,
      description: 'Track progress and unlock exclusive ASICS experiences',
      type: 'commercial',
      joinCost: 180,
      style: 'geometric',
      trustRequired: 'Gold',
      tier: 'gold',
      estimatedEarnings: '80-200 YOU weekly',
      badges: [],
      recentPosts: []
    }
  ];

  const getAffordabilityStatus = (circle) => {
    const userBalance = youTokenBalance;
    const dailyEarnings = 24; // Mock daily earnings
    
    if (userBalance >= circle.joinCost) {
      return { 
        status: 'affordable', 
        message: 'Join Now',
        style: 'border-green-400/40 bg-green-500/10 shadow-green-400/20',
        buttonStyle: 'bg-[#A8B5A0] hover:bg-[#A8B5A0]/90 text-white' // Re-used existing 'affordable' button style
      };
    }
    
    const needed = circle.joinCost - userBalance;
    const daysToEarn = Math.ceil(needed / dailyEarnings);
    
    return { 
      status: 'soon', 
      message: `${daysToEarn} days to earn`,
      style: 'border-yellow-400/40 bg-yellow-500/10 shadow-yellow-400/20',
      buttonStyle: 'bg-yellow-600 hover:bg-yellow-700 text-white' // Added text-white for visibility
    };
    
    // Original expensive status not needed as per original code logic (only affordable and soon/expensive distinction in message)
    // return { 
    //   status: 'expensive', 
    //   message: `Need ${needed} more tokens`,
    //   style: 'border-red-400/40 bg-red-500/10 shadow-red-400/20',
    //   buttonStyle: 'bg-gray-600/20 text-gray-400 cursor-not-allowed' // Re-used existing 'expensive' button style
    // };
  };

  const getTrustRequirementStatus = (circle, userTrustLevel = 'Silver') => {
    const trustLevels = { Bronze: 1, Silver: 2, Gold: 3, Diamond: 4 };
    const userLevel = trustLevels[userTrustLevel] || 2;
    const requiredLevel = trustLevels[circle.trustRequired] || 1;
    
    return {
      meetsRequirement: userLevel >= requiredLevel,
      message: userLevel >= requiredLevel ? 'Requirement met' : `${circle.trustRequired} Level Required`
    };
  };

  const getTierStyles = (tier) => {
    const styles = {
      bronze: 'border-amber-400/40 bg-amber-500/10',
      silver: 'border-slate-400/40 bg-slate-500/10', 
      gold: 'border-yellow-400/40 bg-yellow-500/10',
      diamond: 'border-purple-400/40 bg-purple-500/10'
    };
    return styles[tier] || styles.bronze;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pb-32">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#A8B5A0] rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !currentUser.username) {
    return (
      <LoggedOutView
        icon={Users}
        title="Find Your Community"
        message="Join circles, connect with like-minded people, and share authentic moments! Log in to start your journey."
        buttonText="Start Connecting"
      />
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      <div className="p-4 max-w-md mx-auto">
        {/* Header with Create Circle Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Circles</h1>
            <p className="text-white/60 text-sm">Connect and share authentic moments</p>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("CreateCircle"))}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        </motion.div>

        {/* Trust Circle Hero Section - Reduced Height and adjusted styles */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4" // Further reduced margin
        >
          <Card
            className="bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/30 transition-all duration-500 cursor-pointer overflow-hidden relative group"
            style={{ minHeight: '140px' }} // Further reduced height
            onClick={handleEnterTrustCircle}
          >
            {/* Subtle Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardContent className="p-5 h-full flex flex-col justify-center items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-lg font-bold text-white mb-2">Trust Circle</h2>

              <p className="text-white/80 text-sm mb-3 max-w-xs leading-relaxed">
                {trustConnections === 0
                  ? "Build your trust network" // Updated message
                  : `${trustConnections} trusted friends`
                }
              </p>

              <Button
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full px-4 py-1 text-sm" // Adjusted size and padding
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterTrustCircle();
                }}
              >
                <ArrowRight className="w-3 h-3 mr-1" /> {/* Adjusted icon size */}
                Enter
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Favorited Circles Section - Only show if user has favorites */}
        {favoriteCircles.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Your Circles</h2>
            </div>

            <div className="space-y-3">
              {enhancedDiscoveryCircles // Changed to enhancedDiscoveryCircles
                .filter(circle => favoriteCircles.has(circle.id))
                .map((circle) => (
                  <FavoriteCircleCard
                    key={circle.id}
                    circle={circle}
                    isJoined={joinedCircles.has(circle.id)}
                    onToggleFavorite={toggleFavorite}
                    onCircleDetail={handleCircleDetail}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Discovery Section - Enhanced with Economics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-[#A8B5A0] to-[#B8B5D1] rounded-full" />
            <h2 className="text-lg font-bold text-white">Discover</h2>
          </div>

          <div className="space-y-4"> {/* Increased spacing slightly for new elements */}
            {enhancedDiscoveryCircles.map((circle, index) => {
              const CircleIcon = circle.icon;
              const isJoined = joinedCircles.has(circle.id);
              const isFavorited = favoriteCircles.has(circle.id);
              const affordability = getAffordabilityStatus(circle);
              const trustStatus = getTrustRequirementStatus(circle);

              return (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card
                    className={`
                      cursor-pointer transition-all duration-500 overflow-hidden group relative
                      ${getTierStyles(circle.tier)}
                      ${circle.style === 'organic'
                        ? 'rounded-2xl shadow-lg hover:shadow-xl'
                        : 'rounded-lg shadow-md hover:shadow-lg'
                      }
                    `}
                    onClick={() => handleCircleDetail(circle.id)}
                  >
                    {/* Entry Fee Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-400" />
                          <span className="text-white text-xs font-medium">
                            {circle.joinCost} YOU
                          </span>
                        </div>
                        <div className="text-white/60 text-xs text-center">
                          ~{Math.ceil(circle.joinCost / 24)} days
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`
                              w-12 h-12 flex items-center justify-center text-white flex-shrink-0
                              ${circle.style === 'organic'
                                ? 'rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                                : 'rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20'
                              }
                            `}
                          >
                            <CircleIcon className="w-6 h-6" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white text-base group-hover:text-[#A8B5A0] transition-colors">
                                {circle.name}
                              </h3>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(circle.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Star
                                  className={`w-4 h-4 transition-colors ${
                                    isFavorited ? 'text-amber-400 fill-amber-400' : 'text-white/60 hover:text-amber-400'
                                  }`}
                                />
                              </button>
                            </div>

                            <p className="text-white/70 text-sm mb-2 leading-relaxed">
                              {circle.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
                                {circle.memberCount.toLocaleString()} members
                              </Badge>
                              
                              {/* Trust Requirement Badge */}
                              <Badge 
                                className={`text-xs ${
                                  trustStatus.meetsRequirement 
                                    ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                }`}
                              >
                                <Shield className="w-3 h-3 mr-1" /> {trustStatus.message}
                              </Badge>
                            </div>

                            {/* Earnings Potential */}
                            <div className="text-green-400 text-xs font-medium mb-2">
                              💰 Earn {circle.estimatedEarnings}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Previews */}
                      <CirclePreview circle={circle} isJoined={isJoined} />

                      {/* Enhanced Join Button with Affordability Status */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isJoined && affordability.status === 'affordable' && trustStatus.meetsRequirement) {
                            handleJoinCircle(circle);
                          } else if (isJoined) { // If already joined, always navigate
                            handleCircleDetail(circle.id);
                          }
                        }}
                        className={`
                          w-full text-sm font-medium transition-all border-0 h-auto py-2 mt-3
                          ${isJoined
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                            : affordability.buttonStyle
                          }
                        `}
                        disabled={!isJoined && !trustStatus.meetsRequirement}
                      >
                        {isJoined ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Joined
                          </>
                        ) : !trustStatus.meetsRequirement ? (
                          <>
                            <Trophy className="w-4 h-4 mr-2" />
                            {circle.trustRequired} Level Required
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 mr-2" />
                            {affordability.message}
                          </>
                        )}
                      </Button>

                      {/* Additional Info for Expensive Circles */}
                      {!isJoined && affordability.status === 'expensive' && trustStatus.meetsRequirement && (
                        <p className="text-center text-amber-400 text-xs mt-2">
                          Keep earning to unlock this premium circle
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Enhanced Token Balance Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl px-6 py-3 border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-[#A8B5A0]" />
                <span className="text-white font-medium">{youTokenBalance} YOU</span>
              </div>
              <div className="text-green-400 text-xs">+24 daily earnings</div>
            </div>
            
            <div className="w-px h-8 bg-white/20" />
            
            <div className="text-center">
              <div className="text-white/80 text-sm">Weekly potential</div>
              <div className="text-amber-300 text-xs font-medium">€2-15 (~50-400 YOU)</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper component for favorited circles (if any)
function FavoriteCircleCard({ circle, isJoined, onToggleFavorite, onCircleDetail }) {
  const CircleIcon = circle.icon;

  return (
    <Card
      className="bg-white/5 border-white/10 hover:border-amber-400/30 transition-all duration-300 cursor-pointer"
      onClick={() => onCircleDetail(circle.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center">
            <CircleIcon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white text-sm">{circle.name}</h3>
            <p className="text-white/60 text-xs">{circle.memberCount.toLocaleString()} members</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(circle.id);
            }}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
