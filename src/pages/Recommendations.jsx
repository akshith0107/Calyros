import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useHealthInsights } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import apiClient from '../services/apiClient';

export default function Recommendations() {
  const { data: insights, isLoading: isInsightsLoading } = useHealthInsights();
  const [latestRec, setLatestRec] = useState(null);
  const [isLatestLoading, setIsLatestLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const { data } = await apiClient.get('/recommendations/latest');
        if (data.success) {
          setLatestRec(data.data);
        }
      } catch (err) {
        console.error("Failed to load latest recommendation", err);
      } finally {
        setIsLatestLoading(false);
      }
    }
    fetchLatest();
  }, []);

  return (
    <main className="dash-main pt-24 min-h-screen">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dash-welcome-title">AI Recommendations</h1>
        <p className="dash-welcome-sub">Personalized health advice based on your profile and recent scans.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hoverable={false} className="h-full">
            <h2 className="dash-card-title mb-4">Latest Analysis Summary</h2>
            {isLatestLoading ? (
              <SkeletonLoader width="100%" height={200} />
            ) : latestRec ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-[var(--color-primary)] font-semibold mb-2">Verdict</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{latestRec.ai_summary || latestRec.health_summary}</p>
                </div>
                {latestRec.concerns?.length > 0 && (
                  <div className="p-4 bg-red-900/10 rounded-xl border border-red-900/30">
                    <h3 className="text-red-400 font-semibold mb-2">Key Concerns</h3>
                    <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                      {latestRec.concerns.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {latestRec.positives?.length > 0 && (
                  <div className="p-4 bg-green-900/10 rounded-xl border border-green-900/30">
                    <h3 className="text-green-400 font-semibold mb-2">Positives</h3>
                    <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                      {latestRec.positives.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No recent recommendations available. Scan a product to generate one.</p>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hoverable={false} className="h-full">
            <h2 className="dash-card-title mb-4">Historical Risk Flags</h2>
            <ul className="dash-rec-list">
              {isInsightsLoading ? (
                <SkeletonLoader width="100%" height={100} />
              ) : insights?.common_risk_flags?.length > 0 ? (
                insights.common_risk_flags.map((r, idx) => (
                  <li className="dash-rec-item" key={idx}>
                    <span className="dash-rec-tag text-xs bg-red-900/30 text-red-400 border border-red-800 rounded px-2 py-1">Warning</span>
                    <span className="dash-rec-text">Detected "{r.flag}" in {r.count} of your scanned products.</span>
                  </li>
                ))
              ) : (
                <li className="dash-rec-item text-gray-400 border-none justify-center">No recurring risk flags detected yet.</li>
              )}
            </ul>
          </GlassCard>
        </motion.div>
        
        {latestRec?.alternatives?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlassCard hoverable={false}>
              <h2 className="dash-card-title mb-4">Healthier Alternatives for Last Scan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestRec.alternatives.map((alt, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                    <h3 className="font-medium text-white mb-1">{alt.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">{alt.brand}</p>
                    <p className="text-sm text-[var(--color-success)]">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </main>
  );
}
