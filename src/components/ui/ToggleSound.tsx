import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSFX } from '@/hooks/useSFX';
import { hoverGlow } from '@/lib/animations';

interface ToggleSoundProps {
  className?: string;
  size?: number;
}

export const ToggleSound = ({ className, size = 24 }: ToggleSoundProps) => {
  const { isEnabled, toggle, playClick } = useSFX();

  const handleToggle = () => {
    if (isEnabled) {
      // Only play click sound if currently enabled (before toggling off)
      playClick();
    }
    toggle();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={cn(
        'p-2 rounded-lg border border-neon-gray-dark bg-bg-card',
        'text-neon-white hover:text-neon-pink transition-colors',
        'hover:border-neon-pink/50 hover:shadow-glow',
        className
      )}
      variants={hoverGlow}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      title={isEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
    >
      <motion.div
        initial={false}
        animate={{ 
          scale: isEnabled ? 1 : 0.8,
          filter: isEnabled 
            ? 'drop-shadow(0 0 10px rgba(255, 45, 203, 0.5))' 
            : 'drop-shadow(0 0 0px rgba(255, 45, 203, 0))'
        }}
        transition={{ duration: 0.2 }}
      >
        {isEnabled ? (
          <Volume2 size={size} />
        ) : (
          <VolumeX size={size} />
        )}
      </motion.div>
    </motion.button>
  );
};