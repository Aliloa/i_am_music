const DEEZER_API = 'https://corsproxy.io/?https://api.deezer.com';

const bangers = [
    175538702,
    6172485,
    761201231,
    650763991,
    801417931,
    662648981,
    531298542,
    10709540,

];

window.onload = function ()  /* calls the API when page loads */ {
    getTopAlbums();
};

function getAlbumById(id) {
    return fetch(`${DEEZER_API}/album/${id}`)
        .then(res => res.json());
}

function getMyAlbums() {
    Promise.all(bangers.map(id => getAlbumById(id)))
        .then(albums => {
            displayAlbums(albums);
        })
        .catch(err => console.error(err));
}

function getTopAlbums() /* fetches data from the API */ {
    const url = DEEZER_API + '/chart/0/albums?limit=16'; /* top 16 global albums */

    fetch(url)
        .then(response => response.json())  /* conversion of the response */
        .then(data => { displayAlbums(data.data) })
        .catch(error => { console.error("ERROR:", error) });
}

document.getElementById("filter-top").addEventListener("click", () => {
    getTopAlbums();
});

document.getElementById("filter-my").addEventListener("click", () => {
    getMyAlbums();
});

function displayAlbums(albums) /* displays data obtained from the API by filling the HTML file */ {
    const container = document.getElementById('albums-section'); /* section containing the elements we want the API to fill */

    container.innerHTML = '';

    for (let i = 0; i < albums.length; i++) {
        const album = albums[i];

        const albumHTML = `
            <article class="album">
                <figure>
                    <a href="songs/songs.html?id=${album.id}">
                        <img src="${album.cover_medium}" alt="${album.title} by ${album.artist.name}">
                    </a>

                    <figcaption>
                        <h2><a href="songs/songs.html?id=${album.id}">${album.title}</a></h2>
                        <h3><a href="artists/artists.html?id=${album.artist.id}">${album.artist.name}</a></h3>
                    </figcaption>
                </figure>
            </article>
        `;

        container.innerHTML += albumHTML;
    }
}