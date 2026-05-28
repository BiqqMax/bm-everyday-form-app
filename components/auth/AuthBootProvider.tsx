"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "../../lib/supabase/client";

type AuthBootContextType = {
  isBooted: boolean;
  isLoading: boolean;
  isReady: boolean;
  user: User | null;
  onboardingCompleted: boolean;
};

const AuthBootContext = createContext<AuthBootContextType | undefined>(undefined);

export function AuthBootProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthBootContextType>({
    isBooted: false,
    isLoading: true,
    user: null,
    onboardingCompleted: false,
  });

  const router = useRouter();

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function bootstrap() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!user) {
        setState({
          isBooted: true,
          isLoading: false,
          user: null,
          onboardingCompleted: false,
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      setState({
        isBooted: true,
        isLoading: false,
        user,
        onboardingCompleted: profile?.onboarding_completed ?? false,
      });
    }

    bootstrap();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      active = false;
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  const value = useMemo(() => ({ ...state, isReady: state.isBooted }), [state]);

  return <AuthBootContext.Provider value={value}>{children}</AuthBootContext.Provider>;
}

export function useAuthBoot() {
  const context = useContext(AuthBootContext);

  if (!context) {
    throw new Error("useAuthBoot must be used within AuthBootProvider");
  }

  return context;
}
