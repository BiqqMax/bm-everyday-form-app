"use client";

import { useEffect, useState } from "react";

import Button from "../ui/Button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplayMode()) {
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!isVisible || !deferredPrompt) {
    return null;
  }

  const installPrompt = deferredPrompt;

  async function handleInstall() {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  }

  function handleDismiss() {
    setDeferredPrompt(null);
    setIsVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4 sm:bottom-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">Add Everyday Forms to your home screen</p>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Install the app for faster access and a more app-like experience.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={handleDismiss}>
            Not now
          </Button>
          <Button type="button" size="sm" onClick={handleInstall}>
            Add to Home Screen
          </Button>
        </div>
      </div>
    </div>
  );
}
