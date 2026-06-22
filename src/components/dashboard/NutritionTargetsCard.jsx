import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from '../GlassCard';

export default function NutritionTargetsCard({ analytics, isLoading }) {
  if (isLoading) {
    return (
      <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
        <div className="animate-pulse bg-white/10 w-full h-32 rounded mb-4"></div>
        <div className="animate-pulse bg-white/10 w-full h-8 rounded"></div>
      </GlassCard>
    );
  }

  const targets = analytics?.targets;
  if (!targets) {
    return (
      <GlassCard className="dash-card h-full flex flex-col justify-center items-center text-center p-6" hoverable={false}>
        <h2 className="dash-card-title mb-2">Daily Targets</h2>
        <p className="text-gray-400 text-sm">Update your profile to generate custom nutrition targets.</p>
      </GlassCard>
    );
  }

  const data = [
    { name: 'Protein', value: targets.protein_target_g, color: '#3B82F6' }, // blue
    { name: 'Carbs', value: targets.carb_target_g, color: '#10B981' }, // green
    { name: 'Fat', value: targets.fat_target_g, color: '#F59E0B' } // yellow
  ];

  return (
    <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
      <h2 className="dash-card-title mb-2">Daily Targets</h2>
      
      <div className="flex-1 flex flex-row items-center justify-between">
        <div className="w-1/2 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: 'white' }}
                itemStyle={{ color: 'white' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 flex flex-col space-y-2">
          <div className="text-right">
            <span className="text-xl font-bold text-white">{targets.daily_calories}</span>
            <span className="text-xs text-gray-400 ml-1">kcal</span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-300">{targets.water_target_liters}</span>
            <span className="text-xs text-gray-400 ml-1">L water</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between px-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-[10px] text-gray-400 uppercase">{item.name}</span>
            </div>
            <span className="text-sm text-white font-medium">{Math.round(item.value)}g</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
