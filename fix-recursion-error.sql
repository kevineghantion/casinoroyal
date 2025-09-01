-- URGENT: Fix infinite recursion in profiles policy
-- Run this IMMEDIATELY to fix login issues

-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "profiles_update_no_balance" ON public.profiles;

-- 2. Create a simpler policy that doesn't cause recursion
CREATE POLICY "profiles_update_no_balance_simple" ON public.profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id)
  WITH CHECK (auth.uid()::uuid = id);

-- 3. Alternative: Disable balance updates via a trigger instead
-- This prevents client balance tampering without RLS complexity
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
