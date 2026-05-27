import { chromium, Browser } from "playwright";
import { USER_AGENT } from "../config";

const LAUNCH_OPTIONS = {
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

type SerpAiResult = {
  overviewText?: string;
  sourceUrls?: string[];
  hasAIO: boolean;
};

const getBrowser = async (): Promise<Browser> => {
  return chromium.launch(LAUNCH_OPTIONS);
};

export const fetchAiOverviewWithPlaywright = async (prompt: string): Promise<SerpAiResult> => {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: USER_AGENT ?? undefined,
  });
  const page = await context.newPage();

  try {
    const query = encodeURIComponent(prompt);
    const url = `https://www.google.com/search?q=${query}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait briefly for dynamic content
    await page.waitForTimeout(1000);

    // Try multiple selectors to find the "AI Overview" area.
    // Google markup changes frequently; we attempt a sequence of guess selectors and fallbacks.
    const selectors = [
      '[data-attrid="wa:/description"]', // sometimes used
      "[data-ai-overview]", // hypothetical
      "g-ai-overview", // hypothetical web-component
      ".xpdopen .kp-wholepage", // generic
      ".Z0LcW", // small answer selector (common)
      'div[role="heading"] ~ div', // fallback: next sibling after heading
    ];

    let overviewText = "";
    for (const sel of selectors) {
      try {
        const exists = await page.$(sel);
        if (!exists) continue;
        const txt = await page.locator(sel).innerText();
        if (txt && txt.length > 20) {
          overviewText = txt;
          break;
        }
      } catch {
        // continue to next
      }
    }

    // If still empty, try to collect top answer/featured snippet
    if (!overviewText) {
      try {
        const featured = await page
          .locator('div[data-attrid="wa:/description"], div[data-attrid^="kc:/"]')
          .allTextContents();
        overviewText = featured.join("\n").trim();
      } catch {
        // ignore
      }
    }

    // Collect candidate source urls inside the snippet/AI area by scanning anchors in page that look like sources
    const anchors = await page.$$eval("a", (els) =>
      els.map((a) => ({ href: (a as HTMLAnchorElement).href, text: a.textContent }))
    );

    // Filter anchors for external links (not google internal)
    const sourceUrls = anchors
      .map((a) => a.href)
      .filter((u) => u && !u.includes("google.com") && (u.startsWith("http") || u.startsWith("https")));

    await context.close();
    await browser.close();

    return { overviewText, sourceUrls: sourceUrls.slice(0, 10), hasAIO: true };
  } catch (err) {
    await context.close();
    await browser.close();
    // eslint-disable-next-line no-console
    console.warn("Playwright fetchAiOverview failed", err);
    return { overviewText: "", sourceUrls: [], hasAIO: false };
  }
};

export const fetchPageTextWithPlaywright = async (pageUrl: string): Promise<string | undefined> => {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: USER_AGENT ?? undefined,
  });
  const page = await context.newPage();

  try {
    await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForTimeout(1200);

    // Try to extract main text: article, main, body
    const candidates = [
      "article",
      "main",
      'div[id*="content"]',
      'div[class*="article"]',
      'div[class*="content"]',
      "body",
    ];

    for (const sel of candidates) {
      try {
        const el = await page.$(sel);
        if (!el) continue;
        const txt = await el.innerText();
        if (txt && txt.length > 200) {
          await context.close();
          await browser.close();
          return txt;
        }
      } catch {
        // continue
      }
    }

    // final fallback: full page text
    const full = await page.content();
    await context.close();
    await browser.close();
    return full;
  } catch (err) {
    await context.close();
    await browser.close();
    // eslint-disable-next-line no-console
    console.warn("Playwright fetchPageText failed for", pageUrl, err);
    return undefined;
  }
};
