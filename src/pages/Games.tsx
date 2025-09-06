import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Rocket, Spade, Users, Zap, Star, Crown } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, staggerChildren, bounceIn } from '@/lib/animations';

const Games = () => {
  const navigate = useNavigate();
  const { playClick } = useSFX();

  const games = [
    {
      id: 'rocket',
      title: 'Rocket Launch',
      description: 'Watch the multiplier soar! Cash out before the rocket explodes for massive wins.',
      icon: Rocket,
      gradient: 'from-neon-pink to-electric-blue',
      status: 'live',
      players: 234,
      maxWin: '1000x',
      route: '/games/rocket'
    },
    {
      id: 'blackjack',
      title: 'Neon Blackjack',
      description: 'Classic 21 with a futuristic twist. Beat the dealer in this electric showdown.',
      icon: Spade,
      gradient: 'from-electric-blue to-lime-green',
      status: 'live',
      players: 156,
      maxWin: '3:2',
      route: '/games/blackjack'
    },
    {
      id: 'poker',
      title: 'Cyber Poker',
      description: 'High-stakes poker in a neon-lit digital arena. Test your skills against AI dealers.',
      icon: Users,
      gradient: 'from-lime-green to-neon-pink',
      status: 'live',
      players: 89,
      maxWin: 'Royal Flush',
      route: '/games/poker'
    }
  ];

  const handleGameClick = (route: string) => {
    navigate(route);
    playClick();
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-casino px-4 py-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated grid */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 45, 203, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 45, 203, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Floating game symbols */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-neon-pink/20 text-4xl"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {['♠', '♥', '♦', '♣', '🎲', '🎰'][i]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={bounceIn}
          >
            <span className="bg-gradient-neon bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(255,45,203,0.5)]">
              Game Lobby
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-neon-gray max-w-2xl mx-auto"
            variants={bounceIn}
          >
            Choose your adventure in Casino Royal's electrifying game collection
          </motion.p>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          className="grid lg:grid-cols-3 gap-8"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {games.map((game, index) => {
            const Icon = game.icon;
            
            return (
              <motion.div
                key={game.id}
                className="relative group"
                variants={bounceIn}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 hover:border-neon-pink/50 transition-all duration-300 hover:shadow-glow-lg">
                  {/* Game Status Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <motion.div
                      className="flex items-center space-x-2 bg-lime-green/20 text-lime-green px-3 py-1 rounded-full text-sm"
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(168, 255, 62, 0)",
                          "0 0 20px rgba(168, 255, 62, 0.5)",
                          "0 0 0px rgba(168, 255, 62, 0)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-2 h-2 bg-lime-green rounded-full animate-pulse" />
                      <span className="font-medium">LIVE</span>
                    </motion.div>
                    
                    <div className="text-right text-sm text-neon-gray">
                      <div className="flex items-center">
                        <Users size={14} className="mr-1" />
                        {game.players}
                      </div>
                    </div>
                  </div>

                  {/* Game Icon */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.gradient} p-4 shadow-glow`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        filter: "drop-shadow(0 0 30px rgba(255, 45, 203, 0.8))"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-full h-full text-white" />
                    </motion.div>
                  </div>

                  {/* Game Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-neon-white mb-2">
                      {game.title}
                    </h3>
                    <p className="text-neon-gray text-sm leading-relaxed">
                      {game.description}
                    </p>
                  </div>

                  {/* Max Win */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center space-x-2 bg-electric-blue/20 text-electric-blue px-4 py-2 rounded-lg">
                      <Star size={16} />
                      <span className="font-bold">Max Win: {game.maxWin}</span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <NeonButton
                    onClick={() => handleGameClick(game.route)}
                    className="w-full bg-gradient-to-r from-neon-pink to-electric-blue hover:from-electric-blue hover:to-lime-green transition-all duration-300"
                    size="lg"
                  >
                    <Zap className="mr-2 w-5 h-5" />
                    Play Now
                  </NeonButton>

                  {/* Hover Effect Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-transparent to-electric-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Coming Soon Section */}
        <motion.div
          className="mt-16 text-center"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-bg-card/50 backdrop-blur-sm border border-neon-gray-dark rounded-2xl p-8 max-w-2xl mx-auto">
            <Crown className="w-12 h-12 text-neon-pink mx-auto mb-4 filter drop-shadow-[0_0_20px_currentColor]" />
            <h3 className="text-2xl font-bold text-neon-white mb-2">More Games Coming Soon</h3>
            <p className="text-neon-gray">
              We're constantly adding new games to our collection. 
              Stay tuned for slots, roulette, and exclusive Casino Royal originals!
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Games;