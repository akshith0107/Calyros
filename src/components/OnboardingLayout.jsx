import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import ProgressBar from './ProgressBar';
import Button from './Button';
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
    <div className="onboarding-page">
      <Navbar variant="onboarding" />

      <div className="onboarding-header">
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
