import type { Metadata } from 'next';
import Link from 'next/link';

import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Everyday Forms handles privacy, data use, and account information.',
};

const privacyPoints = [
  'Collect only what is needed to run the service',
  'Use data to provide forms, support, and account operations',
  'Keep access limited to authorized users and systems',
  'Review and improve data handling practices over time',
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                title="Privacy practices built to stay clear and minimal."
                description="Everyday Forms is designed to handle account and form data responsibly, with access limited to what is needed to keep the product working."
              />

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">What we focus on</p>
                  <BulletList items={privacyPoints} />
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
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Information use</h2>
                  <p className="text-sm leading-6 text-muted">
                    We use information to operate accounts, store form submissions, provide support, and keep the service secure and reliable.
                  </p>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">Access and control</h2>
                  <p className="text-sm leading-6 text-muted">
                    Access is limited to authorized systems and personnel. We aim to keep data handling understandable and predictable.
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
                    Questions about privacy or data handling?
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Contact support if you want help understanding account or data-related workflows.
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

            <p className="mt-4 text-sm text-muted">
              Last updated: May 2026
            </p>
          </Container>
        </section>
      </main>
    </div>
  );
}
