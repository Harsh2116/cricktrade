import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    // Fetch users
    const [users] = await pool.query('SELECT id, username, name FROM users');
    const userIdToUsername = {};
    users.forEach(u => {
      userIdToUsername[u.id] = u.username;
    });

    // Fetch portfolios
    const [allPortfolios] = await pool.query('SELECT user_id, symbol, quantity, purchase_price FROM portfolios');

    // Fetch current stock prices (this example assumes static prices, adjust as needed)
    const stockPrices = {
      // Example: 'RUTG': 7.3, 'DECO': 3.1, ...
    };

    // Calculate user profits
    const userProfits = {};
    allPortfolios.forEach(p => {
      const price = stockPrices[p.symbol] || 0;
      const profit = (price - p.purchase_price) * p.quantity;
      if (!userProfits[p.user_id]) userProfits[p.user_id] = 0;
      userProfits[p.user_id] += profit;
    });

    // Create leaderboard array
    const leaderboard = users.map(u => ({
      username: u.username,
      name: u.name,
      profit: userProfits[u.id] || 0,
    }));

    // Sort descending by profit
    leaderboard.sort((a, b) => b.profit - a.profit);

    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Server error fetching leaderboard.' });
  }
}
