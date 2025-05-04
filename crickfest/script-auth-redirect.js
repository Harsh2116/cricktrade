document.addEventListener("DOMContentLoaded", () => {
    if (typeof redirectIfNotLoggedIn === "function") {
        redirectIfNotLoggedIn();
    }
});
