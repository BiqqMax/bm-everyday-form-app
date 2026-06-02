"use client";

import { createContext, useActionState, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type SVGProps } from "react";
import { useRouter } from "next/navigation";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import type { CreateFormActionState, DashboardActionState } from "../../lib/dashboard/actions";
import { createFormAction, deleteFormAction, updateFormAction, updateFormLifecycleAction } from "../../lib/dashboard/actions";
import { CreateFormSuccessScreen, StepBasicInfo, StepFieldBuilder, StepReview, type CreateFormWizardField } from "./CreateFormModalSteps";
import { buildPublicFormUrl, getShareStatus, getShareStatusLabel } from "../../lib/forms/public";
import type { DashboardData, DashboardForm, DashboardSubmission } from "../../lib/dashboard/dashboard";
import type { SettingsData } from "../../lib/settings/data";
import ShareModal from "./ShareModal";
import { useDesktopTab } from "./DesktopTabContext";
import { MobileSettingsPanel, WorkspaceSettings } from "./SettingsPanels";

type DashboardSource = DashboardData & Record<string, unknown>;
type MobileTab = "home" | "forms" | "responses" | "settings";
type FormVisibilityFilter = "all" | "public" | "private";
type ShareTarget = {
  form: DashboardForm;
  shareUrl: string;
};

type ToastTone = "success" | "error";

type ToastMessage = {
  id: number;
  message: string;
  tone: ToastTone;
};

const initialActionState: DashboardActionState = {
  status: "idle",
  message: "",
};

const createInitialActionState: CreateFormActionState = {
  status: "idle",
  message: "",
};

type CreatedFormIdentity = {
  formId: string;
  publicToken: string;
};

type DashboardToastContextValue = {
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
};

const DashboardToastContext = createContext<DashboardToastContextValue | null>(null);
let toastSequence = 0;

type NavIconProps = SVGProps<SVGSVGElement>;

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

const MOBILE_TABS: Array<{ id: MobileTab; label: string; icon: (props: NavIconProps) => ReactNode }> = [
  { id: "home", label: "Home", icon: DashboardIcon },
  { id: "forms", label: "Forms", icon: FormsIcon },
  { id: "responses", label: "Responses", icon: ResponsesIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function useDashboardToast() {
  const context = useContext(DashboardToastContext);

  if (!context) {
    throw new Error("useDashboardToast must be used within the dashboard toast provider.");
  }

  return context;
}

function DashboardToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = ++toastSequence;
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const contextValue = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <DashboardToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed right-4 top-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={joinClasses(
              "pointer-events-auto rounded-[1rem] border px-4 py-3 text-sm font-medium shadow-[var(--shadow)]",
              toast.tone === "error"
                ? "border-[rgba(127,29,29,0.18)] bg-[#fff7f7] text-[#7f1d1d]"
                : "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]"
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </DashboardToastContext.Provider>
  );
}

function firstText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function formatDateLong(value: string | null) {
  if (!value) return "No submissions yet";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function averagePerForm(totalSubmissions: number, totalForms: number) {
  if (!totalForms) return 0;
  return totalSubmissions / totalForms;
}

function ActionMessage({ state }: { state: DashboardActionState }) {
  const { pushToast } = useDashboardToast();
  const lastToastKey = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "idle" || !state.message) {
      lastToastKey.current = null;
      return;
    }

    const toastKey = `${state.status}:${state.message}`;

    if (lastToastKey.current === toastKey) {
      return;
    }

    lastToastKey.current = toastKey;
    pushToast({
      message: state.message,
      tone: state.status === "error" ? "error" : "success",
    });
  }, [pushToast, state.message, state.status]);

  return null;
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
      <div className="space-y-4">
        <div className="inline-flex rounded-full border border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
          Empty state
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Button href={actionHref} variant="secondary" size="sm" className="w-fit">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  meta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      </div>
      {meta ? <p className="text-sm text-[var(--muted-foreground)] sm:text-right">{meta}</p> : null}
    </div>
  );
}




function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{label}</p>
        <p className="text-[1.65rem] font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </Card>
  );
}

function CompactStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{label}</p>
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{value}</p>
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">{hint}</p>
      </div>
    </Card>
  );
}

function VisibilityBadge({ isPublic }: { isPublic: boolean }) {
  return <span className="text-xs font-medium text-[var(--muted-foreground)]">{isPublic ? "Public" : "Private"}</span>;
}

