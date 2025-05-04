document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
        const getStartedBtn = document.querySelector(".get-started-btn");
        if (getStartedBtn) {
            getStartedBtn.addEventListener("click", () => {
                console.log("Get Started button clicked");
                const currentUser = localStorage.getItem("crickfestCurrentUser");
                if (currentUser) {
                    alert("You are already logged in.");
                } else {
                    window.location.href = "./stocks.html";
                }
            });
        } else {
            console.log("Get Started button not found");
        }
    } else {
        console.log("Not on index page, current path:", window.location.pathname);
    }
});
