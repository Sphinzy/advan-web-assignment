document.querySelector('header').innerHTML = `
<nav class="navbar fixed-top bg-secondary-subtle">
        <div class="container">
            <div>
                <img src="../../img/logo-team.png" id="logoImage" alt="">
                <a class="navbar-brand fs-5 fw-bold text-main" href="#">JOBHUB</a>
            </div>

            <!-- menu icon  -->
            <button class="navbar-toggler d-flex d-lg-none" type="button" data-bs-toggle="offcanvas"
                data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- side bar  -->
            <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar"
                aria-labelledby="offcanvasNavbarLabel">
                <div class="offcanvas-header">
                    <div>
                        <img src="../../img/logo-team.png" id="logoImage" alt="">
                        <a class="navbar-brand fs-5 fw-bold text-main" href="#">JOBHUB</a>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                        <li class="nav-item ps-3 rounded-2">
                            <a href="../../index.html" class="nav-link active"><i class="bi bi-house-door pe-1"></i>Home</a>
                        </li>
                        <li class="nav-item ps-3">
                            <a href="../../pages/jobs.html" class="nav-link text-main"><i class="bi bi-briefcase pe-1"></i>Job</a>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- input search  -->
            <div class="d-none d-lg-flex">
                <ul class="navbar-nav d-flex flex-row">
                    <li class="nav-item ps-3 rounded-2">
                        <a href="../index.html" class="nav-link active"><i class="bi bi-house-door pe-1"></i>Home</a>
                    </li>
                    <li class="nav-item ps-3">
                        <a href="../pages/jobs.html" class="nav-link text-main"><i class="bi bi-briefcase pe-1"></i>Job</a>
                    </li>
                </ul>
            </div>

            <div class="dropdown d-none d-lg-flex">
                <a class="nav-link px-3" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div style="border: 2px solid var(--bs-main); border-radius: 50%; ">
                        <img src="../assets/images/profile.png" class="img-fluid rounded-circle object-fit-cover" id="profile-image"
                            style="width: 40px; height: 40px;" alt />
                    </div>
                </a>

                <ul class="dropdown-menu border-0 shadow-sm bg-body-theme">
                    <li><a class='dropdown-item' href='../pages/profile.html'><i
                                class="bi bi-person-circle me-2"></i>Profile</a>
                    </li>
                    <li><a class="dropdown-item" href="" data-bs-toggle="modal" data-bs-target="#logoutModal"><i
                                class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
                </ul>
            </div>

        </div>
    </nav>

`