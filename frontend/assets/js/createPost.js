// ================= ELEMENTS =================
const publishBtn = document.getElementById("publishBtn");
const titleInput = document.getElementById("title");
const fileInput = document.getElementById("image");

const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");

// ================= TOKEN =================
const token = localStorage.getItem("token");

// ================= CREATE POST =================
publishBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = quill.root.innerHTML.trim();
    const imageFile = fileInput.files[0];
    const categoryId = 1;

    // Reset errors
    titleError.classList.add("d-none");
    contentError.classList.add("d-none");

    let hasError = false;

    if (!title) {
        titleError.classList.remove("d-none");
        hasError = true;
    }

    if (!content || content === "<p><br></p>") {
        contentError.classList.remove("d-none");
        hasError = true;
    }

    if (!imageFile) {
        alert("Please select an image");
        hasError = true;
    }

    if (hasError) return;

    // ================= FORMDATA =================
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("categoryId", categoryId);
    formData.append("image", imageFile);

    try {
        const res = await fetch("http://localhost:3000/api/posts", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // ❌ DO NOT SET Content-Type
            },
            body: formData
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Failed to create post");
            return;
        } else {
            alert("Post created successfully ✅");
            try {
                await fetch("http://localhost/NU/job/backend/api/import_posts_from_json.php", {
                    method: "GET" // it can be GET since your PHP script runs on access
                });
                console.log("✅ Import script triggered successfully");
            } catch (err) {
                console.error("❌ Failed to trigger import script:", err);
            }
            console.log("createPost.js loaded successfully");
            window.location.href = "./blog.html";
        }

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
});