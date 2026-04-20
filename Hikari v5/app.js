const state = {
  page: 1,
  query: "",
  loading: false
};

const BASE_URL = "https://api.jikan.moe/v4";

// THEME
function applyTheme() {
  document.body.dataset.theme =
    localStorage.getItem("theme") || "dark";
}

function toggleTheme() {
  const t = localStorage.getItem("theme") === "dark" ? "light" : "dark";
  localStorage.setItem("theme", t);
  applyTheme();
}

// STORAGE
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(fav) {
  localStorage.setItem("favorites", JSON.stringify(fav));
}

function toggleFavorite(anime) {
  let fav = getFavorites();

  const exists = fav.find(f => f.id === anime.mal_id);

  if (exists) {
    fav = fav.filter(f => f.id !== anime.mal_id);
  } else {
    fav.push({
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url
    });
  }

  saveFavorites(fav);
}

// API
// =========================
// 🎬 FETCH ANIME (FIXED)
// =========================

async function fetchAnime(append = false) {
  if (state.loading) return;
  state.loading = true;

  const grid = document.getElementById("grid");

  if (!append) {
    grid.innerHTML = `
  <div class="loading">Loading anime...</div>
`;
  }

  let url = `${BASE_URL}/anime?page=${state.page}`;

  if (state.query) {
    url += `&q=${state.query}`;
  }

  if (state.genre) {
    url += `&genres=${state.genre}`;
  }

  const data = await safeFetch(url);

  if (!data.data || data.data.length === 0) {
    if (!append) {
      grid.innerHTML = "<p>No results found 😢</p>";
    }
    state.loading = false;
    return;
  }

  renderAnime(data.data, append);

  state.loading = false;
}


// RENDER
function renderAnime(list, append) {
  const grid = document.getElementById("grid");
  if (!append) grid.innerHTML = "";

  list.forEach(anime => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" />
      <h3>${anime.title}</h3>
      <p>⭐ ${anime.score || "N/A"}</p>
      <button class="fav-btn">❤️</button>
    `;

    card.querySelector(".fav-btn")
      .addEventListener("click", () => toggleFavorite(anime));

    card.addEventListener("click", () => openModal(anime.mal_id));

    grid.appendChild(card);
  });
}

// MODAL
async function openModal(id) {
  const res = await fetch(`${BASE_URL}/anime/${id}`);
  const data = await res.json();

  const modal = document.getElementById("modal");

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${data.data.title}</h2>
      <p>${data.data.synopsis}</p>
      <button onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

// INIT
function init() {
  applyTheme();

  document.getElementById("themeBtn")
    ?.addEventListener("click", toggleTheme);

  if (document.getElementById("grid")) {
    fetchAnime();
  }
}

init();

// =========================
// 🚀 PAGE ROUTING
// =========================

function initHome() {
  loadHomeSections();
}

function initAnimePage() {
  loadGenres();
  setupSearch();
  setupScroll();
  fetchAnime();
}

// Detect page
function init() {
  applyTheme();

  document.getElementById("themeBtn")
    ?.addEventListener("click", toggleTheme);

  if (document.getElementById("trending")) {
    initHome();
  }

  if (document.getElementById("grid")) {
    initAnimePage();
  }
}

init();

// =========================
// 🏠 HOME PAGE DATA
// =========================

async function loadHomeSections() {
  const trending = document.getElementById("trending");
  const top = document.getElementById("top");

  const trendingData = await safeFetch(`${BASE_URL}/top/anime?filter=airing`);
  const topData = await safeFetch(`${BASE_URL}/top/anime`);

  renderSection(trendingData.data, trending);
  renderSection(topData.data, top);

  // Hero
  if (trendingData.data.length) {
    renderHero(trendingData.data[0]);
  }
}

function renderSection(list, container) {
  container.innerHTML = list.slice(0, 10).map(anime => `
    <div class="card" onclick="openModal(${anime.mal_id})">
      <img src="${anime.images.jpg.image_url}" />
      <h3>${anime.title}</h3>
    </div>
  `).join("");
}

// =========================
// 🔍 SEARCH SYSTEM
// =========================

function setupSearch() {
  const input = document.getElementById("search");
  if (!input) return;

  let timeout;

  input.addEventListener("input", (e) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      state.query = e.target.value.trim();
      state.page = 1;

      fetchAnime(false);
    }, 400); // debounce
  });
}

// =========================
// 🔄 INFINITE SCROLL
// =========================

function setupScroll() {
  const sentinel = document.getElementById("sentinel");
  if (!sentinel) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !state.loading) {
      state.page++;
      fetchAnime(true);
    }
  }, {
    rootMargin: "200px"
  });

  observer.observe(sentinel);
}