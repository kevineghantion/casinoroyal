import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { NeonButton } from '@/components/ui/NeonButton';
import { useAuth } from '@/hooks/useAuth';
import { useSFX } from '@/hooks/useSFX';
import { pageTransition, bounceIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const { playClick } = useSFX();
  const { toast } = useToast();
  const navigate = useNavigate();
  


  // Redirect if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }



  const handleLogout = () => {
    playClick();
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-casino px-4 py-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="bg-bg-card/90 backdrop-blur-lg border border-neon-gray-dark rounded-2xl p-8 shadow-glow"
          variants={bounceIn}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center">
                <User size={32} className="text-bg-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                  {profile?.username || 'Player'}
                </h1>
                <p className="text-neon-gray">Member Profile</p>
              </div>
            </div>
            

          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neon-white flex items-center space-x-2">
                  <User size={16} />
                  <span>Username</span>
                </label>
                <div className="w-full px-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white">
                  {profile?.username || 'Player'}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neon-white flex items-center space-x-2">
                  <Mail size={16} />
                  <span>Email</span>
                </label>
                <div className="w-full px-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white">
                  {user.email}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neon-white flex items-center space-x-2">
                  <Shield size={16} />
                  <span>Role</span>
                </label>
                <div className="w-full px-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-electric-blue/20 text-electric-blue">
                    USER
                  </span>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neon-white flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Member Since</span>
                </label>
                <div className="w-full px-4 py-3 bg-bg-darker border border-neon-gray-dark rounded-lg text-neon-white">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-neon-gray-dark">
              <NeonButton
                variant="outline"
                onClick={handleLogout}
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                Logout
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;