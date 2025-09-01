-- EMERGENCY: Disable all triggers causing 500 error

-- Drop ALL triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;

-- Drop ALL functions that might be causing issues
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Disable RLS temporarily to allow manual profile creation
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Simple table structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  username TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  balance DECIMAL DEFAULT 1000
);