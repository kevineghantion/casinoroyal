-- Create abboud profile with the correct UUID
INSERT INTO public.profiles (id, username, email, role)
VALUES ('45b91da2-b048-4436-ac6b-03f6ca872064', 'abboud', 'lacuentotadelroyales2@gmail.com', 'user');

-- Verify the profile was created
SELECT id, username, email, role, status FROM public.profiles WHERE username = 'abboud';