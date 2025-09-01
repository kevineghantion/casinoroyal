-- Check what values are allowed in profiles_status_check constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_status_check';

-- Test different status values to find the allowed ones
-- Try these one by one:

-- Test 1: null (might be allowed)
INSERT INTO public.profiles (id, username, email, role, balance)
VALUES (gen_random_uuid(), 'test1', 'test1@test.com', 'user', 1000);

-- Test 2: 'pending' 
INSERT INTO public.profiles (id, username, email, role, balance, status)
VALUES (gen_random_uuid(), 'test2', 'test2@test.com', 'user', 1000, 'pending');

-- Test 3: 'confirmed'
INSERT INTO public.profiles (id, username, email, role, balance, status)
VALUES (gen_random_uuid(), 'test3', 'test3@test.com', 'user', 1000, 'confirmed');

-- Clean up test rows
DELETE FROM public.profiles WHERE username LIKE 'test%';