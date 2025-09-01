import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Bug } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/lib/testSupabase';

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            toast({
                title: "Username required",
                description: "Please enter a username",
                variant: "destructive",
            });
            return false;
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast({
                title: "Invalid email",
                description: "Please enter a valid email address",
                variant: "destructive",
            });
            return false;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters long",
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

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        playClick();

        try {
            const success = await register(formData.username, formData.email, formData.password);

            if (success) {
                toast({
                    title: "Welcome to Casino Royal!",
                    description: "Your account has been created successfully! Please check your email for verification.",
                });
                navigate('/login');
            } else {
                toast({
                    title: "Registration Failed",
                    description: "Could not create account. Check browser console for details.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDebugTest = async () => {
        playClick();
        toast({
            title: "Testing Supabase Connection",
            description: "Check browser console for detailed results...",
        });

        const result = await testSupabaseConnection();
        console.log('Debug test result:', result);
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
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-neon-magenta rounded-full opacity-40"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                        animate={{
                            scale: [1, 2.5, 1],
                            opacity: [0.4, 0.9, 0.4]
                        }}
                        transition={{
                            duration: 4 + i,
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                                    placeholder="Create a strong password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-gray hover:text-neon-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
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
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-12 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-magenta focus:ring-2 focus:ring-neon-magenta/20 outline-none transition-all"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-gray hover:text-neon-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
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

                    {/* Debug Button (Development Only) */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleDebugTest}
                            className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 border border-neon-gray-dark text-neon-gray hover:text-neon-white hover:border-neon-white transition-colors rounded-lg"
                        >
                            <Bug size={16} />
                            <span>Test Supabase Connection</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Register;
