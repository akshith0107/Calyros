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

      const ocrData = {
        productName: scanData.product?.product_name || "Unknown Product",
        confidence: 0.95,
        parsedData: {
          calories: scanData.nutrition_facts?.calories || 0,
          servingSize: scanData.nutrition_facts?.serving_size || "N/A",
          fat: scanData.nutrition_facts?.total_fat || 0,
          protein: scanData.nutrition_facts?.protein || 0,
          sugar: scanData.nutrition_facts?.sugar || 0,
          carbs: scanData.nutrition_facts?.carbohydrates || 0,
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
        alternative: null
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,115,30,0.3)]">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Analyze</h2>
            <p className="text-gray-400 max-w-md mb-8">Position the nutrition label clearly within the frame. Ensure good lighting for best results.</p>
            <button 
              className="px-8 py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-semibold transition-colors duration-300 shadow-lg"
              onClick={() => setState('CAMERA')}
            >
              Start Scanning
            </button>
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
