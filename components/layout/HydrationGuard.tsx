"use client";

import { useEffect, useState } from "react";

export default function HydrationGuard() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (hydrated) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] pointer-events-none bg-background"
      style={{ willChange: "opacity" }}
    />
  );
}
