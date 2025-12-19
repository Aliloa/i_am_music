const DEEZER_API = 'https://corsproxy.io/?https://api.deezer.com';

window.onload = function()  /* calls the API when page loads */
{
    get_top_albums();
};

function get_top_albums() /* fetches data from the API */
{   
    const url = DEEZER_API + '/chart/0/albums?limit=16'; /* top 16 global albums */
    
    fetch(url)
        .then(response => response.json())  /* conversion of the response */
        .then(data => {display_albums(data.data)})
        .catch(error => {console.error("ERROR:", error)});
}

function display_albums(albums) /* displays data obtained from the API by filling the HTML file */
{
    const container = document.getElementById('albums-section'); /* section containing the elements we want the API to fill */
    
    container.innerHTML = '';
    
    for(let i = 0; i < albums.length; i++) 
    {
        const album = albums[i];
        
        const albumHTML = `
            <article class="album">
                <figure>
                    <a href="songs/songs.html?id=${album.id}">
                        <img src="${album.cover_medium}" alt="${album.title} by ${album.artist.name}">
                    </a>

                    <figcaption>
                        <h2><a href="songs/songs.html?id=${album.id}">${album.title}</a></h2>
                        <h3><a href="api-deezer-artist/index.html?id=${album.artist.id}">${album.artist.name}</a></h3>
                    </figcaption>
                </figure>
            </article>
        `;
        
        container.innerHTML += albumHTML;
    }
}