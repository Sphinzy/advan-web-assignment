// const token = localStorage.getItem("token");
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImlhdCI6MTc2OTQ0MDI5OSwiZXhwIjoxNzcwMDQ1MDk5fQ.gZv_y0Op0cICMOa1_MkqHPuD8Cs6CSG6OyDk6pSa4Cg';

// user
document.addEventListener("DOMContentLoaded", () => {

    const apiUrl = "http://localhost:3000/api/users";
    const tableId = "usersTable";

    // Load Users
    async function loadUsers() {
        const tbody = document.querySelector(`#${tableId} tbody`);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            const users = data.data || [];

            tbody.innerHTML = users.map(user => `
                <tr data-id="${user.id}">
                    <td>${user.id}</td>
                    <td>${user.firstName ? user.firstName + ' ' + user.lastName : user.name}</td>
                    <td>${user.email || ""}</td>
                    <td>${new Date(user.registeredAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-user"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-user"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `).join("");

            attachDelete();
            attachEdit();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load users</td></tr>`;
        }
    }

    // Delete User
    function attachDelete() {
        document.querySelectorAll(`#${tableId} .delete-user`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;
                if (!confirm("Delete this user?")) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete user");
                    row.remove();
                } catch (error) {
                    console.error(error);
                    alert("Failed to delete user!");
                }
            });
        });
    }

    // Edit User
    function attachEdit() {
        document.querySelectorAll(`#${tableId} .edit-user`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;
                const currentName = row.querySelector("td:nth-child(2)").innerText;
                const currentEmail = row.querySelector("td:nth-child(3)").innerText;

                const newName = prompt("Edit user name", currentName);
                const newEmail = prompt("Edit email", currentEmail);
                if (!newName || !newEmail) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: newName, email: newEmail })
                    });
                    if (!res.ok) throw new Error("Failed to update user");

                    row.querySelector("td:nth-child(2)").innerText = newName;
                    row.querySelector("td:nth-child(3)").innerText = newEmail;

                } catch (error) {
                    console.error(error);
                    alert("Failed to update user!");
                }
            });
        });
    }

    // Add User
    async function addUser() {
        const name = prompt("Enter user name");
        const email = prompt("Enter user email");
        if (!name || !email) return;

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email })
            });
            if (!res.ok) throw new Error("Failed to add user");
            loadUsers();
        } catch (error) {
            console.error(error);
            alert("Failed to add user!");
        }
    }

    // Bind Add Button
    document.querySelector("#addUserBtn")?.addEventListener("click", addUser);

    // Initial load
    loadUsers();

});


// Jobs
document.addEventListener("DOMContentLoaded", () => {

    const apiUrl = "http://localhost:3000/api/jobs";
    const tableId = "jobsTable";

    // Load Jobs
    async function loadJobs() {
        const tbody = document.querySelector(`#${tableId} tbody`);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch jobs");
            const data = await res.json();
            const jobs = data.data || [];

            tbody.innerHTML = jobs.map(job => `
                <tr data-id="${job.id}">
                    <td>${job.id}</td>
                    <td>${job.title}</td>
                    <td>${job.type || ""}</td>
                    <td>${job.location || ""}</td>
                    <td>${job.salary || ""}</td>
                    <td>${new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-job"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-job">
                            <i class="bi bi-trash"></i>
                        </button>

                    </td>
                </tr>
            `).join("");

            attachDelete();
            attachEdit();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="7" class="text-danger">Failed to load jobs</td></tr>`;
        }
    }

    // Delete Job
    async function deleteJob(id, row) {
        if (!confirm("Delete this job?")) return;

        try {
            const res = await fetch(`${apiUrl}/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Delete failed");
            row.remove();

        } catch (err) {
            console.error(err);
            alert("Delete failed or unauthorized");
        }
    }

    function attachDelete() {
        document.querySelectorAll(`#${tableId} .delete-job`).forEach(btn => {
            btn.addEventListener("click", (e) => {
                const row = e.currentTarget.closest("tr");
                const id = row.dataset.id;

                deleteJob(id, row); // 👈 parameter
            });
        });
    }



    // Edit Job
    function attachEdit() {
        document.querySelectorAll(`#${tableId} .edit-job`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;

                // Get current values
                const currentTitle = row.querySelector("td:nth-child(2)").innerText;
                const currentType = row.querySelector("td:nth-child(3)").innerText;
                const currentLocation = row.querySelector("td:nth-child(4)").innerText;
                const currentSalary = row.querySelector("td:nth-child(5)").innerText;

                // Prompt for new values
                const newTitle = prompt("Edit job title", currentTitle);
                const newType = prompt("Edit job type", currentType);
                const newLocation = prompt("Edit location", currentLocation);
                const newSalary = prompt("Edit salary", currentSalary);

                if (!newTitle) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: newTitle,
                            type: newType,
                            location: newLocation,
                            salary: newSalary
                        })
                    });
                    if (!res.ok) throw new Error("Failed to update job");

                    row.querySelector("td:nth-child(2)").innerText = newTitle;
                    row.querySelector("td:nth-child(3)").innerText = newType;
                    row.querySelector("td:nth-child(4)").innerText = newLocation;
                    row.querySelector("td:nth-child(5)").innerText = newSalary;

                } catch (error) {
                    console.error(error);
                    alert("Failed to update job!");
                }
            });
        });
    }

    // Add Job
    async function addJob() {
        const title = prompt("Enter job title");
        if (!title) return;
        const type = prompt("Enter job type");
        const location = prompt("Enter location");
        const salary = prompt("Enter salary");

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, type, location, salary })
            });
            if (!res.ok) throw new Error("Failed to add job");
            loadJobs();
        } catch (error) {
            console.error(error);
            alert("Failed to add job!");
        }
    }

    // Bind Add Button
    document.querySelector("#addJobBtn")?.addEventListener("click", addJob);

    // Initial load
    loadJobs();

});


