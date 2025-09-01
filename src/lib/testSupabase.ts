// Simple Supabase Connection Test
import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
    try {
        console.log('Testing Supabase connection...');

        // Test 1: Check if we can connect to Supabase
        const { data: healthCheck, error: healthError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);

        if (healthError) {
            console.error('Health check failed:', healthError);
        } else {
            console.log('Supabase connection successful');
        }

        // Test 2: Try a simple registration
        const testEmail = `test-${Date.now()}@casino.com`;
        const testPassword = 'testpassword123';

        console.log('Testing registration with:', { email: testEmail });

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: { username: `testuser${Date.now()}` }
            }
        });

        if (signUpError) {
            console.error('Registration test failed:', signUpError);
            console.error('Error details:', {
                message: signUpError.message,
                status: signUpError.status,
                name: signUpError.name
            });
        } else {
            console.log('Registration test successful:', signUpData);
        }

        return { healthCheck, signUpData, errors: { healthError, signUpError } };
    } catch (error) {
        console.error('Connection test failed:', error);
        return { error };
    }
};

// Call this function in your component to test
// testSupabaseConnection();
