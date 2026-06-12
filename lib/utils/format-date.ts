/**
 * Formats an ISO date string into a human-readable long format.
 * Uses en-CA locale which produces "MMM DD, YYYY, HH:MM AM/PM" style output.
 * Returns a fallback string when the value is null or empty.
 */
export function formatDateLong(value: string | null): string {
  if (!value) {
    return "No submissions yet";
  }

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
