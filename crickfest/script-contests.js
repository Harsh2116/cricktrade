const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
    // Request leaderboard data
    ws.send(JSON.stringify({ type: 'getLeaderboard' }));
});

ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'leaderboard') {
        console.log("Received leaderboard data:", data.leaderboard);
        updateContests(data.leaderboard);
        setupApplyButtons();
    }
});

function createUserEntry(user) {
    const div = document.createElement('div');
    div.style.padding = '6px 0';
    div.textContent = user.username || user.userId;
    return div;
}

function updateContests(leaderboard) {
    const contest1Body = document.getElementById('contest-1-body');
    const contest2Body = document.getElementById('contest-2-body');
    const contest3Body = document.getElementById('contest-3-body');

    contest1Body.innerHTML = '';
    contest2Body.innerHTML = '';
    contest3Body.innerHTML = '';

    // Filter users with investment >= 80
    const contest1Users = leaderboard.filter(entry => entry.profit >= 80);
    contest1Users.forEach(user => {
        contest1Body.appendChild(createUserEntry(user));
    });
    // Add prize distribution text
    const prize1 = document.createElement('div');
    prize1.style.fontWeight = '600';
    prize1.style.marginTop = '10px';
    prize1.textContent = 'Price distribution: Users in the top 70% rank will get ₹120';
    contest1Body.appendChild(prize1);

    // Filter users with investment >= 200
    const contest2Users = leaderboard.filter(entry => entry.profit >= 200);
    contest2Users.forEach(user => {
        contest2Body.appendChild(createUserEntry(user));
    });
    // Add prize distribution text
    const prize2 = document.createElement('div');
    prize2.style.fontWeight = '600';
    prize2.style.marginTop = '10px';
    prize2.textContent = 'Price distribution: Users in the top 70% rank will get ₹250';
    contest2Body.appendChild(prize2);

    // Filter users with investment >= 500
    const contest3Users = leaderboard.filter(entry => entry.profit >= 500);
    contest3Users.forEach(user => {
        contest3Body.appendChild(createUserEntry(user));
    });
    // Add prize distribution text
    const prize3 = document.createElement('div');
    prize3.style.fontWeight = '600';
    prize3.style.marginTop = '10px';
    prize3.textContent = 'Price distribution: Users in the top 70% rank will get ₹600';
    contest3Body.appendChild(prize3);
}

function setupApplyButtons() {
    const applyContest1 = document.getElementById('apply-contest-1');
    const applyContest2 = document.getElementById('apply-contest-2');
    const applyContest3 = document.getElementById('apply-contest-3');

    // Get user investment from localStorage or default to 0
    let userInvestment = 0;
    try {
        userInvestment = parseFloat(localStorage.getItem('userInvestment')) || 0;
    } catch (e) {
        userInvestment = 0;
    }

    if (applyContest1) {
        applyContest1.onclick = () => {
            const appliedContests = JSON.parse(localStorage.getItem('appliedContests') || '[]');
            if (appliedContests.length > 0) {
                alert('You can only participate in one contest at a time. You have already applied to a contest.');
                return;
            }
            if (userInvestment >= 80) {
                saveAppliedContest('Contest 1: Investment minimum 80');
                alert('Applied to Contest 1');
            } else {
                alert('Your investment does not meet the contest requirement. Kindly invest in stock for applying in the contest.');
            }
        };
    }
    if (applyContest2) {
        applyContest2.onclick = () => {
            const appliedContests = JSON.parse(localStorage.getItem('appliedContests') || '[]');
            if (appliedContests.length > 0) {
                alert('You can only participate in one contest at a time. You have already applied to a contest.');
                return;
            }
            if (userInvestment >= 200) {
                saveAppliedContest('Contest 2: Investment minimum 200');
                alert('Applied to Contest 2');
            } else {
                alert('Your investment does not meet the contest requirement. Kindly invest in stock for applying in the contest.');
            }
        };
    }
    if (applyContest3) {
        applyContest3.onclick = () => {
            const appliedContests = JSON.parse(localStorage.getItem('appliedContests') || '[]');
            if (appliedContests.length > 0) {
                alert('You can only participate in one contest at a time. You have already applied to a contest.');
                return;
            }
            if (userInvestment >= 500) {
                saveAppliedContest('Contest 3: Investment minimum 500');
                alert('Applied to Contest 3');
            } else {
                alert('Your investment does not meet the contest requirement. Kindly invest in stock for applying in the contest.');
            }
        };
    }
}

function saveAppliedContest(contestName) {
    let appliedContests = [];
    try {
        appliedContests = JSON.parse(localStorage.getItem('appliedContests')) || [];
    } catch (e) {
        appliedContests = [];
    }
    if (!appliedContests.includes(contestName)) {
        appliedContests.push(contestName);
        localStorage.setItem('appliedContests', JSON.stringify(appliedContests));
    }
}

// Optionally refresh contests every 10 seconds
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'getLeaderboard' }));
    }
}, 10000);
