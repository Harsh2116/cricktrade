document.addEventListener("DOMContentLoaded", () => {
    const withdrawForm = document.getElementById("withdraw-form");
    const withdrawMessage = document.getElementById("withdraw-message");
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

    function updateWithdrawMessage(message, isError = false) {
        withdrawMessage.textContent = message;
        withdrawMessage.style.color = isError ? "red" : "green";
    }

    function updateWalletBalanceDisplay() {
        const balance = getWalletBalance();
        walletBalanceDisplay.textContent = `₹${balance.toFixed(2)}`;
    }

    withdrawForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const amountInput = document.getElementById("amount");
        const upiIdInput = document.getElementById("upi-id");
        const amount = parseFloat(amountInput.value);
        const upiId = upiIdInput.value.trim();

        if (isNaN(amount) || amount <= 0) {
            updateWithdrawMessage("Please enter a valid amount greater than zero.", true);
            return;
        }

        const currentBalance = getWalletBalance();
        if (amount > currentBalance) {
            updateWithdrawMessage("Insufficient wallet balance.", true);
            return;
        }

        if (!upiId) {
            updateWithdrawMessage("Please enter a valid UPI ID.", true);
            return;
        }

        // Basic UPI ID format check (simple regex)
        const upiRegex = /^[\w.-]+@[\w.-]+$/;
        if (!upiRegex.test(upiId)) {
            updateWithdrawMessage("Please enter a valid UPI ID format.", true);
            return;
        }

        updateWithdrawMessage("Processing withdrawal...", false);
        setTimeout(() => {
            if (window.socketReady) {
                window.socket.send(JSON.stringify({ type: "withdrawMoney", amount: amount, user: getCurrentUser() }));
                updateWithdrawMessage(`₹${amount.toFixed(2)} withdrawn successfully! New balance will be updated shortly. Your money will be transferred to your account within 48 hours.`);
                withdrawForm.reset();
            } else {
                updateWithdrawMessage("Connection to server is not open. Please try again later.", true);
            }
        }, 1500);
    });

    // Listen for WebSocket messages to update wallet balance dynamically
    if (window.socket) {
        window.socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'transaction' && (data.transaction.type === 'addMoney' || data.transaction.type === 'withdrawMoney')) {
                    // Update localStorage wallet balance
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
            } catch (err) {
                console.error('Error parsing WebSocket message in withdraw:', err);
            }
        });
    }

    // Initialize balance display on page load
    updateWalletBalanceDisplay();
});
