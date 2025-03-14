export function toPlainText(text: string): string {
  return text.replace(/[\n\r\t]+/g, ' ').trim();
}