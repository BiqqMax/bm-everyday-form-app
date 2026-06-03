"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";

import { buildPublicFormUrl } from "../../lib/forms/public";

export interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  formTitle: string;
  publicSlug: string;
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
      return "border-[rgba(15,93,70,0.16)] bg-[rgba(15,93,70,0.06)] text-[var(--accent)]";
    case "expired":
    case "limit_reached":
      return "border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.06)] text-[#7f1d1d]";
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
  publicSlug,
  statusLabel,
  published = true,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const shareUrl = useMemo(() => {
    if (!origin || !publicSlug) {
      return "";
    }

    return buildPublicFormUrl(origin, publicSlug);
  }, [origin, publicSlug]);

  useEffect(() => {
    if (!open || !shareUrl || tone === "draft") {
      setQrDataUrl("");
      setQrError("");
      return;
    }

    let active = true;
    setQrError("");

    QRCode.toDataURL(shareUrl, {
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
  }, [open, shareUrl, tone]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const fileName = useMemo(() => `${slugifyFileName(formTitle)}-qr.png`, [formTitle]);
  const canShare = Boolean(shareUrl) && tone !== "draft";

  const handleCopy = async () => {
    if (!canShare) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setCopied(false);
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
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
        aria-label={`Share ${formTitle}`}
        className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white text-slate-900 shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:max-w-5xl sm:rounded-3xl"
      >
        <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getToneClasses(tone)}`}>
                  <span className={`mr-1.5 h-2 w-2 rounded-full ${getToneDotClasses(tone)}`} />
                  {statusText}
                </span>
                <span className="text-xs text-slate-500">Shareable link and QR code</span>
              </div>
              <h2 className="mt-2 truncate text-xl font-semibold sm:text-2xl">{formTitle}</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close share modal"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="share-url" className="block text-sm font-medium text-slate-700">
                    Public link
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!canShare}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <input
                  id="share-url"
                  readOnly
                  value={shareUrl}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">Anyone with this link can open the published form.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-medium text-slate-900">What this link does</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use the public URL to collect responses. The QR code matches the same URL exactly.
                </p>
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-6 lg:w-[360px] lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">QR preview</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Download or scan to open the form on mobile.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!qrDataUrl}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Download
                  </button>
                </div>

                <div className="mt-4 flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${formTitle}`}
                      className="h-auto w-full max-w-[240px] rounded-xl bg-white p-3 shadow-sm"
                    />
                  ) : qrError ? (
                    <div className="max-w-xs text-center">
                      <p className="text-sm font-medium text-slate-900">QR unavailable</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{qrError}</p>
                    </div>
                  ) : tone === "draft" ? (
                    <div className="max-w-xs text-center">
                      <p className="text-sm font-medium text-slate-900">Draft forms cannot be shared</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">Publish this form before generating a link or QR code.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                      <p className="mt-3 text-sm text-slate-500">Generating QR code…</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Status</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {tone === "active"
                        ? "This form is ready to share."
                        : tone === "expired"
                          ? "The response window has closed."
                          : tone === "limit_reached"
                            ? "The response limit has been reached."
                            : "Publish the form before sharing it."}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getToneClasses(tone)}`}>
                    <span className={`mr-1.5 h-2 w-2 rounded-full ${getToneDotClasses(tone)}`} />
                    {statusText}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
