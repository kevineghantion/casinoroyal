-- Find what status values are actually allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_status_check';

-- Try common status values one by one
INSERT INTO public.profiles (id, username, email, role, status)
VALUES (gen_random_uuid(), 'test2', 'test2@test.com', 'user', 'pending');

-- If pending fails, try:
-- 'confirmed', 'verified', 'enabled', 'disabled', 'online', 'offline'