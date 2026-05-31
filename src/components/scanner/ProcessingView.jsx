import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  "Uploading Image...",
  "Reading Nutrition Label...",
  "Extracting Nutrition Data...",
  "Comparing With Health Profile...",
  "Generating Personalized Insights..."
];

export default function ProcessingView({ imageUri, onComplete }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    // We mock the transition between these 5 stages over roughly 3.5 seconds
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < STAGES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6">
      
      {/* Background preview with scanning effect */}
      {imageUri && (
        <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center overflow-hidden blur-sm">
          <img src={imageUri} alt="Processing" className="w-full h-full object-cover" />
          <motion.div 
            className="absolute left-0 right-0 h-[2px] bg-white shadow-[0_0_30px_10px_rgba(255,255,255,0.5)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
          />
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-12 flex justify-center">
          {/* Animated rings */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-white/10 border-b-white/60"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/80">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Text Stages */}
        <div className="h-16 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute w-full text-center text-lg text-white font-medium tracking-wide"
            >
              {STAGES[currentStage]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-6">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
