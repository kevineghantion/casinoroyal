import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Rocket, DollarSign, TrendingUp, Zap, Target, Clock, Star } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useBalance } from '@/hooks/useBalance';
import { useSFX } from '@/hooks/useSFX';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const RocketGame = () => {
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [isFlying, setIsFlying] = useState(false);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashOutAt, setCashOutAt] = useState(0);
  const [autoCashOut, setAutoCashOut] = useState('');
  const [history, setHistory] = useState<number[]>([2.34, 1.05, 3.67, 1.89, 5.23, 12.45, 1.23, 4.56]);
  const [rocketPosition, setRocketPosition] = useState({ x: 0, y: 0, rotation: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [stars, setStars] = useState<Star[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [trajectoryPoints, setTrajectoryPoints] = useState<Array<{x: number, y: number}>>([]);
  
  const { balance, updateBalance } = useBalance();
  const { playRocket, playCashOut } = useSFX();
  const intervalRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const rocketControls = useAnimation();

  // Generate stars for background
  useEffect(() => {
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2
    }));
    setStars(newStars);
  }, []);

  const generateCrashPoint = () => {
    let newCrash;
    let attempts = 0;
    
    do {
      const random = Math.random();
      // More fair distribution for customers
      if (random < 0.25) newCrash = 1.2 + Math.random() * 0.8; // 1.2 - 2.0 (25%)
      else if (random < 0.50) newCrash = 2.0 + Math.random() * 2.0; // 2.0 - 4.0 (25%)
      else if (random < 0.75) newCrash = 4.0 + Math.random() * 6.0; // 4.0 - 10.0 (25%)
      else if (random < 0.90) newCrash = 10.0 + Math.random() * 15.0; // 10.0 - 25.0 (15%)
      else newCrash = 25.0 + Math.random() * 75.0; // 25.0 - 100.0 (10%)
      
      attempts++;
    } while (
      attempts < 10 && // Prevent infinite loop
      history.some(prev => Math.abs(prev - newCrash) < 0.1) // Check if too similar to recent crashes
    );
    
    // Add some randomness to make it look more natural
    const variance = (Math.random() - 0.5) * 0.2;
    return Math.max(1.01, newCrash + variance);
  };

  const createParticles = useCallback(() => {
    if (!isFlying) return;
    
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: rocketPosition.x - 10 + Math.random() * 20,
      y: rocketPosition.y + 30 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      life: 1,
      color: ['#FF2DCB', '#00D4FF', '#A8FF3E'][Math.floor(Math.random() * 3)]
    }));
    
    setParticles(prev => [...prev.slice(-30), ...newParticles]);
  }, [isFlying, rocketPosition]);

  const updateParticles = useCallback(() => {
    setParticles(prev => prev.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      life: particle.life - 0.02,
      vy: particle.vy + 0.1 // gravity
    })).filter(particle => particle.life > 0));
  }, []);

  const animateRocket = useCallback(() => {
    if (!isFlying) return;
    
    setGameTime(prev => {
      const newTime = prev + 0.016; // 60fps
      
      // Dynamic speed based on multiplier
      const currentSpeed = 1 + (multiplier - 1) * 0.1;
      setSpeed(currentSpeed);
      
      // Smooth infinite trajectory - rocket can go ANYWHERE
      const progress = newTime * currentSpeed * 0.3;
      const baseX = Math.min(progress * 150, 400); // Base horizontal movement
      const baseY = -Math.min(progress * 100, 300); // Base vertical movement
      
      // Add dynamic movement based on multiplier
      const wobbleX = Math.sin(newTime * 2) * (5 + multiplier * 2);
      const wobbleY = Math.cos(newTime * 1.5) * (3 + multiplier);
      
      // Rocket can continue rising infinitely
      const infiniteY = baseY - (multiplier > 3 ? (multiplier - 3) * 20 : 0);
      
      const newPosition = {
        x: baseX + wobbleX,
        y: infiniteY + wobbleY,
        rotation: Math.min(baseX * 0.1 + wobbleX * 0.5, 45)
      };
      
      setRocketPosition(newPosition);
      
      // Add to trajectory line
      setTrajectoryPoints(prev => {
        const newPoints = [...prev, { x: newPosition.x + 40, y: newPosition.y + 350 }];
        return newPoints.slice(-50); // Keep last 50 points
      });
      
      return newTime;
    });
    
    createParticles();
    updateParticles();
    animationRef.current = requestAnimationFrame(animateRocket);
  }, [isFlying, multiplier, createParticles, updateParticles]);

  const startGame = () => {
    if (betAmount > balance || betAmount < 1 || gameState === 'flying') return;

    updateBalance(-betAmount);
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    setGameState('flying');
    setIsFlying(true);
    setCashedOut(false);
    setCashOutAt(0);
    setMultiplier(1.00);
    setGameTime(0);
    setSpeed(1);
    setRocketPosition({ x: 0, y: 0, rotation: 0 });
    setParticles([]);
    setTrajectoryPoints([]);
    playRocket();

    // Start multiplier with dynamic speed
    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        let increment = 0.01;
        if (prev > 2) increment = 0.02;
        if (prev > 5) increment = 0.03;
        if (prev > 10) increment = 0.05;
        if (prev > 20) increment = 0.1;
        
        const newMultiplier = prev + increment;
        
        // Auto cash out check
        if (autoCashOut && newMultiplier >= parseFloat(autoCashOut) && !cashedOut) {
          setTimeout(() => cashOut(newMultiplier), 0);
          return newMultiplier;
        }
        
        // Crash check
        if (newMultiplier >= newCrashPoint) {
          setTimeout(() => crash(newCrashPoint), 0);
          return newCrashPoint;
        }
        
        return newMultiplier;
      });
    }, 50);

    // Start rocket animation
    animationRef.current = requestAnimationFrame(animateRocket);
  };

  const cashOut = (currentMultiplier?: number) => {
    if (cashedOut || gameState !== 'flying') return;
    
    const finalMultiplier = currentMultiplier || multiplier;
    const winAmount = betAmount * finalMultiplier;
    
    setCashedOut(true);
    setCashOutAt(finalMultiplier);
    updateBalance(winAmount);
    playCashOut();
    setIsFlying(false);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    // Rocket celebration animation
    rocketControls.start({
      scale: [1, 1.5, 1],
      rotate: [0, 360, 720],
      transition: { duration: 2, ease: "easeOut" }
    });
    
    setTimeout(() => {
      setGameState('waiting');
      setMultiplier(1.00);
      setCashedOut(false);
      setCashOutAt(0);
      setParticles([]);
    }, 3000);
  };

  const crash = (crashMultiplier: number) => {
    setGameState('crashed');
    setIsFlying(false);
    setHistory(prev => [crashMultiplier, ...prev.slice(0, 7)]);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    // Explosion particles
    const explosionParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i + 1000,
      x: rocketPosition.x,
      y: rocketPosition.y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 1,
      color: '#FF0000'
    }));
    setParticles(explosionParticles);
    
    setTimeout(() => {
      setGameState('waiting');
      setMultiplier(1.00);
      setCashedOut(false);
      setCashOutAt(0);
      setParticles([]);
    }, 3000);
  };

  useEffect(() => {
    if (isFlying) {
      animationRef.current = requestAnimationFrame(animateRocket);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isFlying, animateRocket]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-4 relative overflow-hidden">
      {/* Optimized Stars Background */}
      <div className="absolute inset-0">
        {stars.slice(0, 25).map(star => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity
            }}
            animate={{
              opacity: [star.opacity, star.opacity * 0.5, star.opacity]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: star.id * 0.2
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* EPIC HEADER */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-4xl sm:text-6xl md:text-8xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-4"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: '200% 200%' }}
          >
            🚀 ROCKET CRASH
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            The most INSANE rocket game ever created! Cash out before it explodes! 💥
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* LEGENDARY GAME AREA */}
          <div className="lg:col-span-3">
            <motion.div 
              className="bg-gradient-to-br from-gray-800/90 via-purple-800/50 to-gray-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-4 sm:p-8 h-[400px] sm:h-[500px] relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                boxShadow: isFlying ? 
                  '0 0 50px rgba(168, 85, 247, 0.4), inset 0 0 50px rgba(168, 85, 247, 0.1)' :
                  '0 0 30px rgba(168, 85, 247, 0.2)'
              }}
            >
              {/* Dynamic Grid Background */}
              <motion.div 
                className="absolute inset-0 opacity-20"
                animate={{ 
                  backgroundPosition: isFlying ? 
                    [`0px 0px`, `${rocketPosition.x}px ${-rocketPosition.y}px`] : 
                    '0px 0px'
                }}
                transition={{ duration: 0.1 }}
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(168, 85, 247, 0.4) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(168, 85, 247, 0.4) 1px, transparent 1px),
                    linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px, 30px 30px, 60px 60px, 60px 60px'
                }}
              />

              {/* EPIC MULTIPLIER DISPLAY */}
              <motion.div
                className="absolute top-4 sm:top-8 left-4 sm:left-8 z-30"
                animate={isFlying ? { 
                  scale: [1, 1.05, 1],
                  rotate: [0, 1, -1, 0]
                } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <motion.div
                  className={`text-5xl sm:text-7xl md:text-8xl font-black ${
                    gameState === 'crashed' && !cashedOut ? 'text-red-500' : 
                    cashedOut ? 'text-emerald-400' : 'text-white'
                  }`}
                  style={{
                    textShadow: isFlying ? `
                      0 0 20px currentColor,
                      0 0 40px currentColor,
                      0 0 60px currentColor,
                      0 0 80px currentColor
                    ` : '0 0 20px currentColor',
                    filter: isFlying ? 'brightness(1.2)' : 'brightness(1)'
                  }}
                  animate={isFlying ? {
                    filter: [
                      'brightness(1.2) hue-rotate(0deg)',
                      'brightness(1.5) hue-rotate(60deg)',
                      'brightness(1.2) hue-rotate(0deg)'
                    ]
                  } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {gameState === 'crashed' && !cashedOut ? 'CRASHED!' : `${multiplier.toFixed(2)}x`}
                </motion.div>
                
                {cashedOut && (
                  <motion.div 
                    className="text-emerald-400 text-lg sm:text-2xl font-black mt-2"
                    initial={{ scale: 0, rotate: -180, y: 50 }}
                    animate={{ scale: 1, rotate: 0, y: 0 }}
                    transition={{ type: "spring", damping: 8, stiffness: 200 }}
                  >
                    🎉 LEGENDARY CASHOUT AT {cashOutAt.toFixed(2)}x! 🎉
                  </motion.div>
                )}
              </motion.div>

              {/* INSANE ROCKET WITH UNLIMITED TRAJECTORY */}
              <div className="absolute bottom-8 sm:bottom-12 left-8 sm:left-12">
                <motion.div
                  animate={rocketControls}
                  style={{
                    x: rocketPosition.x,
                    y: rocketPosition.y,
                    rotate: rocketPosition.rotation
                  }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="relative"
                >
                  {/* Rocket Aura */}
                  <motion.div
                    className="absolute inset-0 text-6xl sm:text-8xl"
                    animate={isFlying ? {
                      filter: [
                        "drop-shadow(0 0 30px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.6))",
                        "drop-shadow(0 0 50px rgba(236, 72, 153, 0.8)) drop-shadow(0 0 80px rgba(34, 197, 94, 0.6))",
                        "drop-shadow(0 0 30px rgba(168, 85, 247, 0.8)) drop-shadow(0 0 60px rgba(59, 130, 246, 0.6))"
                      ],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    🚀
                  </motion.div>
                  
                  {/* Main Rocket */}
                  <div className="text-6xl sm:text-8xl relative z-10">🚀</div>
                  
                  {/* EPIC EXHAUST TRAIL */}
                  {isFlying && (
                    <>
                      <motion.div
                        className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2"
                        animate={{
                          scale: [1, 1.8, 1.2],
                          opacity: [0.8, 1, 0.6],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 0.15, repeat: Infinity }}
                      >
                        <div className="text-3xl sm:text-5xl">🔥</div>
                      </motion.div>
                      
                      <motion.div
                        className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2"
                        animate={{
                          scale: [0.5, 1.2, 0.8],
                          opacity: [0.4, 0.8, 0.2]
                        }}
                        transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
                      >
                        <div className="text-2xl sm:text-4xl">💨</div>
                      </motion.div>

                      {/* Speed Lines */}
                      <motion.div
                        className="absolute -right-8 sm:-right-12 top-1/2 transform -translate-y-1/2"
                        animate={{
                          x: [-20, 20],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                      >
                        <div className="text-xl sm:text-2xl">⚡</div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* TRAJECTORY LINE */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                <defs>
                  <linearGradient id="trajectoryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255, 45, 203, 0.8)" />
                    <stop offset="50%" stopColor="rgba(0, 212, 255, 0.6)" />
                    <stop offset="100%" stopColor="rgba(168, 255, 62, 0.4)" />
                  </linearGradient>
                </defs>
                {trajectoryPoints.length > 1 && (
                  <motion.path
                    d={`M ${trajectoryPoints.map(point => `${point.x},${point.y}`).join(' L ')}`}
                    stroke="url(#trajectoryGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(255, 45, 203, 0.5))'
                    }}
                  />
                )}
              </svg>

              {/* PARTICLE SYSTEM */}
              <div className="absolute inset-0 pointer-events-none">
                {particles.map(particle => (
                  <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: particle.color,
                      left: particle.x,
                      top: particle.y,
                      opacity: particle.life,
                      boxShadow: `0 0 10px ${particle.color}`
                    }}
                    animate={{
                      scale: [1, 0],
                      opacity: [particle.life, 0]
                    }}
                    transition={{ duration: 1 }}
                  />
                ))}
              </div>

              {/* CRASH EXPLOSION */}
              <AnimatePresence>
                {gameState === 'crashed' && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 3, 2],
                      opacity: [0, 1, 0.7],
                      rotate: [0, 180, 360]
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-center justify-center z-40"
                  >
                    <div className="text-8xl sm:text-9xl">💥</div>
                    <motion.div
                      className="absolute inset-0 bg-red-500/30 rounded-full blur-xl"
                      animate={{
                        scale: [0, 4, 0],
                        opacity: [0, 0.8, 0]
                      }}
                      transition={{ duration: 1.5 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Speed Indicator */}
              {isFlying && (
                <motion.div
                  className="absolute top-4 right-4 text-white/70 text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Speed: {speed.toFixed(1)}x
                </motion.div>
              )}
            </motion.div>

            {/* HISTORY BAR */}
            <motion.div 
              className="mt-6 bg-gradient-to-r from-gray-800/80 to-purple-800/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-purple-500/30"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white font-bold mb-4 text-lg sm:text-xl flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Recent Crashes
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {history.map((crash, i) => (
                  <motion.div
                    key={i}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-lg font-bold border-2 ${
                      crash >= 10 ? 'bg-gradient-to-r from-emerald-500/30 to-green-400/20 text-emerald-400 border-emerald-400/50' :
                      crash >= 2 ? 'bg-gradient-to-r from-blue-500/30 to-cyan-400/20 text-cyan-400 border-cyan-400/50' : 
                      'bg-gradient-to-r from-red-500/30 to-pink-400/20 text-red-400 border-red-400/50'
                    }`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    {crash.toFixed(2)}x
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CONTROLS PANEL */}
          <motion.div 
            className="space-y-4 sm:space-y-6"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Bet Amount */}
            <div className="bg-gradient-to-br from-gray-800/90 to-purple-800/50 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl p-4 sm:p-6">
              <label className="block text-white font-bold mb-3 text-base sm:text-lg flex items-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-400" />
                Bet Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full bg-gray-900/80 border-2 border-purple-500/30 rounded-xl px-4 py-3 text-white text-lg sm:text-xl font-bold focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 outline-none transition-all"
                  min="1"
                  max={balance}
                  disabled={gameState === 'flying'}
                />
                <motion.div 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💎
                </motion.div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[10, 25, 50, 100].map(amount => (
                  <motion.button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-purple-300 rounded-lg text-sm font-bold border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/20 transition-all"
                    disabled={gameState === 'flying'}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ${amount}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Auto Cash Out */}
            <div className="bg-gradient-to-br from-gray-800/90 to-blue-800/50 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl p-4 sm:p-6">
              <label className="block text-white font-bold mb-3 text-base sm:text-lg flex items-center">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
                Auto Cash Out
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={autoCashOut}
                  onChange={(e) => setAutoCashOut(e.target.value)}
                  placeholder="2.00"
                  step="0.01"
                  className="w-full bg-gray-900/80 border-2 border-blue-500/30 rounded-xl px-4 py-3 text-white text-lg sm:text-xl font-bold focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all"
                  disabled={gameState === 'flying'}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 font-bold text-xl">x</span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="space-y-4">
              {gameState === 'waiting' ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <NeonButton
                    onClick={startGame}
                    className="w-full py-4 sm:py-6 text-lg sm:text-xl font-black bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/25"
                    disabled={betAmount > balance || betAmount < 1}
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                    🚀 LAUNCH ${betAmount}
                  </NeonButton>
                </motion.div>
              ) : gameState === 'flying' && !cashedOut ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.5)",
                      "0 0 40px rgba(34, 197, 94, 0.8)",
                      "0 0 20px rgba(34, 197, 94, 0.5)"
                    ]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <NeonButton
                    onClick={() => cashOut()}
                    className="w-full py-4 sm:py-6 text-lg sm:text-xl font-black bg-gradient-to-r from-emerald-500 to-green-400 hover:from-emerald-400 hover:to-green-300 border-2 border-emerald-400 text-gray-900"
                  >
                    💰 CASH OUT ${(betAmount * multiplier).toFixed(2)}
                  </NeonButton>
                </motion.div>
              ) : (
                <div className={`w-full py-4 sm:py-6 text-lg sm:text-xl font-black text-center rounded-2xl border-2 ${
                  cashedOut ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-400' : 'border-red-500/50 bg-red-500/20 text-red-400'
                }`}>
                  {cashedOut ? `🎉 WON $${(betAmount * cashOutAt).toFixed(2)}` : '💥 CRASHED!'}
                </div>
              )}
            </div>

            {/* Balance Display */}
            <motion.div 
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 text-center border border-gray-600/50"
              animate={{ 
                borderColor: balance > 100 ? "rgba(34, 197, 94, 0.5)" : "rgba(168, 85, 247, 0.3)"
              }}
            >
              <div className="text-gray-400 text-sm mb-1 flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                Balance
              </div>
              <motion.div 
                className="text-2xl sm:text-3xl font-black text-white"
                animate={balance > 1000 ? {
                  textShadow: [
                    "0 0 10px rgba(34, 197, 94, 0.5)",
                    "0 0 20px rgba(34, 197, 94, 0.8)",
                    "0 0 10px rgba(34, 197, 94, 0.5)"
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ${balance.toFixed(2)}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RocketGame;