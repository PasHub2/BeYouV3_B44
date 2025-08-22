
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Users, Coins, Camera, MapPin, Globe, Crown, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const regularOnboardingStepsData = [
  {
    id: 'photos_permanent',
    title: "Your Photos Are Permanently Yours",
    subtitle: "Capture moments, own them forever.",
    icon: Shield,
    color: "from-amber-400 to-amber-500",
    description: "Every moment you capture is stored securely and owned by you forever. No platform can take them away."
  },
  {
    id: 'private_diary',
    title: "Private Diary, Your Choice to Share",
    subtitle: "You control your privacy.",
    icon: Users,
    color: "from-sage-400 to-sage-500",
    description: "Start with a completely private diary. You decide if and when to share moments with trusted friends or communities."
  },
  {
    id: 'earn_rewards',
    title: "Share with Local Communities → Earn Rewards",
    subtitle: "Get rewarded for authentic moments.",
    icon: Coins,
    color: "from-lavender-400 to-lavender-500",
    description: "Join brand circles in your area. Share authentic moments and earn real rewards like discounts, experiences, and cashback."
  }
];

// Transform regularOnboardingStepsData into the new content structure
const regularOnboardingSteps = regularOnboardingStepsData.map(step => ({
  id: step.id,
  title: step.title,
  subtitle: step.subtitle,
  content: (
    <div className="text-center space-y-6">
      {/* Icon */}
      <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
        <step.icon className="w-12 h-12 text-white" />
      </div>

      <div className="space-y-4">
        <p className="text-white/90 text-lg leading-relaxed">
          {step.description}
        </p>
        
        {/* Illustration REMOVED, replaced by a simple div */}
        <div className="relative">
          <div className="w-full h-48 rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50 flex items-center justify-center">
             <step.icon className="w-16 h-16 text-white/20" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
        </div>
      </div>
    </div>
  )
}));

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Kept as per outline, even if not used

  // Check if this is a Bodensee circle demo
  const demoMode = localStorage.getItem('demo_mode');
  const isBodenseeDemo = demoMode === 'bodensee_circle_marketing';

  const bodenseeCircleSteps = [
    {
      id: 'bodensee_welcome',
      title: '🏞️ Willkommen zur Bodensee Experience!',
      subtitle: 'Entdecke authentische Momente am schönsten See Europas',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <p className="text-white/90 text-lg leading-relaxed">
              Du wurdest eingeladen, der <strong>Bodensee Experience</strong> beizutreten!
            </p>
            
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4">
              <h3 className="text-blue-300 font-semibold mb-2">Was erwartet dich?</h3>
              <ul className="text-blue-200/80 text-sm space-y-1 text-left">
                <li>• Exklusive Belohnungen für authentische Bodensee-Momente</li>
                <li>• Zugang zu lokalen Events und Geheimtipps</li>
                <li>• Vergünstigungen bei Partnern rund um den See</li>
                <li>• Community mit anderen Bodensee-Liebhabern</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bodensee_rewards',
      title: '🎁 Deine Belohnungen',
      subtitle: 'Verdiene Badges und echte Vorteile',
      content: (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="bg-white/5 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Lake Explorer Badge</h3>
                  <p className="text-blue-200/70 text-sm">5 Bodensee Check-ins</p>
                </div>
              </div>
              <p className="text-green-400 font-medium">🎁 50% Rabatt auf nächste Schifffahrt</p>
            </div>

            <div className="bg-white/5 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Local Ambassador Badge</h3>
                  <p className="text-blue-200/70 text-sm">15 Experience Posts</p>
                </div>
              </div>
              <p className="text-green-400 font-medium">🎁 Gratis Übernachtung in Partnerhotels</p>
            </div>

            <div className="bg-white/5 border border-blue-400/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Tourism Champion Badge</h3>
                  <p className="text-blue-200/70 text-sm">30 Adventure Posts</p>
                </div>
              </div>
              <p className="text-green-400 font-medium">🎁 Jahres-Saisonpass für alle Attraktionen</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bodensee_start',
      title: '📸 Ersten Moment festhalten',
      subtitle: 'Starte jetzt deine Bodensee-Journey!',
      content: (
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Camera className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <p className="text-white/90 text-lg leading-relaxed">
              Halte deinen ersten authentischen Bodensee-Moment fest und beginne deine Reise zu exklusiven Belohnungen!
            </p>
            
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4">
              <p className="text-amber-200 font-medium mb-2">💡 Tipp für deinen ersten Moment:</p>
              <p className="text-amber-200/80 text-sm">
                Nutze die Dual-Kamera-Funktion um sowohl die Bodensee-Landschaft als auch dich selbst aufzunehmen - das maximiert deine Authentizität!
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Use Bodensee steps if demo mode, otherwise use regular onboarding
  const steps = isBodenseeDemo ? bodenseeCircleSteps : regularOnboardingSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle completion
      if (isBodenseeDemo) {
        // Clear demo flags and set completion flag
        localStorage.removeItem('demo_mode');
        localStorage.removeItem('entry_source');
        localStorage.setItem('circle_entry_completed', 'bodensee_experience');
        
        // Navigate directly to Capture page (will trigger simulation)
        navigate(createPageUrl("Capture"));
      } else {
        // Regular onboarding completion
        localStorage.setItem('beyou_onboarding_complete', 'true');
        navigate(createPageUrl("You"));
      }
    }
  };

  const handleSkip = () => {
    if (isBodenseeDemo) {
      // Clear demo flags
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('entry_source');
      navigate(createPageUrl("Circles")); // Or a relevant landing page for circles
    } else {
      localStorage.setItem('beyou_onboarding_complete', 'true');
      navigate(createPageUrl("You"));
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="max-w-md mx-auto w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep 
                    ? (isBodenseeDemo ? 'bg-blue-500' : 'bg-amber-500')
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`${
              isBodenseeDemo ? 'bg-blue-500/10 border-blue-400/20' : 'warm-glass-effect border-amber-400/25'
            } rounded-2xl p-8 mb-8`}
          >
            <div className="text-center mb-6">
              <h1 className={`text-2xl font-bold mb-2 ${
                isBodenseeDemo ? 'text-blue-300' : 'diary-gradient-text'
              }`}>
                {steps[currentStep].title}
              </h1>
              <p className="text-white/70 text-lg">
                {steps[currentStep].subtitle}
              </p>
            </div>

            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-400 hover:text-white hover:bg-white/5"
          >
            Skip
          </Button>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className={`${
                  isBodenseeDemo 
                    ? 'border-blue-400/30 text-blue-200 hover:bg-blue-500/10' 
                    : 'border-amber-400/30 text-amber-200 hover:bg-amber-500/10'
                } bg-transparent`}
              >
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              className={`${
                isBodenseeDemo
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              } text-white border-0`}
            >
              {currentStep === steps.length - 1 
                ? (isBodenseeDemo ? 'Ersten Moment festhalten!' : 'Start Your Journey!')
                : 'Next'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
