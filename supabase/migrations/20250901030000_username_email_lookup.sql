-- Create function to get email by username (run this in Supabase SQL Editor)
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(p_username TEXT)
RETURNS TABLE(email TEXT)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT au.email
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.id
  WHERE p.username = p_username
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(TEXT) TO anon, authenticated;
