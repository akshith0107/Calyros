import { motion } from 'framer-motion';

/**
 * Animated progress bar for onboarding steps.
 */
export default function ProgressBar({ progress = 0 }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin="0" aria-valuemax="100">
      <motion.div
        className="progress-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
    </div>
  );
}
