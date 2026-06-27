import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import apiClient from '../services/apiClient';

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete apiClient.defaults.headers.common['Authorization'];
    navigate('/');
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-16 space-y-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-[rgba(255,255,255,0.48)] text-sm font-medium">Manage your account preferences and security.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          
          {/* Account Info */}
          <GlassCard hoverable={false} className="p-8 border-white/[0.05]">
            <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/[0.05] flex items-center">
              <svg className="w-5 h-5 mr-3 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 px-5 bg-[#0A0A0A] rounded-2xl border border-white/[0.05]">
                <div className="mb-3 sm:mb-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1">Email Address</div>
                  <div className="text-white font-medium">akshith@example.com</div>
                </div>
                <Button variant="secondary" className="text-xs py-2 px-6 rounded-full">Change Email</Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 px-5 bg-[#0A0A0A] rounded-2xl border border-white/[0.05]">
                <div className="mb-3 sm:mb-0">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-white/50 mb-1">Password</div>
                  <div className="text-white font-medium">••••••••</div>
                </div>
                <Button variant="secondary" className="text-xs py-2 px-6 rounded-full">Update Password</Button>
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard hoverable={false} className="p-8 border-white/[0.05]">
            <h2 className="text-xl font-bold text-white mb-6 pb-2 border-b border-white/[0.05] flex items-center">
              <svg className="w-5 h-5 mr-3 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group py-4 px-5 bg-[#0A0A0A] rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                <div>
                  <div className="text-white font-medium group-hover:text-[#FFFFFF] transition-colors">Scan Results Alerts</div>
                  <div className="text-xs text-white/50 mt-1">Receive email alerts for high-risk scanned products</div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-[#FFFFFF] w-12 h-7 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform translate-x-5 shadow-sm"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group py-4 px-5 bg-[#0A0A0A] rounded-2xl border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                <div>
                  <div className="text-white font-medium group-hover:text-[#FFFFFF] transition-colors">Weekly Digest</div>
                  <div className="text-xs text-white/50 mt-1">Summary of your nutrition trends and progress</div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="block bg-white/10 w-12 h-7 rounded-full border border-white/10"></div>
                  <div className="dot absolute left-1 top-1 bg-white/40 w-5 h-5 rounded-full transition shadow-sm"></div>
                </div>
              </label>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Premium Stub */}
          <GlassCard hoverable={false} className="p-8 border-[#FFFFFF]/40 bg-gradient-to-br from-[#050505] to-[#FFFFFF]/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FFFFFF]/10 blur-[40px] rounded-full"></div>
            <div className="flex items-center space-x-3 mb-4 relative z-10">
              <div className="bg-[#FFFFFF]/10 p-2 rounded-lg border border-[#FFFFFF]/20">
                <svg className="w-5 h-5 text-[#FFFFFF]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Calyros <span className="text-[#FFFFFF]">Premium</span></h2>
            </div>
            <p className="text-sm text-white/70 mb-6 relative z-10 leading-relaxed">Unlock advanced biomarker syncing, unlimited high-res scans, and custom AI persona advice.</p>
            <Button variant="primary" className="w-full text-sm py-3 rounded-full font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">Upgrade Plan</Button>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard hoverable={false} className="p-8 border-red-500/20 bg-gradient-to-br from-[#050505] to-red-900/5">
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center pb-2 border-b border-red-500/10">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Security
            </h2>
            <div className="space-y-4">
              <button 
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-medium rounded-full border border-red-500/20 hover:border-red-500/40 transition-all"
              >
                Sign Out of All Devices
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
