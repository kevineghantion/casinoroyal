-- Recreate the jaypee user account
-- Run this in Supabase SQL Editor

-- First, create the auth user (you'll need to do this via Supabase Auth UI or API)
-- Then run this to create the profile:

INSERT INTO profiles (
  id, 
  username, 
  email, 
  role, 
  balance, 
  total_winnings, 
  total_losses, 
  games_played, 
  status,
  created_at,
  last_login_at
) VALUES (
  -- Replace this UUID with the actual user ID from auth.users after creating the user
  '00000000-0000-0000-0000-000000000000',
  'jaypee',
  'jpmawad@hotmail.com',
  'owner',
  0.00,
  0,
  0,
  0,
  'active',
  NOW(),
  NULL
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Create user_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
CREATE POLICY "Users can view own sessions" ON user_sessions
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

DROP POLICY IF EXISTS "Users can create sessions" ON user_sessions;
CREATE POLICY "Users can create sessions" ON user_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON user_sessions;
CREATE POLICY "Users can update own sessions" ON user_sessions
FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);