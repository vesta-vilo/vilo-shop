class PolaroidGallery extends HTMLElement {
  #abortController;

  connectedCallback() {
    const gallery = this.querySelector('.polaroid-gallery');
    const template = this.querySelector('.js-polaroid-card-template');
    const dataNode = this.querySelector('.js-polaroid-gallery-data');

    if (!gallery || !template || !dataNode) {
      return;
    }

    try {
      const config = JSON.parse(dataNode.textContent);
      this.#render(gallery, template, config);
      this.#bindClicks(gallery);
    } catch (error) {
      console.error('Failed to parse polaroid gallery data:', error);
    }
  }

  disconnectedCallback() {
    this.#abortController?.abort();
  }

  #render(gallery, template, config) {
    const { cards = [], defaultActiveIndex = 0 } = config;
    const fragment = document.createDocumentFragment();

    cards.forEach((card, index) => {
      const isActive = index === defaultActiveIndex;
      fragment.append(this.#createCard(template, card, index, isActive));
    });

    gallery.replaceChildren(fragment);
  }

  #createCard(template, card, index, isActive) {
    const cardIndex = index + 1;
    const node = template.content.firstElementChild.cloneNode(true);

    node.classList.add(`polaroid-card--${cardIndex}`);

    if (isActive) {
      node.classList.add('is-active');
    }

    node.setAttribute('aria-pressed', String(isActive));
    node.setAttribute('aria-label', `View polaroid ${cardIndex}`);

    const image = node.querySelector('img');
    image.src = card.src;
    image.alt = card.alt ?? '';

    return node;
  }

  #bindClicks(gallery) {
    this.#abortController = new AbortController();
    const { signal } = this.#abortController;

    gallery.addEventListener('click', (event) => this.#onClick(event, gallery), { signal });
  }

  #onClick(event, gallery) {
    const card = event.target.closest('.polaroid-card');

    if (!card || card.classList.contains('is-active')) {
      return;
    }

    gallery.querySelectorAll('.polaroid-card').forEach((item) => {
      item.classList.remove('is-active');
      item.setAttribute('aria-pressed', 'false');
    });

    card.classList.add('is-active');
    card.setAttribute('aria-pressed', 'true');
  }
}

customElements.define('polaroid-gallery', PolaroidGallery);
