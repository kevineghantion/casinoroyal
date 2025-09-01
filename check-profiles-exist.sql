-- Check if any profiles exist and what usernames are there
SELECT id, username, email, status FROM public.profiles ORDER BY created_at DESC;

-- Check if abboud user exists with any variation
SELECT * FROM public.profiles WHERE username ILIKE '%abboud%' OR email ILIKE '%abboud%';

-- Check recent auth users (to see if signup created auth but no profile)
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;