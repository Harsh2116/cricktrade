document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        // Show logout button if user is logged in
        const currentUser = localStorage.getItem("crickfestCurrentUser");
        if (currentUser) {
            logoutBtn.style.display = "inline-block";
        } else {
            logoutBtn.style.display = "none";
        }

        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("crickfestCurrentUser");
            logoutBtn.style.display = "none";
            alert("You have been logged out.");
            window.location.href = "index.html";
        });
    }
});
