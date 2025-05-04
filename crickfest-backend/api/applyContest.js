import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { username, contestName } = req.body;

    if (!username || !contestName) {
      res.status(400).json({ error: 'Missing username or contestName' });
      return;
    }

    // Get user id
    const [[userRow]] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (!userRow) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const userId = userRow.id;

    // Check if user already applied to this contest
    const [existing] = await pool.query('SELECT id FROM contest_participation WHERE user_id = ? AND contest_name = ?', [userId, contestName]);
    if (existing.length > 0) {
      res.status(400).json({ error: 'You have already applied to this contest.' });
      return;
    }

    // Check if user rebought stocks after last contest end (10:30 PM)
    const now = new Date();
    let lastContestEnd = new Date();
    lastContestEnd.setHours(22, 30, 0, 0); // 10:30 PM today
    if (now < lastContestEnd) {
      lastContestEnd.setDate(lastContestEnd.getDate() - 1);
    }

    const [recentPurchases] = await pool.query(
      'SELECT id FROM portfolios WHERE user_id = ? AND purchase_date > ?',
      [userId, lastContestEnd]
    );
    if (recentPurchases.length === 0) {
      res.status(400).json({ error: 'You must rebuy stocks after the last contest ended (10:30 PM) to participate again.' });
      return;
    }

    // Insert participation record
    await pool.query('INSERT INTO contest_participation (user_id, contest_name) VALUES (?, ?)', [userId, contestName]);

    res.status(200).json({ message: `Successfully applied to ${contestName}.` });
  } catch (err) {
    console.error('Error applying to contest:', err);
    res.status(500).json({ error: 'Server error while applying to contest.' });
  }
}
