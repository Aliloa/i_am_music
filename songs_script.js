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

const global_audio = document.getElementById("global-audio");
const global_title = document.getElementById("global-title");
const global_artist = document.getElementById("global-artist");
const global_cover = document.getElementById("global-cover");
const global_player = document.querySelector(".global-player");

//API CALL
fetch(`https://corsproxy.io/?https://api.deezer.com/album/${album_number}?_=${timestamp}`)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    //title info
    document.getElementById("album-title").textContent = data.title;
    document.getElementById("album-cover").src = data.cover_xl;
    document.querySelector(".cover-wrapper").style.backgroundImage = `url(${data.cover_xl})`;
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
      global_player.style.display = "flex";

      global_audio.src = track.preview;
      global_title.textContent = track.title;
      global_artist.textContent = track.artist.name;
      global_cover.src = track.album.cover;

      global_audio.play();
    }

  })
  .catch(error => {
    console.error("Erreur :", error);
  });

//----------------Animation

//audio = gloalAudio

global_audio.crossOrigin = "anonymous";// allow audio to be used by Web Audio API

const canvas = document.getElementById("visualizer");

canvas.width = 600;
canvas.height = 600;

const ctx = canvas.getContext("2d");

let audio_context;
let analyser;
let source;
let data_array;
let buffer_length;
let animation_id;

function setupAudio() {
  if (audio_context) return;

  audio_context = new AudioContext();
  source = audio_context.createMediaElementSource(global_audio);
  analyser = audio_context.createAnalyser();

  analyser.fftSize = 256;
  buffer_length = analyser.frequencyBinCount;
  data_array = new Uint8Array(buffer_length);

  source.connect(analyser);
  analyser.connect(audio_context.destination);
}

function resizeCanvas() { // set canvas width and height dynamically
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

function renderFrame() {
  animation_id = requestAnimationFrame(renderFrame);

  analyser.getByteFrequencyData(data_array);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.45 / 2; // circle radius
  const bars = buffer_length; // number of bars

  for (let i = 0; i < bars; i++) {
    const value = data_array[i];
    const angle = (i / bars) * Math.PI * 2 - 2.8;

    const bar_length = value * 0.8; // bar length proportional to frequency

    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;

    const x2 = cx + Math.cos(angle) * (radius + bar_length);
    const y2 = cy + Math.sin(angle) * (radius + bar_length);

    ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

//setup audio context and start visualizer
global_audio.addEventListener("play", () => {
  setupAudio();

  if (audio_context.state === "suspended") {
    audio_context.resume();
  }

  resizeCanvas();
  renderFrame();
});

//pause animation
global_audio.addEventListener("pause", () => {
  cancelAnimationFrame(animation_id);
});
