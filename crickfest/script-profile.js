// script-profile.js

// Utility functions to get and save user profiles
function getUserProfiles() {
    const profiles = localStorage.getItem("crickfestUserProfiles");
    return profiles ? JSON.parse(profiles) : {};
}

function saveUserProfiles(profiles) {
    localStorage.setItem("crickfestUserProfiles", JSON.stringify(profiles));
}

document.addEventListener("DOMContentLoaded", () => {
    const currentUser = localStorage.getItem("crickfestCurrentUser");
    if (!currentUser) {
        // Redirect to login if not logged in
        window.location.href = "login.html";
        return;
    }

    const profiles = getUserProfiles();
    const profile = profiles[currentUser] || {};

    // Prefill form fields
    document.getElementById("email").value = currentUser;
    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("fullAddress").value = profile.fullAddress || "";
    document.getElementById("pincode").value = profile.pincode || "";
    document.getElementById("state").value = profile.state || "";
    document.getElementById("city").value = profile.city || "";

    const form = document.getElementById("profileForm");
    const successMessage = document.getElementById("profileSuccess");
    const pincodeInput = document.getElementById("pincode");
    const stateInput = document.getElementById("state");
    const cityInput = document.getElementById("city");

    // Function to fetch city and state from pincode using API
    async function fetchCityState(pincode) {
        try {
            // Using API from https://api.postalpincode.in/pincode/{pincode}
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();
            if (data[0].Status === "Success") {
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District,
                    state: postOffice.State
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error fetching pincode data:", error);
            return null;
        }
    }

    // Event listener for pincode input change
    pincodeInput.addEventListener("input", async () => {
        const pincode = pincodeInput.value.trim();
        if (/^\d{6}$/.test(pincode)) {
            const location = await fetchCityState(pincode);
            if (location) {
                cityInput.value = location.city;
                stateInput.value = location.state;
            } else {
                cityInput.value = "";
                stateInput.value = "";
            }
        } else {
            cityInput.value = "";
            stateInput.value = "";
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Validate pincode format (6 digits)
        const pincodeValue = form.pincode.value.trim();
        if (!/^\d{6}$/.test(pincodeValue)) {
            alert("Please enter a valid 6-digit pincode.");
            form.pincode.focus();
            return;
        }

        // Collect form data
        const updatedProfile = {
            firstName: form.firstName.value.trim(),
            lastName: form.lastName.value.trim(),
            fullAddress: form.fullAddress.value.trim(),
            pincode: pincodeValue,
            state: form.state.value.trim(),
            city: form.city.value.trim()
        };

        // Save updated profile
        profiles[currentUser] = updatedProfile;
        saveUserProfiles(profiles);

        successMessage.textContent = "Profile saved successfully!";
        setTimeout(() => {
            successMessage.textContent = "";
        }, 3000);

        // Show saved profile details and hide form
        showProfileDetails(updatedProfile);
    });

    // Function to show saved profile details and toggle views
    function showProfileDetails(profile) {
        document.getElementById("profileForm").style.display = "none";
        const detailsSection = document.getElementById("profileDetails");
        document.getElementById("detailEmail").textContent = document.getElementById("email").value;
        document.getElementById("detailFirstName").textContent = profile.firstName;
        document.getElementById("detailLastName").textContent = profile.lastName;
        document.getElementById("detailFullAddress").textContent = profile.fullAddress;
        document.getElementById("detailPincode").textContent = profile.pincode;
        document.getElementById("detailState").textContent = profile.state;
        document.getElementById("detailCity").textContent = profile.city;
        detailsSection.style.display = "block";
    }

    // Edit profile button click handler
    document.getElementById("editProfileBtn").addEventListener("click", () => {
        document.getElementById("profileDetails").style.display = "none";
        document.getElementById("profileForm").style.display = "block";
    });

    // On page load, if profile exists, show details view instead of form
    if (profile.firstName) {
        showProfileDetails(profile);
    }
});
