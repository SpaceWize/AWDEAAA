import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Whether the reader has asked their system to reduce motion.
 *
 * Framer Motion ships its own `useReducedMotion`, but it reads the media query
 * once when its module first loads and shares that snapshot. That is fine for
 * someone who had the setting on before opening the page, and wrong for anyone
 * who turns it on while the page is open — which is exactly what someone does
 * when movement starts making them feel unwell. This subscribes instead, so
 * the answer changes the moment the setting does.
 *
 * Returns false during server rendering and before the first effect, so the
 * initial paint matches the default (motion allowed) and then corrects itself.
 */
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(QUERY).matches
      : false,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    // addListener is the deprecated form, still needed for older Safari.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
};

export default useReducedMotion;
