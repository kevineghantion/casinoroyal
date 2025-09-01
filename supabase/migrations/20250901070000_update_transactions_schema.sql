-- Update transactions table to match the API expectations
-- Add missing columns and update type constraints

-- First, add missing columns with default values for existing records
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS game_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the type constraint to match API expectations
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('deposit', 'withdraw', 'bet', 'payout', 'adjustment'));

-- Update the status constraint to include 'reversed' status
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN ('pending', 'completed', 'failed', 'reversed'));

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing 'win' and 'loss' types to 'payout' and 'bet' respectively
-- This is a data migration for any existing records
UPDATE transactions SET type = 'payout' WHERE type = 'win';
UPDATE transactions SET type = 'bet' WHERE type = 'loss';

-- Create index on game_type for performance
CREATE INDEX IF NOT EXISTS idx_transactions_game_type ON transactions(game_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
