import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../GlassCard';

export default function DiseaseCompatibilityCard({ diseaseCompatibility, goalCompatibility }) {
  const [activeTab, setActiveTab] = useState('diseases');

  if (!diseaseCompatibility && !goalCompatibility) return null;

  const getSuitabilityColor = (suitability) => {
    const s = suitability?.toLowerCase() || '';
    if (s.includes('recommended') && !s.includes('not')) return 'text-green-400';
    if (s.includes('suitable') && !s.includes('not')) return 'text-green-400';
    if (s.includes('not recommended') || s.includes('not suitable')) return 'text-red-400';
    return 'text-yellow-400'; // moderate/neutral
  };

  return (
    <GlassCard className="h-full flex flex-col" hoverable={false}>
      <div className="flex space-x-4 border-b border-white/10 mb-4 pb-2">
        <button
          onClick={() => setActiveTab('diseases')}
          className={`pb-2 text-lg font-medium transition-colors ${
            activeTab === 'diseases' ? 'text-white border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Medical Conditions
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`pb-2 text-lg font-medium transition-colors ${
            activeTab === 'goals' ? 'text-white border-b-2 border-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Health Goals
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'diseases' && diseaseCompatibility && (
            <motion.div
              key="diseases"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              {Object.entries(diseaseCompatibility).map(([condition, data]) => (
                <div key={condition} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="capitalize font-semibold text-white">{condition.replace('_', ' ')}</h3>
                    <span className={`text-sm font-bold uppercase tracking-wider ${getSuitabilityColor(data.suitability)}`}>
                      {data.suitability}
                    </span>
                  </div>
                  {data.risks && (
                    <div className="mb-2">
                      <span className="text-xs text-red-300 uppercase tracking-wide block mb-1">Risks</span>
                      <p className="text-sm text-gray-300">{data.risks}</p>
                    </div>
                  )}
                  {data.recommendations && (
                    <div>
                      <span className="text-xs text-blue-300 uppercase tracking-wide block mb-1">Advice</span>
                      <p className="text-sm text-gray-300">{data.recommendations}</p>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'goals' && goalCompatibility && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {Object.entries(goalCompatibility).map(([goal, assessment]) => {
                // Assessment is typically a string like "Recommended. Reason: bla bla"
                const parts = assessment.split('. Reason:');
                const verdict = parts[0];
                const reason = parts[1] || assessment;

                return (
                  <div key={goal} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="capitalize font-semibold text-white">{goal.replace('_', ' ')}</h3>
                      <span className={`text-xs font-bold uppercase tracking-wider ${getSuitabilityColor(verdict)}`}>
                        {verdict}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{reason}</p>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
