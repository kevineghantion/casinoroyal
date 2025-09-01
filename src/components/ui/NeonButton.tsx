import { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { hoverGlow } from '@/lib/animations';

interface NeonButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  children: React.ReactNode;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'border border-transparent',
      'relative overflow-hidden'
    ];

    const variants = {
      primary: [
        'bg-gradient-to-r from-neon-pink to-electric-blue',
        'text-neon-white',
        'shadow-neon-pink',
        glow && 'hover:shadow-neon-blue'
      ],
      secondary: [
        'bg-electric-blue/20 border-electric-blue/50',
        'text-electric-blue',
        'hover:bg-electric-blue/30',
        glow && 'hover:shadow-neon-blue'
      ],
      accent: [
        'bg-lime-green/20 border-lime-green/50',
        'text-lime-green',
        'hover:bg-lime-green/30',
        glow && 'hover:shadow-neon-green'
      ],
      outline: [
        'border-neon-gray-dark bg-transparent',
        'text-neon-white',
        'hover:bg-bg-card',
        glow && 'hover:shadow-glow'
      ],
      ghost: [
        'bg-transparent',
        'text-neon-white',
        'hover:bg-bg-card',
        glow && 'hover:shadow-glow'
      ]
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg'
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          ...baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        variants={hoverGlow}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {/* Animated background overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);

NeonButton.displayName = 'NeonButton';

export { NeonButton };