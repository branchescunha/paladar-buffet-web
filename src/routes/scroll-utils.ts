function scrollBehaviorForPreference(): ScrollBehavior {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

export function scrollToTopForSameRoute() {
  safeScrollTo({ top: 0, left: 0, behavior: scrollBehaviorForPreference() });
}

export function safeScrollTo(options: ScrollToOptions) {
  if (window.navigator.userAgent.toLowerCase().includes('jsdom')) {
    return;
  }

  try {
    window.scrollTo(options);
  } catch {
    try {
      window.scrollTo(options.left ?? 0, options.top ?? 0);
    } catch {
      // jsdom does not implement scrolling; browser tests cover the real behavior.
    }
  }
}
