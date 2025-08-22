
import React, { useState, useEffect } from 'react';
import { Moment, User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from "@/components/ui/button";
import {
  Camera,
  Sparkles,
  Shield,
  LogIn,
  CheckCircle,
  Edit3,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from 'date-fns';
import DualCameraInterface from "../components/camera/DualCameraInterface";

export default function Capture() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preselectedCircle, setPreselectedCircle] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdMoment, setCreatedMoment] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser({ email: 'demo@example.com', id: 'demo-user-id' });
      }

      // CRITICAL: Parse URL parameters for context
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from');
      
      let circleId = 'private'; // Default
      if (fromParam) {
        switch (fromParam) {
          case 'trust-circle':
            circleId = 'trust_circle';
            break;
          case 'photography-community':
            circleId = 'photography_community';
            break;
          case 'asics-run-club':
            circleId = 'asics_run_club';
            break;
          default:
            circleId = 'private';
        }
      }
      
      setPreselectedCircle(circleId);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      await User.login();
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // CRITICAL: Instant Post - No Form Required
  const handleInstantPost = async (dualImages) => {
    setIsSubmitting(true);
    try {
      const [backImageResult, frontImageResult] = await Promise.all([
        UploadFile({ file: dualImages.backImage.file }),
        UploadFile({ file: dualImages.frontImage.file })
      ]);
      
      // Auto-generate title based on time of day
      const hour = new Date().getHours();
      let autoTitle;
      if (hour < 12) autoTitle = 'Morning Moment';
      else if (hour < 17) autoTitle = 'Afternoon Moment';
      else autoTitle = 'Evening Moment';

      const momentPayload = {
        title: autoTitle,
        description: '', // Empty by default
        back_camera_url: backImageResult.file_url,
        front_camera_url: frontImageResult.file_url,
        capture_timestamp: dualImages.timestamp,
        visibility: preselectedCircle === 'private' ? 'private' : 'circles',
        authenticity_score: 98,
        permanence_status: 'temporary',
        blockchain_network: 'sepolia'
      };

      // Auto-location capture (non-blocking)
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          momentPayload.location = {
            latitude,
            longitude,
            address: data.display_name || 'Location Captured'
          };
        } catch (error) {
          console.log('Location capture failed, continuing without location');
        }
      }

      // Circle assignment based on context
      if (preselectedCircle && preselectedCircle !== 'private') {
        momentPayload.circle_shares = [{
          circle_id: preselectedCircle,
          shared_at: new Date().toISOString(),
          within_trigger_window: true,
          badge_earned: null // Badge assignment is a separate process
        }];
      }

      console.log('Creating instant moment:', momentPayload);
      const newMoment = await Moment.create(momentPayload);
      
      setCreatedMoment(newMoment);
      setShowCamera(false);
      setShowSuccess(true);

    } catch (error) {
      console.error('Error during instant post:', error);
      alert('Failed to post moment. Please try again.');
    } finally {
      // FIX: Ensure loading state is always reset
      setIsSubmitting(false);
    }
  };

  const handleBackToOrigin = () => {
    // FIX: Navigate back to the correct circle after posting
    if (preselectedCircle && preselectedCircle !== 'private') {
      navigate(createPageUrl(`CircleDetail?id=${preselectedCircle}`), { replace: true });
    } else {
      navigate(createPageUrl("You"), { replace: true });
    }
  };

  const handleEditDetails = () => {
    if (createdMoment) {
      navigate(createPageUrl(`EditMoment?id=${createdMoment.id}`));
    }
  };

  if (isLoading || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">{isSubmitting ? 'Posting your moment...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 bg-black"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Capture Your Moment</h1>
        <p className="text-purple-100/80 text-base max-w-sm mx-auto mb-6">
          Please log in to start creating your authentic dual-camera moments.
        </p>

        <Button
          onClick={handleLogin}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 py-3 px-6 text-base rounded-xl mb-4 w-full max-w-xs"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Log In to Capture
        </Button>

        <Button
          onClick={() => setCurrentUser({ email: 'demo@example.com', id: 'demo-user-id' })}
          variant="ghost"
          className="text-white/60 hover:text-white/80 hover:bg-white/5 text-sm"
        >
          Skip (für Testing)
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        {showSuccess ? (
          // SUCCESS SCREEN
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Posted Successfully!
            </h1>
            
            <p className="text-white/70 mb-8 max-w-sm">
              Your moment has been shared {preselectedCircle === 'private' ? 'privately' : `with ${getCircleName(preselectedCircle)}`}.
            </p>

            <div className="space-y-4 w-full max-w-xs">
              <Button
                onClick={handleBackToOrigin}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 py-3 text-base rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {preselectedCircle === 'private' ? 'Diary' : getCircleName(preselectedCircle)}
              </Button>
              
              <Button
                onClick={handleEditDetails}
                variant="outline"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 py-3 text-base rounded-xl"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </motion.div>
        ) : showCamera ? (
          <DualCameraInterface
            onCapture={handleInstantPost}
            onClose={() => setShowCamera(false)}
          />
        ) : (
          // PRE-CAPTURE SCREEN
          <motion.div
            key="pre-capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                {getContextHeader(preselectedCircle)}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:shadow-xl transition-all duration-500 group border border-white/10"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8 text-white" />
                  </div>

                  <h2 className="text-lg font-bold text-white mb-2">
                    Dual Camera Capture
                  </h2>
                  <p className="text-white/70 mb-6 leading-relaxed text-sm">
                    Capture both perspectives simultaneously. Your moment will be instantly posted.
                  </p>

                  <Button
                    onClick={() => setShowCamera(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-3 text-base font-semibold border-0"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Capture
                  </Button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-green-400 text-sm">
                    <Shield className="w-3 h-3" />
                    <span>Instant & Authentic</span>
                  </div>
                </div>
              </motion.div>

              {/* Context Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-center"
              >
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/60 text-sm mb-2">
                    Posting to: <span className="text-white font-medium">{getCircleName(preselectedCircle)}</span>
                  </p>
                  <p className="text-white/50 text-xs">
                    You can edit details after posting
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  function getCircleName(circleId) {
    const names = {
      'trust_circle': 'Trust Circle',
      'photography_community': 'Photography Community',
      'asics_run_club': 'ASICS Run Club',
      'private': 'Private Diary'
    };
    return names[circleId] || 'Unknown';
  }

  function getContextHeader(circleId) {
    if (circleId === 'trust_circle') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-3">
            Trust Circle Moment
          </h1>
          <p className="text-white/70 text-base max-w-sm mx-auto">
            Share an authentic moment with your trusted friends
          </p>
        </>
      );
    }
    
    if (circleId === 'photography_community') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-3">
            Photography Community
          </h1>
          <p className="text-white/70 text-base max-w-sm mx-auto">
            Share your creative vision with fellow photographers
          </p>
        </>
      );
    }
    
    if (circleId === 'asics_run_club') {
      return (
        <>
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-3">
            ASICS Run Club
          </h1>
          <p className="text-white/70 text-base max-w-sm mx-auto">
            Document your fitness journey and earn rewards
          </p>
        </>
      );
    }
    
    // Default/Private
    return (
      <>
        <h1 className="text-2xl font-bold gradient-text mb-3">
          Capture Authentic Moment
        </h1>
        <p className="text-white/70 text-base max-w-sm mx-auto">
          Your private diary moment, stored securely
        </p>
      </>
    );
  }
}
