const BASE_URL = "https://api.jikan.moe/v4";

let currentPage = 1;
let currentQuery = "";

let heroList = [];
let heroIndex = 0;
let heroInterval;

let learningMode = localStorage.getItem("learningMode") === "true";

// Page detection
const isHome = document.getElementById("grid");
const isDetails = document.getElementById("details");
const isFavorites = document.getElementById("favGrid");

function escapeHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// =========================
// 🇯🇵 LEARNING MODE
// =========================
function toggleLearningMode() {
  learningMode = !learningMode;
  localStorage.setItem("learningMode", learningMode);
  location.reload();
}

// =========================
// 🏠 HOME PAGE
// =========================
if (isHome) {
  const grid = document.getElementById("grid");
  const searchInput = document.getElementById("search");

  const pagination = document.createElement("div");
  pagination.classList.add("pagination");
  document.body.appendChild(pagination);

  fetchAnime();

  searchInput.addEventListener("input", () => {
    currentQuery = searchInput.value.trim();
    currentPage = 1;
    fetchAnime();
  });

  async function fetchAnime() {
    try {
      showLoading();

      let url = currentQuery
        ? `${BASE_URL}/anime?q=${encodeURIComponent(currentQuery)}&page=${currentPage}`
        : `${BASE_URL}/top/anime?page=${currentPage}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();
      const animeList = Array.isArray(data.data) ? data.data : [];

      displayAnime(animeList);

      heroList = animeList.slice(0, 5);
      startHeroSlider();

      setupPagination(data.pagination);
    } catch (error) {
      grid.innerHTML = `<h2 class="loading">Could not load anime. Please try again.</h2>`;
      pagination.innerHTML = "";
      const hero = document.getElementById("hero");
      if (hero) {
        hero.style.backgroundImage = "none";
        hero.innerHTML = `<div class="hero-content"><h2>Failed to load highlights</h2></div>`;
      }
      console.error(error);
    }
  }

  function showLoading() {
    grid.innerHTML = `<h2 class="loading">Loading anime... ⏳</h2>`;
  }

  function displayAnime(list) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    grid.innerHTML = "";

    list.forEach(anime => {
      const isFav = favorites.includes(anime.mal_id);

      const title = learningMode
        ? `
          <h3>${anime.title_japanese || anime.title}</h3>
          <small>${anime.title}</small>
        `
        : `<h3>${anime.title}</h3>`;

      const trailer = anime.trailer?.embed_url;

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <div class="card-media">
          <img src="${anime.images.jpg.image_url}" alt="${escapeHtml(anime.title)} cover image" />
          ${trailer ? `<iframe src="${trailer}" allowfullscreen></iframe>` : ""}
        </div>

        ${title}
        <p>⭐ ${anime.score || "N/A"}</p>
        <p>${anime.genres.map(g => g.name).join(", ")}</p>

        <button onclick="viewDetails(${anime.mal_id})">Details</button>
        <button class="fav-btn" onclick="toggleFavorite(${anime.mal_id})">
          ${isFav ? "❤️" : "🤍"}
        </button>
      `;

      grid.appendChild(card);
    });
  }

  function setupPagination(paginationData) {
    if (!paginationData) {
      pagination.innerHTML = "";
      return;
    }

    pagination.innerHTML = `
      <button ${!paginationData.has_previous_page ? "disabled" : ""}
        onclick="changePage(-1)">⬅ Prev</button>

      <span>Page ${currentPage}</span>

      <button ${!paginationData.has_next_page ? "disabled" : ""}
        onclick="changePage(1)">Next ➡</button>
    `;
  }

  window.changePage = function (direction) {
    currentPage += direction;
    fetchAnime();
  };

  // 🎬 HERO SLIDER
  function startHeroSlider() {
    if (heroInterval) clearInterval(heroInterval);
    if (!heroList.length) {
      const hero = document.getElementById("hero");
      if (hero) {
        hero.style.backgroundImage = "none";
        hero.innerHTML = `<div class="hero-content"><h2>No anime found</h2></div>`;
      }
      return;
    }

    heroIndex = 0;
    showHero(heroList[0]);

    heroInterval = setInterval(() => {
      heroIndex = (heroIndex + 1) % heroList.length;
      showHero(heroList[heroIndex]);
    }, 4000);
  }

  function showHero(anime) {
    if (!anime) return;
    const hero = document.getElementById("hero");

    hero.style.backgroundImage = `url(${anime.images.jpg.large_image_url})`;

    hero.innerHTML = `
      <div class="hero-content fade">
        <h2>${anime.title}</h2>
        <h3>${anime.title_japanese || ""}</h3>
        <p>⭐ ${anime.score || "N/A"}</p>
        <button onclick="viewDetails(${anime.mal_id})">▶ Watch Info</button>
      </div>
    `;
  }
}

