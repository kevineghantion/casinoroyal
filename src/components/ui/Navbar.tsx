import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Gamepad2,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSFX } from '@/hooks/useSFX';
import { NeonButton } from './NeonButton';
import { ToggleSound } from './ToggleSound';
import { NavBalanceButton } from './NavBalanceButton';
import { slideInFromRight, hoverGlow } from '@/lib/animations';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuthContext();
  const { playClick } = useSFX();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const handleNavClick = () => {
    playClick();
    setIsOpen(false);
  };

  const handleLogout = async () => {
    playClick();
    setIsOpen(false);
    
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    
    // Always navigate to home after logout
    navigate('/');
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-bg-darker/90 backdrop-blur-lg border-b border-neon-gray-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center space-x-2 group"
          >
            <motion.div
              className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Casino Royal
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
                    'hover:bg-bg-card hover:shadow-glow',
                    isActive
                      ? 'text-neon-pink shadow-neon-pink bg-bg-card'
                      : 'text-neon-gray hover:text-neon-white'
                  )}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}

            {/* Balance Widget - Only for authenticated users */}
            {user && <NavBalanceButton />}

            {/* Admin Panel Link - Only for owners */}
            {user && profile?.role === 'owner' && (
              <Link
                to="/owner"
                onClick={handleNavClick}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-bg-card hover:shadow-glow border border-lime-green/30',
                  location.pathname.startsWith('/owner')
                    ? 'text-lime-green shadow-neon-green bg-bg-card'
                    : 'text-lime-green/70 hover:text-lime-green'
                )}
              >
                <Shield size={18} />
                <span className="text-sm font-medium">Admin</span>
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ToggleSound />

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-neon-gray">
                  Welcome, <span className="text-neon-pink font-medium">{profile?.username || 'User'}</span>
                </div>
                <NeonButton
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </NeonButton>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <NeonButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    playClick();
                    navigate('/login');
                  }}
                >
                  Login
                </NeonButton>
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    playClick();
                    navigate('/register');
                  }}
                >
                  Sign Up
                </NeonButton>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => {
                playClick();
                setIsOpen(!isOpen);
              }}
              className="p-2 rounded-lg text-neon-white hover:text-neon-pink hover:bg-bg-card transition-colors"
              variants={hoverGlow}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-bg-darker border-t border-neon-gray-dark"
            variants={slideInFromRight}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200',
                      'hover:bg-bg-card hover:shadow-glow',
                      isActive
                        ? 'text-neon-pink shadow-neon-pink bg-bg-card'
                        : 'text-neon-gray hover:text-neon-white'
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {/* Balance Widget for Mobile - Only for authenticated users */}
              {user && (
                <div className="px-3 py-2">
                  <NavBalanceButton />
                </div>
              )}

              {user && profile?.role === 'owner' && (
                <Link
                  to="/owner"
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200',
                    'hover:bg-bg-card hover:shadow-glow border border-lime-green/30',
                    location.pathname.startsWith('/owner')
                      ? 'text-lime-green shadow-neon-green bg-bg-card'
                      : 'text-lime-green/70 hover:text-lime-green'
                  )}
                >
                  <Shield size={20} />
                  <span className="font-medium">Admin Panel</span>
                </Link>
              )}

              <div className="pt-4 border-t border-neon-gray-dark">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-neon-gray">Sound Effects</span>
                  <ToggleSound />
                </div>

                {user ? (
                  <div className="space-y-3">
                    <div className="text-sm text-neon-gray">
                      Welcome, <span className="text-neon-pink font-medium">{profile?.username || 'User'}</span>
                    </div>
                    <NeonButton
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </NeonButton>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <NeonButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        playClick();
                        navigate('/login');
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Login
                    </NeonButton>
                    <NeonButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        playClick();
                        navigate('/register');
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign Up
                    </NeonButton>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};