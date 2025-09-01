import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Crown, Zap } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, floatingElement, staggerChildren, bounceIn } from '@/lib/animations';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playClick } = useSFX();

  const handleEnterCasino = () => {
    playClick();
    if (user) {
      navigate('/games');
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-casino relative overflow-hidden"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Cards */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`card-${i}`}
            className="absolute w-16 h-24 bg-gradient-card rounded-lg shadow-glow opacity-20"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`
            }}
            variants={floatingElement}
            animate="float"
            transition={{
              delay: i * 0.5,
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Rotating Chips */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`chip-${i}`}
            className="absolute w-12 h-12 rounded-full bg-gradient-neon opacity-30"
            style={{
              right: `${5 + i * 20}%`,
              top: `${15 + i * 20}%`
            }}
            animate={{
              rotateY: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Pulsing Neon Lights */}
        <div className="absolute inset-0 bg-gradient-to-b from-neon-pink/5 via-transparent to-electric-blue/5" />
        
        {/* Neon Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 45, 203, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 45, 203, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Logo/Title */}
          <motion.div
            variants={bounceIn}
            className="space-y-4"
          >
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Crown className="w-16 h-16 text-neon-pink filter drop-shadow-[0_0_20px_currentColor]" />
              <motion.h1 
                className="text-6xl md:text-8xl font-bold bg-gradient-neon bg-clip-text text-transparent"
                animate={{
                  filter: [
                    "drop-shadow(0 0 20px rgba(255, 45, 203, 0.5))",
                    "drop-shadow(0 0 40px rgba(255, 45, 203, 0.8))",
                    "drop-shadow(0 0 20px rgba(255, 45, 203, 0.5))"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Casino Royal
              </motion.h1>
              <Sparkles className="w-16 h-16 text-electric-blue filter drop-shadow-[0_0_20px_currentColor]" />
            </div>
            
            <motion.p 
              className="text-xl md:text-2xl text-neon-gray max-w-2xl mx-auto leading-relaxed"
              variants={bounceIn}
            >
              Welcome to the most electrifying casino experience in the digital realm. 
              Where neon meets fortune and every spin pulses with possibility.
            </motion.p>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={bounceIn}
            className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            {[
              { icon: Zap, title: "Instant Wins", desc: "Lightning-fast payouts" },
              { icon: Crown, title: "VIP Experience", desc: "Exclusive games & bonuses" },
              { icon: Sparkles, title: "Neon Gaming", desc: "Immersive visual effects" }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 bg-bg-card/50 backdrop-blur-sm rounded-xl border border-neon-gray-dark hover:border-neon-pink/50 transition-all duration-300"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(255, 45, 203, 0.3)"
                }}
                variants={bounceIn}
                transition={{ delay: index * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-neon-pink mx-auto mb-4 filter drop-shadow-[0_0_10px_currentColor]" />
                <h3 className="text-lg font-bold text-neon-white mb-2">{feature.title}</h3>
                <p className="text-neon-gray text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div
            variants={bounceIn}
            className="space-y-6"
          >
            <NeonButton
              size="xl"
              onClick={handleEnterCasino}
              className="text-xl px-12 py-6 bg-gradient-neon hover:shadow-neon-pink transition-all duration-300"
            >
              {user ? 'Enter Casino' : 'Join Casino Royal'}
              <Zap className="ml-2 w-6 h-6" />
            </NeonButton>

            {!user && (
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                variants={bounceIn}
              >
                <span className="text-neon-gray">Already have an account?</span>
                <button
                  onClick={() => {
                    playClick();
                    navigate('/login');
                  }}
                  className="text-electric-blue hover:text-neon-white underline transition-colors"
                >
                  Sign In
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={bounceIn}
            className="flex flex-wrap justify-center items-center gap-8 pt-12 opacity-60"
          >
            <div className="text-sm text-neon-gray">🔒 Secure Gaming</div>
            <div className="text-sm text-neon-gray">⚡ Instant Payouts</div>
            <div className="text-sm text-neon-gray">🎮 Fair Play</div>
            <div className="text-sm text-neon-gray">🏆 Licensed</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-darker via-bg-darker/50 to-transparent" />
    </motion.div>
  );
};

export default Landing;