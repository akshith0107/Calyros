import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAGES = [
  "Uploading Image",
  "Reading Nutrition Label",
  "Extracting Nutrition Facts",
  "Calculating Health Score",
  "Generating Recommendations"
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

        {/* Text Stages Checklist */}
        <div className="w-full mt-8 flex flex-col space-y-3">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentStage;
            const isActive = index === currentStage;
            const isPending = index > currentStage;
            
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: isPending ? 0.3 : 1, 
                  x: 0,
                  scale: isActive ? 1.05 : 1
                }}
                className={`flex items-center space-x-3 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isCompleted ? 'bg-[#FFFFFF] border-[#FFFFFF]' : isActive ? 'border-white animate-pulse' : 'border-gray-500'}`}>
                  {isCompleted && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />}
                </div>
                <span className={`text-sm font-medium tracking-wide ${isCompleted ? 'text-[#FFFFFF]' : isActive ? 'text-white' : 'text-gray-500'}`}>
                  {stage}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
