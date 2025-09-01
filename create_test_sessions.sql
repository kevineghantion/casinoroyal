-- Insert test session data directly into the user_sessions table
-- Run this SQL in your Supabase SQL Editor after creating a user session

-- First, let's see what users exist
SELECT id, username, email FROM profiles LIMIT 5;

-- Insert a test session (replace 'USER_ID_HERE' with an actual user ID from above query)
INSERT INTO user_sessions (
  user_id,
  device_info,
  ip_address,
  user_agent,
  created_at,
  last_activity,
  expires_at,
  is_active
) VALUES (
  (SELECT id FROM profiles LIMIT 1), -- Gets first user ID
  'Chrome on Windows',
  '127.0.0.1'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '22 hours',
  true
);

-- Insert another test session
INSERT INTO user_sessions (
  user_id,
  device_info,
  ip_address,
  user_agent,
  created_at,
  last_activity,
  expires_at,
  is_active
) VALUES (
  (SELECT id FROM profiles LIMIT 1 OFFSET 1), -- Gets second user ID if exists
  'Safari on macOS',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '10 minutes',
  NOW() + INTERVAL '23 hours',
  true
);

-- Verify the sessions were created
SELECT 
  us.id,
  us.device_info,
  us.ip_address,
  us.is_active,
  us.created_at,
  p.username,
  p.email
FROM user_sessions us
JOIN profiles p ON us.user_id = p.id
ORDER BY us.last_activity DESC;
