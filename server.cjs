const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'API server working!' });
});

// Crypto deposit endpoint
app.post('/api/crypto-deposit', async (req, res) => {
  console.log('Crypto deposit request:', req.body);
  const { amount, currency, userId, description } = req.body;
  const COINBASE_API_KEY = 'ebe0c643-cbac-43ae-b083-76b90bd749e5';

  try {
    console.log('Making request to Coinbase...');
    
    // Use dynamic import for fetch in Node.js
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': COINBASE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: 'Casino Royal Deposit',
        description: description || `Deposit $${amount} to Casino Royal`,
        local_price: {
          amount: amount.toString(),
          currency: currency
        },
        pricing_type: 'fixed_price',
        metadata: {
          user_id: userId,
          type: 'deposit'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create crypto charge');
    }

    const result = await response.json();
    console.log('Coinbase response:', JSON.stringify(result, null, 2));
    res.json(result.data);
  } catch (error) {
    console.error('Crypto deposit error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Server is ready to accept requests');
});