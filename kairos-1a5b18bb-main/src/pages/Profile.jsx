
import React, { useState, useEffect } from 'react';
import { User, Moment } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Edit3, 
  MapPin, 
  Calendar,
  Sparkles,
  Heart,
  MessageCircle,
  Share,
  Grid3X3,
  List,
  Verified,
  Crown,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import MomentCard from "../components/moments/MomentCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userMoments, setUserMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      // Load user's moments
      const moments = await Moment.filter({ created_by: user.email }, '-created_date');
      setUserMoments(moments);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const handleMint = async (momentId) => {
    // Optimistically update the UI to show "minting" status
    setUserMoments(prev => prev.map(m => 
        m.id === momentId ? { ...m, minting_status: 'minting' } : m
    ));

    try {
      // Simulate API call to start minting process
      await Moment.update(momentId, { minting_status: 'minting' });

      // Simulate blockchain transaction time (5 seconds)
      setTimeout(async () => {
        try {
          const mintedData = {
            minting_status: 'minted',
            is_minted: true,
            transaction_hash: `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
            nft_token_id: `${Math.floor(Math.random() * 100000)}`
          };
          await Moment.update(momentId, mintedData);

          // Update UI with the final "minted" state
          setUserMoments(prev => prev.map(m => 
            m.id === momentId ? { ...m, ...mintedData } : m
          ));
        } catch (error) {
          console.error("Error finalizing mint:", error);
          loadProfile(); 
        }
      }, 5000);
    } catch (error) {
      console.error("Error starting mint:", error);
      loadProfile(); 
    }
  };

  const stats = {
    moments: userMoments.length,
    likes: userMoments.reduce((sum, moment) => sum + (moment.like_count || 0), 0),
    minted: userMoments.filter(moment => moment.is_minted).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-3xl p-8 mb-8 border border-white/15">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Skeleton className="w-32 h-32 rounded-full bg-white/20" />
              <div className="flex-1 space-y-3">
                <Skeleton className="w-48 h-8 bg-white/20" />
                <Skeleton className="w-32 h-4 bg-white/20" />
                <Skeleton className="w-64 h-4 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-3xl p-8 mb-8 border border-white/15"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-32 h-32 ring-4 ring-white/25">
                <AvatarImage src={currentUser?.profile_image_url} />
                <AvatarFallback className="bg-gradient-to-r from-purple-400 to-blue-400 text-white text-4xl">
                  {currentUser?.username?.[0]?.toUpperCase() || currentUser?.full_name?.[0]?.toUpperCase() || 'Y'}
                </AvatarFallback>
              </Avatar>
              {currentUser?.is_verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center ring-4 ring-black/30">
                  <Verified className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">
                  {currentUser?.username || currentUser?.full_name || 'You'}
                </h1>
                {currentUser?.ens_name && (
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                    {currentUser.ens_name}
                  </Badge>
                )}
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <p className="text-white/70 mb-4">
                {currentUser?.email}
              </p>
              
              {currentUser?.bio && (
                <p className="text-white/90 mb-6 max-w-md">
                  {currentUser.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.moments}</div>
                  <div className="text-white/70 text-sm">Moments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{stats.likes}</div>
                  <div className="text-white/70 text-sm">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">{stats.minted}</div>
                  <div className="text-white/70 text-sm">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentUser?.follower_count || 127}</div>
                  <div className="text-white/70 text-sm">Followers</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center md:justify-start">
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="bg-black/40 border-white/30 text-white/90 hover:bg-black/60 hover:text-white">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="mt-8 pt-6 border-t border-white/15">
            <h3 className="text-sm font-medium text-white/70 mb-3">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/20 text-green-200 border-green-400/30">
                <Star className="w-3 h-3 mr-1" />
                Early Adopter
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                <Sparkles className="w-3 h-3 mr-1" />
                NFT Creator
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                <Verified className="w-3 h-3 mr-1" />
                Verified Authentic
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* View Controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Your Moments</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
                  : 'bg-black/40 border-white/30 text-white/90 hover:bg-black/60 hover:text-white'
                }
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' 
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0'
                  : 'bg-black/40 border-white/30 text-white/90 hover:bg-black/60 hover:text-white'
                }
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Moments Display */}
          <AnimatePresence mode="wait">
            {userMoments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 glass-effect rounded-2xl border border-white/15"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Your first moment awaits</h3>
                <p className="text-white/70 mb-6">
                  Start capturing and sharing your authentic moments with the BeYou community!
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0">
                  Create Your First Moment
                </Button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userMoments.map((moment, index) => (
                  <motion.div
                    key={moment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass-effect border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      <div className="relative aspect-square">
                        <img 
                          src={moment.back_camera_url || moment.image_url} 
                          alt={moment.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {moment.front_camera_url && (
                          <div className="absolute bottom-2 right-2 w-16 h-20 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg">
                            <img 
                              src={moment.front_camera_url} 
                              alt="Front camera"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {moment.is_minted && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full p-2 shadow-lg">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate">{moment.title}</h3>
                          <div className="flex items-center gap-3 text-white/90 text-xs">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {moment.like_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {moment.comment_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(moment.created_date), 'MMM d')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {userMoments.map((moment, index) => (
                  <motion.div
                    key={moment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MomentCard
                      moment={moment}
                      user={currentUser}
                      onMint={handleMint}
                      isOwner={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
