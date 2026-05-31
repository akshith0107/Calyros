import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Styled input field with focus animations.
 */
export default function InputField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  large = false,
  unit,
  id,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      className="input-wrapper"
      animate={focused ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={`input-field ${large ? 'input-field--large' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {unit && <span className="input-unit">{unit}</span>}
    </motion.div>
  );
}
