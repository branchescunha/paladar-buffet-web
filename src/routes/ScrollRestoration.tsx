import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { safeScrollTo } from './scroll-utils';

function scrollToHash(hash: string) {
  const target = document.getElementById(hash.slice(1));
  if (!target) {
    return;
  }

  target.scrollIntoView({ block: 'start', behavior: 'auto' });
}

export function ScrollRestoration() {
  const { hash, key, pathname, search } = useLocation();

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    if (!hash) {
      safeScrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    window.requestAnimationFrame(() => scrollToHash(hash));
  }, [hash, key, pathname, search]);

  return null;
}
