import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from '@/api/entities';

export default function LoggedOutView({ icon: Icon, title, message, buttonText, onSkip }) {
  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSkip = () => {
    // If onSkip callback is provided, use it; otherwise redirect to You page
    if (onSkip) {
      onSkip();
    } else {
      // Simple page reload or redirect to simulate being logged in
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-8 diary-glass-effect m-4 rounded-2xl">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 pulse-glow">
        <Icon className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-purple-100/80 text-lg max-w-md mx-auto mb-8">
        {message}
      </p>
      
      {/* Main Login Button */}
      <Button 
        onClick={handleLogin} 
        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 py-3 px-8 text-lg rounded-xl mb-4 w-full max-w-xs"
      >
        {buttonText}
      </Button>
      
      {/* Skip Button - For Testing */}
      <Button 
        onClick={handleSkip}
        variant="ghost"
        className="text-white/60 hover:text-white/80 hover:bg-white/5 text-sm"
      >
        Skip (für Testing)
      </Button>
      
      <p className="text-white/40 text-xs mt-2 max-w-sm">
        Der Skip-Button ist nur für Testzwecke verfügbar, bis die Authentifizierung vollständig integriert ist.
      </p>
    </div>
  );
}