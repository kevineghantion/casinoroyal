import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (profileError) {
        throw new Error('Database error. Please try again.');
      }

      if (!profile) {
        setError('Email not found. Please check your email address or create an account.');
        setIsLoading(false);
        return;
      }

      // Email exists, send reset link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-casino flex items-center justify-center px-4">
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-glow text-center">
            <div className="w-16 h-16 bg-lime-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-lime-green" />
            </div>
            
            <h1 className="text-2xl font-bold text-neon-white mb-4">
              Check Your Email
            </h1>
            
            <p className="text-neon-gray mb-6">
              We've sent a password reset link to <span className="text-neon-pink">{email}</span>
            </p>
            
            <p className="text-sm text-neon-gray mb-8">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-electric-blue hover:text-neon-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-casino flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-neon-gray">Enter your email to receive a reset link</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-white">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neon-gray" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Clear error when typing
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white placeholder-neon-gray focus:border-neon-pink focus:ring-2 focus:ring-neon-pink/20 outline-none transition-all"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-neon-pink to-electric-blue text-neon-white rounded-lg font-medium hover:shadow-neon-blue transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-electric-blue hover:text-neon-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;