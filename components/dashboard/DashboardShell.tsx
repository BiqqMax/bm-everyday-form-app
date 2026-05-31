"use client";

import type { ReactNode } from "react";

import { DesktopTabProvider, useDesktopTab, type DesktopTab } from "./DesktopTabContext";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  tab: DesktopTab;
  icon: string;
};

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", tab: "overview", icon: "◼" },
  { label: "Forms", tab: "forms", icon: "▣" },
  { label: "Responses", tab: "responses", icon: "◌" },
  { label: "Settings", tab: "settings", icon: "⚙" },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ShellNavLink({
  item,
  compact = false,
}: {
  item: NavItem;
  compact?: boolean;
}) {
  const { desktopTab, setDesktopTab } = useDesktopTab();
  const isActive = desktopTab === item.tab;

  const className = joinClasses(
    "group flex w-full items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-medium transition-colors",
    compact ? "justify-center" : "justify-start",
    isActive
      ? "border-[rgba(15,93,70,0.22)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)] shadow-[0_10px_30px_rgba(15,93,70,0.08)]"
      : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[rgba(15,93,70,0.18)] hover:bg-[var(--surface-subtle)]"
  );

  return (
    <button
      type="button"
      onClick={() => setDesktopTab(item.tab)}
      aria-current={isActive ? "page" : undefined}
      className={className}
    >
      <span
        className={joinClasses(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border text-sm",
          isActive
            ? "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]"
        )}
      >
        {item.icon}
      </span>
      <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>
    </button>
  );
}

function DashboardShellContent({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col md:flex-row">
        <aside className="hidden w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/90 px-5 py-6 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:flex-col">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">Everyday Forms</p>
            </div>

            <nav aria-label="Dashboard navigation" className="space-y-2">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <ShellNavLink key={item.label} item={item} />
              ))}
            </nav>
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

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <DesktopTabProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </DesktopTabProvider>
  );
}
