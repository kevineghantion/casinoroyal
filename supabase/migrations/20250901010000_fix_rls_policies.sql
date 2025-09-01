-- Fix RLS policies to allow signup trigger to work
-- This allows the handle_new_user trigger to insert profiles during signup

-- Drop the restrictive policies that block signup
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a more permissive policy for profile creation during signup
CREATE POLICY "Allow profile creation during signup"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Keep the other policies for viewing and updating
-- (These are fine since they only apply after user is authenticated)
