import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CameraView from './CameraView';
import ProcessingView from './ProcessingView';
import ResultsView from './ResultsView';
import { extractNutritionLabel } from '../../services/mockOcrService';
import { analyzeNutritionVsProfile } from '../../services/mockAiService';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

export default function ScannerOverlay({ isOpen, onClose, onSaveResult }) {
  const [state, setState] = useState('IDLE'); // IDLE | CAMERA | PROCESSING | RESULTS
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const { data: userProfile } = useOnboardingStore();

  useEffect(() => {
    if (isOpen) {
      setState('CAMERA');
    } else {
      setState('IDLE');
      setCapturedImage(null);
      setAnalysisResult(null);
    }
  }, [isOpen]);

  const handleCapture = async (imageData) => {
    setCapturedImage(imageData);
    setState('PROCESSING');

    try {
      // 1. OCR Extraction (Mock)
      const ocrData = await extractNutritionLabel(imageData);
      
      // 2. AI Analysis against user profile (Mock)
      const aiAnalysis = await analyzeNutritionVsProfile(ocrData, userProfile);
      
      setAnalysisResult({ ocrData, aiAnalysis });
      setState('RESULTS');
    } catch (error) {
      console.error("Scanner Pipeline Error:", error);
      // In a real app, we'd transition to an ERROR state here
      onClose(); 
    }
  };

  const handleSave = () => {
    if (analysisResult) {
      onSaveResult(analysisResult);
    }
    onClose();
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setState('CAMERA');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {state === 'CAMERA' && (
            <CameraView 
              onCapture={handleCapture} 
              onCancel={onClose} 
            />
          )}

          {state === 'PROCESSING' && (
            <ProcessingView 
              imageUri={capturedImage} 
            />
          )}

          {state === 'RESULTS' && analysisResult && (
            <ResultsView 
              result={analysisResult} 
              imageUri={capturedImage}
              onSave={handleSave}
              onScanAgain={handleScanAgain}
              onClose={onClose}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
