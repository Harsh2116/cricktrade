document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const loginBtn = document.getElementById("loginBtn");
    if (logoutBtn && loginBtn) {
        // Show logout button if user is logged in, else show login button
        const currentUser = localStorage.getItem("crickfestCurrentUser");
        if (currentUser) {
            logoutBtn.style.display = "inline-block";
            loginBtn.style.display = "none";
        } else {
            logoutBtn.style.display = "none";
            loginBtn.style.display = "inline-block";
        }

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("crickfestCurrentUser");
            logoutBtn.style.display = "none";
            loginBtn.style.display = "inline-block";
            alert("You have been logged out.");
            window.location.href = "login.html";
        });

        loginBtn.addEventListener("click", () => {
            window.location.href = "login.html";
        });
    }
});
