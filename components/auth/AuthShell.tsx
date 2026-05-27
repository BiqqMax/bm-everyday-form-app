import type { ReactNode } from "react";

import BrandMark from "../layout/BrandMark";
import ThemeToggle from "../theme/ThemeToggle";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <BrandMark href="/" />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-md">
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold tracking-tight">{title}</CardTitle>
                {description ? <CardDescription className="text-sm leading-6 text-muted-foreground">{description}</CardDescription> : null}
              </CardHeader>
              <CardContent className="space-y-6">{children}</CardContent>
            </Card>

            {footer ? (
              <footer className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow)]">
                {footer}
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
