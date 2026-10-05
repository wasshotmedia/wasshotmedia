import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function spaced(text: string) {
  return text.split("").join(" ");
}

export function formatMoney(
  amount: number | null | undefined,
  currency = "INR",
) {
  if (amount == null || Number.isNaN(amount)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function json<T>(data: T, init?: ResponseInit) {
  return Response.json(data, init);
}

export function errorJson(message: string, status = 400, extra?: object) {
  return Response.json({ error: message, ...extra }, { status });
}
