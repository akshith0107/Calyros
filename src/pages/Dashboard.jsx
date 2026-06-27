import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { useProfileAnalytics, useScanHistory } from '../hooks/useDashboardData';
import { ScanLine, Activity, Target, Flame, ArrowRight, Zap, History, Sparkles } from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: analytics, isLoading: isAnalyticsLoading } = useProfileAnalytics();
  const { data: history, isLoading: isHistoryLoading } = useScanHistory();

  const recentScans = history || [];
  const totalScans = recentScans.length;
  const latestScan = recentScans[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-1">
            Welcome back, {user?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">
            Here's your personalized nutrition intelligence overview.
          </p>
        </div>
        <button 
          onClick={() => navigate('/scan')}
          className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-full font-semibold text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-all shrink-0"
        >
          <ScanLine size={16} /> New Scan
        </button>
      </motion.div>

      {/* The Bento Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats Row */}
        <motion.div variants={cardVariant} className="md:col-span-3 lg:col-span-4 row-span-1">
          <GlassCard className="h-full flex justify-between items-center bg-gradient-to-br from-[#0A0A0A] to-[#050505]">
            <div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                <Flame size={14} className="text-orange-400" /> Calories Target
              </div>
              {isAnalyticsLoading ? <SkeletonLoader width="80px" height="32px" /> : (
                <div className="text-3xl font-bold text-white">
                  {analytics?.targets?.calories || 2200} <span className="text-sm text-white/30 font-medium">kcal</span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardVariant} className="md:col-span-3 lg:col-span-4 row-span-1">
          <GlassCard className="h-full flex justify-between items-center bg-gradient-to-br from-[#0A0A0A] to-[#050505]">
            <div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                <Target size={14} className="text-[#FFFFFF]" /> Protein Goal
              </div>
              {isAnalyticsLoading ? <SkeletonLoader width="80px" height="32px" /> : (
                <div className="text-3xl font-bold text-white">
                  {analytics?.targets?.protein || 140} <span className="text-sm text-white/30 font-medium">g</span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={cardVariant} className="md:col-span-6 lg:col-span-4 row-span-1">
          <GlassCard className="h-full flex justify-between items-center bg-gradient-to-br from-[#0A0A0A] to-[#050505]">
            <div>
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                <Activity size={14} className="text-green-400" /> Total Scans
              </div>
              {isHistoryLoading ? <SkeletonLoader width="60px" height="32px" /> : (
                <div className="text-3xl font-bold text-white">
                  {totalScans}
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
              <History size={20} className="text-white/50" />
            </div>
          </GlassCard>
        </motion.div>

        {/* Big AI Summary Card */}
        <motion.div variants={cardVariant} className="md:col-span-6 lg:col-span-8 row-span-2">
          <GlassCard className="h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFFFFF]/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider">
                <Sparkles size={14} className="text-[#FFFFFF]" /> AI Health Assistant
              </div>
              <button className="text-xs text-[#FFFFFF] hover:text-white transition-colors flex items-center gap-1">
                Open Chat <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90">
                Based on your recent scans, you are keeping a great balance of macros. Your last scan ({latestScan?.product_name || "Unknown Product"}) aligned perfectly with your high-protein goals.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">Optimal Protein Intake</span>
                <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">Watch Sugar Levels</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Latest Scan Mini-Card */}
        <motion.div variants={cardVariant} className="md:col-span-3 lg:col-span-4 row-span-2">
          <GlassCard className="h-full flex flex-col cursor-pointer" onClick={() => navigate('/history')}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium uppercase tracking-wider">
                <Zap size={14} className="text-yellow-400" /> Latest Scan
              </div>
            </div>
            {isHistoryLoading ? (
              <div className="space-y-3">
                <SkeletonLoader height="60px" />
                <SkeletonLoader height="20px" width="70%" />
              </div>
            ) : latestScan ? (
              <div className="flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{latestScan.product_name}</h3>
                <div className="text-3xl font-bold text-[#FFFFFF] mb-auto">
                  {latestScan.overall_score}<span className="text-sm text-white/30 font-medium">/100</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/[0.05] flex justify-between items-center text-xs text-white/50">
                  <span>View full analysis</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50">
                <ScanLine size={32} className="mb-2" />
                <p className="text-sm">No scans yet</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

      </motion.div>
    </div>
  );
}