function SubmissionPreviewCard({ submission }: { submission: DashboardSubmission }) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
          </div>
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]">
            {submission.answers.length} answers
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {submission.answers.length ? (
            submission.answers.map((answer) => (
              <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                <p className="mt-2 break-words text-sm leading-6 text-[var(--foreground)]">{answer.value || "—"}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm text-[var(--muted-foreground)]">
              This submission did not include captured answers.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function SubmissionsList({ submissions }: { submissions: DashboardSubmission[] }) {
  if (!submissions.length) {
    return (
      <EmptyState
        title="No recent submissions"
        description="Responses will appear here as learners submit your published forms."
      />
    );
  }

  return <div className="space-y-4">{submissions.map((submission) => <SubmissionPreviewCard key={submission.id} submission={submission} />)}</div>;
}

function RecentFormsList({ forms }: { forms: DashboardForm[] }) {
  if (!forms.length) {
    return (
      <EmptyState
        title="No forms yet"
        description="Create your first form to start collecting responses."
      />
    );
  }

  return (
    <div className="space-y-3">
      {forms.map((form) => (
        <Card key={form.id} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
                <VisibilityBadge isPublic={form.isPublic} />
              </div>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                {form.description || "A focused form ready for your next workflow."}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Fields</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{form.fieldCount}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Responses</p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">{form.submissionCount}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Updated</p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDateLong(form.updatedAt)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Last</p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{form.lastSubmissionAt ? formatDateLong(form.lastSubmissionAt) : "None"}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FormsSearchBar({
  query,
  onQueryChange,
  visibilityFilter,
  onVisibilityFilterChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  visibilityFilter: FormVisibilityFilter;
  onVisibilityFilterChange: (value: FormVisibilityFilter) => void;
}) {
  return (
    <Card className="border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-none">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <Input label="Search forms" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search title or description" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "All", value: "all" as const },
            { label: "Public", value: "public" as const },
            { label: "Private", value: "private" as const },
          ].map((item) => {
            const isActive = visibilityFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onVisibilityFilterChange(item.value)}
                className={joinClasses(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.08em] transition",
                  isActive
                    ? "border-[rgba(15,93,70,0.24)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]"
                    : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] hover:border-[rgba(15,93,70,0.2)] hover:bg-[rgba(15,93,70,0.06)]"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5h.01" />
      <path d="M12 12h.01" />
      <path d="M12 19h.01" />
    </svg>
  );
}

function FormCard({
  form,
  onOpen,
  onShare,
}: {
  form: DashboardForm;
  onOpen: (form: DashboardForm) => void;
  onShare: (form: DashboardForm) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [lifecycleState, lifecycleAction, isLifecyclePending] = useActionState(updateFormLifecycleAction, initialActionState);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteFormAction, initialActionState);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const actionButtonClassName = "h-8 px-3 text-xs";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (lifecycleState.status === "success") {
      setSettingsOpen(false);
    }
  }, [lifecycleState.status]);

  useEffect(() => {
    if (deleteState.status === "success") {
      setDeleteOpen(false);
    }
  }, [deleteState.status]);

  const visibilityAction = form.isPublic ? "private" : "public";
  const lifecycleActionKind = form.expiresAt ? "resume" : "pause";
  const lifecycleActionLabel = form.expiresAt ? "Resume sharing" : "Pause sharing";

  return (
    <>
      <Card className="border-[var(--border)] bg-[var(--surface)] px-4 py-4 shadow-none transition-colors hover:bg-[var(--surface-subtle)]">
        <div className="space-y-2.5 md:hidden">
          <div className="flex min-w-0 items-baseline gap-2">
            <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
            <VisibilityBadge isPublic={form.isPublic} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[var(--muted-foreground)]">
              <span>{form.submissionCount} responses</span>
              <span>{formatDateLong(form.updatedAt)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)} className={actionButtonClassName}>
                Edit
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)} className={actionButtonClassName}>
                Share
              </Button>

              <div ref={menuRef} className="relative">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="h-8 px-3"
                  aria-label={`More actions for ${form.title}`}
                  aria-expanded={menuOpen}
                >
                  More
                </Button>

                {menuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteOpen(true);
                      }}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-[#b42318] transition hover:bg-[rgba(180,35,24,0.08)]"
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center md:gap-x-4">
          <div className="min-w-0 flex items-baseline gap-2">
            <p className="min-w-0 truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
            <VisibilityBadge isPublic={form.isPublic} />
          </div>

          <p className="text-sm text-[var(--muted-foreground)]">{form.submissionCount} responses</p>
          <p className="text-sm text-[var(--muted-foreground)]">{formatDateLong(form.updatedAt)}</p>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)} className={actionButtonClassName}>
              Edit
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)} className={actionButtonClassName}>
              Share
            </Button>

            <div ref={menuRef} className="relative">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setMenuOpen((current) => !current)}
                className="h-8 px-3"
                aria-label={`More actions for ${form.title}`}
                aria-expanded={menuOpen}
              >
                More
              </Button>

              {menuOpen ? (
                <div className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setSettingsOpen(true);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-subtle)]"
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      setDeleteOpen(true);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-[#b42318] transition hover:bg-[rgba(180,35,24,0.08)]"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title={`${form.title} settings`}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Control publishing and lifecycle settings from the dashboard list.
          </p>

          <form action={lifecycleAction} className="space-y-3">
            <input type="hidden" name="formId" value={form.id} />

            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="submit" name="visibility" value={visibilityAction} variant="secondary" size="sm">
                {form.isPublic ? "Make private" : "Publish"}
              </Button>
              <Button type="submit" name="actionKind" value={lifecycleActionKind} variant="secondary" size="sm">
                {lifecycleActionLabel}
              </Button>
              <Button type="submit" name="actionKind" value="archive" variant="secondary" size="sm" className="sm:col-span-2">
                Archive form
              </Button>
            </div>

            <ActionMessage state={lifecycleState} />
          </form>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={`Delete "${form.title}"?`}>
        <div className="space-y-4">
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">This cannot be undone.</p>

          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
                event.preventDefault();
              }
            }}
            className="space-y-4"
          >
            <input type="hidden" name="formId" value={form.id} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="secondary" size="sm" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isDeletePending}>
                {isDeletePending ? "Deleting..." : "Delete form"}
              </Button>
            </div>

            <ActionMessage state={deleteState} />
          </form>
        </div>
      </Modal>
    </>
  );
}

