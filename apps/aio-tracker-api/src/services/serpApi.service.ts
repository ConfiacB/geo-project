import { getJson } from "serpapi";
import { SERPAPI_KEY } from "../config";

type SerpAiResult = {
  overviewText?: string;
  sourceUrls?: string[];
  hasAIO: boolean;
};

type ListItem = {
  title?: string;
  snippet?: string;
};

type ReferenceItem = {
  title: string;
  link: string;
  snippet: string;
  source: string;
  index: number;
};

type BlockType = {
  type: string;
  snippet?: string;
  referenceIndex?: number[];
  list?: ListItem[];
  blockType?: BlockType;
};

const nodeToText = (block: BlockType): string => {
  if (!block) return "";
  if (block.type === "paragraph" && block.snippet) return block.snippet;
  if (block.type === "heading" && block.snippet) return block.snippet;
  if (block.type === "list" && Array.isArray(block.list)) {
    return block.list
      .map((item: ListItem) => {
        if (item.title && item.snippet) return `${item.title} ${item.snippet}`;
        if (item.snippet) return item.snippet;
        return "";
      })
      .join("\n");
  }
  if (block.type === "expandable" && block.blockType) return nodeToText(block.blockType);
  // fallback
  return block.snippet ?? "";
};

export const fetchAiOverviewFromSerpapi = async (
  prompt: string,
  language: string,
  location: string
): Promise<SerpAiResult> => {
  const apiKey = SERPAPI_KEY;
  if (!apiKey) throw new Error("api key required");

  // Basic call to SerpAPI; structure may vary depending on SerpAPI version and engine capabilities.
  // We request standard search and hope 'ai_overview' exists in the response.
  try {
    // the serpapi client expects a callback-style param object; using .json returns a Promise
    const search = await getJson({
      q: prompt,
      api_key: apiKey,
      engine: "google",
      hl: language,
      gl: location,
    });
    const aiOverviewToken = search.ai_overview?.page_token;
    if (!aiOverviewToken) {
      return { hasAIO: false };
    }
    const data = await getJson({
      engine: "google_ai_overview",
      page_token: aiOverviewToken,
      api_key: apiKey,
    });

    const aiOverview = data?.ai_overview;
    if (!aiOverview) {
      // fallback behavior remains empty
      return { hasAIO: false };
    }

    // Build overviewText by concatenating text_blocks in order
    const blocks = Array.isArray(aiOverview.text_blocks) ? aiOverview.text_blocks : [];
    const pieces: string[] = [];
    for (const block of blocks) {
      const t = nodeToText(block);
      if (t && String(t).trim().length > 0) pieces.push(String(t).trim());
    }
    const overviewText = pieces.join("\n\n");

    // Parse references (SerpAPI sample uses `references` array with link/title/index)
    const references = Array.isArray(aiOverview.references) ? aiOverview.references : [];
    const sourceUrls: string[] = references
      .map((r: ReferenceItem) => r?.link)
      .filter((l: string | undefined) => typeof l === "string" && l.length > 0);

    return { overviewText, sourceUrls, hasAIO: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("SerpAPI request failed", err);
    return { hasAIO: false };
  }
};
