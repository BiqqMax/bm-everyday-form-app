import Skeleton from "../../components/ui/Skeleton";
import type { ReactNode } from "react";

function PanelSkeleton({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return <Skeleton className={`rounded-2xl ${className}`}>{children}</Skeleton>;
}

function Line({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 rounded-full ${className}`} />;
}

function TableRowSkeleton() {
  return (
    <tr className="border-t border-[var(--border)]">
      <td className="px-5 py-4 sm:px-6">
        <div className="space-y-2">
          <Line className="w-56 max-w-full" />
          <Line className="w-[min(100%,28rem)]" />
        </div>
      </td>
      <td className="px-5 py-4">
        <Line className="w-20" />
      </td>
      <td className="px-5 py-4">
        <Line className="w-12" />
      </td>
      <td className="px-5 py-4">
        <Line className="w-24" />
      </td>
      <td className="px-5 py-4">
        <Line className="w-24" />
      </td>
      <td className="px-5 py-4 text-right">
        <Line className="ml-auto w-14" />
      </td>
    </tr>
  );
}

function SubmissionSkeleton() {
  return (
    <PanelSkeleton className="border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Line className="w-48" />
            <Line className="w-32" />
          </div>
          <Line className="w-24" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <PanelSkeleton className="h-28 bg-[var(--surface-subtle)]" />
          <PanelSkeleton className="h-28 bg-[var(--surface-subtle)]" />
        </div>
      </div>
    </PanelSkeleton>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1640px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
          <div className="flex h-full flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <PanelSkeleton className="h-40 bg-[var(--surface-subtle)]" />
            <div className="space-y-2">
              <Line className="w-40" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-12 bg-[var(--surface-subtle)]" />
            </div>
            <PanelSkeleton className="h-36 bg-[var(--surface-subtle)]" />
            <PanelSkeleton className="h-24 bg-[var(--surface-subtle)]" />
          </div>
        </aside>

        <main className="space-y-6 pb-6">
          <PanelSkeleton className="border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-44 rounded-full bg-[var(--surface-subtle)]" />
                  <Skeleton className="h-7 w-36 rounded-full bg-[var(--surface-subtle)]" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-10 w-[min(100%,42rem)] bg-[var(--surface-subtle)]" />
                  <Skeleton className="h-10 w-[min(100%,36rem)] bg-[var(--surface-subtle)]" />
                </div>
                <Line className="w-[min(100%,38rem)]" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-11 w-24 rounded-full bg-[var(--surface-subtle)]" />
                <Skeleton className="h-11 w-24 rounded-full bg-[var(--surface-subtle)]" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PanelSkeleton className="h-32 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-32 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-32 bg-[var(--surface-subtle)]" />
              <PanelSkeleton className="h-32 bg-[var(--surface-subtle)]" />
            </div>
          </PanelSkeleton>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Line className="w-28" />
                <Skeleton className="h-8 w-72 bg-[var(--surface-subtle)]" />
                <Line className="w-[min(100%,44rem)]" />
              </div>

              <PanelSkeleton className="overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
                <div className="border-b border-[var(--border)] px-5 py-4">
                  <Line className="w-44" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
                      <tr>
                        <th className="px-5 py-3"><Line className="w-20" /></th>
                        <th className="px-5 py-3"><Line className="w-20" /></th>
                        <th className="px-5 py-3"><Line className="w-16" /></th>
                        <th className="px-5 py-3"><Line className="w-24" /></th>
                        <th className="px-5 py-3"><Line className="w-24" /></th>
                        <th className="px-5 py-3"><Line className="ml-auto w-14" /></th>
                      </tr>
                    </thead>
                    <tbody>
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                      <TableRowSkeleton />
                    </tbody>
                  </table>
                </div>
              </PanelSkeleton>
            </div>

            <div className="space-y-6">
              <PanelSkeleton className="border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="space-y-4">
                  <Line className="w-24" />
                  <Skeleton className="h-8 w-64 bg-[var(--surface-subtle)]" />
                  <Line className="w-[min(100%,28rem)]" />
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-2xl bg-[var(--surface-subtle)]" />
                    <Skeleton className="h-28 w-full rounded-2xl bg-[var(--surface-subtle)]" />
                    <Skeleton className="h-12 w-full rounded-2xl bg-[var(--surface-subtle)]" />
                    <div className="flex gap-3">
                      <Skeleton className="h-11 w-40 rounded-full bg-[var(--surface-subtle)]" />
                      <Skeleton className="h-11 w-28 rounded-full bg-[var(--surface-subtle)]" />
                    </div>
                  </div>
                </div>
              </PanelSkeleton>

              <PanelSkeleton className="border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="space-y-4">
                  <Line className="w-24" />
                  <Skeleton className="h-7 w-44 bg-[var(--surface-subtle)]" />
                  <div className="space-y-3">
                    <PanelSkeleton className="h-24 bg-[var(--surface-subtle)]" />
                    <PanelSkeleton className="h-24 bg-[var(--surface-subtle)]" />
                    <PanelSkeleton className="h-24 bg-[var(--surface-subtle)]" />
                  </div>
                </div>
              </PanelSkeleton>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <Line className="w-28" />
              <Skeleton className="h-8 w-72 bg-[var(--surface-subtle)]" />
              <Line className="w-[min(100%,44rem)]" />
            </div>
            <div className="grid gap-4">
              <SubmissionSkeleton />
              <SubmissionSkeleton />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}