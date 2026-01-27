document.addEventListener('DOMContentLoaded', async () => {

    const baseUrl = 'http://localhost:3000';
    const container = document.getElementById('post-detail');

    if (!container) {
        console.error("post-detail container not found");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        container.innerHTML = '<p class="text-danger text-center">Post not found</p>';
        return;
    }

    try {
        const res = await fetch(`${baseUrl}/api/posts/${postId}`);
        const result = await res.json();

        if (!res.ok || !result.data) {
            container.innerHTML = '<p class="text-danger text-center">Post not found</p>';
            return;
        }

        const post = result.data;

        container.innerHTML = `
            <div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-lg-9">

            <article class="card border-0 shadow-lg rounded-4 overflow-hidden">

                <!-- Blog Image -->
                <div class="position-relative">
                    <img src="${post.imageUrl}" class="img-fluid w-100" style="max-height: 420px; object-fit: cover;">
                    <span class="badge text-dark fs-6 position-absolute bottom-0 start-0 m-3 px-3 py-2">
                        ${new Date(post.createdAt).toLocaleDateString()}
                    </span>
                </div>

                <!-- Content -->
                <div class="card-body p-5">

                    <!-- Title -->
                    <h1 class="fw-bold mb-3" style="line-height: 1.3;">
                        ${post.title}
                    </h1>

                    <!-- Author -->
                    <div class="d-flex align-items-center mb-4">
                        <img 
                            src="${post.author?.avatar}" 
                            class="rounded-circle border me-3"
                            width="50" height="50"
                            style="object-fit: cover;"
                        >
                        <div>
                            <h6 class="mb-0 fw-semibold">${post.author?.name}</h6>
                            <small class="text-muted">Author</small>
                        </div>
                    </div>

                    <hr>

                    <!-- Blog Content -->
                    <div class="blog-content fs-5 text-muted" style="line-height: 1.9;">
                        ${post.content}
                    </div>

                    <!-- Back Button -->
                    <div class="mt-5">
                        <a href="blog.html" class="btn btn-main">
                            ← Back to Blogs
                        </a>
                    </div>

                </div>
            </article>

        </div>
    </div>
</div>

        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-danger text-center">Server error</p>';
    }
    
});
