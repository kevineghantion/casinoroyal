-- Complete fix for RLS policies and signup issues

-- Drop all existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that allow signup to work
CREATE POLICY "Enable read access for authenticated users"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow the signup trigger to work by creating a service role policy
CREATE POLICY "Allow signup trigger to create profiles"
ON public.profiles FOR INSERT
WITH CHECK (true);

-- Also ensure the trigger function has proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
