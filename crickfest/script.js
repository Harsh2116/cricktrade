const defaultStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 172.26, change: 1.25 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 128.45, change: -0.75 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 688.99, change: 3.12 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 3342.88, change: -12.45 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 289.67, change: 2.34 }
];

function generateSymbol(name) {
    return name.split(' ').map(word => word[0].toUpperCase()).join('').slice(0, 4);
}

let iplPlayers = [];
let iplPlayersLoaded = false; // Flag to track if iplPlayers is loaded

function formatChange(change) {
    const sign = change > 0 ? "+" : "";
    return sign + parseFloat(change).toFixed(2);
}

function createStockItem(stock) {
    const div = document.createElement("div");
    div.classList.add("stock-item");

    const symbol = document.createElement("div");
    symbol.classList.add("stock-symbol");
    symbol.textContent = stock.symbol;

    const name = document.createElement("div");
    name.classList.add("stock-name");
    name.textContent = stock.name;

    const price = document.createElement("div");
    price.classList.add("stock-price");
    // Display price as is without conversion
    price.textContent = "₹" + parseFloat(stock.price).toFixed(2);

    const change = document.createElement("div");
    change.classList.add("stock-change");
    change.textContent = formatChange(stock.change);
    if (parseFloat(stock.change) > 0) {
        change.classList.add("positive");
    } else if (parseFloat(stock.change) < 0) {
        change.classList.add("negative");
    }

    const volume = document.createElement("div");
    volume.classList.add("stock-volume");
    volume.textContent = "Volume: " + (stock.volume ? stock.volume.toLocaleString() : "N/A");

    // Create Buy button
    const buyBtn = document.createElement("button");
    buyBtn.textContent = "Buy";
    buyBtn.classList.add("buy-btn");

    // Create Sell button
    const sellBtn = document.createElement("button");
    sellBtn.textContent = "Sell";
    sellBtn.classList.add("sell-btn");

    // Create quantity input
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.value = "1";
    quantityInput.classList.add("quantity-input");
    quantityInput.title = "Quantity";

    buyBtn.addEventListener("click", () => {
        const qty = parseInt(quantityInput.value);
        if (qty <= 0 || isNaN(qty)) {
            alert("Please enter a valid quantity to buy.");
            return;
        }
        const walletBalance = getWalletBalance();
        const totalCost = qty * stock.price;
        if (walletBalance <= 0) {
            alert("Your wallet balance is zero. Please add money to your wallet before buying stocks.");
            return;
        }
        if (walletBalance < totalCost) {
            alert("Insufficient wallet balance to buy the requested quantity. Please add more money.");
            return;
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            // Send buy message to backend, do not update wallet or portfolio locally here
            socket.send(JSON.stringify({ type: "buy", symbol: stock.symbol, quantity: qty, price: stock.price, user: getCurrentUser() }));
        } else {
            alert("Connection to server is not open. Please try again later.");
        }
    });

    sellBtn.addEventListener("click", () => {
        const qty = parseInt(quantityInput.value);
        if (qty <= 0 || isNaN(qty)) {
            alert("Please enter a valid quantity to sell.");
            return;
        }
        const portfolio = getPortfolio();
        if (!portfolio[stock.symbol] || portfolio[stock.symbol].quantity < qty) {
            alert("You do not have enough quantity of this stock to sell. Please buy the stock first.");
            return;
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            // Send sell message to backend, do not update wallet locally here
            socket.send(JSON.stringify({ type: "sell", symbol: stock.symbol, quantity: qty, user: getCurrentUser() }));
        } else {
            alert("Connection to server is not open. Please try again later.");
        }
    });

    div.appendChild(symbol);
    div.appendChild(name);
    div.appendChild(price);
    div.appendChild(change);
    div.appendChild(volume);
    div.appendChild(quantityInput);
    div.appendChild(buyBtn);
    div.appendChild(sellBtn);

    return div;
}

function loadStocks(stocks) {
    console.log("loadStocks called with stocks:", stocks);
    const stocksList = document.getElementById("stocks-list");
    if (!stocksList) {
        console.error("stocks-list element not found in DOM.");
        return;
    }
    stocksList.innerHTML = ""; // Clear existing stocks to prevent duplicates
    stocks.forEach(stock => {
        const stockItem = createStockItem(stock);
        stocksList.appendChild(stockItem);
    });
}

