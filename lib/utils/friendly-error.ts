import { isLikelyUnconfirmedEmailError, sanitizeAuthInput } from "./validators";

const DEFAULT_FRIENDLY_ERROR = "Something went wrong. Please try again.";
const RATE_LIMIT_ERROR = "You’re doing that too often. Please wait a moment and try again.";
const AUTH_ERROR = "We couldn’t verify your sign-in. Please check your details and try again.";
const RECOVERY_ERROR = "We couldn’t verify the recovery link. Please request a new one.";
const EMAIL_ERROR = "We couldn’t send the email right now. Please try again in a moment.";
const SESSION_ERROR = "Your session expired. Please sign in again.";

function normalizeMessage(value: string) {
  return sanitizeAuthInput(value).toLowerCase();
}

export function getFriendlyErrorMessage(error: unknown, fallback = DEFAULT_FRIENDLY_ERROR) {
  const rawMessage = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = normalizeMessage(rawMessage);

  if (!message) {
    return fallback;
  }

  if (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("retry later") ||
    message.includes("over quota") ||
    message.includes("slow down")
  ) {
    return RATE_LIMIT_ERROR;
  }

  if (
    message.includes("jwt") ||
    message.includes("session") ||
    message.includes("refresh token") ||
    message.includes("invalid login credentials") ||
    message.includes("authentication failed") ||
    message.includes("auth session missing")
  ) {
    return SESSION_ERROR;
  }

  if (
    message.includes("recovery") ||
    message.includes("verification") ||
    message.includes("verify otp") ||
    message.includes("token hash") ||
    message.includes("magiclink") ||
    message.includes("signup") ||
    isLikelyUnconfirmedEmailError(message)
  ) {
    return AUTH_ERROR;
  }

  if (message.includes("email") || message.includes("send")) {
    return EMAIL_ERROR;
  }

  if (message.includes("edge function") || message.includes("function invocation") || message.includes("function returned")) {
    return DEFAULT_FRIENDLY_ERROR;
  }

  return fallback;
}

export function getFriendlyActionMessage(error: unknown) {
  return getFriendlyErrorMessage(error, DEFAULT_FRIENDLY_ERROR);
}

export function getFriendlyAuthMessage(error: unknown) {
  return getFriendlyErrorMessage(error, AUTH_ERROR);
}

export function getFriendlyEmailMessage(error: unknown) {
  return getFriendlyErrorMessage(error, EMAIL_ERROR);
}

export function getFriendlyRecoveryMessage(error: unknown) {
  return getFriendlyErrorMessage(error, RECOVERY_ERROR);
}

export function getFriendlySessionMessage(error: unknown) {
  return getFriendlyErrorMessage(error, SESSION_ERROR);
}
