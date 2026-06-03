export type ShareStatus = "draft" | "active" | "expired" | "limit_reached";

export type ShareableFormSummary = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  publicSlug: string;
  expiresAt: string | null;
  responseLimit: number | null;
  responseCount: number;
};

export function buildPublicFormPath(publicSlug: string) {
  return `/f/${publicSlug}`;
}

export function buildPublicFormUrl(origin: string, publicSlug: string) {
  return `${origin.replace(/\/+$/g, "")}${buildPublicFormPath(publicSlug)}`;
}

export function getShareLinkPreview(publicSlug: string) {
  return buildPublicFormPath(publicSlug);
}

export function getShareStatus(form: Pick<ShareableFormSummary, "isPublic" | "expiresAt" | "responseLimit" | "responseCount">, now = new Date()): ShareStatus {
  if (!form.isPublic) {
    return "draft";
  }

  if (form.expiresAt && new Date(form.expiresAt).getTime() <= now.getTime()) {
    return "expired";
  }

  if (typeof form.responseLimit === "number" && form.responseLimit >= 0 && form.responseCount >= form.responseLimit) {
    return "limit_reached";
  }

  return "active";
}

export function getShareStatusLabel(status: ShareStatus) {
  switch (status) {
    case "active":
      return "Active";
    case "expired":
      return "Expired";
    case "limit_reached":
      return "Limit reached";
    case "draft":
    default:
      return "Draft";
  }
}

export function getShareStatusTone(status: ShareStatus) {
  switch (status) {
    case "active":
      return "border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]";
    case "expired":
      return "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.06)] text-[#7f1d1d]";
    case "limit_reached":
      return "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.06)] text-[#7f1d1d]";
    case "draft":
    default:
      return "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]";
  }
}

export function formatOptionalCount(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Unlimited";
  }

  return String(value);
}

export function formatOptionalDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
