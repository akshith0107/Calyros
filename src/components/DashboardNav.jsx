import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Scan Product', path: '/scan' },
  { label: 'Scan History', path: '/history' },
  { label: 'Recommendations', path: '/recommendations' },
  { label: 'Profile', path: '/profile' },
  { label: 'Settings', path: '/settings' },
];

export default function DashboardNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close profile dropdown on outside click
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
        className={`dash-nav ${scrolled ? 'dash-nav--scrolled' : ''}`}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        {/* Left — Logo */}
        <Link to="/" className="dash-nav-logo" aria-label="Calyros AI Home">
          <div className="dash-nav-logo-icon" aria-hidden="true">C</div>
          <span className="dash-nav-logo-text">Calyros AI</span>
        </Link>

        {/* Center — Links */}
        <div className="dash-nav-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`dash-nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  className="dash-nav-link-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right — Actions */}
        <div className="dash-nav-right">
          {/* Notifications */}
          <button className="dash-nav-icon-btn" aria-label="Notifications" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.5 6.375a4.5 4.5 0 1 0-9 0c0 5.063-2.25 6.375-2.25 6.375h13.5s-2.25-1.313-2.25-6.375"/>
              <path d="M10.298 15.75a1.5 1.5 0 0 1-2.596 0"/>
            </svg>
            <span className="dash-nav-notification-dot" aria-hidden="true" />
          </button>

          {/* Profile */}
          <div className="dash-nav-profile-wrap" ref={profileRef}>
            <button
              className="dash-nav-profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Profile menu"
              aria-expanded={profileOpen}
            >
              <div className="dash-nav-avatar">{user?.full_name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`dash-nav-chevron ${profileOpen ? 'open' : ''}`}>
                <path d="M3 4.5L6 7.5L9 4.5"/>
              </svg>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="dash-nav-dropdown"
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="dash-nav-dropdown-header">
                    <div className="dash-nav-dropdown-name">{user?.full_name || 'User'}</div>
                    <div className="dash-nav-dropdown-email">{user?.email || ''}</div>
                  </div>
                  <div className="dash-nav-dropdown-divider" />
                  <Link to="/dashboard" className="dash-nav-dropdown-item">Dashboard</Link>
                  <Link to="/profile-complete" className="dash-nav-dropdown-item">Profile</Link>
                  <Link to="/dashboard" className="dash-nav-dropdown-item">Settings</Link>
                  <div className="dash-nav-dropdown-divider" />
                  <button onClick={logout} className="dash-nav-dropdown-item dash-nav-dropdown-item--danger w-full text-left bg-transparent border-none">Sign Out</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`dash-nav-mobile-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              role="dialog"
              aria-label="Navigation menu"
            >
              <div style={{ padding: '0 0 16px', borderBottom: '1px solid var(--color-border-primary)', marginBottom: '8px' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)' }}>{user?.full_name || 'User'}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{user?.email || ''}</div>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`mobile-menu-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  style={location.pathname === link.path ? { color: 'var(--color-text-primary)', background: 'var(--color-glass-bg-hover)' } : {}}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border-primary)' }}>
                <button onClick={logout} className="mobile-menu-link w-full text-left bg-transparent border-none p-0" style={{ color: 'var(--color-text-tertiary)' }}>
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
