import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import ThemeProvider from '../components/theme/ThemeProvider';
import SiteFooter from '../components/layout/SiteFooter';
import './globals.css';

const themeBootstrap = `
(function () {
  try {
    var storageKey = 'theme';
    var storedTheme = window.localStorage.getItem(storageKey);
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : systemTheme;
    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
  } catch (error) {
    var root = document.documentElement;
    root.classList.remove('dark');
    root.dataset.theme = 'light';
    root.style.colorScheme = 'light';
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL('https://everyday-forms.example'),
  title: {
    default: 'Everyday Forms',
    template: '%s | Everyday Forms',
  },
  description: 'Dependable forms and workflow software for everyday use.',
  applicationName: 'Everyday Forms',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Everyday Forms',
    description: 'Dependable forms and workflow software for everyday use.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Everyday Forms',
    description: 'Dependable forms and workflow software for everyday use.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: '#0F5D46',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <Script id="theme-bootstrap" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
