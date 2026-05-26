import type { Metadata } from 'next';
import Link from 'next/link';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Container from '../../components/layout/Container';
import MainNav from '../../components/layout/MainNav';
import Input from '../../components/ui/Input';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support and contact options for Everyday Forms.',
};

const supportOptions = [
  {
    title: 'Account Help',
    description: 'Help with sign-in, verification, password recovery, and account access.',
  },
  {
    title: 'Workspace Assistance',
    description: 'Support for workspace settings, access, and ownership questions.',
  },
  {
    title: 'Form Support',
    description: 'Guidance for form setup, publishing, and response handling.',
  },
  {
    title: 'Technical Issues',
    description: 'Troubleshooting for bugs, browser issues, and unexpected behavior.',
  },
];

const faqs = [
  {
    question: 'How quickly do support requests receive a response?',
    answer: 'Most support requests receive a response within 24–48 hours.',
  },
  {
    question: 'What information should I include?',
    answer: 'Include your name, email, workspace context, and a short description of the issue.',
  },
  {
    question: 'Can I ask about form setup or workflow guidance?',
    answer: 'Yes. Support covers both product issues and practical workflow questions.',
  },
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

function SupportOptionCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="space-y-3 p-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </div>
    </Card>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <SectionHeading
                eyebrow="Support"
                title="Clear support for everyday product and workspace needs."
                description="Everyday Forms keeps support calm and operational so users can get help with account access, workspace setup, form issues, and technical questions."
              />
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Support options</p>
                <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Choose the path that matches the problem you need to solve.
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {supportOptions.map((option) => (
                  <SupportOptionCard key={option.title} title={option.title} description={option.description} />
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Contact form</p>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Send a structured request.</h2>
                  </div>

                  <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input id="support-name" name="name" label="Name" placeholder="Your name" required />
                      <Input id="support-email" name="email" type="email" label="Email" placeholder="name@example.com" required />
                    </div>

                    <Input
                      id="support-category"
                      name="category"
                      label="Category"
                      placeholder="Account Help, Workspace Assistance, Form Support, or Technical Issues"
                      required
                    />

                    <label className="block text-sm">
                      <span className="mb-2 block text-sm font-medium text-foreground">Message</span>
                      <textarea
                        name="message"
                        rows={6}
                        className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                        placeholder="Describe the issue, the workspace involved, and what you were trying to do."
                        required
                      />
                    </label>

                    <Button type="button" variant="primary" className="w-full">
                      Send request
                    </Button>
                  </form>
                </div>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">FAQ</p>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Common questions</h2>
                  </div>

                  <div className="space-y-3">
                    {faqs.map((faq) => (
                      <details key={faq.question} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                        <summary className="cursor-pointer list-none text-sm font-semibold tracking-tight text-foreground">
                          {faq.question}
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-muted">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
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
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Closing note</p>
                  <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Support that stays calm and straightforward.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    If you need help, send a clear request and the team will respond with practical next steps.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button href="mailto:support@everydayforms.com" variant="primary" size="md">
                    Email support
                  </Button>
                  <Button href="/" variant="secondary" size="md">
                    Back home
                  </Button>
                </div>
              </div>
            </Card>

            <p className="mt-4 text-sm text-muted">
              <Link href="/about" className="transition-colors hover:text-foreground">
                Learn about the product philosophy
              </Link>
            </p>
          </Container>
        </section>
      </main>
    </div>
  );
}
