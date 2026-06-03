"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import { buildPublicFormUrl, buildPublicFormVanityUrl } from "../../lib/forms/public";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  formTitle: string;
  qr_share_token: string;
  displayName?: string;
  statusLabel?: string;
  published?: boolean;
}

type StatusTone = "active" | "expired" | "limit_reached" | "draft";

function getStatusTone(statusLabel?: string, published = true): StatusTone {
  const normalized = statusLabel?.toLowerCase().trim();

  if (normalized === "expired") return "expired";
  if (normalized === "limit reached") return "limit_reached";
  if (normalized === "draft") return "draft";
  if (!published) return "draft";
  return "active";
}

function getToneClasses(tone: StatusTone) {
  switch (tone) {
    case "active":
      return "border-[rgba(15,93,70,0.18)] bg-[rgba(15,93,70,0.08)] text-[var(--accent)]";
    case "expired":
    case "limit_reached":
      return "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] text-[#7f1d1d]";
    case "draft":
    default:
      return "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--muted-foreground)]";
  }
}

function getToneDotClasses(tone: StatusTone) {
  switch (tone) {
    case "active":
      return "bg-[var(--accent)]";
    case "expired":
    case "limit_reached":
      return "bg-[#b42318]";
    case "draft":
    default:
      return "bg-[var(--muted-foreground)]";
  }
}

function slugifyFileName(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "form"
  );
}

export default function ShareModal({
  open,
  onClose,
  formTitle,
  qr_share_token,
  displayName,
  statusLabel,
  published = true,
}: ShareModalProps) {
  const [copied, setCopied] = useState<"primary" | "branded" | null>(null);
  const [origin, setOrigin] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState<string>("");
  const tone = getStatusTone(statusLabel, published);
  const statusText = statusLabel ?? (published ? "Active" : "Draft");

  useEffect(() => {
    if (!open) {
      return;
    }

    setOrigin(window.location.origin);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const primaryUrl = useMemo(() => {
    if (!origin || !qr_share_token) {
      return "";
    }

    return buildPublicFormUrl(origin, qr_share_token);
  }, [origin, qr_share_token]);

  const brandedUrl = useMemo(() => {
    if (!origin || !qr_share_token || !displayName) {
      return "";
    }

    return buildPublicFormVanityUrl(origin, displayName, qr_share_token);
  }, [displayName, origin, qr_share_token]);

  useEffect(() => {
    if (!open || !primaryUrl || tone === "draft") {
      setQrDataUrl("");
      setQrError("");
      return;
    }

    let active = true;
    setQrError("");

    QRCode.toDataURL(primaryUrl, {
      margin: 1,
      width: 320,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((dataUrl) => {
        if (active) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setQrDataUrl("");
          setQrError(error instanceof Error ? error.message : "Unable to generate QR code");
        }
      });

    return () => {
      active = false;
    };
  }, [open, primaryUrl, tone]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const fileName = useMemo(() => `${slugifyFileName(formTitle)}-qr.png`, [formTitle]);
  const canShare = Boolean(primaryUrl) && tone !== "draft";
  const accessMessage =
    tone === "draft"
      ? "Publish this form to let anyone with these links access and submit it."
      : "Anyone with these links can access and submit your form.";
  const descriptionId = "share-modal-description";

  const handleCopy = async (kind: "primary" | "branded") => {
    const value = kind === "primary" ? primaryUrl : brandedUrl;

    if (!value || !canShare) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
    } catch {
      setCopied(null);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = fileName;
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={`Share ${formTitle}`}
      ariaDescribedBy={descriptionId}
      className="max-w-none overflow-hidden p-0 sm:max-h-[92dvh] sm:max-w-4xl sm:rounded-3xl"
    >
      <div className="flex max-h-[100dvh] min-h-[100dvh] flex-col bg-white text-slate-900 sm:min-h-0 sm:max-h-[92dvh]">
        <header className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Share your form</p>
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{formTitle}</h2>
              <p id={descriptionId} className="max-w-2xl text-sm leading-5 text-slate-600">
                {accessMessage}
              </p>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getToneClasses(tone)}`}>
                <span className={`mr-1.5 h-2 w-2 rounded-full ${getToneDotClasses(tone)}`} />
                {statusText}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close share modal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <ShareLinkRow
            label="Primary Link"
            description="Use this link to share your form."
            value={primaryUrl}
            copyLabel={copied === "primary" ? "Copied" : "Copy"}
            onCopy={() => handleCopy("primary")}
            canCopy={canShare}
            primary
          />

          <ShareLinkRow
            label="Branded Link"
            description="Includes your display name for a more recognizable URL."
            value={brandedUrl}
            copyLabel={copied === "branded" ? "Copied" : "Copy"}
            onCopy={() => handleCopy("branded")}
            canCopy={Boolean(brandedUrl) && canShare}
          />

          <section className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">Share with QR Code</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                  Scan this QR code to open the form instantly.
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="h-9 shrink-0 px-3 text-xs"
              >
                Download
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${formTitle}`}
                  className="h-auto w-full max-w-[168px] rounded-2xl bg-white p-2 shadow-sm sm:max-w-[200px] sm:p-3"
                />
              ) : qrError ? (
                <div className="max-w-xs py-4 text-center">
                  <p className="text-sm font-semibold text-slate-900">QR unavailable</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{qrError}</p>
                </div>
              ) : tone === "draft" ? (
                <div className="max-w-xs py-4 text-center">
                  <p className="text-sm font-semibold text-slate-900">Publish to share</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                    Publish this form before generating a link or QR code.
                  </p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <div className="mx-auto h-8 w-8 animate-pulse rounded-2xl bg-slate-200" />
                  <p className="mt-2 text-xs text-slate-500 sm:text-sm">Generating QR code…</p>
                </div>
              )}
            </div>
          </section>

          <section className="grid grid-cols-3 gap-2">
            <StatChip
              label="Status"
              value={statusText}
              hint={
                tone === "active"
                  ? "Ready"
                  : tone === "expired"
                    ? "Closed"
                    : tone === "limit_reached"
                      ? "Full"
                      : "Draft"
              }
            />
            <StatChip label="Access" value={published ? "Public" : "Private"} hint="Open" />
            <StatChip label="Sharing" value={tone === "draft" ? "Off" : "Live"} hint="Dashboard" />
          </section>
        </div>
      </div>
    </Modal>
  );
}

