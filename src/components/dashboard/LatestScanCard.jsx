import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../GlassCard';
import Button from '../Button';
import HealthScoreRing from '../HealthScoreRing';

export default function LatestScanCard({ latestScan, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="dash-card-title">Latest Scan</h2>
        </div>
        <div className="animate-pulse bg-white/10 w-full h-24 rounded"></div>
      </GlassCard>
    );
  }

  if (!latestScan) {
    return (
      <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="dash-card-title">Latest Scan</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-sm text-gray-500">
          <p className="mb-4">No recent scans available.</p>
          <Button variant="primary" size="small" onClick={() => navigate('/scan')}>Scan Now</Button>
        </div>
      </GlassCard>
    );
  }

  const score = latestScan.overall_score || 0;
  const healthClass = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="dash-card-title">Latest Scan</h2>
        <Button variant="secondary" className="text-xs py-1 px-3" onClick={() => navigate('/history')}>View All</Button>
      </div>
      
      <motion.div 
        className="flex-1 flex flex-row items-center bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => navigate(`/scan/${latestScan.id}`)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex-1">
          <h3 className="font-medium text-white truncate text-lg mb-1" title={latestScan.product_name}>
            {latestScan.product_name}
          </h3>
          <div className="text-sm text-gray-400">
            {new Date(latestScan.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="ml-4 flex flex-col items-center">
          <HealthScoreRing score={score} size={50} strokeWidth={4} />
        </div>
      </motion.div>
    </GlassCard>
  );
}
