-- Create user_sessions table to track active sessions
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Enable RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy for user_sessions (users can see their own, owners can see all)
CREATE POLICY "Users can view own sessions" ON user_sessions
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Policy for inserting sessions (authenticated users only)
CREATE POLICY "Users can create sessions" ON user_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating sessions (users can update their own, owners can update all)
CREATE POLICY "Users can update own sessions" ON user_sessions
FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'owner'
  )
);

-- Function to automatically create session on login
CREATE OR REPLACE FUNCTION create_user_session()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark old sessions as inactive
  UPDATE user_sessions 
  SET is_active = false 
  WHERE user_id = NEW.id;
  
  -- Create new session
  INSERT INTO user_sessions (
    user_id,
    device_info,
    ip_address,
    user_agent,
    expires_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'device_info', 'Unknown Device'),
    COALESCE((NEW.raw_user_meta_data->>'ip_address')::inet, '0.0.0.0'::inet),
    COALESCE(NEW.raw_user_meta_data->>'user_agent', 'Unknown Browser'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'remember_me' = 'true' 
      THEN NOW() + INTERVAL '30 days'
      ELSE NOW() + INTERVAL '24 hours'
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create session on user login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION create_user_session();

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;