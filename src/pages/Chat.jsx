import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../services/apiClient';

export default function Chat() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [scanData, setScanData] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (scanId) {
      startChat();
      fetchScanData();
    }
  }, [scanId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchScanData = async () => {
    try {
      const res = await apiClient.get(`/scan/${scanId}`);
      setScanData(res.data);
    } catch (err) {
      console.error("Failed to load scan context", err);
    }
  };

  const startChat = async () => {
    try {
      const res = await apiClient.get(`/chat/history/${scanId}`);
      if (res.data) {
        setSessionId(res.data.id || res.data.session_id);
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const handleSend = async (text) => {
    const userText = text || input;
    if (!userText.trim() || isLoading || !sessionId) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const token = localStorage.getItem('token');
    
    // Add an empty assistant message to stream into
    const assistantMsgId = `stream_${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/chat/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) throw new Error("Stream connection failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              setIsLoading(false);
              return;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                console.error("Stream error:", data.error);
                break;
              }
              if (data.text) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMsgId ? { ...msg, content: msg.content + data.text } : msg
                ));
              }
            } catch (e) {
              // Ignore parse errors from partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const classificationColors = {
    "Excellent": "bg-green-500/20 text-green-400 border-green-500/30",
    "Good": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Moderate": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Limit Consumption": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Avoid Frequent Use": "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const badgeColor = scanData?.analysis?.classification 
    ? classificationColors[scanData.analysis.classification] || "bg-white/10 text-white" 
    : "bg-white/10 text-white";

  const chips = [
    "Can I eat this daily?",
    "Is this good for weight loss?",
    "How much sugar is too much?",
    "Compare this with healthier alternatives."
  ];

  return (
    <main className="dash-main flex flex-col pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md mb-8 relative max-h-[80vh]"
      >
        {/* Pinned Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate(-1)} 
              className="p-3 text-white/50 hover:text-white rounded-full bg-white/5 transition-colors border border-white/5"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div>
                <h1 className="text-white font-medium text-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                  Nutra AI Expert
                </h1>
                <p className="text-white/50 text-sm">Ask anything about your scanned product</p>
              </div>
              
              {/* Product Summary Context Card */}
              {scanData && (
                <div className="md:ml-8 pl-0 md:pl-8 border-l-0 md:border-l border-white/10 flex items-center gap-4">
                  <div>
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-0.5">Current Product</div>
                    <div className="text-white font-medium">{scanData.product_name}</div>
                  </div>
                  <div className="text-center px-3 border-l border-r border-white/10">
                    <div className="text-[var(--color-primary)] font-bold text-lg leading-none">{scanData.analysis?.health_score || '--'}</div>
                    <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-1">Score</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-bold tracking-wider uppercase whitespace-nowrap ${badgeColor}`}>
                    {scanData.analysis?.classification || "Unknown"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-black/20 to-transparent">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-white/40 mt-24 space-y-3">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p className="text-xl text-white/80 font-medium tracking-wide">How can I help you?</p>
              <p className="text-sm">I have full access to your scanned nutrition facts.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-xl ${
                msg.role === 'user' 
                  ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                  : 'bg-[#1a1a1a] border border-white/5 text-gray-200 rounded-bl-none shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
              }`}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips & Input Area */}
        <div className="p-4 sm:p-6 border-t border-white/10 bg-[#0a0a0a] flex flex-col gap-4">
          
          {/* Action Chips */}
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 pt-1 max-w-4xl mx-auto w-full">
            {chips.map(chip => (
              <button
                key={chip}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="shrink-0 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/70 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chip}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center max-w-4xl mx-auto w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ingredients, health goals, or alternatives..."
              className="w-full bg-black border border-white/10 rounded-full py-4 pl-6 pr-16 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_15px_rgba(212,115,30,0.2)] transition-all text-[15px]"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-full text-white disabled:opacity-50 disabled:hover:bg-[var(--color-primary)] disabled:cursor-not-allowed transition-all shadow-md transform hover:scale-105"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
