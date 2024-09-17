import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function roundIfNumber(value: string | number | null) {
  if (typeof value === "number") {
    return parseFloat(value.toFixed(2));
  } else if (typeof value === "string") {
    const num = parseFloat(value);
    const rounded = parseFloat(num.toFixed(2));
    return rounded;
  }
  return value;
}

export function convertDateToString(date: Date, isDMY?: boolean): string {
  const timestampDate = new Date(date);
  const year = timestampDate.getFullYear();
  const month = timestampDate.getMonth() + 1;
  const day = timestampDate.getDate();

  const formattedDate = isDMY
    ? `${day}/${month}/${year}`
    : `${year}/${month}/${day}`;
  return formattedDate;
}

export const PRICE_ID: string = "price_1PtqHJKoq4v6ODRvcFMOJ8By";

export function formatTimeDelta(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secs = Math.floor(seconds - hours * 3600 - minutes * 60);
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0) {
    parts.push(`${secs}s`);
  }
  return parts.join(" ");
}