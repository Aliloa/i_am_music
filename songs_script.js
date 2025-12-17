var album_number = 761201231;

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

  })
  .catch(error => {
    console.error("Erreur :", error);
  });
  
// à mettre dans le foreach pour tester si l'audio marche <audio controls src="${track.preview}"></audio>
//PLAY LOGIC

// let isPlaying = false;

// const globalAudio = document.getElementById("global-audio");

// document.querySelectorAll(".song").forEach(song => {
//   const playBtn = song.querySelector(".play-btn");

//   playBtn.addEventListener("click"), () => {
//     globalAudio.src = audioSrc;
//     globalAudio.play();
//     isPlaying = true;
//   }
// })