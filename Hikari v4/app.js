// =========================
// 📦 STORAGE SYSTEM
// =========================

function getUserList() {
  return JSON.parse(localStorage.getItem("userList")) || {
    anime: {},
    manga: {}
  };
}

function saveUserList(data) {
  localStorage.setItem("userList", JSON.stringify(data));
}

function updateList(type, id, field, value) {
  const list = getUserList();

  if (!list[type][id]) {
    list[type][id] = {
      status: "plan",
      score: 0,
      progress: 0
    };
  }

  list[type][id][field] = value;
  saveUserList(list);
}

// =========================
// ⚙️ CONFIG
// =========================

const BASE_URL = "https://api.jikan.moe/v4";

let currentPage = 1;
let currentQuery = "";
let currentGenre = "";
let loading = false;

let heroList = [];
let learningMode = localStorage.getItem("learningMode") === "true";

// =========================
// 🌙 THEME
// =========================

function applyTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", theme);
}

function toggleTheme() {
  const theme = localStorage.getItem("theme") || "dark";
  localStorage.setItem("theme", theme === "dark" ? "light" : "dark");
  applyTheme();
}

applyTheme();

// =========================
// 🧠 LEARNING MODE
// =========================

function toggleLearningMode() {
  learningMode = !learningMode;
  localStorage.setItem("learningMode", learningMode);
  location.reload();
}

// =========================
// ⭐ FAVORITES
// =========================

function toggleFavorite(id) {
  let fav = JSON.parse(localStorage.getItem("favorites")) || [];

  if (fav.includes(id)) {
    fav = fav.filter(f => f !== id);
  } else {
    fav.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(fav));
}

// =========================
// 🧊 SKELETON LOADING
// =========================

