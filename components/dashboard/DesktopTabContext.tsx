"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type DesktopTab = "overview" | "forms" | "responses" | "settings";

type DesktopTabContextValue = {
  desktopTab: DesktopTab;
  setDesktopTab: Dispatch<SetStateAction<DesktopTab>>;
};

const DesktopTabContext = createContext<DesktopTabContextValue | null>(null);

export function DesktopTabProvider({ children }: { children: ReactNode }) {
  const [desktopTab, setDesktopTab] = useState<DesktopTab>("overview");

  return <DesktopTabContext.Provider value={{ desktopTab, setDesktopTab }}>{children}</DesktopTabContext.Provider>;
}

export function useDesktopTab() {
  const value = useContext(DesktopTabContext);

  if (!value) {
    throw new Error("useDesktopTab must be used within a DesktopTabProvider");
  }

  return value;
}
