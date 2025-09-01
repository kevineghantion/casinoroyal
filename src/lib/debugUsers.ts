import { supabase } from '@/integrations/supabase/client';

export const checkExistingUsers = async () => {
    try {
        console.log('=== CHECKING EXISTING USERS ===');

        // Check profiles table
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*');

        console.log('Profiles in database:', profiles);
        console.log('Profile errors:', profileError);

        // Try to list auth users (may not work due to permissions)
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        console.log('Auth users:', users);
        console.log('Auth users errors:', usersError);

        return { profiles, users };
    } catch (error) {
        console.error('Error checking users:', error);
        return null;
    }
};
