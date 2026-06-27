import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanHistory, useProfile } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import InputField from '../components/InputField';
import apiClient from '../services/apiClient';

export default function CompareProducts() {
  const { data: history } = useScanHistory();
  const { data: profileObj } = useProfile();
  
  const [scan1, setScan1] = useState('');
  const [scan2, setScan2] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleCompare = async () => {
    if (!scan1 || !scan2) {
      setError('Please select two products to compare.');
      return;
    }
    if (scan1 === scan2) {
      setError('Please select two different products.');
      return;
    }
    
    setLoading(true);
    setError('');
    setComparison(null);
    setChatHistory([]);
    
    try {
      const { data } = await apiClient.post('/scan/compare', {
        scan_id_1: scan1,
        scan_id_2: scan2
      });
      setComparison(data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to compare products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;
    
    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');
    setChatLoading(true);
    
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/chat/compare_stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          scan_id_1: scan1,
          scan_id_2: scan2,
          message: userMsg.content
        })
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

      let assistantContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') continue;
              const data = JSON.parse(dataStr);
              if (data.done) continue;
              if (data.content) {
                assistantContent += data.content;
                setChatHistory(prev => {
                  const newH = [...prev];
                  newH[newH.length - 1].content = assistantContent;
                  return newH;
                });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'system', content: 'Connection error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const renderMetric = (label, compData) => {
    const renderIndicator = (isBetter) => {
      if (isBetter) return <span className="text-green-400 font-bold ml-2">✓ Better Value</span>;
      return <span className="text-red-400 font-bold ml-2">⚠ Worse Value</span>;
    };
    
    return (
      <div className="grid grid-cols-3 gap-4 py-4 border-b border-white/[0.05] items-center">
        <div className="text-white/50 text-sm font-medium">{label}</div>
        <div className="bg-[#0A0A0A] border border-white/[0.05] p-3 rounded-xl flex justify-between items-center shadow-inner">
          <span className="text-white font-medium">{compData.product_1_value}</span>
          {compData.better_product === "product_1" && renderIndicator(true)}
          {compData.better_product === "product_2" && renderIndicator(false)}
        </div>
        <div className="bg-[#0A0A0A] border border-white/[0.05] p-3 rounded-xl flex justify-between items-center shadow-inner">
          <span className="text-white font-medium">{compData.product_2_value}</span>
          {compData.better_product === "product_2" && renderIndicator(true)}
          {compData.better_product === "product_1" && renderIndicator(false)}
        </div>
        {compData.reason && (
          <div className="col-span-3 text-xs text-white/40 mt-1 pl-1 italic">
            Reason: {compData.reason}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-16 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Product Comparison</h1>
        <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">Intelligently compare two products based on your {profileObj?.profile?.health_goal?.replace('-', ' ')} goal.</p>
      </motion.div>

      <GlassCard className="relative z-20 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 tracking-wide">Select Product A</label>
            <div className="relative">
              <select 
                className="w-full bg-[#0A0A0A] border border-white/[0.1] rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]/30 transition-all cursor-pointer hover:bg-white/[0.02]"
                value={scan1}
                onChange={(e) => setScan1(e.target.value)}
              >
                <option value="">-- Choose Product --</option>
                {history?.map(s => <option key={`a-${s.id}`} value={s.id}>{s.product_name || "Unknown Product"} ({new Date(s.created_at).toLocaleDateString()})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70 tracking-wide">Select Product B</label>
            <div className="relative">
              <select 
                className="w-full bg-[#0A0A0A] border border-white/[0.1] rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]/30 transition-all cursor-pointer hover:bg-white/[0.02]"
                value={scan2}
                onChange={(e) => setScan2(e.target.value)}
              >
                <option value="">-- Choose Product --</option>
                {history?.map(s => <option key={`b-${s.id}`} value={s.id}>{s.product_name || "Unknown Product"} ({new Date(s.created_at).toLocaleDateString()})</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
        
        {error && <div className="mt-6 text-red-400 text-sm font-medium">{error}</div>}
        
        <div className="mt-8 flex justify-end border-t border-white/[0.05] pt-6">
          <Button variant="primary" onClick={handleCompare} disabled={loading} className="px-8 py-3 rounded-full font-bold">
            {loading ? 'Comparing...' : 'Compare Products'}
          </Button>
        </div>
      </GlassCard>

      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Winner Banner */}
            <GlassCard className={`border-l-4 ${comparison.winner === 'product_1' || comparison.winner === 'product_2' ? 'border-[#FFFFFF]' : 'border-gray-500'} overflow-hidden relative p-8`}>
              <div className="absolute top-0 right-0 p-6 opacity-10 blur-xl">
                <svg className="w-48 h-48 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6 relative z-10">
                {comparison.winner === 'tie' ? "It's a Tie!" : `Winner: ${comparison.winner === 'product_1' ? comparison.product_1_name : comparison.product_2_name}`}
              </h2>
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-[#050505] rounded-xl border border-white/[0.05] shadow-inner">
                  <h3 className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider mb-3">Why Calyros Chose This Product</h3>
                  <p className="text-white/80 leading-relaxed text-sm">{comparison.reasoning}</p>
                </div>
                <div className="p-5 bg-[#050505] rounded-xl border border-white/[0.05] shadow-inner">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Personalized For You</h3>
                  <p className="text-white/80 leading-relaxed text-sm">{comparison.personalized_recommendation}</p>
                </div>
              </div>
            </GlassCard>

            {/* Side-by-Side UI */}
            <GlassCard className="p-8">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div></div>
                <div className="text-xl font-bold text-white text-center p-4 bg-[#0A0A0A] rounded-2xl border border-white/[0.08] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  {comparison.product_1_name}
                </div>
                <div className="text-xl font-bold text-white text-center p-4 bg-[#0A0A0A] rounded-2xl border border-white/[0.08] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  {comparison.product_2_name}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                {renderMetric("Nutrition", comparison.nutrition_comparison)}
                {renderMetric("Ingredient Quality", comparison.ingredient_comparison)}
                {renderMetric("Processing", comparison.processing_comparison)}
                {renderMetric("Allergy Safety", comparison.allergy_comparison)}
              </div>
            </GlassCard>

            {/* Strengths / Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">{comparison.product_1_name}</h3>
                <div className="space-y-6">
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center tracking-wide"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Strengths</h4>
                    <ul className="space-y-2">
                      {comparison.strengths_product_1.map((s, i) => <li key={i} className="text-sm text-white/80 flex items-start gap-2"><span className="text-green-500 mt-1">•</span>{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center tracking-wide"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Weaknesses</h4>
                    <ul className="space-y-2">
                      {comparison.weaknesses_product_1.map((s, i) => <li key={i} className="text-sm text-white/80 flex items-start gap-2"><span className="text-red-500 mt-1">•</span>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">{comparison.product_2_name}</h3>
                <div className="space-y-6">
                  <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-5">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center tracking-wide"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Strengths</h4>
                    <ul className="space-y-2">
                      {comparison.strengths_product_2.map((s, i) => <li key={i} className="text-sm text-white/80 flex items-start gap-2"><span className="text-green-500 mt-1">•</span>{s}</li>)}
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center tracking-wide"><svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Weaknesses</h4>
                    <ul className="space-y-2">
                      {comparison.weaknesses_product_2.map((s, i) => <li key={i} className="text-sm text-white/80 flex items-start gap-2"><span className="text-red-500 mt-1">•</span>{s}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Chat Integration */}
            <GlassCard className="flex flex-col h-[500px] border border-[#FFFFFF]/20 p-0 overflow-hidden mt-8">
              <div className="p-5 border-b border-white/[0.05] bg-black/40 backdrop-blur-md">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Ask Calyros AI
                </h3>
              </div>
              
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar" ref={chatEndRef}>
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm italic">
                    Ask a question about these two products...<br/>"Which one is better for weight loss?"
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-[#FFFFFF] text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                        : 'bg-white/[0.05] text-white/90 border border-white/[0.08]'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content || (msg.role === 'assistant' && chatLoading && i === chatHistory.length - 1 ? <span className="animate-pulse">...</span> : '')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleChatSubmit} className="p-4 bg-black/40 border-t border-white/[0.05]">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about these products..."
                    className="w-full bg-[#0A0A0A] border border-white/[0.1] rounded-full px-6 py-4 text-white text-sm focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF] transition-all duration-300 pr-14 placeholder-white/30"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={!chatMessage.trim() || chatLoading}
                    className="absolute right-2 p-2.5 bg-[#FFFFFF] hover:bg-[#DDDDDD] disabled:opacity-50 disabled:hover:bg-[#FFFFFF] text-black rounded-full transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
