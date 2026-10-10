const configuredSiteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

export const siteUrl = new URL(
  configuredSiteUrl.includes("://")
    ? configuredSiteUrl
    : `https://${configuredSiteUrl}`,
);

export function absoluteUrl(path) {
  return new URL(path, siteUrl).toString();
}
