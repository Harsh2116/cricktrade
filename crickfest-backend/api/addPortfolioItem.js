import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { userId, symbol, quantity, purchasePrice } = req.body;

    if (!userId || !symbol || !quantity || !purchasePrice) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Insert portfolio item
    await pool.query(
      'INSERT INTO portfolios (user_id, symbol, quantity, purchase_price, purchase_date) VALUES (?, ?, ?, ?, NOW())',
      [userId, symbol, quantity, purchasePrice]
    );

    res.status(201).json({ message: 'Portfolio item added successfully' });
  } catch (err) {
    console.error('Error adding portfolio item:', err);
    res.status(500).json({ error: 'Server error adding portfolio item' });
  }
}
