'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';

import BrandMark from './BrandMark';
import Container from './Container';
import Button from '../ui/Button';
import ThemeToggle from '../theme/ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/use-cases', label: 'Use cases' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M5 7.5h14M5 12h14M5 16.5h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
      focusable?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  const mobileMenu =
    isMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-50 lg:hidden"
            onClick={closeMenu}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                closeMenu();
              }
            }}
          >
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
            <div className="absolute inset-0 flex items-stretch justify-stretch p-2 sm:p-3 md:p-4 lg:items-center lg:justify-end">
              <div
                id={menuId}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                onClick={(event) => event.stopPropagation()}
                className="flex h-full w-full flex-col rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] text-foreground shadow-[var(--shadow)] lg:h-auto lg:max-w-md"
              >
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Menu</p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    aria-label="Close navigation menu"
                    onClick={closeMenu}
                    className="w-11 px-0"
                  >
                    <CloseIcon />
                  </Button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Navigation</p>
                    <nav className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]">
                      {navLinks.map((link, index) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={closeMenu}
                          className={joinClasses(
                            'flex h-14 items-center justify-between px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                            index < navLinks.length - 1 && 'border-b border-[var(--border)]',
                          )}
                        >
                          <span>{link.label}</span>
                          <span className="text-muted" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <div className="mt-5 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Account</p>
                    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]">
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="flex h-14 items-center justify-between px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      >
                        <span>Sign in</span>
                        <span className="text-muted" aria-hidden="true">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-sm">
        <Container className="flex h-14 items-center gap-3 px-4 sm:h-16 sm:px-6 lg:h-[72px] lg:px-8">
          <BrandMark className="shrink-0" />

          <nav className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[10px] px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-[var(--surface-muted)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link
              href="/login"
              className="hidden h-11 items-center rounded-[var(--radius-md)] px-3 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] lg:inline-flex"
            >
              Sign in
            </Link>

            <Button
              type="button"
              variant="secondary"
              size="md"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls={menuId}
              onClick={() => setIsMenuOpen((current) => !current)}
              className="w-12 px-0 lg:hidden"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </Button>
          </div>
        </Container>
      </header>

      {mobileMenu}
    </>
  );
}
