import * as vscode from 'vscode';
import AppConfig from './app-config';

export function codeOfuscator(diff: string): string {
  const config = vscode.workspace.getConfiguration(AppConfig.name);
  const obfuscationLevel = config.get<string>("obfuscationLevel") ?? "medium";
  const obfuscateWords = config.get<string[]>("obfuscateWords") ?? [];

  const obfuscationStrategies: Record<string, (input: string) => string> = {
    low: obfuscateLow,
    medium: obfuscateMedium,
    high: obfuscateHigh,
  };

  const sanitize = obfuscationStrategies[obfuscationLevel] ?? obfuscationStrategies["medium"];
  let sanitizedDiff = sanitize(diff);

  if (obfuscateWords.length > 0) {
    sanitizedDiff = obfuscateCustomWords(sanitizedDiff, obfuscateWords);
  }
  return sanitizedDiff;
}

function obfuscateLow(diff: string): string {
  return diff
    .replace(/\b(API_KEY|SECRET|TOKEN|PASSWORD|ACCESS_KEY|PRIVATE_KEY)\s*=\s*['"][^'"]+['"]/gi, '$1=REDACTED')
    .replace(/[\w.-]+@[\w.-]+\.\w+/gi, '[EMAIL_REDACTED]')
    .replace(/https?:\/\/[^\s]+/gi, 'https://api.placeholder.com');
}

function obfuscateMedium(diff: string): string {
  return obfuscateLow(diff)
    .replace(/\b\d{12,}\b/g, 'PLACEHOLDER_NUMBER')
    .replace(/\/api\/v\d+\/[\w-]+/g, '/api/vX/ENDPOINT_NAME');
}

function obfuscateHigh(diff: string): string {
  return obfuscateMedium(diff)
    .replace(/\[\s*([^\]]+)\s*\]/g, '[...]') // Acortar arrays
    .replace(/\{[^{}]{20,}\}/g, '{ ... }')  // Acortar JSON
    .replace(/\b[A-Z_]{2,}\b/g, 'CONSTANT_NAME') // Constantes
    .replace(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g, 'VAR_NAME') // Variables genéricas
    .replace(/function\s+[a-zA-Z_][a-zA-Z0-9_]*/g, 'function FUNC_NAME')
    .replace(/class\s+[a-zA-Z_][a-zA-Z0-9_]*/g, 'class CLASS_NAME');
}

function obfuscateCustomWords(diff: string, words: string[]): string {
  if (words.length === 0) { return diff };
  const obfuscateRegex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");
  return diff.replace(obfuscateRegex, 'PLACEHOLDER_VALUE');
}
