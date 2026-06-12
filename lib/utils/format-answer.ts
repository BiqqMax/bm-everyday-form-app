/**
 * Converts an answer value (which may be any JSON-compatible type from the database)
 * into a displayable string.
 *
 * - Arrays are joined by ", "
 * - Objects are JSON-stringified
 * - Primitives are converted via String()
 */
export function formatAnswerValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => safeString(item))
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return safeString(value);
}

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map((item) => safeString(item)).join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return "";
}
