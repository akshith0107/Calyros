import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ProgressBar from './ProgressBar';
import Button from './Button';
import Noise from './Noise';
import { useOnboardingStore } from '../hooks/useOnboardingStore';

/**
 * Shared layout wrapper for all onboarding screens.
 */
export default function OnboardingLayout({
  step,
  title,
  description,
  children,
  canContinue = true,
  onContinue,
}) {
  const navigate = useNavigate();
  const { getPrevStep, getStepNumber, totalSteps, progress, markStepComplete, getNextStep } = useOnboardingStore();

  const prevStep = getPrevStep(step);
  const stepNum = getStepNumber(step);
  const progressValue = progress(step);

  const handleContinue = () => {
    markStepComplete(step);
    if (onContinue) {
      onContinue();
    } else {
      const next = getNextStep(step);
      if (next) {
        navigate(`/onboarding/${next}`);
      } else {
        navigate('/profile-complete');
      }
    }
  };

  const handleBack = () => {
    if (prevStep) {
      navigate(`/onboarding/${prevStep}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="onboarding-page relative z-0">
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

      <div className="onboarding-header relative z-10">
        <div className="onboarding-nav">
          <button className="onboarding-back" onClick={handleBack} aria-label="Go back">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <span className="onboarding-step-label">Step {stepNum} of {totalSteps}</span>
        </div>
        <ProgressBar progress={progressValue} />
      </div>

      <motion.div
        className="onboarding-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      >
        <motion.h1
          className="onboarding-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          {title}
        </motion.h1>

        {description && (
          <motion.p
            className="onboarding-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {description}
          </motion.p>
        )}

        <motion.div
          style={{ width: '100%' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          {children}
        </motion.div>
      </motion.div>

      <div className="onboarding-footer">
        <Button
          variant="primary"
          size="large"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