// =========================
// 📄 DETAILS PAGE
// =========================
if (isDetails) {
  const details = document.getElementById("details");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    details.innerHTML = "<h2 class='loading'>No anime selected.</h2>";
  } else {
    fetchDetails(id);
  }

  async function fetchDetails(id) {
    try {
      details.innerHTML = "<h2 class='loading'>Loading... ⏳</h2>";

      const res = await fetch(`${BASE_URL}/anime/${id}`);
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();
      const anime = data.data;

      const titleBlock = learningMode
        ? `
        <h2>${anime.title_japanese || anime.title}</h2>
        <h3>${anime.title}</h3>
      `
        : `<h2>${anime.title}</h2>`;

      details.innerHTML = `
      ${titleBlock}
      <img src="${anime.images.jpg.large_image_url}" alt="${escapeHtml(anime.title)} cover image" />

      <p><strong>⭐ Score:</strong> ${anime.score || "N/A"}</p>
      <p><strong>Genres:</strong> ${anime.genres.map(g => g.name).join(", ")}</p>

      <p>${anime.synopsis || "No synopsis available."}</p>

      ${
        anime.trailer?.embed_url
          ? `<iframe width="100%" height="300" src="${anime.trailer.embed_url}" allowfullscreen></iframe>`
          : "<p>No trailer available</p>"
      }

      <button onclick="toggleFavorite(${anime.mal_id})">❤️ Toggle Favorite</button>
    `;
    } catch (error) {
      details.innerHTML = "<h2 class='loading'>Could not load anime details.</h2>";
      console.error(error);
    }
  }
}

// =========================
// ⭐ FAVORITES PAGE
// =========================
if (isFavorites) {
  const favGrid = document.getElementById("favGrid");

  loadFavorites();

  async function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.length === 0) {
      favGrid.innerHTML = "<h2>No favorites yet 😢</h2>";
      return;
    }

    let html = "";

    for (let id of favorites) {
      const res = await fetch(`${BASE_URL}/anime/${id}`);
      if (!res.ok) continue;
      const data = await res.json();
      const anime = data.data;

      html += `
        <div class="card">
          <img src="${anime.images.jpg.image_url}" alt="${escapeHtml(anime.title)} cover image" />
          <h3>${anime.title}</h3>
          <button onclick="viewDetails(${anime.mal_id})">Details</button>
          <button onclick="toggleFavorite(${anime.mal_id})">❌ Remove</button>
        </div>
      `;
    }

    favGrid.innerHTML = html;
  }
}

// =========================
// ⭐ FAVORITES
// =========================
function toggleFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  location.reload();
}

// =========================
// 🔗 NAVIGATION
// =========================
function viewDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

// =========================
// 📚 MANGA PAGE
// =========================
const isManga = document.getElementById("mangaGrid");
const isMangaDetails = document.getElementById("mangaDetails");

if (isManga) {
  const grid = document.getElementById("mangaGrid");
  const searchInput = document.getElementById("searchManga");

  let page = 1;
  let query = "";

  fetchManga();

  searchInput.addEventListener("input", () => {
    query = searchInput.value.trim();
    page = 1;
    fetchManga();
  });

  async function fetchManga() {
    try {
      grid.innerHTML = "<h2 class='loading'>Loading manga... ⏳</h2>";

      let url = query
        ? `${BASE_URL}/manga?q=${encodeURIComponent(query)}&page=${page}`
        : `${BASE_URL}/top/manga?page=${page}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();
      const mangaList = Array.isArray(data.data) ? data.data : [];
      displayManga(mangaList);
    } catch (error) {
      grid.innerHTML = "<h2 class='loading'>Could not load manga. Please try again.</h2>";
      console.error(error);
    }
  }

  function displayManga(list) {
    grid.innerHTML = "";

    list.forEach(manga => {
      const title = learningMode
        ? `
          <h3>${manga.title_japanese || manga.title}</h3>
          <small>${manga.title}</small>
        `
        : `<h3>${manga.title}</h3>`;

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${manga.images.jpg.image_url}" alt="${escapeHtml(manga.title)} cover image" />
        ${title}
        <p>⭐ ${manga.score || "N/A"}</p>
        <button onclick="viewMangaDetails(${manga.mal_id})">Details</button>
      `;

      grid.appendChild(card);
    });
  }
}

// =========================
// 📄 MANGA DETAILS
// =========================
if (isMangaDetails) {
  const container = document.getElementById("mangaDetails");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    container.innerHTML = "<h2 class='loading'>No manga selected.</h2>";
  } else {
    fetchMangaDetails(id);
  }

  async function fetchMangaDetails(id) {
    try {
      container.innerHTML = "<h2 class='loading'>Loading... ⏳</h2>";

      const res = await fetch(`${BASE_URL}/manga/${id}`);
      if (!res.ok) throw new Error(`API request failed: ${res.status}`);

      const data = await res.json();
      const manga = data.data;

      const titleBlock = learningMode
        ? `
        <h2>${manga.title_japanese || manga.title}</h2>
        <h3>${manga.title}</h3>
      `
        : `<h2>${manga.title}</h2>`;

      container.innerHTML = `
      ${titleBlock}
      <img src="${manga.images.jpg.large_image_url}" alt="${escapeHtml(manga.title)} cover image" />

      <p><strong>⭐ Score:</strong> ${manga.score || "N/A"}</p>
      <p><strong>Chapters:</strong> ${manga.chapters || "Unknown"}</p>
      <p><strong>Status:</strong> ${manga.status || "Unknown"}</p>

      <p>${manga.synopsis || "No synopsis available."}</p>

      <a href="${manga.url}" target="_blank" rel="noopener noreferrer">
        <button>📖 Read on MyAnimeList</button>
      </a>
    `;
    } catch (error) {
      container.innerHTML = "<h2 class='loading'>Could not load manga details.</h2>";
      console.error(error);
    }
  }
}

// =========================
// 🔗 NAVIGATION (MANGA)
// =========================
function viewMangaDetails(id) {
  window.location.href = `manga-details.html?id=${id}`;
}

