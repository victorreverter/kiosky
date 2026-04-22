import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get favicon from URL
export function getFaviconUrl(url: string) {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch {
    return null;
  }
}

/**
 * Generates a unique ID using crypto.randomUUID() if available,
 * otherwise falls back to Math.random()
 */
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

/**
 * Detects potential homograph attacks by checking for mixed scripts in the domain
 * Homograph attacks use characters from different scripts that look identical
 * e.g., Cyrillic 'а' (U+0430) vs Latin 'a' (U+0061)
 * 
 * Uses Unicode code point ranges to detect common confusable scripts
 * Allows legitimate single-script internationalized domain names (IDNs)
 */
function hasMixedScriptDomain(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    
    if (hostname.startsWith('xn--') || hostname.includes('.xn--')) {
      const domainWithoutProtocol = url.replace(/^https?:\/\//, '');
      url = domainWithoutProtocol;
    }
    
    const cyrillicRange = /[\u0400-\u04FF]/;
    const greekRange = /[\u0370-\u03FF]/;
    const arabicRange = /[\u0600-\u06FF]/;
    const latinRange = /[a-zA-Z]/;
    
    const ranges = [cyrillicRange, greekRange, arabicRange, latinRange];
    let matchedRanges = 0;
    
    for (const range of ranges) {
      if (range.test(url)) {
        matchedRanges++;
      }
    }
    
    return matchedRanges > 1;
  } catch {
    return false;
  }
}

/**
 * Validates that a URL is a safe HTTP(S) URL
 * Prevents javascript:, data:, and other potentially dangerous protocols
 * Also detects homograph attacks using mixed scripts
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    const urlLower = url.toLowerCase();
    if (dangerousProtocols.some(protocol => urlLower.includes(protocol))) {
      return false;
    }

    if (hasMixedScriptDomain(url)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
