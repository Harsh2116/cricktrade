import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    const [portfolioItems] = await pool.query(
      'SELECT symbol, quantity, purchase_price, purchase_date FROM portfolios WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({ portfolio: portfolioItems });
  } catch (err) {
    console.error('Error fetching portfolio:', err);
    res.status(500).json({ error: 'Server error fetching portfolio' });
  }
}
