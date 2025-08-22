import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Shield, 
  Users, 
  Gift,
  X
} from "lucide-react";

export default function FirstMomentCelebration({ onClose }) {
  useEffect(() => {
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 50 }}
        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
        className="bg-white/5 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/10 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>

        {/* Celebration Animation */}
        <div className="text-center space-y-6">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-white"
          >
            🎉 Your First Permanent Memory!
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/80 text-lg"
          >
            This moment is now <strong>yours forever</strong> - stored securely on the blockchain and owned by you.
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-white text-sm">Next Step</h3>
              </div>
              <p className="text-white/70 text-sm">
                Invite a friend to unlock Circles and start earning real rewards!
              </p>
            </div>

            <div className="bg-black/20 rounded-xl p-4 border border-amber-400/20">
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-5 h-5 text-amber-300" />
                <h3 className="font-semibold text-white text-sm">Coming Soon</h3>
              </div>
              <p className="text-white/70 text-sm">
                Join local brand circles → Share moments → Earn discounts & cashback
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3 pt-4"
          >
            <Button 
              onClick={() => {
                onClose();
                // TODO: Navigate to invite friends page when implemented
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
            
            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/5"
            >
              Continue to Diary
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}