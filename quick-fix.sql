-- Quick Fix for Supabase - Run this in SQL Editor

-- 1. Drop all existing policies to stop recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Owners can manage all profiles" ON profiles;

-- 2. Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_winnings DECIMAL(10,2) DEFAULT 0.00,
  total_losses DECIMAL(10,2) DEFAULT 0.00,
  games_played INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create simple policies without recursion
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users" ON profiles
FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create other tables
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2),
  balance_after DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all transactions for authenticated" ON transactions
FOR ALL USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all admin_actions for authenticated" ON admin_actions
FOR ALL USING (auth.role() = 'authenticated');

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

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all sessions for authenticated" ON user_sessions
FOR ALL USING (auth.role() = 'authenticated');