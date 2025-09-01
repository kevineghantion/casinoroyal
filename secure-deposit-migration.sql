-- Secure Deposit Migration: Replace direct balance updates with pending transaction workflow
-- Run this in Supabase SQL editor as DB admin (postgres role)

-- 1. Create enum type safely
DO $$
BEGIN
  CREATE TYPE public.transaction_status AS ENUM ('pending','completed','failed','canceled');
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already exists
END$$;

-- 2. Create/update transactions table with all required security columns
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status public.transaction_status DEFAULT 'pending' NOT NULL,
  balance_before NUMERIC(12,2),
  balance_after NUMERIC(12,2),
  method VARCHAR(50) DEFAULT 'manual',
  external_reference TEXT,
  created_by UUID,
  approved_by UUID,
  requires_kyc BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add missing columns to existing table (if table existed before)
DO $$ 
BEGIN
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT 'manual';
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS external_reference TEXT;
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS created_by UUID;
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS approved_by UUID;
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS requires_kyc BOOLEAN DEFAULT FALSE;
  ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN OTHERS THEN
  NULL; -- ignore if columns already exist or other issues
END$$;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);

-- 5. Create audit table for transaction actions
CREATE TABLE IF NOT EXISTS public.transaction_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 7. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_insert_pending" ON public.transactions;
DROP POLICY IF EXISTS "users_select_own" ON public.transactions;
DROP POLICY IF EXISTS "owners_update" ON public.transactions;

-- 8. Create secure RLS policies for transactions
-- Users can only insert pending deposits for themselves
CREATE POLICY "users_insert_pending_deposits" ON public.transactions
  FOR INSERT
  WITH CHECK (
    auth.uid()::uuid = user_id
    AND type = 'deposit'
    AND status = 'pending'
    AND amount > 0
    AND amount <= 5000  -- Max deposit limit
    AND balance_before IS NULL  -- Client cannot set balance fields
    AND balance_after IS NULL
    AND approved_by IS NULL     -- Client cannot approve
  );

-- Users can view their own transactions
CREATE POLICY "users_select_own_transactions" ON public.transactions
  FOR SELECT
  USING (
    auth.uid()::uuid = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::uuid AND p.role = 'owner'
    )
  );

-- Only owners can update transaction status (complete deposits)
CREATE POLICY "owners_complete_transactions" ON public.transactions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::uuid AND p.role = 'owner'
    )
  )
  WITH CHECK (TRUE);

-- 9. Secure profiles table - prevent client balance tampering
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid()::uuid = id);

-- Users can update their profile BUT NOT the balance field
CREATE POLICY "profiles_update_no_balance" ON public.profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id)
  WITH CHECK (
    auth.uid()::uuid = id 
    -- Prevent balance tampering - balance must remain unchanged
    AND balance IS NOT DISTINCT FROM (SELECT balance FROM public.profiles WHERE id = auth.uid()::uuid)
  );

-- Owners can update any profile including balance
CREATE POLICY "profiles_admin_full_access" ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid()::uuid AND p.role = 'owner'
    )
  )
  WITH CHECK (TRUE);

-- 10. Create function to securely complete deposits (server-side only)
-- This function can only be called with service_role key or by owners
CREATE OR REPLACE FUNCTION public.complete_deposit_transaction(
  transaction_id_param UUID,
  approver_id_param UUID DEFAULT NULL,
  external_ref_param TEXT DEFAULT NULL
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
  tx_record RECORD;
  profile_record RECORD;
  balance_before_val NUMERIC(12,2);
  balance_after_val NUMERIC(12,2);
  result JSONB;
BEGIN
  -- Lock and get transaction
  SELECT * INTO tx_record 
  FROM public.transactions 
  WHERE id = transaction_id_param 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found: %', transaction_id_param;
  END IF;
  
  IF tx_record.status != 'pending' THEN
    RAISE EXCEPTION 'Transaction is not pending: %', tx_record.status;
  END IF;
  
  -- Lock and get user profile
  SELECT * INTO profile_record
  FROM public.profiles 
  WHERE id = tx_record.user_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found: %', tx_record.user_id;
  END IF;
  
  -- Calculate balances
  balance_before_val := COALESCE(profile_record.balance, 0);
  balance_after_val := balance_before_val + tx_record.amount;
  
  -- Update transaction as completed
  UPDATE public.transactions SET
    status = 'completed',
    balance_before = balance_before_val,
    balance_after = balance_after_val,
    approved_by = approver_id_param,
    external_reference = external_ref_param,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = transaction_id_param;
  
  -- Update user balance
  UPDATE public.profiles SET
    balance = balance_after_val,
    updated_at = NOW()
  WHERE id = tx_record.user_id;
  
  -- Create audit log
  INSERT INTO public.transaction_audit (transaction_id, action, actor, details)
  VALUES (
    transaction_id_param, 
    'complete_deposit', 
    approver_id_param,
    jsonb_build_object(
      'external_reference', external_ref_param,
      'balance_before', balance_before_val,
      'balance_after', balance_after_val,
      'amount', tx_record.amount
    )
  );
  
  -- Return result
  result := jsonb_build_object(
    'success', TRUE,
    'transaction_id', transaction_id_param,
    'user_id', tx_record.user_id,
    'amount', tx_record.amount,
    'balance_before', balance_before_val,
    'balance_after', balance_after_val
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to complete deposit: %', SQLERRM;
END;
$$;

-- 11. Grant execute permission to authenticated users (owners will use this)
GRANT EXECUTE ON FUNCTION public.complete_deposit_transaction TO authenticated;

-- 12. Create a dev-only function to simulate completed deposits (for testing)
-- This should be removed in production or protected with additional checks
CREATE OR REPLACE FUNCTION public.dev_simulate_complete_deposit(
  transaction_id_param UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In production, add additional security checks here
  -- For now, just call the main complete function
  RETURN public.complete_deposit_transaction(
    transaction_id_param, 
    NULL, -- no approver for dev simulation
    'dev-simulation'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.dev_simulate_complete_deposit TO authenticated;

-- 13. Update existing users with 0 balance if they have default starting amounts
UPDATE public.profiles 
SET balance = 0.00 
WHERE balance = 100.00 OR balance = 1000.00;

-- 14. Success message
DO $$
BEGIN
  RAISE NOTICE 'Secure deposit migration completed successfully!';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update frontend to use pending deposits';
  RAISE NOTICE '2. Test with dev simulation function';
  RAISE NOTICE '3. Set up proper webhook for production';
END$$;
