const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function sanitizeAuthInput(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, '').trim()
}

export function normalizeEmail(value: string) {
  return sanitizeAuthInput(value).toLowerCase()
}

export function normalizePassword(value: string) {
  return sanitizeAuthInput(value)
}

export function isValidEmail(value: string) {
  return EMAIL_REGEX.test(normalizeEmail(value))
}

export function isStrongEnoughPassword(value: string) {
  return normalizePassword(value).length >= 8
}

export function isSafeRedirectPath(value: string | null | undefined, fallback = '/dashboard') {
  if (!value) {
    return fallback
  }

  const candidate = sanitizeAuthInput(value)

  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('://')) {
    return fallback
  }

  return candidate
}

export function isLikelyUnconfirmedEmailError(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes('email not confirmed') ||
    normalized.includes('email not verified') ||
    normalized.includes('email confirmation required') ||
    normalized.includes('signup confirmation required') ||
    normalized.includes('confirmation email sent') ||
    normalized.includes('email needs verification')
  )
}