# AI Overview Brand Checker

Purpose:

- Query Google (via SerpAPI + Playwright) for an AI Overview on a prompt.
- Detect if a brand/company is mentioned in the overview.
- Crawl the sources the AI referenced and count brand mentions there.
- Save results to MongoDB for later analysis / dashboarding.

Overview of design decisions:

- Use SerpAPI first (less brittle, less scraping; may provide structured aiOverview).
- Fallback to Playwright page scrape of Google Search results to capture the AI Overview element if SerpAPI does not return it.
- Visit sources first with `axios` (faster & cheaper). If there's no clear text, fetch with Playwright.
- Store analysis results in MongoDB for historical aggregation.

Endpoints:

- POST /analyze
- GET /search
- GET /perPeriod
- GET /trends
- POST /upload
- GET /countMention

Run:

1. copy `.env.example` to `.env` and fill keys.
2. `npm install`
3. `npm run dev` (for development) or `npm run build && npm start` for production.

Notes:

- Google structure changes often. The Playwright selectors include robust fallbacks.
