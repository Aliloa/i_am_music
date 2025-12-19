const menuContainer = document.getElementById("menu-container");

console.log("menu importé");
if (menuContainer) {
  fetch('../menu/menu.html')
    .then(res => res.text())
    .then(html => menuContainer.innerHTML = html)
    .catch(err => console.error("Erreur menu:", err));
}