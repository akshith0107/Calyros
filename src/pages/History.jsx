import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useScanHistory } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import SkeletonLoader from '../components/SkeletonLoader';
import InputField from '../components/InputField';
import { Search, History as HistoryIcon, Filter, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { data: history, isLoading } = useScanHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState('all'); // all, high, medium, low
  const navigate = useNavigate();

  const filteredScans = useMemo(() => {
    let scans = history || [];
    if (searchTerm) {
      scans = scans.filter(s => s.product_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterScore !== 'all') {
      scans = scans.filter(s => {
        if (filterScore === 'high') return s.overall_score >= 80;
        if (filterScore === 'medium') return s.overall_score >= 50 && s.overall_score < 80;
        if (filterScore === 'low') return s.overall_score < 50;
        return true;
      });
    }
    return scans;
  }, [history, searchTerm, filterScore]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Scan History</h1>
          <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">A comprehensive log of all your analyzed products.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-64">
            <InputField 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <button className="flex items-center justify-center w-11 h-[46px] rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/[0.08]">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/50">Product Name</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/50">Date Analyzed</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/50">Classification</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/50 text-right">Health Score</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-white/50 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      <td className="py-4 px-6"><SkeletonLoader width="150px" height="20px" /></td>
                      <td className="py-4 px-6"><SkeletonLoader width="80px" height="20px" /></td>
                      <td className="py-4 px-6"><SkeletonLoader width="100px" height="20px" /></td>
                      <td className="py-4 px-6 flex justify-end"><SkeletonLoader width="40px" height="20px" /></td>
                      <td className="py-4 px-6"></td>
                    </tr>
                  ))
                ) : filteredScans.length > 0 ? (
                  filteredScans.map((s) => {
                    const dateObj = new Date(s.created_at);
                    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    
                    const getScoreColor = (score) => {
                      if (score >= 80) return 'text-green-400 bg-green-500/10 border-green-500/20';
                      if (score >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
                      return 'text-red-400 bg-red-500/10 border-red-500/20';
                    };
                    
                    return (
                      <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/scan/${s.id}`)}>
                        <td className="py-4 px-6 font-medium text-white/90 truncate max-w-[200px]" title={s.product_name}>{s.product_name}</td>
                        <td className="py-4 px-6 text-white/50 whitespace-nowrap">{formattedDate}</td>
                        <td className="py-4 px-6">
                          <span className="text-white/70 text-xs font-medium">
                            {s.overall_score >= 80 ? 'Excellent' : s.overall_score >= 50 ? 'Moderate' : 'Poor'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(s.overall_score || 0)}`}>
                            {s.overall_score || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white transition-colors">
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4">
                          <HistoryIcon size={24} className="text-white/40" />
                        </div>
                        <h3 className="text-white font-medium text-lg mb-2">No Scans Found</h3>
                        <p className="text-white/40 max-w-sm mx-auto mb-6">
                          {searchTerm ? "No products match your current search criteria." : "You haven't analyzed any products yet. Scan your first nutrition label to get started."}
                        </p>
                        <button 
                          onClick={() => navigate('/scan')}
                          className="px-6 py-2.5 bg-white text-black hover:bg-white/90 rounded-full font-semibold text-sm transition-all"
                        >
                          Scan Product
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
