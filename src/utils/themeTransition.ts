import React from 'react';
import { flushSync } from 'react-dom';

/**
 * Executes Emil Kowalski's signature circular reveal theme transition
 * using the modern View Transitions API with seamless frame-rate optimization.
 * Suppresses intermediate CSS transitions during the snapshot phase to prevent
 * any stuttering or frame drops in the middle of the circular expansion.
 */
export function executeThemeTransition(
  toggleFn: () => void | Promise<void>,
  event?: React.MouseEvent | React.TouchEvent
) {
  const doc = document as any;
  const supportsViewTransition =
    typeof doc.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!supportsViewTransition) {
    document.documentElement.classList.add('theme-transition');
    toggleFn();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 350);
    return;
  }

  // Determine origin coordinates for circular expansion
  let x = window.innerWidth - 36;
  let y = 36;

  if (event) {
    if ('clientX' in event && typeof event.clientX === 'number' && event.clientX > 0) {
      x = event.clientX;
      y = event.clientY;
    } else if ('touches' in event && event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    }
  }

  // Calculate radius to the furthest corner of the screen
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // Disable conflicting element-level CSS transitions during view-transition snapshot
  document.documentElement.classList.add('theme-switching');

  const transition = doc.startViewTransition(() => {
    flushSync(() => {
      toggleFn();
    });
  });

  transition.ready.then(() => {
    const animation = doc.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 380,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );

    animation.finished.finally(() => {
      document.documentElement.classList.remove('theme-switching');
    });
  });

  transition.finished.finally(() => {
    document.documentElement.classList.remove('theme-switching');
  });
}
