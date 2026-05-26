import Link from 'next/link';

import BrandMark from './BrandMark';
import Container from './Container';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/use-cases', label: 'Use cases' },
  { href: '/about', label: 'About' },
  { href: '/support', label: 'Support' },
] as const;

const legalLinks = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
] as const;

const socialLinks = [
  {
    href: 'https://twitter.com/everydayforms',
    label: 'Twitter / X',
    handle: '@everydayforms',
    icon: 'twitter',
  },
  {
    href: 'https://facebook.com/everydayforms',
    label: 'Facebook',
    handle: '@everydayforms',
    icon: 'facebook',
  },
  {
    href: 'https://www.linkedin.com/company/everydayforms',
    label: 'LinkedIn',
    handle: '@everydayforms',
    icon: 'linkedin',
  },
  {
    href: 'https://github.com/everydayforms',
    label: 'GitHub',
    handle: '@everydayforms',
    icon: 'github',
  },
] as const;

type SocialLink = (typeof socialLinks)[number];

function Icon({ name }: { name: SocialLink['icon'] }) {
  switch (name) {
    case 'twitter':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M17.7 3H21l-7.4 8.5L22 21h-6.8l-5.3-6.3L4.4 21H1l7.9-9.1L2 3h6.9l4.8 5.7L17.7 3Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M13.8 8.6V7.2c0-.7.5-1.2 1.2-1.2h1.4V2.6h-2.2c-2.7 0-4.4 1.8-4.4 4.6v1.4H8v3.8h1.8V21H14v-9.6h2.3l.6-3.8h-3.1Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M6.3 9.2H2.8V21h3.5V9.2ZM4.5 2.8a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM21 21h-3.5v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.7V9.2H13v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.5V21Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
          <path
            d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.7c-2.8.6-3.3-1.3-3.3-1.3-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.3.9 1.3.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2.2-.3-4.5-1.1-4.5-4.8 0-1 .4-1.8 1-2.5-.1-.3-.5-1.2.1-2.5 0 0 .8-.2 2.5 1a8.4 8.4 0 0 1 4.5 0c1.7-1.2 2.5-1 2.5-1 .6 1.3.2 2.2.1 2.5.6.7 1 1.6 1 2.5 0 3.7-2.3 4.5-4.5 4.8.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.2C22 6.6 17.5 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      );
  }
}

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{title}</p>
      <nav aria-label={title} className="flex flex-col gap-2 text-sm text-muted">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

function SocialLinkButton({ link }: { link: SocialLink }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      aria-label={`${link.label} ${link.handle}`}
      title={link.label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--accent)] transition-colors hover:bg-[var(--surface-muted)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      <Icon name={link.icon} />
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-background">
      <Container className="py-8 sm:py-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <BrandMark className="shrink-0" />
            <p className="max-w-md text-sm leading-6 text-muted">
              Everyday Forms keeps routine work clear, dependable, and easy to return to.
            </p>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Social</p>
              <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 md:overflow-visible">
                {socialLinks.map((link) => (
                  <SocialLinkButton key={link.label} link={link} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-1 sm:flex-row sm:gap-10">
              <FooterLinkGroup title="Quick links" links={quickLinks} />
              <FooterLinkGroup title="Legal" links={legalLinks} />
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-muted">
          <p className="text-center">© 2026 Everyday Forms. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
