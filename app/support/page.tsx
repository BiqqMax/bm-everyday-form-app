import type { Metadata } from 'next';

import SupportPageClient from '../../components/support/SupportPageClient';
import { createBreadcrumbJsonLd, createFaqJsonLd, createPageMetadata, seoJsonLdScript } from '../../lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Support',
  description: 'Get help with account access, workspaces, publishing, or technical issues in Everyday Forms.',
  path: '/support',
});

const faqJsonLd = createFaqJsonLd([
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
]);

export default function SupportPage() {
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Support', path: '/support' },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoJsonLdScript(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seoJsonLdScript(faqJsonLd) }} />
      <SupportPageClient />
    </>
  );
}
