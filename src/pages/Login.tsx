import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { playClick } = useSFX();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    playClick();

    try {
      const success = await login(identifier, password, remember);

      if (success) {
        toast({
          title: "Welcome back!",
          description: "Login successful",
        });
        navigate('/');
      } else {
        toast({
          title: "Login Failed",
          description: "Please check your credentials and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };



  return (
    <motion.div
      className="min-h-screen bg-gradient-casino flex items-center justify-center px-4"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated background elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-pink rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={bounceIn}
        initial="hidden"
        animate="visible"
      >
        <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(255, 45, 203, 0.5))",
                  "drop-shadow(0 0 30px rgba(255, 45, 203, 0.8))",
                  "drop-shadow(0 0 20px rgba(255, 45, 203, 0.5))"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-neon-gray">Sign in to continue your gaming journey</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-white">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 outline-none transition-all"
                  placeholder="Enter your email or username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-white">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-neon-gray hover:text-neon-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    rotate: showPassword ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{
                      opacity: showPassword ? [1, 0.5, 1] : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-neon-pink bg-bg-darker border-neon-gray-dark rounded focus:ring-neon-pink/20 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-neon-gray">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-neon-pink to-electric-blue text-neon-white rounded-lg font-medium hover:shadow-neon-blue transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading || !identifier || !password}
            >
              {isLoading ? 'Signing In...' : 'Enter Casino'}
            </button>


          </form>

          {/* Getting Started */}
          <div className="mt-6 p-4 bg-bg-darker/50 rounded-lg border border-neon-gray-dark">
            <p className="text-sm text-neon-gray mb-2">New to Casino Royal?</p>
            <p className="text-xs text-neon-gray">
              Create your account to access all our games!
            </p>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <span className="text-neon-gray">Don't have an account? </span>
            <Link
              to="/register"
              className="text-electric-blue hover:text-neon-white underline transition-colors"
              onClick={playClick}
            >
              Sign up now
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;