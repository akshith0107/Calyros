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
    <main className="dash-main pt-24 min-h-screen">
      <motion.header
        className="mb-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="dash-welcome-title">Settings</h1>
        <p className="dash-welcome-sub">Manage your account preferences and security.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div className="lg:col-span-2 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          
          {/* Account Info */}
          <GlassCard hoverable={false}>
            <h2 className="dash-card-title mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <div>
                  <div className="text-sm text-gray-400">Email Address</div>
                  <div className="text-white">akshith@example.com</div>
                </div>
                <Button variant="secondary" className="text-xs py-1 px-3">Change</Button>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <div>
                  <div className="text-sm text-gray-400">Password</div>
                  <div className="text-white">••••••••</div>
                </div>
                <Button variant="secondary" className="text-xs py-1 px-3">Update</Button>
              </div>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard hoverable={false}>
            <h2 className="dash-card-title mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-white font-medium group-hover:text-[var(--color-primary)] transition-colors">Scan Results</div>
                  <div className="text-sm text-gray-400">Receive email alerts for high-risk scanned products</div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="block bg-[var(--color-primary)] w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-white font-medium group-hover:text-[var(--color-primary)] transition-colors">Weekly Digest</div>
                  <div className="text-sm text-gray-400">Summary of your nutrition trends and progress</div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" />
                  <div className="block bg-white/20 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </label>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Premium Stub */}
          <GlassCard hoverable={false} className="border-[var(--color-primary)] bg-gradient-to-br from-[#111] to-[rgba(212,115,30,0.1)]">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <h2 className="dash-card-title text-[var(--color-primary)]">NutriMind Premium</h2>
            </div>
            <p className="text-sm text-gray-300 mb-4">Unlock advanced biomarker syncing, unlimited high-res scans, and custom AI persona advice.</p>
            <Button variant="primary" className="w-full text-sm py-2">Upgrade Plan</Button>
          </GlassCard>

          {/* Danger Zone */}
          <GlassCard hoverable={false}>
            <h2 className="dash-card-title mb-4 text-red-500">Security</h2>
            <div className="space-y-4">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 bg-red-900/10 hover:bg-red-900/30 text-red-400 rounded-xl border border-red-900/30 transition-colors"
              >
                Sign Out of All Devices
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  );
}
