import BrandMark from '../components/layout/BrandMark';
import Container from '../components/layout/Container';
import Skeleton from '../components/ui/Skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Container className="flex min-h-screen flex-col items-center justify-center gap-8 py-12">
        <BrandMark compact showText={false} />
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </Container>
    </main>
  );
}