function showSkeleton(grid, count = 12) {
  grid.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const div = document.createElement("div");
    div.className = "skeleton-card";
    div.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    `;
    grid.appendChild(div);
  }
}

// =========================
// 🎬 HOME PAGE
// =========================

const isHome = document.getElementById("grid");

if (isHome) {
  const grid = document.getElementById("grid");
  const searchInput = document.getElementById("search");

  fetchAnime(false);
  loadGenres();
  setupInfiniteScroll();

  searchInput.addEventListener("input", () => {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchAnime(false);
    saveSearch(currentQuery);
  });

  async function fetchAnime(append = false) {
    if (loading) return;
    loading = true;

    if (!append) showSkeleton(grid);

    let url = `${BASE_URL}/top/anime?page=${currentPage}`;

    if (currentQuery) {
      url = `${BASE_URL}/anime?q=${currentQuery}&page=${currentPage}`;
    }

    if (currentGenre) {
      url = `${BASE_URL}/anime?genres=${currentGenre}&page=${currentPage}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    renderAnime(data.data, append);
    loading = false;
  }

  function renderAnime(list, append) {
    const grid = document.getElementById("grid");
    const fav = JSON.parse(localStorage.getItem("favorites")) || [];
    const userList = getUserList();

    if (!append) grid.innerHTML = "";

    list.forEach(anime => {
      const status = userList.anime[anime.mal_id]?.status || "plan";

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" />

        <h3>${learningMode ? (anime.title_japanese || anime.title) : anime.title}</h3>

        <p>⭐ ${anime.score || "N/A"}</p>

        <p>${(anime.genres || []).map(g => g.name).join(", ")}</p>

        <select onchange="setStatus(${anime.mal_id}, this.value)">
          <option value="plan" ${status === "plan" ? "selected" : ""}>Plan</option>
          <option value="watching" ${status === "watching" ? "selected" : ""}>Watching</option>
          <option value="completed" ${status === "completed" ? "selected" : ""}>Completed</option>
          <option value="dropped" ${status === "dropped" ? "selected" : ""}>Dropped</option>
        </select>

        <button onclick="openModal(${anime.mal_id})">Details</button>

        <button onclick="toggleFavorite(${anime.mal_id})">
          ${fav.includes(anime.mal_id) ? "❤️" : "🤍"}
        </button>
      `;

      grid.appendChild(card);
    });
  }

  function setupInfiniteScroll() {
    const sentinel = document.createElement("div");
    sentinel.id = "sentinel";
    document.body.appendChild(sentinel);

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        currentPage++;
        fetchAnime(true);
      }
    }, { rootMargin: "200px" });

    observer.observe(sentinel);
  }

  window.setStatus = (id, value) => {
    updateList("anime", id, "status", value);
  };
}

// =========================
// 🎭 MODAL SYSTEM
// =========================

async function openModal(id) {
  const res = await fetch(`${BASE_URL}/anime/${id}`);
  const data = await res.json();
  const anime = data.data;

  let modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal()">✖</span>

      <img src="${anime.images.jpg.large_image_url}" />

      <h2>${anime.title}</h2>

      <p>${anime.synopsis || "No synopsis available."}</p>

      ${
        anime.trailer?.embed_url
          ? `<iframe src="${anime.trailer.embed_url}" allowfullscreen></iframe>`
          : ""
      }

      <button onclick="toggleFavorite(${anime.mal_id})">❤️ Favorite</button>
    </div>
  `;

  modal.classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

// =========================
// 🎛️ GENRES
// =========================

const genres = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 7, name: "Mystery" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" }
];

function loadGenres() {
  const sidebar = document.getElementById("genreSidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <h3>Genres</h3>
    <button onclick="clearGenre()" class="active" id="allBtn">All</button>
    ${genres.map(g =>
      `<button onclick="filterGenre(${g.id}, this)">${g.name}</button>`
    ).join("")}
  `;
}

// FILTER GENRE
window.filterGenre = function(id, btn) {
  currentGenre = id;
  currentPage = 1;

  setActive(btn);

  const grid = document.getElementById("grid");
  if (grid) grid.innerHTML = "";

  fetchAnime(false);
};

// CLEAR FILTER
window.clearGenre = function() {
  currentGenre = "";
  currentPage = 1;

  document.querySelectorAll(".genre-sidebar button")
    .forEach(b => b.classList.remove("active"));

  document.getElementById("allBtn").classList.add("active");

  const grid = document.getElementById("grid");
  if (grid) grid.innerHTML = "";

  fetchAnime(false);
};

// ACTIVE STATE
function setActive(btn) {
  document.querySelectorAll(".genre-sidebar button")
    .forEach(b => b.classList.remove("active"));

  if (btn) btn.classList.add("active");
}

// =========================
// 🕘 SEARCH HISTORY
// =========================

function saveSearch(query) {
  if (!query) return;

  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  history = history.filter(q => q !== query);
  history.unshift(query);

  history = history.slice(0, 5);

  localStorage.setItem("searchHistory", JSON.stringify(history));
}

// =========================
// 🔗 NAVIGATION HELPERS
// =========================

function viewDetails(id) {
  openModal(id);
}

//hero section

function startHeroSlider() {
  const hero = document.getElementById("hero");
  if (!hero || !heroList?.length) return;

  heroIndex = 0;
  renderHero(heroList[0]);

  if (heroInterval) clearInterval(heroInterval);

  heroInterval = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroList.length;
    renderHero(heroList[heroIndex]);
  }, 6000);
}

function renderHero(anime) {
  const hero = document.getElementById("hero");
  if (!hero || !anime) return;

  const image =
    anime.images?.jpg?.large_image_url ||
    anime.images?.jpg?.image_url ||
    "";

  hero.innerHTML = `
    <div class="hero-bg" style="background-image:url('${image}')"></div>

    <div class="hero-overlay"></div>

    <div class="hero-content hero-animate">
      <h1>${anime.title || "Unknown"}</h1>

      <p class="hero-meta">
        ⭐ ${anime.score || "N/A"} • ${(anime.genres || []).map(g => g.name).join(", ")}
      </p>

      <p class="hero-desc">
        ${(anime.synopsis || "No description available.").slice(0, 180)}...
      </p>

      <div class="hero-buttons">
        <button onclick="openModal(${anime.mal_id})">▶ Play</button>
        <button onclick="toggleFavorite(${anime.mal_id})">❤️ My List</button>
      </div>
    </div>
  `;
}

