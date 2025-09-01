-- Get the exact constraint definition to see what values are allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_status_check';

-- Also check if there are any existing profiles to see what status values work
SELECT DISTINCT status FROM public.profiles WHERE status IS NOT NULL;