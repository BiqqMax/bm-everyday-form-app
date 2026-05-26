import type { Metadata } from 'next';
import Link from 'next/link';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';

export const metadata: Metadata = {
  title: 'Use Cases',
  description: 'Practical workflows Everyday Forms supports across teams and everyday operations.',
};

type UseCase = {
  title: string;
  scenario: string;
  workflow: string[];
  benefit: string;
};

const useCases: UseCase[] = [
  {
    title: 'Schools',
    scenario: 'Collect permissions, routine notices, classroom feedback, and event information in one repeatable flow.',
    workflow: ['Publish a form', 'Review responses', 'Follow up on exceptions'],
    benefit: 'Keeps day-to-day school administration organized and easy to scan.',
  },
  {
    title: 'Administrative Teams',
    scenario: 'Handle internal requests, approvals, and intake forms without creating extra process overhead.',
    workflow: ['Receive submission', 'Assign ownership', 'Close the loop'],
    benefit: 'Supports predictable operations with less manual coordination.',
  },
  {
    title: 'Businesses',
    scenario: 'Capture customer intake, team requests, and operational tasks in a structured workspace.',
    workflow: ['Share the form', 'Track responses', 'Export records as needed'],
    benefit: 'Helps teams keep routine work moving with clear accountability.',
  },
  {
    title: 'Registration Centres',
    scenario: 'Collect participant details, check required fields, and keep sign-up records in order.',
    workflow: ['Gather information', 'Validate entries', 'Store the record'],
    benefit: 'Supports reliable intake when accuracy matters.',
  },
  {
    title: 'Personal Workflows',
    scenario: 'Use forms for planning, tracking, reminders, and lightweight organizing tasks.',
    workflow: ['Create a small form', 'Review responses', 'Reuse the pattern'],
    benefit: 'Makes everyday self-management more structured without feeling heavy.',
  },
];

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-2">
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>
    </div>
  );
}

function WorkflowCard({ steps }: { steps: string[] }) {
  return (
    <div className="space-y-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-sm font-semibold tracking-tight text-foreground">Workflow example</p>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-muted"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)] text-[11px] font-semibold text-foreground">
              {index + 1}
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UseCaseCard({ item }: { item: UseCase }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h2>
            <p className="text-sm leading-7 text-muted">{item.scenario}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm leading-6 text-muted">{item.benefit}</p>
          </div>
        </div>

        <WorkflowCard steps={item.workflow} />
      </div>
    </Card>
  );
}

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                title="Practical workflows for everyday operations."
                description="Everyday Forms supports common intake and review work for schools, admin teams, businesses, registration centres, and personal workflows."
              />

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Typical pattern</p>
                  <div className="space-y-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <div className="h-2 w-3/4 rounded-full bg-[var(--border)]" />
                    <div className="h-2 w-2/3 rounded-full bg-[var(--border)]" />
                    <div className="h-2 w-1/2 rounded-full bg-[var(--border)]" />
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    Clear intake, calm review, and predictable follow-up keep routine workflows manageable.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Built for scenarios where structure matters more than decoration.
                </h2>
              </div>

              <div className="grid gap-4">
                {useCases.map((item) => (
                  <UseCaseCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">Collect</h2>
                  <p className="text-sm leading-6 text-muted">
                    Capture the information you need with forms that stay easy to complete and easy to maintain.
                  </p>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">Organize</h2>
                  <p className="text-sm leading-6 text-muted">
                    Keep submissions grouped and readable so teams can focus on the next action instead of searching.
                  </p>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">Act</h2>
                  <p className="text-sm leading-6 text-muted">
                    Use straightforward workflows to move from intake to follow-up without adding process noise.
                  </p>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section>
          <Container className="py-10 sm:py-12">
            <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-2">
                  <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    A practical system for recurring work.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Everyday Forms keeps routine intake and follow-up structured, dependable, and easy to return to.
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
