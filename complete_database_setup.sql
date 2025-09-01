-- Complete database setup for Casino Royal owner dashboard
-- This script creates both user_sessions and transactions tables with all required fields

-- 1. Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT, -- We'll populate this via trigger or manually
  device_info TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Add email field by joining with profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='user_sessions' AND column_name='user_email') THEN
    ALTER TABLE user_sessions ADD COLUMN user_email TEXT;
  END IF;
END $$;

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_sessions
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

-- 2. Create transactions table with all required columns
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  balance_before DECIMAL(10,2) DEFAULT 0,
  balance_after DECIMAL(10,2) DEFAULT 0,
  game_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraints for transactions
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('deposit', 'withdraw', 'bet', 'payout', 'adjustment'));

ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'reversed'));

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_admin_id ON transactions(admin_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_game_type ON transactions(game_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

DROP POLICY IF EXISTS "Owners can manage all transactions" ON transactions;
CREATE POLICY "Owners can manage all transactions" ON transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- 3. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for transactions updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Function to create user session on login (for AuthContext)
CREATE OR REPLACE FUNCTION create_user_session_on_login()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be called from your AuthContext login
  -- We'll handle session creation in the application code instead
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Add some sample data for testing (optional - remove in production)
-- You can uncomment these lines to add test data
/*
INSERT INTO transactions (user_id, type, amount, description, status)
SELECT 
  id as user_id,
  'deposit' as type,
  100.00 as amount,
  'Initial deposit' as description,
  'completed' as status
FROM profiles 
WHERE role = 'user' 
LIMIT 3;
*/

COMMENT ON TABLE user_sessions IS 'Stores active user authentication sessions';
COMMENT ON TABLE transactions IS 'Stores all user financial transactions with balance tracking';
