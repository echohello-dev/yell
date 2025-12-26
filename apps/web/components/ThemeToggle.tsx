'use client';

import { useEffect, useSyncExternalStore, useCallback } from 'react';

function getSnapshot() {
  if (typeof window === 'undefined') return 'system';
  return localStorage.getItem('theme') || 'system';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getServerSnapshot() {
  return 'system';
}

export function ThemeToggle() {
  const storedTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (storedTheme && storedTheme !== 'system') {
      document.documentElement.setAttribute('data-theme', storedTheme);
    }
  }, [storedTheme]);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const isDark =
      currentTheme === 'dark' ||
      (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const newTheme = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const isDark =
    typeof window !== 'undefined' &&
    (storedTheme === 'dark' ||
      (storedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));

  return (
    <button
      onClick={toggleTheme}
      className="yell-theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
    >
      {isDark ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
