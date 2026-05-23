"use client";

import React from "react";

export default function Skeleton({ className = "", as = "div" as any }: { className?: string; as?: any }) {
  const Element = as;
  return <Element className={`animate-pulse bg-[var(--border)] rounded-lg ${className}`} />;
}
