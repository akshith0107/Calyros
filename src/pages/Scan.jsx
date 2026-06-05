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
      
      const analysisData = scanData.analysis || {};

      const extractedFacts = scanData.scan_history?.extracted_json?.nutrition_facts || scanData.nutrition_facts || {};
      
      const ocrData = {
        productName: scanData.product?.product_name || "Unknown Product",
        confidence: 0.95,
        parsedData: {
          calories: extractedFacts.calories || 0,
          servingSize: extractedFacts.serving_size || "N/A",
          fat: extractedFacts.total_fat || 0,
          protein: extractedFacts.protein || 0,
          sugar: extractedFacts.sugar || 0,
          carbs: extractedFacts.carbohydrates || 0,
        }
      };

      const insightsArray = [
        analysisData.classification ? `Classification: ${analysisData.classification}` : null,
        analysisData.goal_alignment,
        ...(analysisData.flags || []),
        ...(analysisData.recommendations || [])
      ].filter(Boolean);

      const aiAnalysis = {
        healthScore: analysisData.health_score || 0,
        insights: insightsArray.length > 0 ? insightsArray : ["No insights available for this product."],
        alternative: null,
        nutritionBreakdown: analysisData.nutrition_breakdown,
        scoreBreakdown: analysisData.score_breakdown,
        personalizedAnalysis: analysisData.personalized_analysis,
        recommendations: analysisData.recommendations,
        metrics: scanData.scan_history || {}
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
    <main className="dash-main flex flex-col pt-24 min-h-screen">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dash-welcome-title">Scan Product</h1>
        <p className="dash-welcome-sub">Capture or upload a nutrition label for immediate AI analysis.</p>
      </motion.header>

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

            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl">
                <label className="cursor-pointer block group">
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
                  <div className="border-2 border-dashed border-[var(--color-primary)] rounded-3xl p-12 text-center transition-all duration-300 bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 group-hover:border-[var(--color-primary-hover)] group-hover:shadow-[0_0_30px_rgba(212,115,30,0.2)]">
                    
                    <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform group-hover:scale-110">
                      <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-white mb-3">Upload or Capture</h2>
                    <p className="text-lg text-gray-300 mb-8 max-w-md mx-auto">
                      Drag & drop a nutrition label image here, or click to browse files and capture from camera.
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 text-sm font-medium">
                      <span className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors border border-white/10 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Browse Files
                      </span>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setState('CAMERA'); }}
                        className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl shadow-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        Use Camera
                      </button>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Tips Section */}
            <div className="mt-auto grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Good Lighting</h3>
                <p className="text-gray-400 text-sm">Ensure the label is well-lit without harsh glares.</p>
              </div>
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Keep it Flat</h3>
                <p className="text-gray-400 text-sm">Smooth out wrinkles and avoid scanning curves.</p>
              </div>
              <div className="bg-black/30 rounded-2xl p-5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-white font-semibold mb-1">Full Label</h3>
                <p className="text-gray-400 text-sm">Capture all nutrition facts and ingredients clearly.</p>
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
    </main>
  );
}
