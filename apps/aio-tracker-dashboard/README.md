# Asiance AIO Tracker Dashboard (React + TypeScript + Tailwind)

## Setup

1. Install deps: `pnpm install`
2. Run dev server: `pnpm run dev`
3. The app expects backend routes:
   - POST `/analyze`
   - POST `/upload`
   - GET `/search`
   - GET `/perPeriod`
   - GET `/trends`
   - GET `/countMention`
4. Tailwind is preconfigured.

## Files of interest

- `src/components/*` — UI components converted from original HTML/JS
- `src/services/api.ts` — axios wrapper to call your backend
