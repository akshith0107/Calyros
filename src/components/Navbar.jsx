import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ variant = 'default' }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <Link to="/" className="navbar-logo" aria-label="NutriMind AI Home">
          <div className="navbar-logo-icon" aria-hidden="true">N</div>
          NutriMind AI
        </Link>

        {variant === 'default' && (
          <div className="navbar-links">
            <Link to="/#features" className="navbar-link">Features</Link>
            <Link to="/#about" className="navbar-link">About</Link>
            <Link to="/login" className="navbar-link">Sign In</Link>
            <Link to="/onboarding/age" className="navbar-cta">Get Started</Link>
          </div>
        )}

        {variant === 'default' && (
          <button
            className={`navbar-mobile-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
          </button>
        )}

        {variant === 'onboarding' && (
          <div className="navbar-links">
            <Link to="/" className="navbar-link">Home</Link>
          </div>
        )}
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
              <Link to="/#features" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Features</Link>
              <Link to="/#about" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>About</Link>
              <Link to="/login" className="mobile-menu-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/onboarding/age" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
