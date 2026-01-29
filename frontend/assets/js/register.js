const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const cpassword = document.getElementById("cpassword");

const eyePassword = document.getElementById("eyePassword");
const eyeCPassword = document.getElementById("eyeCPassword");

// ------------------- Toast Helper -------------------
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('toastMsg');
    toastEl.querySelector('.toast-body').textContent = message;
    toastEl.classList.remove('bg-cus-success', 'bg-cus-danger', 'bg-warning');

    if (type === 'success') toastEl.classList.add('bg-cus-success');
    else if (type === 'error') toastEl.classList.add('bg-cus-danger');
    else if (type === 'warning') toastEl.classList.add('bg-warning');

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

// ------------------- Input Helpers -------------------
const showError = (input) => { input.classList.add("input-error"); input.classList.remove("input-normal"); };
const clearError = (input) => { input.classList.remove("input-error"); input.classList.add("input-normal"); };

// Clear border on typing
[fname, lname, email, password, cpassword].forEach(input => {
    input.addEventListener("input", () => clearError(input));
});

// ------------------- Toggle Password Visibility -------------------
eyePassword.addEventListener("click", () => {
    password.type = password.type === "password" ? "text" : "password";
    eyePassword.classList.toggle("bi-eye");
    eyePassword.classList.toggle("bi-eye-slash");
});

eyeCPassword.addEventListener("click", () => {
    cpassword.type = cpassword.type === "password" ? "text" : "password";
    eyeCPassword.classList.toggle("bi-eye");
    eyeCPassword.classList.toggle("bi-eye-slash");
});

// ------------------- Signup Flow -------------------
function signup() {
    // Clear previous borders
    [fname, lname, email, password, cpassword].forEach(clearError);

    // Validation
    if (!fname.value.trim() && !lname.value.trim() && !email.value.trim() && !password.value && !cpassword.value) {
        showError(fname);
        showError(lname);
        showError(email);
        showError(password);
        showError(cpassword);
        return showToast("Invalid Input", "error");
    }
    if (!fname.value.trim()) { showError(fname); return showToast("First Name is required", "error"); }
    if (!lname.value.trim()) { showError(lname); return showToast("Last Name is required", "error"); }
    if (!email.value.trim()) { showError(email); return showToast("Email is required", "error"); }
    if (!/^\S+@\S+\.\S+$/.test(email.value)) { showError(email); return showToast("Invalid email example@gmail.com", "error"); }
    if (!password.value) { showError(password); return showToast("Password is required", "error"); }
    if (password.value.length < 6) { showError(password); return showToast("Password must be at least 6 characters", "error"); }
    if (password.value !== cpassword.value) { showError(cpassword); return showToast("Passwords do not match", "error"); }

    // Submit form
    fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName: fname.value.trim(),
            lastName: lname.value.trim(),
            email: email.value.trim(),
            password: password.value,
            confirmPassword: cpassword.value
        }),
    })
        .then(res => res.json())
        .then(data => {
            if (data.result) {
                showToast("Registered successfully!", "success");
                setTimeout(() => {
                    window.location.href = "../pages/login.html";
                }, 1000);
            } else {
                showToast("Registration failed: " + (data.message || "Unknown error"), "error");
            }
        })
        .catch(err => showToast("Network error: " + err.message, "error"));
}