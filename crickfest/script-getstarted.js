document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname === "") {
        const getStartedBtn = document.querySelector(".get-started-btn");
        if (getStartedBtn) {
            getStartedBtn.addEventListener("click", () => {
                window.location.href = "./login.html";
            });
        }
    }
});
