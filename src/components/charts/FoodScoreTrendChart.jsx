import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FoodScoreTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No trend data available yet. Start scanning!
      </div>
    );
  }

  // data expects: [{ score: 85, date: "May 30" }, ...]
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
            itemStyle={{ color: '#FFFFFF' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#FFFFFF" 
            strokeWidth={3}
            dot={{ fill: '#FFFFFF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
