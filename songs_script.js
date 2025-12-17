var album_number = 761201231;

//player
const globalAudio = document.getElementById("global-audio");
const globalTitle = document.getElementById("global-title");
const globalArtist = document.getElementById("global-artist");

//API CALL
console.log("ta gramnd mere");
fetch("https://corsproxy.io/?https://api.deezer.com/album/" + album_number)
  .then(response => response.json())
  .then(data => {
    console.log(data);

    //get title
    document.getElementById("album-title").textContent = data.title;
    document.getElementById("album-cover").src = data.cover_xl;

    //get tracks
    const tracks = data.tracks.data;

    const songs = document.getElementById("album-songs");

    tracks.forEach((track, index) => {
      songs.innerHTML += `
                    <div class="song">
                    <div class="flex">
                        <p class="track-number">${index + 1}.</p>
                        <button class="play-btn">▶</button>
                        <div class="song-info">
                            <p class="title">${track.title}</p>
                            <p class="artist">${data.artist.name}</p>
                        </div>
                    </div>
                    <span class="time">${track.duration}</span>
                </div>
  `;
    });
    //PLAY LOGIC

    document.querySelectorAll(".song").forEach((song, index) => {
      const playBtn = song.querySelector(".play-btn");

      playBtn.addEventListener("click", () => {
        playTrackFresh(index);
        // const track = tracks[index];
        // playTrack(track);
      });
    });

    function playTrack(track) {
      globalAudio.src = track.preview; // URL de preview Deezer
      globalTitle.textContent = track.title;
      globalArtist.textContent = track.artist.name;
      globalAudio.play();
    }

  })
  .catch(error => {
    console.error("Erreur :", error);
  });

// à mettre dans le foreach pour tester si l'audio marche <audio controls src="${track.preview}"></audio>

//IMPORTANT GENERER LE LIEN AU MOMENT DU CLIQUE SUR LE BTN PLAY ET NN AU CHARGEMENT DE LA PAGE!!!
//POUR EVITER LES PROBLEMES D'EXPIRATION

let isLoading = false; //avoid spam

function playTrackFresh(index) {
  if (isLoading) return;//avoid spam
  isLoading = true;

  fetch("https://corsproxy.io/?https://api.deezer.com/album/" + album_number)
    .then(res => res.json())
    .then(data => {
      const track = data.tracks.data[index];
console.log(globalAudio.src);

      globalAudio.src = track.preview; // URL fraîche
      globalTitle.textContent = track.title;
      globalArtist.textContent = track.artist.name;

      globalAudio.play();
    })
    .finally(() => isLoading = false);
}