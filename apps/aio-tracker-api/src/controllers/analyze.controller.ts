import { Request, Response } from "express";
import fs from "fs";
import { HTTPStatus, LanguageAvailable, LocationAvailable } from "../types";
import {
  analysisTrends,
  analyzePrompt,
  getAnalyses,
  getBrands,
  getMention,
  getSummary,
  searchText,
  topMention,
} from "../services/analyze.service";
import csvParser from "csv-parser";
import { unlink } from "fs/promises";
import { generatePrompts } from "../services/googleAi.service";

type CSVRow = {
  prompt: string;
  brand: string;
  language: LanguageAvailable;
  location: LocationAvailable;
};

const VALID_LANGUAGE: LanguageAvailable[] = ["en", "ko", "fr"];
const VALID_COUNTRY: LocationAvailable[] = ["us", "kr", "fr", "es", "ch", "gb", "de", "it", "jp", "sg"];

export const analyzeAIO = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prompts, brand, language = "en", location = "kr" } = req.body;

    if (!prompts || !brand) {
      return res.status(HTTPStatus.BadRequest).json({ error: "missing prompt or brand in request body" });
    }

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(HTTPStatus.BadRequest).json({ error: "prompts must be a non-empty array" });
    }

    if (!VALID_LANGUAGE.includes(language)) {
      return res.status(HTTPStatus.BadRequest).json({ error: "Incorrect query value (language)" });
    }

    if (!VALID_COUNTRY.includes(location)) {
      return res.status(HTTPStatus.BadRequest).json({ error: "Incorrect query value (location)" });
    }

    const resultsSettled = await Promise.allSettled(
      prompts.map((prompt) => analyzePrompt({ prompt, brand, language, location }))
    );

    // Transform into clean response
    const results = resultsSettled.map((result) => {
      if (result.status === "fulfilled") {
        return {
          success: true,
          ...result.value,
        };
      } else {
        return {
          success: false,
          error: result.reason?.message || "Analysis failed",
        };
      }
    });

    const successCount = results.filter((r) => r.success).length;

    return res.json({
      total: results.length,
      successCount,
      failedCount: results.length - successCount,
      data: results,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("analyze route error", err);
    return res.status(HTTPStatus.InternalServerError).json({ error: "analysis_failed" });
  }
};

export const getGooglePrompt = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { keywords, language = "en", location = "kr", count = 5, goal } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(HTTPStatus.BadRequest).json({ error: "prompts must be a non-empty array" });
    }
    let results: string[];

    if (count !== 0) {
      results = await generatePrompts({ keywords, language, location, count, goal });
    } else {
      results = [];
    }

    return res.status(HTTPStatus.OK).json({
      keywords,
      language,
      location,
      count,
      prompts: results,
    });
  } catch (err) {
    return res.status(HTTPStatus.InternalServerError);
  }
};

export const getBrandMention = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { url = "", brand = "Asiance" } = req.query;
    const urlToCheck = url.toString();
    const brandToCheck = brand.toString();
    const result = await getMention(urlToCheck, brandToCheck);
    return res.status(HTTPStatus.OK).json({
      success: true,
      url: urlToCheck,
      brand: brandToCheck,
      count: result,
    });
  } catch (error: unknown) {
    return res.status(HTTPStatus.InternalServerError);
  }
};

export const getAllAnalyses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { prompt, brand, hasAIO, language, location } = req.query;
    const page = parseInt(req.query.page as string) || 1; // default page 1
    const limit = parseInt(req.query.limit as string) || 10; // default 10 items per page

    const filter: Record<string, unknown> = {};

    if (brand) filter.brand = brand.toString();
    if (prompt) filter.prompt = { $regex: prompt.toString(), $options: "i" }; // case-insensitive search
    if (hasAIO !== undefined) filter.hasAIO = hasAIO === "true"; // convert query string to boolean
    if (language && !VALID_LANGUAGE.includes(language.toString() as LanguageAvailable)) {
      return res.status(HTTPStatus.BadRequest).json({ error: "Incorrect value query (language)" });
    } else if (language) {
      filter.language = language.toString();
    }
    if (location && !VALID_COUNTRY.includes(location.toString() as LocationAvailable)) {
      return res.status(HTTPStatus.BadRequest).json({ error: "Incorrect value query (location" });
    } else if (location) {
      filter.location = location.toString();
    }

    const analyses = await getAnalyses(filter, page, limit);

    return res.status(HTTPStatus.OK).json({
      success: true,
      count: analyses.data.length,
      data: analyses.data,
      totalData: analyses.totalData,
      totalPages: analyses.totalPages,
    });
  } catch (error: unknown) {
    return res.status(HTTPStatus.InternalServerError);
  }
};

