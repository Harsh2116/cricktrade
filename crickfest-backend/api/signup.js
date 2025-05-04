import { getPool } from './db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      res.status(400).json({ error: 'Missing username, password, or name' });
      return;
    }

    // Check if username already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query('INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)', [username, passwordHash, name]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Server error during signup' });
  }
}
