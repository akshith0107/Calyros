import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraView from '../components/scanner/CameraView';
import ProcessingView from '../components/scanner/ProcessingView';
import ResultsView from '../components/scanner/ResultsView';
import apiClient from '../services/apiClient';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ResultsView Crash:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 bg-red-900 p-8 text-white overflow-auto">
          <h2 className="text-2xl font-bold mb-4">React Rendering Crash!</h2>
          <pre className="text-sm bg-black/50 p-4 rounded">{this.state.error && this.state.error.toString()}</pre>
          <pre className="text-xs bg-black/50 p-4 rounded mt-4">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-white text-black rounded">Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Scan() {
  const [state, setState] = useState('IDLE'); // IDLE | CAMERA | PROCESSING | RESULTS
  const [capturedImage, setCapturedImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  };

  const handleCapture = async (imageData) => {
    const FE_TIMELINE = {};
    FE_TIMELINE.ANALYZE_CLICKED = new Date().toISOString();
    const t0 = performance.now();

    setCapturedImage(imageData);
    setState('PROCESSING');

    try {
      const file = dataURLtoFile(imageData, 'scan.jpg');
      const formData = new FormData();
      formData.append('image', file);

      FE_TIMELINE.REQUEST_SENT = new Date().toISOString();
      const tReqStart = performance.now();

      const scanResp = await apiClient.post('/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const tReqEnd = performance.now();
      FE_TIMELINE.RESPONSE_RECEIVED = new Date().toISOString();
      FE_TIMELINE.NETWORK_ROUND_TRIP_MS = (tReqEnd - tReqStart).toFixed(2);
      FE_TIMELINE.REQUEST_ID = scanResp.headers?.['x-request-id'] || 'N/A';
      FE_TIMELINE.HTTP_STATUS = scanResp.status;

      const scanData = scanResp.data;
      if (!scanData.success) throw new Error(scanData.message || "Scan failed");
      const scanId = scanData.scan_id;
      FE_TIMELINE.SCAN_ID = scanId;
      
      const aiAnalysis = {
        totalScore: scanData.score || 0,
        classification: scanData.classification || "Unknown",
        personalizedAnalysis: scanData.personalized_analysis || "",
        recommendations: scanData.recommendations || [],
        keyFindings: scanData.key_findings || [],
        positiveFactors: scanData.positive_factors || [],
        concerns: scanData.concerns || [],
        allergyAnalysis: scanData.allergy_analysis || {},
        allDetectedNutrients: scanData.all_detected_nutrients || [],
        ingredientQualityScore: scanData.ingredient_quality_score || 0,
        ingredientFindings: scanData.ingredient_findings || [],
        processingAssessment: scanData.processing_assessment || "Unknown"
      };

      const ocrData = {
        productName: scanData.product_name || "Unknown Product",
        servingSize: scanData.serving_size || "N/A",
        ingredients: scanData.ingredients || [],
        nutritionFacts: scanData.nutrition_facts || {},
        vitamins: scanData.vitamins || [],
        minerals: scanData.minerals || [],
        allergens: scanData.allergens || [],
        additives: scanData.additives || [],
        preservatives: scanData.preservatives || [],
        beneficialCompounds: scanData.beneficial_compounds || []
      };

      setAnalysisResult({ scanId, ocrData, aiAnalysis });
      setState('RESULTS');

      FE_TIMELINE.UI_RENDERED = new Date().toISOString();
      FE_TIMELINE.TOTAL_FRONTEND_MS = (performance.now() - t0).toFixed(2);

      console.log("============================================================");
      console.log("FRONTEND SCAN TIMELINE");
      console.log("============================================================");
      Object.entries(FE_TIMELINE).forEach(([k, v]) => console.log(`${k.padEnd(28)} = ${v}`));
      console.log("============================================================");
    } catch (error) {
      console.error("Scanner Pipeline Error:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Failed to analyze image";
      alert(`Scan failed: ${errorMsg}`);
      setState('IDLE');
    }
  };

  const handleSave = () => {
    setState('IDLE');
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const handleScanAgain = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setState('CAMERA');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Scan Product</h1>
        <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">Capture or upload a nutrition label for immediate AI analysis.</p>
      </motion.div>

      <div className="flex-1 relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[600px]">
        {state === 'IDLE' && (
          <div 
            className="absolute inset-0 flex flex-col p-8 bg-gradient-to-b from-black/20 to-black/60"
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={async (e) => {
              e.preventDefault(); e.stopPropagation();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => handleCapture(e.target.result);
                reader.readAsDataURL(file);
              }
            }}
          >
            {/* Empty State Guidelines */}
            <div className="absolute top-6 right-6 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Supported: JPG, PNG, WEBP
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
              <label className="cursor-pointer group relative block w-full max-w-2xl mx-auto">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => handleCapture(e.target.result);
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
                
                <div className="relative overflow-hidden rounded-3xl bg-[#050505] border border-white/[0.08] p-12 text-center transition-all duration-300 group-hover:border-[#FFFFFF]/50 group-hover:bg-white/[0.02]">
                  {/* Grain */}
                  <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
                  
                  {/* Subtle Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FFFFFF]/20 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.1] flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform group-hover:scale-110 duration-500 group-hover:border-[#FFFFFF]/30">
                      <svg className="w-8 h-8 text-white/80 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Upload or Capture Image</h2>
                    <p className="text-sm text-white/40 mb-8 max-w-md mx-auto">
                      Drag & drop a nutrition label image here, or click to browse files and capture from camera.
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 text-sm font-medium">
                      <span className="px-6 py-3 bg-[#0A0A0A] hover:bg-white/[0.05] text-white rounded-full transition-all duration-300 border border-white/[0.08] hover:border-white/[0.2] shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2">
                        Browse Files
                      </span>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setState('CAMERA'); }}
                        className="px-6 py-3 bg-[#FFFFFF] hover:bg-[#DDDDDD] text-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 flex items-center gap-2"
                      >
                        Use Camera
                      </button>
                    </div>
                  </div>
                </div>
              </label>
            </div>
            
            {/* Tips Section */}
            <div className="mt-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-white/[0.05] relative z-10 px-8 pb-8">
              <div className="bg-[#050505]/50 rounded-2xl p-5 border border-white/[0.05] backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-3">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <h3 className="text-white font-medium mb-1 text-sm">Good Lighting</h3>
                <p className="text-white/40 text-xs leading-relaxed">Ensure the label is well-lit without harsh glares.</p>
              </div>
              <div className="bg-[#050505]/50 rounded-2xl p-5 border border-white/[0.05] backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-3">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <h3 className="text-white font-medium mb-1 text-sm">Keep it Flat</h3>
                <p className="text-white/40 text-xs leading-relaxed">Smooth out wrinkles and avoid scanning curves.</p>
              </div>
              <div className="bg-[#050505]/50 rounded-2xl p-5 border border-white/[0.05] backdrop-blur-md">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-3">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <h3 className="text-white font-medium mb-1 text-sm">Full Label</h3>
                <p className="text-white/40 text-xs leading-relaxed">Capture all nutrition facts and ingredients clearly.</p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {state === 'CAMERA' && (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <CameraView 
                onCapture={handleCapture} 
                onCancel={() => setState('IDLE')} 
              />
            </motion.div>
          )}

          {state === 'PROCESSING' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ProcessingView imageUri={capturedImage} />
            </motion.div>
          )}

          {state === 'RESULTS' && analysisResult && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
              <ErrorBoundary>
                <ResultsView 
                  result={analysisResult} 
                  imageUri={capturedImage}
                  onSave={handleSave}
                  onScanAgain={handleScanAgain}
                  onClose={() => setState('IDLE')}
                />
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
