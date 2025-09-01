-- Check what the status constraint actually allows
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_status_check';

-- Try different status values to find what works
-- Test 1: NULL
INSERT INTO public.profiles (id, username, email, role, status)
VALUES (gen_random_uuid(), 'test1', 'test1@test.com', 'user', NULL);

-- Test 2: 'pending'
INSERT INTO public.profiles (id, username, email, role, status)
VALUES (gen_random_uuid(), 'test2', 'test2@test.com', 'user', 'pending');

-- Test 3: 'confirmed'  
INSERT INTO public.profiles (id, username, email, role, status)
VALUES (gen_random_uuid(), 'test3', 'test3@test.com', 'user', 'confirmed');

-- Test 4: 'verified'
INSERT INTO public.profiles (id, username, email, role, status)
VALUES (gen_random_uuid(), 'test4', 'test4@test.com', 'user', 'verified');

-- Clean up
DELETE FROM public.profiles WHERE username LIKE 'test%';