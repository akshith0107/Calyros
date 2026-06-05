import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
import Noise from '../components/Noise';
import { useOnboardingStore } from '../hooks/useOnboardingStore';

const labelMap = {
  age: 'Age',
  gender: 'Gender',
  height: 'Height',
  weight: 'Weight',
  health: 'Health Conditions',
  allergies: 'Allergies',
  goals: 'Primary Goal',
  activity: 'Activity Level',
  diet: 'Diet Preference',
  alternatives: 'Smart Alternatives',
};

function formatValue(key, value, data) {
  if (Array.isArray(value)) {
    return value.map(v => v.charAt(0).toUpperCase() + v.slice(1).replace(/-/g, ' ')).join(', ');
  }
  if (key === 'height') return `${value} ${data.heightUnit}`;
  if (key === 'weight') return `${value} ${data.weightUnit}`;
  if (typeof value === 'string') {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  }
  return String(value);
}

export default function ProfileComplete() {
  const navigate = useNavigate();
  const { data, clearData } = useOnboardingStore();

  const summaryFields = ['age', 'gender', 'height', 'weight', 'health', 'allergies', 'goals', 'activity', 'diet', 'alternatives'];

  const handleContinue = () => {
    // Navigate to login WITH the onboarding data preserved in localStorage
    navigate('/login');
  };

  return (
    <div className="profile-complete relative z-0">
      <style>{`
        /* Hide global particles on this page */
        .particle-canvas {
          display: none !important;
        }

        /* Premium matte-black base */
        .onboarding-exclusive-bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(180deg, #050505 0%, #111111 50%, #0A0A0A 100%);
          z-index: -4;
        }

        /* Geometric grid background */
        .onboarding-exclusive-grid {
          position: fixed;
          inset: 0;
          z-index: -3;
          pointer-events: none;
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 20%, transparent 100%);
        }

        /* Ambient subtle white glow */
        .onboarding-exclusive-glow {
          position: fixed;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60vw;
          height: 60vh;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 60%);
          filter: blur(80px);
          z-index: -2;
          pointer-events: none;
          animation: onboardingBreathe 8s ease-in-out infinite alternate;
        }

        @keyframes onboardingBreathe {
          0% { opacity: 0.6; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>

      <div className="onboarding-exclusive-bg" />
      <Noise opacity={0.04} />
      <div className="onboarding-exclusive-grid" />
      <div className="onboarding-exclusive-glow" />

      <Navbar variant="onboarding" />

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="profile-check-icon"
      >
        ✓
      </motion.div>

      <motion.h1
        className="profile-complete-title"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Profile Completed
      </motion.h1>

      <motion.p
        className="profile-complete-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        Your personalized nutrition profile is ready. Here's a summary of your preferences.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <GlassCard className="profile-summary-card" hoverable={false}>
          {summaryFields.map((key) => {
            const value = data[key];
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            return (
              <div className="profile-summary-row" key={key}>
                <span className="profile-summary-label">{labelMap[key]}</span>
                <span className="profile-summary-value">{formatValue(key, value, data)}</span>
              </div>
            );
          })}
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Button variant="primary" size="large" onClick={handleContinue}>
          Continue to Sign In
        </Button>
      </motion.div>
    </div>
  );
}
