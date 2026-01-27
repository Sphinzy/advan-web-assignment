const baseUrl = 'http://localhost:3000';

// GET USER INFO FROM STORAGE
const userId = Number(localStorage.getItem('id'));
const token = localStorage.getItem('token');

// DOM ELEMENTS
const avatar = document.getElementById('profile-avatar');
const nameEl = document.getElementById('profile-name');
const usernameEl = document.getElementById('profile-username');
const bioEl = document.getElementById('profile-bio');
const jobsContainer = document.getElementById('jobs-container');
const blogsContainer = document.getElementById('blogs-container');

// ================= DELETE FUNCTION =================
window.deletePost = async function (type, id) {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    const endpoint = type === 'jobs' ? 'jobs' : 'posts';

    try {
        const res = await fetch(`${baseUrl}/api/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Delete failed');

        await Render();
        alert(`${type} deleted successfully`);
    } catch (err) {
        console.error(err);
        alert(`Error deleting ${type}`);
    }
};

// ================= UPDATE POST =================
window.updatePost = async function (postId) {
    try {
        const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch post');

        const data = await res.json();
        const post = data.data;

        document.getElementById('update-title').value = post.title;
        document.getElementById('update-content').value = post.content;

        const saveBtn = document.getElementById('btnSavePost');
        saveBtn.replaceWith(saveBtn.cloneNode(true));

        document
            .getElementById('btnSavePost')
            .addEventListener('click', () => btnSavePost(postId));

        const modalEl = document.getElementById('updateModal');
        bootstrap.Modal.getOrCreateInstance(modalEl).show();

    } catch (err) {
        console.error(err);
        alert('Failed to load post');
    }
};

// ================= SAVE UPDATED POST =================
async function btnSavePost(postId) {
    if (!postId) return alert('Post ID missing');

    const title = document.getElementById('update-title').value.trim();
    const content = document.getElementById('update-content').value.trim();

    if (!title || !content) return alert('Title & content required');

    try {
        const res = await fetch(`${baseUrl}/api/posts/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        if (!res.ok) throw new Error('Update failed');

        bootstrap
            .Modal
            .getOrCreateInstance(document.getElementById('updateModal'))
            .hide();

        await Render();
        alert('Post updated successfully');

    } catch (err) {
        console.error(err);
        alert('Error updating post');
    }
}

// ================= RENDER FUNCTION =================
async function Render() {
    try {
        // -------- FETCH USER --------
        const userRes = await fetch(`${baseUrl}/api/users/${userId}`);
        const userData = await userRes.json();
        const user = userData.data;

        avatar.src = user.avatar;

        nameEl.textContent = `${user.firstName} ${user.lastName}`;
        usernameEl.textContent = user.email.split('@')[0];
        bioEl.textContent = `Registered at: ${new Date(user.registeredAt).toLocaleDateString()}`;

        // -------- FETCH JOBS --------
        const jobsRes = await fetch(`${baseUrl}/api/jobs`);
        const jobsData = await jobsRes.json();

        const userJobs = jobsData.data.filter(j => j.authorId === userId);

        jobsContainer.innerHTML = userJobs.length
            ? userJobs.map(job => `
                <div class="col-6">
                    <a href="jobDetail.html?id=${job.id}" class="text-decoration-none text-dark">
                    <div class="card shadow-sm">
                        <img src="${job.imageUrl}" class="card-img-top" style="height:200px;object-fit:cover">
                        <div class="card-body">
                            <h6 class="card-title">${job.title}</h6>
                            <button class="btn btn-sm btn-danger"
                                onclick="deletePost('jobs', ${job.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                    </a>
                </div>
            `).join('')
            : `<p class="text-center text-muted">No jobs yet</p>`;

        // -------- FETCH BLOGS --------
        const blogsRes = await fetch(`${baseUrl}/api/posts/author/${userId}`);
        const blogsData = await blogsRes.json();

        const userBlogs = blogsData.data;

        blogsContainer.innerHTML = userBlogs.length
            ? userBlogs.map(post => `
                <div class="col-6">
                <div class="card shadow-sm">
                <a href="blogDetail.html?id=${post.id}" class="text-decoration-none text-dark">
                        <img src="${post.imageUrl}" class="card-img-top" style="height:200px;object-fit:cover">
                        </a>
                        <div class="card-body">
                            <h6 class="card-title">${post.title}</h6>
                            <button class="btn btn-sm btn-warning me-1"
                                onclick="updatePost(${post.id})">
                                Update
                            </button>
                            <button class="btn btn-sm btn-danger"
                                onclick="deletePost('posts', ${post.id})">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')
            : `<p class="text-center text-muted">No blog posts yet</p>`;

    } catch (err) {
        console.error(err);
        jobsContainer.innerHTML = `<p class="text-danger">Failed to load jobs</p>`;
        blogsContainer.innerHTML = `<p class="text-danger">Failed to load blogs</p>`;
    }
}

// INITIAL LOAD
document.addEventListener('DOMContentLoaded', Render);
