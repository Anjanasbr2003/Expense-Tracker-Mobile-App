import React from 'react';

/**
 * Executes Emil Kowalski's signature circular reveal theme transition
 * using the modern View Transitions API with graceful CSS transition fallback.
 */
export function executeThemeTransition(
  toggleFn: () => void | Promise<void>,
  event?: React.MouseEvent | React.TouchEvent
) {
  // Check if View Transitions API is supported and user hasn't requested reduced motion
  const doc = document as any;
  const supportsViewTransition =
    typeof doc.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!supportsViewTransition) {
    // Add brief smooth transition class to root
    document.documentElement.classList.add('theme-transition');
    toggleFn();
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 400);
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

  const transition = doc.startViewTransition(async () => {
    await toggleFn();
  });

  transition.ready.then(() => {
    // Animate circular clipPath on the incoming theme snapshot
    doc.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 450,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });
}
