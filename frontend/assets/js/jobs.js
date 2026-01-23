document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'http://localhost:3000';
    let jobs = [];
    let filteredJobs = [];
    let currentPage = 1;
    const perPage = 8;

    const jobsContainer = document.getElementById('jobs-container');
    const pagination = document.getElementById('pagination');

    const filterTitle = document.getElementById('filterTitle');
    const filterLocation = document.getElementById('filterLocation');
    const minSalary = document.getElementById('minSalary');
    const maxSalary = document.getElementById('maxSalary');
    const filterCategory = document.getElementById('filterCategory');

    // ===== SWIPER =====
    new Swiper('.mySwiper', {
        pagination: { el: '.swiper-pagination' },
        autoplay: { delay: 4000 },
        loop: true
    });

    // ===== FETCH JOBS =====
    async function fetchJobs() {
        try {
            const res = await fetch(`${baseUrl}/api/jobs`);
            const result = await res.json();
            jobs = result.data;
            await loadCategories(); // fetch categories dynamically
            filteredJobs = [...jobs]; // show all jobs initially
            render();
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        }
    }

    // ===== FETCH CATEGORIES =====
    async function loadCategories() {
        try {
            const res = await fetch(`${baseUrl}/api/categories`);
            const result = await res.json();
            const categories = result.data;

            filterCategory.innerHTML = `<option value="">-- Show All Categories --</option>`;
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.name;
                filterCategory.appendChild(opt);
            });
        } catch (err) {
            console.error("Failed to load categories:", err);
        }
    }

    // ===== FILTER LOGIC =====
    function applyFilter() {
        const title = filterTitle.value.toLowerCase();
        const location = filterLocation.value.toLowerCase();
        const min = Number(minSalary.value) || 0;
        const max = Number(maxSalary.value) || Infinity;
        const category = filterCategory.value;

        filteredJobs = jobs.filter(job => {
            const salaryNum = Number(job.salary.replace(/\D/g, ''));
            return (
                job.title.toLowerCase().includes(title) &&
                job.location.toLowerCase().includes(location) &&
                salaryNum >= min &&
                salaryNum <= max &&
                (!category || job.categoryId == category) // show all if category is empty
            );
        });

        currentPage = 1;
        render();
    }

    // ===== RENDER JOBS =====
    function render() {
        jobsContainer.innerHTML = '';
        const start = (currentPage - 1) * perPage;
        const pageJobs = filteredJobs.slice(start, start + perPage);

        if (pageJobs.length === 0) {
            jobsContainer.innerHTML = `<p class="text-center text-muted">No jobs found</p>`;
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        pageJobs.forEach(job => {
            html += `
                <div class="col-md-3 mb-3">
                    <a href="jobDetail.html?id=${job.id}" class="text-decoration-none text-dark">
                        <div class="card shadow-sm border-0 h-100">
                            <img src="${job.image}" class="card-img-top object-fit-cover" style="height:200px;">
                            <div class="card-body">
                                <h5 class="text-primary">${job.title}</h5>
                                <span class="badge bg-success mb-2">${job.type}</span>
                                <p class="text-muted mb-1"><i class="bi bi-geo-alt"></i> ${job.location}</p>
                                <hr>
                                <p><strong>Requirements:</strong> ${job.requirements}</p>
                                <p><strong>Salary:</strong> ${job.salary}$</p>
                                <p class="text-danger"><strong>Deadline:</strong> ${new Date(job.deadline).toLocaleDateString()}</p>
                            </div>
                            <div class="card-footer bg-white border-0">
                                <a href="mailto:${job.contactEmail}" class="btn btn-main w-100">Apply Now</a>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        });
        jobsContainer.innerHTML = html;
        buildPagination();
    }

    // ===== PAGINATION =====
    function buildPagination() {
        pagination.innerHTML = '';
        const pages = Math.ceil(filteredJobs.length / perPage);

        for (let i = 1; i <= pages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link btn btn-main m-1" href="#">${i}</a>`;
            pagination.appendChild(li);
        }

        pagination.querySelectorAll('a').forEach((btn, index) => {
            btn.onclick = e => {
                e.preventDefault();
                currentPage = index + 1;
                render();
            };
        });
    }

    // ===== LIVE FILTER =====
    [filterTitle, filterLocation, minSalary, maxSalary, filterCategory].forEach(el => el.addEventListener('input', applyFilter));

    fetchJobs();
});