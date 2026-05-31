"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "◼" },
  { label: "Forms", href: "/dashboard#forms", icon: "▣" },
  { label: "Responses", href: "/dashboard#responses", icon: "◌" },
  { label: "Analytics", href: "/dashboard#analytics", icon: "◈" },
  { label: "Settings", href: "/settings", icon: "⚙" },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, href: string) {
  const [basePath] = href.split("#");
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

function ShellNavLink({
  item,
  compact = false,
}: {
  item: NavItem;
  compact?: boolean;
}) {
  const pathname = usePathname();
  const active = isActivePath(pathname, item.href);

  const className = joinClasses(
    "group flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium transition-colors",
    compact ? "justify-center" : "justify-start",
    active
      ? "border-[rgba(15,93,70,0.22)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)] shadow-[0_10px_30px_rgba(15,93,70,0.08)]"
      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[rgba(15,93,70,0.18)] hover:bg-[var(--surface-subtle)]"
  );

  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
      <span
        className={joinClasses(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border text-sm",
          active
            ? "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]"
        )}
      >
        {item.icon}
      </span>
      <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>
    </Link>
  );
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col lg:flex-row">
        <aside className="hidden w-[300px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/90 px-5 py-6 backdrop-blur lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">Everyday Forms</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Dashboard shell</h1>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                A calm workspace frame for forms, responses, and workspace settings.
              </p>
            </div>

            <nav aria-label="Dashboard navigation" className="space-y-2">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <ShellNavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Workspace</p>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">Persistent shell</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Desktop navigation stays visible while the dashboard content renders unchanged.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
