import { motion } from "framer-motion";
import { Music, Sparkles, Heart, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const loadingMessages = [
  "🎵 Analyzing your mood...",
  "🎶 Searching through millions of songs...",
  "✨ Finding your perfect vibe...",
  "🎧 Curating your personalized playlist...",
  "🌟 Almost ready with your soundtrack...",
];

export function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-4xl mx-auto text-center py-20"
      data-testid="loading-state"
    >
      {/* Animated Music Icons */}
      <div className="relative mb-12">
        <div className="flex items-center justify-center space-x-8">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 10, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: 0 
            }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Music className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, -10, 0] 
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              delay: 0.3 
            }}
            className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Heart className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 15, 0] 
            }}
            transition={{ 
              duration: 1.8, 
              repeat: Infinity, 
              delay: 0.6 
            }}
            className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
        </div>
        
        {/* Pulsing Background */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"
        />
      </div>

      {/* Loading Spinner */}
      <div className="flex items-center justify-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full"
        />
      </div>

      {/* Dynamic Loading Message */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h3 className="text-3xl font-bold text-foreground mb-4">
          {loadingMessages[messageIndex]}
        </h3>
      </motion.div>

      <motion.p 
        className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Our AI is working its magic to find songs that perfectly match your vibe. 
        Get ready for an amazing musical journey! 🚀
      </motion.p>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 mt-8">
        {[0, 1, 2, 3, 4].map((dot) => (
          <motion.div
            key={dot}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 1, 0.3] 
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: dot * 0.2 
            }}
            className="w-3 h-3 bg-primary rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
}