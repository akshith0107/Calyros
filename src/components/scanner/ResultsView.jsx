import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';
import HealthScoreRing from '../HealthScoreRing';
import GlassCard from '../GlassCard';

export default function ResultsView({ result, imageUri, onSave, onScanAgain, onClose }) {
  const { scanId, ocrData, aiAnalysis } = result;
  const navigate = useNavigate();
  const [showMetrics, setShowMetrics] = useState(false);
  
  const classificationColors = {
    "Excellent": "bg-green-500/20 text-green-400 border-green-500/30",
    "Good": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Moderate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Limit Consumption": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Avoid Frequent Use": "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const getClassificationBadge = (classification) => {
    const defaultColor = "bg-white/10 text-white border-white/20";
    return classificationColors[classification] || defaultColor;
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#050505] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium tracking-wide flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analysis Complete
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-4 pb-32 lg:p-8 space-y-8">
        
        {/* Ask Nutra AI Floating Prompt */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <button 
            onClick={() => navigate(`/chat/${scanId}`)}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(212,115,30,0.3)] flex items-center gap-2 transition-transform hover:scale-105"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Discuss with Nutra AI
          </button>
        </motion.div>

        {/* SECTION 1: Product Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="flex flex-col md:flex-row items-center gap-8 p-8" hoverable={false}>
            <div className="flex-1 text-center md:text-left">
              <div className={`inline-flex px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase mb-4 ${getClassificationBadge(aiAnalysis.insights?.[0]?.replace('Classification: ', ''))}`}>
                {aiAnalysis.insights?.[0]?.replace('Classification: ', '') || "Analyzed"}
              </div>
              <h1 className="text-3xl md:text-4xl text-white font-bold mb-2 leading-tight">{ocrData.productName}</h1>
              <p className="text-white/50 text-sm flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Scanned on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="shrink-0 relative">
              <HealthScoreRing score={aiAnalysis.healthScore} size={180} strokeWidth={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-8">Score</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* SECTION 2: Nutrition Facts Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard hoverable={false} className="p-6">
            <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Extracted Nutrition Facts</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(ocrData.parsedData).filter(([k]) => k !== 'servingSize').map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const unit = key === 'calories' ? 'kcal' : 'g';
                return (
                  <div key={key} className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</span>
                    <span className="text-white text-2xl font-semibold">{value} <span className="text-sm text-white/30 font-medium">{unit}</span></span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 bg-white/5 rounded-lg px-4 py-2 text-center border border-white/5">
              <span className="text-white/50 text-xs">Serving Size: <span className="text-white">{ocrData.parsedData.servingSize}</span></span>
            </div>
          </GlassCard>
        </motion.div>

        {/* SECTION 5: Why This Score? */}
        {aiAnalysis.personalizedAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard hoverable={false} className="p-6 border-l-4 border-l-[var(--color-primary)]">
              <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-3">Why This Score?</h3>
              <p className="text-white/90 leading-relaxed text-base font-medium">
                "{aiAnalysis.personalizedAnalysis}"
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* SECTION 3: Nutrition Breakdown */}
        {aiAnalysis.nutritionBreakdown && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard hoverable={false} className="p-6">
              <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Nutrition Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(aiAnalysis.nutritionBreakdown).map(([key, data]) => {
                  const label = key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
                  const colorMap = {
                    "Low": "bg-green-500/20 text-green-400 border-green-500/30",
                    "Moderate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    "High": "bg-orange-500/20 text-orange-400 border-orange-500/30",
                    "Very High": "bg-red-500/20 text-red-400 border-red-500/30",
                    "Healthy Fats": "bg-green-500/20 text-green-400 border-green-500/30",
                    "Zero Fat": "bg-green-500/20 text-green-400 border-green-500/30",
                    "Moderate Saturated Fat": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                    "High Saturated Fat": "bg-red-500/20 text-red-400 border-red-500/30",
                    "Harmful": "bg-red-500/20 text-red-400 border-red-500/30",
                    "Very Low": "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  };
                  const badgeClass = colorMap[data.category] || "bg-white/10 text-white border-white/20";
                  
                  return (
                    <div key={key} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-[140px]">
                        <span className="text-white font-bold text-xl w-16">{data.value}<span className="text-xs text-white/40">{data.unit}</span></span>
                        <span className="text-white/70 font-medium text-sm">{label}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm leading-snug">{data.explanation}</p>
                      </div>
                      <div className={`shrink-0 px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${badgeClass}`}>
                        {data.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* SECTION 4: Score Breakdown */}
        {aiAnalysis.scoreBreakdown && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <GlassCard hoverable={false} className="p-6">
              <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-6">Score Calculation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {Object.entries(aiAnalysis.scoreBreakdown).map(([key, data]) => {
                  const label = key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={key} className="flex flex-col gap-2">
                      <div className="flex justify-between items-end">
                        <span className="text-white font-medium text-sm">{label}</span>
                        <span className="text-white font-bold text-sm">{data.score} <span className="text-white/30 text-xs font-normal">/ {data.max_score} pts</span></span>
                      </div>
                      <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(data.score / data.max_score) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-[var(--color-primary)] rounded-full" 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* SECTION 6: Recommendations */}
        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4 ml-2">Actionable Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiAnalysis.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-[#111] border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Metrics Tray */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="pt-8 border-t border-white/5">
          <button 
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 text-xs font-medium uppercase tracking-wider mx-auto transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showMetrics ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Technical Metrics
          </button>
          
          <AnimatePresence>
            {showMetrics && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="bg-black/50 border border-white/5 rounded-xl p-4 grid grid-cols-3 gap-4 text-center max-w-lg mx-auto">
                  <div>
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">OCR Time</div>
                    <div className="text-white font-mono text-sm">{aiAnalysis.metrics?.ocr_time_ms ? `${aiAnalysis.metrics.ocr_time_ms.toFixed(0)}ms` : 'N/A'}</div>
                  </div>
                  <div className="border-l border-r border-white/5">
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">AI Extraction</div>
                    <div className="text-white font-mono text-sm">{aiAnalysis.metrics?.extraction_time_ms ? `${aiAnalysis.metrics.extraction_time_ms.toFixed(0)}ms` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-1">Engine Time</div>
                    <div className="text-white font-mono text-sm">{aiAnalysis.metrics?.analysis_time_ms ? `${aiAnalysis.metrics.analysis_time_ms.toFixed(0)}ms` : 'N/A'}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-[#050505] to-transparent z-40">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Button variant="secondary" className="flex-1" onClick={onScanAgain}>
            Scan Another
          </Button>
          <Button variant="primary" className="flex-1" onClick={onSave}>
            Save to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
