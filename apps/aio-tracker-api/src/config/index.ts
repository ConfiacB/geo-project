export const PORT = Number(process.env.PORT || 4000);
export const USER_AGENT = process.env.USER_AGENT || "Chrome/116.0.0.0";

if (!process.env.MONGODB_URI) {
  console.error("No mongo connection string. Set MONGODB_URI environment.");
  process.exit(1);
}
if (!process.env.SERPAPI_KEY) {
  console.error("No serp API key. Set SERPAPI_KEY environment.");
  process.exit(1);
}
export const MONGODB_URI = process.env.MONGODB_URI;
export const SERPAPI_KEY = process.env.SERPAPI_KEY;
