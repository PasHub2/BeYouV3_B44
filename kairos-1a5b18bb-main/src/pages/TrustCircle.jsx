
import React, { useState, useEffect } from 'react';
import { Moment, User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Plus, 
  Camera, 
  BookOpen, 
  Crown, 
  Sparkles,
  Info,
  ChevronUp,
  Award,
  Gift,
  Shield // Rules Icon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MomentDetailView from "../components/moments/MomentDetailView";

// Using the same enhanced card from You-Page for consistency
function EnhancedDualMomentCard({ moment, user, onViewDetail, userMoments }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipPictures = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const mainImage = isFlipped ? moment.front_camera_url : moment.back_camera_url;
  const secondaryImage = isFlipped ? moment.back_camera_url : moment.front_camera_url;

  const circleShare = moment.circle_shares && moment.circle_shares.length > 0 ? moment.circle_shares[0] : null;
  const isTrustCircleMoment = circleShare?.circle_id === 'trust_circle';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mx-auto relative cursor-pointer"
      layout
      onClick={() => onViewDetail(moment)}
    >
      <div
        className={`relative bg-gray-900 rounded-2xl overflow-hidden ${
          isTrustCircleMoment ? 'ring-2 ring-white/30' : ''
        }`}
        style={{ aspectRatio: '3/4' }}
      >
        {mainImage ? (
          <img
            src={mainImage}
            alt={moment.title || 'Moment'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {isTrustCircleMoment && (
          <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
            <Users className="w-3 h-3 text-white" />
          </div>
        )}

        {secondaryImage && (
          <button
            onClick={handleFlipPictures}
            className="absolute bottom-3 right-3 w-16 h-20 rounded-lg overflow-hidden border-2 border-white/50 shadow-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-300 hover:scale-105"
          >
            <img
              src={secondaryImage}
              alt="Switch view"
              className="w-full h-full object-cover"
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Getting Started Guide for Trust Circle
function GettingStartedGuide() {
  const [activeTab, setActiveTab] = useState('badges');

  const tabs = [
    { id: 'badges', label: 'Trust Level', icon: Award },
    { id: 'rewards', label: 'Benefits', icon: Gift },
    { id: 'rules', label: 'Rules', icon: Shield },
  ];

  return (
    <Card className="mb-8 bg-blue-900/40 border border-blue-500/30 text-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-300" />
          <h3 className="text-lg font-bold text-white">Getting Started</h3>
        </div>

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

        <div>
          {activeTab === 'badges' && (
            <div className="space-y-2 text-sm text-white/90">
              <p>Trust Connections are the key to unlocking premium circles.</p>
              <p><strong>Current Level:</strong> Newcomer (0 connections)</p>
              <p><strong>Next Level:</strong> Bronze (3 trusted friends)</p>
            </div>
          )}
          {activeTab === 'rewards' && (
            <ul className="space-y-2 text-sm list-disc list-inside text-white/90">
              <li>Access to exclusive Premium Circles</li>
              <li>Get a "Verified Human" status badge</li>
              <li>Benefit from community trust features</li>
            </ul>
          )}
          {activeTab === 'rules' && (
            <ul className="space-y-2 text-sm list-disc list-inside text-white/90">
              <li>Only add friends you know and trust in real life.</li>
              <li>Mutual trust strengthens the entire network.</li>
              <li>Focus on quality connections over quantity.</li>
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TrustCircle() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        const trustMoments = await Moment.filter({ 
          created_by: user.email,
          'circle_shares.circle_id': 'trust_circle' 
        }, '-created_date');
        setMoments(trustMoments);
      } catch (error) {
        console.error("Error loading Trust Circle data:", error);
      }
      setLoading(false);
    };

    loadData();
  }, []);
  
  const handleCreatePost = () => {
    navigate(createPageUrl('Capture?from=trust_circle'));
  };

  return (
    <div className="min-h-screen bg-black pb-32">
      <div className="p-4 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center my-6"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Trust Circle</h1>
          <p className="text-white/60 text-sm">Your private space for authentic moments with close friends.</p>
        </motion.div>

        <div className="flex gap-2 mb-6">
            <Button className="flex-1" variant="outline" onClick={() => alert('Feature coming soon!')}>
                <Plus className="w-4 h-4 mr-2" />
                Invite Friends
            </Button>
            <Button className="flex-1" onClick={handleCreatePost}>
                <Camera className="w-4 h-4 mr-2" />
                Create Post
            </Button>
        </div>
        
        {/* ADDED GETTING STARTED GUIDE */}
        <GettingStartedGuide />

        {loading ? (
          <div className="text-center text-white/70">Loading moments...</div>
        ) : moments.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {moments.map(moment => (
              <EnhancedDualMomentCard 
                key={moment.id} 
                moment={moment} 
                user={currentUser}
                onViewDetail={setSelectedMoment}
                userMoments={moments}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-2xl">
            <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="font-bold text-white">No Moments Yet</h3>
            <p className="text-white/60 text-sm mt-1">Create your first post for your Trust Circle.</p>
          </div>
        )}
      </div>
      
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
