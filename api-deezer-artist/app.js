const API = "https://api.deezer.com";

function getJSONP(path) {
  return new Promise((resolve, reject) => {
    const cb = "dz_cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");

    const sep = path.includes("?") ? "&" : "?";
    const url = `${API}${path}${sep}output=jsonp&callback=${cb}`;

    let timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout JSONP"));
    }, 8000);

    function cleanup() {
      clearTimeout(timeout);
      try { delete window[cb]; } catch {}
      script.remove();
    }

    window[cb] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Error loading JSONP"));
    };

    script.src = url;
    document.body.appendChild(script);
  });
}

function fmt(n) {
  try { return new Intl.NumberFormat("en-US").format(n); }
  catch { return String(n); }
}

function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function generateMiniBioEN(artist, topTracks) {
  const name = artist?.name || "This artist";
  const fans = artist?.nb_fan ? fmt(artist.nb_fan) : null;
  const albums = artist?.nb_album ? fmt(artist.nb_album) : null;

  const top = (topTracks || [])
    .slice(0, 4)
    .map(t => t?.title)
    .filter(Boolean);

  const parts = [];

  if (fans) parts.push(`${name} has built a strong audience with over ${fans} fans on Deezer.`);
  else parts.push(`${name} has built a strong audience on Deezer.`);

  if (albums) parts.push(`Their catalog includes ${albums} albums available to explore on the platform.`);


  if (top.length === 1) {
    parts.push(`One of their standout tracks is "${top[0]}".`);
  } else if (top.length > 1) {
    const last = top[top.length - 1];
    const rest = top.slice(0, -1).map(t => `"${t}"`).join(", ");
    parts.push(`Known for tracks like ${rest} and "${last}".`);
  } else {
    parts.push(`Their top tracks are currently trending on Deezer.`);
  }

  return parts.join(" ");
}


function setHeroBg(url) {
  const hero = document.getElementById("hero");
  if (!hero) return;
  hero.style.backgroundImage = url ? `url("${url}")` : "";
}

function renderTracks(tracks) {
  const grid = document.getElementById("tracksGrid");
  if (!grid) return;

  if (!tracks || !tracks.length) {
    grid.innerHTML = `<p class="muted">There are no top tracks.</p>`;
    return;
  }

  grid.innerHTML = tracks.map((t, i) => {
    const cover =
      t?.album?.cover_big ||
      t?.album?.cover_medium ||
      t?.album?.cover_small ||
      "";

    const title = t?.title || "Track";
    const link = t?.link || "#";

    return `
      <a class="trackCard" href="${link}" target="_blank" rel="noreferrer">
        <img class="trackCover" src="${cover}" alt="">
        <p class="trackLabel">${i + 1}. ${title}</p>
      </a>
    `;
  }).join("");
}

async function initArtistPage() {
  const hero = document.getElementById("hero");
  const artistNameEl = document.getElementById("artistName");
  const artistFansEl = document.getElementById("artistFans");
  const bioEl = document.getElementById("artistBio");
  const tracksGrid = document.getElementById("tracksGrid");

  if (!hero || !artistNameEl || !artistFansEl || !bioEl || !tracksGrid) return false;

  const id = qs("id") || "27"; 

  artistNameEl.textContent = "Loading...";
  artistFansEl.textContent = "";
  setHeroBg("");
  bioEl.textContent = "";
  renderTracks([]);

  try {
    const [artist, top] = await Promise.all([
      getJSONP(`/artist/${id}`),
      getJSONP(`/artist/${id}/top?limit=6`)
    ]);

    const heroImg = artist?.picture_xl || artist?.picture_big || artist?.picture_medium;
    setHeroBg(heroImg);

    artistNameEl.textContent = artist?.name || "Artista";
    artistFansEl.textContent = artist?.nb_fan ? `${fmt(artist.nb_fan)} fans` : "";

    const tracks = top?.data || [];
    bioEl.textContent = generateMiniBioEN(artist, tracks);

    renderTracks(tracks);

  } catch (err) {
    artistNameEl.textContent = "Error loading artist";
    bioEl.textContent = "No data from Deezer.";
    console.error(err);
  }

  return true;
}

(async function boot() {
  const isSearch = await initSearchPage();
  if (isSearch) return;
  await initArtistPage();
})();


// search

async function initSearchPage() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const status = document.getElementById("searchStatus");
  const results = document.getElementById("searchResults");

  if (!form || !input || !results) return false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();

    if (q.length < 2) {
      status.textContent = "Escribí al menos 2 letras 🙏";
      results.innerHTML = "";
      return;
    }

    status.textContent = "Buscando…";
    results.innerHTML = "";

    try {
      const data = await getJSONP(`/search/artist?q=${encodeURIComponent(q)}&limit=10`);
      const list = data?.data || [];

      if (!list.length) {
        status.textContent = "No encontré nada. Probá otro nombre.";
        return;
      }

      status.textContent = "";

      results.innerHTML = list.map(a => `
        <a class="artistResult" href="./index.html?id=${a.id}">
          <img src="${a.picture_medium || ""}" alt="">
          <div>
            <div class="name">${a.name}</div>
            <div class="fans">${a.nb_fan ? fmt(a.nb_fan) + " fans" : ""}</div>
          </div>
        </a>
      `).join("");

    } catch (err) {
      status.textContent = "Error buscando. Probá de nuevo.";
      console.error(err);
    }
  });

  return true;
}
