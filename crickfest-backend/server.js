const { exec } = require('child_process');

const WebSocket = require('ws');
const http = require('http');
const mysql = require('mysql2/promise'); // Using promise-based mysql2 client
const bcrypt = require('bcryptjs');

const PORT = 8080;


// MySQL connection pool setup
const pool = mysql.createPool({
    host: 'localhost',       // Update if your MySQL host is different
    user: 'root',            // Update with your MySQL username
    password: 'Harsh@1981',            // Update with your MySQL password
    database: 'crickfest_db_new',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export pool for use in other modules if needed
module.exports = { pool };


// Initial stock data (same as frontend base data)
function generateSymbol(name) {
    return name.split(' ').map(word => word[0].toUpperCase()).join('').slice(0, 4);
}

const iplPlayers = [
    { symbol: generateSymbol("Ruturaj Gaikwad"), name: "Ruturaj Gaikwad", basePrice: 7.3, price: 7.3, volume: 100000000, initialVolume: 100000000 },
    { symbol: generateSymbol("Devon Conway"), name: "Devon Conway", basePrice: 3.1, price: 3.1, volume: 100000000, initialVolume: 100000000 },
    { symbol: generateSymbol("Rahul Tripathi"), name: "Rahul Tripathi", basePrice: 9.6, price: 9.6, volume: 100000000, initialVolume: 100000000 },
    { symbol: generateSymbol("Shivam Dube"), name: "Shivam Dube", basePrice: 2.7, price: 2.7, volume: 100000000 },
    { symbol: generateSymbol("Sam Curran"), name: "Sam Curran", basePrice: 4.5, price: 4.5, volume: 100000000 },
    { symbol: generateSymbol("Ravindra Jadeja"), name: "Ravindra Jadeja", basePrice: 6.8, price: 6.8, volume: 100000000 },
    { symbol: generateSymbol("Ravichandran Ashwin"), name: "Ravichandran Ashwin", basePrice: 1.9, price: 1.9, volume: 100000000 },
    { symbol: generateSymbol("Anshul Kamboj"), name: "Anshul Kamboj", basePrice: 3.3, price: 3.3, volume: 100000000 },
    { symbol: generateSymbol("Noor Ahmad"), name: "Noor Ahmad", basePrice: 7.7, price: 7.7, volume: 100000000 },
    { symbol: generateSymbol("Matheesha Pathirana"), name: "Matheesha Pathirana", basePrice: 9.3, price: 9.3, volume: 100000000 },
    { symbol: generateSymbol("Rohit Sharma"), name: "Rohit Sharma", basePrice: 3.6, price: 3.6, volume: 100000000 },
    { symbol: generateSymbol("Will Jacks"), name: "Will Jacks", basePrice: 4.1, price: 4.1, volume: 100000000 },
    { symbol: generateSymbol("Suryakumar Yadav"), name: "Suryakumar Yadav", basePrice: 5.2, price: 5.2, volume: 100000000 },
    { symbol: generateSymbol("Tilak Varma"), name: "Tilak Varma", basePrice: 6.3, price: 6.3, volume: 100000000 },
    { symbol: generateSymbol("Hardik Pandya (c)"), name: "Hardik Pandya (c)", basePrice: 3.0, price: 3.0, volume: 100000000 },
    { symbol: generateSymbol("Naman Dhir"), name: "Naman Dhir", basePrice: 7.0, price: 7.0, volume: 100000000 },
    { symbol: generateSymbol("Ryan Rickelton"), name: "Ryan Rickelton", basePrice: 2.3, price: 2.3, volume: 100000000 },
    { symbol: generateSymbol("Mitchell Santner"), name: "Mitchell Santner", basePrice: 8.6, price: 8.6, volume: 100000000 },
    { symbol: generateSymbol("Jasprit Bumrah"), name: "Jasprit Bumrah", basePrice: 4.7, price: 4.7, volume: 100000000 },
    { symbol: generateSymbol("Trent Boult"), name: "Trent Boult", basePrice: 3.9, price: 3.9, volume: 100000000 },
    { symbol: generateSymbol("Deepak Chahar"), name: "Deepak Chahar", basePrice: 6.1, price: 6.1, volume: 100000000 },
    { symbol: generateSymbol("Shubman Gill"), name: "Shubman Gill (C)", basePrice: 9.0, price: 9.0, volume: 100000000 },
    { symbol: generateSymbol("Jos Buttler"), name: "Jos Buttler", basePrice: 7.4, price: 7.4, volume: 100000000 },
    { symbol: generateSymbol("Sai Sudharsan"), name: "Sai Sudharsan", basePrice: 3.2, price: 3.2, volume: 100000000 },
    { symbol: generateSymbol("Mahipal Lomror"), name: "Mahipal Lomror", basePrice: 1.7, price: 1.7, volume: 100000000 },
    { symbol: generateSymbol("Glenn Phillips"), name: "Glenn Phillips", basePrice: 4.9, price: 4.9, volume: 100000000 },
    { symbol: generateSymbol("Shahrukh Khan"), name: "Shahrukh Khan", basePrice: 5.6, price: 5.6, volume: 100000000 },
    { symbol: generateSymbol("Washington Sundar"), name: "Washington Sundar", basePrice: 6.4, price: 6.4, volume: 100000000 },
    { symbol: generateSymbol("Rashid Khan"), name: "Rashid Khan", basePrice: 7.1, price: 7.1, volume: 100000000 },
    { symbol: generateSymbol("Mohammed Siraj"), name: "Mohammed Siraj", basePrice: 3.4, price: 3.4, volume: 100000000 },
    { symbol: generateSymbol("Kagiso Rabada"), name: "Kagiso Rabada", basePrice: 8.0, price: 8.0, volume: 100000000 },
    { symbol: generateSymbol("Prasidh Krishna"), name: "Prasidh Krishna", basePrice: 2.8, price: 2.8, volume: 100000000 },
    { symbol: generateSymbol("Quinton de Kock"), name: "Quinton de Kock", basePrice: 4.6, price: 4.6, volume: 100000000 },
    { symbol: generateSymbol("Sunil Narine"), name: "Sunil Narine", basePrice: 5.3, price: 5.3, volume: 100000000 },
    { symbol: generateSymbol("Venkatesh Iyer"), name: "Venkatesh Iyer", basePrice: 3.7, price: 3.7, volume: 100000000 },
    { symbol: generateSymbol("Ajinkya Rahane"), name: "Ajinkya Rahane (C)", basePrice: 6.5, price: 6.5, volume: 100000000 },
    { symbol: generateSymbol("Rinku Singh"), name: "Rinku Singh", basePrice: 1.8, price: 1.8, volume: 100000000 },
    { symbol: generateSymbol("Andre Russell"), name: "Andre Russell", basePrice: 9.4, price: 9.4, volume: 100000000 },
    { symbol: generateSymbol("Ramandeep Singh"), name: "Ramandeep Singh", basePrice: 3.3, price: 3.3, volume: 100000000 },
    { symbol: generateSymbol("Harshit Rana"), name: "Harshit Rana", basePrice: 2.6, price: 2.6, volume: 100000000 },
    { symbol: generateSymbol("Varun Chakaravarthy"), name: "Varun Chakaravarthy", basePrice: 7.2, price: 7.2, volume: 100000000 },
    { symbol: generateSymbol("Spencer Johnson"), name: "Spencer Johnson", basePrice: 4.4, price: 4.4, volume: 100000000 },
    { symbol: generateSymbol("Vaibhav Arora"), name: "Vaibhav Arora", basePrice: 3.1, price: 3.1, volume: 100000000 },
    { symbol: generateSymbol("Virat Kohli"), name: "Virat Kohli", basePrice: 8.9, price: 8.9, volume: 100000000 },
    { symbol: generateSymbol("Phil Salt"), name: "Phil Salt", basePrice: 5.0, price: 5.0, volume: 100000000 },
    { symbol: generateSymbol("Liam Livingstone"), name: "Liam Livingstone", basePrice: 6.6, price: 6.6, volume: 100000000 },
    { symbol: generateSymbol("Rajat Patidar"), name: "Rajat Patidar", basePrice: 3.5, price: 3.5, volume: 100000000 },
    { symbol: generateSymbol("Krunal Pandya"), name: "Krunal Pandya", basePrice: 7.0, price: 7.0, volume: 100000000 },
    { symbol: generateSymbol("Jitesh Sharma (wk)"), name: "Jitesh Sharma (wk)", basePrice: 2.9, price: 2.9, volume: 100000000 },
    { symbol: generateSymbol("Tim David"), name: "Tim David", basePrice: 4.3, price: 4.3, volume: 100000000 },
    { symbol: generateSymbol("Rasikh Salam"), name: "Rasikh Salam", basePrice: 1.6, price: 1.6, volume: 100000000 },
    { symbol: generateSymbol("Bhuvneshwar Kumar"), name: "Bhuvneshwar Kumar", basePrice: 5.7, price: 5.7, volume: 100000000 },
    { symbol: generateSymbol("Josh Hazlewood"), name: "Josh Hazlewood", basePrice: 6.2, price: 6.2, volume: 100000000 },
    { symbol: generateSymbol("Yash Dayal"), name: "Yash Dayal", basePrice: 3.9, price: 3.9, volume: 100000000 },
    { symbol: generateSymbol("Yashasvi Jaiswal"), name: "Yashasvi Jaiswal", basePrice: 4.8, price: 4.8, volume: 100000000 },
    { symbol: generateSymbol("Sanju Samson"), name: "Sanju Samson", basePrice: 6.0, price: 6.0, volume: 100000000 },
    { symbol: generateSymbol("Nitesh Rana"), name: "Nitesh Rana", basePrice: 5.4, price: 5.4, volume: 100000000 },
    { symbol: generateSymbol("Riyan Parag"), name: "Riyan Parag", basePrice: 3.1, price: 3.1, volume: 100000000 },
    { symbol: generateSymbol("Dhruv Jurel"), name: "Dhruv Jurel", basePrice: 2.7, price: 2.7, volume: 100000000 },
    { symbol: generateSymbol("Shimron Hetmyer"), name: "Shimron Hetmyer", basePrice: 6.4, price: 6.4, volume: 100000000 },
    { symbol: generateSymbol("Wanindu Hasaranga"), name: "Wanindu Hasaranga", basePrice: 5.1, price: 5.1, volume: 100000000 },
    { symbol: generateSymbol("Shubham Dubey/Akash Madhwal"), name: "Shubham Dubey/Akash Madhwal", basePrice: 3.3, price: 3.3, volume: 100000000 },
    { symbol: generateSymbol("Jofra Archer"), name: "Jofra Archer", basePrice: 7.5, price: 7.5, volume: 100000000 },
    { symbol: generateSymbol("Maheesh Theekshana"), name: "Maheesh Theekshana", basePrice: 4.0, price: 4.0, volume: 100000000 },
    { symbol: generateSymbol("Sandeep Sharma"), name: "Sandeep Sharma", basePrice: 3.6, price: 3.6, volume: 100000000 },
    { symbol: generateSymbol("Abhishek Sharma"), name: "Abhishek Sharma", basePrice: 6.3, price: 6.3, volume: 100000000 },
    { symbol: generateSymbol("Ishan Kishan (wk)"), name: "Ishan Kishan (wk)", basePrice: 7.1, price: 7.1, volume: 100000000 },
    { symbol: generateSymbol("Nitesh Reddy"), name: "Nitesh Reddy", basePrice: 5.2, price: 5.2, volume: 100000000 },
    { symbol: generateSymbol("Heinrich Klaasen"), name: "Heinrich Klaasen", basePrice: 6.0, price: 6.0, volume: 100000000 },
    { symbol: generateSymbol("Aniket Verma"), name: "Aniket Verma", basePrice: 3.4, price: 3.4, volume: 100000000 },
    { symbol: generateSymbol("Abhinav Manohar"), name: "Abhinav Manohar", basePrice: 5.7, price: 5.7, volume: 100000000 },
    { symbol: generateSymbol("Pat Cummins"), name: "Pat Cummins", basePrice: 7.1, price: 7.1, volume: 100000000 },
    { symbol: generateSymbol("Harshal Patel"), name: "Harshal Patel", basePrice: 6.3, price: 6.3, volume: 100000000 },
    { symbol: generateSymbol("Rahul Chahar"), name: "Rahul Chahar", basePrice: 4.2, price: 4.2, volume: 100000000 },
    { symbol: generateSymbol("Mohammed Shami"), name: "Mohammed Shami", basePrice: 6.7, price: 6.7, volume: 100000000 },
    { symbol: generateSymbol("Josh Inglis (wk)"), name: "Josh Inglis (wk)", basePrice: 7.0, price: 7.0, volume: 100000000 },
    { symbol: generateSymbol("Prabhsimran Singh"), name: "Prabhsimran Singh", basePrice: 5.5, price: 5.5, volume: 100000000 },
    { symbol: generateSymbol("Marcus Stoinis"), name: "Marcus Stoinis", basePrice: 6.8, price: 6.8, volume: 100000000 },
    { symbol: generateSymbol("Shreyas Iyer"), name: "Shreyas Iyer", basePrice: 5.1, price: 5.1, volume: 100000000 }
];

// Helper function to find player by symbol
function findPlayer(symbol) {
    return iplPlayers.find(p => p.symbol === symbol);
}

// Update stock price based on volume changes
function updatePrice(stock) {
    const initialVolume = stock.initialVolume !== undefined ? stock.initialVolume : 100000000;
    const volumeIncrease = stock.volume - initialVolume;
    let priceDecreaseSteps = 0;
    let priceDecrease = 0;
    if (volumeIncrease > 0) {
        // Lower threshold for price decrease steps to make price more sensitive
        priceDecreaseSteps = Math.floor(volumeIncrease / 50);
        priceDecrease = priceDecreaseSteps * 1.0; // slightly lower decrement per step
    }

    const volumeDecrease = initialVolume - stock.volume;
    let priceIncreaseSteps = 0;
    let priceIncrease = 0;
    if (volumeDecrease > 0) {
        // Lower threshold for price increase steps to make price more sensitive
        priceIncreaseSteps = Math.floor(volumeDecrease / 100);
        priceIncrease = priceIncreaseSteps * 2.0; // slightly lower increment per step
    }

    let newPrice = stock.basePrice + priceIncrease - priceDecrease;
    console.log(`updatePrice for ${stock.symbol}: volumeIncrease=${volumeIncrease}, priceDecreaseSteps=${priceDecreaseSteps}, priceDecrease=${priceDecrease}, volumeDecrease=${volumeDecrease}, priceIncreaseSteps=${priceIncreaseSteps}, priceIncrease=${priceIncrease}, newPrice=${newPrice}`);
    if (newPrice < 0) newPrice = 0;
    stock.price = newPrice;
}

// Create HTTP server (optional, for upgrade to WebSocket)
const server = http.createServer();

let contestLock = false;

function lockContests() {
    contestLock = true;
    console.log('Contests are now locked for participation.');

    // Calculate top 70% users and distribute prizes
    distributePrizes().catch(err => {
        console.error('Error distributing prizes:', err);
    });

    // Schedule unlock after 30 minutes
    setTimeout(() => {
        contestLock = false;
        console.log('Contests are now unlocked for participation.');
    }, 30 * 60 * 1000); // 30 minutes
}

async function distributePrizes() {
    // Fetch users and calculate leaderboard as in getLeaderboard
    const [users] = await pool.query('SELECT id, username, name FROM users');
    const userIdToUsername = {};
    users.forEach(u => {
        userIdToUsername[u.id] = u.username;
    });

    const [allPortfolios] = await pool.query('SELECT user_id, symbol, quantity, purchase_price FROM portfolios');

    const userProfits = {};
    allPortfolios.forEach(p => {
        const stock = findPlayer(p.symbol);
        if (!stock) return;
        const profit = (stock.price - p.purchase_price) * p.quantity;
        if (!userProfits[p.user_id]) userProfits[p.user_id] = 0;
        userProfits[p.user_id] += profit;
    });

    // Prizes for contests
    const contestPrizes = [
        { minProfit: 80, prize: 120, contestName: 'Contest 1' },
        { minProfit: 200, prize: 250, contestName: 'Contest 2' },
        { minProfit: 500, prize: 600, contestName: 'Contest 3' }
    ];

    for (const contest of contestPrizes) {
        // Get participants for this contest
        const [participants] = await pool.query('SELECT user_id FROM contest_participation WHERE contest_name = ?', [contest.contestName]);

        // Calculate profits for participants
        const participantProfits = participants.map(p => ({
            userId: p.user_id,
            profit: userProfits[p.user_id] || 0
        }));

        // Sort descending by profit
        participantProfits.sort((a, b) => b.profit - a.profit);

        // Calculate top 70% cutoff index
        const cutoffIndex = Math.floor(participantProfits.length * 0.7);

        // Distribute prizes to top 70% participants who meet minProfit
        for (let i = 0; i < cutoffIndex; i++) {
            const user = participantProfits[i];
            if (user.profit >= contest.minProfit) {
                // Insert winning record
                await pool.query(
                    'INSERT INTO user_winnings (user_id, contest_name, amount) VALUES (?, ?, ?)',
                    [user.userId, contest.contestName, contest.prize]
                );

                // Update wallet balance
                const [[walletRow]] = await pool.query('SELECT balance FROM wallets WHERE user_id = ?', [user.userId]);
                let currentBalance = walletRow ? parseFloat(walletRow.balance) : 0;
                currentBalance += contest.prize;
                if (walletRow) {
                    await pool.query('UPDATE wallets SET balance = ? WHERE user_id = ?', [currentBalance, user.userId]);
                } else {
                    await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, ?)', [user.userId, currentBalance]);
                }

                // Send WebSocket message to user if connected
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN && client.user === userIdToUsername[user.userId]) {
                        const winningMsg = JSON.stringify({
                            type: 'winningNotification',
                            contest: contest.contestName,
                            amount: contest.prize,
                            message: `You have won ₹${contest.prize} in ${contest.contestName}!`
                        });
                        client.send(winningMsg);
                    }
                });
            }
        }
    }

    // Clear contest participation after prize distribution to refresh contests
    await pool.query('DELETE FROM contest_participation');

    // Get all users who participated in any contest
    const [participatedUsers] = await pool.query('SELECT DISTINCT user_id FROM contest_participation');

    // For each participated user, halve their portfolio quantities
    for (const user of participatedUsers) {
        // Get user's portfolio
        const [portfolioItems] = await pool.query('SELECT id, quantity FROM portfolios WHERE user_id = ?', [user.user_id]);

        for (const item of portfolioItems) {
            const newQuantity = Math.floor(item.quantity / 2);
            if (newQuantity !== item.quantity) {
                if (newQuantity > 0) {
                    await pool.query('UPDATE portfolios SET quantity = ? WHERE id = ?', [newQuantity, item.id]);
                } else {
                    // If new quantity is 0, remove the portfolio item
                    await pool.query('DELETE FROM portfolios WHERE id = ?', [item.id]);
                }
            }
        }
    }
}

