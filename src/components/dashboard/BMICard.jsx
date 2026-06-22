import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../GlassCard';

export default function BMICard({ analytics, isLoading }) {
  if (isLoading) {
    return (
      <GlassCard className="dash-card h-full flex flex-col justify-center items-center" hoverable={false}>
        <div className="animate-pulse bg-white/10 w-24 h-24 rounded-full mb-4"></div>
        <div className="animate-pulse bg-white/10 w-32 h-6 rounded"></div>
      </GlassCard>
    );
  }

  const bmiData = analytics?.bmi;
  if (!bmiData) {
    return (
      <GlassCard className="dash-card h-full flex flex-col justify-center items-center text-center p-6" hoverable={false}>
        <h2 className="dash-card-title mb-2">BMI Analysis</h2>
        <p className="text-gray-400 text-sm">Update your profile weight and height to generate your BMI.</p>
      </GlassCard>
    );
  }

  // Determine color based on category
  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'underweight': return 'text-blue-400';
      case 'normal': return 'text-green-400';
      case 'overweight': return 'text-yellow-400';
      case 'obese': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
      <h2 className="dash-card-title mb-4">BMI & Body Analysis</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div 
          className="relative flex items-center justify-center w-32 h-32 rounded-full border-4 border-white/10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="absolute inset-0 rounded-full border-t-4 border-white opacity-50 animate-[spin_10s_linear_infinite]" />
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{bmiData.bmi}</div>
            <div className={`text-sm font-semibold uppercase ${getCategoryColor(bmiData.category)}`}>
              {bmiData.category}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="bg-white/5 rounded-lg p-3 text-sm">
          <span className="text-gray-400 block text-xs uppercase">Ideal Weight Range</span>
          <span className="text-white font-medium">{bmiData.ideal_weight_range}</span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          {bmiData.health_assessment}
        </p>
      </div>
    </GlassCard>
  );
}
