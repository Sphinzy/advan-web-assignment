const publishBtn = document.querySelector("#publishBtn");
const titleInput = document.getElementById("title");
const imageInput = document.getElementById("image");

const titleError = document.getElementById("titleError");
const contentError = document.getElementById("contentError");

// Example: get token from localStorage
const token = localStorage.getItem("token");
// const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImlhdCI6MTc2OTAwODMxNywiZXhwIjoxNzY5NjEzMTE3fQ.fKpCbu6bZYfrGr6Vauv7qEvb_AF93Xhf2bim1AeItHs';

publishBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = quill.root.innerHTML.trim(); // Quill editor content
    const image = imageInput.value.trim();
    const categoryId = 1; // change if you use category select

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

    if (hasError) return;

    try {
        const res = await fetch("http://localhost:3000/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                categoryId,
                image
            })
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

        

    } catch (error) {
        console.error(error);
        alert("Server error");
    }
});