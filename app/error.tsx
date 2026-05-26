'use client';

import BrandMark from '../components/layout/BrandMark';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)] antialiased">
      <Container className="flex w-full max-w-xl flex-col items-center gap-6 py-12 text-center">
        <BrandMark href="/" className="justify-center" />
        <div className="w-full rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-left shadow-[var(--shadow)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Error</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{error.message}</p>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={reset}>
              Retry
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
