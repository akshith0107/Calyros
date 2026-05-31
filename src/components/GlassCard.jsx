import { motion } from 'framer-motion';

/**
 * Glassmorphism card with hover effects.
 */
export default function GlassCard({ children, className = '', hoverable = true, ...props }) {
  return (
    <motion.div
      className={`glass-card ${hoverable ? '' : 'glass-card--static'} ${className}`}
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