export const searchAnalyses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(HTTPStatus.BadRequest).json({ error: "Missing search query (q)" });
    }

    // Use case-insensitive regex search on relevant fields
    const results = await searchText(q);
    return res.status(HTTPStatus.OK).json({ success: true, count: results.length, data: results });
  } catch (error: unknown) {
    return res.status(HTTPStatus.InternalServerError);
  }
};

export const getAnalysisTrends = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await analysisTrends();

    return res.status(HTTPStatus.OK).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(HTTPStatus.InternalServerError).json({ error: "Failed to fetch trends" });
  }
};

export const analyzePromptCSV = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return res.status(HTTPStatus.BadRequest).json({ error: "No CSV file uploaded" });
    }
    const filePath = req.file.path;
    const rows: CSVRow[] = [];

    // Parse CSV file
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => {
          if (data.prompt && data.brand) {
            rows.push({
              prompt: data.prompt.trim(),
              brand: data.brand.trim(),
              language: data.language.toLowerCase() as LanguageAvailable,
              location: data.location.toLowerCase() as LocationAvailable,
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    // Parallel analysis (limit concurrency if needed)
    const resultsSettled = await Promise.allSettled(
      rows.map(async (row) => {
        return analyzePrompt(row);
      })
    );

    const results = resultsSettled.map((result) => {
      if (result.status === "fulfilled") {
        return {
          success: true,
          ...result.value,
        };
      } else {
        return {
          success: false,
          error: result.reason?.message || "Analysis failed",
        };
      }
    });
    const successCount = results.filter((r) => r.success).length;

    // Cleanup file
    await unlink(filePath).catch(() => null);

    return res.status(HTTPStatus.OK).json({
      total: results.length,
      successCount,
      failedCount: results.length - successCount,
      data: results,
    });
  } catch (error) {
    return res.status(HTTPStatus.InternalServerError).json({ error: "Failed to process CSV file" });
  }
};

export const getTopMention = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { brand, language, location, limit = 10 } = req.query;

    if (!brand) {
      return res.status(400).json({ error: "brand is required" });
    }

    const filters: Record<string, unknown> = { brand: brand.toString() };
    if (language) filters.language = language.toString();
    if (location) filters.location = location.toString();

    const results = await topMention(filters, Number(limit));

    return res.status(HTTPStatus.OK).json({
      success: true,
      brand,
      count: results.length,
      data: results,
    });
  } catch (err) {
    return res.status(HTTPStatus.InternalServerError).json({ error: "Failed to get top mention for that Brand" });
  }
};

export const getAnalysisSummary = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { brand, language, location } = req.query;
    const match: { brand?: string; language?: string; location?: string } = {};

    if (brand) match.brand = brand.toString();
    if (language) match.language = language.toString();
    if (location) match.location = location.toString();

    const results = await getSummary(match);

    return res.status(HTTPStatus.OK).json({
      success: true,
      data: results,
    });
  } catch (err) {
    return res.status(HTTPStatus.InternalServerError).json({ error: "Failed to get top mention for that Brand" });
  }
};

export const getAllBrands = async (req: Request, res: Response): Promise<Response> => {
  try {
    const results = await getBrands();

    return res.status(HTTPStatus.OK).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    return res.status(HTTPStatus.InternalServerError).json({ error: "Failed to get top mention for that Brand" });
  }
};
