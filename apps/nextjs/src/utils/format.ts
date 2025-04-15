/**
 * Utility functions for consistent formatting across the application.
 * These functions help prevent SSR hydration mismatches by ensuring
 * dates are formatted the same way on both server and client.
 */

/**
 * Format a date to a standard date format (DD.MM.YYYY)
 * Uses ru-RU locale for consistency between server and client
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU");
}

/**
 * Format a date with time (DD MMMM YYYY, HH:MM)
 * Uses ru-RU locale for consistency between server and client
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format a date range
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Format a date-time range
 */
export function formatDateTimeRange(startDate: Date, endDate: Date): string {
  return `${formatDateTime(startDate)} — ${formatDateTime(endDate)}`;
}

/**
 * Format a machine-readable ISO timestamp for datetime attributes
 */
export function formatISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Format a timestamp (milliseconds since epoch) to a readable date string
 */
export const formatDateTimestamp = (timestamp: number): string => {
  // Ensure we're working with seconds and convert to milliseconds
  const timestampMs = timestamp * 1000;
  const date = new Date(timestampMs);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/**
 * Format a date range between two timestamps (seconds since epoch)
 */
export const formatDateRangeTimestamp = (
  fromTimestamp: number,
  toTimestamp: number,
): string => {
  // Ensure we're working with seconds and convert to milliseconds
  const fromDate = new Date(fromTimestamp * 1000);
  const toDate = new Date(toTimestamp * 1000);

  // If both dates are on the same day, only show time range
  if (fromDate.toDateString() === toDate.toDateString()) {
    const timeFormat = new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    return `${timeFormat.format(fromDate)} - ${timeFormat.format(toDate)}`;
  }

  // Otherwise show full date and time for both
  const dateTimeFormat = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

  return `${dateTimeFormat.format(fromDate)} - ${dateTimeFormat.format(toDate)}`;
};

/**
 * Convert a timestamp (seconds since epoch) to ISO string format
 */
export const timestampToISOString = (timestamp: number): string => {
  return new Date(timestamp * 1000).toISOString();
};

/**
 * Convert Date to Unix timestamp (seconds since epoch)
 */
export const dateToUnixTimestamp = (date: Date): number => {
  return Math.floor(date.getTime() / 1000);
};

/**
 * Convert Unix timestamp (seconds since epoch) to Date
 */
export const unixTimestampToDate = (timestamp: number): Date => {
  return new Date(timestamp * 1000);
};

/**
 * Check if a Unix timestamp (seconds since epoch) is in the future
 */
export const isTimestampInFuture = (timestamp: number): boolean => {
  return timestamp > Math.floor(Date.now() / 1000);
};

/**
 * Check if a Unix timestamp (seconds since epoch) is in the past
 */
export const isTimestampInPast = (timestamp: number): boolean => {
  return timestamp < Math.floor(Date.now() / 1000);
};
