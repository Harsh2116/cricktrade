document.addEventListener("DOMContentLoaded", () => {
    // Override login form submission to redirect to stocks.html
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const username = document.getElementById("loginUsername").value.trim();
            const password = document.getElementById("loginPassword").value;
            const errorElem = document.getElementById("loginError");
            errorElem.textContent = "";

            const users = JSON.parse(localStorage.getItem("crickfestUsers") || "{}");
            if (!users[username]) {
                errorElem.textContent = "User does not exist.";
                return;
            }
            if (users[username].password !== password) {
                errorElem.textContent = "Incorrect password.";
                return;
            }
            localStorage.setItem("crickfestCurrentUser", username);
            window.location.href = "stocks.html";
        });
    }

    // Override signup form submission to redirect to stocks.html
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const username = document.getElementById("signupUsername").value.trim();
            const password = document.getElementById("signupPassword").value;
            const confirmPassword = document.getElementById("signupConfirmPassword").value;
            const errorElem = document.getElementById("signupError");
            errorElem.textContent = "";

            if (password !== confirmPassword) {
                errorElem.textContent = "Passwords do not match.";
                return;
            }
            if (password.length < 6) {
                errorElem.textContent = "Password must be at least 6 characters.";
                return;
            }
            const users = JSON.parse(localStorage.getItem("crickfestUsers") || "{}");
            if (users[username]) {
                errorElem.textContent = "Username already exists.";
                return;
            }
            users[username] = { password };
            localStorage.setItem("crickfestUsers", JSON.stringify(users));
            localStorage.setItem("crickfestCurrentUser", username);
            window.location.href = "stocks.html";
        });
    }
});
