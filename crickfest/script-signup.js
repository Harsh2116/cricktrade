document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const errorElem = document.getElementById("signupError");

    // Parse referral code from URL query parameter "ref"
    const urlParams = new URLSearchParams(window.location.search);
    const referralCodeFromUrl = urlParams.get('ref') || '';

    // Set referral code input value if referral code present in URL
    const referralCodeInput = document.getElementById("signupReferralCode");
    if (referralCodeInput && referralCodeFromUrl) {
        referralCodeInput.value = referralCodeFromUrl;
    }

    if (!signupForm) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.addEventListener("error", () => {
        errorElem.textContent = "WebSocket connection error.";
    });

    ws.addEventListener("open", () => {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault();
            errorElem.textContent = "";

            const username = document.getElementById("signupUsername").value.trim();
            const fullName = document.getElementById("signupFullName").value.trim();
            const email = document.getElementById("signupEmail").value.trim();
            const phone = document.getElementById("signupPhone").value.trim();
            const address = document.getElementById("signupAddress").value.trim();
            const pincode = document.getElementById("signupPincode").value.trim();
            const city = document.getElementById("signupCity").value.trim();
            const state = document.getElementById("signupState").value.trim();
            const password = document.getElementById("signupPassword").value;
            const confirmPassword = document.getElementById("signupConfirmPassword").value;
            const referralCode = referralCodeInput ? referralCodeInput.value.trim() : '';

            if (!username || !fullName || !email || !phone || !address || !pincode || !city || !state || !password || !confirmPassword) {
                errorElem.textContent = "All fields are required.";
                return;
            }

            if (password !== confirmPassword) {
                errorElem.textContent = "Passwords do not match.";
                return;
            }

            // Prepare signup data
            const signupData = {
                type: "signup",
                username: username,
                name: fullName,
                email: email,
                phone: phone,
                address: address,
                pincode: pincode,
                city: city,
                state: state,
                password: password,
                referral_code: referralCode
            };

            // Send signup data via WebSocket
            ws.send(JSON.stringify(signupData));
        });
    });

    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "signupSuccess") {
            // Clear user-specific localStorage data on new signup
            localStorage.removeItem("crickfestTransactions");
            localStorage.removeItem("crickfestPortfolio");
            localStorage.removeItem("crickfestWallet");
            localStorage.removeItem("crickfestCurrentUser");
            // Redirect to login or home page on successful signup
            window.location.href = "login.html";
        } else if (data.type === "error") {
            errorElem.textContent = data.message || "Signup failed.";
        }
    });
});
