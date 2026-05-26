import type { Metadata } from 'next';
import Link from 'next/link';

import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms of use for Everyday Forms.',
};

const termsPoints = [
  'Use the service in a lawful and responsible way',
  'Keep account access secure and accurate',
  'Respect workspace access and ownership rules',
  'Follow product-specific usage limits and policies',
];

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-muted">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                title="Simple terms for using Everyday Forms."
                description="These terms outline the basic expectations for using the product safely, respectfully, and in line with your workspace responsibilities."
              />

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Key expectations</p>
                  <BulletList items={termsPoints} />
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Account responsibility</h2>
                  <p className="text-sm leading-6 text-muted">
                    You are responsible for the information in your account and for keeping your access credentials secure.
                  </p>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Acceptable use</h2>
                  <p className="text-sm leading-6 text-muted">
                    Use the service only for legitimate purposes and avoid actions that could disrupt service, security, or other users.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Contact support if you need help understanding these terms.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Support can help with account questions, workspace ownership, and general product guidance.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/support"
                    className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    Contact support
                  </Link>
                  <Link href="/" className="inline-flex h-11 items-center justify-center rounded-[10px] px-4 text-sm font-medium text-muted transition-colors hover:text-foreground">
                    Back to home
                  </Link>
                </div>
              </div>
            </Card>

            <p className="mt-4 text-sm text-muted">Last updated: May 2026</p>
          </Container>
        </section>
      </main>
    </div>
  );
}
