const API = "https://api.deezer.com";

let CURRENT_TRACKS = [];

function getJSONP(path) {
  return new Promise((resolve, reject) => {
    const cb = "dz_cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");

    const sep = path.includes("?") ? "&" : "?";
    const url = `${API}${path}${sep}output=jsonp&callback=${cb}`;

    const timeout = setTimeout(() => {
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

function generateMiniBioEN(artist, top_tracks) {
  const name = artist?.name || "This artist";
  const fans = artist?.nb_fan ? fmt(artist.nb_fan) : null;
  const albums = artist?.nb_album ? fmt(artist.nb_album) : null;

  const top = (top_tracks || [])
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

  parts.push(`Press play and start from the top tracks below.`);

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
    grid.innerHTML = `<p class="muted">No hay top tracks.</p>`;
    return;
  }

  const is_desktop = window.matchMedia("(min-width: 900px)").matches;
  const limit = is_desktop ? 3 : 6;

  grid.innerHTML = tracks.slice(0, limit).map((t, i) => {
    const cover =
      t?.album?.cover_big ||
      t?.album?.cover_medium ||
      t?.album?.cover_small ||
      "";

    const title = t?.title || "Track";
    const link = t?.link || "#";

    return `
      <a class="track-card" href="${link}" target="_blank" rel="noreferrer">
        <img class="track-cover" src="${cover}" alt="">
        <p class="track-label">${i + 1}. ${title}</p>
      </a>
    `;
  }).join("");
}

async function setupListenNow(artist_id) {
  const listen_el = document.getElementById("listenNow");
  if (!listen_el) return;

  listen_el.href = "#";
  listen_el.style.pointerEvents = "none";
  listen_el.style.opacity = "0.6";

  try {
    const albums_res = await getJSONP(`/artist/${artist_id}/albums?limit=1`);
    const album_id = albums_res?.data?.[0]?.id;

    if (album_id) {
      listen_el.href = `../songs.html?id=${album_id}`;
      listen_el.style.pointerEvents = "auto";
      listen_el.style.opacity = "1";
    } else {
      console.warn("Listen now: artista sin álbum (o data vacía).", { artistId: artist_id, albumsRes: albums_res });
    }
  } catch (e) {
    console.warn("Listen now: falló cargar álbum (pero el resto OK).", e);
  }
}

async function initArtistPage() {
  const hero = document.getElementById("hero");
  const artist_name_el = document.getElementById("artistName");
  const artist_fans_el = document.getElementById("artistFans");
  const bio_el = document.getElementById("artistBio");
  const tracks_grid_el = document.getElementById("tracksGrid");

  if (!hero || !artist_name_el || !artist_fans_el || !bio_el || !tracks_grid_el) return false;

  const id = qs("id") || "27";

  artist_name_el.textContent = "Loading...";
  artist_fans_el.textContent = "";
  bio_el.textContent = "";
  setHeroBg("");
  renderTracks([]);

  try {
    const [artist, top] = await Promise.all([
      getJSONP(`/artist/${id}`),
      getJSONP(`/artist/${id}/top?limit=6`)
    ]);

    const hero_img = artist?.picture_xl || artist?.picture_big || artist?.picture_medium;
    setHeroBg(hero_img);

    artist_name_el.textContent = artist?.name || "Artist";
    artist_fans_el.textContent = artist?.nb_fan ? `${fmt(artist.nb_fan)} fans` : "";

    const tracks = top?.data || [];
    CURRENT_TRACKS = tracks;
    bio_el.textContent = generateMiniBioEN(artist, tracks);
    renderTracks(tracks);

    await setupListenNow(id);

  } catch (err) {
    artist_name_el.textContent = "Error loading artist";
    bio_el.textContent = "No data from Deezer.";
    console.error(err);
  }

  return true;
}

window.addEventListener("resize", () => {
  if (CURRENT_TRACKS.length) renderTracks(CURRENT_TRACKS);
});

// search page
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
      status.textContent = "Write at least 2 characters.";
      results.innerHTML = "";
      return;
    }

    status.textContent = "Searching...";
    results.innerHTML = "";

    try {
      const data = await getJSONP(`/search/artist?q=${encodeURIComponent(q)}&limit=10`);
      const list = data?.data || [];

      if (!list.length) {
        status.textContent = "Nothing found. Try another name.";
        return;
      }

      status.textContent = "";

      results.innerHTML = list.map(a => `
        <a class="artist-result" href="./index.html?id=${a.id}">
          <img src="${a.picture_medium || ""}" alt="">
          <div>
            <div class="artist-result-name">${a.name}</div>
            <div class="artist-result-fans">${a.nb_fan ? fmt(a.nb_fan) + " fans" : ""}</div>
          </div>
        </a>
      `).join("");

    } catch (err) {
      status.textContent = "Error. Try again.";
      console.error(err);
    }
  });

  return true;
}

(async function boot() {
  const is_artist = await initArtistPage();
  if (is_artist) return;
  await initSearchPage();
})();
