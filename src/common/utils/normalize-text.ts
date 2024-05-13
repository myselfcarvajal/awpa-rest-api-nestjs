export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z.\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}
