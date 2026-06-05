import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../services/apiClient';

export default function Chat() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (scanId && !sessionId) {
      startChat();
    }
  }, [scanId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startChat = async () => {
    try {
      // Fetch or start chat history
      const res = await apiClient.get(`/chat/history/${scanId}`);
      if (res.data) {
        setSessionId(res.data.id || res.data.session_id); // Fallback depending on schema changes
        setMessages(res.data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiClient.post(`/chat/${sessionId}/message`, { message: userMessage.content });
      setMessages(prev => [...prev, res.data]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="dash-main flex flex-col pt-24 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md mb-8 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/60">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 text-white/50 hover:text-white rounded-full bg-white/5 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div>
              <h1 className="text-white font-medium text-xl flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Nutra AI
              </h1>
              <p className="text-white/50 text-sm">Ask anything about your scanned product</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-white/40 mt-20 space-y-3">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p className="text-lg">No messages yet.</p>
              <p className="text-sm">Try asking: "Is this safe for diabetics?" or "Are there healthier alternatives?"</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-[var(--color-primary)] text-white rounded-br-none' 
                  : 'bg-white/10 text-white/90 rounded-bl-none backdrop-blur-sm'
              }`}>
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm text-white/90 rounded-2xl rounded-bl-none px-5 py-4 flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 border-t border-white/10 bg-black/40">
          <div className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about ingredients, health goals, or alternatives..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-16 text-white placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)] focus:bg-white/10 transition-all text-[15px]"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-full text-white disabled:opacity-50 disabled:hover:bg-[var(--color-primary)] disabled:cursor-not-allowed transition-colors shadow-md"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </motion.div>
    </main>
  );
}
