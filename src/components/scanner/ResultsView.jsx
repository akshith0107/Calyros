import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import HealthScoreRing from '../HealthScoreRing';
import GlassCard from '../GlassCard';
import apiClient from '../../services/apiClient';

export default function ResultsView({ result, onClose }) {
  const { scanId, ocrData, aiAnalysis } = result;
  const navigate = useNavigate();

  const [alternatives, setAlternatives] = useState(null);
  const [loadingAlternatives, setLoadingAlternatives] = useState(true);

  useEffect(() => {
    const fetchAlternatives = async () => {
      try {
        const { data } = await apiClient.get(`/scan/${scanId}/alternatives`);
        setAlternatives(data.data.alternatives);
      } catch (e) {
        console.error("Failed to fetch alternatives", e);
      } finally {
        setLoadingAlternatives(false);
      }
    };
    if (scanId) {
      fetchAlternatives();
    }
  }, [scanId]);
  
  const classificationColors = {
    "Excellent": "bg-green-500/20 text-green-400 border-green-500/30",
    "Good": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Moderate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Poor": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Avoid": "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const getClassificationBadge = (classification) => {
    return classificationColors[classification] || "bg-white/10 text-white border-white/20";
  };

  const hasContent = (arr) => Array.isArray(arr) && arr.length > 0;

  return (
    <div className="absolute inset-0 z-50 bg-[#050505] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium tracking-wide flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className="max-w-4xl mx-auto p-4 pb-32 lg:p-8 space-y-6">
        
        {/* SECTION 11: Discuss with Calyros AI */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
          <button 
            onClick={() => navigate(`/chat/${scanId}`)}
            className="bg-[#FFFFFF] hover:bg-[#DDDDDD] text-white text-sm font-semibold px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2 transition-transform hover:scale-105"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Discuss with Calyros AI
          </button>
        </motion.div>

        {/* SECTION 1: Health Score */}
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
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 9: Personalized Insights */}
          {aiAnalysis.personalizedAnalysis && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <GlassCard hoverable={false} className="p-6 border-l-4 border-l-[#FFFFFF]">
                <h3 className="text-[#FFFFFF] text-xs font-bold tracking-widest uppercase mb-2">Personalized Insights</h3>
                <p className="text-white/90 leading-relaxed text-sm">{aiAnalysis.personalizedAnalysis}</p>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION 2: Why This Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard hoverable={false} className="p-6 h-full border-t-2 border-t-emerald-500/50">
              <h3 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">Positive Factors</h3>
              <ul className="space-y-3">
                {hasContent(aiAnalysis.positiveFactors) ? aiAnalysis.positiveFactors.map((item, i) => (
                  <li key={i} className="flex gap-3 text-white/80 text-sm bg-black/30 p-3 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400">✓</span> {item}
                  </li>
                )) : <li className="text-white/40 text-sm">No significant positive factors.</li>}
              </ul>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard hoverable={false} className="p-6 h-full border-t-2 border-t-red-500/50">
              <h3 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-4">Concerns</h3>
              <ul className="space-y-3">
                {hasContent(aiAnalysis.concerns) ? aiAnalysis.concerns.map((item, i) => (
                  <li key={i} className="flex gap-3 text-white/80 text-sm bg-black/30 p-3 rounded-lg border border-red-500/20">
                    <span className="text-red-400">⚠</span> {item}
                  </li>
                )) : <li className="text-white/40 text-sm">No significant concerns.</li>}
              </ul>
            </GlassCard>
          </motion.div>

          {/* SECTION 3: Key Findings */}
          {hasContent(aiAnalysis.keyFindings) && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <GlassCard hoverable={false} className="p-6">
                <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Key Findings</h3>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keyFindings.map((item, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION 7: Allergen Analysis */}
          {aiAnalysis.allergyAnalysis && aiAnalysis.allergyAnalysis.status && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <GlassCard hoverable={false} className={`p-6 border-l-4 ${aiAnalysis.allergyAnalysis.status === 'Allergy Conflict Detected' ? 'border-l-red-500 bg-red-500/5' : 'border-l-green-500'}`}>
                <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">Allergen Analysis</h3>
                <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div>
                    <span className={`font-bold ${aiAnalysis.allergyAnalysis.status === 'Allergy Conflict Detected' ? 'text-red-400' : 'text-green-400'}`}>
                      {aiAnalysis.allergyAnalysis.status}
                    </span>
                    <p className="text-white/70 text-sm mt-1">{aiAnalysis.allergyAnalysis.message}</p>
                  </div>
                  {hasContent(ocrData.allergens) && (
                    <div className="flex gap-2">
                      {ocrData.allergens.map((a, i) => (
                        <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-white text-xs">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION: Better Alternatives */}
          <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
            <GlassCard hoverable={false} className="p-6 border-l-4 border-l-blue-500">
              <h3 className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Better Alternatives
              </h3>
              
              {loadingAlternatives ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : alternatives && alternatives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {alternatives.map((alt, i) => (
                    <div key={i} className="bg-[#141414] p-4 rounded-lg border border-white/5 relative overflow-hidden group flex flex-col">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg className="w-12 h-12 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                      </div>
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/30 mb-2">
                          {alt.category || "Healthier Alternative"}
                        </span>
                        <h4 className="text-white font-bold">{alt.name}</h4>
                      </div>
                      <p className="text-gray-400 text-xs mb-3">{alt.reason}</p>
                      
                      <div className="mb-3 flex-grow">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">Benefits</span>
                        <ul className="text-xs text-green-400 space-y-1">
                          {alt.benefits.map((b, j) => <li key={j} className="flex items-start"><span className="mr-1">✓</span>{b}</li>)}
                        </ul>
                      </div>
                      
                      <div className="space-y-2 mt-auto">
                        <div className="bg-blue-500/10 text-blue-300 text-xs p-2 rounded border border-blue-500/20">
                          <span className="font-bold">Expected: </span>{alt.expected_improvement}
                        </div>
                        {alt.goal_alignment && (
                          <div className="bg-[#FFFFFF]/10 text-[#FFFFFF] text-xs p-2 rounded border border-[#FFFFFF]/20">
                            <span className="font-bold">Goal Alignment: </span>{alt.goal_alignment}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm">No alternatives generated.</p>
              )}
            </GlassCard>
          </motion.div>

          {/* SECTION 4: Full Nutrition Facts */}
          <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <GlassCard hoverable={false} className="p-6">
              <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Core Nutrition Facts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(ocrData.nutritionFacts).filter(([_, val]) => val !== undefined && val !== null && val !== '').map(([key, val], i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1 truncate">{key.replace('_', ' ')}</span>
                    <span className="text-white font-semibold truncate">{val}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* SECTION 5: Vitamins & Minerals */}
          {(hasContent(ocrData.vitamins) || hasContent(ocrData.minerals)) && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <GlassCard hoverable={false} className="p-6">
                <h3 className="text-[#FFFFFF] text-xs font-bold tracking-widest uppercase mb-4">Micronutrients (Vitamins & Minerals)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...ocrData.vitamins, ...ocrData.minerals].map((item, i) => (
                    <div key={i} className="bg-[#FFFFFF]/5 border border-[#FFFFFF]/20 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-white/80 text-sm font-medium">{item.name}</span>
                      <span className="text-[#FFFFFF] font-bold text-sm">{item.value}{item.unit}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION 6: Ingredient Intelligence */}
          {hasContent(ocrData.ingredients) && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <GlassCard hoverable={false} className="p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Ingredient Intelligence</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        aiAnalysis.processingAssessment === 'Minimally Processed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        aiAnalysis.processingAssessment === 'Processed' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {aiAnalysis.processingAssessment}
                      </span>
                      <span className="text-white/60 text-sm">
                        Score: <strong className="text-white">{aiAnalysis.ingredientQualityScore}/100</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {hasContent(aiAnalysis.ingredientFindings) && (
                  <div className="mb-6 space-y-3">
                    {aiAnalysis.ingredientFindings.map((finding, i) => {
                      const isPositive = finding.includes('quality') || finding.includes('whole-food') || finding.includes('no significant additives');
                      return (
                        <div key={i} className={`flex gap-3 text-sm p-3 rounded-lg border ${
                          isPositive ? 'bg-green-500/10 border-green-500/20 text-green-100' : 'bg-orange-500/10 border-orange-500/20 text-orange-100'
                        }`}>
                          <span className={isPositive ? 'text-green-400' : 'text-orange-400'}>
                            {isPositive ? '✓' : '⚠'}
                          </span>
                          {finding}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                  <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Raw Ingredient List</h4>
                  <p className="text-white/70 text-xs leading-relaxed font-mono">
                    {ocrData.ingredients.join(', ')}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION 8: Additives & Preservatives */}
          {(hasContent(ocrData.additives) || hasContent(ocrData.preservatives)) && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <GlassCard hoverable={false} className="p-6 border-t-2 border-t-yellow-500/50">
                <h3 className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">Additives & Preservatives</h3>
                <div className="flex flex-wrap gap-2">
                  {[...ocrData.additives, ...ocrData.preservatives].map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* SECTION 10: Recommendations */}
          {hasContent(aiAnalysis.recommendations) && (
            <motion.div className="md:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard hoverable={false} className="p-6 border-t-2 border-t-blue-500/50">
                <h3 className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">Next Steps</h3>
                <ul className="space-y-3">
                  {aiAnalysis.recommendations.map((item, i) => (
                    <li key={i} className="flex gap-3 text-white/80 text-sm bg-black/30 p-3 rounded-lg border border-blue-500/20">
                      <span className="text-blue-400">➜</span> {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
