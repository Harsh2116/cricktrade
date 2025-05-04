document.addEventListener("DOMContentLoaded", () => {
    // Get current user from localStorage
    const currentUser = localStorage.getItem("crickfestCurrentUser") || "unknown";

    // Function to generate random alphanumeric string of given length
    function generateRandomCode(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Retrieve or generate referral code for current user
    let referralCodeKey = `referralCode_${currentUser}`;
    let referralCode = localStorage.getItem(referralCodeKey);
    if (!referralCode) {
        referralCode = generateRandomCode(8);
        localStorage.setItem(referralCodeKey, referralCode);
    }

    const referralCodeElem = document.getElementById("referral-code");
    const referralLinkElem = document.getElementById("referral-link");
    const copyBtn = document.getElementById("copy-link-btn");
    const copyMessage = document.getElementById("copy-message");

    referralCodeElem.textContent = referralCode;

    // Construct referral link as relative path
    const referralLink = `signup.html?ref=${encodeURIComponent(referralCode)}`;
    referralLinkElem.value = referralLink;

    copyBtn.addEventListener("click", () => {
        referralLinkElem.select();
        referralLinkElem.setSelectionRange(0, 99999); // For mobile devices
        document.execCommand("copy");
        copyMessage.style.display = "block";
        setTimeout(() => {
            copyMessage.style.display = "none";
        }, 2000);
    });
});
