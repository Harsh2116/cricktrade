import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { userId, amount } = req.body;

    if (!userId || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ error: 'Invalid userId or amount' });
      return;
    }

    // Check wallet balance
    const [[wallet]] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [userId]);
    if (!wallet || wallet.balance < amount) {
      res.status(400).json({ error: 'Insufficient balance' });
      return;
    }

    // Deduct amount from wallet
    const newBalance = wallet.balance - amount;
    await pool.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [newBalance, userId]);

    // Record withdrawal transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, date) VALUES (?, ?, ?, NOW())',
      [userId, 'withdrawal', amount]
    );

    res.status(200).json({ message: 'Withdrawal successful', newBalance });
  } catch (err) {
    console.error('Error processing withdrawal:', err);
    res.status(500).json({ error: 'Server error processing withdrawal' });
  }
}
