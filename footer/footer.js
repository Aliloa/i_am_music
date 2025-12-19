const footer_container = document.getElementById("footer-container");

if (footer_container) {
  fetch('footer/footer.html')
    .then(res => res.text())
    .then(html => footer_container.innerHTML = html)
    .catch(err => console.error("Erreur footer:", err));
}