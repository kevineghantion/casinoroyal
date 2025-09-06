import { useState, useCallback } from 'react';

interface SFXHook {
  isEnabled: boolean;
  toggle: () => void;
  playClick: () => void;
  playCard: () => void;
  playRocket: () => void;
  playCashOut: () => void;
  playWin: () => void;
}

export const useSFX = (): SFXHook => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('casino_sfx_enabled');
    return saved ? JSON.parse(saved) : true;
  });

  const toggle = useCallback(() => {
    setIsEnabled(prev => {
      const newState = !prev;
      localStorage.setItem('casino_sfx_enabled', JSON.stringify(newState));
      return newState;
    });
  }, []);

  const playSound = useCallback((soundType: string) => {
    if (!isEnabled) return;
    
    // Use setTimeout to make sound non-blocking
    setTimeout(() => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const soundMap: Record<string, { frequency: number; duration: number }> = {
          click: { frequency: 800, duration: 0.05 },
          card: { frequency: 600, duration: 0.1 },
          rocket: { frequency: 400, duration: 0.2 },
          cashOut: { frequency: 1000, duration: 0.15 },
          win: { frequency: 1200, duration: 0.3 }
        };

        const sound = soundMap[soundType];
        if (!sound) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = sound.frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + sound.duration);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + sound.duration);
      } catch (e) {
        // Ignore audio errors
      }
    }, 0);
  }, [isEnabled]);

  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playCard = useCallback(() => playSound('card'), [playSound]);
  const playRocket = useCallback(() => playSound('rocket'), [playSound]);
  const playCashOut = useCallback(() => playSound('cashOut'), [playSound]);
  const playWin = useCallback(() => playSound('win'), [playSound]);

  return {
    isEnabled,
    toggle,
    playClick,
    playCard,
    playRocket,
    playCashOut,
    playWin
  };
};