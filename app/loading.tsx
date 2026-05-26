import BrandMark from "../components/layout/BrandMark";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="auth-fade">
          <BrandMark className="justify-center" />
        </div>

        <div className="w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-subtle)]" aria-hidden="true">
            <div className="auth-progress h-full w-full origin-left rounded-full bg-[var(--accent)]" />
          </div>
        </div>
      </div>
    </main>
  );
}
