import BrandMark from "../../components/layout/BrandMark";
import Skeleton from "../../components/ui/Skeleton";

function PanelSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none ${className}`.trim()}>
      <Skeleton className="h-5 w-28" />
      <Skeleton className="mt-4 h-9 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-11/12" />
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-4 w-28" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="align-top">
      <td className="px-5 py-4 sm:px-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-[28rem]" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-[24rem]" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-8 w-20 rounded-full" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-8" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-4 w-28" />
      </td>
      <td className="px-5 py-4">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="px-5 py-4 text-right">
        <Skeleton className="ml-auto h-9 w-20 rounded-full" />
      </td>
    </tr>
  );
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-4 text-[var(--foreground)] lg:px-6 xl:px-8">
      <div className="mx-auto grid w-full max-w-[1640px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start">
          <div className="flex h-full flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-4">
                  <div className="animate-[auth-fade_2200ms_ease-in-out_infinite]">
                    <BrandMark href="/" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <Skeleton className="h-12 w-12 rounded-2xl" />
              </div>

              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="grid gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`nav-${index}`}
                  className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 shadow-none">
                <Skeleton className="h-3 w-20" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 shadow-none">
                <Skeleton className="h-3 w-20" />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6 pb-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-36 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full max-w-2xl" />
                <Skeleton className="h-4 w-full max-w-3xl" />
                <Skeleton className="h-4 w-5/6 max-w-2xl" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-10 w-20 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <MetricSkeleton key={`metric-${index}`} />
              ))}
            </div>
          </div>

          <section id="forms" className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-full max-w-2xl" />
              </div>

              <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-none">
                <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--border)] text-left">
                    <thead className="bg-[var(--surface-subtle)]">
                      <tr>
                        <th className="px-5 py-3 sm:px-6">
                          <Skeleton className="h-3 w-20" />
                        </th>
                        <th className="px-5 py-3">
                          <Skeleton className="h-3 w-20" />
                        </th>
                        <th className="px-5 py-3">
                          <Skeleton className="h-3 w-16" />
                        </th>
                        <th className="px-5 py-3">
                          <Skeleton className="h-3 w-24" />
                        </th>
                        <th className="px-5 py-3">
                          <Skeleton className="h-3 w-20" />
                        </th>
                        <th className="px-5 py-3 text-right">
                          <Skeleton className="ml-auto h-3 w-16" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <TableRowSkeleton key={`row-${index}`} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <PanelSkeleton className="min-h-[340px]" />
              <PanelSkeleton className="min-h-[260px]" />
            </div>
          </section>

          <section id="studio" className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-72" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            <div className="grid gap-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={`studio-${index}`} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-7 w-20 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full max-w-2xl" />
                      <Skeleton className="h-4 w-5/6 max-w-xl" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {Array.from({ length: 3 }).map((__, metricIndex) => (
                        <div key={`studio-metric-${index}-${metricIndex}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="mt-2 h-5 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                    <Skeleton className="h-5 w-40" />
                    <div className="mt-4 space-y-4">
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <Skeleton className="h-24 w-full rounded-2xl" />
                      <Skeleton className="h-12 w-full rounded-2xl" />
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-32 rounded-full" />
                        <Skeleton className="h-10 w-24 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="activity" className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`activity-${index}`} className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-56" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-7 w-24 rounded-full" />
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 2 }).map((__, answerIndex) => (
                      <div key={`answer-${index}-${answerIndex}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="mt-2 h-4 w-full" />
                        <Skeleton className="mt-2 h-4 w-5/6" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
