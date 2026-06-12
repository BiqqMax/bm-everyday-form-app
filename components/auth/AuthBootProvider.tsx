"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "../../lib/supabase/browser";

function logQueryFailure(queryName: string, error: unknown) {
  const supabaseError = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  console.error("QUERY FAILED", {
    file: "components/auth/AuthBootProvider.tsx",
    queryName,
    error,
    code: supabaseError.code,
    message: supabaseError.message,
    details: supabaseError.details,
    hint: supabaseError.hint,
  });
}

type AuthBootStateType = {
  isBooted: boolean;
  isLoading: boolean;
  user: User | null;
  onboardingCompleted: boolean;
};

type AuthBootContextType = AuthBootStateType & {
  isReady: boolean;
};

const AuthBootContext = createContext<AuthBootContextType | undefined>(undefined);

export function AuthBootProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthBootStateType>({
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        logQueryFailure("AuthBootProvider.profile", profileError);
      }

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
