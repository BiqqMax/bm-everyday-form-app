import Link from 'next/link';

import BrandMark from './BrandMark';
import Container from './Container';

const footerLinks = [
  { href: '/about', label: 'About' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-background">
      <Container className="py-8 sm:py-10">
        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end sm:justify-between">
          <div className="space-y-4">
            <BrandMark compact />
            <p className="max-w-md text-sm leading-6 text-muted">
              Everyday Forms keeps routine work clear, dependable, and easy to return to.
            </p>
          </div>

          <div className="space-y-4 sm:text-right">
            <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted sm:justify-end">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-sm text-muted">© 2026 Everyday Forms. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
