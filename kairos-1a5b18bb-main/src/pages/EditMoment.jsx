import React, { useState, useEffect } from 'react';
import { Moment, User, CircleMembership } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  Sparkles, 
  Users, 
  Camera, 
  Award, 
  Heart,
  DollarSign,
  Globe,
  Shield,
  Gift,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EditMoment() {
  const navigate = useNavigate();
  const [moment, setMoment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableCircles, setAvailableCircles] = useState([]);
  const [showCreatorOptions, setShowCreatorOptions] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    selectedCircles: [],
    makeCollectible: false,
    appreciationAmount: '',
    collectibleAccess: 'community'
  });

  useEffect(() => {
    const loadMoment = async () => {
      setIsLoading(true);
      try {
        // Get moment ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const momentId = urlParams.get('id');
        
        if (!momentId) {
          navigate(createPageUrl("You"));
          return;
        }

        const user = await User.me();
        setCurrentUser(user);

        const moments = await Moment.list();
        const foundMoment = moments.find(m => m.id === momentId);
        
        if (!foundMoment) {
          navigate(createPageUrl("You"));
          return;
        }

        setMoment(foundMoment);
        
        // Load user's circle memberships
        const memberships = await CircleMembership.filter({ user_id: user.id });
        const userCircles = [
          { id: 'private', name: '🔒 Keep Private', icon: Shield },
          { id: 'trust_circle', name: '👨‍👩‍👧‍👦 Trust Circle', icon: Users },
        ];
        
        // Add joined circles
        memberships.forEach(membership => {
          if (membership.circle_id === 'photography_community') {
            userCircles.push({ id: 'photography_community', name: '📸 Photography Community', icon: Camera });
          } else if (membership.circle_id === 'asics_run_club') {
            userCircles.push({ id: 'asics_run_club', name: '🏃 ASICS Run Club', icon: Award });
          }
        });
        
        setAvailableCircles(userCircles);

        // Initialize form with current moment data
        setFormData({
          title: foundMoment.title || '',
          description: foundMoment.description || '',
          tags: foundMoment.tags || [],
          selectedCircles: foundMoment.circle_shares ? 
            foundMoment.circle_shares.map(share => share.circle_id) : 
            [foundMoment.visibility === 'private' ? 'private' : 'public'],
          makeCollectible: foundMoment.permanence_status === 'permanent',
          appreciationAmount: foundMoment.starting_price || '',
          collectibleAccess: foundMoment.access_level || 'community'
        });

      } catch (error) {
        console.error('Error loading moment:', error);
        navigate(createPageUrl("You"));
      }
      setIsLoading(false);
    };

    loadMoment();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags,
        permanence_status: formData.makeCollectible ? 'permanent' : 'temporary',
      };

      // Handle circle sharing
      if (formData.selectedCircles.includes('private')) {
        updateData.visibility = 'private';
        updateData.circle_shares = [];
      } else {
        updateData.visibility = 'circles';
        updateData.circle_shares = formData.selectedCircles
          .filter(circleId => circleId !== 'private')
          .map(circleId => ({
            circle_id: circleId,
            shared_at: new Date().toISOString(),
            within_trigger_window: false,
            badge_earned: null
          }));
      }

      // Handle collectible options
      if (formData.makeCollectible) {
        updateData.starting_price = parseFloat(formData.appreciationAmount) || 0;
        updateData.access_level = formData.collectibleAccess;
      }

      await Moment.update(moment.id, updateData);
      navigate(createPageUrl("You"));

    } catch (error) {
      console.error('Error updating moment:', error);
      alert('Failed to update moment. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleTagAdd = (tagText) => {
    if (tagText && !formData.tags.includes(tagText)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagText]
      }));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleCircleToggle = (circleId) => {
    setFormData(prev => {
      const newSelected = prev.selectedCircles.includes(circleId)
        ? prev.selectedCircles.filter(id => id !== circleId)
        : [...prev.selectedCircles, circleId];
      
      // If private is selected, deselect all others
      if (circleId === 'private') {
        return { ...prev, selectedCircles: ['private'] };
      }
      // If any other circle is selected, deselect private
      else {
        return { ...prev, selectedCircles: newSelected.filter(id => id !== 'private') };
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!moment || !currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white mb-4">Moment not found</h1>
          <Button onClick={() => navigate(createPageUrl("You"))}>
            Back to Your Moments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-32">
      <div className="p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold gradient-text">✨ Edit Your Moment</h1>
            <p className="text-white/60 text-sm">Update your content and sharing settings</p>
          </div>
        </div>

        {/* Image Preview */}
        <Card className="bg-white/5 border-white/10 mb-6">
          <div className="relative bg-black rounded-t-xl overflow-hidden aspect-[4/5]">
            <img src={moment.back_camera_url} alt="Moment" className="w-full h-full object-cover" />
            {moment.front_camera_url && (
              <img src={moment.front_camera_url} alt="Front view" className="absolute bottom-4 right-4 w-1/4 h-1/4 object-cover rounded-lg border-2 border-white/50" />
            )}
            <div className="absolute top-4 left-4 bg-green-500/90 rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Authentic
              </span>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Content Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                📝 Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  placeholder="Give your moment a title"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-24"
                  placeholder="Tell the story behind this moment..."
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">Tags (for discovery)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="bg-amber-500/20 text-amber-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      #{tag}
                      <button type="button" onClick={() => handleTagRemove(tag)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <Input
                  placeholder="Add tags like: nature, sunset, photography"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Share With Section */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                👥 Share With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableCircles.map((circle) => {
                  const CircleIcon = circle.icon;
                  return (
                    <div key={circle.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={formData.selectedCircles.includes(circle.id)}
                        onCheckedChange={() => handleCircleToggle(circle.id)}
                        className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <CircleIcon className="w-4 h-4 text-white/70" />
                        <span className="text-white text-sm">{circle.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Creator Options - Glassmorphism Design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl">
              <CardHeader>
                <button
                  type="button"
                  onClick={() => setShowCreatorOptions(!showCreatorOptions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <CardTitle className="text-white flex items-center gap-2">
                    💎 Creator Options
                    <span className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-full border border-purple-400/30">
                      Premium
                    </span>
                  </CardTitle>
                  <motion.div
                    animate={{ rotate: showCreatorOptions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.div>
                </button>
              </CardHeader>
              
              <AnimatePresence>
                {showCreatorOptions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-4 border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Gift className="w-5 h-5 text-purple-400" />
                          <div>
                            <p className="text-white font-medium">Let fans collect this moment</p>
                            <p className="text-white/60 text-xs">Make this moment a collectible for your supporters</p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.makeCollectible}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, makeCollectible: checked }))}
                          className="data-[state=checked]:bg-purple-500"
                        />
                      </div>

                      {formData.makeCollectible && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4 pl-8 border-l-2 border-purple-400/30"
                        >
                          <div>
                            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4 text-pink-400" />
                              Appreciation Amount (YOU Tokens)
                            </label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.appreciationAmount}
                              onChange={(e) => setFormData(prev => ({ ...prev, appreciationAmount: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                              placeholder="0.5"
                            />
                            <p className="text-white/60 text-xs mt-1">How much supporters pay to collect this moment</p>
                          </div>

                          <div>
                            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-blue-400" />
                              Who can collect
                            </label>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="collectibleAccess"
                                  value="community"
                                  checked={formData.collectibleAccess === 'community'}
                                  onChange={(e) => setFormData(prev => ({ ...prev, collectibleAccess: e.target.value }))}
                                  className="text-blue-500"
                                />
                                <span className="text-white text-sm">Community Members Only</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  name="collectibleAccess"
                                  value="everyone"
                                  checked={formData.collectibleAccess === 'everyone'}
                                  onChange={(e) => setFormData(prev => ({ ...prev, collectibleAccess: e.target.value }))}
                                  className="text-blue-500"
                                />
                                <span className="text-white text-sm">Everyone</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 py-3 text-base rounded-xl font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                ✨ Update Moment
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}