import AuthLoadingShell from "../../components/auth/AuthLoadingShell";

export default function Loading() {
  return (
    <AuthLoadingShell
      titleWidth="w-40"
      descriptionWidth="w-full max-w-sm"
    >
      <div className="space-y-3">
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
        <div className="h-4 w-28 rounded-full bg-[var(--surface-subtle)]" />
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
        <div className="h-12 rounded-2xl bg-[var(--surface-subtle)]" />
      </div>
    </AuthLoadingShell>
  );
}
