import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { symbol, newPrice } = req.body;

    if (!symbol || typeof newPrice !== 'number') {
      res.status(400).json({ error: 'Missing or invalid symbol or newPrice' });
      return;
    }

    // Update stock price in your stocks table or wherever you store it
    // Assuming you have a stocks table with symbol and price columns
    await pool.query('UPDATE stocks SET price = ? WHERE symbol = ?', [newPrice, symbol]);

    res.status(200).json({ message: 'Stock price updated successfully' });
  } catch (err) {
    console.error('Error updating stock price:', err);
    res.status(500).json({ error: 'Server error updating stock price' });
  }
}
