import AuthLoadingShell from "../../../components/auth/AuthLoadingShell";

export default function Loading() {
  return (
    <AuthLoadingShell
      titleWidth="w-52"
      descriptionWidth="w-full max-w-sm"
    >
      <div className="space-y-3">
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-28 rounded-full bg-[var(--surface-subtle)]" />
          <div className="h-4 w-28 rounded-full bg-[var(--surface-subtle)]" />
        </div>
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
      </div>
    </AuthLoadingShell>
  );
}
