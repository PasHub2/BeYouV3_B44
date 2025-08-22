
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  Grid3X3,
  X,
  Sparkles,
  Timer,
  Circle,
  RefreshCw,
  Clock,
  Shield,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DualCameraInterface({ onCapture, onClose, activeTriggers = [] }) {
  const [currentCamera, setCurrentCamera] = useState('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [capturedImages, setCapturedImages] = useState({
    back: null,
    front: null
  });
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStep, setCaptureStep] = useState(1);
  const [countdown, setCountdown] = useState(0);
  const [triggerCountdown, setTriggerCountdown] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Handle active triggers countdown
  useEffect(() => {
    if (activeTriggers.length > 0) {
      const nextTrigger = activeTriggers[0];
      const timeRemaining = Math.max(0, nextTrigger.endsAt - Date.now());

      if (timeRemaining > 0) {
        setTriggerCountdown(Math.ceil(timeRemaining / 1000 / 60)); // minutes

        const interval = setInterval(() => {
          const remaining = Math.max(0, nextTrigger.endsAt - Date.now());
          setTriggerCountdown(Math.ceil(remaining / 1000 / 60));

          if (remaining <= 0) {
            clearInterval(interval);
            setTriggerCountdown(null);
          }
        }, 60000); // Update every minute

        return () => clearInterval(interval);
      }
    }
  }, [activeTriggers]);

  const startCamera = async (facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraReady(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback or error message for user
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !isCameraReady) return;

    setIsCapturing(true);

    // 3-second countdown with gentle animation
    for (let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    setCountdown(0);

    // Capture with subtle flash
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `${currentCamera}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);

      const imageData = { file, url: imageUrl };

      if (currentCamera === 'environment') {
        setCapturedImages(prev => ({ ...prev, back: imageData }));
        setCurrentCamera('user');
        setCaptureStep(2);
        setIsCapturing(false);
        setTimeout(() => startCamera('user'), 500);
      } else {
        setCapturedImages(prev => ({ ...prev, front: imageData }));
        setIsCapturing(false);
        stopCamera();
        setCaptureStep(3);
      }
    }, 'image/jpeg', 0.85);
  };

  const retakePhoto = (camera) => {
    if (camera === 'back') {
      setCapturedImages(prev => ({ ...prev, back: null }));
      setCurrentCamera('environment');
      setCaptureStep(1);
      setTimeout(() => startCamera('environment'), 100);
    } else {
      setCapturedImages(prev => ({ ...prev, front: null }));
      setCurrentCamera('user');
      setCaptureStep(2);
      setTimeout(() => startCamera('user'), 100);
    }
  };

  const confirmPhotos = () => {
    if (capturedImages.back && capturedImages.front) {
      onCapture({
        backImage: capturedImages.back,
        frontImage: capturedImages.front,
        timestamp: new Date().toISOString(),
        withinTriggerWindow: triggerCountdown !== null
      });
      // Optionally reset state or close camera after capture
    }
  };

  const handleStartOver = () => {
    setCapturedImages({ back: null, front: null });
    setCurrentCamera('environment');
    setCaptureStep(1);
    startCamera('environment');
  };

  React.useEffect(() => {
    startCamera(currentCamera);
    return () => stopCamera();
  }, []); // Keeping [] as per original, relying on explicit startCamera calls for transitions.

  const getCameraInstructions = () => {
    if (captureStep === 1) return "Capture your surroundings";
    if (captureStep === 2) return "Now capture yourself";
    return "Your authentic moment";
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header - Improved positioning and visibility */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex justify-between items-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm border border-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="text-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
              <p className="text-white font-medium text-sm">{getCameraInstructions()}</p>
              <div className="flex justify-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${captureStep >= 1 ? 'bg-amber-400' : 'bg-white/30'}`} />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${captureStep >= 2 ? 'bg-amber-400' : 'bg-white/30'}`} />
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${captureStep >= 3 ? 'bg-amber-400' : 'bg-white/30'}`} />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFlashEnabled(!flashEnabled)}
              className={`rounded-full backdrop-blur-sm border border-white/10 ${
                flashEnabled ? 'bg-amber-500/30 text-amber-200' : 'bg-black/60 hover:bg-black/80 text-white'
              }`}
            >
              {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`rounded-full backdrop-blur-sm border border-white/10 ${
                gridEnabled ? 'bg-white/20 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {captureStep === 3 ? (
            // Review Mode - UI Fixed
            <motion.div
              key="review"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black"
            >
              <div className="h-full flex flex-col">
                {/* Main Image */}
                <div className="flex-1 relative">
                  <img
                    src={capturedImages.back?.url}
                    alt="Back camera"
                    className="w-full h-full object-cover"
                  />

                  {/* Front Camera PiP - Clean */}
                  <div className="absolute bottom-4 right-4 w-28 h-36 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl">
                    <img
                      src={capturedImages.front?.url}
                      alt="Front camera"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Live Camera
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Grid Overlay */}
              {gridEnabled && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                    {Array(9).fill(0).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                </div>
              )}

              {/* Camera loading */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-white text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white/30 border-t-amber-400 rounded-full mx-auto mb-2"
                    />
                    <p className="text-sm">Preparing camera...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-black/30 z-30"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-white text-8xl font-light"
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capture Flash */}
        <AnimatePresence>
          {isCapturing && countdown === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 bg-white z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls - Fixed viewport sizing and positioning */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-safe z-20 bg-gradient-to-t from-black/80 to-transparent pt-20">
        <div className="flex justify-center items-center pb-8">
          {captureStep === 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex justify-around items-center max-w-sm"
            >
              <Button
                onClick={handleStartOver}
                variant="outline"
                className="bg-white/10 border-white/20 text-white backdrop-blur-sm h-12 rounded-xl px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button
                onClick={confirmPhotos}
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl px-6 shadow-lg h-12 text-base font-semibold"
              >
                <Upload className="w-4 h-4 mr-2" />
                Save Forever
              </Button>
            </motion.div>
          ) : (
            // Capture Controls
            <div className="flex items-center justify-between w-full max-w-sm">
              <div className="w-12" />

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={capturePhoto}
                disabled={!isCameraReady || isCapturing}
                className="w-20 h-20 rounded-full bg-white/90 shadow-xl flex items-center justify-center border-4 border-white/40 hover:border-amber-400/60 transition-all duration-200 disabled:opacity-50"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentCamera === 'environment'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}>
                  {isCapturing ? (
                    <Timer className="w-8 h-8 text-white" />
                  ) : (
                    <Camera className="w-8 h-8 text-white" />
                  )}
                </div>
              </motion.button>

              <div className="w-12 flex flex-col items-center">
                <div className="text-white/70 text-xs font-medium mb-1">
                  {currentCamera === 'environment' ? 'World' : 'You'}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <Circle className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Added safe-area support with pb-safe class
const style = `
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 2rem);
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = style;
  document.head.appendChild(styleSheet);
}
