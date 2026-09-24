import { onReady } from './islands/on-ready.js';

/**
 * Video section — full-bleed grow on scroll.
 *
 * Once the top of the video block reaches 70% of the viewport height,
 * further scrolling drives `--video-grow` from 0 to 1, reaching 1 when the
 * full-bleed block is centered in the viewport. CSS uses it to widen
 * the block to the full viewport width and take the border-radius to 0.
 *
 * An IntersectionObserver attaches the scroll listener only while the section
 * is near the viewport.
 */

// Viewport fraction (from the top) the video's top must reach to start growing
const GROW_START = 0.7;

function initVideoSection(section) {
  const media = section.querySelector('.js-video-section__media');
  if (!media) return;

  let frame = null;

  function update() {
    frame = null;

    const viewportHeight = window.innerHeight;
    const bleedWidth = document.documentElement.clientWidth;
    // Aspect ratio is constant while growing, so derive the full-bleed
    // height from widths — keeps the end point stable during the grow.
    const ratio = media.offsetHeight / media.offsetWidth;
    const fullHeight = bleedWidth * ratio;
    // Media top doesn't move while growing (only content below shifts)
    const top = media.getBoundingClientRect().top;

    // Start: block's top reaches 70% of the viewport height.
    // End: full-bleed block is centered in the viewport.
    const startTop = viewportHeight * GROW_START;
    const endTop = (viewportHeight - fullHeight) / 2;
    const distance = Math.max(startTop - endTop, 1);
    const progress = Math.min(Math.max((startTop - top) / distance, 0), 1);

    section.style.setProperty('--video-bleed-width', `${bleedWidth}px`);
    section.style.setProperty('--video-grow', progress.toFixed(4));
  }

  function requestUpdate() {
    if (frame === null) frame = requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      window.addEventListener('scroll', requestUpdate, { passive: true });
      window.addEventListener('resize', requestUpdate);
      requestUpdate();
    } else {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    }
  });

  observer.observe(section);
  update();

  initControl(media);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Play/pause toggle for the section's <video>.
 *
 * The video is paused on load and is driven by visibility: it plays as soon
 * as its first pixel enters the viewport and pauses once it is fully out.
 * Auto-play is skipped when the user prefers reduced motion, or after they
 * paused it with the button — pressing play again hands control back to the
 * visibility logic.
 *
 * The button also doubles as a progress ring: `--video-progress` (0 → 1) is
 * written on every frame while playing and drives the SVG border stroke.
 */
function initControl(media) {
  const button = media.querySelector('.js-video-section__control');
  const video = media.querySelector('video');
  if (!button || !video) return;

  let inView = false;
  let userPaused = false;
  let progressFrame = null;

  function setState(playing) {
    button.dataset.state = playing ? 'playing' : 'paused';
    button.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
  }

  function renderProgress() {
    const { currentTime, duration } = video;
    // duration is NaN until metadata lands, and Infinity for streams
    const progress = duration > 0 && Number.isFinite(duration) ? currentTime / duration : 0;
    button.style.setProperty('--video-progress', Math.min(Math.max(progress, 0), 1).toFixed(4));
  }

  // rAF rather than `timeupdate` — the latter fires ~4x a second, too coarse
  // for a ring that should sweep smoothly.
  function trackProgress() {
    progressFrame = requestAnimationFrame(trackProgress);
    renderProgress();
  }

  function startTracking() {
    if (progressFrame === null) trackProgress();
  }

  function stopTracking() {
    if (progressFrame === null) return;
    cancelAnimationFrame(progressFrame);
    progressFrame = null;
    renderProgress();
  }

  function play() {
    // Muted + inline so browsers allow playback without a user gesture
    video.muted = true;
    video.play().catch(() => setState(false));
  }

  function pause() {
    video.pause();
  }

  setState(false);
  renderProgress();

  video.addEventListener('play', () => {
    setState(true);
    startTracking();
  });
  video.addEventListener('pause', () => {
    setState(false);
    stopTracking();
  });
  video.addEventListener('ended', stopTracking);
  video.addEventListener('loadedmetadata', renderProgress);
  video.addEventListener('seeked', renderProgress);

  // threshold 0 → fires on the first visible pixel and when the last one leaves
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (!inView) pause();
    else if (!userPaused && !reducedMotion.matches) play();
  });
  observer.observe(media);

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) pause();
    else if (inView && !userPaused) play();
  });

  button.addEventListener('click', () => {
    if (!video.paused) {
      userPaused = true;
      pause();
    } else {
      userPaused = false;
      play();
    }
  });
}

onReady(() => {
  document.querySelectorAll('.video-section').forEach(initVideoSection);
});
