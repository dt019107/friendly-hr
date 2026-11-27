import React, { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  formatter?: (val: number) => string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter = (v) => String(Math.round(v)),
  duration = 0.55,
}) => {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    const controls = animate(display, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefersReduced, duration]);

  return <>{formatter(display)}</>;
};

export const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
