// var album_number = 843363632;
const urlParams = new URLSearchParams(window.location.search);
const album_number = urlParams.get('id'); // récupère la valeur de "id"

console.log(album_number);
const timestamp = Date.now(); //bypass the cache so it stops using the expired url for the tracks preview

//convertir les seoncdes en minutes
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

//API CALL
fetch(`https://corsproxy.io/?https://api.deezer.com/album/${album_number}?_=${timestamp}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    //title info
    document.getElementById("album-title").textContent = data.title;
    document.getElementById("album-cover").src = data.cover_xl;
    document.querySelector(".image").style.backgroundImage = `url(${data.cover_xl})`;
    document.getElementById("album-artist").textContent = data.artist.name;
    document.getElementById("album-artist-id").href = "api-deezer-artist/index.html?id=" + data.artist.id;

    //tracks info
    const tracks = data.tracks.data;

    const songs = document.getElementById("album-songs");

    tracks.forEach((track, index) => {
      songs.innerHTML += `
                    <div class="song box">
                    <div class="flex">
                        <p class="track-number">${index + 1}.</p>
                        <button class="play-btn">▶</button>
                        <div class="song-info">
                            <p class="title">${track.title}</p>
                            <p class="artist">${data.artist.name}</p>
                        </div>
                    </div>
                    <span class="time">${formatDuration(track.duration)}</span>
                </div>
  `;
    });

    //PLAY LOGIC

    const globalAudio = document.getElementById("global-audio");
    const globalTitle = document.getElementById("global-title");
    const globalArtist = document.getElementById("global-artist");
    const globalCover = document.getElementById("global-cover");
    const globalPlayer = document.querySelector(".global-player");

    document.querySelectorAll(".song").forEach((song, index) => {

      song.addEventListener("click", () => { //on play
        const track = tracks[index];
        playTrack(track);
        song.classList.add("active");

        document.querySelectorAll(".song").forEach(s => {
          if (s !== song) s.classList.remove("active");
        });
      });
    });

    function playTrack(track) {
      globalPlayer.style.display = "flex";

      globalAudio.src = track.preview;
      globalTitle.textContent = track.title;
      globalArtist.textContent = track.artist.name;
      globalCover.src = track.album.cover;

      globalAudio.play();
    }

  })
  .catch(error => {
    console.error("Erreur :", error);
  });