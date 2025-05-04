import { getPool } from './db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Missing username or password' });
      return;
    }

    const [[user]] = await pool.query('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);

    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // For simplicity, return user info. In production, generate JWT or session token.
    res.status(200).json({ message: 'Login successful', userId: user.id, username: user.username });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
}
