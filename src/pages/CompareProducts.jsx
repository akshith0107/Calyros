import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScanHistory, useProfile } from '../hooks/useDashboardData';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
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
      <div className="grid grid-cols-3 gap-4 py-4 border-b border-white/5 items-center">
        <div className="text-gray-400 text-sm font-medium">{label}</div>
        <div className="bg-[#1a1a1a] p-3 rounded-lg flex justify-between items-center">
          <span className="text-white">{compData.product_1_value}</span>
          {compData.better_product === "product_1" && renderIndicator(true)}
          {compData.better_product === "product_2" && renderIndicator(false)}
        </div>
        <div className="bg-[#1a1a1a] p-3 rounded-lg flex justify-between items-center">
          <span className="text-white">{compData.product_2_value}</span>
          {compData.better_product === "product_2" && renderIndicator(true)}
          {compData.better_product === "product_1" && renderIndicator(false)}
        </div>
        {compData.reason && (
          <div className="col-span-3 text-xs text-gray-500 mt-1 pl-1">
            Reason: {compData.reason}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="pt-24 pb-16 px-6 max-w-5xl mx-auto min-h-screen">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Product Comparison</h1>
        <p className="text-gray-400">Intelligently compare two products based on your {profileObj?.profile?.health_goal?.replace('-', ' ')} goal.</p>
      </motion.header>

      <GlassCard className="mb-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Product A</label>
            <select 
              className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              value={scan1}
              onChange={(e) => setScan1(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {history?.map(s => <option key={`a-${s.id}`} value={s.id}>{s.product_name || "Unknown Product"} ({new Date(s.created_at).toLocaleDateString()})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Product B</label>
            <select 
              className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
              value={scan2}
              onChange={(e) => setScan2(e.target.value)}
            >
              <option value="">-- Choose Product --</option>
              {history?.map(s => <option key={`b-${s.id}`} value={s.id}>{s.product_name || "Unknown Product"} ({new Date(s.created_at).toLocaleDateString()})</option>)}
            </select>
          </div>
        </div>
        
        {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={handleCompare} disabled={loading}>
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
            className="space-y-8"
          >
            {/* Winner Banner */}
            <GlassCard className={`border-l-4 ${comparison.winner === 'product_1' || comparison.winner === 'product_2' ? 'border-[var(--color-primary)]' : 'border-gray-500'} overflow-hidden relative`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {comparison.winner === 'tie' ? "It's a Tie!" : `Winner: ${comparison.winner === 'product_1' ? comparison.product_1_name : comparison.product_2_name}`}
              </h2>
              <div className="mt-4 p-4 bg-[#141414] rounded-lg border border-white/5">
                <h3 className="text-sm font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-2">Why Calyros Chose This Product</h3>
                <p className="text-gray-300 leading-relaxed">{comparison.reasoning}</p>
                
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mt-4 mb-2">Personalized For You</h3>
                <p className="text-gray-300 leading-relaxed">{comparison.personalized_recommendation}</p>
              </div>
            </GlassCard>

            {/* Side-by-Side UI */}
            <GlassCard>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div></div>
                <div className="text-lg font-bold text-white text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/5 shadow-inner">
                  {comparison.product_1_name}
                </div>
                <div className="text-lg font-bold text-white text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/5 shadow-inner">
                  {comparison.product_2_name}
                </div>
              </div>
              
              <div className="flex flex-col">
                {renderMetric("Nutrition", comparison.nutrition_comparison)}
                {renderMetric("Ingredient Quality", comparison.ingredient_comparison)}
                {renderMetric("Processing", comparison.processing_comparison)}
                {renderMetric("Allergy Safety", comparison.allergy_comparison)}
              </div>
            </GlassCard>

            {/* Strengths / Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4 text-center">{comparison.product_1_name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Strengths</h4>
                    <ul className="space-y-1">
                      {comparison.strengths_product_1.map((s, i) => <li key={i} className="text-sm text-gray-400 ml-6 list-disc">{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Weaknesses</h4>
                    <ul className="space-y-1">
                      {comparison.weaknesses_product_1.map((s, i) => <li key={i} className="text-sm text-gray-400 ml-6 list-disc">{s}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>
              <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4 text-center">{comparison.product_2_name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-green-400 font-semibold mb-2 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Strengths</h4>
                    <ul className="space-y-1">
                      {comparison.strengths_product_2.map((s, i) => <li key={i} className="text-sm text-gray-400 ml-6 list-disc">{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Weaknesses</h4>
                    <ul className="space-y-1">
                      {comparison.weaknesses_product_2.map((s, i) => <li key={i} className="text-sm text-gray-400 ml-6 list-disc">{s}</li>)}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Chat Integration */}
            <GlassCard>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Ask Calyros AI
              </h3>
              <div className="bg-[#141414] rounded-lg p-4 h-64 overflow-y-auto mb-4 border border-white/5">
                {chatHistory.length === 0 && (
                  <div className="text-gray-500 text-sm text-center mt-10">Ask a question about these two products...<br/>"Which one is better for weight loss?"</div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                        : 'bg-white/5 border border-white/10 text-gray-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about these products..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                  disabled={chatLoading}
                />
                <Button type="submit" variant="primary" className="!rounded-full px-6" disabled={chatLoading}>
                  Send
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
