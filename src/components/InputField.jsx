import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Input Field with purple focus glow
 */
const InputField = forwardRef(({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  large = false,
  unit,
  id,
  error,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-white/70 tracking-wide" htmlFor={id}>
          {label}
        </label>
      )}
      
      <motion.div
        className="relative"
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-[#0A0A0A] border ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30' : 'border-white/[0.1] focus:border-[#FFFFFF] focus:ring-[#FFFFFF]/30'} text-white placeholder-white/30 rounded-xl outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(255,255,255,0.15)] focus:ring-2 ${large ? 'px-4 py-4 text-lg' : 'px-4 py-3 text-sm'} ${unit ? 'pr-12' : ''}`}
          {...props}
        />
        {unit && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none font-medium">
            {unit}
          </div>
        )}
      </motion.div>
      {error && (
        <span className="text-xs font-medium text-red-400 mt-1">{error}</span>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;