function ShareLinkRow({
  label,
  description,
  value,
  copyLabel,
  onCopy,
  canCopy,
  primary = false,
}: {
  label: string;
  description: string;
  value: string;
  copyLabel: string;
  onCopy: () => void;
  canCopy: boolean;
  primary?: boolean;
}) {
  const hasValue = Boolean(value);

  return (
    <section
      className={
        primary
          ? "rounded-2xl border border-[rgba(15,93,70,0.2)] bg-[rgba(15,93,70,0.05)] px-3 py-3 sm:px-4"
          : "rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:px-4"
      }
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{label}</h3>
            <span
              className={
                primary
                  ? "inline-flex items-center rounded-full border border-[rgba(15,93,70,0.18)] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]"
                  : "inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500"
              }
            >
              {primary ? "Recommended" : "Optional"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">{description}</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCopy}
          disabled={!canCopy}
          className="h-9 shrink-0 px-3 text-xs"
        >
          {copyLabel}
        </Button>
      </div>

      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        {hasValue ? (
          <p className="min-w-0 flex-1 truncate text-sm font-medium leading-5 text-slate-900 select-all">{value}</p>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm leading-5 text-slate-500">Add a display name to create a branded link.</p>
        )}
      </div>
    </section>
  );
}

function StatChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-2 py-2 text-center shadow-[0_4px_12px_rgba(15,23,42,0.03)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{hint}</p>
    </div>
  );
}
