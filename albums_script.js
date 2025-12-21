const DEEZER_API = 'https://corsproxy.io/?https://api.deezer.com';

const bangers = [
    6172485, //chief keef
    761201231, //theodora
    650763991, //childish gambino
    266744, //she wants revenge
    771126421, //anyme
    824343801, //casablanca
    354076007, //yeat
    382760377, //metro boomin
    639992611, //inox
    7989512, //5 seconds of summer
    14880317, //radiohead
    837961612, //time impala
    531298542, //kali uchis
    707116301, //saint levant
    662648981, //tyler the creator

];

window.onload = function ()  /* calls the API when page loads */ {
    getTopAlbums();
};

function getBangers() {
    const albums = [];

    bangers.forEach(id => {
        fetch(`${DEEZER_API}/album/${id}`)/* fetches data from the API */
            .then(response => response.json())
            .then(album => {
                albums.push(album);
                displayAlbums(albums);
            })
            .catch(error => console.error(error));
    });
}

const filter_top = document.getElementById("filter-top");
const filter_banger = document.getElementById("filter-banger");

filter_top.addEventListener("click", () => {
    filter_top.classList.add("active");
    filter_banger.classList.remove("active");
    getTopAlbums();
});

filter_banger.addEventListener("click", () => {
    filter_banger.classList.add("active");
    filter_top.classList.remove("active");
    getBangers();
});


function getTopAlbums() /* fetches data from the API */ {
    const url = DEEZER_API + '/chart/0/albums?limit=15'; /* top 15 global albums */

    fetch(url)
        .then(response => response.json())  /* conversion of the response */
        .then(data => { displayAlbums(data.data) })
        .catch(error => { console.error("ERROR:", error) });
}

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

    /* Managing unavailable albums : */
    const nb_lacking_albums = 15 - albums.length;

    if (nb_lacking_albums > 0) {
        for (let i = 0; i < nb_lacking_albums; i++) /* displaying a place holder for each unavailable album */ {
            container.innerHTML += `
                <article class="album">
                    <figure>
                        <img src="assets/images/place_holder.png" alt="">

                        <figcaption>
                            <h2>Unavailable album</h2>
                        </figcaption>
                    </figure>
                </article>
            `;
        }
    }
}