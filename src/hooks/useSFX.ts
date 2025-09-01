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
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('casino_sfx_enabled', JSON.stringify(newState));
  }, [isEnabled]);

  const playSound = useCallback((soundType: string) => {
    if (!isEnabled) return;
    
    // For now, we'll use the Web Audio API to generate simple tones
    // In production, you would load actual audio files
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const soundMap: Record<string, { frequency: number; duration: number; type: OscillatorType }> = {
      click: { frequency: 800, duration: 0.1, type: 'sine' },
      card: { frequency: 600, duration: 0.2, type: 'square' },
      rocket: { frequency: 400, duration: 0.5, type: 'sawtooth' },
      cashOut: { frequency: 1000, duration: 0.3, type: 'triangle' },
      win: { frequency: 1200, duration: 0.6, type: 'sine' }
    };

    const sound = soundMap[soundType];
    if (!sound) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
    oscillator.type = sound.type;

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
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