import { ReactNode } from "react";

import BrandMark from "../layout/BrandMark";
import ThemeToggle from "../theme/ThemeToggle";
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import Skeleton from "../ui/Skeleton";

type AuthLoadingShellProps = {
  titleWidth?: string;
  descriptionWidth?: string;
  children?: ReactNode;
};

export default function AuthLoadingShell({
  titleWidth = "w-56",
  descriptionWidth = "w-full max-w-md",
  children,
}: AuthLoadingShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <BrandMark href="/" />
          <ThemeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="w-full max-w-md">
            <Card className="border-border/70 bg-card shadow-sm">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  <Skeleton as="span" className={`inline-block h-8 ${titleWidth}`} />
                </CardTitle>
                <CardDescription as="div" className="text-sm leading-6 text-muted-foreground">
                  <Skeleton as="span" className={`inline-block h-4 ${descriptionWidth}`} />
                </CardDescription>
                {children ? <div>{children}</div> : null}
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </CardContent>
            </Card>

            <footer className="mt-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-[var(--shadow)]">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-4 w-3/4 max-w-xs" />
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
