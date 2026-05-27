export type SourceResult = {
  url?: string;
  title?: string;
  brandCount?: number;
  error?: string;
};

export type AnalysisResult = {
  _id?: string;
  prompt: string;
  brand: string;
  language: 'en' | 'fr' | 'ko';
  location: 'us' | 'kr' | 'fr' | 'es' | 'ch' | 'gb' | 'de' | 'it' | 'jp' | 'sg';
  overviewText?: string;
  overviewBrandCount?: number;
  sourceResults?: SourceResult[];
  hasAIO: boolean;
  analyzedAt: string;
};
