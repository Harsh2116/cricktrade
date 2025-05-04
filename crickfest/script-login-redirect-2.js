document.addEventListener("DOMContentLoaded", () => {
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
});
