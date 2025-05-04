import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    // For demo, fetch all stocks, portfolio for user, and wallet balance
    // User identification can be done via query param or auth token; here we use query param userId
    const userId = req.query.userId;

    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    // Fetch stocks - assuming a stocks table with symbol, name, price, change, volume
    const [stocks] = await pool.query('SELECT symbol, name, price, change, volume FROM stocks');

    // Fetch user portfolio
    const [portfolioRows] = await pool.query(
      'SELECT symbol, quantity, purchase_price as purchasePrice FROM portfolios WHERE user_id = ?',
      [userId]
    );

    // Convert portfolio rows to object keyed by symbol
    const portfolio = {};
    portfolioRows.forEach(item => {
      portfolio[item.symbol] = {
        symbol: item.symbol,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice
      };
    });

    // Fetch wallet balance
    const [[wallet]] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
    const walletBalance = wallet ? parseFloat(wallet.balance) : 0;

    res.status(200).json({
      stocks,
      portfolio,
      walletBalance
    });
  } catch (err) {
    console.error('Error fetching updates:', err);
    res.status(500).json({ error: 'Server error fetching updates' });
  }
}
