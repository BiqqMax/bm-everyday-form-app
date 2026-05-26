import Link from 'next/link';

import MainNav from '../layout/MainNav';
import HeroMotion from './HeroMotion';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Container from '../layout/Container';

type FeatureItem = {
  title: string;
  description: string;
  points: string[];
};

type UseCaseItem = {
  title: string;
  description: string;
};

const featureItems: FeatureItem[] = [
  {
    title: 'Simple controls',
    description: 'Set up forms fast with labels that stay easy to follow.',
    points: ['Plain field names', 'Consistent order', 'Less guesswork'],
  },
  {
    title: 'Easy to share',
    description: 'Share forms with a link or QR code without extra steps.',
    points: ['Copy a link', 'Share a QR code', 'Set access'],
  },
  {
    title: 'Responses in one place',
    description: 'Keep submissions together and easy to review.',
    points: ['One clear list', 'Quick sorting', 'Easy handoff'],
  },
];

const useCaseItems: UseCaseItem[] = [
  {
    title: 'Teachers',
    description: 'Collect school forms and requests in one place.',
  },
  {
    title: 'Office teams',
    description: 'Manage requests, approvals, and internal forms.',
  },
  {
    title: 'Organizations',
    description: 'Run recurring forms with a process that stays easy to follow.',
  },
];

const supportPoints = [
  'Account help and verification',
  'Workspace and ownership questions',
  'Form setup and publishing guidance',
  'Technical troubleshooting and follow-up',
];

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

function FeatureSection() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
      <Container className="py-10 sm:py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Clear forms, without the clutter.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Simple tools for creating, reviewing, and sharing forms.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featureItems.map((feature) => (
              <Card key={feature.title} className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold tracking-tight text-foreground">{feature.title}</h3>
                      <p className="text-sm leading-6 text-muted">{feature.description}</p>
                    </div>
                  </div>
                  <BulletList items={feature.points} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function UseCaseCard({ item }: { item: UseCaseItem }) {
  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{item.title}</h3>
        <p className="text-sm leading-6 text-muted">{item.description}</p>
      </div>
    </div>
  );
}

function UseCasesSection() {
  return (
    <section className="border-b border-[var(--border)] bg-background">
      <Container className="py-10 sm:py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built for everyday work.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Simple forms for teams, schools, and everyday requests.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {useCaseItems.map((item) => (
              <UseCaseCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section id="hero" className="overflow-hidden border-b border-[var(--border)] bg-background">
          <Container className="relative isolate flex min-h-[calc(88svh-4rem)] max-w-7xl items-center justify-center py-12 sm:py-16 lg:py-20 xl:py-24">
            <HeroMotion className="relative z-10 w-full max-w-[42rem] pt-10 text-center sm:pt-0">
              <div className="mx-auto flex max-w-none flex-col items-center">
                <h1 className="hero-reveal hero-reveal-headline mx-auto max-w-none text-[2.75rem] font-semibold leading-[0.98] tracking-tight text-foreground sm:text-[3.5rem] lg:text-[4rem] xl:text-[4.75rem]">
                  <span className="block whitespace-nowrap">Calm software for</span>
                  <span className="hero-highlight block whitespace-nowrap">everyday forms.</span>
                </h1>

                <p className="hero-reveal hero-reveal-paragraph mx-auto mt-6 max-w-[34rem] text-[1rem] leading-8 text-muted sm:text-[1.125rem]">
                  Structured forms and clear response handling for teachers, teams, businesses, and organizations.
                </p>

                <div className="hero-reveal hero-reveal-ctas mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
                  <Button href="/signup" variant="primary" size="md" className="w-full sm:w-auto sm:px-6">
                    Get started
                  </Button>
                  <Button href="/features" variant="secondary" size="md" className="w-full sm:w-auto sm:px-6">
                    View features
                  </Button>
                </div>
              </div>
            </HeroMotion>
          </Container>
        </section>

        <FeatureSection />
        <UseCasesSection />

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
              <Card>
                <div className="space-y-4 p-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Support stays visible and easy to reach.
                    </h3>
                  </div>
                  <BulletList items={supportPoints} />
                  <p className="text-sm leading-6 text-muted">
                    Clear support access helps the product feel dependable for regular operations.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="space-y-4 p-5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">Need help?</p>
                  <p className="text-sm leading-6 text-muted">
                    Reach out for account assistance, workspace help, form questions, or technical issues.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button href="/support" variant="primary" size="md" className="w-full">
                      Contact support
                    </Button>
                    <Link
                      href="mailto:support@everydayforms.com"
                      className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                    >
                      support@everydayforms.com
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <Card>
              <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="space-y-3">
                  <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Bring calm structure to the way people create and manage forms.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Start simple, build confidently, and stay organized from day one.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="/signup" variant="primary" size="md">
                    Get started
                  </Button>
                  <Button href="/login" variant="secondary" size="md">
                    Sign in
                  </Button>
                </div>
              </div>
            </Card>
          </Container>
        </section>
      </main>
    </div>
  );
}
