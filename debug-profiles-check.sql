-- TestSprite Debug: Check current state of profiles table

-- 1. Check what profiles currently exist
SELECT id, username, email, role, status FROM public.profiles;

-- 2. Check the exact status constraint definition
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname LIKE '%status%';

-- 3. Check table defaults
SELECT column_name, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Try manual insert (should work if constraint allows NULL or has default)
INSERT INTO public.profiles (id, username, email, role)
VALUES (gen_random_uuid(), 'testuser', 'test@example.com', 'user');

-- 5. Check if insert worked
SELECT * FROM public.profiles WHERE username = 'testuser';