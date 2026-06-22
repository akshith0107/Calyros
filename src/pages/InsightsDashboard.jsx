import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import HealthScoreRing from '../components/HealthScoreRing';
import apiClient from '../services/apiClient';

export default function InsightsDashboard() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/scan/insights/dashboard');
      setInsights(data.data);
    } catch (err) {
      setError("Failed to load insights. Make sure you have scanned products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const sendGlobalChat = async (e) => {
    e?.preventDefault();
    if (!chatMessage.trim() || isTyping) return;
    
    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);
    
    setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiClient.defaults.baseURL}/chat/global_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (let line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                break;
              } else if (data.content) {
                setChatHistory(prev => {
                  const newH = [...prev];
                  newH[newH.length - 1].content += data.content;
                  return newH;
                });
              }
            } catch (err) {
              console.error('JSON parse error', err);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 md:px-8">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !insights || insights.scan_statistics.total_scans === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 mb-6 text-[var(--color-primary)] opacity-50">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">No Data Available</h1>
        <p className="text-white/60 mb-8 max-w-md">You haven't scanned any products yet. Scan a few items to unlock your personalized Nutrition Insights.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">Nutrition Insights</h1>
        <p className="text-white/60 text-lg">Your personalized health and consumption trends based on {insights.scan_statistics.total_scans} scans.</p>
      </motion.div>

      {/* Row 1: High Level Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Average Health Score</h3>
          <HealthScoreRing score={insights.average_health_score} size={160} strokeWidth={8} />
          <p className="text-white/50 text-sm mt-4">Across all your scans</p>
        </GlassCard>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlassCard className="p-6 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div>
              <h3 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-2">Healthiest Product</h3>
              <h2 className="text-2xl text-white font-bold leading-tight">{insights.healthiest_product?.name || "None"}</h2>
            </div>
            <div className="mt-4 text-emerald-400 font-bold text-4xl">{insights.healthiest_product?.score || 0}<span className="text-sm font-normal text-emerald-500/50">/100</span></div>
          </GlassCard>

          <GlassCard className="p-6 border-l-4 border-l-red-500 flex flex-col justify-between">
            <div>
              <h3 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-2">Least Healthy Product</h3>
              <h2 className="text-2xl text-white font-bold leading-tight">{insights.least_healthy_product?.name || "None"}</h2>
            </div>
            <div className="mt-4 text-red-400 font-bold text-4xl">{insights.least_healthy_product?.score || 0}<span className="text-sm font-normal text-red-500/50">/100</span></div>
          </GlassCard>
          
          <GlassCard className="p-6 sm:col-span-2 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex-1 w-full">
               <h3 className="text-white/60 text-xs font-bold tracking-widest uppercase mb-4">Scan Distribution</h3>
               <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
                 <div style={{width: `${(insights.scan_statistics.excellent_products / insights.scan_statistics.total_scans) * 100}%`}} className="h-full bg-emerald-500"></div>
                 <div style={{width: `${(insights.scan_statistics.good_products / insights.scan_statistics.total_scans) * 100}%`}} className="h-full bg-green-400"></div>
                 <div style={{width: `${(insights.scan_statistics.moderate_products / insights.scan_statistics.total_scans) * 100}%`}} className="h-full bg-yellow-500"></div>
                 <div style={{width: `${(insights.scan_statistics.poor_products / insights.scan_statistics.total_scans) * 100}%`}} className="h-full bg-red-500"></div>
               </div>
               <div className="flex justify-between mt-2 text-[10px] text-white/50 uppercase tracking-wider">
                 <span className="text-emerald-500">Excellent ({insights.scan_statistics.excellent_products})</span>
                 <span className="text-green-400">Good ({insights.scan_statistics.good_products})</span>
                 <span className="text-yellow-500">Moderate ({insights.scan_statistics.moderate_products})</span>
                 <span className="text-red-500">Poor ({insights.scan_statistics.poor_products})</span>
               </div>
             </div>
          </GlassCard>
        </div>
      </div>

      {/* Row 2: AI Trends & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-t-2 border-t-[var(--color-primary)]">
          <h3 className="text-[var(--color-primary)] text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Personalized Trends
          </h3>
          <ul className="space-y-4">
            {insights.personalized_trends.map((t, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 text-sm bg-white/5 p-4 rounded-lg">
                <span className="text-[var(--color-primary)] mt-0.5">•</span> {t}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-t-2 border-t-yellow-500">
          <h3 className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Improvement Opportunities
          </h3>
          <ul className="space-y-4">
            {insights.improvement_opportunities?.map((o, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 text-sm bg-yellow-500/5 border border-yellow-500/10 p-4 rounded-lg">
                <span className="text-yellow-400 mt-0.5">!</span> {o}
              </li>
            ))}
            {(!insights.improvement_opportunities || insights.improvement_opportunities.length === 0) && (
              <li className="text-white/40 text-sm">No opportunities identified yet.</li>
            )}
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-t-2 border-t-blue-500">
          <h3 className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recommendations
          </h3>
          <ul className="space-y-4">
            {insights.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-white/90 text-sm bg-blue-500/5 border border-blue-500/10 p-4 rounded-lg">
                <span className="text-blue-400 mt-0.5">✓</span> {r}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Row 3: Insights Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-4">Top Positive Factors</h3>
          <ul className="space-y-2">
            {insights.most_common_positive_factors.map((p, i) => (
              <li key={i} className="text-sm text-white/80 border-b border-white/5 pb-2 last:border-0 truncate" title={p}>{i+1}. {p}</li>
            ))}
            {insights.most_common_positive_factors.length === 0 && <li className="text-white/40 text-sm">No data yet.</li>}
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-red-400 text-xs font-bold tracking-widest uppercase mb-4">Most Frequent Concerns</h3>
          <ul className="space-y-2">
            {insights.most_common_concerns.map((c, i) => (
              <li key={i} className="text-sm text-white/80 border-b border-white/5 pb-2 last:border-0 truncate" title={c}>{i+1}. {c}</li>
            ))}
            {insights.most_common_concerns.length === 0 && <li className="text-white/40 text-sm">No data yet.</li>}
          </ul>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h3 className="text-orange-400 text-xs font-bold tracking-widest uppercase mb-4">Top Ingredient Issues</h3>
          <ul className="space-y-2">
            {insights.top_ingredient_patterns?.map((issue, i) => (
              <li key={i} className="text-sm text-white/80 border-b border-white/5 pb-2 last:border-0 truncate" title={issue}>{i+1}. {issue}</li>
            ))}
            {(!insights.top_ingredient_patterns || insights.top_ingredient_patterns.length === 0) && <li className="text-white/40 text-sm">No issues found.</li>}
          </ul>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-4">Processing Trend</h3>
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <span className="text-3xl font-bold text-white mb-2 leading-tight">{insights.average_processing_level}</span>
            <span className="text-xs text-white/40 uppercase tracking-widest">Most Frequent</span>
          </div>
        </GlassCard>
      </div>

      {/* Row 4: Global Chat */}
      <GlassCard className="flex flex-col h-[500px] border border-[var(--color-primary)]/20">
        <div className="p-4 border-b border-white/10 bg-black/40">
          <h3 className="text-white font-medium flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Discuss Your Trends with Nutra AI
          </h3>
          <p className="text-xs text-white/50 mt-1">Ask questions like "How can I improve my nutrition habits?" or "Analyze my scan history."</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatScrollRef}>
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40 text-sm italic">
              Send a message to start analyzing your history...
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(212,115,30,0.2)]' 
                    : 'bg-white/10 text-white/90 border border-white/5'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content || (msg.role === 'assistant' && isTyping && idx === chatHistory.length - 1 ? <span className="animate-pulse">...</span> : '')}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <form onSubmit={sendGlobalChat} className="p-4 bg-black/40 border-t border-white/10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about your scan history..."
              disabled={isTyping}
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors pr-14"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim() || isTyping}
              className="absolute right-2 p-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:hover:bg-[var(--color-primary)] text-white rounded-full transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </GlassCard>

    </div>
  );
}