// Schedule daily lock at 10:00 PM server time
function scheduleDailyLock() {
    const now = new Date();
    const nextLock = new Date();
    nextLock.setHours(22, 0, 0, 0); // 10:00 PM today
    if (now > nextLock) {
        nextLock.setDate(nextLock.getDate() + 1); // tomorrow
    }
    const delay = nextLock - now;
    setTimeout(() => {
        lockContests();
        setInterval(lockContests, 24 * 60 * 60 * 1000); // every 24 hours
    }, delay);
}

scheduleDailyLock();

// Modify contest application logic to check contestLock flag
// Assuming contest application is handled in a message type 'applyContest'
wss.on('connection', function connection(ws) {
    ws.user = null;

    ws.on('message', async function incoming(message) {
        try {
            const data = JSON.parse(message);
            const user = ws.user;
            const messageType = (typeof data.type === 'string') ? data.type.trim().toLowerCase() : '';

if (messageType === 'applycontest') {
    if (contestLock) {
        ws.send(JSON.stringify({ type: 'error', message: 'Contests are locked from 10:00 PM to 10:30 PM. Please try later.' }));
        return;
    }
    if (!user) {
        ws.send(JSON.stringify({ type: 'error', message: 'User not identified. Please login first.' }));
        return;
    }
    const { contestName } = data;
    if (!contestName) {
        ws.send(JSON.stringify({ type: 'error', message: 'Contest name is required to apply.' }));
        return;
    }
    try {
        // Get user id
        const [[userRow]] = await pool.query('SELECT id FROM users WHERE username = ?', [user]);
        if (!userRow) {
            ws.send(JSON.stringify({ type: 'error', message: 'User not found.' }));
            return;
        }
        const userId = userRow.id;

        // Check if user already applied to this contest
        const [existing] = await pool.query('SELECT id FROM contest_participation WHERE user_id = ? AND contest_name = ?', [userId, contestName]);
        if (existing.length > 0) {
            ws.send(JSON.stringify({ type: 'error', message: 'You have already applied to this contest.' }));
            return;
        }

        // Check if user rebought stocks after last contest end (10:30 PM)
        const now = new Date();
        let lastContestEnd = new Date();
        lastContestEnd.setHours(22, 30, 0, 0); // 10:30 PM today
        if (now < lastContestEnd) {
            // If current time is before 10:30 PM, last contest end was yesterday 10:30 PM
            lastContestEnd.setDate(lastContestEnd.getDate() - 1);
        }
        // Check if user has any portfolio purchases after lastContestEnd
        // Assuming portfolios table has a 'purchase_date' datetime column (if not, this needs to be added)
        const [recentPurchases] = await pool.query(
            'SELECT id FROM portfolios WHERE user_id = ? AND purchase_date > ?',
            [userId, lastContestEnd]
        );
        if (recentPurchases.length === 0) {
            ws.send(JSON.stringify({ type: 'error', message: 'You must rebuy stocks after the last contest ended (10:30 PM) to participate again.' }));
            return;
        }

        // Insert participation record
        await pool.query('INSERT INTO contest_participation (user_id, contest_name) VALUES (?, ?)', [userId, contestName]);

        ws.send(JSON.stringify({ type: 'applyContestSuccess', message: `Successfully applied to ${contestName}.` }));
    } catch (err) {
        console.error('Error applying to contest:', err);
        ws.send(JSON.stringify({ type: 'error', message: 'Server error while applying to contest.' }));
    }
    return;
}

            // Existing message handling code continues here...

        } catch (err) {
            console.error('Error processing message:', err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format or server error: ' + err.message }));
        }
    });
});
