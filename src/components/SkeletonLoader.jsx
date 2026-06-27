import { motion } from 'framer-motion';

/**
 * Premium Shimmer Skeleton Loader
 */
export default function SkeletonLoader({ width = '100%', height = '16px', borderRadius = '0.5rem', className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#111111] border border-white/[0.05] ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 z-10 w-[200%]"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%)',
        }}
        animate={{ x: ['-100%', '50%'] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1.5
        }}
      />
    </div>
  );
}
