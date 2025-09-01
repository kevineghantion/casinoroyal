# Secure Deposit Implementation Guide

This implementation replaces the insecure direct balance updates with a secure pending deposit workflow.

## Security Problem (Before)

The original `useBalance` hook allowed client-side code to directly update `profiles.balance`:
- Anyone with dev tools could call `deposit()` for free money
- No verification, limits, or audit trail
- Race conditions possible with concurrent updates
- Regulatory/compliance risks

## Secure Solution (After)

### Workflow
1. **Client Request**: User clicks "Request Deposit" → creates `transactions` row with `status='pending'`
2. **No Balance Change**: `profiles.balance` remains unchanged until verification
3. **Server Completion**: Trusted server/webhook atomically marks transaction `completed` and updates balance
4. **Audit Trail**: All actions logged in `transaction_audit`

### Files Changed

#### 1. Database Schema (`secure-deposit-migration.sql`)
- Added `transaction_status` enum
- Enhanced `transactions` table with security fields
- Created `transaction_audit` table
- Implemented secure RLS policies
- Added `complete_deposit_transaction()` function for server-side completion

#### 2. Frontend Hook (`src/hooks/useBalance.ts`)
- `deposit()` now creates pending transactions instead of updating balance
- Added `devSimulateCompleteDeposit()` for testing
- Removed unsafe direct balance updates
- Added client-side validation (max $5000 per deposit)

#### 3. Webhook Server (`webhook-server.js`)
- Example Node.js server using service_role key
- Dev endpoint: `/dev/complete-deposit` for testing
- Production endpoint: `/webhook/payment-completed` for real providers

## Setup Instructions

### Step 1: Run Database Migration
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste content from `secure-deposit-migration.sql`
3. Run as DB admin (postgres role)
4. Verify success - should see "Secure deposit migration completed successfully!"

### Step 2: Update Frontend
The `useBalance` hook has been updated. Key changes:
- `deposit(amount)` now creates pending transactions
- Use `devSimulateCompleteDeposit(transactionId)` for testing
- `refreshBalance()` re-fetches from database

### Step 3: Regenerate Supabase Types
```bash
# Generate updated TypeScript types
npx supabase gen types typescript --project-id your-project-id > src/integrations/supabase/types.ts
```

### Step 4: Test the Implementation

#### Option A: Database Function (Recommended)
1. Create a pending deposit through the UI
2. In Supabase SQL Editor, find your transaction:
   ```sql
   SELECT id, user_id, amount, status FROM transactions WHERE status = 'pending' ORDER BY created_at DESC LIMIT 5;
   ```
3. Complete it manually:
   ```sql
   SELECT complete_deposit_transaction('your-transaction-id-here');
   ```

#### Option B: Dev Webhook Server
1. Install dependencies:
   ```bash
   npm install express @supabase/supabase-js
   ```
2. Set environment variables:
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```
3. Run the webhook server:
   ```bash
   node webhook-server.js
   ```
4. Test with curl:
   ```bash
   curl -X POST http://localhost:3001/dev/complete-deposit \
     -H "Content-Type: application/json" \
     -d '{"transactionId": "your-transaction-id"}'
   ```

## Security Features

### Row Level Security (RLS)
- Users can only insert pending deposits for themselves
- Users cannot modify `status`, `balance_before`, `balance_after`, or `approved_by`
- Only owners/service_role can complete transactions
- Clients cannot directly update `profiles.balance`

### Validation & Limits
- Client-side: max $5000 per deposit
- Server-side: amount > 0 validation in database
- Status transitions: only pending → completed allowed
- Atomic updates: balance and transaction updated together

### Audit Trail
- All completions logged in `transaction_audit`
- Tracks who approved, when, and external references
- Immutable audit records

## UI Changes

### Deposit Button
- Text: "Request Deposit" (instead of "Deposit")
- Shows pending status after submission
- Explains manual processing in modal

### Balance Display
- Shows only completed/credited balance
- Pending deposits don't affect gambling balance
- Optional: show pending amount separately

### User Messaging
```
"Deposits are processed manually until payment provider integration. 
Your request will show as Pending and funds appear after verification 
(usually under 24 hours)."
```

## Production Checklist

### Before Going Live
- [ ] Remove or secure dev simulation endpoints
- [ ] Implement proper webhook signature verification
- [ ] Set up monitoring/alerts for suspicious activity
- [ ] Add rate limiting on deposit requests
- [ ] Configure daily/monthly deposit limits
- [ ] Implement KYC thresholds
- [ ] Set up admin approval workflow
- [ ] Test with real payment provider sandbox

### Security Tests
- [ ] Verify clients cannot update transaction status
- [ ] Verify clients cannot modify profiles.balance
- [ ] Test concurrent deposit completion (should serialize)
- [ ] Verify RLS policies block unauthorized access
- [ ] Test with non-owner user trying to complete deposits

## Troubleshooting

### Common Issues
1. **TypeScript errors**: Regenerate Supabase types after migration
2. **"transactions does not exist"**: Run the SQL migration
3. **Permission denied**: Check RLS policies and user roles
4. **Balance not updating**: Verify `complete_deposit_transaction` was called

### Debug Queries
```sql
-- Check pending deposits
SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at DESC;

-- Check user balance
SELECT username, balance FROM profiles WHERE email = 'your-email';

-- View audit log
SELECT * FROM transaction_audit ORDER BY created_at DESC LIMIT 10;

-- Check RLS policies
SELECT tablename, policyname, roles FROM pg_policies WHERE tablename = 'transactions';
```

## Next Steps

1. **Withdrawals**: Implement similar secure workflow for withdrawals
2. **Betting**: Track bets and wins in transactions table
3. **Payment Integration**: Connect to Stripe/PayPal/etc webhooks
4. **Admin Dashboard**: Build UI for manual approvals
5. **Monitoring**: Set up alerts for large/frequent deposits

## Environment Variables

### Required for Webhook Server
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
```

### Optional Limits
```bash
MAX_DEPOSIT_AMOUNT=5000
DAILY_DEPOSIT_LIMIT=10000
KYC_THRESHOLD=2000
```
