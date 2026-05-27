import Skeleton from "../../components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid w-full max-w-[1640px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6 xl:px-8">
        <aside className="hidden lg:block">
          <Skeleton className="h-[calc(100vh-3rem)] w-full p-5">
            <div className="space-y-4">
              <Skeleton className="h-8 w-36 mb-4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-32" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Skeleton>
        </aside>

        <main className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}
