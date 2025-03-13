import * as vscode from 'vscode';

export function sanitizeDiff(diff: string): string {
  const config = vscode.workspace.getConfiguration("gitAiCommits");
  const obfuscationLevel = config.get<string>("obfuscationLevel") || "medium";
  const obfuscateWords = config.get<string[]>("obfuscateWords") || [];

  if (obfuscationLevel === "low") {
    return diff
      .replace(/(API_KEY|SECRET|TOKEN|PASSWORD|ACCESS_KEY|PRIVATE_KEY)\s*=\s*['"][^'"]+['"]/gi, '$1=REDACTED')
      .replace(/[\w.-]+@[\w.-]+\.\w+/gi, '[EMAIL_REDACTED]')
      .replace(/https?:\/\/[^\s]+/g, 'https://api.placeholder.com');
  }

  // Obfuscación media: incluye datos estructurales
  if (obfuscationLevel === "medium") {
    diff = diff
      .replace(/\b\d{12,}\b/g, 'PLACEHOLDER_NUMBER')
      .replace(/\/api\/v[0-9]+\/[a-zA-Z0-9_-]+/g, '/api/vX/ENDPOINT_NAME');
  }

  if (obfuscationLevel === "high") {
    diff = diff
      .replace(/\[\s*([^\]]+)\s*\]/g, '[...]') // Acortar arrays
      .replace(/\{[^{}]{20,}\}/g, '{ ... }')     // Acortar JSON
      .replace(/\b[A-Z_]{2,}\b/g, 'CONSTANT_NAME') // Constantes
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, 'VAR_NAME') // Variables genéricas
      .replace(/function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'function FUNC_NAME')
      .replace(/class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'class CLASS_NAME');
  }

  if (obfuscateWords.length > 0) {
    const obfuscateRegex = new RegExp(`\\b(${obfuscateWords.join("|")})\\b`, "gi");
    diff = diff.replace(obfuscateRegex, 'PLACEHOLDER_VALUE');
  }

  return diff;
}
