import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get favicon from URL
export function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    // Using Google's favicon service which is reliable and free
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    return null;
  }
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
