const DEEZER_API = 'https://corsproxy.io/?https://api.deezer.com';

window.onload = function() 
{
    console.log("Page loaded! Let's fetch albums...");
    
    // Appelle l'API
    getTopAlbums();
};

function getTopAlbums() 
{
    console.log("Fetching albums from API...");
    
    const url = DEEZER_API + '/chart/0/albums?limit=15';
    
    // Appel HTTP (le "cin >>" de l'API)
    fetch(url)
        .then(response => response.json())  // Convertit la réponse
        .then(data => {
            console.log("API response received!");
            console.log(data);  // Affiche tout dans la console
            
            // Passe les données à la fonction d'affichage
            displayAlbums(data.data);
        })
        .catch(error => {
            console.error("ERROR:", error);
        });
}

function displayAlbums(albums) 
{
    console.log("Displaying " + albums.length + " albums");
    
    // 1. Récupère le conteneur (comme un pointeur vers ton HTML)
    const container = document.getElementById('albums-section');
    
    // 2. Nettoie le conteneur
    container.innerHTML = '';
    
    // 3. Pour chaque album (comme une boucle for en C++)
    for(let i = 0; i < albums.length; i++) 
    {
        const album = albums[i];
        
        // 4. Crée l'HTML pour cet album
        const albumHTML = `
            <article class="album">
                <figure>
                    <img src="${album.cover_medium}" 
                         alt="${album.title} by ${album.artist.name}">
                    <figcaption>
                        <h2><a href="songs.html?id=${album.id}">${album.title}</a></h2>
                        <h3><a href="api-deezer-artist/index.html?id=${album.artist.id}">${album.artist.name}</a></h3>
                    </figcaption>
                </figure>
            </article>
        `;
        
        // 5. Ajoute au conteneur
        container.innerHTML += albumHTML;
    }
}