// categories
document.addEventListener("DOMContentLoaded", () => {

    const apiUrl = "http://localhost:3000/api/categories";
    const tableId = "categoriesTable";

    // Load Categories
    async function loadCategories() {
        const tbody = document.querySelector(`#${tableId} tbody`);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            const categories = data.data || [];

            tbody.innerHTML = categories.map(cat => `
                <tr data-id="${cat.id}">
                    <td>${cat.id}</td>
                    <td>${cat.name || cat.title}</td>
                    <td>${new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-category"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-category"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `).join("");

            attachDelete();
            attachEdit();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Failed to load categories</td></tr>`;
        }
    }

    // Delete Category
    function attachDelete() {
        document.querySelectorAll(`#${tableId} .delete-category`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;
                if (!confirm("Delete this category?")) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` }, });
                    if (!res.ok) throw new Error("Failed to delete category");
                    row.remove();
                } catch (error) {
                    console.error(error);
                    alert("Failed to delete category!");
                }
            });
        });
    }

    // Edit Category
    function attachEdit() {
        document.querySelectorAll(`#${tableId} .edit-category`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;
                const currentName = row.querySelector("td:nth-child(2)").innerText;

                const newName = prompt("Edit category name", currentName);
                if (!newName) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ name: newName })
                    });
                    if (!res.ok) throw new Error("Failed to update category");
                    row.querySelector("td:nth-child(2)").innerText = newName;
                } catch (error) {
                    console.error(error);
                    alert("Failed to update category!");
                }
            });
        });
    }

    // Add Category
    async function addCategory() {
        const name = prompt("Enter new category name");
        if (!name) return;

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", 'Authorization' : `Bearer ${token}` },
                body: JSON.stringify({ name })
            });
            if (!res.ok) throw new Error("Failed to add category");
            loadCategories();
        } catch (error) {
            console.error(error);
            alert("Failed to add category!");
        }
    }

    // Bind Add Button
    document.querySelector("#addCategoryBtn")?.addEventListener("click", addCategory);

    // Initial load
    loadCategories();

});


//posts
document.addEventListener("DOMContentLoaded", () => {

    const apiUrl = "http://localhost:3000/api/posts";
    const tableId = "postsTable";

    // Load Posts
    async function loadPosts() {
        const tbody = document.querySelector(`#${tableId} tbody`);
        try {
            const res = await fetch(apiUrl);
            if (!res.ok) throw new Error("Failed to fetch posts");
            const data = await res.json();
            const posts = data.data || [];

            tbody.innerHTML = posts.map(post => `
                <tr data-id="${post.id}">
                    <td>${post.id}</td>
                    <td>${post.title || post.name}</td>
                    <td>${post.content || ""}</td>
                    <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-post"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-danger delete-post"><i class="bi bi-trash"></i></button>
                    </td>
                </tr>
            `).join("");

            attachDelete();
            attachEdit();

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="5" class="text-danger">Failed to load posts</td></tr>`;
        }
    }

    // Delete Post
    function attachDelete() {
        document.querySelectorAll(`#${tableId} .delete-post`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;
                if (!confirm("Delete this post?")) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete post");
                    row.remove();
                } catch (error) {
                    console.error(error);
                    alert("Failed to delete post!");
                }
            });
        });
    }

    // Edit Post
    function attachEdit() {
        document.querySelectorAll(`#${tableId} .edit-post`).forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const row = e.target.closest("tr");
                const id = row.dataset.id;

                const currentTitle = row.querySelector("td:nth-child(2)").innerText;
                const currentContent = row.querySelector("td:nth-child(3)").innerText;

                const newTitle = prompt("Edit post title", currentTitle);
                const newContent = prompt("Edit content", currentContent);
                if (!newTitle) return;

                try {
                    const res = await fetch(`${apiUrl}/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ title: newTitle, content: newContent })
                    });
                    if (!res.ok) throw new Error("Failed to update post");

                    row.querySelector("td:nth-child(2)").innerText = newTitle;
                    row.querySelector("td:nth-child(3)").innerText = newContent;

                } catch (error) {
                    console.error(error);
                    alert("Failed to update post!");
                }
            });
        });
    }

    // Add Post
    async function addPost() {
        const title = prompt("Enter post title");
        if (!title) return;
        const content = prompt("Enter post content");

        try {
            const res = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error("Failed to add post");
            loadPosts();
        } catch (error) {
            console.error(error);
            alert("Failed to add post!");
        }
    }

    // Bind Add Button
    document.querySelector("#addPostBtn")?.addEventListener("click", addPost);

    // Initial load
    loadPosts();

});
