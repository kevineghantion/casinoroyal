import { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter = ({
  value,
  duration = 1,
  className,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 15,
    stiffness: 100,
    duration: duration * 1000
  });

  const displayValue = useTransform(
    springValue,
    (latest) => {
      const formatted = latest.toFixed(decimals);
      return `${prefix}${formatted}${suffix}`;
    }
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return (
    <motion.span
      className={cn(
        'font-mono text-neon-white font-bold',
        'filter drop-shadow-[0_0_10px_currentColor]',
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span>{displayValue}</motion.span>
    </motion.span>
  );
};