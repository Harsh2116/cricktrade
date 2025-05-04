// Script to fetch and display leaderboard data on leaderboard.html

const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
    // Identify user if needed, or just request leaderboard
    ws.send(JSON.stringify({ type: 'getLeaderboard' }));
});

ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'leaderboard') {
        console.log("Received leaderboard data:", data.leaderboard);
        updateLeaderboard(data.leaderboard);
    }
});

function updateLeaderboard(leaderboard) {
    const tbody = document.querySelector('#leaderboard-table tbody');
    tbody.innerHTML = '';
    leaderboard.forEach(entry => {
        const tr = document.createElement('tr');
        const rankTd = document.createElement('td');
        rankTd.textContent = entry.rank;
        const userTd = document.createElement('td');
        userTd.textContent = entry.username || entry.userId;
        const profitTd = document.createElement('td');
        profitTd.textContent = entry.profit.toFixed(2);
        tr.appendChild(rankTd);
        tr.appendChild(userTd);
        tr.appendChild(profitTd);
        tbody.appendChild(tr);
    });
}

// Optionally refresh leaderboard every 10 seconds
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'getLeaderboard' }));
    }
}, 10000);



document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-leaderboard-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'getLeaderboard' }));
            } else {
                console.warn('WebSocket not open. Cannot refresh leaderboard.');
            }
        });
    }
});
