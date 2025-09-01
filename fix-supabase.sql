-- Clean fix for existing policy conflict - UPDATED VERSION
-- Run this to resolve the "policy already exists" error

-- 1. Drop ALL existing profile policies to start clean
DROP POLICY IF EXISTS "profiles_update_no_balance" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_no_balance_simple" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 2. Create clean, simple policies that work
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid()::uuid = id OR 
         EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'owner'));

CREATE POLICY "profiles_update_safe" ON public.profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id OR 
         EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'owner'))
  WITH CHECK (auth.uid()::uuid = id OR 
              EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid()::uuid AND p.role = 'owner'));

-- 3. Create the balance protection trigger (this is the real security)
CREATE OR REPLACE FUNCTION prevent_balance_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow owners to update balance
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()::uuid AND role = 'owner') THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, preserve the old balance
  IF OLD.balance IS DISTINCT FROM NEW.balance THEN
    NEW.balance := OLD.balance;
    RAISE WARNING 'Balance update blocked for user %', auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Apply the trigger
DROP TRIGGER IF EXISTS prevent_balance_tampering_trigger ON public.profiles;
CREATE TRIGGER prevent_balance_tampering_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_balance_tampering();

-- 5. Test message
DO $$
BEGIN
  RAISE NOTICE 'Profile policies cleaned and balance protection applied!';
  RAISE NOTICE 'You should now be able to login with username or email.';
END$$;

-- 4. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create simple RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Owners can manage all profiles" ON profiles;
CREATE POLICY "Owners can manage all profiles" ON profiles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- 6. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw', 'win', 'loss', 'adjustment')),
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2),
  balance_after DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 8. Create transaction policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('owner', 'admin')
  )
);

-- 9. Create admin_actions table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enable RLS on admin_actions
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- 11. Create admin_actions policy
DROP POLICY IF EXISTS "Owners can manage admin actions" ON admin_actions;
CREATE POLICY "Owners can manage admin actions" ON admin_actions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- 12. Create user_sessions table
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

-- 13. Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 14. Create user_sessions policies
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

-- 15. Create your owner account
-- First delete any existing profile
DELETE FROM profiles WHERE email = 'jpmawad@hotmail.com';

-- Insert your profile (you'll need to create the auth user first)
INSERT INTO profiles (
  id, 
  username, 
  email, 
  role, 
  balance, 
  status
) 
SELECT 
  id,
  'jaypee',
  'jpmawad@hotmail.com',
  'owner',
  0.00,
  'active'
FROM auth.users 
WHERE email = 'jpmawad@hotmail.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  role = EXCLUDED.role;

-- 16. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);