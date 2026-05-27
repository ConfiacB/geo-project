export const normalizeText = (text: string): string => text.replace(/\s+/g, " ").trim().toLowerCase();

export const countOccurrences = (text: string | undefined, term: string): number => {
  if (!text || !term) return 0;
  const normalized = normalizeText(text);
  const needle = normalizeText(term);
  // escape regex special chars in needle
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "g");
  const matches = normalized.match(re);
  return matches ? matches.length : 0;
};
