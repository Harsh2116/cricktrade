const WebSocket = require('ws');
const mysql = require('mysql2/promise');

const ws = new WebSocket('ws://localhost:8080');

const testUser = {
    name: 'Auto Test User',
    email: 'autotestuser@example.com',
    phone: '9876543210',
    address: '456 Auto St',
    pincode: '654321',
    password: 'AutoTestPass123'
};

async function checkUserProfile(email) {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Harsh@1981', // Update with your MySQL root password
        database: 'crickfest_db_new',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const [rows] = await pool.query(
            'SELECT name, email, phone, address, pincode, created_at FROM users WHERE email = ?',
            [email]
        );
        if (rows.length === 0) {
            console.log(`No user found with email: ${email}`);
        } else {
            console.log('User profile details:', rows[0]);
        }
    } catch (err) {
        console.error('Error querying user profile:', err);
    } finally {
        await pool.end();
    }
}

ws.on('open', () => {
    ws.send(JSON.stringify({
        type: 'signup',
        ...testUser
    }));
});

ws.on('message', async (message) => {
    const data = JSON.parse(message);
    console.log('Received from server:', data);

    if (data.type === 'signupSuccess') {
        console.log('Signup successful. Now checking profile in database...');
        await checkUserProfile(testUser.email);
        ws.close();
    } else if (data.type === 'error') {
        console.error('Error from server:', data.message);
        ws.close();
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('WebSocket connection closed.');
});
