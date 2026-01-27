// ===== BEARER TOKEN =====
const token = localStorage.getItem("token");

// ===== INPUT ELEMENTS =====
const titleInput = document.querySelector('input[name="title"]');
const typeSelect = document.getElementById("type");
const locationInput = document.getElementById("location");
const salaryInput = document.getElementById("salary");
const deadlineInput = document.getElementById("deadline");
const categorySelect = document.getElementById("category");
const contactInput = document.getElementById("contactEmail");
const imageInput = document.getElementById("image"); // file input
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

// ===== FETCH CATEGORIES =====
async function loadCategories() {
    try {
        const res = await fetch("http://localhost:3000/api/categories");
        const data = await res.json();

        if (!res.ok) {
            console.error("Failed to load categories");
            return;
        }

        // clear old options (keep placeholder)
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';

        data.data.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        // optional: select first category by default
        if (data.data.length > 0) {
            categorySelect.value = data.data[0].id;
        }

    } catch (err) {
        console.error("Category fetch error:", err);
    }
}

// call on page load
loadCategories();

// ===== SUBMIT =====
jobBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const type = typeSelect.value;
    const location = locationInput.value.trim();
    const salary = salaryInput.value.trim();
    const deadline = deadlineInput.value;
    const categoryId = parseInt(categorySelect.value);
    const contactEmail = contactInput.value.trim();
    const requirements = requirementsInput.value.trim();
    const description = quill.root.innerHTML.trim();
    const imageFile = imageInput.files[0];

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
    if (!imageFile) return showError("image file");

    // ===== FORM DATA =====
    const formData = new FormData();
    formData.append("title", title);
    formData.append("type", type);
    formData.append("location", location);
    formData.append("salary", salary);
    formData.append("deadline", deadline);
    formData.append("categoryId", categoryId);
    formData.append("contactEmail", contactEmail);
    formData.append("requirements", requirements);
    formData.append("description", description);
    formData.append("image", imageFile);

    // ===== SEND TO BACKEND =====
    jobBtn.disabled = true;
    jobBtn.textContent = "Publishing...";

    try {
        const res = await fetch("http://localhost:3000/api/jobs", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}` // ✅ do NOT set Content-Type
            },
            body: formData
        });

        const data = await res.json();

        if (res.ok) {
            alert("Job published successfully!");
            try {
                await fetch("http://localhost/NU/job/backend/api/import_jobs_from_json.php", {
                    method: "GET"
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
