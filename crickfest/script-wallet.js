document.addEventListener("DOMContentLoaded", () => {
    const walletForm = document.getElementById("wallet-form");
    const walletMessage = document.getElementById("wallet-message");
    const walletBalanceDisplay = document.getElementById("wallet-balance-display");

    function getWalletBalance() {
        const balance = localStorage.getItem("crickfestWallet");
        return balance ? parseFloat(balance) : 0;
    }

    function saveWalletBalance(balance) {
        localStorage.setItem("crickfestWallet", balance.toFixed(2));
    }

    function recordTransaction(type, amount, description) {
        const transactions = JSON.parse(localStorage.getItem("crickfestTransactions") || "[]");
        transactions.push({
            type,
            amount,
            description,
            date: new Date().toISOString()
        });
        localStorage.setItem("crickfestTransactions", JSON.stringify(transactions));
    }

    function updateWalletMessage(message, isError = false) {
        walletMessage.textContent = message;
        walletMessage.style.color = isError ? "red" : "green";
    }

    function updateWalletBalanceDisplay() {
        const balance = getWalletBalance();
        walletBalanceDisplay.textContent = `₹${balance.toFixed(2)}`;
    }

    walletForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const amountInput = document.getElementById("amount");
        const paymentMethod = document.getElementById("payment-method").value;
        const amount = parseFloat(amountInput.value);

        if (isNaN(amount) || amount <= 0) {
            updateWalletMessage("Please enter a valid amount greater than zero.", true);
            return;
        }

        if (!paymentMethod) {
            updateWalletMessage("Please select a payment method.", true);
            return;
        }

        // Simulate payment processing delay
        updateWalletMessage("Processing payment...", false);
        setTimeout(() => {
            if (window.socketReady) {
                window.socket.send(JSON.stringify({ type: "addMoney", amount: amount, user: getCurrentUser() }));
                updateWalletMessage(`₹${amount.toFixed(2)} added successfully! New balance will be updated shortly.`);
                walletForm.reset();
            } else {
                updateWalletMessage("Connection to server is not open. Please try again later.", true);
            }
        }, 1500);
    });

    // Listen for WebSocket messages to update wallet balance dynamically
    if (!window.socket) {
        window.socket = new WebSocket("ws://localhost:8080");
        window.socketReady = false;

        window.socket.addEventListener("open", () => {
            window.socketReady = true;
            const currentUser = localStorage.getItem("crickfestCurrentUser") || "unknown";
            if (currentUser) {
                window.socket.send(JSON.stringify({ type: "identify", user: currentUser }));
            }
        });

        window.socket.addEventListener("close", () => {
            window.socketReady = false;
            // Optionally implement reconnect logic here
        });

        window.socket.addEventListener("error", (error) => {
            console.error("WebSocket error in wallet:", error);
            window.socketReady = false;
        });
    }

    window.socket.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received in wallet:', data);
        if (data.type === 'transaction') {
            // Handle addMoney and withdrawMoney as before
            if (data.transaction.type === 'addMoney' || data.transaction.type === 'withdrawMoney') {
                let currentBalance = getWalletBalance();
                if (data.transaction.type === 'addMoney') {
                    currentBalance += data.transaction.amount;
                } else if (data.transaction.type === 'withdrawMoney') {
                    currentBalance -= data.transaction.amount;
                }
                saveWalletBalance(currentBalance);
                updateWalletBalanceDisplay();
                recordTransaction(data.transaction.type, data.transaction.amount, data.transaction.description);
            }
            // Handle buy and sell transactions to update wallet balance
            else if (data.transaction.type === 'buy') {
                let currentBalance = getWalletBalance();
                currentBalance -= data.transaction.amount;
                saveWalletBalance(currentBalance);
                updateWalletBalanceDisplay();
                recordTransaction('buy', data.transaction.amount, data.transaction.description);
            } else if (data.transaction.type === 'sell') {
                let currentBalance = getWalletBalance();
                currentBalance += data.transaction.amount;
                saveWalletBalance(currentBalance);
                updateWalletBalanceDisplay();
                recordTransaction('sell', data.transaction.amount, data.transaction.description);
            }
        } else if (data.type === 'walletBalance') {
            // Handle wallet balance message on identify
            saveWalletBalance(data.balance);
            updateWalletBalanceDisplay();
        }
        } catch (err) {
            console.error('Error parsing WebSocket message in wallet:', err);
        }
    });

    // Initialize balance display on page load
    updateWalletBalanceDisplay();
});
