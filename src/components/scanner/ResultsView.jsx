import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../Button';
import HealthScoreRing from '../HealthScoreRing';
import GlassCard from '../GlassCard';

export default function ResultsView({ result, imageUri, onSave, onScanAgain, onClose }) {
  const { scanId, ocrData, aiAnalysis } = result;
  const navigate = useNavigate();
  
  return (
    <div className="absolute inset-0 z-50 bg-[#050505] overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium tracking-wide">Analysis Complete</h2>
        <button onClick={onClose} className="text-white/60 hover:text-white p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className="max-w-3xl mx-auto p-4 pb-24 lg:p-8 space-y-6">
        
        {/* Top Section: Score & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Score Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <GlassCard className="h-full flex flex-col items-center justify-center p-8 text-center relative" hoverable={false}>
              {/* Ask Nutra AI Button */}
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => navigate(`/chat/${scanId}`)}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Ask Nutra AI
                </button>
              </div>

              <h3 className="text-white/60 text-sm tracking-wider uppercase mb-6">Health Score</h3>
              <HealthScoreRing score={aiAnalysis.healthScore} size={160} strokeWidth={6} />
              <div className="mt-6">
                <h1 className="text-2xl text-white font-medium mb-1">{ocrData.productName}</h1>
                <p className="text-white/50 text-sm">Scan Confidence: {Math.round(ocrData.confidence * 100)}%</p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Insights Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
            <GlassCard className="h-full" hoverable={false}>
              <h3 className="text-white/60 text-sm tracking-wider uppercase mb-4">Personalized Insights</h3>
              <ul className="space-y-4">
                {aiAnalysis.insights.map((insight, idx) => (
                  <li key={idx} className="flex gap-3 text-white/90 leading-relaxed">
                    <svg className="shrink-0 mt-1 w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>

              {aiAnalysis.alternative && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-white/60 text-xs tracking-wider uppercase mb-3">Smarter Alternative</h4>
                  <div className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium text-sm mb-1">{aiAnalysis.alternative.suggestion}</p>
                      <p className="text-white/40 text-xs line-through">{aiAnalysis.alternative.original}</p>
                    </div>
                    <span className="text-green-400 font-medium text-sm bg-green-400/10 px-2 py-1 rounded">
                      {aiAnalysis.alternative.improvement}
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Nutrition Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hoverable={false}>
            <h3 className="text-white/60 text-sm tracking-wider uppercase mb-6">Nutrition Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(ocrData.parsedData).map(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                const unit = key === 'calories' ? 'kcal' : 'g';
                return (
                  <div key={key} className="bg-white/5 rounded-lg p-4 flex flex-col justify-between">
                    <span className="text-white/50 text-xs uppercase tracking-wider mb-2">{label}</span>
                    <span className="text-white text-xl font-medium">{value} <span className="text-sm text-white/40">{unit}</span></span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
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
