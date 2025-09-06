// Serverless function for Coinbase Commerce integration
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, userId, description } = req.body;
  const COINBASE_API_KEY = 'ebe0c643-cbac-43ae-b083-76b90bd749e5';

  try {
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
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Crypto deposit error:', error);
    res.status(500).json({ error: error.message });
  }
}