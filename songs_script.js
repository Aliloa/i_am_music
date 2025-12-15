var album_number = 302127;

//API CALL
console.log("ta gramnd mere");
fetch("https://corsproxy.io/?https://api.deezer.com/album/" + album_number)
  .then(response => response.json())
  .then(data => {
    console.log(data);

      const albumTitle = data.title;
  document.getElementById("album-title").textContent = albumTitle;

  })
  .catch(error => {
    console.error("Erreur :", error);
  });