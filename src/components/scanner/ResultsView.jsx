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
    return classificationColors[classification] || "bg-white/10 text-white border-white/20";
  };

  const b = aiAnalysis.breakdown || {};
  const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;

  return (
    <div className="absolute inset-0 z-50 bg-[#050505] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium tracking-wide flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Discovery Complete
        </h2>
        <button onClick={onClose} className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-4 pb-32 lg:p-8 space-y-8">
        
        {/* Chat Prompt */}
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
              <div className={`inline-flex px-4 py-1.5 rounded-full border text-xs font-bold tracking-wider uppercase mb-4 ${getClassificationBadge(aiAnalysis.classification)}`}>
                {aiAnalysis.classification}
              </div>
              <h1 className="text-3xl md:text-4xl text-white font-bold mb-2 leading-tight">{ocrData.productName}</h1>
              <p className="text-white/50 text-sm flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Serving Size: {ocrData.servingSize}
              </p>
            </div>
            <div className="shrink-0 relative">
              <HealthScoreRing score={aiAnalysis.totalScore} size={180} strokeWidth={8} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase mt-8">Score</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
        {/* SECTION 2: WHY THIS SCORE */}
        {aiAnalysis.scoreBreakdown && Object.keys(aiAnalysis.scoreBreakdown).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard hoverable={false} className="p-6 border-t-2 border-t-[var(--color-primary)]/50">
              <h3 className="text-[var(--color-primary)] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Why This Score?
              </h3>
              <div className="space-y-3">
                {Object.entries(aiAnalysis.scoreBreakdown).map(([key, data]) => (
                  <div key={key} className="flex flex-col bg-black/40 border border-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 font-medium">{key}</span>
                      <span className="text-white font-bold">{data.score} / {data.max_score}</span>
                    </div>
                    <span className="text-white/40 text-xs mt-1">{data.explanation}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-lg p-3 mt-4">
                  <span className="text-[var(--color-primary)] font-bold">Total</span>
                  <span className="text-[var(--color-primary)] font-bold text-lg">{aiAnalysis.totalScore} / 100</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* SECTION 3: KEY FINDINGS */}
        {hasContent(b.key_findings) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <GlassCard hoverable={false} className="p-6 border-t-2 border-t-[var(--color-primary)]/50">
              <h3 className="text-[var(--color-primary)] text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Key Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {b.key_findings.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-xl p-4">
                    <span className="text-lg mt-0.5">{item.title.toLowerCase().includes('high') && !item.title.toLowerCase().includes('protein') ? '⚠' : '✓'}</span>
                    <div>
                      <span className="text-white font-medium block mb-1">{item.title}</span>
                      <span className="text-white/50 text-xs leading-snug">{item.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* SECTION 4: NUTRITION SNAPSHOT */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hoverable={false} className="p-6 border-t-2 border-t-white/10">
            <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Nutrition Snapshot</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { label: 'Calories', val: ocrData.nutritionFacts.calories },
                { label: 'Protein', val: ocrData.nutritionFacts.protein },
                { label: 'Sugar', val: ocrData.nutritionFacts.sugar },
                { label: 'Fat', val: ocrData.nutritionFacts.total_fat },
                { label: 'Fiber', val: ocrData.nutritionFacts.fiber },
                { label: 'Sodium', val: ocrData.nutritionFacts.sodium },
              ].filter(n => n.val !== undefined && n.val !== null && n.val !== '' && n.val !== '0' && n.val !== 0).map((n, i) => (
                <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                  <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1 truncate">{n.label}</span>
                  <span className="text-white font-semibold truncate">{n.val}</span>
                </div>
              ))}
            </div>
            {ocrData.servingSize && ocrData.servingSize !== "N/A" && (
              <div className="mt-4 text-center">
                <span className="text-white/40 text-xs uppercase font-bold tracking-widest">Serving Size: </span>
                <span className="text-white/80 text-sm font-medium">{ocrData.servingSize}</span>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* SECTION 5: INGREDIENT INTELLIGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard hoverable={false} className="p-6 h-full border-t-2 border-t-green-500/50">
              <h3 className="text-green-400 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Important Ingredients
              </h3>
              <div className="space-y-4">
                {b.key_nutrients && b.key_nutrients.length > 0 ? b.key_nutrients.map((item, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-3 border border-green-500/10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <p className="text-white/50 text-xs leading-snug">{item.explanation}</p>
                  </div>
                )) : (
                  <p className="text-white/40 text-sm">No significant beneficial ingredients detected.</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard hoverable={false} className="p-6 h-full border-t-2 border-t-red-500/50">
              <h3 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Potential Concerns
              </h3>
              <div className="space-y-4">
                {b.potential_concerns && b.potential_concerns.length > 0 ? b.potential_concerns.map((item, i) => (
                  <div key={i} className="bg-black/30 rounded-lg p-3 border border-red-500/10">
                    <span className="text-white font-medium block mb-1">{item.name}</span>
                    <p className="text-white/50 text-xs leading-snug">{item.explanation}</p>
                  </div>
                )) : (
                  <p className="text-white/40 text-sm">No major concerning ingredients detected.</p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* SECTION 6: ALLERGY ANALYSIS */}
          {(hasContent(b.product_allergens) || hasContent(b.additives)) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="md:col-span-2 space-y-6">
              
              {/* Allergy Alert - Red Danger Card */}
              {b.has_allergy_conflict && (
                <GlassCard hoverable={false} className="p-6 border-2 border-red-500/50 bg-red-900/10">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <h3 className="text-red-400 text-sm font-bold tracking-widest uppercase">Allergy Alert</h3>
                      <p className="text-red-300 text-sm mt-1">This product contains ingredients that match your allergy profile.</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-red-400/80 text-xs font-bold uppercase mb-2">Matched Allergens</h4>
                    <div className="flex flex-wrap gap-2">
                      {b.matched_allergies.map((item, i) => (
                        <span key={i} className="bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1.5 rounded-lg text-sm font-bold">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {b.product_allergens.filter(a => !b.matched_allergies.includes(a)).length > 0 && (
                    <div className="mt-6 pt-4 border-t border-red-500/20">
                      <h4 className="text-red-400/60 text-xs font-bold uppercase mb-2">Other Product Allergens</h4>
                      <div className="flex flex-wrap gap-2">
                        {b.product_allergens.filter(a => !b.matched_allergies.includes(a)).map((item, i) => (
                          <span key={i} className="bg-black/20 text-red-300/70 border border-red-500/10 px-3 py-1.5 rounded-lg text-sm font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Neutral Informational Blocks */}
              {(!b.has_allergy_conflict || hasContent(b.additives)) && (
                <GlassCard hoverable={false} className={`p-6 border-t-2 ${!b.has_allergy_conflict && hasContent(b.product_allergens) ? 'border-t-blue-400/30' : 'border-t-yellow-500/50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {!b.has_allergy_conflict && hasContent(b.product_allergens) && (
                      <div>
                        <h3 className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-4">Product Allergens</h3>
                        <p className="text-white/40 text-xs mb-3">No conflict with your profile.</p>
                        <div className="flex flex-wrap gap-2">
                          {b.product_allergens.map((item, i) => (
                            <span key={i} className="bg-blue-500/10 text-blue-200 border border-blue-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {hasContent(b.additives) && (
                      <div>
                        <h3 className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">Additives & Preservatives</h3>
                        <div className="flex flex-wrap gap-2">
                          {b.additives.map((item, i) => (
                            <span key={i} className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  </div>
                </GlassCard>
              )}

            </motion.div>
          )}

        </div>

        {/* SECTION 7: PERSONALIZED ANALYSIS */}
        {aiAnalysis.personalizedAnalysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard hoverable={false} className="p-6 border-l-4 border-l-[var(--color-primary)]">
              <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Personalized For You
              </h3>
              <p className="text-white/90 leading-relaxed text-base font-medium">
                "{aiAnalysis.personalizedAnalysis}"
              </p>
            </GlassCard>
          </motion.div>
        )}

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
