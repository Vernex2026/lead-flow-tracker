import { Skeleton } from "@/components/ui/skeleton";

export function RouteFallback() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Ładowanie strony"
      className="flex h-screen flex-col bg-bg"
    >
      <header className="h-12 shrink-0 border-b border-border bg-surface/80 px-4 md:px-6">
        <div className="flex h-full items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-4 w-40 rounded" />
        </div>
      </header>
      <main className="flex-1 px-4 pt-6 md:px-8">
        <Skeleton className="h-7 w-32 rounded" />
        <Skeleton className="mt-2 h-4 w-64 rounded" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Skeleton className="h-44 w-full rounded-lg" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-7">
            <Skeleton className="h-[60vh] w-full rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
