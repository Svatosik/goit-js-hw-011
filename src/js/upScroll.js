const upScrollLink = document.querySelector('.scroll-up');
window.addEventListener('scroll', function () {
  if (window.scrollY > 100) {
    upScrollLink.style.display = 'flex';
  } else {
    upScrollLink.style.display = 'none';
  }
});