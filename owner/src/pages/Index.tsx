import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Star,
  Home,
  Wallet,
  Gamepad2,
  User,
  HelpCircle,
  LogIn,
  UserPlus,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const navigation = [
    { name: 'Home', icon: Home, active: true },
    { name: 'Wallet', icon: Wallet },
    { name: 'Games', icon: Gamepad2 },
    { name: 'Profile', icon: User },
    { name: 'Help', icon: HelpCircle },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Wins',
      description: 'Lightning-fast payouts',
    },
    {
      icon: Crown,
      title: 'VIP Experience',
      description: 'Exclusive games & bonuses',
    },
    {
      icon: Sparkles,
      title: 'Neon Gaming',
      description: 'Immersive visual effects',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-primary animate-neon-pulse" />
              <span className="text-2xl font-bold text-neon-glow">Casino Royal</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    item.active 
                      ? 'bg-primary/20 text-primary border border-primary/30' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button className="btn-neon-primary" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-12 w-12 text-primary animate-float" />
              <h1 className="text-6xl font-bold text-neon-glow">
                Casino Royal
              </h1>
              <Sparkles className="h-10 w-10 text-accent animate-glow-rotate" />
            </div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to the most electrifying casino experience in the digital realm. 
              Where neon meets fortune and every spin pulses with possibility.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => (
              <Card key={feature.title} className="card-neon group hover:scale-105 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary group-hover:animate-neon-pulse" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-electric-glow">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <Button 
              size="lg" 
              className="btn-neon-primary text-lg px-8 py-6 hover:scale-105 transition-all duration-300"
            >
              <Zap className="h-5 w-5 mr-2" />
              Join Casino Royal
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="#" className="text-accent hover:text-accent/80 underline">
                Sign In
              </Link>
            </p>
          </motion.div>

          {/* Admin Access */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-12 border-t border-border/50"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="text-sm text-muted-foreground">
                Administrative Access:
              </div>
              <Link to="/owner">
                <Button variant="outline" size="sm" className="btn-ghost-neon">
                  <Settings className="h-4 w-4 mr-2" />
                  Owner Panel
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { icon: Crown, text: 'Secure Gaming' },
            { icon: Zap, text: 'Instant Payouts' },
            { icon: Star, text: 'Fair Play' },
            { icon: Sparkles, text: 'Licensed' },
          ].map((item, index) => (
            <div key={item.text} className="flex flex-col items-center gap-2 opacity-70">
              <item.icon className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">{item.text}</span>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
