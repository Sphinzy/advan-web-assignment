document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginform");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    const baseUrl = "http://localhost:3000";

    // Toggle Password Visibility
    eyeIcon.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.replace("bi-eye-slash", "bi-eye");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.replace("bi-eye", "bi-eye-slash");
        }
    });

    // Toast Helper
    function showToast(message, type = "success") {
        const toastEl = document.getElementById("toastMsg");
        toastEl.querySelector(".toast-body").textContent = message;
        toastEl.classList.remove("bg-cus-success", "bg-cus-danger", "bg-warning");

        if (type === "success") toastEl.classList.add("bg-cus-success");
        else if (type === "error") toastEl.classList.add("bg-cus-danger");
        else if (type === "warning") toastEl.classList.add("bg-warning");

        new bootstrap.Toast(toastEl, { delay: 3000 }).show();
    }

    // Input Helpers
    const showError = (input) => input.classList.add("input-error");
    const clearError = (input) => input.classList.remove("input-error");

    emailInput.addEventListener("input", () => clearError(emailInput));
    passwordInput.addEventListener("input", () => clearError(passwordInput));

    // Handle Login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // 🔐 Admin check FIRST
        if (email === "admin@gmail.com" && password === "Satsya!22") {
            showToast("Welcome Admin!", "success");

            localStorage.setItem("role", "admin");
            localStorage.setItem("token", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImlhdCI6MTc2OTQ0MDI5OSwiZXhwIjoxNzcwMDQ1MDk5fQ.gZv_y0Op0cICMOa1_MkqHPuD8Cs6CSG6OyDk6pSa4Cg');

            setTimeout(() => {
                window.location.href = "../pages/dashboard.html";
            }, 800);

            return; // STOP normal login
        }

        // 👤 Normal user login
        try {
            const res = await fetch(`${baseUrl}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.result) {
                showToast("Invalid email or password", "error");
                showError(emailInput);
                showError(passwordInput);
                return;
            }

            localStorage.setItem("token", data.data.token);
            localStorage.setItem("id", data.data.user.id);
            localStorage.setItem("role", "user");

            showToast("Login successful!", "success");

            setTimeout(() => {
                window.location.href = "../index.html";
            }, 800);

        } catch (err) {
            console.error(err);
            showToast("Server error", "error");
        }
    });

});
