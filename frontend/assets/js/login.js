const loginform = document.getElementById("loginform");
const email = document.getElementById("email");
const password = document.getElementById("password");
const erremail = document.getElementById("erremail");
const errpassword = document.getElementById("errpassword");
const eyeIcon = document.getElementById("eyeIcon");
const baseUrl = "http://localhost:3000";

// ------------------- Toast Helper -------------------
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('toastMsg');
    toastEl.querySelector('.toast-body').textContent = message;

    // Set color based on type
    toastEl.classList.remove('bg-cus-success', 'bg-cus-danger', 'bg-warning');
    if (type === 'success') toastEl.classList.add('bg-cus-success');
    else if (type === 'error') toastEl.classList.add('bg-cus-danger');
    else if (type === 'warning') toastEl.classList.add('bg-warning');

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// ------------------- Input Helpers -------------------
const showError = (input) => {
    input.classList.add("input-error");
    input.classList.remove("input-normal");
};

const clearError = (input) => {
    input.classList.remove("input-error");
    input.classList.add("input-normal");
};

// ------------------- Toggle Password -------------------
function togglePassword() {
    if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
    } else {
        password.type = "password";
        eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
    }
}

// ------------------- Login Submit -------------------
loginform.addEventListener("submit", function (event) {
    event.preventDefault();

    console.log("Attempting login with:", email.value, password.value);

    fetch(`http://localhost:3000/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value, password: password.value })
    })
        .then(res => res.json())
        .then(async data => {
            console.log("Login response:", data);
            if (!data.result) {
                showToast("Invalid email or password!", "error");
                showError(email);
                showError(password);
            } else {
                showToast("Login successful!", "success");
                localStorage.setItem("token", data.data.token);
                localStorage.setItem("getImage", data.data.user.avatar);
                window.location.href = "../index.html";

                // Trigger PHP import script
                try {
                    const importRes = await fetch("http://localhost/NU/job/backend/api/import_users_from_json.php", {
                        method: "GET"
                    });
                    const importText = await importRes.text();
                    console.log("✅ Import script output:", importText);
                } catch (err) {
                    console.error("❌ Failed to trigger import script:", err);
                }
            }
        })

        .catch(err => {
            console.error("Login fetch error:", err);
            showToast("Server error! Please try again.", "error");
        });
});


email.addEventListener("input", () => clearError(email));
password.addEventListener("input", () => clearError(password));