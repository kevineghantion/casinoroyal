import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  profile: { username: string; role?: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, remember?: boolean) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string; role?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check session expiry on app load
    const checkSessionExpiry = () => {
      const expiryTime = localStorage.getItem('session_expiry');
      if (expiryTime && Date.now() > parseInt(expiryTime)) {
        // Session expired, sign out
        supabase.auth.signOut();
        localStorage.removeItem('session_expiry');
        return true;
      }
      return false;
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Check if session expired before processing
        if (session && checkSessionExpiry()) {
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          localStorage.removeItem('session_expiry');
        }

        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Check if session expired
      if (session && checkSessionExpiry()) {
        setIsLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Set up periodic session expiry check (every 5 minutes)
    const intervalId = setInterval(() => {
      checkSessionExpiry();
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const login = async (identifier: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);

    try {
      let email = identifier;

      // If identifier doesn't contain @, treat it as username and look up email
      if (!identifier.includes('@')) {
        secureLog.info('Username login attempt', identifier);
        
        // Look up email by username in profiles table (case-insensitive)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', identifier)
          .maybeSingle();

        if (profileError) {
          secureLog.error('Database error looking up username', profileError.message);
          setIsLoading(false);
          throw new Error('Database error. Please try again.');
        }

        if (!profileData || !profileData.email) {
          secureLog.error('Username not found', identifier);
          setIsLoading(false);
          throw new Error('Username not found. Please check your username or try logging in with your email address.');
        }

        email = profileData.email!;
        secureLog.info('Found email for username', email);
      }

      secureLog.info('Attempting login with email', email);

      // Configure session persistence based on remember preference
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
        options: {
          // If remember is false, session expires in 24 hours
          // If remember is true, session persists for 30 days (default)
          ...(remember ? {} : { 
            data: { sessionDuration: '24h' }
          })
        }
      });

      // Set session expiry in localStorage for client-side checking
      if (data.session && !remember) {
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('session_expiry', expiryTime.toString());
      } else if (data.session && remember) {
        localStorage.removeItem('session_expiry'); // No client-side expiry for remember me
      }

      if (error) {
        secureLog.error('Supabase auth error', error.message);
        secureLog.error('Error code', String(error.status));

        // Check for specific error types
        if (error.message.includes('Invalid login credentials')) {
          secureLog.error('INVALID CREDENTIALS - Check email/password', '');
          throw new Error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('User not found')) {
          secureLog.error('USER NOT FOUND - User may not exist', '');
          throw new Error('User not found. Please check your email address.');
        }

        throw new Error(error.message);
      }

      secureLog.info('Login successful', data.user?.id || '');
      secureLog.info('User session created', data.session ? 'true' : 'false');

      // Update last login timestamp
      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
        } catch (error) {
          console.error('Error updating last login:', error);
        }
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Login error', error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    secureLog.info('Starting registration', `${email} ${username}`);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: { username, email },
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        secureLog.error('Supabase registration error', error.message);
        secureLog.error('Error code', String(error.status));
        setIsLoading(false);
        throw new Error(error.message);
      }

      // Create profile with username, email, role, IP, and password hash
      if (data.user) {
        // Get user's IP address
        let userIP = 'unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          userIP = ipData.ip;
        } catch (error) {
          secureLog.warn('Could not fetch IP', error instanceof Error ? error.message : 'Unknown error');
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            role: username.toLowerCase() === 'jaypee' ? 'owner' : 'user',
            ip_address: userIP,
            balance: 0.00,
            total_winnings: 0,
            total_losses: 0,
            games_played: 0,
            status: 'active'
          });

        if (profileError) {
          secureLog.error('Profile creation error', profileError.message);
          throw new Error(`Profile creation failed: ${profileError.message}`);
        }
      }

      secureLog.info('Registration successful', data.user?.id || '');
      secureLog.info('Profile created successfully', '');
      
      // Force logout to require explicit login
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      secureLog.error('Registration error', error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('session_expiry');
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};