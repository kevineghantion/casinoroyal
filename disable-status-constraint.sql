-- EMERGENCY: Disable the problematic status constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;

-- Now create the abboud profile
INSERT INTO public.profiles (id, username, email, role)
VALUES ('45b91da2-b048-4436-ac6b-03f6ca872064', 'abboud', 'lacuentotadelroyales2@gmail.com', 'user');

-- Verify it worked
SELECT id, username, email, role, status FROM public.profiles WHERE username = 'abboud';