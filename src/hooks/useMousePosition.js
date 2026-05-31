import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Track mouse position with throttling for performance.
 */
export function useMousePosition(throttleMs = 16) {
  const [position, setPosition] = useState({ x: null, y: null });
  const lastUpdate = useRef(0);

  const handleMouseMove = useCallback((e) => {
    const now = Date.now();
    if (now - lastUpdate.current >= throttleMs) {
      lastUpdate.current = now;
      setPosition({ x: e.clientX, y: e.clientY });
    }
  }, [throttleMs]);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: null, y: null });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return position;
}
