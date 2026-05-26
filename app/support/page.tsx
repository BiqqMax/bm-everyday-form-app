import type { Metadata } from 'next';

import SupportPageClient from '../../components/support/SupportPageClient';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support and contact options for Everyday Forms.',
};

export default function SupportPage() {
  return <SupportPageClient />;
}
