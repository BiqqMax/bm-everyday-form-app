"use server";

import { redirect } from "next/navigation";

import {
  getFriendlyActionMessage,
  getFriendlyAuthMessage,
  getFriendlyEmailMessage,
  getFriendlyRecoveryMessage,
  getFriendlySessionMessage,
} from "../utils/friendly-error";
import {
  isStrongEnoughPassword,
  isValidEmail,
  normalizeEmail,
  normalizePassword,
} from "../utils/validators";
import { getServerSupabaseClient } from "../supabase/server";
import { signOutServerSide } from "./logout";
import {
  AUTH_CALLBACK_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  ONBOARDING_ROUTE,
  RESET_PASSWORD_ROUTE,
  getAuthCallbackUrl,
  getAuthVerifyUrl,
  getRecoveryRoute,
} from "./flow";

export type AuthActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildAuthCallbackUrl(nextPath: string) {
  return getAuthCallbackUrl(nextPath);
}

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = normalizeEmail(getFormValue(formData, "email"));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const supabase = await getServerSupabaseClient();
  const emailRedirectTo = buildAuthCallbackUrl(DASHBOARD_ROUTE);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return {
      status: "error",
      message: getFriendlyAuthMessage(error),
    };
  }

  redirect(getAuthVerifyUrl("login", email, DASHBOARD_ROUTE));
}

export async function signupAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = normalizeEmail(getFormValue(formData, "email"));
  const password = normalizePassword(getFormValue(formData, "password"));
  const confirmPassword = normalizePassword(getFormValue(formData, "confirmPassword"));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  if (!isStrongEnoughPassword(password)) {
    return {
      status: "error",
      message: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match.",
    };
  }

  const supabase = await getServerSupabaseClient();
  const emailRedirectTo = buildAuthCallbackUrl(ONBOARDING_ROUTE);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
    },
  });

  if (error) {
    return {
      status: "error",
      message: getFriendlyAuthMessage(error),
    };
  }

  if (data.session) {
    await signOutServerSide();
  }

  redirect(getAuthVerifyUrl("signup", email, ONBOARDING_ROUTE));
}

export async function forgotPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = normalizeEmail(getFormValue(formData, "email"));

  if (!isValidEmail(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const supabase = await getServerSupabaseClient();
  const redirectTo = buildAuthCallbackUrl(RESET_PASSWORD_ROUTE);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return {
      status: "error",
      message: getFriendlyEmailMessage(error),
    };
  }

  redirect(getAuthVerifyUrl("reset", email, getRecoveryRoute()));
}

export async function resetPasswordAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const password = normalizePassword(getFormValue(formData, "password"));
  const confirmPassword = normalizePassword(getFormValue(formData, "confirmPassword"));

  if (!isStrongEnoughPassword(password)) {
    return {
      status: "error",
      message: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Passwords do not match.",
    };
  }

  const supabase = await getServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      status: "error",
      message: getFriendlyRecoveryMessage(error),
    };
  }

  await signOutServerSide();
  redirect(`${LOGIN_ROUTE}?reset=success`);
}

export async function completeOnboardingAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const accountType = getFormValue(formData, "accountType");
  const displayName = getFormValue(formData, "displayName");
  const organizationName = getFormValue(formData, "organizationName");

  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: "error",
      message: getFriendlySessionMessage(userError ?? "Your session expired. Please sign in again."),
    };
  }

  const isPersonal = accountType === "personal";
  const isOrganization = accountType === "business" || accountType === "education";

  if (!accountType) {
    return {
      status: "error",
      message: "Please choose an account type.",
    };
  }

  if (isPersonal && !displayName) {
    return {
      status: "error",
      message: "Please enter your display name.",
    };
  }

  if (isOrganization && !organizationName) {
    return {
      status: "error",
      message: "Please enter your organization name.",
    };
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? "",
    account_type: isPersonal ? "individual" : "organization",
    display_name: isPersonal ? displayName : null,
    organization_name: isOrganization ? organizationName : null,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return {
      status: "error",
      message: getFriendlyActionMessage(error),
    };
  }

  redirect(DASHBOARD_ROUTE);
}
