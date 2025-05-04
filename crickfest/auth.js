// Utility functions for user authentication

// Get users from localStorage or initialize empty object
function getUsers() {
    const users = localStorage.getItem("crickfestUsers");
    return users ? JSON.parse(users) : {};
}

// Save users object to localStorage
function saveUsers(users) {
    localStorage.setItem("crickfestUsers", JSON.stringify(users));
}

// Set current logged in user
function setCurrentUser(username) {
    localStorage.setItem("crickfestCurrentUser", username);
}

// Get current logged in user
function getCurrentUser() {
    return localStorage.getItem("crickfestCurrentUser");
}

// Clear current user (logout)
function clearCurrentUser() {
    localStorage.removeItem("crickfestCurrentUser");
}

// Redirect to index.html if logged in
function redirectIfLoggedIn() {
    if (getCurrentUser()) {
        window.location.href = "index.html";
    }
}

// Redirect to login.html if not logged in
function redirectIfNotLoggedIn() {
    if (!getCurrentUser()) {
        window.location.href = "login.html";
    }
}

// Handle signup form submission
function handleSignup(event) {
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
    const users = getUsers();
    if (users[username]) {
        errorElem.textContent = "Username already exists.";
        return;
    }
    users[username] = { password };
    saveUsers(users);
    setCurrentUser(username);
    window.location.href = "index.html";
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorElem = document.getElementById("loginError");
    errorElem.textContent = "";

    const users = getUsers();
    if (!users[username]) {
        errorElem.textContent = "User does not exist.";
        return;
    }
    if (users[username].password !== password) {
        errorElem.textContent = "Incorrect password.";
        return;
    }
    setCurrentUser(username);
    window.location.href = "index.html";
}

// Attach event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("signup.html")) {
        redirectIfLoggedIn();
        const signupForm = document.getElementById("signupForm");
        if (signupForm) {
            signupForm.addEventListener("submit", handleSignup);
        }
    } else if (window.location.pathname.endsWith("login.html")) {
        redirectIfLoggedIn();
        const loginForm = document.getElementById("loginForm");
        if (loginForm) {
            loginForm.addEventListener("submit", handleLogin);
        }
    }
});
