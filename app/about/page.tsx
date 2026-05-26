import type { Metadata } from 'next';
import Link from 'next/link';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';

export const metadata: Metadata = {
  title: 'About',
  description: 'A restrained overview of Everyday Forms, its product philosophy, and long-term direction.',
};

const philosophyPoints = [
  'Clarity over decoration',
  'Usability over trends',
  'Dependable workflows',
  'Practical software design',
  'Calm interfaces',
];

const designPrinciples = [
  'Clear hierarchy',
  'Balanced UI density',
  'Consistent systems',
  'Maintainable interfaces',
];

const engineeringPrinciples = [
  'Reusable components',
  'Stable architecture',
  'Incremental improvements',
  'Long-term product quality',
];

const audiences = ['Schools', 'Businesses', 'Registration Centres', 'Admin Teams', 'Individuals'];

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

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                title="Practical workflow software built for steady everyday use."
                description="Everyday Forms focuses on clear structure, dependable operations, and interfaces that stay easy to trust over time."
              />

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Product stance</p>
                  <div className="space-y-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <div className="h-2 w-3/4 rounded-full bg-[var(--border)]" />
                    <div className="h-2 w-2/3 rounded-full bg-[var(--border)]" />
                    <div className="h-2 w-1/2 rounded-full bg-[var(--border)]" />
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    Calm interfaces, stable patterns, and consistent controls keep everyday work readable and manageable.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">The product stays centered on clarity.</h2>
                  </div>
                  <BulletList items={philosophyPoints} />
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Built for teams and individuals who need dependable workflows.</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {audiences.map((audience) => (
                      <span
                        key={audience}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm text-muted"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Interfaces should be easy to scan and easy to return to.</h2>
                  </div>
                  <BulletList items={designPrinciples} />
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">The system is built to remain maintainable.</h2>
                  </div>
                  <BulletList items={engineeringPrinciples} />
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
                    Dependable workflow infrastructure for everyday operations.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Everyday Forms is meant to last, stay understandable, and support practical work without drifting into noise.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="/signup" variant="primary" size="md">
                    Get started
                  </Button>
                  <Button href="/support" variant="secondary" size="md">
                    Contact support
                  </Button>
                </div>
              </div>
            </Card>

            <p className="mt-4 text-sm text-muted">
              <Link href="/" className="transition-colors hover:text-foreground">
                Back to home
              </Link>
            </p>
          </Container>
        </section>
      </main>
    </div>
  );
}
