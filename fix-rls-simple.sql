-- TestSprite Simple Fix: Remove problematic trigger and fix RLS

-- Remove the trigger that's causing 500 error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Create simple, working policies
CREATE POLICY "Enable read access for users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'user',
  balance DECIMAL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);