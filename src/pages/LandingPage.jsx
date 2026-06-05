import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import DNAParticleSystem from '../components/DNAParticleSystem';

import Noise from '../components/Noise';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
};

const features = [
  {
    icon: '🔬',
    title: 'AI-Powered Analysis',
    description: 'Scan any food product and get instant nutritional breakdown powered by advanced AI models.',
  },
  {
    icon: '🎯',
    title: 'Personalized Insights',
    description: 'Get tailored recommendations based on your health profile, goals, and dietary preferences.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Scoring',
    description: 'Understand food quality at a glance with our proprietary health scoring system.',
  },
  {
    icon: '🔄',
    title: 'Smart Alternatives',
    description: 'Discover healthier substitutes for any product, matched to your specific needs.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Monitor your nutritional habits over time and see measurable health improvements.',
  },
  {
    icon: '🛡️',
    title: 'Allergen Detection',
    description: 'Automatic detection and alerts for ingredients that conflict with your dietary restrictions.',
  },
];

export default function LandingPage() {
  return (
    <div>
      <style>{`
        /* Hide global particles on this page */
        .particle-canvas {
          display: none !important;
        }
        
        .landing-exclusive-bg {
          position: fixed;
          inset: 0;
          background-color: #050505;
          z-index: -3;
          overflow: hidden;
        }

        .landing-organic-layer {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          animation: organicDrift 25s infinite alternate ease-in-out;
        }

        .layer-1 {
          background: #151515;
          width: 80vw;
          height: 80vh;
          top: -20%;
          left: -10%;
          animation-duration: 28s;
        }

        .layer-2 {
          background: #0A0A0A;
          width: 90vw;
          height: 90vh;
          bottom: -20%;
          right: -20%;
          animation-duration: 35s;
          animation-direction: alternate-reverse;
        }

        .layer-3 {
          background: #101010;
          width: 60vw;
          height: 60vh;
          top: 30%;
          left: 40%;
          animation-duration: 40s;
        }

        @keyframes organicDrift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.05); }
          100% { transform: translate(-2%, 8%) scale(0.95); }
        }
      `}</style>
      
      {/* Tubes Cursor removed */}
      
      <div className="landing-exclusive-bg">
        <div className="landing-organic-layer layer-1"></div>
        <div className="landing-organic-layer layer-2"></div>
        <div className="landing-organic-layer layer-3"></div>
      </div>
      <Noise opacity={0.06} />
      <Navbar />

      {/* Hero */}
      <section className="landing-hero" id="hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="landing-hero-grid">
          {/* Left Column: Text & CTA */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="landing-hero-content"
          >
            <motion.div variants={itemVariants} className="landing-badge">
              <span className="landing-badge-dot" />
              AI-Powered Nutrition
            </motion.div>

            <motion.h1 variants={itemVariants} className="landing-headline">
              <span>Know Exactly</span>{' '}
              <span>What You're</span>{' '}
              <span>Eating.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="landing-subheadline">
              AI-powered nutrition intelligence personalized to your health profile.
            </motion.p>

            <motion.div variants={itemVariants} className="landing-cta-group">
              <Button variant="primary" size="large" onClick={() => {
                try {
                  localStorage.removeItem('nutrimind_onboarding');
                } catch (e) {}
                window.location.href = '/onboarding/age';
              }}>Get Started</Button>
            </motion.div>
          </motion.div>

          {/* Right Column: DNA Particle System */}
          <div className="landing-hero-visual">
             <DNAParticleSystem />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-features-title">Everything You Need</h2>
          <p className="landing-features-subtitle">
            A complete nutrition intelligence platform designed to help you make
            informed decisions about every meal.
          </p>
        </motion.div>

        <div className="landing-features-grid">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <GlassCard className="feature-card">
                <div className="feature-card-icon">{feature.icon}</div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-description">{feature.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="landing-cta-section">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="landing-cta-title">Ready to Get Started?</h2>
          <p className="landing-cta-subtitle">
            Join thousands of users making smarter nutrition decisions every day.
          </p>
          <Button variant="primary" size="large" onClick={() => {
            try {
              localStorage.removeItem('nutrimind_onboarding');
            } catch (e) {}
            window.location.href = '/onboarding/age';
          }}>Start Your Profile</Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-footer-text">
          © 2026 Calyros AI. All rights reserved.
        </span>
        <div className="landing-footer-links">
          <a href="#" className="landing-footer-link">Privacy</a>
          <a href="#" className="landing-footer-link">Terms</a>
          <a href="#" className="landing-footer-link">Contact</a>
        </div>
      </footer>
    </div>
  );
}
