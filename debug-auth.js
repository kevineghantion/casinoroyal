// Debug script to check auth state
// Run this in browser console

console.log('=== AUTH DEBUG ===');

// Check Supabase session
import { supabase } from './src/integrations/supabase/client.js';

async function debugAuth() {
  try {
    // 1. Check current session
    const { data: session, error } = await supabase.auth.getSession();
    console.log('Current session:', session);
    console.log('Session error:', error);
    
    // 2. Check current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    console.log('Current user:', user);
    console.log('User error:', userError);
    
    // 3. Check localStorage keys
    console.log('=== LOCALSTORAGE KEYS ===');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('sb-') || key.includes('player') || key.includes('session'))) {
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }
    }
    
    // 4. If user exists, check profile
    if (user?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
      console.log('Profile data:', profile);
      console.log('Profile error:', profileError);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugAuth();