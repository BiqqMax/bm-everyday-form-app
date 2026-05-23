"use client";

import React from "react";
import { useTheme } from "../theme/ThemeProvider";
import Button from "../ui/Button";

export default function MainNav() {
  const { theme, toggle } = useTheme();

  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold" style={{ color: "var(--text)" }}>
          Everyday Forms
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </div>
    </header>
  );
}
