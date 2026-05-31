import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import Navbar from '../components/Navbar';
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
    clearData();
    navigate('/login');
  };

  return (
    <div className="profile-complete">
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
