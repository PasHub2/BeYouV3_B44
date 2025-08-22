import React, { useState, useEffect } from 'react';
import { Moment, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  Hash,
  MapPin,
  Clock,
  Sparkles,
  Filter,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MomentCard from "../components/moments/MomentCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Discover() {
  const [moments, setMoments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [popularTags, setPopularTags] = useState([]);

  useEffect(() => {
    loadDiscoverContent();
  }, [sortBy]);

  const loadDiscoverContent = async () => {
    setLoading(true);
    try {
      // Load public moments with sorting
      const orderBy = sortBy === 'recent' ? '-created_date' : 
                     sortBy === 'popular' ? '-like_count' : 
                     sortBy === 'minted' ? '-created_date' : '-created_date';
      
      let fetchedMoments = await Moment.filter({ visibility: 'public' }, orderBy, 50);
      
      // Filter for minted moments if selected
      if (sortBy === 'minted') {
        fetchedMoments = fetchedMoments.filter(moment => moment.is_minted);
      }
      
      setMoments(fetchedMoments);

      // Extract popular tags
      const allTags = fetchedMoments.flatMap(moment => moment.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});
      
      const popular = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);
      
      setPopularTags(popular);

      // Load user data
      const userIds = [...new Set(fetchedMoments.map(m => m.created_by))];
      const usersData = {};
      
      for (const userId of userIds) {
        try {
          const userData = await User.filter({ email: userId });
          if (userData.length > 0) {
            usersData[userId] = userData[0];
          }
        } catch (error) {
          console.log(`Could not load user data for ${userId}`);
        }
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading discover content:', error);
    }
    setLoading(false);
  };

  const filteredMoments = moments.filter(moment => {
    const matchesSearch = moment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         moment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => moment.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: Clock },
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'minted', label: 'NFT Moments', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Discover Moments
          </h1>
          <p className="text-white/70 text-lg">
            Explore authentic moments from the BeYou community
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search moments, descriptions, or locations..."
              className="glass-effect border-white/20 text-white placeholder:text-white/50 pl-12 py-3 text-lg"
            />
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-3 mb-6">
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  onClick={() => setSortBy(option.value)}
                  className={sortBy === option.value 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'border-white/20 text-white hover:bg-white/10'
                  }
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </Button>
              );
            })}
          </div>

          {/* Popular Tags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-white/60" />
              <span className="text-white font-medium">Popular Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'border-white/20 text-white/80 hover:bg-white/10'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedTags.length > 0) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-white/60 text-sm">Active filters:</span>
              {searchQuery && (
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                  #{tag}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-white" 
                    onClick={() => toggleTag(tag)}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white/60 hover:text-white text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </motion.div>

        {/* Results */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="glass-effect rounded-2xl p-6 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-10 h-10 rounded-full bg-white/20" />
                      <div>
                        <Skeleton className="w-32 h-4 bg-white/20 mb-1" />
                        <Skeleton className="w-20 h-3 bg-white/20" />
                      </div>
                    </div>
                    <Skeleton className="w-full aspect-square rounded-xl bg-white/20 mb-4" />
                    <Skeleton className="w-3/4 h-4 bg-white/20 mb-2" />
                    <Skeleton className="w-1/2 h-4 bg-white/20" />
                  </div>
                ))}
              </div>
            ) : filteredMoments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No moments found</h3>
                <p className="text-white/60 mb-6">
                  {searchQuery || selectedTags.length > 0
                    ? "Try adjusting your search or filters"
                    : "No public moments available yet"
                  }
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {filteredMoments.map((moment, index) => (
                  <motion.div
                    key={moment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <MomentCard
                      moment={moment}
                      user={users[moment.created_by]}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Load More Button */}
          {!loading && filteredMoments.length > 0 && filteredMoments.length >= 20 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center pt-8"
            >
              <Button
                onClick={loadDiscoverContent}
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Load More Moments
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}