const portfolioKey = "crickfestPortfolio";

function getPortfolio() {
    const portfolio = localStorage.getItem(portfolioKey);
    return portfolio ? JSON.parse(portfolio) : {};
}

function savePortfolio(portfolio) {
    localStorage.setItem(portfolioKey, JSON.stringify(portfolio));
}

function calculateAndSaveUserInvestment() {
    const portfolio = getPortfolio();
    let totalInvestment = 0;
    Object.values(portfolio).forEach(stock => {
        totalInvestment += stock.purchasePrice * stock.quantity;
    });
    localStorage.setItem('userInvestment', totalInvestment.toFixed(2));
}

// Call calculateAndSaveUserInvestment after saving portfolio
const originalSavePortfolio = savePortfolio;
savePortfolio = function(portfolio) {
    originalSavePortfolio(portfolio);
    calculateAndSaveUserInvestment();
};

// Also call on page load to initialize userInvestment
document.addEventListener("DOMContentLoaded", () => {
    calculateAndSaveUserInvestment();
});

function getWalletBalance() {
    const balance = localStorage.getItem("crickfestWallet");
    return balance ? parseFloat(balance) : 10000; // default 10,000 INR
}

function saveWalletBalance(balance) {
    localStorage.setItem("crickfestWallet", balance.toFixed(2));
}

function addToPortfolio(stock, quantity, purchasePrice) {
    const totalCost = purchasePrice * quantity;
    let walletBalance = getWalletBalance();
    if (walletBalance < totalCost) {
        alert("Insufficient wallet balance to complete this purchase.");
        return false;
    }
    walletBalance -= totalCost;
    saveWalletBalance(walletBalance);

    // Record buy transaction
    recordTransaction("buy", totalCost, `Bought ${quantity} of ${stock.name} (${stock.symbol}) at ₹${purchasePrice.toFixed(2)} each`);

    const portfolio = getPortfolio();
    if (portfolio[stock.symbol]) {
        // Update existing stock quantity and average purchase price
        const existing = portfolio[stock.symbol];
        const totalQty = existing.quantity + quantity;
        const totalCostExisting = existing.purchasePrice * existing.quantity;
        const avgPrice = (totalCostExisting + totalCost) / totalQty;
        portfolio[stock.symbol] = {
            ...existing,
            quantity: totalQty,
            purchasePrice: avgPrice
        };
    } else {
        // Add new stock
        portfolio[stock.symbol] = {
            symbol: stock.symbol,
            name: stock.name,
            quantity: quantity,
            purchasePrice: purchasePrice
        };
    }
    savePortfolio(portfolio);
    updateWalletDisplay();

    // Reload stocks to update UI with new price and volume
    loadStocks(iplPlayers);

    return true;
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

function sellFromPortfolio(stock, quantity, sellPrice) {
    const portfolio = getPortfolio();
    if (!portfolio[stock.symbol] || portfolio[stock.symbol].quantity < quantity) {
        alert("You do not have enough quantity to sell.");
        return false;
    }
    const totalSellValue = sellPrice * quantity;
    let walletBalance = getWalletBalance();
    walletBalance += totalSellValue;
    saveWalletBalance(walletBalance);

    // Record sell transaction
    recordTransaction("sell", totalSellValue, `Sold ${quantity} of ${stock.name} (${stock.symbol}) at ₹${sellPrice.toFixed(2)} each`);

    if (portfolio[stock.symbol].quantity === quantity) {
        delete portfolio[stock.symbol];
    } else {
        portfolio[stock.symbol].quantity -= quantity;
    }
    savePortfolio(portfolio);
    updateWalletDisplay();

    // Reload stocks to update UI with new price and volume
    loadStocks(iplPlayers);

    return true;
}

function updateWalletDisplay() {
    const balanceElem = document.getElementById("wallet-balance-display");
    if (balanceElem) {
        balanceElem.textContent = `₹${getWalletBalance().toFixed(2)}`;
    }
}

function updateStockData(updatedStock) {
    const index = iplPlayers.findIndex(s => s.symbol === updatedStock.symbol);
    if (index !== -1) {
        console.log("Updating stock data for:", updatedStock.symbol, "Current iplPlayers length:", iplPlayers.length);
        const basePrice = iplPlayers[index].basePrice !== undefined ? iplPlayers[index].basePrice : iplPlayers[index].price;
        iplPlayers[index] = {
            ...iplPlayers[index],
            price: updatedStock.price,
            volume: updatedStock.volume,
            change: updatedStock.price - basePrice
        };
        loadStocks(iplPlayers);
    } else {
        console.warn("Stock symbol not found in iplPlayers:", updatedStock.symbol);
    }
}

function getCurrentUser() {
    return localStorage.getItem("crickfestCurrentUser") || "unknown";
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded event fired. Current URL:", window.location.href);

    // Setup WebSocket connection
    window.socketReady = false;
    window.socket = new WebSocket("ws://localhost:8080");

    window.socket.addEventListener("open", () => {
        console.log("Connected to WebSocket server");
        window.socketReady = true;
        // Send identify message with current user to associate connection on server
        const currentUser = getCurrentUser();
        console.log("Current user on WebSocket open:", currentUser);
        if (currentUser) {
            window.socket.send(JSON.stringify({ type: "identify", user: currentUser }));
            console.log("Sent identify message for user:", currentUser);
        }
    });

    window.socket.addEventListener("close", () => {
        console.log("WebSocket connection closed");
        window.socketReady = false;
        // Retry connection after 3 seconds
        setTimeout(() => {
            console.log("Reconnecting WebSocket...");
            window.socket = new WebSocket("ws://localhost:8080");
            attachSocketListeners();
        }, 3000);
    });

    window.socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
        window.socketReady = false;
    });

    function attachSocketListeners() {
        window.socket.addEventListener("open", () => {
            console.log("Connected to WebSocket server");
            window.socketReady = true;
            const currentUser = getCurrentUser();
            if (currentUser) {
                window.socket.send(JSON.stringify({ type: "identify", user: currentUser }));
                console.log("Sent identify message for user:", currentUser);
            }
        });

        window.socket.addEventListener("close", () => {
            console.log("WebSocket connection closed");
            window.socketReady = false;
            setTimeout(() => {
                console.log("Reconnecting WebSocket...");
                window.socket = new WebSocket("ws://localhost:8080");
                attachSocketListeners();
            }, 3000);
        });

        window.socket.addEventListener("error", (error) => {
            console.error("WebSocket error:", error);
            window.socketReady = false;
        });
    }

    attachSocketListeners();

