const gallery = document.querySelector('.polaroid-gallery');

if (gallery) {
  const cards = gallery.querySelectorAll('.polaroid-card');

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('is-active')) {
        return;
      }

      cards.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });

      card.classList.add('is-active');
      card.setAttribute('aria-pressed', 'true');
    });
  });
}
