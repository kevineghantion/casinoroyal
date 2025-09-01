import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { secureLog } from '@/lib/logger';

// Expose supabase on window for quick console debugging (dev only)
declare global {
  interface Window { supabase?: typeof supabase }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

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

  const fetchProfile = async (userId: string, sessionUser?: User) => {
    secureLog.info('Fetching profile for user', userId);
    
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Profile fetch timeout')), 500)
    );
    
    const queryPromise = supabase
      .from('profiles')
      .select('username, role')
      .eq('id', userId)
      .maybeSingle();
    
    try {
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      secureLog.info('Profile query result', `data: ${JSON.stringify(data)}, error: ${error?.message || 'none'}`);

      if (error) {
        secureLog.error('Error fetching profile', error.message);
        throw error;
      }

      if (!data) {
        secureLog.warn('No profile found for authenticated user', userId);
        throw new Error('No profile found');
      }

      secureLog.info('Profile loaded successfully', `username: ${data.username}, role: ${data.role}`);
      setProfile(data as any);
    } catch (error) {
      secureLog.error('Profile fetch failed, using fallback', error instanceof Error ? error.message : 'Unknown error');
      
      // Keep existing profile if it exists, otherwise create fallback
      if (profile?.username) {
        // Keep the existing profile that was loaded successfully
        secureLog.info('Keeping existing profile', `username: ${profile.username}`);
      } else if (sessionUser?.email) {
        // Only create fallback if no profile exists
        const username = sessionUser.email.includes('jaypee') ? 'jaypee' : sessionUser.email.split('@')[0];
        const role = username === 'jaypee' ? 'owner' : 'user';
        setProfile({ username, role });
        secureLog.info('Created fallback profile', `username: ${username}, role: ${role}`);
      } else {
        setProfile({ username: 'User', role: 'user' });
      }
    }
  };

  useEffect(() => {
    // Expose client for console debugging (dev only)
    try { window.supabase = supabase; } catch (e) { /* ignore */ }

    let initialized = false;
    let currentUserId: string | null = null;

    // Set up auth state listener
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      secureLog.info('Auth state changed', `event: ${event}, hasSession: ${!!session}`);

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        currentUserId = null;
        return;
      }

      // Skip if same user to prevent duplicate calls
      if (session?.user?.id === currentUserId) {
        return;
      }

      // Skip INITIAL_SESSION if not initialized
      if (event === 'INITIAL_SESSION' && !initialized) {
        return;
      }

      currentUserId = session?.user?.id || null;
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      }

      setIsLoading(false);
    });

    const subscription = data?.subscription;

    // Check for existing session on app startup
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        secureLog.info('Initial session check', `hasSession: ${!!session}`);

        if (session?.user) {
          currentUserId = session.user.id;
          setUser(session.user);
          await fetchProfile(session.user.id, session.user);
        }
        
        initialized = true;
      } catch (error) {
        secureLog.error('Auth initialization error', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      try { subscription?.unsubscribe?.(); } catch (e) { /* ignore */ }
    };
  }, []);

  const login = async (identifier: string, password: string, remember = false): Promise<boolean> => {
    setIsLoading(true);

    try {
      let email = identifier;

      // If identifier doesn't contain @, treat it as username and look up email
      if (!identifier.includes('@')) {
        secureLog.info('Username login attempt', identifier);

        // Look up email by username in profiles table (truly case-insensitive)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', identifier.toLowerCase())
          .maybeSingle();

        if (profileError) {
          secureLog.error('Database error looking up username', profileError.message);
          setIsLoading(false);
          throw new Error('Database error. Please try again.');
        }

        if (!profileData) {
          secureLog.error('Username not found', identifier);
          setIsLoading(false);
          throw new Error('Username not found. Please check your username or try logging in with your email address.');
        }

        // Use type assertion since we know email should exist if we have profileData
        email = (profileData as any).email;
        secureLog.info('Found email for username');
      }

      secureLog.info('Attempting login with email');

      // Simple login with Supabase - let Supabase handle session persistence
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password
      });

      if (error) {
        secureLog.error('Login failed', error.message);
        setIsLoading(false);
        throw new Error(error.message || 'Login failed. Please try again.');
      }

      if (!data.session || !data.user) {
        setIsLoading(false);
        throw new Error('Login failed - no session created.');
      }

      secureLog.info('Login successful');

      // Update last login timestamp (ignore errors if column doesn't exist)
      try {
        await supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() } as any)
          .eq('id', data.user.id);
      } catch (updateError) {
        // Ignore errors - this is just for tracking
        secureLog.warn('Could not update last_login_at', updateError instanceof Error ? updateError.message : 'Unknown error');
      }

      setIsLoading(false);
      return true;
    } catch (error: any) {
      secureLog.error('Login error', error.message);
      setIsLoading(false);
      throw error;
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

      // Create profile - simplified to avoid database issues
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username.toLowerCase(),
              email: email.toLowerCase(),
              role: username.toLowerCase() === 'jaypee' ? 'owner' : 'user'
            });

          if (profileError) {
            secureLog.error('Profile creation error', profileError.message);
            // Don't throw - continue with registration
          } else {
            secureLog.info('Profile created in database', username);
          }
        } catch (error) {
          secureLog.error('Profile creation failed', error instanceof Error ? error.message : 'Unknown error');
          // Don't throw - continue with registration
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
    secureLog.info('Logout initiated', '');
    
    // Force clear state immediately - don't wait for auth listener
    setUser(null);
    setProfile(null);
    setIsLoading(false);
    
    try {
      // Clear localStorage first
      localStorage.clear();
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      secureLog.info('Logout completed', '');
    } catch (error) {
      secureLog.error('Logout error', error);
    }
  };

  // Dev helper: expose current auth context for console debugging
  try {
    (window as any).__auth_debug = {
      getState: () => ({ user, profile, isLoading }),
      logout: () => logout()
    };
  } catch (e) { /* ignore */ }

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