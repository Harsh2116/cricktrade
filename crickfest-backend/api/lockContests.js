import { getPool } from './db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pool = getPool();

  try {
    // Lock contests
    // This example assumes you have a way to store contestLock state, e.g., in DB or cache
    // For simplicity, this function will perform prize distribution and cleanup

    // Fetch users and calculate leaderboard as in getLeaderboard
    const [users] = await pool.query('SELECT id, username, name FROM users');
    const userIdToUsername = {};
    users.forEach(u => {
      userIdToUsername[u.id] = u.username;
    });

    const [allPortfolios] = await pool.query('SELECT user_id, symbol, quantity, purchase_price FROM portfolios');

    // Fetch current stock prices (adjust as needed)
    const stockPrices = {
      // Example: 'RUTG': 7.3, 'DECO': 3.1, ...
    };

    const userProfits = {};
    allPortfolios.forEach(p => {
      const price = stockPrices[p.symbol] || 0;
      const profit = (price - p.purchase_price) * p.quantity;
      if (!userProfits[p.user_id]) userProfits[p.user_id] = 0;
      userProfits[p.user_id] += profit;
    });

    const contestPrizes = [
      { minProfit: 80, prize: 120, contestName: 'Contest 1' },
      { minProfit: 200, prize: 250, contestName: 'Contest 2' },
      { minProfit: 500, prize: 600, contestName: 'Contest 3' }
    ];

    for (const contest of contestPrizes) {
      const [participants] = await pool.query('SELECT user_id FROM contest_participation WHERE contest_name = ?', [contest.contestName]);

      const participantProfits = participants.map(p => ({
        userId: p.user_id,
        profit: userProfits[p.userId] || 0
      }));

      participantProfits.sort((a, b) => b.profit - a.profit);

      const cutoffIndex = Math.floor(participantProfits.length * 0.7);

      for (let i = 0; i < cutoffIndex; i++) {
        const user = participantProfits[i];
        if (user.profit >= contest.minProfit) {
          await pool.query(
            'INSERT INTO user_winnings (user_id, contest_name, amount) VALUES (?, ?, ?)',
            [user.userId, contest.contestName, contest.prize]
          );

          const [[walletRow]] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [user.userId]);
          let currentBalance = walletRow ? parseFloat(walletRow.balance) : 0;
          currentBalance += contest.prize;
          if (walletRow) {
            await pool.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [currentBalance, user.userId]);
          } else {
            await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [user.userId, currentBalance]);
          }
        }
      }
    }

    // Clear contest participation after prize distribution
    await pool.query('DELETE FROM contest_participation');

    // Halve portfolio quantities for users who participated
    const [participatedUsers] = await pool.query('SELECT DISTINCT user_id FROM contest_participation');
    for (const user of participatedUsers) {
      const [portfolioItems] = await pool.query('SELECT id, quantity FROM portfolios WHERE user_id = ?', [user.user_id]);
      for (const item of portfolioItems) {
        const newQuantity = Math.floor(item.quantity / 2);
        if (newQuantity !== item.quantity) {
          if (newQuantity > 0) {
            await pool.query('UPDATE portfolios SET quantity = ? WHERE id = ?', [newQuantity, item.id]);
          } else {
            await pool.query('DELETE FROM portfolios WHERE id = ?', [item.id]);
          }
        }
      }
    }

    res.status(200).json({ message: 'Contests locked and prizes distributed.' });
  } catch (err) {
    console.error('Error locking contests:', err);
    res.status(500).json({ error: 'Server error locking contests.' });
  }
}
