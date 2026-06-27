import { motion } from 'framer-motion';

/**
 * Premium Bento Glassmorphism Card
 */
export default function GlassCard({ children, className = '', hoverable = true, ...props }) {
  return (
    <motion.div
      className={`relative bg-[#080808] border border-white/[0.15] rounded-[24px] overflow-hidden group transition-all duration-500 shadow-[0_0_15px_rgba(255,255,255,0.03)] ${
        hoverable ? 'hover:border-white/[0.25] hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]' : ''
      } ${className}`}
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...props}
    >
      <div className="absolute inset-0 bg-grain pointer-events-none" />
      {/* Subtle Purple card hover glow */}
      {hoverable && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      )}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
