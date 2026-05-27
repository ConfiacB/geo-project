import { fetchAiOverviewFromSerpapi } from "./serpApi.service";
import { fetchAiOverviewWithPlaywright, fetchPageTextWithPlaywright } from "./playwright.service";
import axios from "axios";
import { countOccurrences } from "../utils";
import { USER_AGENT } from "../config";
import { AnalysisModel, SourceResultDoc } from "../models";
import { LanguageAvailable, LocationAvailable, SourceResult, Summary } from "../types";
import { PipelineStage } from "mongoose";

type AnalyzeParams = {
  prompt: string;
  brand: string;
  language: LanguageAvailable;
  location: LocationAvailable;
};

type AnalysisTrendsReturn = {
  _id: string;
  totalAnalyses: number;
  avgBrandCount: string;
};

type fetchPaginationResult = {
  data: Summary[];
  totalData: number;
  totalPages: number;
};

export const saveAnalysis = async (payload: {
  prompt: string;
  brand: string;
  language: LanguageAvailable;
  location: LocationAvailable;
  overviewText?: string;
  overviewBrandCount: number;
  sourceResults: SourceResultDoc[];
  hasAIO: boolean;
  analyzedAt: string;
}): Promise<void> => {
  const record = new AnalysisModel(payload);
  await record.save();
};

export const getAnalyses = async (
  filter: {
    prompt?: string;
    brand?: string;
    hasAIO?: boolean;
    language?: LanguageAvailable;
    location?: LocationAvailable;
  },
  page: number,
  limit: number
): Promise<fetchPaginationResult> => {
  const skip = (page - 1) * limit;
  const totalData = await AnalysisModel.countDocuments(filter);
  const data = (await AnalysisModel.find(filter)
    .sort({ analyzedAt: -1 }) // newest first
    .skip(skip) // pagination
    .limit(limit)) as Summary[];

  const totalPages = Math.ceil(totalData / limit);

  return { data, totalData, totalPages };
};

export const analyzePrompt = async (param: AnalyzeParams): Promise<Summary> => {
  // 1) Try SerpAPI structured response
  const { prompt, brand = "Asiance", language = "en", location = "kr" } = param;
  const serpResult = await fetchAiOverviewFromSerpapi(prompt, language, location);

  let overviewText = serpResult?.overviewText ?? "";
  let sourceUrls: string[] = serpResult?.sourceUrls ?? [];
  const hasAIO = serpResult.hasAIO;

  // 2) If no overview found via SerpAPI, fallback to Playwright scraping
  if (!overviewText) {
    const pw = await fetchAiOverviewWithPlaywright(prompt);
    overviewText = pw.overviewText ?? "";
    sourceUrls = sourceUrls.length ? sourceUrls : pw.sourceUrls ?? [];
  }

  // Normalize source list
  sourceUrls = Array.from(new Set(sourceUrls));

  // 3) Count brand mentions in overview
  const overviewBrandCount = countOccurrences(overviewText, brand);

  // 4) Visit each source and detect brand occurrences
  const sourceResults: SourceResult[] = [];

  for (const url of sourceUrls) {
    try {
      // Try axios first (fast)
      let pageText = "";
      try {
        const resp = await axios.get(url, {
          timeout: 10000,
          headers: { "User-Agent": USER_AGENT },
        });
        pageText = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
      } catch (err) {
        pageText = "";
      }

      // If axios gave little text, fallback to Playwright
      if (!pageText || pageText.length < 100) {
        const pwText = await fetchPageTextWithPlaywright(url);
        pageText = pwText ?? pageText;
      }

      const count = countOccurrences(pageText, brand);

      sourceResults.push({
        url,
        brandCount: count,
      });
    } catch (err) {
      sourceResults.push({
        url,
        brandCount: 0,
        error: (err as Error).message,
      });
    }
  }

  // Brand always has the first letter in uppercase
  const brandFormatted = brand.charAt(0).toUpperCase() + brand.slice(1);
  const summary = {
    prompt,
    brand: brandFormatted,
    language,
    location,
    overviewText,
    overviewBrandCount,
    sourceResults,
    hasAIO,
    analyzedAt: new Date().toISOString(),
  };

  // 5) Save to DB (non-blocking for response speed we save and return result)
  try {
    await saveAnalysis(summary);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("Saving analysis failed", err);
  }

  return summary;
};

