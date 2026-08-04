import { islands } from './registry.js';
import { onReady } from './on-ready.js';

function hasMatch(selector) {
  return document.querySelector(selector) !== null;
}

/**
 * Dynamically import script modules for every island whose selector
 * matches an element currently in the document.
 */
export function bootIslands() {
  const active = islands.filter(({ selector }) => hasMatch(selector));

  if (active.length === 0) return Promise.resolve();

  return Promise.all(active.map(({ load }) => load()));
}

onReady(() => {
  bootIslands();
});
