import { motion } from 'framer-motion';
import { useScanHistory } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';

function scoreColor(s) {
  if (s >= 80) return 'var(--color-success)';
  if (s >= 60) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function ScorePill({ score }) {
  return (
    <span className="dash-score-pill" style={{ color: scoreColor(score), background: `color-mix(in srgb, ${scoreColor(score)} 12%, transparent)` }}>
      {score}
    </span>
  );
}

export default function History() {
  const { data: history, isLoading } = useScanHistory();
  const scans = history || [];

  return (
    <main className="dash-main pt-24 min-h-screen">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dash-welcome-title">Scan History</h1>
        <p className="dash-welcome-sub">A comprehensive log of all your analyzed products.</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard hoverable={false} className="overflow-hidden">
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-white/5">
                  <th className="pb-4 font-semibold uppercase tracking-wider">Product Name</th>
                  <th className="pb-4 font-semibold uppercase tracking-wider">Date</th>
                  <th className="pb-4 font-semibold uppercase tracking-wider">Classification</th>
                  <th className="pb-4 font-semibold uppercase tracking-wider text-right">Score</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-4"><SkeletonLoader width={150} height={20} /></td>
                      <td className="py-4"><SkeletonLoader width={80} height={20} /></td>
                      <td className="py-4"><SkeletonLoader width={100} height={20} /></td>
                      <td className="py-4 text-right"><SkeletonLoader width={40} height={20} style={{ display: 'inline-block' }}/></td>
                    </tr>
                  ))
                ) : scans.length > 0 ? (
                  scans.map((s) => {
                    const dateObj = new Date(s.created_at);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    return (
                      <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 font-medium text-white truncate max-w-[200px]" title={s.product_name}>{s.product_name}</td>
                        <td className="py-4 text-gray-400 whitespace-nowrap">{formattedDate}</td>
                        <td className="py-4 text-gray-400">
                          {s.overall_score >= 80 ? 'Safe' : s.overall_score >= 60 ? 'Moderate' : 'Avoid'}
                        </td>
                        <td className="py-4 text-right">
                          <ScorePill score={s.overall_score || 0} />
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      No scans found. Head over to the Scan tab to analyze your first product!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </main>
  );
}
