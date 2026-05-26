import type { Metadata } from 'next';
import Link from 'next/link';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';

export const metadata: Metadata = {
  title: 'Features',
  description: 'A practical overview of Everyday Forms features, workflows, and controls.',
};

type FeatureGroup = {
  title: string;
  description: string;
  points: string[];
  previewTitle: string;
  previewRows: string[];
};

const featureGroups: FeatureGroup[] = [
  {
    title: 'Form Creation',
    description: 'Create clear forms with fields that stay structured, readable, and easy to maintain.',
    points: ['Simple field setup', 'Consistent labels and spacing', 'Practical defaults for routine work'],
    previewTitle: 'Form builder',
    previewRows: ['Title field', 'Email field', 'Short response field'],
  },
  {
    title: 'Response Management',
    description: 'Review submissions in a way that keeps the important details visible and organized.',
    points: ['Readable response tables', 'Focused submission views', 'Clear status handling'],
    previewTitle: 'Responses queue',
    previewRows: ['Newest first', 'Unread items', 'Assigned follow-up'],
  },
  {
    title: 'Workflow Organization',
    description: 'Keep repeating tasks grouped so teams can move through everyday intake with less friction.',
    points: ['Workspace grouping', 'Status-based organization', 'Repeatable review patterns'],
    previewTitle: 'Workspace board',
    previewRows: ['Intake', 'Review', 'Completed'],
  },
  {
    title: 'Publishing & Sharing',
    description: 'Publish forms through straightforward sharing options without adding unnecessary complexity.',
    points: ['Shareable links', 'QR code sharing', 'Controlled access'],
    previewTitle: 'Sharing panel',
    previewRows: ['Public link', 'QR code', 'Restricted access'],
  },
  {
    title: 'Workspace Settings',
    description: 'Keep form environments practical, predictable, and aligned with how teams already work.',
    points: ['Ownership-aware settings', 'Role-aware access', 'Stable configuration controls'],
    previewTitle: 'Workspace settings',
    previewRows: ['Members', 'Permissions', 'Defaults'],
  },
  {
    title: 'Exporting',
    description: 'Move data out when needed with export paths that support reporting and record keeping.',
    points: ['Download-ready data', 'Simple handoff formats', 'Useful for archiving and review'],
    previewTitle: 'Export options',
    previewRows: ['CSV export', 'Filtered export', 'Archive copy'],
  },
];

const securityPoints = [
  'OTP verification for a controlled sign-in flow',
  'Protected routes for authenticated workspace access',
  'Ownership validation before sensitive changes',
  'Secure session handling across browser and server contexts',
];

const interfacePoints = [
  'Light and dark mode support',
  'Responsive layouts across screen sizes',
  'Structured surfaces with calm hierarchy',
  'Balanced information density without clutter',
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      <div className="space-y-2">
        <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>
      </div>
    </div>
  );
}

function PreviewCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="space-y-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-tight text-foreground">{title}</p>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-muted">
          Preview
        </span>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row} className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-muted">
            {row}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureGroupCard({ group }: { group: FeatureGroup }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{group.title}</h2>
            <p className="text-sm leading-7 text-muted">{group.description}</p>
          </div>

          <ul className="space-y-2">
            {group.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <PreviewCard title={group.previewTitle} rows={group.previewRows} />
      </div>
    </Card>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                eyebrow="Features"
                title="Structured tools for everyday form work."
                description="Everyday Forms helps teams create forms, review responses, organize work, and keep routine workflows clear without adding unnecessary weight."
              />

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-3 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Interface snapshot</p>
                  <div className="space-y-2 rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Active form</span>
                      <span>Ready</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-3/4 rounded-full bg-[var(--border)]" />
                      <div className="h-2 w-2/3 rounded-full bg-[var(--border)]" />
                      <div className="h-2 w-1/2 rounded-full bg-[var(--border)]" />
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted">
                    Calm surfaces, clear labels, and practical controls keep the workspace focused on the task at hand.
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
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Core feature groups</p>
                <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Practical capabilities arranged around the full form lifecycle.
                </h2>
              </div>

              <div className="grid gap-4">
                {featureGroups.map((group) => (
                  <FeatureGroupCard key={group.title} group={group} />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Authentication & security</p>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Access stays controlled and predictable.</h2>
                  </div>
                  <ul className="space-y-2">
                    {securityPoints.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Interface experience</p>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">The UI stays calm in both themes.</h2>
                  </div>
                  <ul className="space-y-2">
                    {interfacePoints.map((point) => (
                      <li key={point} className="flex gap-3 text-sm leading-6 text-muted">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Next step</p>
                  <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Explore the pages, then use the workspace when you need a dependable process.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Everyday Forms stays focused on practical control, clear structure, and steady day-to-day use.
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
