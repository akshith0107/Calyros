import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import SkeletonLoader from '../components/SkeletonLoader';

import { 
  useProfile, 
  useProfileAnalytics,
  useScanHistory
} from '../hooks/useDashboardData';

import BMICard from '../components/dashboard/BMICard';
import NutritionTargetsCard from '../components/dashboard/NutritionTargetsCard';
import LatestScanCard from '../components/dashboard/LatestScanCard';
import HealthScoreCard from '../components/scan/HealthScoreCard';
import IngredientIntelligenceCard from '../components/scan/IngredientIntelligenceCard';
import DiseaseCompatibilityCard from '../components/scan/DiseaseCompatibilityCard';

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
  const { data: analytics, isLoading: isAnalyticsLoading } = useProfileAnalytics();
  const { data: history, isLoading: isHistoryLoading } = useScanHistory();

  const recentScans = history || [];
  const latestScan = recentScans[0];

  // Safely extract latest scan detailed data if available
  const latestAnalysis = latestScan?.analysis || {};
  const latestExtracted = latestScan?.extracted || {};
  const scoreBreakdown = latestAnalysis.score_breakdown || null;
  const diseaseCompat = latestAnalysis.disease_compatibility || null;
  const goalCompat = latestAnalysis.goal_compatibility || null;
  const ingredients = latestExtracted.ingredient_intelligence || [];
  const processingLevel = latestAnalysis.processing_level || null;
  const processingReason = latestAnalysis.processing_reason || null;

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
        {/* Row 1 */}
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <BMICard analytics={analytics} isLoading={isAnalyticsLoading} />
        </motion.div>
        <motion.div variants={cardVariant} className="lg:col-span-1">
          <NutritionTargetsCard analytics={analytics} isLoading={isAnalyticsLoading} />
        </motion.div>
        <motion.div variants={cardVariant} className="lg:col-span-2">
          <LatestScanCard latestScan={latestScan} isLoading={isHistoryLoading} />
        </motion.div>

        {/* Row 2: Deep Analysis for Latest Scan */}
        {latestScan && (
          <>
            <motion.div variants={cardVariant} className="lg:col-span-1">
              <HealthScoreCard scoreBreakdown={scoreBreakdown} overallScore={latestScan.overall_score} />
            </motion.div>

            <motion.div variants={cardVariant} className="lg:col-span-2">
              <IngredientIntelligenceCard 
                ingredients={ingredients} 
                processingLevel={processingLevel} 
                processingReason={processingReason} 
              />
            </motion.div>

            <motion.div variants={cardVariant} className="lg:col-span-1">
              <DiseaseCompatibilityCard 
                diseaseCompatibility={diseaseCompat} 
                goalCompatibility={goalCompat} 
              />
            </motion.div>
          </>
        )}
      </motion.div>
    </main>
  );
}
