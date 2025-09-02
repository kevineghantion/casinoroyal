import { supabase } from '@/integrations/supabase/client';
import { secureLog } from './logger';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  last_login_at?: string;
}

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, role, last_login_at')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    secureLog.error('Failed to fetch user profile', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

export const loginUser = async (identifier: string, password: string) => {
  try {
    let email = identifier;
    let userProfile: UserProfile | null = null;

    if (!identifier.includes('@')) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email, username, role')
        .ilike('username', identifier.toLowerCase())
        .single();

      if (profileError || !profileData) {
        throw new Error('Username not found.');
      }

      email = profileData.email;
      userProfile = profileData as UserProfile;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError || !authData.session || !authData.user) {
      throw new Error(authError?.message || 'Login failed.');
    }

    if (!userProfile) {
      userProfile = await fetchUserProfile(authData.user.id);
    }

    try {
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', authData.user.id);
    } catch (updateError) {
      secureLog.warn('Could not update last_login_at');
    }

    return {
      session: authData.session,
      user: authData.user,
      profile: userProfile
    };
  } catch (error) {
    throw error;
  }
};