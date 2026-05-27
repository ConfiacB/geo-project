export type LanguageAvailable = "en" | "fr" | "ko";
export type LocationAvailable = "us" | "kr" | "fr" | "es" | "ch" | "gb" | "de" | "it" | "jp" | "sg";

export type SourceResult = {
  url: string;
  title?: string;
  overviewMentioned?: boolean;
  brandCount: number;
  error?: string;
};

export type Summary = {
  prompt: string;
  brand: string;
  language: LanguageAvailable;
  location: LocationAvailable;
  overviewText: string;
  overviewBrandCount: number;
  sourceResults: SourceResult[];
  hasAIO: boolean;
  analyzedAt: string;
};
