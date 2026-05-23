import React from "react";

export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`w-full rounded-lg p-4 border bg-[var(--surface)] border-[var(--border)] text-[var(--text)] ${className}`}
      style={{ boxShadow: "none" }}
    >
      {children}
    </div>
  );
}
