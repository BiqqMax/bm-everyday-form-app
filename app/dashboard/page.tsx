import Card from "../../components/ui/Card";
import Container from "../../components/layout/Container";
import LogoutButton from "../../components/auth/LogoutButton";
import { getServerSupabaseClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Container className="py-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--muted)]">Teacher dashboard</p>
              <h1 className="text-2xl font-semibold">Welcome back</h1>
            </div>
            <LogoutButton />
          </div>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Signed in session</h2>
            <p className="text-sm text-[var(--muted)]">
              {user?.email ? `Authenticated as ${user.email}` : "Authenticated session active."}
            </p>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Next steps</h2>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li>• Create or manage classroom forms</li>
              <li>• Share public links with students</li>
              <li>• Review submissions and QR sharing flows</li>
            </ul>
          </Card>
        </div>
      </Container>
    </main>
  );
}
