import axios from 'axios';
import { AnalysisResult } from 'types';

type getAllAnalysesResult = {
  success: boolean;
  count: number;
  data: AnalysisResult[];
  totalData: number;
  totalPages: number;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/analyze',
});

// CRUD & Stats

export const analyseAIO = (data: {
  prompts: string[];
  brand: string;
  language?: string;
  location?: string;
}) => api.post<AnalysisResult[]>('/', data);

export const getAllAnalyses = (filters: {
  page: number;
  limit: number;
  prompt?: string;
  brand?: string;
  hasAIO?: boolean;
  language?: string;
  location?: string;
}) => api.get<getAllAnalysesResult>('/', { params: filters });

export const searchAnalyses = (query: string) =>
  api.get<AnalysisResult[]>(`search?q=${encodeURIComponent(query)}`);

export const getBrandMention = (params: { url: string; brand?: string }) =>
  api.get('/countMention', { params });

export const getAnalysisTrends = () => api.get('/trends');

export const generateGooglePrompt = (data: {
  keywords: string[];
  language?: string;
  location?: string;
  count?: number;
  goal?: string;
}) => api.post('/generatePrompt', data);

export const analyzePromptCSV = (formData: FormData) =>
  api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getTopMention = (params: {
  brand: string;
  language?: string;
  location?: string;
  limit?: number;
}) => api.get('/topMention', { params });

export const getSummary = (params: { brand?: string }) =>
  api.get('/summary', { params });

export const getAllBrands = () => api.get('/brands');
