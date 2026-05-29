import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">{children}</div>;
}
