"use client";

import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium focus:outline-none";
  const sizes: Record<string, string> = { sm: "px-3 py-1 text-sm", md: "px-4 py-2 text-sm", lg: "px-5 py-3 text-base" };

  const style: React.CSSProperties = variant === "primary" ? { backgroundColor: "var(--primary)", color: "white" } : { backgroundColor: "transparent", color: "var(--text)", border: "1px solid var(--border)" };

  return (
    <button className={`${base} ${sizes[size]} ${className}`} style={style} {...rest}>
      {children}
    </button>
  );
}
