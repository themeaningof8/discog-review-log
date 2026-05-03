/** Fixed locale/time zone so SSR markup matches browser hydration. */
const DISPLAY_LOCALE = "en-US";
const DISPLAY_TIME_ZONE = "UTC";

export function formatCalendarDate(epochMs: number): string {
  return new Date(epochMs).toLocaleDateString(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCalendarDateTime(epochMs: number): string {
  return new Date(epochMs).toLocaleString(DISPLAY_LOCALE, {
    timeZone: DISPLAY_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
