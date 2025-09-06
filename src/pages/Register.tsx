import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();
  const { playClick } = useSFX();
  const { toast } = useToast();

  const [backgroundElements] = useState(() => 
    [...Array(12)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100
    }))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = async () => {
    // 1. Username format validation
    if (!formData.username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return false;
    }

    if (formData.username.length > 16) {
      toast({
        title: "Username too long",
        description: "Username can only contain letters and numbers with maximum 16 characters",
        variant: "destructive",
      });
      return false;
    }

    // Only allow letters and numbers (a-z, A-Z, 0-9)
    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
      toast({
        title: "Invalid username",
        description: "Username can only contain letters and numbers with maximum 16 characters",
        variant: "destructive",
      });
      return false;
    }

    // 2. Email format validation
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    // 3. Password validation
    if (formData.password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return false;
    }

    // Check password complexity
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      toast({
        title: "Password too weak",
        description: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return false;
    }

    // 4. Check if username exists in database
    try {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', formData.username)
        .maybeSingle();

      if (existingUsername) {
        toast({
          title: "Username taken",
          description: "Username already registered. Please choose a different username.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      toast({
        title: "Validation error",
        description: "Unable to validate username. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    // 5. Check if email exists in database
    try {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('email')
        .ilike('email', formData.email)
        .maybeSingle();

      if (existingEmail) {
        toast({
          title: "Email taken",
          description: "Email address already registered. Please use a different email or try logging in.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      toast({
        title: "Validation error",
        description: "Unable to validate email. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    const isValid = await validateForm();
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    playClick();

    try {
      const success = await register(formData.username, formData.email, formData.password);

      if (success) {
        toast({
          title: "Registration successful!",
          description: "Registration successful! You can now login with your credentials.",
        });

        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast({
          title: "Registration Failed",
          description: "Registration failed. Please check your information and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        {backgroundElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute w-2 h-2 bg-neon-magenta rounded-full opacity-40"
            style={{
              left: `${element.left}%`,
              top: `${element.top}%`
            }}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{
              duration: 4 + element.id,
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
        <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-neon-magenta">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-neon-pink via-neon-magenta to-electric-blue bg-clip-text text-transparent mb-2"
              animate={{
                filter: [
                  'drop-shadow(0 0 8px rgba(255, 20, 147, 0.5))',
                  'drop-shadow(0 0 12px rgba(255, 20, 147, 0.8))',
                  'drop-shadow(0 0 8px rgba(255, 20, 147, 0.5))'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Join the Royal Court
            </motion.h1>
            <p className="text-neon-gray">Create your account and start winning big!</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-neon-white text-sm font-medium mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-neon-white text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-neon-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                  placeholder="Create a strong password"
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-neon-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-neon-gray hover:text-neon-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    rotate: showConfirmPassword ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{
                      opacity: showConfirmPassword ? [1, 0.5, 1] : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-neon-pink to-neon-magenta text-white font-semibold rounded-lg hover:shadow-glow-pink transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Join Casino Royal'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <span className="text-neon-gray">Already have an account? </span>
            <Link
              to="/login"
              className="text-electric-blue hover:text-cyan-glow underline transition-colors"
              onClick={playClick}
            >
              Sign In
            </Link>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
