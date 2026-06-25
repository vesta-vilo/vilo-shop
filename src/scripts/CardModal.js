class CardModal extends HTMLElement {
  constructor() {
    super()
    this.isDragging = false
    this.startY = 0
    this.currentY = 0
    this.isTouchingScrollable = false
    this.scrollableTouchTarget = null
    this.resizeTimer = null
    this._ticking = false

    this.DELAY_MS = 100
    this.CLOSE_TRANSITION_MS = 300
    this.CLOSE_TRANSITION = `transform ${this.CLOSE_TRANSITION_MS}ms cubic-bezier(0.2, 0, 0, 1)`
    this.PIXELS_SCROLLED_FOR_CLOSE = 200

    this._mediaQuery = globalThis.matchMedia('(max-width: 768px)')
    this._mobileState = this._mediaQuery.matches

    this._handleTouchStart = this._handleTouchStart.bind(this)
    this._handleTouchMove = this._handleTouchMove.bind(this)
    this._handleTouchEnd = this._handleTouchEnd.bind(this)
    this._onComponentClick = this._onComponentClick.bind(this)

    this._onBreakpointChange = (e) => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this._mobileState = e.matches;
        if (this.hasAttribute('open')) {
          this.modal.style.transition = 'none';
          this.modal.style.transform = this._mobileState ? 'translateY(0)' : 'translateX(0)';
        }
      }, this.DELAY_MS);
    };
  }

  connectedCallback() {
    this.overlay = this.shadowRoot.querySelector('.overlay')
    this.modal = this.shadowRoot.querySelector('.modal')
    this.slotEl = this.shadowRoot.querySelector('slot')

    this.shadowRoot.addEventListener('click', this._onComponentClick)

    this._mediaQuery.addEventListener('change', this._onBreakpointChange)

    this.modal.addEventListener('touchstart', this._handleTouchStart, { passive: true })

    globalThis.addEventListener('touchmove', this._handleTouchMove, { passive: false })
    globalThis.addEventListener('touchend', this._handleTouchEnd)
  }

  disconnectedCallback() {
    clearTimeout(this.resizeTimer)
    this.shadowRoot.removeEventListener('click', this._onComponentClick)
    this._mediaQuery.removeEventListener('change', this._onBreakpointChange)
    globalThis.removeEventListener('touchmove', this._handleTouchMove)
    globalThis.removeEventListener('touchend', this._handleTouchEnd)
  }

  _handleTouchStart(e) {
    if (!this._mobileState) return

    const touchPath = e.composedPath()

    const isScrollable = (el) =>
      el.scrollHeight > el.clientHeight &&
      ['auto', 'scroll', 'overlay'].includes(globalThis.getComputedStyle(el).overflowY)

    this.isTouchingScrollable = touchPath.some(isScrollable)
    this.scrollableTouchTarget = touchPath.find(isScrollable) || null

    this.isDragging = true
    this.startY = e.touches[0].pageY
    this.currentY = 0
    this.modal.style.transition = 'none'
  }

  _onComponentClick(e) {
    const path = e.composedPath()
    const isCloseBtn = path.find(el => el.classList?.contains('js-close-modal-dialog'))
    const isBackdrop = e.target === this.overlay

    if (isCloseBtn || isBackdrop) {
      e.preventDefault()
      this._close()
    }
  }

  _handleTouchMove(e) {
    if (!this.isDragging || !this._mobileState) return
    this.currentY = e.touches[0].pageY - this.startY

    if (this.isTouchingScrollable) {
      if (this.currentY < 0 || (this.scrollableTouchTarget?.scrollTop ?? 0) > 0) {
        this.currentY = 0
        return
      }
    }

    if (e.cancelable) e.preventDefault()
    if (!this._ticking) {
      this._ticking = true
      requestAnimationFrame(() => {
        if (this.isDragging) {
          this._updateModalTransform()
        }
        this._ticking = false
      })
    }
  }

  _updateModalTransform() {
    const dragY = this.currentY < 0 ? this.currentY * 0.2 : this.currentY
    this.modal.style.transform = `translateY(${dragY}px)`

    const newAlpha = Math.max(0, 0.8 - (dragY / 400))
    this.style.setProperty('--backdrop-alpha', newAlpha)

    const newBlur = Math.max(0, 5 - (dragY / 80))
    this.overlay.style.backdropFilter = `blur(${newBlur}px)`
    this.overlay.style.webkitBackdropFilter = `blur(${newBlur}px)`
  }

  _handleTouchEnd() {
    if (!this.isDragging) return
    this.isDragging = false
    this.isTouchingScrollable = false
    this.scrollableTouchTarget = null
    this._ticking = false

    if (this.currentY > this.PIXELS_SCROLLED_FOR_CLOSE) {
      this._close()
    } else {
      this.modal.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)'
      this.modal.style.transform = 'translateY(0)'
      this.style.setProperty('--backdrop-alpha', '0.8')
      this.style.setProperty('--backdrop-blur', '5px')
      this.overlay.style.backdropFilter = ''
      this.overlay.style.webkitBackdropFilter = ''
    }
  }

  open() {
    this.modal.style.transition = 'none'
    this.modal.style.transform = this._mobileState ? 'translateY(var(--modal-hide-y))' : 'translateX(100%)'

    this.style.setProperty('--backdrop-alpha', '0.8')
    this.style.setProperty('--backdrop-blur', '5px')
    this.overlay.style.backdropFilter = ''
    this.overlay.style.webkitBackdropFilter = ''

    this._lockBodyScroll()
    this.setAttribute('open', '')

    setTimeout(() => {
      this.modal.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)'
      this.modal.style.transform = this._mobileState ? 'translateY(0)' : 'translateX(0)'
    }, 10)
  }

  _lockBodyScroll() {
    document.documentElement.classList.add('modal-open')
    document.body.classList.add('modal-open')
  }

  _unlockBodyScroll() {
    document.documentElement.classList.remove('modal-open')
    document.body.classList.remove('modal-open')
  }

  _close() {
    this.isDragging = false
    this.modal.style.transition = this.CLOSE_TRANSITION

    this.modal.style.transform = this._mobileState ? 'translateY(var(--modal-hide-y))' : 'translateX(100%)'

    this.removeAttribute('open')

    setTimeout(() => {
      this._unlockBodyScroll()
      this.style.setProperty('--backdrop-alpha', '0.8')
      this.style.setProperty('--backdrop-blur', '5px')
      this.overlay.style.backdropFilter = ''
    }, this.CLOSE_TRANSITION_MS)

    this.currentY = 0
  }
}

customElements.define('card-modal', CardModal)