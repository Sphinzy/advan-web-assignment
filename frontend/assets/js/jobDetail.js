document.addEventListener('DOMContentLoaded', async () => {

    const baseUrl = 'http://localhost:3000';
    const container = document.getElementById('job-detail');

    // GET ID FROM URL
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('id');

    if (!jobId) {
        container.innerHTML = '<p class="text-danger text-center">Job not found</p>';
        return;
    }

    try {
        // FETCH JOB BY ID
        const res = await fetch(`${baseUrl}/api/jobs/${jobId}`);
        const result = await res.json();
        const job = result.data;

        container.innerHTML = `
        <section>
            <div class="container">
                <div class="row py-10 g-5">

                    <!-- IMAGE -->
                    <div class="col-lg-4">
                        <div class="card border-0 shadow-sm">
                            <img src="${job.imageUrl}" class="card-img object-fit-cover" style="height: 420px" alt="${job.title}">
                        </div>
                    </div>

                    <!-- CONTENT -->
                    <div class="col-lg-8 ps-5">
                        <div class="card border-0 shadow-sm bg-card-theme p-5">

                            <h1 class="card-title">${job.title}</h1>

                            <p class="card-text clamp-3">
                                ${job.description ?? 'No description provided'}
                            </p>

                            <div class="mb-3">
                                <i class="bi bi-briefcase-fill"></i> ${job.type} |
                                <i class="bi bi-geo-alt-fill"></i> ${job.location}
                            </div>

                            <div class="card border-0 shadow-sm bg-warning bg-opacity-25 
                                        border-start border-4 border-warning p-3 my-4">
                                <p class="mb-1"><strong>Salary:</strong> ${job.salary}</p>
                                <p class="mb-1"><strong>Requirements:</strong> ${job.requirements}</p>
                                <p class="mb-0 text-danger">
                                    <strong>Deadline:</strong>
                                    ${new Date(job.deadline).toLocaleDateString()}
                                </p>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="mailto:${job.contactEmail}" class="btn btn-main">
                                    Apply Now
                                </a>

                                <a href="jobs.html" class="btn btn-outline-secondary">
                                    Back
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECOND SECTION -->
        <section>
            <div class="container">
                <div class="card border-0 shadow-sm bg-card-theme p-5 mb-5">
                    <h4>Job Description</h4>
                    <p>${job.description}</p>

                    <h4 class="mt-4">Why Apply?</h4>
                    <ul>
                        <li>Competitive salary</li>
                        <li>Professional growth</li>
                        <li>Friendly working environment</li>
                    </ul>
                </div>
            </div>
        </section>
        `;

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-danger text-center">Failed to load job</p>';
    }
});
