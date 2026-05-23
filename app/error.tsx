"use client";

import React from "react";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg">
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
              Something went wrong
            </h2>
            <pre className="mt-2 text-sm text-[var(--muted)]">{error.message}</pre>
            <div className="mt-4">
              <button className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white" onClick={() => reset()}>
                Retry
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
