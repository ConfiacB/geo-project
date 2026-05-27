import { GoogleGenAI } from "@google/genai";
import { LanguageAvailable, LocationAvailable } from "../types";

// The API key is automatically picked up using GEMINI_API_KEY
const ai = new GoogleGenAI({});

type promptParam = {
  keywords: string[];
  language: LanguageAvailable;
  location: LocationAvailable;
  count: number;
  goal?: string;
};

export const generatePrompts = async ({
  keywords,
  language,
  location,
  count,
  goal,
}: promptParam): Promise<string[]> => {
  const userPrompt = `
Generate ${count} short, creative and unique prompts (1 short sentences each) related to: ${keywords.join(", ")}.
The goal of those prompts is to search on Google and generate the corresponding AI Overview.
Language: ${language}. Localize tone for: ${location}. ${goal ? "Goal: " + goal : ""}
Output a plain numbered list (no extra explanation).
  `.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  const rawText = response.candidates?.map((c) => c.content?.parts?.map((p) => p.text).join("")).join("\n") ?? "";

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\d+[).\s-]*/, "").trim())
    .filter(Boolean);

  return lines.slice(0, count);
};
