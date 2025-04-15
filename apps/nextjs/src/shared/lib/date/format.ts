import type { DateValue } from "@react-aria/calendar";
import { getLocalTimeZone } from "@internationalized/date";

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return hours === 1 ? `${hours} hour` : `${hours} hours`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

export function formatTimeRange(
  startDate: Date,
  endDate: Date,
  locale: string,
): string {
  return `${startDate.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })} - ${endDate.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

export function formatFullDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function processTimeToDate(
  time: string,
  baseDate: DateValue,
): Date | null {
  const timeValue = time.split(":").join(" ");
  const match = /^(\d{1,2}) (\d{2})([ap]m)?$/i.exec(timeValue);

  if (!match) {
    console.error("Invalid time format");
    return null;
  }

  let hours = Number.parseInt(match[1] ?? "0");
  const minutes = Number.parseInt(match[2] ?? "0");
  const isPM = match[3] && match[3].toLowerCase() === "pm";

  if (isPM && (hours < 1 || hours > 12)) {
    console.error("Time out of range (1-12) in 12-hour format");
    return null;
  }

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  const currentDate = baseDate.toDate(getLocalTimeZone());
  currentDate.setHours(hours, minutes);
  return currentDate;
}

export function getDurationInMinutes(
  startTime: string,
  endTime: string,
): number {
  if (!startTime || !endTime) return 15;

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const durationMs = endDate.getTime() - startDate.getTime();
  return Math.round(durationMs / (1000 * 60));
}
