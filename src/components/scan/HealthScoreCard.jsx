import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../GlassCard';

export default function HealthScoreCard({ scoreBreakdown, overallScore }) {
  if (!scoreBreakdown) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const breakdownItems = [
    { key: 'nutrition_quality', label: 'Nutrition Quality' },
    { key: 'ingredient_safety', label: 'Ingredient Safety' },
    { key: 'sugar_score', label: 'Sugar Control' },
    { key: 'protein_score', label: 'Protein Value' },
    { key: 'processing_score', label: 'Processing Level' }
  ];

  return (
    <GlassCard className="h-full flex flex-col" hoverable={false}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="dash-card-title text-lg">Health Score Breakdown</h2>
        <span className={`text-2xl font-bold ${getTextColor(overallScore)}`}>{overallScore}/100</span>
      </div>

      <div className="space-y-4">
        {breakdownItems.map((item, idx) => {
          const score = scoreBreakdown[item.key] || 0;
          return (
            <div key={item.key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-white font-medium">{score}/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${getScoreColor(score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
