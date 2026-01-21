document.addEventListener("DOMContentLoaded", () => {

  const baseUrl = "http://blogs.csm.linkpc.net/api/v1";
  const perPage = 5;
  let page = 1;
  let loading = false;

  const articleDiv = document.getElementById("article");
  const loader = document.getElementById("loader");

  async function loadArticles() {
    if (loading) return;
    loading = true;
    loader.style.display = "block";

    try {
      const res = await fetch(
        `${baseUrl}/articles?search=&_page=${page}&_per_page=${perPage}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      const data = await res.json();
      const articles = data.data.items;

      if (!articles || articles.length === 0) {
        loader.innerText = "No more articles";
        window.removeEventListener("scroll", handleScroll);
        return;
      }

     articles.forEach(article => {
  const card = document.createElement("div");
  card.innerHTML = `
  <div class="post-card">

    <!-- Top row: Avatar + Name -->
    <div class="post-header">
      <div class="post-profile">
        <img src="${article.creator.avatar}" class="profile-img">
        <span class="profile-name">
          ${article.creator.firstName} ${article.creator.lastName}
        </span>
      </div>

      <!-- Article Image on the right -->
      <img src="${article.thumbnail}" class="post-image-right">
    </div>

    <!-- Article Content below -->
    <div class="post-content">
      <h5 class="post-title">${article.title}</h5>
      <p class="post-text">
        ${article.description || "In conclusion, reading is not just..."}
      </p>
    </div>

  </div>
`;

  articleDiv.appendChild(card);
});


      page++;
      loading = false;
      loader.style.display = "none";

    } catch (err) {
      console.error(err);
      loader.innerText = "Error loading articles";
    }
  }

  function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      loadArticles();
    }
  }

  loadArticles();
  window.addEventListener("scroll", handleScroll);

});
