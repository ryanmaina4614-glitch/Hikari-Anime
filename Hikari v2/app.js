const API = "https://graphql.anilist.co";

/* ---------------- FETCH TRENDING ---------------- */
async function fetchTrending() {
  const query = `
  query {
    Page(page: 1, perPage: 18) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title { romaji }
        coverImage { large }
        description
      }
    }
  }`;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  return data.data.Page.media;
}

async function fetchTrending() {
  const query = `
  query {
    Page(page: 1, perPage: 10) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title { romaji }
        coverImage { large }
        description
      }
    }
  }`;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });

  const data = await res.json();
  return data.data.Page.media;
}

/* ---------------- RENDER HOME ---------------- */
async function renderHome() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  let anime = await fetchTrending();

  const search = document.getElementById("search");

  function display(list) {
    grid.innerHTML = "";
    list.forEach(a => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <img src="${a.coverImage.large}" />
        <div class="overlay">
          <h4>${a.title.romaji}</h4>
          <button onclick='addFav(${JSON.stringify(a).replace(/"/g,"&quot;")})'>❤️ Fav</button>
          <button onclick="openDetails(${a.id})">View</button>
        </div>
      `;

      grid.appendChild(div);
    });
  }

  display(anime);

  if (search) {
    search.addEventListener("input", (e) => {
      const filtered = anime.filter(a =>
        a.title.romaji.toLowerCase().includes(e.target.value.toLowerCase())
      );
      display(filtered);
    });
  }
}

let heroData = [];
let heroIndex = 0;

function renderHero(anime) {
  const hero = document.getElementById("hero");

  hero.style.backgroundImage = `url(${anime.coverImage.large})`;

  hero.innerHTML = `
    <div class="hero-content">
      <h2>${anime.title.romaji}</h2>
      <p>${(anime.description || "")
        .replace(/<[^>]*>/g, "")
        .slice(0, 150)}...</p>

      <button onclick="openDetails(${anime.id})">
        ▶ Watch Now
      </button>
    </div>
  `;
}

async function renderHome() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const anime = await fetchTrending();

  // 🎬 start hero slider
  startHeroSlider(anime);

  grid.innerHTML = "";

  anime.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${a.coverImage.large}" />
      <div class="overlay">
        <h4>${a.title.romaji}</h4>
        <button onclick="openDetails(${a.id})">View</button>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ---------------- HERO SLIDER ---------------- */
function startHeroSlider(data) {
  heroData = data.slice(0, 5); // top 5 anime

  renderHero(heroData[0]);

  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroData.length;
    renderHero(heroData[heroIndex]);
  }, 4000); // changes every 4 seconds
}

/* ---------------- DETAILS PAGE ---------------- */
async function renderDetails() {
  const container = document.getElementById("details");
  if (!container) return;

  const id = new URLSearchParams(window.location.search).get("id");

  const query = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      title { romaji }
      coverImage { large }
      description
      genres
    }
  }`;

  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: Number(id) } })
  });

  const data = await res.json();
  const a = data.data.Media;

  container.innerHTML = `
    <h2>${a.title.romaji}</h2>
    <img src="${a.coverImage.large}" />
    <p>${a.description?.replace(/<[^>]*>/g,'')}</p>
    <button onclick='addFav(${JSON.stringify(a).replace(/"/g,"&quot;")})'>❤️ Add to Favorites</button>
  `;
}

/* ---------------- FAVORITES ---------------- */
function getFavs() {
  return JSON.parse(localStorage.getItem("favs") || "[]");
}

function addFav(anime) {
  let favs = getFavs();
  if (!favs.find(f => f.id === anime.id)) {
    favs.push(anime);
    localStorage.setItem("favs", JSON.stringify(favs));
    alert("Added to favorites!");
  }
}

function renderFavs() {
  const grid = document.getElementById("favGrid");
  if (!grid) return;

  const favs = getFavs();
  grid.innerHTML = "";

  favs.forEach(a => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${a.coverImage.large}" />
      <div class="overlay">
        <h4>${a.title.romaji}</h4>
      </div>
    `;

    grid.appendChild(div);
  });
}

/* ---------------- NAV ---------------- */
function openDetails(id) {
  window.location.href = `details.html?id=${id}`;
}

/* ---------------- INIT ---------------- */
renderHome();
renderDetails();
renderFavs();
