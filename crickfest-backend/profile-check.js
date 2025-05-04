document.addEventListener("DOMContentLoaded", () => {
    const profileForm = document.getElementById("profileForm");
    const profileMessage = document.getElementById("profileMessage");

    if (!profileForm) return;

    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const pincode = document.getElementById("pincode").value.trim();

        // Send updateProfile message via WebSocket
        if (window.ws && window.ws.readyState === WebSocket.OPEN) {
            const updateProfileMsg = {
                type: "updateProfile",
                name,
                phone,
                address,
                pincode
            };
            window.ws.send(JSON.stringify(updateProfileMsg));
        } else {
            profileMessage.textContent = "Connection not established. Please login again.";
            profileMessage.style.color = "red";
            return;
        }
    });

    // Listen for WebSocket messages to handle updateProfileSuccess or error
    if (window.ws) {
        window.ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "updateProfileSuccess") {
                profileMessage.textContent = data.message;
                profileMessage.style.color = "green";
            } else if (data.type === "error") {
                profileMessage.textContent = data.message;
                profileMessage.style.color = "red";
            }
        });
    }
});

const mysql = require('mysql2/promise');

async function checkUserProfile(email) {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: 'Harsh@1981', // Update with your MySQL root password
        database: 'crickfest_db',
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

// Replace with the email you want to check
const emailToCheck = 'testuser@example.com';
checkUserProfile(emailToCheck);
