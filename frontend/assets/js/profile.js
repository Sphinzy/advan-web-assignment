const baseUrl = 'http://localhost:3000';
const userId = 9; // Change this to the logged-in user ID
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImlhdCI6MTc2OTAwODMxNywiZXhwIjoxNzY5NjEzMTE3fQ.fKpCbu6bZYfrGr6Vauv7qEvb_AF93Xhf2bim1AeItHs'; // Replace with actual token
// const token = localStorage.getItem("token");

const avatar = document.getElementById('profile-avatar');
const nameEl = document.getElementById('profile-name');
const usernameEl = document.getElementById('profile-username');
const bioEl = document.getElementById('profile-bio');
const jobsContainer = document.getElementById('jobs-container');
const blogsContainer = document.getElementById('blogs-container');

// ================= DELETE FUNCTION =================
window.deletePost = async function(type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
        const res = await fetch("http://localhost/NU/job/backend/api/posts.php", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }) // send ID as JSON
        });

        const data = await res.json();

        if (!data.success) throw new Error(data.error || 'Failed to delete');
        try {
            await fetch("http://localhost/NU/job/backend/api/posts.php", {
                method: "DELETE" // it can be GET since your PHP script runs on access
            });
            console.log("✅ Import script triggered successfully");
        } catch (err) {
            console.error("❌ Failed to trigger import script:", err);
        }
        alert(`${type} deleted successfully!`);
        await Render(); // refresh your frontend

    } catch (err) {
        console.error(err);
        alert(`Error deleting ${type}: ${err.message}`);
    }
};


// ================= UPDATE POST =================
const updatePost = async (postId) => {
    try {
        // Fetch post data
        const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const post = data.data;

        // Fill modal inputs
        document.querySelector('#update-title').value = post.title;
        document.querySelector('#update-image').value = post.image;
        document.querySelector('#update-content').value = post.content;

        // Setup save button
        const saveBtn = document.querySelector('#btnSavePost');

        // Remove previous listeners
        saveBtn.replaceWith(saveBtn.cloneNode(true));
        const newSaveBtn = document.querySelector('#btnSavePost');
        newSaveBtn.addEventListener('click', () => btnSavePost(postId)); // pass correct postId

        // Show modal
        const modalEl = document.querySelector('#updateModal');
        bootstrap.Modal.getOrCreateInstance(modalEl).show();

    } catch (err) {
        console.error(err);
        alert('Failed to load post');
    }
};


// ================= SAVE UPDATED POST =================
const btnSavePost = async (postId) => {
    if (!postId) {
        return alert("Post ID is missing!"); // this will catch undefined postId
    }

    const titleInput = document.querySelector('#update-title');
    const contentInput = document.querySelector('#update-content');

    if (!titleInput.value.trim() || !contentInput.value.trim()) {
        return alert("Title and content are required");
    }

    try {
        const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title: titleInput.value.trim(),
                content: contentInput.value.trim()
            })
        });

        if (!res.ok) throw new Error('Failed to update post');

        const data = await res.json();
        console.log("Saving post with ID:", postId);

        // Hide modal
        const modalEl = document.querySelector('#updateModal');
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();

        showToast("Post updated successfully!");
        await Render(); // Refresh content

    } catch (err) {
        console.error(err);
        // alert('E/rror updating post');
    }
};
    



// ================= RENDER FUNCTION =================
async function Render() {
    try {
        // FETCH USER INFO
        const userRes = await fetch(`${baseUrl}/api/users/${userId}`);
        const userData = await userRes.json();
        const user = userData.data;

        avatar.src = user.avatar || '../../image/project-logo/profile-img.jpg';
        nameEl.textContent = `${user.firstName} ${user.lastName}`;
        usernameEl.textContent = user.email.split('@')[0];
        bioEl.textContent = `Registered at: ${new Date(user.registeredAt).toLocaleDateString()}`;

        // FETCH JOBS
        const jobsRes = await fetch(`${baseUrl}/api/jobs`);
        const jobsData = await jobsRes.json();
        const userJobs = jobsData.data.filter(j => j.authorId === userId);

        jobsContainer.innerHTML = userJobs.length
            ? userJobs.map(job => `
                <div class="col-6">
                    <div class="card bg-card-theme border-0 rounded-3 shadow-sm">
                        <div class="card-body p-2">
                            <img src="${job.image}" class="card-img border object-fit-cover" style="height:200px;">
                        </div>
                        <div class="card-footer border-0 bg-transparent py-2 d-flex justify-content-between">
                            <h6 class="card-title mb-0 clamp-1">${job.title}</h6>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-danger" onclick="deletePost('jobs', ${job.id})">Delete</button>
                            </div>
                    </div>
                </div>
            `).join('')
            : `<p class="text-center text-muted">No job posts yet</p>`;

        // FETCH BLOGS
        const blogsRes = await fetch(`${baseUrl}/api/posts`);
        const blogsData = await blogsRes.json();
        const userBlogs = blogsData.data.filter(p => p.authorId === userId);

        blogsContainer.innerHTML = userBlogs.length
            ? userBlogs.map(post => `
                <div class="col-6">
                    <div class="card bg-card-theme border-0 rounded-3 shadow-sm p-2">
                        <div class="card-body p-2">
                            <img src="${post.image}" class="card-img border object-fit-cover" style="height:200px;">
                        </div>
                        <div class="card-footer border-0 bg-transparent py-2 d-flex justify-content-between">
                            <h6 class="card-title clamp-1">${post.title}</h6>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-warning me-1" onclick="updatePost(${post.id})" data-bs-toggle="modal" data-bs-target="#updateModal">Update</button>
                                <button class="btn btn-sm btn-danger" onclick="deletePost('posts', ${post.id})">Delete</button>
                            </div>
                    </div>
                </div>
            `).join('')
            : `<p class="text-center text-muted">No blog posts yet</p>`;

    } catch (err) {
        console.error(err);
        jobsContainer.innerHTML = `<p class="text-danger text-center">Failed to load jobs</p>`;
        blogsContainer.innerHTML = `<p class="text-danger text-center">Failed to load blogs</p>`;
    }
}

// INITIAL CALL
document.addEventListener('DOMContentLoaded', Render);
