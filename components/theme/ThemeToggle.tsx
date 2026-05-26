'use client';

import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { useTheme } from './ThemeProvider';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--accent)]" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
        <path d="M12 2.75v2.25" />
        <path d="M12 19v2.25" />
        <path d="M4.75 12H7" />
        <path d="M17 12h2.25" />
        <path d="M6.4 6.4l1.6 1.6" />
        <path d="M16 16l1.6 1.6" />
        <path d="M17.6 6.4 16 8" />
        <path d="M8 16l-1.6 1.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[var(--accent)]" aria-hidden="true">
      <path
        d="M15.8 3.3A8.5 8.5 0 1 0 20.7 16a7.2 7.2 0 0 1-4.9-12.7Z"
        fill="currentColor"
      />
      <circle cx="17.1" cy="8.2" r="5.9" fill="var(--surface)" />
    </svg>
  );
}

function ThemeTogglePlaceholder() {
  return <span className="block h-6 w-6" aria-hidden="true" />;
}

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'}
      aria-pressed={mounted ? isDark : undefined}
      title={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : undefined}
      className="w-12 px-0"
    >
      {mounted ? isDark ? <MoonIcon /> : <SunIcon /> : <ThemeTogglePlaceholder />}
    </Button>
  );
}
