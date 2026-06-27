import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../GlassCard';

export default function IngredientIntelligenceCard({ ingredients, processingLevel, processingReason }) {
  const [filter, setFilter] = useState('All');

  if (!ingredients || ingredients.length === 0) return null;

  const categories = ['All', 'Beneficial', 'Neutral', 'Potentially Harmful'];

  const filteredIngredients = ingredients.filter(ing => {
    if (filter === 'All') return true;
    return ing.category?.toLowerCase() === filter.toLowerCase();
  });

  const getCategoryStyles = (category) => {
    switch (category?.toLowerCase()) {
      case 'beneficial': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'neutral': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'potentially harmful': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getProcessingColor = (level) => {
    if (!level) return 'text-gray-400';
    const l = level.toLowerCase();
    if (l.includes('minimally')) return 'text-green-400';
    if (l.includes('ultra')) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <GlassCard className="h-full flex flex-col max-h-[600px]" hoverable={false}>
      <div className="mb-4 pb-4 border-b border-white/10">
        <h2 className="dash-card-title text-lg mb-2">Processing Level</h2>
        <div className="flex items-center space-x-2">
          <span className={`text-xl font-bold uppercase ${getProcessingColor(processingLevel)}`}>
            {processingLevel || 'Unknown'}
          </span>
        </div>
        {processingReason && <p className="text-sm text-gray-400 mt-2">{processingReason}</p>}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="dash-card-title text-lg">Ingredient Intelligence</h2>
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
              filter === c ? 'bg-[#FFFFFF] text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence>
          {filteredIngredients.map((ing, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-3 rounded-lg border ${getCategoryStyles(ing.category)} backdrop-blur-sm`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">{ing.name}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">{ing.category}</span>
              </div>
              <p className="text-sm opacity-90 mb-1">{ing.benefit_or_risk}</p>
              {ing.reason && <p className="text-xs opacity-70 italic">{ing.reason}</p>}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredIngredients.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No ingredients found for this category.
          </div>
        )}
      </div>
    </GlassCard>
  );
}
