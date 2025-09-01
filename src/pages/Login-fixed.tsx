import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Mock login logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-casino flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-neon-gray hover:text-neon-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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

          {/* Register Link */}
          <div className="mt-8 text-center">
            <span className="text-neon-gray">Don't have an account? </span>
            <Link
              to="/register"
              className="text-electric-blue hover:text-neon-white underline transition-colors"
            >
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;