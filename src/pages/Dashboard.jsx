import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import HealthScoreRing from '../components/HealthScoreRing';
import SkeletonLoader from '../components/SkeletonLoader';

import { 
  useProfile, 
  useDashboardStats, 
  useScanHistory, 
  useHealthInsights 
} from '../hooks/useDashboardData';

/* ── Animation variants ── */
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

/* ── Page ── */
export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch real data
  const { data: profileObj, isLoading: isProfileLoading } = useProfile();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: history, isLoading: isHistoryLoading } = useScanHistory();
  const { data: insights, isLoading: isInsightsLoading } = useHealthInsights();

  // Safely extract
  const pData = profileObj?.profile || {};
  const recentScans = history || [];
  const latestScan = recentScans[0];

  return (
    <main className="dash-main pt-24 min-h-screen">
      {/* Welcome */}
      <motion.header
        className="dash-welcome mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <h1 className="dash-welcome-title">Welcome Back</h1>
        <p className="dash-welcome-sub">Your personalized nutrition intelligence overview.</p>
      </motion.header>

      {/* Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Card 1 · Quick Scan ─── */}
        <motion.div variants={cardVariant} className="lg:col-span-2">
          <GlassCard className="dash-card dash-card--cta h-full" hoverable={false}>
            <div className="dash-scan-content flex flex-col justify-center h-full">
              <div>
                <h2 className="dash-card-title text-xl mb-2">Ready to Analyze?</h2>
                <p className="dash-card-desc text-gray-300">Capture or upload a product's nutrition label to receive AI-powered health analysis.</p>
              </div>
              <div className="mt-6">
                <Button variant="primary" size="large" onClick={() => navigate('/scan')}>
                  <svg className="w-5 h-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Scan Product
                </Button>
              </div>
            </div>
            <div className="dash-scan-accent" aria-hidden="true" />
          </GlassCard>
        </motion.div>

        {/* ─── Card 2 · Average Score ─── */}
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <GlassCard className="dash-card dash-card--center h-full flex flex-col items-center justify-center" hoverable={false}>
            <h2 className="dash-card-title mb-4">Average Score</h2>
            {isStatsLoading ? (
               <SkeletonLoader width={120} height={120} style={{ borderRadius: '50%' }} />
            ) : (
              <HealthScoreRing score={stats?.average_score || 0} size={120} strokeWidth={5} />
            )}
          </GlassCard>
        </motion.div>

        {/* ─── Card 3 · Profile Summary ─── */}
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <GlassCard className="dash-card h-full flex flex-col justify-between" hoverable={false}>
            <div>
              <h2 className="dash-card-title mb-4">Profile</h2>
              {isProfileLoading ? (
                 <SkeletonLoader width="100%" height={80} />
              ) : (
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Goal</span>
                    <span className="capitalize font-medium text-white">{pData.primary_goal?.toLowerCase().replace('_', ' ') || '--'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activity</span>
                    <span className="capitalize font-medium text-white">{pData.activity_level?.toLowerCase().replace('_', ' ') || '--'}</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
          </GlassCard>
        </motion.div>

        {/* ─── Card 4 · Latest Scan ─── */}
        <motion.div variants={cardVariant} className="lg:col-span-2">
          <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="dash-card-title">Latest Scan</h2>
              <Button variant="secondary" className="text-xs py-1" onClick={() => navigate('/history')}>View All</Button>
            </div>
            {isHistoryLoading ? (
              <SkeletonLoader width="100%" height={100} />
            ) : latestScan ? (
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-white truncate text-lg" title={latestScan.product_name}>{latestScan.product_name}</span>
                  <span className="text-[var(--color-primary)] font-bold text-xl">{latestScan.overall_score}</span>
                </div>
                <div className="text-sm text-gray-400">
                  Classified as: <span className="text-white capitalize">{latestScan.overall_score >= 80 ? 'Safe' : latestScan.overall_score >= 60 ? 'Moderate' : 'Avoid'}</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">No recent scans available.</div>
            )}
          </GlassCard>
        </motion.div>

        {/* ─── Card 5 · Risk Summary ─── */}
        <motion.div variants={cardVariant} className="lg:col-span-2">
          <GlassCard className="dash-card h-full flex flex-col" hoverable={false}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="dash-card-title">Recommendations</h2>
              <Button variant="secondary" className="text-xs py-1" onClick={() => navigate('/recommendations')}>Insights</Button>
            </div>
            {isInsightsLoading ? (
              <SkeletonLoader width="100%" height={100} />
            ) : insights?.common_risk_flags?.length > 0 ? (
              <ul className="dash-rec-list flex-1 overflow-y-auto">
                {insights.common_risk_flags.slice(0, 2).map((r, idx) => (
                  <li className="dash-rec-item" key={idx}>
                    <span className="dash-rec-tag text-xs bg-red-900/30 text-red-400 border border-red-800 rounded px-2 py-1">Warning</span>
                    <span className="dash-rec-text truncate">Detected "{r.flag}" frequently.</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">No active risk flags detected.</div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </main>
  );
}
