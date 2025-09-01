import { supabase } from '@/integrations/supabase/client';

// Debug helper to check and create missing profiles
export const debugDb = {
  // Check all profiles
  async checkProfiles() {
    const { data, error } = await supabase.from('profiles').select('*');
    console.log('All profiles:', data);
    return data;
  },

  // Create missing profile for existing auth user
  async createProfile(username: string, email: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user');
      return false;
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      role: 'user'
    });

    if (error) {
      console.error('Profile creation failed:', error);
      return false;
    }

    console.log('Profile created successfully');
    return true;
  }
};

// Expose for console debugging
(window as any).debugDb = debugDb;