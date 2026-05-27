import { AnalysisResult } from 'types';
import { create } from 'zustand';

type Filters = {
  prompt?: string;
  brand?: string;
  hasAIO?: boolean;
  language?: string;
  location?: string;
};

type AnalysisStore = {
  analyses: AnalysisResult[];
  trends: any[];
  summary: any | null;
  loading: boolean;
  filters: Filters;

  // pagination
  page: number;
  limit: number;
  totalData: number;
  totalPages: number;

  // prompt and tab management
  prompts: string[];
  activeTab: 'manual' | 'csv' | 'keywords' | 'urlChecker';

  setAnalyses: (list: AnalysisResult[], totalPages?: number) => void;
  setTrends: (data: any[]) => void;
  setSummary: (data: any) => void;
  setLoading: (v: boolean) => void;
  setFilters: (f: Partial<AnalysisStore['filters']>) => void;
  resetFilters: () => void;

  // pagination
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  setTotalData: (t: number) => void;
  resetPagination: () => void;

  // prompt and tab management
  setPrompts: (prompts: string[]) => void;
  addPrompts: (prompts: string[]) => void;
  clearPrompts: () => void;
  setActiveTab: (taab: 'manual' | 'csv' | 'keywords' | 'urlChecker') => void;
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analyses: [],
  trends: [],
  summary: null,
  loading: false,
  filters: {},

  page: 1,
  limit: 10,
  totalData: 0,
  totalPages: 1,

  prompts: [],
  activeTab: 'manual',

  setAnalyses: (list, totalPages) =>
    set({ analyses: list, totalPages: totalPages ?? 1 }),
  setTrends: (data) => set({ trends: data }),
  setSummary: (data) => set({ summary: data }),
  setLoading: (v) => set({ loading: v }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: {} }),

  setPage: (p) => set({ page: p }),
  setLimit: (l) => set({ limit: l, page: 1 }), // reset page to 1 when limit changes
  setTotalData: (t) => set({ totalData: t }),
  resetPagination: () => set({ page: 1, limit: 10, totalPages: 1 }),

  setPrompts: (prompts) => set({ prompts }),
  addPrompts: (prompts) =>
    set((state) => ({ prompts: [...state.prompts, ...prompts] })),
  clearPrompts: () => set({ prompts: [] }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
