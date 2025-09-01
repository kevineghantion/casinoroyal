import { supabase } from '@/integrations/supabase/client';

export const testSignup = async () => {
    console.log('🧪 Testing Supabase signup...');

    try {
        // Test with a unique email
        const testEmail = `test${Date.now()}@example.com`;
        const testUsername = `testuser${Date.now()}`;
        const testPassword = 'Test123!';

        console.log(`📧 Testing signup with: ${testEmail}`);

        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: { username: testUsername },
            }
        });

        if (error) {
            console.error('❌ Signup failed:', error.message);
            return { success: false, error: error.message };
        }

        console.log('✅ Signup successful!');
        console.log('👤 User created:', data.user?.email);
        console.log('🔑 Session created:', !!data.session);

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('❌ Test error:', error);
        return { success: false, error: error.message };
    }
};