socket.addEventListener("message", (event) => {
    try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
            // Initialize stocks from server data
        if (Array.isArray(data.stocks)) {
            console.log("Received init message with stocks count:", data.stocks.length);
            iplPlayers.length = 0;
            data.stocks.forEach(stock => iplPlayers.push(stock));
            loadStocks(iplPlayers);
            iplPlayersLoaded = true;
            // If portfolio was saved but not rendered due to iplPlayers not loaded, render now
            if ((window.location.pathname.endsWith("portfolio.html") || window.location.href.includes("portfolio.html")) && getPortfolio() && Object.keys(getPortfolio()).length > 0) {
                console.log("iplPlayers loaded, rendering portfolio table now");
                loadPortfolioTable();
            }
        }
        // Initialize portfolio if provided
        if (data.portfolio) {
            console.log("Received initial portfolio:", data.portfolio);
            savePortfolio(data.portfolio);
            if (iplPlayersLoaded) {
                if (window.location.pathname.endsWith("portfolio.html") || window.location.href.includes("portfolio.html")) {
                    loadPortfolioTable();
                }
            } else {
                console.log("iplPlayers not loaded yet, delaying portfolio table rendering");
            }
        }
            // Initialize wallet balance if provided
            if (typeof data.walletBalance === "number") {
                localStorage.setItem("crickfestWallet", data.walletBalance.toFixed(2));
                const walletBalanceDisplay = document.getElementById("wallet-balance-display");
                if (walletBalanceDisplay) {
                    walletBalanceDisplay.textContent = `₹${data.walletBalance.toFixed(2)}`;
                }
            }
        } else if (data.type === "update") {
            // Update specific stock data
            updateStockData(data.stock);
        } else if (data.type === "transaction") {
            // Transactions handled elsewhere
        } else if (data.type === "portfolioUpdate") {
            console.log("Received portfolioUpdate message:", data.portfolio);
            // Convert portfolio array to object keyed by symbol
            const portfolioObj = {};
            if (Array.isArray(data.portfolio)) {
                data.portfolio.forEach(item => {
                    portfolioObj[item.symbol] = {
                        symbol: item.symbol,
                        name: item.name,
                        quantity: item.quantity,
                        purchasePrice: item.purchasePrice
                    };
                });
            }
            console.log("Saving portfolio");
            // Update portfolio data
            savePortfolio(portfolioObj);
            if (iplPlayersLoaded) {
                if (window.location.pathname.endsWith("portfolio.html") || window.location.href.includes("portfolio.html")) {
                    console.log("Reloading portfolio table due to portfolioUpdate");
                    loadPortfolioTable();
                }
            } else {
                console.log("iplPlayers not loaded yet, delaying portfolio table rendering");
            }
        } else if (data.type === "error") {
            alert("Error from server: " + data.message);
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

    // Redirect to login if not logged in
    if (typeof redirectIfNotLoggedIn === "function") {
        redirectIfNotLoggedIn();
    }
    // Existing code for stocks and portfolio pages
    if (window.location.pathname.endsWith("stocks.html") || window.location.href.includes("stocks.html")) {
        console.log("Loading IPL players stocks...");
        // Removed initial loadStocks call to rely on backend data via WebSocket "init" message
        // loadStocks(iplPlayers);  // Load new IPL players stocks with price range 1-10 INR
    } else if (window.location.pathname.endsWith("portfolio.html") || window.location.href.includes("portfolio.html")) {
        console.log("Loading portfolio table...");
        loadPortfolioTable();
    }
    // Add event listener for transactions button
    const transactionsLink = document.querySelector('a[href="transactions.html"]');
    if (transactionsLink) {
        transactionsLink.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "transactions.html";
        });
    }
});

