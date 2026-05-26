export type AuthFlow = 'signup' | 'login' | 'reset' | 'google';

export type AuthVerificationType = 'signup' | 'magiclink' | 'recovery';

export const AUTH_VERIFY_ROUTE = '/auth/verify';
export const AUTH_TRANSITION_ROUTE = '/auth/transition';
export const DASHBOARD_ROUTE = '/dashboard';
export const ONBOARDING_ROUTE = '/onboarding';
export const LOGIN_ROUTE = '/login';
export const SIGNUP_ROUTE = '/signup';
export const RESET_PASSWORD_ROUTE = '/reset-password';

export const OTP_LENGTH = 6;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const TRANSITION_DURATION_MS = 2800;

export function getAuthNextRoute(flow: AuthFlow) {
  return flow === 'signup' || flow === 'google' ? ONBOARDING_ROUTE : DASHBOARD_ROUTE;
}

export function getAuthTransitionUrl(nextPath: string, message?: string) {
  const params = new URLSearchParams();
  params.set('next', nextPath);
  if (message) {
    params.set('message', message);
  }
  return `${AUTH_TRANSITION_ROUTE}?${params.toString()}`;
}

export function getAuthVerifyUrl(flow: AuthFlow, email: string, nextPath?: string) {
  const params = new URLSearchParams();
  params.set('flow', flow);
  params.set('email', email);
  params.set('next', nextPath ?? getAuthNextRoute(flow));
  return `${AUTH_VERIFY_ROUTE}?${params.toString()}`;
}

export function getRecoveryRoute() {
  return `${RESET_PASSWORD_ROUTE}?recovery=success`;
}

export function getPasswordResetCompleteTransitionUrl() {
  return getAuthTransitionUrl(`${LOGIN_ROUTE}?reset=success`, "Password updated successfully.");
}
