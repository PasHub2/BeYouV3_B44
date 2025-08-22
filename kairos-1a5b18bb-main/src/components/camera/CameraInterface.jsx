
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Camera, 
  RotateCcw, 
  Zap, // Changed from Flash
  ZapOff, // Changed from FlashOff
  Grid3X3,
  Settings,
  X,
  Check,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CameraInterface({ onCapture, onClose }) {
  const [facingMode, setFacingMode] = useState('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = async () => {
    try {
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
    
    // Add capture animation delay
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], `moment-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage({ file, url: imageUrl });
        setIsCapturing(false);
        stopCamera();
      }, 'image/jpeg', 0.8);
    }, 200);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage.file);
      setCapturedImage(null);
      if (onClose) onClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCameraReady) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera Controls Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFlashEnabled(!flashEnabled)}
              className={`rounded-full backdrop-blur-sm ${
                flashEnabled ? 'bg-yellow-500/30 text-yellow-400' : 'bg-black/30 hover:bg-black/50 text-white'
              }`}
            >
              {flashEnabled ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGridEnabled(!gridEnabled)}
              className={`rounded-full backdrop-blur-sm ${
                gridEnabled ? 'bg-white/30 text-white' : 'bg-black/30 hover:bg-black/50 text-white'
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
          {capturedImage ? (
            <motion.div
              key="captured"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0"
            >
              <img 
                src={capturedImage.url} 
                alt="Captured moment"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
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
              
              {/* Loading State */}
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <div className="text-white text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full mx-auto mb-2"
                    />
                    <p>Loading camera...</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capture Flash Effect */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-20 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex justify-center items-center">
          {capturedImage ? (
            <div className="flex gap-4">
              <Button
                onClick={retakePhoto}
                size="lg"
                variant="outline"
                className="bg-black/30 border-white/30 text-white hover:bg-black/50 rounded-full px-8"
              >
                Retake
              </Button>
              <Button
                onClick={confirmPhoto}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Moment
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full max-w-sm">
              <div className="w-12" />
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-white/30 hover:border-white/50 transition-all duration-200 disabled:opacity-50"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </motion.button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCamera}
                className="bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
