document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorElem = document.getElementById("loginError");

    if (!loginForm) return;

    const ws = new WebSocket("ws://localhost:8080");

    // Disable login form submit until WebSocket is open
    loginForm.querySelector("button[type='submit']").disabled = true;

    ws.addEventListener("open", () => {
        // Enable login form submit when WebSocket connection is open
        loginForm.querySelector("button[type='submit']").disabled = false;
        errorElem.textContent = "";
    });

    ws.addEventListener("error", () => {
        errorElem.textContent = "WebSocket connection error.";
    });

    ws.addEventListener("message", (event) => {
        console.log("WebSocket message received:", event.data);
        try {
            const data = JSON.parse(event.data);
            if (data.type === "loginSuccess") {
                console.log("Login success message received, sending identify message...");
                // Clear user-specific localStorage data on new login
                localStorage.removeItem("crickfestTransactions");
                localStorage.removeItem("crickfestPortfolio");
                localStorage.removeItem("crickfestWallet");
                // Save username in localStorage for session persistence
                localStorage.setItem("crickfestCurrentUser", data.username);
                // Send identify message to associate user session on backend
                ws.send(JSON.stringify({ type: "identify", user: data.username }));
                // Wait for identifySuccess message before redirecting
            } else if (data.type === "identifySuccess") {
                console.log("Identify success received, redirecting to index.html");
                window.location.assign("index.html");
            } else if (data.type === "error") {
                errorElem.textContent = data.message;
            }
        } catch (err) {
            errorElem.textContent = "Invalid response from server.";
        }
    });

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        errorElem.textContent = "";

        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value;

        if (!username || !password) {
            errorElem.textContent = "Username and password are required.";
            return;
        }

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: "login",
                username: username,
                password: password
            }));
        } else {
            errorElem.textContent = "WebSocket connection is not open.";
        }
    });
});
