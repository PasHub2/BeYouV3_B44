
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, BookOpen, Star, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProfileHeader({ user, moments }) {
  if (!user) return null;

  const stats = {
    moments: moments.length,
    favorites: moments.filter(m => m.is_favorite).length,
    circles: [...new Set(moments.flatMap(m => m.circle_shares || []).map(cs => cs.circle_id))].filter(id => id !== 'private').length
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#2d2a3d]/40 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-white/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/20">
            <AvatarImage src={user.profile_image_url} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl sm:text-2xl">
              {user.full_name?.[0] || 'Y'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-white">{user.full_name || 'Your Diary'}</h2>
            <p className="text-xs sm:text-sm text-white/70">A private collection of your authentic moments.</p>
          </div>
        </div>
        <Link to={createPageUrl('Settings')}>
          <button className="bg-white/10 p-2 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0">
            <Settings className="w-5 h-5" />
          </button>
        </Link>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-around">
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white">{stats.moments}</p>
          <p className="text-xs text-white/60 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Moments</p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white">{stats.favorites}</p>
          <p className="text-xs text-white/60 flex items-center gap-1"><Heart className="w-3 h-3" /> Favorites</p>
        </div>
        <div className="text-center">
          <p className="text-base sm:text-lg font-bold text-white">{stats.circles}</p>
          <p className="text-xs text-white/60 flex items-center gap-1"><Star className="w-3 h-3" /> Circles</p>
        </div>
      </div>
    </motion.div>
  );
}
