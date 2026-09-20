import { flushSync } from 'react-dom';

/**
 * Executes Emil Kowalski's signature circular reveal theme transition
 * using the modern View Transitions API with seamless frame-rate optimization.
 * Suppresses intermediate CSS transitions during the snapshot phase to prevent
 * any stuttering or frame drops in the middle of the circular expansion.
 */
export function executeThemeTransition(
  toggleFn: () => void | Promise<void>
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

  // Disable conflicting element-level CSS transitions during view-transition snapshot
  document.documentElement.classList.add('theme-switching');

  const transition = doc.startViewTransition(() => {
    flushSync(() => {
      toggleFn();
    });
  });

  transition.ready.then(() => {
    doc.documentElement.animate(
      {
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(8px)'],
        transform: ['scale(1)', 'scale(1.03)']
      },
      {
        duration: 250,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-old(root)',
      }
    );

    const animation = doc.documentElement.animate(
      {
        opacity: [0, 1],
        filter: ['blur(12px)', 'blur(0px)'],
        transform: ['scale(0.97)', 'scale(1)']
      },
      {
        duration: 250,
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
