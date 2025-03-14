import { sanitizeInput } from "./sanitize-input";

export function replacePlaceholders(prompt: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce((acc, [key, value]) => {
    const sanitizedValue = sanitizeInput(value?.trim() || '');
    return acc.replace(new RegExp(`\\{${key}\\}|\\$\\{${key}\\}`, "g"), sanitizedValue);
  }, prompt);
}