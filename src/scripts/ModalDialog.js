import { setCookie, getCookie } from "./utils";

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._render();

    this._onOpenTrigger = () => this._handleOpen();
    this._onNativeClose = () => this._handleClose();
    this._onFirstScroll = this._startPopupTimer.bind(this);
    this.modalClosedCookieName = '';
  }

  connectedCallback() {
    const id = this.getAttribute('id');
    this.modalClosedCookieName = id ? `modal_dialog_${id}_closed` : 'modal_dialog_generic_closed';
    this.dialog = this.shadowRoot.querySelector('[data-element="main-dialog"]');
    this.autoOpenTime = this.dataset.autoOpenDelay;
    if (!this._isCookieModalClosedExist() && this.autoOpenTime) {
      globalThis.addEventListener('scroll', this._onFirstScroll, { once: true });
    }
    if (id) {
      globalThis.addEventListener(`dialog:open:${id}`, () => this._handleOpen());
      globalThis.addEventListener(`dialog:close:${id}`, () => this._handleClose());
    }

    this.dialog.addEventListener('click', this._onComponentClick);
    this.dialog.addEventListener('close', this._onNativeClose);
  }

  disconnectedCallback() {
    const id = this.getAttribute('id');
    globalThis.removeEventListener('scroll', this._onFirstScroll);
    if (id) {
      globalThis.removeEventListener(`dialog:open:${id}`, this._onOpenTrigger);
      globalThis.removeEventListener(`dialog:close:${id}`, this._handleClose);
    }
    this.dialog.removeEventListener('close', this._onNativeClose);
    this.dialog.removeEventListener('click', this._onComponentClick);
  }

  _startPopupTimer() {
    !this._isCookieModalClosedExist() && this._autoOpen(this.autoOpenTime);
  };

  _autoOpen(delay) {
    setTimeout(() => {
      !this._isCookieModalClosedExist() && this._handleOpen();
    }, Number.parseInt(delay, 10) * 1000);
  }

  _isCookieModalClosedExist() {
    return getCookie(this.modalClosedCookieName) === 'true';
  }

  _onComponentClick = (e) => {
    const path = e.composedPath();
    const isCloseBtn = path.find(el => el.classList?.contains('js-close-modal-dialog'));
    const isBackdrop = e.target === this.dialog;
    if (isCloseBtn || isBackdrop) {
      e.preventDefault();
      this._handleClose();
    }
  };

  _handleClose() {
    if (this.dialog.open) {
      this.dialog.classList.add('is-closing');

      setTimeout(() => {
        this.dialog.close()
        this.dialog.classList.remove('is-closing')
      }, 300)
      document.body.classList.remove('modal-open');
      if (!this.hasAttribute('data-no-dismiss-cookie')) {
        setCookie(this.modalClosedCookieName, 'true', 30);
      }
      const subscriptionDialog = this.querySelector('subscription-dialog');
      if (subscriptionDialog) subscriptionDialog.reset();
    }

    if (this._opener) {
      this._opener.focus();
    }
  }

  _handleOpen() {
    if (!this.dialog.open) {
      this._opener = document.activeElement;
      document.body.classList.add('modal-open');
      this.dialog.showModal();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        dialog {
          opacity: 0;
          display: var(--modal-dialog-display, block);
          flex-direction: var(--modal-dialog-flex-direction, column);
          overflow: var(--modal-dialog-overflow, visible);
          width: var(--modal-dialog-width, 100%);
          max-width: var(--modal-dialog-max-width, 100dvw);
          height: var(--modal-dialog-height, auto);
          max-height: var(--modal-dialog-max-height, none);
          border: none;
          padding: 0;
          border-radius: var(--modal-dialog-border-radius, var(--border-radius-18) var(--border-radius-18) 0 0);
          margin: var(--modal-dialog-margin, auto auto 0 auto);
          inset: var(--modal-dialog-inset, 0);
          transition:
            opacity 0.3s ease-out,
            display 0.3s ease-out allow-discrete;
        }

        ::slotted(*) {
          display: var(--modal-dialog-slot-display, block);
          flex: var(--modal-dialog-slot-flex, initial);
          min-height: var(--modal-dialog-slot-min-height, auto);
          width: var(--modal-dialog-slot-width, auto);
        }

        dialog::backdrop {
          background-color: var(--modal-dialog-backdrop-color, rgba(168, 176, 183, .8));
          backdrop-filter: blur(var(--modal-dialog-backdrop-blur, 5px));
          -webkit-backdrop-filter: blur(var(--modal-dialog-backdrop-blur, 5px));
          opacity: 0;
          transition:
            background 0.3s ease-out,
            display 0.3s ease-out allow-discrete;
        }

        dialog[open] {
          opacity: 1;
        }

        dialog[open]::backdrop {
          opacity: 1;
        }

        dialog.is-closing {
          opacity: 0;
        }

        dialog.is-closing::backdrop {
          background: rgba(0, 0, 0, 0);
        }

        @starting-style {
          dialog[open] {
            opacity: 0;
          }
          dialog[open]::backdrop {
            background: rgba(0, 0, 0, 0);
          }
        }

        @media (min-width: 768px) {
          dialog {
            margin: var(--modal-dialog-margin-desktop, auto);
            border-radius: var(--modal-dialog-border-radius-desktop, var(--border-radius-30));
            inset: var(--modal-dialog-inset-desktop, 0);
            width: var(--modal-dialog-width-desktop, calc(100% - 2rem));
            max-width: var(--modal-dialog-max-width-desktop, 100rem);
            height: var(--modal-dialog-height-desktop, fit-content);
            max-height: var(--modal-dialog-max-height-desktop, calc(100dvh - 4rem));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          dialog, dialog::backdrop {
            transition: none;
          }
        }
      </style>

      <dialog data-element="main-dialog">
          <slot></slot>
      </dialog>
    `;
  }
}

customElements.define('modal-dialog', ModalDialog);