export const getMention = async (url: string, brand: string): Promise<number> => {
  // Try axios first (fast)
  let pageText = "";
  try {
    const resp = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": USER_AGENT },
    });
    pageText = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
  } catch (err) {
    pageText = "";
  }

  // If axios gave little text, fallback to Playwright
  if (!pageText || pageText.length < 100) {
    const pwText = await fetchPageTextWithPlaywright(url);
    pageText = pwText ?? pageText;
  }

  const count = countOccurrences(pageText, brand);

  return count;
};

export const searchText = async (q: string): Promise<Summary[]> => {
  return (
    ((await AnalysisModel.find({
      $or: [
        { brand: { $regex: q, $options: "i" } },
        { prompt: { $regex: q, $options: "i" } },
        { overviewText: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ analyzedAt: -1 })
      .limit(100)) as Summary[]) || []
  );
};

export const analysisTrends = async (): Promise<AnalysisTrendsReturn[]> => {
  return await AnalysisModel.aggregate([
    {
      $group: {
        _id: { brand: "$brand", prompt: "$prompt", language: "$language", location: "$location" },
        totalAnalyses: { $sum: 1 },
        avgBrandCount: { $avg: "$overviewBrandCount" },
      },
    },
    { $sort: { totalAnalyses: -1 } },
  ]);
};

export const topMention = async (
  filters: Record<string, unknown>,
  limit: number
): Promise<Record<string, unknown>[]> => {
  const pipeline: PipelineStage[] = [
    { $match: filters },
    { $unwind: "$sourceResults" },

    // Clean domain name
    {
      $addFields: {
        domain: {
          $replaceAll: {
            input: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: "$sourceResults.url",
                    find: "https://",
                    replacement: "",
                  },
                },
                find: "http://",
                replacement: "",
              },
            },
            find: "www.",
            replacement: "",
          },
        },
      },
    },
    {
      $addFields: {
        domain: {
          $arrayElemAt: [{ $split: ["$domain", "/"] }, 0],
        },
      },
    },

    // First group by prompt+domain to ensure no double counting per prompt
    {
      $group: {
        _id: { prompt: "$prompt", domain: "$domain" },
        brand: { $first: "$brand" },
        language: { $first: "$language" },
        location: { $first: "$location" },
        totalBrandCount: { $sum: { $min: [1, "$sourceResults.brandCount"] } }, // only 1 per prompt/domain
      },
    },

    // Then group by domain for final result
    {
      $group: {
        _id: "$_id.domain",
        totalMentions: { $sum: "$totalBrandCount" }, // total unique prompt/domain mentions
        uniquePrompts: { $sum: 1 },
        brands: { $addToSet: "$brand" },
      },
    },

    { $sort: { totalMentions: -1 } },
    { $limit: limit },
  ];

  return await AnalysisModel.aggregate(pipeline);
};

export const getSummary = async (match: {
  brand?: string;
  language?: string;
  location?: string;
}): Promise<Record<string, unknown>[]> => {
  const summary = await AnalysisModel.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalAnalyses: { $sum: 1 },
        totalAIOFound: { $sum: { $cond: ["$hasAIO", 1, 0] } },
        avgMentions: { $avg: "$overviewBrandCount" },
        brandsTracked: { $addToSet: "$brand" },
        lastAnalysisAt: { $max: "$analyzedAt" },
      },
    },
    {
      $project: {
        _id: 0,
        totalAnalyses: 1,
        totalAIOFound: 1,
        avgMentions: { $round: ["$avgMentions", 2] },
        brandsTracked: { $size: "$brandsTracked" },
        lastAnalysisAt: 1,
      },
    },
  ]);

  const data = summary[0] || {
    totalAnalyses: 0,
    totalAIOFound: 0,
    avgMentions: 0,
    brandsTracked: 0,
    lastAnalysisAt: null,
  };

  return data;
};

export const getBrands = async (): Promise<Record<string, string>[]> => {
  return await AnalysisModel.distinct("brand");
};
