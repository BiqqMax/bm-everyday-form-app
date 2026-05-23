export function required(value: string) {
  return value && value.trim().length > 0;
}

export function isEmail(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function minLength(value: string, len: number) {
  return typeof value === "string" && value.trim().length >= len;
}

export function sanitize(value: string) {
  // Minimal sanitizer: strip script tags and trim. Do not rely on this for security server-side.
  return value.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "").trim();
}
