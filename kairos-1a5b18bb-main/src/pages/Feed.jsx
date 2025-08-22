
import React, { useState, useEffect } from 'react';
import { Moment, Like, User, Circle, CircleMembership } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Calendar, 
  Shield,
  Filter,
  RefreshCw,
  Book,
  Clock,
  Heart,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DualMomentCard from "../components/moments/DualMomentCard";
import MomentDetailView from "../components/moments/MomentDetailView"; // Re-using the detail view
import { format, isToday, isYesterday, subDays } from "date-fns";

export default function Feed() {
  const [moments, setMoments] = useState([]);
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('diary'); // diary, social
  const [selectedMoment, setSelectedMoment] = useState(null);

  useEffect(() => {
    loadFeed();
    loadCurrentUser();
  }, [viewMode]);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.log('User not logged in');
    }
  };

  const loadFeed = async () => {
    setLoading(true);
    try {
      let fetchedMoments;
      if (viewMode === 'diary') {
        const user = await User.me();
        fetchedMoments = await Moment.filter({ created_by: user.email }, '-created_date', 50);
        console.log('Loaded diary moments:', fetchedMoments);
      } else {
        fetchedMoments = await Moment.filter({ visibility: 'public' }, '-created_date', 50);
        console.log('Loaded public moments:', fetchedMoments);
      }
      setMoments(fetchedMoments);

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
      console.error('Error loading feed:', error);
      // If diary view fails due to not being logged in, switch to social
      if (viewMode === 'diary') {
        setViewMode('social');
      }
    }
    setLoading(false);
  };

  const handleUnlock = async (momentId, cost) => {
    try {
      // Simulate unlock process
      await Moment.update(momentId, { 
        permanence_status: 'permanent',
        'access_rules.is_unlockable': false 
      });
      
      // Update UI
      setMoments(prev => prev.map(m => 
        m.id === momentId ? { 
          ...m, 
          permanence_status: 'permanent',
          access_rules: { ...m.access_rules, is_unlockable: false }
        } : m
      ));
    } catch (error) {
      console.error('Error unlocking moment:', error);
    }
  };

  // Group moments by date for diary view
  const groupMomentsByDate = (moments) => {
    const grouped = {};
    moments.forEach(moment => {
      const date = new Date(moment.created_date);
      let dateKey;
      
      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(moment);
    });
    
    return grouped;
  };

  const filteredMoments = moments; // Simplified for now
  const groupedMoments = viewMode === 'diary' ? groupMomentsByDate(filteredMoments) : null;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-xl mx-auto px-4 md:px-0">
        {/* Header - Completely redesigned to be minimal */}
        <div className="flex justify-center my-6">
          <div className="inline-flex items-center bg-gray-900/50 p-1 rounded-full border border-gray-800">
            <Button
              onClick={() => setViewMode('diary')}
              variant="ghost"
              size="sm"
              className={`px-4 py-1 h-8 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'diary'
                  ? 'bg-amber-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Book className="w-4 h-4" />
              Diary
            </Button>
            <Button
              onClick={() => setViewMode('social')}
              variant="ghost"
              size="sm"
              className={`px-4 py-1 h-8 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === 'social'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              Social
            </Button>
          </div>
        </div>

        {/* Feed Content */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="space-y-8">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="aspect-square w-full rounded-2xl bg-[#1C1C1C] animate-pulse" />
                ))}
              </div>
            ) : filteredMoments.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 card-background rounded-2xl"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${viewMode === 'diary' ? 'from-amber-500 to-orange-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center mx-auto mb-6`}>
                  {viewMode === 'diary' ? <Book className="w-8 h-8 text-white" /> : <Heart className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {viewMode === 'diary' ? 'Your diary is empty' : 'No moments to discover'}
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {viewMode === 'diary' 
                    ? "Capture your first moment to start your journal."
                    : "Come back later to see what others have shared."
                  }
                </p>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0">
                  {viewMode === 'diary' ? 'Capture Your First Moment' : 'Explore Circles'}
                </Button>
              </motion.div>
            ) : viewMode === 'diary' && groupedMoments ? (
              // Diary View - Grouped by Date
              Object.entries(groupedMoments).map(([date, dateMoments], dateIndex) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dateIndex * 0.1 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-sm font-medium text-gray-500">
                      {date}
                    </h2>
                  </div>
                  {dateMoments.map((moment) => (
                    <DualMomentCard
                      key={moment.id}
                      moment={moment}
                      user={users[moment.created_by]}
                      onViewDetail={setSelectedMoment}
                    />
                  ))}
                </motion.div>
              ))
            ) : (
              // Social View - Standard Feed
              filteredMoments.map((moment, index) => (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <DualMomentCard
                    moment={moment}
                    user={users[moment.created_by]}
                    onViewDetail={setSelectedMoment}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {selectedMoment && (
          <MomentDetailView 
            moment={selectedMoment} 
            user={users[selectedMoment.created_by]} 
            onClose={() => setSelectedMoment(null)} 
            onUnlock={handleUnlock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
