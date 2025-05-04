document.addEventListener("DOMContentLoaded", () => {
    // Redirect to login if not logged in
    redirectIfNotLoggedIn();

    const transactionsTableBody = document.querySelector("#transactions-table tbody");

    function loadTransactions() {
        const transactions = JSON.parse(localStorage.getItem("crickfestTransactions") || "[]");
        transactionsTableBody.innerHTML = "";

        if (transactions.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 4;
            td.textContent = "No transactions found.";
            td.style.textAlign = "center";
            tr.appendChild(td);
            transactionsTableBody.appendChild(tr);
            return;
        }

        transactions.forEach(tx => {
            const tr = document.createElement("tr");

            const dateTd = document.createElement("td");
            const date = new Date(tx.date);
            dateTd.textContent = date.toLocaleString();

            const typeTd = document.createElement("td");
            typeTd.textContent = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);

            const amountTd = document.createElement("td");
            const amountNum = parseFloat(tx.amount);
            amountTd.textContent = isNaN(amountNum) ? tx.amount : amountNum.toFixed(2);

            const descTd = document.createElement("td");
            descTd.textContent = tx.description;

            tr.appendChild(dateTd);
            tr.appendChild(typeTd);
            tr.appendChild(amountTd);
            tr.appendChild(descTd);

            transactionsTableBody.appendChild(tr);
        });
    }

    function addTransaction(tx) {
        const transactions = JSON.parse(localStorage.getItem("crickfestTransactions") || "[]");
        transactions.push(tx);
        localStorage.setItem("crickfestTransactions", JSON.stringify(transactions));
        loadTransactions();
    }

    loadTransactions();

    // Setup WebSocket connection to listen for transaction updates
    const socket = new WebSocket("ws://localhost:8080");

    socket.addEventListener("open", () => {
        console.log("Connected to WebSocket server for transactions");
        // Send identify message with current user to associate connection on server
        const currentUser = localStorage.getItem("crickfestCurrentUser") || "unknown";
        socket.send(JSON.stringify({ type: "identify", user: currentUser }));
    });

    socket.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "transaction") {
                // Only add transaction if it belongs to current user
                const currentUser = localStorage.getItem("crickfestCurrentUser") || "unknown";
                if (data.transaction.user === currentUser) {
                    addTransaction(data.transaction);
                }
            } else if (data.type === "transactionList") {
                // Load initial transaction list for current user
                if (Array.isArray(data.transactions)) {
                    localStorage.setItem("crickfestTransactions", JSON.stringify(data.transactions));
                    loadTransactions();
                }
            }
        } catch (err) {
            console.error("Error parsing WebSocket message:", err);
        }
    });

    socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
    });

    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
    });
});
