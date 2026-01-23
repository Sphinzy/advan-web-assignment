// ===== BEARER TOKEN =====
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImlhdCI6MTc2ODkyMTMwMywiZXhwIjoxNzY5NTI2MTAzfQ.g8kzC5Ai8ItElPmAPhCAD4yK1HJkB6ovoH3qLpWmHZo';
// const token = localStorage.getItem("token");

// ===== INPUT ELEMENTS =====
const titleInput = document.querySelector('input[name="title"]');
const typeSelect = document.getElementById("type");
const locationInput = document.getElementById("location");
const salaryInput = document.getElementById("salary");
const deadlineInput = document.getElementById("deadline");
const categorySelect = document.getElementById("category");
const contactInput = document.getElementById("contactEmail");
const imageInput = document.getElementById("image"); // text input for URL
const requirementsInput = document.getElementById("requirements");
const jobBtn = document.getElementById("jobBtn");

// ===== QUILL =====
const quill = new Quill("#editor", {
    theme: "snow",
    placeholder: "Write job details here..."
});

// ===== SIMPLE ALERT ERROR =====
function showError(field) {
    alert(`Please fill in ${field}`);
}

// ===== SUBMIT =====
jobBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const type = typeSelect.value;
    const location = locationInput.value.trim();
    const salary = salaryInput.value.trim();
    const deadline = deadlineInput.value;
    const categoryId = parseInt(categorySelect.value) || 1;
    const contactEmail = contactInput.value.trim();
    const requirements = requirementsInput.value.trim();
    const description = quill.root.innerHTML.trim();
    const image = imageInput.value.trim(); // URL string

    // ===== VALIDATION =====
    if (!title) return showError("title");
    if (!type) return showError("job type");
    if (!location) return showError("location");
    if (!salary) return showError("salary");
    if (!deadline) return showError("deadline");
    if (!categoryId) return showError("category");
    if (!requirements) return showError("requirements");
    if (!description || description === "<p><br></p>") return showError("description");
    if (!contactEmail) return showError("contact email");
    if (!image) return showError("image URL");

    // ===== JSON BODY =====
    const body = {
        title,
        type,
        location,
        description,
        requirements,
        salary,
        deadline,
        contactEmail,
        categoryId,
        image // string URL
    };

    // ===== SEND TO BACKEND =====
    jobBtn.disabled = true;
    jobBtn.textContent = "Publishing...";

    try {
        const res = await fetch("http://localhost:3000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Job published successfully!");
            try {
                await fetch("http://localhost/NU/job/backend/api/import_jobs_from_json.php", {
                    method: "GET" // it can be GET since your PHP script runs on access
                });
                console.log("✅ Import script triggered successfully");
            } catch (err) {
                console.error("❌ Failed to trigger import script:", err);
            }
            window.location.href = "./jobs.html";
        } else {
            console.error(data);
            alert(data.message || "Failed to publish job");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    } finally {
        jobBtn.disabled = false;
        jobBtn.textContent = "Publish";
    }
});
