'use client';

import { useMemo, useRef, useState } from 'react';

import Button from '../ui/Button';
import Card from '../ui/Card';
import Container from '../layout/Container';
import MainNav from '../layout/MainNav';
import Input from '../ui/Input';

type SupportCategory = 'Account Help' | 'Workspace Assistance' | 'Form Support' | 'Other Issues';

type SupportOption = {
  title: SupportCategory;
  description: string;
  note: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const supportOptions: SupportOption[] = [
  {
    title: 'Account Help',
    description: 'Sign-in, verification, password recovery, or access problems.',
    note: 'Best for login issues and account recovery.',
  },
  {
    title: 'Workspace Assistance',
    description: 'Workspace access, ownership, member roles, or settings issues.',
    note: 'Use this for workspace permissions and administration.',
  },
  {
    title: 'Form Support',
    description: 'Form setup, publishing, field behavior, or response handling.',
    note: 'Choose this for builder or form workflow questions.',
  },
  {
    title: 'Other Issues',
    description: 'Bug reports, browser problems, or anything that does not fit above.',
    note: 'Best for unexpected behavior and general support.',
  },
];

const faqs: FaqItem[] = [
  {
    question: 'How fast will I get a reply?',
    answer:
      'Most requests receive a first response within 24 to 48 hours during business days. If the issue needs investigation, we will reply with the next step instead of leaving the request unanswered.',
  },
  {
    question: 'What should I include in my message?',
    answer:
      'Include the workspace name, the page or form you were using, the browser or device if the issue is technical, and the exact behavior you saw. Screenshots are especially useful when something looks broken or incomplete.',
  },
  {
    question: 'What if I cannot access my account at all?',
    answer:
      'Select Account Help, describe the email address tied to the account, and explain what fails during sign-in or verification. If you no longer have access to the inbox or authenticator, mention that clearly so the team can guide the recovery steps.',
  },
  {
    question: 'I am having trouble with a form field. What should I do?',
    answer:
      'Choose Form Support and explain which field is causing trouble, what you expected to happen, and what happened instead. If the field behaves differently in preview versus a published form, include that detail because it helps narrow down the cause quickly.',
  },
  {
    question: 'Can you help with workspace permissions or member access?',
    answer:
      'Yes. Workspace Assistance covers invitations, owner transfers, member roles, and access restrictions. Mention who should have access, who currently does, and whether the issue is limited to one workspace or affects several.',
  },
  {
    question: 'What counts as Other Issues?',
    answer:
      'Use Other Issues for bugs, performance issues, browser-specific problems, or anything that does not fit the other categories. This option is also appropriate when you are not sure which category applies and want the request routed correctly.',
  },
];

const categoryOptions: SupportCategory[] = ['Account Help', 'Workspace Assistance', 'Form Support', 'Other Issues'];

export default function SupportPageClient() {
  const [category, setCategory] = useState<SupportCategory | ''>('');
  const formRef = useRef<HTMLDivElement | null>(null);

  const selectedDescription = useMemo(() => {
    return supportOptions.find((option) => option.title === category)?.note ?? 'Choose the category that best matches your request.';
  }, [category]);

  function handleOptionSelect(nextCategory: SupportCategory) {
    setCategory(nextCategory);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />

      <main>
        <section className="border-b border-[var(--border)]">
          <Container className="py-14 sm:py-16 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    Clear support for everyday product and workspace needs.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                    Everyday Forms keeps support calm and operational so users can get help with account access, workspace setup, form issues, and technical questions.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)]">
          <Container className="py-10 sm:py-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Choose the issue that matches what you need help with.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
                  Each option jumps you to the contact form and pre-fills the category so you can send a focused request faster.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {supportOptions.map((option) => (
                  <button
                    key={option.title}
                    type="button"
                    onClick={() => handleOptionSelect(option.title)}
                    className="text-left"
                  >
                    <SupportOptionCard title={option.title} description={option.description} note={option.note} />
                  </button>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
          <Container className="py-10 sm:py-12">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
              <Card ref={formRef} className="border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Send a structured request.</h2>
                    <p className="text-sm leading-6 text-muted">
                      {selectedDescription}
                    </p>
                  </div>

                  <form className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input id="support-name" name="name" label="Name" placeholder="Your name" required />
                      <Input id="support-email" name="email" type="email" label="Email" placeholder="name@example.com" required />
                    </div>

                    <label className="block text-sm">
                      <span className="mb-2 block text-sm font-medium text-foreground">Category</span>
                      <select
                        id="support-category"
                        name="category"
                        value={category}
                        onChange={(event) => setCategory(event.target.value as SupportCategory | '')}
                        required
                        className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition-colors focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        {categoryOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

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
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">Common questions</h2>
                    <p className="text-sm leading-6 text-muted">
                      These answers cover the most common support paths and the details that make a request easier to solve.
                    </p>
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
          </Container>
        </section>
      </main>
    </div>
  );
}

function SupportOptionCard({ title, description, note }: SupportOption) {
  return (
    <Card className="h-full border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)] transition-transform duration-150 hover:-translate-y-0.5 hover:border-[var(--accent)]">
      <div className="space-y-2 p-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted">{description}</p>
        <p className="text-xs font-medium text-foreground/80">{note}</p>
      </div>
    </Card>
  );
}
