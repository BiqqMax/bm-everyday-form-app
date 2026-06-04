import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import ThemeProvider from '../components/theme/ThemeProvider';
import { AuthBootProvider } from '../components/auth/AuthBootProvider';
import AppShell from '../components/layout/AppShell';
import { siteUrl } from '../lib/supabase/env';
import './globals.css';

const LIGHT_BACKGROUND = '#f8fafc';
const LIGHT_FOREGROUND = '#0f172a';
const DARK_BACKGROUND = '#0b1110';
const DARK_FOREGROUND = '#f8fafc';

const criticalPaintStyles = `
  html {
    background-color: ${LIGHT_BACKGROUND};
    color: ${LIGHT_FOREGROUND};
  }

  body {
    background-color: ${LIGHT_BACKGROUND};
    color: ${LIGHT_FOREGROUND};
    min-height: 100vh;
  }

  @media (prefers-color-scheme: dark) {
    html {
      background-color: ${DARK_BACKGROUND};
      color: ${DARK_FOREGROUND};
    }

    body {
      background-color: ${DARK_BACKGROUND};
      color: ${DARK_FOREGROUND};
    }
  }

  html.dark {
    background-color: ${DARK_BACKGROUND};
    color: ${DARK_FOREGROUND};
  }

  html.dark body {
    background-color: ${DARK_BACKGROUND};
    color: ${DARK_FOREGROUND};
  }
`;

const themeBootstrap = `
(function () {
  try {
    var storageKey = 'theme';
    var storedTheme = window.localStorage.getItem(storageKey);
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var theme = storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : systemTheme;
    var root = document.documentElement;
    var body = document.body;
    var isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.style.backgroundColor = isDark ? '${DARK_BACKGROUND}' : '${LIGHT_BACKGROUND}';
    root.style.color = isDark ? '${DARK_FOREGROUND}' : '${LIGHT_FOREGROUND}';

    if (body) {
      body.style.backgroundColor = isDark ? '${DARK_BACKGROUND}' : '${LIGHT_BACKGROUND}';
      body.style.color = isDark ? '${DARK_FOREGROUND}' : '${LIGHT_FOREGROUND}';
    }
  } catch (error) {
    var root = document.documentElement;
    var body = document.body;

    root.classList.remove('dark');
    root.dataset.theme = 'light';
    root.style.colorScheme = 'light';
    root.style.backgroundColor = '${LIGHT_BACKGROUND}';
    root.style.color = '${LIGHT_FOREGROUND}';

    if (body) {
      body.style.backgroundColor = '${LIGHT_BACKGROUND}';
      body.style.color = '${LIGHT_FOREGROUND}';
    }
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      style={{ backgroundColor: LIGHT_BACKGROUND, color: LIGHT_FOREGROUND }}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalPaintStyles }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className="min-h-screen bg-background text-foreground antialiased"
        style={{ backgroundColor: LIGHT_BACKGROUND, color: LIGHT_FOREGROUND, minHeight: '100vh' }}
      >
        <ThemeProvider>
          <AuthBootProvider>
            <AppShell>{children}</AppShell>
          </AuthBootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
