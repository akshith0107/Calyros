import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, Bell, Settings, LogOut, Menu, X, User,
  LayoutDashboard, ScanLine, History, PieChart, ArrowLeftRight, Sparkles, MessageSquare
} from 'lucide-react';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Scan', path: '/scan', icon: ScanLine },
  { label: 'History', path: '/history', icon: History },
  { label: 'Insights', path: '/insights', icon: PieChart },
  { label: 'Compare', path: '/compare', icon: ArrowLeftRight },
  { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
  { label: 'AI Chat', path: '/chat', icon: MessageSquare },
];

export default function DashboardNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const profileRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside click for profile menu
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-[#050505]/50 backdrop-blur-md border-b border-white/[0.04]'
        }`}
      >
        {/* Grain overlay for nav */}
        <div className="absolute inset-0 bg-grain pointer-events-none opacity-50" />
        
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between relative z-10">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center shrink-0 group transition-opacity hover:opacity-80">
            <img src="/logo-white.svg" alt="Calyros AI" className="h-6 md:h-7 w-auto" />
          </Link>

          {/* Center: Desktop Links */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 h-10 flex items-center justify-center text-sm font-medium transition-colors rounded-full ${
                    isActive ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="topNavIndicator"
                      className="absolute inset-0 bg-white/[0.08] rounded-full border border-white/[0.05]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <link.icon size={14} className={isActive ? 'text-[#FFFFFF]' : ''} />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            
            {/* Search */}
            <button className="hidden md:flex items-center justify-center w-9 h-9 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.1]">
              <Search size={18} />
            </button>
            
            {/* Notifications */}
            <button className="flex items-center justify-center w-9 h-9 rounded-full text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors border border-transparent hover:border-white/[0.1] relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </button>

            {/* Desktop Profile Dropdown */}
            <div className="hidden md:block relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-4 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#111] border border-white/[0.1] flex items-center justify-center text-white/80 text-xs font-medium">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-white/90 truncate max-w-[100px]">
                  {user?.full_name?.split(' ')[0] || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl p-2 z-50 origin-top-right overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
                    <div className="relative z-10 px-3 py-3 border-b border-white/[0.05] mb-1">
                      <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-white/40 truncate">{user?.email || ''}</p>
                    </div>
                    <div className="relative z-10 space-y-1">
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors">
                        <Settings size={16} /> Settings
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full text-white/80 hover:text-white hover:bg-white/[0.05]"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-y-0 right-0 w-[280px] bg-[#050505] border-l border-white/[0.08] z-[70] flex flex-col shadow-2xl"
            >
              <div className="absolute inset-0 bg-grain pointer-events-none opacity-30" />
              
              <div className="relative z-10 flex items-center justify-between h-16 px-6 border-b border-white/[0.05]">
                <span className="text-white font-semibold text-sm">Menu</span>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.05] text-white/70 hover:text-white hover:bg-white/[0.1] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-[#FFFFFF]/10 text-white border border-[#FFFFFF]/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <link.icon size={18} className={location.pathname === link.path ? 'text-[#FFFFFF]' : ''} />
                    {link.label}
                  </Link>
                ))}
                
                <div className="my-4 border-t border-white/[0.05]" />
                
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
                  <User size={18} /> Profile
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors">
                  <Settings size={18} /> Settings
                </Link>
              </div>

              <div className="relative z-10 p-4 border-t border-white/[0.05]">
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl font-medium text-sm transition-colors border border-red-500/10"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
