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
    <div className="w-full max-w-7xl mx-auto pb-16 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">AI Recommendations</h1>
        <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">Personalized health advice based on your profile and recent scans.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard hoverable={false} className="h-full p-8 border-[#FFFFFF]/20">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Latest Analysis Summary
            </h2>
            
            {isLatestLoading ? (
              <div className="space-y-4">
                 <SkeletonLoader width="100%" height={80} className="rounded-xl" />
                 <SkeletonLoader width="100%" height={100} className="rounded-xl" />
              </div>
            ) : latestRec ? (
              <div className="space-y-4">
                <div className="p-5 bg-[#0A0A0A] rounded-xl border border-white/[0.05] shadow-inner">
                  <h3 className="text-[#FFFFFF] text-xs font-bold uppercase tracking-wider mb-3">Verdict</h3>
                  <p className="text-white/80 text-sm leading-relaxed">{latestRec.ai_summary || latestRec.health_summary}</p>
                </div>
                
                {latestRec.concerns?.length > 0 && (
                  <div className="p-5 bg-red-500/5 rounded-xl border border-red-500/10">
                    <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">Key Concerns</h3>
                    <ul className="space-y-2">
                      {latestRec.concerns.map((c, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {latestRec.positives?.length > 0 && (
                  <div className="p-5 bg-green-500/5 rounded-xl border border-green-500/10">
                    <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3">Positives</h3>
                    <ul className="space-y-2">
                      {latestRec.positives.map((p, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-white/[0.05] rounded-2xl bg-[#050505]">
                <p className="text-white/40 text-sm">No recent recommendations available.<br/>Scan a product to generate one.</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard hoverable={false} className="h-full p-8 border-white/[0.05]">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-5 h-5 mr-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Historical Risk Flags
            </h2>
            <div className="space-y-3">
              {isInsightsLoading ? (
                <div className="space-y-3">
                  <SkeletonLoader width="100%" height={60} className="rounded-xl" />
                  <SkeletonLoader width="100%" height={60} className="rounded-xl" />
                </div>
              ) : insights?.common_risk_flags?.length > 0 ? (
                insights.common_risk_flags.map((r, idx) => (
                  <div className="p-4 bg-[#0A0A0A] border border-white/[0.05] rounded-xl flex items-center justify-between" key={idx}>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-1">Warning</span>
                      <span className="text-white/80 text-sm">Detected <span className="font-medium text-white">"{r.flag}"</span></span>
                    </div>
                    <span className="text-white/40 text-xs">{r.count} scans</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center border border-white/[0.05] rounded-2xl bg-[#050505]">
                  <p className="text-white/40 text-sm">No recurring risk flags detected yet.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
        
        {latestRec?.alternatives?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <GlassCard hoverable={false} className="p-8 border-emerald-500/20">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Healthier Alternatives for Last Scan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestRec.alternatives.map((alt, idx) => (
                  <div key={idx} className="p-5 bg-[#0A0A0A] rounded-2xl border border-white/[0.05] hover:border-emerald-500/30 transition-all group">
                    <h3 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{alt.name}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-3">{alt.brand}</p>
                    <p className="text-sm text-emerald-400/80 leading-relaxed border-t border-white/[0.05] pt-3">{alt.reason}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
