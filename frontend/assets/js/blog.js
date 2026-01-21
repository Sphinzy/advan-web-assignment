const baseUrl = 'http://localhost:3000';
function timeAgo(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0'); // DD
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()]; // MMM
    const year = d.getFullYear(); // YYYY

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0'); // MM
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}
fetch(`${baseUrl}/api/posts`)
.then(res => res.json())
    .then(blogData => {
        itemsCard = blogData.data;
        console.log(blogData);
        let card = '';
        for (i = 0; i < itemsCard.length; i++){
            card += `
                <div class="col-md-4">
                        <a href="blogDetail.html?id=${itemsCard[i].id}" class="text-decoration-none">
                            <div class="card shadow-sm border-0 h-100">

                                <!-- Blog Image -->
                                <img src="${itemsCard[i].image}"
                                    class="card-img-top object-fit-cover posts-image" style="height: 250px;" alt="Blog Image">

                                <div class="card-body">
                                    <h5 class="card-title fw-bold">
                                        <i class="bi bi-journal-text me-1 text-primary"></i>
                                        ${itemsCard[i].title}
                                    </h5>

                                    <p class="card-text text-muted clamp-1">
                                        ${itemsCard[i].content}
                                    </p>
                                </div>

                                <!-- Author & Date -->
                                <div class="card-footer bg-white border-0 d-flex align-items-center justify-content-between">

                                    <div class="d-flex align-items-center">
                                        <img src="${itemsCard[i].author.avatar}"
                                            class="rounded-circle me-2 object-fit-cover" width="40" height="40" alt="Author Avatar">

                                        <div>
                                            <div class="fw-semibold">
                                                ${itemsCard[i].author.name}
                                            </div>
                                            <small class="text-muted">Author</small>
                                        </div>
                                    </div>

                                    <strong class="text-muted">
                                        <i class="bi bi-calendar-event me-1"></i>
                                        ${timeAgo(itemsCard[i].createdAt)}
                                    </strong>

                                </div>

                            </div>
                        </a>
                    </div>
            `
        }
        document.querySelector('.blogCard').innerHTML = card;
})