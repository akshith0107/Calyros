import { motion } from 'framer-motion';

/**
 * Premium button with refined Tailwind aesthetics.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full overflow-hidden group";
  
  const sizeClasses = {
    small: "px-4 py-2 text-xs",
    default: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-sm tracking-wide"
  };

  const variantClasses = {
    primary: "bg-[#0A0A0A] text-white border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.2] shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.15)] backdrop-blur-md",
    secondary: "bg-transparent border border-white/[0.15] text-[rgba(255,255,255,0.8)] hover:text-white hover:border-white/[0.3] hover:bg-white/[0.03]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
  };

  const classes = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {/* Ripple effect overlay on click could be added here, but motion handles scale nicely */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