function logPortfolioAndStocks() {
    const portfolio = getPortfolio();
    console.log("Current portfolio object:", portfolio);
    console.log("Portfolio symbols:", Object.keys(portfolio));
    console.log("iplPlayers symbols:", iplPlayers.map(s => s.symbol));
}

function loadPortfolioTable() {
    const portfolio = getPortfolio();
    const tbody = document.querySelector("#portfolio-table tbody");
    console.log("loadPortfolioTable called");
    logPortfolioAndStocks();
    if (!tbody) {
        console.error("Portfolio table tbody element not found");
        return;
    }
    tbody.innerHTML = "";
    let totalInvestment = 0;
    let totalProfitLoss = 0;

    Object.values(portfolio).forEach(stock => {
        const currentStock = iplPlayers.find(s => s.symbol === stock.symbol);
        if (!currentStock) {
            console.warn(`Stock symbol ${stock.symbol} not found in iplPlayers, skipping rendering.`);
            return;
        }

        const currentPrice = parseFloat(currentStock.price);
        const purchasePriceNum = parseFloat(stock.purchasePrice);
        const totalInv = purchasePriceNum * stock.quantity;
        const profitLoss = (currentPrice - purchasePriceNum) * stock.quantity;

        totalInvestment += totalInv;
        totalProfitLoss += profitLoss;

        const tr = document.createElement("tr");

        tr.innerHTML = "<td>" + stock.symbol + "</td>" +
                       "<td>" + stock.name + "</td>" +
                       "<td>" + stock.quantity + "</td>" +
                       "<td>₹" + purchasePriceNum.toFixed(2) + "</td>" +
                       "<td>₹" + currentPrice.toFixed(2) + "</td>" +
                       "<td>₹" + totalInv.toFixed(2) + "</td>" +
                       "<td style='color: " + (profitLoss >= 0 ? '#28a745' : '#dc3545') + ";'>₹" + profitLoss.toFixed(2) + "</td>";

        tbody.appendChild(tr);
    });

    document.getElementById("total-investment").textContent = totalInvestment.toFixed(2);
    document.getElementById("total-profit-loss").textContent = totalProfitLoss.toFixed(2);
}
