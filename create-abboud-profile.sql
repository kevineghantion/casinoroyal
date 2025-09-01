-- Create abboud profile manually for testing
-- First, find if there's an auth user for abboud
SELECT id, email FROM auth.users WHERE email ILIKE '%abboud%' OR email ILIKE '%lacuento%';

-- If auth user exists, create profile (replace USER_ID with actual ID)
INSERT INTO public.profiles (id, username, email, role)
VALUES ('USER_ID_HERE', 'abboud', 'lacuentotadelroyales2@gmail.com', 'user');

-- Test the profile creation without specific user ID (will fail but show constraint)
INSERT INTO public.profiles (id, username, email, role)
VALUES (gen_random_uuid(), 'abboud', 'lacuentotadelroyales2@gmail.com', 'user');