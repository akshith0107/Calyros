import { motion } from 'framer-motion';

/**
 * Premium button with light sweep effect.
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
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'large' ? 'btn--large' : '',
    fullWidth ? 'btn--full' : '',
    className,
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
      {children}
    </motion.button>
  );
}
