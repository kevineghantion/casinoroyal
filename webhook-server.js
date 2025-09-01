// Simple Node.js webhook server to complete deposit transactions
// This demonstrates how to securely complete deposits using the service_role key
// DO NOT run this in production without proper authentication and security measures

const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// Environment variables required:
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Create Supabase client with service_role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Dev endpoint to simulate completing a deposit
app.post('/dev/complete-deposit', async (req, res) => {
    const { transactionId, externalRef } = req.body;

    if (!transactionId) {
        return res.status(400).json({ error: 'Missing transactionId' });
    }

    try {
        // Call the secure database function to complete the deposit
        const { data, error } = await supabase.rpc('complete_deposit_transaction', {
            transaction_id_param: transactionId,
            approver_id_param: null, // No specific approver for dev simulation
            external_ref_param: externalRef || 'dev-webhook-simulation'
        });

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: error.message });
        }

        console.log('Deposit completed:', data);
        res.json({
            success: true,
            message: 'Deposit completed successfully',
            data
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Production webhook endpoint (example for payment provider)
app.post('/webhook/payment-completed', async (req, res) => {
    // In production, add webhook signature verification here
    // Verify the webhook is from your payment provider

    const { transactionId, paymentProviderId, amount, status } = req.body;

    if (status !== 'completed') {
        return res.status(400).json({ error: 'Payment not completed' });
    }

    try {
        // Complete the deposit transaction
        const { data, error } = await supabase.rpc('complete_deposit_transaction', {
            transaction_id_param: transactionId,
            approver_id_param: null, // System approval
            external_ref_param: paymentProviderId
        });

        if (error) {
            console.error('Failed to complete deposit:', error);
            return res.status(500).json({ error: error.message });
        }

        // Respond to payment provider that webhook was processed
        res.json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
    console.log('Endpoints:');
    console.log('  POST /dev/complete-deposit - Dev simulation');
    console.log('  POST /webhook/payment-completed - Production webhook');
    console.log('  GET /health - Health check');
});

module.exports = app;
