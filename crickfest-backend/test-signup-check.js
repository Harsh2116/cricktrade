const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    // Replace with test signup data
    const signupData = {
        type: 'signup',
        username: 'testuser123',
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '1234567890',
        address: '123 Test St',
        pincode: '123456',
        password: 'TestPassword123'
    };

    ws.send(JSON.stringify(signupData));
});

ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Received from server:', data);

    if (data.type === 'signupSuccess') {
        console.log('Signup successful. Now checking profile in database...');
        // Close WebSocket after signup success
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
