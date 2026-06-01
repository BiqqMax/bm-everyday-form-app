"use client";

import type { ReactNode, SVGProps } from "react";

import { DesktopTabProvider, useDesktopTab, type DesktopTab } from "./DesktopTabContext";

type DashboardShellProps = {
  children: ReactNode;
};

type NavIconProps = SVGProps<SVGSVGElement>;

type NavItem = {
  label: string;
  tab: DesktopTab;
  icon: (props: NavIconProps) => React.ReactNode;
};

function DashboardIcon(props: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7" height="9.5" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FormsIcon(props: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function ResponsesIcon(props: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 5c-4.418 0-8 2.686-8 6s3.582 6 8 6c.702 0 1.381-.068 2.024-.196L19 18l-1.61-3.22C18.4 13.655 20 12.41 20 11c0-3.314-3.582-6-8-6Z" />
      <path d="M9 11h.01" />
      <path d="M12 11h.01" />
      <path d="M15 11h.01" />
    </svg>
  );
}

function SettingsIcon(props: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.65 1.65 0 0 0 19.4 9c.611 0 1.136.344 1.403.845.126.236.197.506.197.795a2 2 0 1 1 0 4c0-.289-.071-.559-.197-.795A1.65 1.65 0 0 0 19.4 15Z" />
    </svg>
  );
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", tab: "overview", icon: DashboardIcon },
  { label: "Forms", tab: "forms", icon: FormsIcon },
  { label: "Responses", tab: "responses", icon: ResponsesIcon },
  { label: "Settings", tab: "settings", icon: SettingsIcon },
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
  const Icon = item.icon;

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
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border",
          isActive
            ? "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]"
            : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]"
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className={compact ? "sr-only" : "truncate"}>{item.label}</span>
    </button>
  );
}

function DashboardShellContent({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] flex-col md:flex-row">
        <aside className="hidden w-[280px] shrink-0 border-r border-[var(--border)] bg-[var(--surface)]/90 px-5 pt-10 pb-6 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:flex-col">
          <div className="space-y-8">
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
