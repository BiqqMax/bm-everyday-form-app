import MainNav from "../components/layout/MainNav";
import Container from "../components/layout/Container";
import Card from "../components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1 w-full py-8">
        <Container>
          <Card>
            <h1 className="text-2xl font-semibold">Welcome to Everyday Forms</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Create and share forms with your students — simple and secure.</p>
          </Card>
        </Container>
      </main>
    </div>
  );
}
