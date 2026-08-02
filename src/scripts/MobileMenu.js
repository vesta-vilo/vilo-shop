import { mobileMenuStyles } from './MobileMenu.styles.js';
class MobileMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" })
    this.shadowRoot.adoptedStyleSheets = [mobileMenuStyles];
    this.isOpen = false
    this.isSecondLevelMenuOpen = false
    this.activeSubMenuId = null;
  }

  connectedCallback() {
    this.render()
    this.cacheElements()

    const externalBtn = document.querySelector(".mobile-menu-btn")
    externalBtn?.addEventListener("click", () => this.toggleMenu())

    this.shadowRoot.addEventListener('click', (e) => {
      const target = e.target

      const childMenuTrigger = target.closest('[data-child-links-list-Id]')
      const isBackBtn = Boolean(target.closest('.drawer-header-btn')) && this.isSecondLevelMenuOpen
      const isCloseBtn = Boolean(target.closest('.close-btn'))
      const isOverlay = Boolean(target.closest('.overlay'))

      switch (true) {
        case !!childMenuTrigger:
          e.preventDefault()
          this.activeSubMenuId = childMenuTrigger.dataset.childLinksListId
          this.toggleSecondMenuOpen(true)
          this.updateStyles()
          break

        case isBackBtn:
          this.isSecondLevelMenuOpen = !this.isSecondLevelMenuOpen
          this.toggleSecondMenuOpen(this.isSecondLevelMenuOpen)
          this.updateStyles()
          break

        case isCloseBtn:
        case isOverlay:
          this.toggleMenu()
          break
      }

    })
  }

  disconnectedCallback() {
    const externalBtn = document.querySelector(".mobile-menu-btn");
    externalBtn?.removeEventListener("click", this._boundToggle);
  }

  cacheElements() {
    this._drawer = this.shadowRoot.querySelector(".drawer")
    this._overlay = this.shadowRoot.querySelector(".overlay")
    this._headerBtn = this.shadowRoot.querySelector(".drawer-header-btn")
    this._secondLevelMenus = this.shadowRoot.querySelector("slot[name='second-level-menus']")
    this._drawerContentHolder = this.shadowRoot.querySelector(".drawer-content")
    this._defaultSlot = this.shadowRoot.querySelector(".main-slot slot:not([name])")
    this._secondarySlot = this.shadowRoot.querySelector("slot[name='secondary']")
  }

  toggleBodyScroll() {
    document.body.style.overflow = this.isOpen ? "hidden" : ""
    document.body.style.paddingRight = this.isOpen ? "var(--scrollbar-width, 0px)" : ""
  }

  toggleMenu() {
    this.isOpen = !this.isOpen
    if (!this.isOpen) {
      this.toggleSecondMenuOpen(false)
    }
    this.updateStyles()
    this.toggleBodyScroll()
  }

  toggleSecondMenuOpen(state) {
    this.isSecondLevelMenuOpen = state
    if (!state) {
      this.activeSubMenuId = null
    }
    this._drawerContentHolder?.classList.toggle("second-level-menu-open", state)
  }

  updateStyles() {
    const isSubMenuOpen = !!this.activeSubMenuId;
    this._drawer.classList.toggle("open", this.isOpen)
    this._overlay.classList.toggle("active", this.isOpen)
    this._headerBtn.classList.toggle("is-back-state", this.isSecondLevelMenuOpen)

    const slottedWrapper = this._secondLevelMenus.assignedElements()[0]

    if (slottedWrapper) {
      const subMenus = slottedWrapper.querySelectorAll(".secondary-menu-item")

      subMenus.forEach((menu) => {
        const parentId = menu.dataset.parentLinkId
        const isMatch = parentId === this.activeSubMenuId
        menu.classList.toggle("is-active", isMatch)
      })
    }

    const allPrimaryElements = [
        ...this._defaultSlot.assignedElements(),
        ...this._secondarySlot.assignedElements()
    ];

    allPrimaryElements.forEach(el => {
        if (el.classList.contains("drawer-navigation-links") ||
            el.classList.contains("drawer-secondary-links")) {
            el.classList.toggle("is-hidden", isSubMenuOpen);
        }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
                <div class="overlay"></div>

                <div class="drawer">
                  <div class="drawer-content-wrapper">
                    <div class="drawer-header">
                      <div class="drawer-header-btn">
                        <div class="icon-back" aria-label="Back to main menu">
                          <img src="/images/icons/icon-caret-left.png" alt="" width="16" height="20" decoding="async">
                        </div>
                        <div class="icon-logo" >
                          <svg width="68px" height="22px" viewBox="0 0 68 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" >
                            <title>Vilo</title>
                            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                <g transform="translate(-120, -119)" fill="currentColor">
                                    <g transform="translate(80, 95)">
                                        <path d="M64.7897289,45.647692 L64.7897289,26.5938876 C64.7897289,25.280409 65.8545136,24.2156243 67.1679921,24.2156243 L68.6073903,24.2156243 L68.6073903,24.2156243 L68.6073903,43.2694288 C68.6073903,44.5829073 67.5426055,45.647692 66.229127,45.647692 L64.7897289,45.647692 L64.7897289,45.647692 Z M48.9679478,45.647692 L40,24.2156243 L42.5683517,24.2156243 C43.5471696,24.2156243 44.4260232,24.8153271 44.7829028,25.7267664 L50.6937385,40.8225202 L50.6937385,40.8225202 L56.5751707,25.730333 C56.9310901,24.8170176 57.810899,24.2156243 58.7911151,24.2156243 L61.2642061,24.2156243 L61.2642061,24.2156243 L52.9072753,44.1874519 C52.5371719,45.0719444 51.6721392,45.647692 50.713336,45.647692 L48.9679478,45.647692 L48.9679478,45.647692 Z M85.2637055,45.647692 L79.3936475,45.647692 C75.8573592,45.647692 72.9906311,42.780964 72.9906311,39.2446757 L72.9906311,24.2156243 L72.9906311,24.2156243 L74.7959159,24.2156243 C75.9073208,24.2156243 76.8082925,25.116596 76.8082925,26.2280009 L76.8082925,38.7006179 C76.8082925,40.7213541 78.4464228,42.3594844 80.467159,42.3594844 L85.2637055,42.3594844 L85.2637055,42.3594844 L85.2637055,45.647692 Z M95.9565376,24 C96.0677716,24 96.1694186,24.00398 96.2614786,24.0119399 C96.3624098,24.0172663 96.4375999,24.1053788 96.4296295,24.2061007 C96.427402,24.2342498 96.4186888,24.2615011 96.404172,24.2857209 C95.1806406,26.2707804 94.4456676,27.6247605 94.1986373,28.3472924 L94.1771421,28.4135756 C93.6384774,28.7392611 93.1370288,29.1553087 92.6727965,29.6617182 C91.3719637,31.0807364 90.7215473,32.8373831 90.7215473,34.9316582 C90.7215473,37.0259333 91.3719637,38.7825799 92.6727965,40.2015981 C93.9736293,41.6206163 95.5666781,42.3301254 97.451943,42.3301254 C99.3372079,42.3301254 100.930257,41.6206163 102.231089,40.2015981 C103.531922,38.7825799 104.182339,37.0259333 104.182339,34.9316582 C104.182339,32.8373831 103.531922,31.0807364 102.231089,29.6617182 C100.930257,28.2427001 99.3372079,27.533191 97.451943,27.533191 C96.990693,27.533191 96.5469347,27.5756613 96.1206682,27.660602 C96.7705951,26.5384299 98.7667982,25.1706274 99.1372199,24.9613765 C99.5076416,24.7521256 99.8553169,24.5398373 100.51124,24.4800949 C100.756538,24.4673448 101.026596,24.5053348 101.321413,24.594065 C102.640317,25.1345725 103.838715,25.9719906 104.917592,27.1074855 C106.972531,29.270265 108,31.8783225 108,34.9316582 C108,37.9849939 106.972531,40.5930514 104.917592,42.7558308 C102.862653,44.9186103 100.374104,46 97.451943,46 C94.5297824,46 92.0412328,44.9186103 89.986294,42.7558308 C87.9313553,40.5930514 86.9038859,37.9849939 86.9038859,34.9316582 C86.9038859,31.8783225 87.9313553,29.270265 89.986294,27.1074855 C91.5373922,25.4749876 93.3355382,24.4586064 95.3807321,24.0583421 C95.7050978,24.0168239 95.8819868,24 95.9565376,24 Z" fill-rule="nonzero"></path>
                                    </g>
                                </g>
                            </g>
                          </svg>
                        </div>
                      </div>
                      <button class="close-btn" type="button" aria-label="Close menu">
                        <img src="/images/icons/icon-menu-close.png" alt="" width="42" height="42" decoding="async">
                      </button>
                    </div>
                    <div class="container drawer-content">
                      <div class="main-slot">
                        <slot></slot>
                      </div>

                      <div class="secondary-slot">
                        <slot name="secondary"></slot>
                      </div>
                      <div class="secondary-menus-slot">
                        <slot name="second-level-menus"></slot>
                      <div>
                    </div>
                  </div>
                </div>
                `;
  }
}

customElements.define("mobile-menu", MobileMenu)
