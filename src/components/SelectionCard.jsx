import { motion } from 'framer-motion';

/**
 * Text-only selection card for professional SaaS onboarding.
 */
export default function SelectionCard({
  label,
  description,
  selected = false,
  onClick,
  showCheck = false,
}) {
  return (
    <motion.button
      className={`selection-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      animate={selected ? {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
      } : {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      type="button"
      role="option"
      aria-selected={selected}
    >
      {showCheck && (
        <div className="selection-card-check" aria-hidden="true">
          {selected && '✓'}
        </div>
      )}
      <span className="selection-card-label">{label}</span>
      {description && (
        <span className="selection-card-description">
          {description}
        </span>
      )}
    </motion.button>
  );
}
