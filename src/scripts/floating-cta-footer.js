import { onReady } from './islands/on-ready.js';

/**
 * Hide the fixed floating CTA while the site footer is in the viewport.
 * (Scroll-driven view timelines are brittle across browsers without timeline-scope.)
 */
onReady(() => {
    const wrapper = document.querySelector('.floating-cta-wrapper');
    const footer = document.querySelector('footer.site-footer');
    if (!wrapper || !footer) return;

    const cls = 'floating-cta-wrapper--footer-visible';

    const io = new IntersectionObserver(
        ([entry]) => {
            wrapper.classList.toggle(cls, entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '0px' }
    );

    io.observe(footer);
});
