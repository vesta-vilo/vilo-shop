export const mobileMenuStyles = new CSSStyleSheet();
mobileMenuStyles.replaceSync(`
  .drawer {
     position: fixed;
     top: 0;
     left: -100%;
     width: calc(100% - 4rem);
     height: 100dvh;
     max-width: calc(43rem - 4rem);
     background: var(--white);
     border-radius: 0 var(--border-radius-20) var(--border-radius-20) 0;
     overflow: hidden;
     transition: 0.3s;
     z-index: 120;
     box-shadow: -0.2rem 0 .5rem rgba(var(--black),0.5);
   }
   .drawer-content-wrapper {
     background: var(--background-color);
     color: var(--primary-color);
     height: 100%;
     padding-inline: 2.2rem;
     display: flex;
     flex-direction: column;
   }
   .drawer.open {
     left: 0;
   }
   .drawer-header {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding-top: 6rem;
     padding-bottom: 2.4rem;
   }
   .drawer-content {
     flex: 1;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
     max-height: calc(100% - 6rem);
     position: relative;
     overflow: hidden;
   }
   .close-btn {
     background: transparent;
     border: none;
     cursor: pointer;
     padding: 0;
     line-height: 0;
   }
   .close-btn img {
     display: block;
     width: 4.2rem;
     height: 4.2rem;
     object-fit: contain;
   }
   .overlay {
       position: fixed;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       background: rgb(var(--backdrop-color-rgb) / var(--backdrop-opacity));
       backdrop-filter: blur(var(--backdrop-blur));
       -webkit-backdrop-filter: blur(var(--backdrop-blur));
       visibility: hidden;
       opacity: 0;
       transition: 0.3s;
       z-index: 110;
   }
   .overlay.active {
     visibility: visible;
     opacity: 1;
   }
   .drawer-header-btn {
     position: relative;
     width: 10rem;
     height: 100%;
     display: flex;
     align-items: center;
     -webkit-tap-highlight-color: transparent;
   }
   .icon-logo, .icon-back {
     position: absolute;
     top: 50%;
     left: 0;
     transform: translateY(-50%);
     transition: opacity 0.3s ease, visibility 0.3s;
   }
   .icon-back {
     color: var(--text-color-secondary);
   }
   .icon-back img {
     display: block;
     width: 1.6rem;
     height: 2rem;
     object-fit: contain;
   }
   .icon-back { opacity: 0; visibility: hidden; }
   .icon-logo { opacity: 1; visibility: visible; }
   .is-back-state .icon-back { opacity: 1; visibility: visible; }
   .is-back-state .icon-logo { opacity: 0; visibility: hidden; }

   .secondary-menus-slot {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 20;
    width: 100%;
   }

    ::slotted(.drawer-secondary-links),
    ::slotted(.drawer-navigation-links) {
        display: block;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    ::slotted(.drawer-secondary-links.is-hidden),
    ::slotted(.drawer-navigation-links.is-hidden) {
        opacity: 0;
        transform: translateX(-20px);
        pointer-events: none;
    }
`);
