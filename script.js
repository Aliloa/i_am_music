//API CALL
console.log("ta gramnd mere");
fetch("https://api.deezer.com/track/563")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    console.log(data.data);
  })
  .catch(error => {
    console.error("Erreur :", error);
  });
