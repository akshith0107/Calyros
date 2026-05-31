/**
 * Shimmer skeleton loader for premium loading states.
 */
export default function SkeletonLoader({ width = '100%', height = '16px', borderRadius, className = '' }) {
  return (
    <div
      className={`skeleton animate-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius || 'var(--radius-sm)',
      }}
      aria-hidden="true"
    />
  );
}
