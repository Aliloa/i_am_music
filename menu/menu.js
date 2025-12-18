const menuContainer = document.getElementById("menu-container");

if (menuContainer) {
  fetch('menu/menu.html')
    .then(res => res.text())
    .then(html => menuContainer.innerHTML = html)
    .catch(err => console.error("Erreur menu:", err));
}