function FormsTable({
  forms,
  onOpen,
  onShare,
}: {
  forms: DashboardForm[];
  onOpen: (form: DashboardForm) => void;
  onShare: (form: DashboardForm) => void;
}) {
  if (!forms.length) {
    return (
      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-none">
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">No forms yet</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Your forms will appear here once you create your first form.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-2.5">
      {forms.map((form) => (
        <FormCard key={form.id} form={form} onOpen={onOpen} onShare={onShare} />
      ))}
    </div>
  );
}

function CreateFormModalContent({
  onClose,
  onRestart,
  onManageCreatedForm,
  onShareCreatedForm,
  step,
  setStep,
}: {
  onClose: () => void;
  onRestart: () => void;
  onManageCreatedForm: (identity: CreatedFormIdentity | null) => void;
  onShareCreatedForm: (identity: CreatedFormIdentity | null) => void;
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [fields, setFields] = useState<CreateFormWizardField[]>([]);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [fieldFocusPulseKey, setFieldFocusPulseKey] = useState(0);
  const [titleTouched, setTitleTouched] = useState(false);
  const [step1Attempted, setStep1Attempted] = useState(false);
  const [step2Attempted, setStep2Attempted] = useState(false);
  const [createSucceeded, setCreateSucceeded] = useState(false);
  const [createdFormIdentity, setCreatedFormIdentity] = useState<CreatedFormIdentity | null>(null);
  const fieldListRegionRef = useRef<HTMLDivElement | null>(null);

  const isStep1 = step === 1;
  const isStep2 = step === 2;
  const isStep3 = step === 3;
  const isSuccess = createSucceeded;

  const isTitleValid = title.trim().length > 0;
  const hasFields = fields.length > 0;
  const titleError = !isTitleValid && (titleTouched || step1Attempted) ? "A form title is required." : undefined;
  const fieldsError = !hasFields && step2Attempted ? "Add at least one field to continue." : undefined;
  const canGoNext = isStep1 ? isTitleValid : isStep2 ? hasFields : true;
  const canCreate = isTitleValid && hasFields;

  const focusField = (id: string) => {
    setActiveFieldId(id);
    setFieldFocusPulseKey((current) => current + 1);
  };

  const addField = () => {
    const id = `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setFields((current) => [
      ...current,
      {
        id,
        type: "text",
        label: "",
        required: false,
      },
    ]);
    focusField(id);
  };

  const updateField = (id: string, updates: Partial<CreateFormWizardField>) => {
    setFields((current) => current.map((field) => (field.id === id ? { ...field, ...updates } : field)));
  };

  const removeField = (id: string) => {
    setFields((current) => {
      const removeIndex = current.findIndex((field) => field.id === id);
      const nextFields = current.filter((field) => field.id !== id);

      if (activeFieldId === id) {
        const nextActiveField =
          nextFields[removeIndex] ?? nextFields[removeIndex - 1] ?? nextFields[0] ?? null;

        setActiveFieldId(nextActiveField?.id ?? null);

        if (nextActiveField) {
          setFieldFocusPulseKey((currentKey) => currentKey + 1);
        }
      } else if (activeFieldId && !nextFields.some((field) => field.id === activeFieldId)) {
        const fallbackActiveField = nextFields[removeIndex] ?? nextFields[removeIndex - 1] ?? nextFields[0] ?? null;
        setActiveFieldId(fallbackActiveField?.id ?? null);

        if (fallbackActiveField) {
          setFieldFocusPulseKey((currentKey) => currentKey + 1);
        }
      }

      return nextFields;
    });
  };

  const goBack = () => {
    if (step > 1) {
      setStep(((step - 1) as 1 | 2 | 3));
    }
  };

  const goNext = () => {
    if (isStep1) {
      setTitleTouched(true);
      setStep1Attempted(true);

      if (!isTitleValid) {
        return;
      }
    }

    if (isStep2) {
      setStep2Attempted(true);

      if (!hasFields) {
        return;
      }
    }

    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    }
  };

  const handleManageForm = () => {
    onManageCreatedForm(createdFormIdentity);
  };

  const handleShareForm = () => {
    onShareCreatedForm(createdFormIdentity);
  };

  const handleCreateAnother = () => {
    setCreateSucceeded(false);
    onRestart();
  };

  const handleCreateSuccess = (identity: CreatedFormIdentity) => {
    setCreatedFormIdentity(identity);
    setCreateSucceeded(true);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="shrink-0 border-b border-[var(--border)] px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">{isSuccess ? "Success" : `Step ${step}`}</p>
            <h2 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              {isSuccess ? "Form created" : isStep1 ? "Basic Info" : isStep2 ? "Build Form" : "Review Form"}
            </h2>
            <p className="text-sm leading-5 text-[var(--muted-foreground)]">
              {isSuccess
                ? "Your form is ready to receive responses."
                : isStep1
                  ? "Set the form title and description."
                  : isStep2
                    ? "Add and configure fields."
                    : "Review everything before publishing."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create form modal"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {isSuccess ? (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <CreateFormSuccessScreen
            title={title || "Untitled form"}
            formId={createdFormIdentity?.formId ?? ""}
            publicToken={createdFormIdentity?.publicToken ?? ""}
            onManageForm={handleManageForm}
            onShareForm={handleShareForm}
            onCreateAnother={handleCreateAnother}
          />
        </div>
      ) : isStep3 ? (
        <CreateFormSubmissionStep
          title={title}
          description={description}
          isPublic={isPublic}
          fields={fields}
          canCreate={canCreate}
          onBack={goBack}
          onCreateSuccess={handleCreateSuccess}
        />
      ) : (
        <>
          {isStep2 ? (
            <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-5">
              <StepFieldBuilder
                fields={fields}
                activeFieldId={activeFieldId}
                focusPulseKey={fieldFocusPulseKey}
                onActivateField={focusField}
                addField={addField}
                updateField={updateField}
                removeField={removeField}
                listRegionRef={(node) => {
                  fieldListRegionRef.current = node;
                }}
              />
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <StepBasicInfo
                title={title}
                description={description}
                isPublic={isPublic}
                titleError={titleError}
                onTitleChange={(value) => {
                  setTitle(value);
                  if (!titleTouched) {
                    setTitleTouched(true);
                  }
                }}
                onDescriptionChange={setDescription}
                onIsPublicChange={setIsPublic}
              />
            </div>
          )}

          <footer className="shrink-0 border-t border-[var(--border)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm leading-5 text-[#b42318]">
                {isStep1 && titleError ? titleError : null}
                {isStep2 && fieldsError ? fieldsError : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {isStep1 ? (
                  <Button type="button" onClick={goNext} disabled={!canGoNext} className="sm:min-w-44">
                    Next
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="secondary" onClick={goBack} className="sm:min-w-44">
                      Back
                    </Button>
                    <Button type="button" onClick={goNext} disabled={!canGoNext} className="sm:min-w-44">
                      Next
                    </Button>
                  </>
                )}
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

function CreateFormSubmissionStep({
  title,
  description,
  isPublic,
  fields,
  canCreate,
  onBack,
  onCreateSuccess,
}: {
  title: string;
  description: string;
  isPublic: boolean;
  fields: CreateFormWizardField[];
  canCreate: boolean;
  onBack: () => void;
  onCreateSuccess: (identity: CreatedFormIdentity) => void;
}) {
  const [state, formAction, isPending] = useActionState(createFormAction, createInitialActionState);
  const successReportedRef = useRef(false);

  useEffect(() => {
    if (state.status === "success") {
      if (!successReportedRef.current) {
        successReportedRef.current = true;
        onCreateSuccess({
          formId: state.formId,
          publicToken: state.publicToken,
        });
      }

      return;
    }

    successReportedRef.current = false;
  }, [onCreateSuccess, state]);

  return (
    <form action={formAction} className="flex h-full min-h-0 flex-col gap-3">
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="isPublic" value={String(isPublic)} />
      <input type="hidden" name="fields" value={JSON.stringify(fields)} />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <StepReview title={title} description={description} isPublic={isPublic} fields={fields} />
      </div>

      <footer className="shrink-0 border-t border-[var(--border)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm leading-5 text-[#b42318]">{!canCreate ? "Add a title and at least one field before creating." : null}</div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button type="button" variant="secondary" onClick={onBack} className="sm:min-w-44">
              Back
            </Button>
            <Button type="submit" disabled={isPending || !canCreate} className="sm:min-w-44">
              {isPending ? "Creating..." : "Create form"}
            </Button>
          </div>
        </div>
        <ActionMessage state={state} />
      </footer>
    </form>
  );
}

function CreateFormModal({
  open,
  onClose,
  onCreateAnother,
  onManageCreatedForm,
  onShareCreatedForm,
  formKey,
}: {
  open: boolean;
  onClose: () => void;
  onCreateAnother: () => void;
  onManageCreatedForm: (identity: CreatedFormIdentity | null) => void;
  onShareCreatedForm: (identity: CreatedFormIdentity | null) => void;
  formKey: number;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open, formKey]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Create form"
        className="flex h-[100dvh] w-full flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--shadow)] sm:h-auto sm:max-h-[88dvh] sm:max-w-lg sm:rounded-[var(--radius-xl)]"
      >
        <CreateFormModalContent
          key={formKey}
          onClose={onClose}
          onRestart={onCreateAnother}
          onManageCreatedForm={onManageCreatedForm}
          onShareCreatedForm={onShareCreatedForm}
          step={step}
          setStep={setStep}
        />
      </section>
    </div>
  );
}

function EditFormCard({
  form,
  onOpen,
  onEdit,
  onShare,
  onDelete,
}: {
  form: DashboardForm;
  onOpen: (form: DashboardForm) => void;
  onEdit: (form: DashboardForm) => void;
  onShare: (form: DashboardForm) => void;
  onDelete: (form: DashboardForm) => void;
}) {
  const [state, formAction, isPending] = useActionState(updateFormAction, initialActionState);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteFormAction, initialActionState);

  return (
    <Card id={`form-${form.id}`} className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{form.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <VisibilityBadge isPublic={form.isPublic} />
              <span>{form.submissionCount} responses</span>
              <span>{formatDateLong(form.updatedAt)}</span>
            </div>
            <p className="truncate text-sm leading-6 text-[var(--muted-foreground)]">
              {form.description || "No description provided."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => onOpen(form)}>Open</Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => onShare(form)}>Share</Button>
          </div>
        </div>

        <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--foreground)]">Edit</summary>
          <div className="border-t border-[var(--border)] p-4">
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="formId" value={form.id} />
              <Input name="title" label="Title" defaultValue={form.title} required />
              <label className="block text-sm">
                <span className="mb-2 block text-sm font-medium text-[var(--muted-foreground)]">Description</span>
                <textarea
                  name="description"
                  rows={4}
                  defaultValue={form.description ?? ""}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  name="isPublic"
                  defaultChecked={form.isPublic}
                  className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0"
                />
                Public form
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" disabled={isPending} className="sm:min-w-44">
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
                <ActionMessage state={state} />
              </div>
            </form>

            <form
              action={deleteAction}
              onSubmit={(event) => {
                if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
                  event.preventDefault();
                }
              }}
              className="mt-4 space-y-3 border-t border-[var(--border)] pt-4"
            >
              <input type="hidden" name="formId" value={form.id} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" variant="secondary" disabled={isDeletePending}>
                  {isDeletePending ? "Deleting..." : "Delete form"}
                </Button>
                <ActionMessage state={deleteState} />
              </div>
            </form>
          </div>
        </details>
      </div>
    </Card>
  );
}

function WorkspaceOverview({
  data,
  userEmail,
}: {
  data: DashboardData;
  userEmail?: string | null;
}) {
  const { setDesktopTab } = useDesktopTab();
  const source = data as DashboardSource;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const displayName = firstText(source.name, source.fullName, userEmail ? userEmail.split("@")[0] : "", "User");
  const activeForms = data.forms.filter((form) => form.isPublic).length;
  const recentResponses = data.recentSubmissions.slice(0, 2);

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Overview</p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {greeting}, {displayName}
          </h2>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            {data.forms.length === 0 ? "Create your first form to get started." : "You have active forms in your workspace."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Forms",
            value: String(data.summary.totalForms),
            hint: "Workspace total",
          },
          {
            label: "Responses",
            value: String(data.summary.totalSubmissions),
            hint: "Collected so far",
          },
          {
            label: "Active",
            value: String(activeForms),
            hint: "Ready to share",
          },
          {
            label: "Rate",
            value: data.summary.totalForms ? `${averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1)}x` : "0x",
            hint: "Per form",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-none">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{stat.label}</p>
              <p className="text-[1.05rem] font-semibold tracking-tight text-[var(--foreground)]">{stat.value}</p>
              <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="inline-flex flex-wrap items-center gap-2">
          <Button onClick={() => setDesktopTab("forms")} className="w-fit px-4">
            Create Form
          </Button>
          <Button variant="secondary" size="sm" className="w-fit px-4" onClick={() => setDesktopTab("forms")}>
            View Forms
          </Button>
        </div>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Recent responses</p>

          <div className="space-y-2">
            {recentResponses.length ? (
              recentResponses.map((submission) => (
                <Card key={submission.id} className="border-[var(--border)] bg-[var(--surface-subtle)] p-3 shadow-none">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
                        <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-medium text-[var(--muted-foreground)]">
                        {submission.answers.length} answer{submission.answers.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {submission.answers.slice(0, 2).map((answer) => (
                        <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-[var(--foreground)]">{answer.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-center">
                <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">No recent responses</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Responses will appear as a quick activity snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}


function WorkspaceForms({
  data,
  onShareForm,
  onOpenCreateForm,
  onEditForm,
}: {
  data: DashboardData;
  onShareForm: (form: DashboardForm) => void;
  onOpenCreateForm: () => void;
  onEditForm: (form: DashboardForm) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<FormVisibilityFilter>("all");

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.forms.filter((form) => {
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        (form.description ?? "").toLowerCase().includes(normalizedQuery);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && form.isPublic) ||
        (visibilityFilter === "private" && !form.isPublic);

      return matchesQuery && matchesVisibility;
    });
  }, [data.forms, query, visibilityFilter]);


  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Forms</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Forms</h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Manage and organize your forms</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onOpenCreateForm} className="w-fit">
            Create Form
          </Button>
        </div>
      </section>

      <FormsSearchBar
        query={query}
        onQueryChange={setQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      <FormsTable forms={filteredForms} onOpen={onEditForm} onShare={onShareForm} />

      {filteredForms.length ? null : <EmptyState title="No matching forms" description="Try another search term or clear the visibility filter." />}
    </div>
  );
}

function WorkspaceResponses({ data }: { data: DashboardData }) {
  const metrics = [
    { label: "Total Responses", value: String(data.summary.totalSubmissions), hint: "All collected submissions" },
    { label: "Recent Responses", value: String(data.summary.recentSubmissions), hint: "Latest response window" },
    { label: "Average per Form", value: data.summary.totalForms ? averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1) : "0", hint: "Responses divided by forms" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Responses"
        title="Recent activity"
        description="A focused response feed surfaces the latest submissions and keeps the review flow calm."
        meta={data.recentSubmissions.length ? `${data.recentSubmissions.length} latest submission${data.recentSubmissions.length === 1 ? "" : "s"}` : "No activity yet"}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Activity feed</p>
          <div className="mt-4">
            <SubmissionsList submissions={data.recentSubmissions} />
          </div>
        </Card>

        <div className="space-y-4">
          <SectionHeader eyebrow="Preview" title="Response preview" description="A compact glance at the latest submission." />
          {data.recentSubmissions[0] ? (
            <SubmissionPreviewCard submission={data.recentSubmissions[0]} />
          ) : (
            <EmptyState
              title="Nothing to preview yet"
              description="When a new response comes in, it will show up here with answer values grouped for quick scanning."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({
  data,
  userEmail,
  settings,
}: {
  data: DashboardData;
  userEmail?: string | null;
  settings: SettingsData;
}) {
  const router = useRouter();
  const { desktopTab, setDesktopTab } = useDesktopTab();
  const [mobileTab, setMobileTab] = useState<MobileTab>("home");
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const source = data as DashboardSource;

  const displayName = firstText(
    source.displayName,
    source.name,
    source.fullName,
    userEmail ? userEmail.split("@")[0] : "",
    "Dashboard"
  );

  const handleShareForm = (form: DashboardForm) => {
    const origin = window.location.origin;
    setShareTarget({
      form,
      shareUrl: buildPublicFormUrl(origin, displayName, form.publicToken),
    });
  };

  const handleShareCreatedForm = (identity: CreatedFormIdentity | null) => {
    if (!identity) {
      return;
    }

    const origin = window.location.origin;
    setCreateFormOpen(false);
    setShareTarget({
      form: {
        id: identity.formId,
        title: "Untitled form",
        description: null,
        isPublic: true,
        publicSlug: "",
        publicToken: identity.publicToken,
        expiresAt: null,
        responseLimit: null,
        responseCount: 0,
        createdAt: "",
        updatedAt: "",
        fieldCount: 0,
        submissionCount: 0,
        lastSubmissionAt: null,
      },
      shareUrl: buildPublicFormUrl(origin, displayName, identity.publicToken),
    });
  };

  const handleEditForm = (form: DashboardForm) => {
    router.push(`/forms/${form.id}/edit`);
  };

  const handleOpenCreateForm = () => {
    setCreateFormKey((current) => current + 1);
    setCreateFormOpen(true);
  };

  const handleCreateAnother = () => {
    setCreateFormKey((current) => current + 1);
  };

  const handleManageCreatedForm = (identity: CreatedFormIdentity | null) => {
    if (!identity) {
      return;
    }

    setCreateFormOpen(false);
    setDesktopTab("forms");
    router.push(`/forms/${identity.formId}/edit`);
  };

  const activeShareStatus = shareTarget ? getShareStatus(shareTarget.form) : null;

  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
  };

  return (
    <DashboardToastProvider>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="space-y-3.5 px-4 py-4 pb-18 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {desktopTab === "overview" ? (
            <div id="overview" className="hidden md:block">
              <WorkspaceOverview data={data} userEmail={userEmail} />
            </div>
          ) : (
            <div id="workspace" className="hidden md:block space-y-3.5">
              {desktopTab === "forms" ? (
                <WorkspaceForms data={data} onShareForm={handleShareForm} onOpenCreateForm={handleOpenCreateForm} onEditForm={handleEditForm} />
              ) : desktopTab === "responses" ? (
                <WorkspaceResponses data={data} />
              ) : (
                <WorkspaceSettings settings={settings} />
              )}
            </div>
          )}

          <div className="space-y-4 md:hidden">
            {mobileTab === "home" ? (
              <MobileHomePanel data={data} displayName={displayName} onTabChange={handleMobileTabChange} />
            ) : mobileTab === "forms" ? (
              <MobileFormsPanel data={data} onShareForm={handleShareForm} onOpenCreateForm={handleOpenCreateForm} onEditForm={handleEditForm} />
            ) : mobileTab === "responses" ? (
              <MobileResponsesPanel data={data} />
            ) : (
              <MobileSettingsPanel settings={settings} />
            )}
          </div>
        </div>

        <MobileTabBar activeTab={mobileTab} onTabChange={handleMobileTabChange} />

        <ShareModal
          open={Boolean(shareTarget)}
          onClose={() => setShareTarget(null)}
          formTitle={shareTarget?.form.title ?? ""}
          shareUrl={shareTarget?.shareUrl ?? ""}
          statusLabel={activeShareStatus ? getShareStatusLabel(activeShareStatus) : undefined}
          published={shareTarget?.form.isPublic ?? true}
        />

        <CreateFormModal
          open={createFormOpen}
          formKey={createFormKey}
          onClose={() => setCreateFormOpen(false)}
          onCreateAnother={handleCreateAnother}
          onManageCreatedForm={handleManageCreatedForm}
          onShareCreatedForm={handleShareCreatedForm}
        />
      </div>
    </DashboardToastProvider>
  );
}


function MobileTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}) {
  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)]/92 px-2 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-4 gap-1">
        {MOBILE_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? "page" : undefined}
              className={joinClasses(
                "inline-flex min-h-16 flex-col items-center justify-center gap-1 rounded-[1.4rem] border px-2 py-2 text-sm font-medium transition",
                isActive
                  ? "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)] shadow-[0_8px_24px_rgba(15,93,70,0.10)]"
                  : "border-transparent bg-transparent text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-subtle)]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileHomePanel({
  data,
  displayName,
  onTabChange,
}: {
  data: DashboardData;
  displayName: string;
  onTabChange: (tab: MobileTab) => void;
}) {
  const source = data as DashboardSource;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const userName = displayName !== "Dashboard" ? displayName : firstText(source.name, source.fullName, "User");
  const activeForms = data.forms.filter((form) => form.isPublic).length;
  const recentResponses = data.recentSubmissions.slice(0, 2);

  return (
    <div className="space-y-4">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-4 shadow-none">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--muted-foreground)]">Overview</p>
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {greeting}, {userName}
          </h2>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            {data.forms.length === 0 ? "Create your first form to get started." : "You have active forms in your workspace."}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {[
          {
            label: "Forms",
            value: String(data.summary.totalForms),
            hint: "Workspace total",
          },
          {
            label: "Responses",
            value: String(data.summary.totalSubmissions),
            hint: "Collected so far",
          },
          {
            label: "Active",
            value: String(data.forms.filter((form) => form.isPublic).length),
            hint: "Ready to share",
          },
          {
            label: "Rate",
            value: data.summary.totalForms ? `${averagePerForm(data.summary.totalSubmissions, data.summary.totalForms).toFixed(1)}x` : "0x",
            hint: "Per form",
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-none">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{stat.label}</p>
              <p className="text-[1.05rem] font-semibold tracking-tight text-[var(--foreground)]">{stat.value}</p>
              <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => onTabChange("forms")} className="w-full justify-center">
            Create Form
          </Button>
          <Button variant="secondary" size="sm" className="w-full justify-center" onClick={() => onTabChange("forms")}>
            View Forms
          </Button>
        </div>
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-3 shadow-none">
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Recent responses</p>

          <div className="space-y-2">
            {recentResponses.length ? (
              recentResponses.map((submission) => (
                <Card key={submission.id} className="border-[var(--border)] bg-[var(--surface-subtle)] p-3 shadow-none">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">{submission.formTitle}</p>
                        <p className="text-[11px] leading-4 text-[var(--muted-foreground)]">{formatDateLong(submission.createdAt)}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-medium text-[var(--muted-foreground)]">
                        {submission.answers.length} answer{submission.answers.length === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {submission.answers.slice(0, 2).map((answer) => (
                        <div key={`${submission.id}-${answer.fieldId}`} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{answer.fieldLabel}</p>
                          <p className="mt-1 break-words text-[11px] leading-4 text-[var(--foreground)]">{answer.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-5 text-center">
                <p className="text-sm font-semibold tracking-tight text-[var(--foreground)]">No recent responses</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Responses will appear here as a quick activity snapshot.</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function MobileFormsPanel({
  data,
  onShareForm,
  onOpenCreateForm,
  onEditForm,
}: {
  data: DashboardData;
  onShareForm: (form: DashboardForm) => void;
  onOpenCreateForm: () => void;
  onEditForm: (form: DashboardForm) => void;
}) {
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<FormVisibilityFilter>("all");

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.forms.filter((form) => {
      const matchesQuery =
        !normalizedQuery ||
        form.title.toLowerCase().includes(normalizedQuery) ||
        (form.description ?? "").toLowerCase().includes(normalizedQuery);

      const matchesVisibility =
        visibilityFilter === "all" ||
        (visibilityFilter === "public" && form.isPublic) ||
        (visibilityFilter === "private" && !form.isPublic);

      return matchesQuery && matchesVisibility;
    });
  }, [data.forms, query, visibilityFilter]);


  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Forms</p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">Forms</h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">Manage and organize your forms</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onOpenCreateForm} className="w-fit">
            Create Form
          </Button>
        </div>
      </section>

      <FormsSearchBar
        query={query}
        onQueryChange={setQuery}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      <FormsTable forms={filteredForms} onOpen={onEditForm} onShare={onShareForm} />

      {filteredForms.length ? null : <EmptyState title="No matching forms" description="Try another search term or clear the visibility filter." />}
    </div>
  );
}

function MobileResponsesPanel({ data }: { data: DashboardData }) {
  const average = averagePerForm(data.summary.totalSubmissions, data.summary.totalForms);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Responses"
        title="Latest responses"
        description="Recent submissions are summarized in a focused response feed that keeps the review flow calm."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <CompactStat label="Total Responses" value={String(data.summary.totalSubmissions)} hint="All collected submissions" />
        <CompactStat label="Recent Responses" value={String(data.summary.recentSubmissions)} hint="Latest response window" />
        <CompactStat
          label="Average per Form"
          value={data.summary.totalForms ? average.toFixed(1) : "0"}
          hint="Responses divided by forms"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
        <Card className="border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Activity feed</p>
          <div className="mt-4">
            <SubmissionsList submissions={data.recentSubmissions} />
          </div>
        </Card>

        <div className="space-y-4">
          <SectionHeader eyebrow="Preview" title="Response preview" description="A compact glance at the latest submission." />
          {data.recentSubmissions[0] ? (
            <SubmissionPreviewCard submission={data.recentSubmissions[0]} />
          ) : (
            <EmptyState
              title="Nothing to preview yet"
              description="When a new response comes in, it will show up here with answer values grouped for quick scanning."
            />
          )}
        </div>
      </div>
    </div>
  );
}
