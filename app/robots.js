import { absoluteUrl } from "@/lib/site-url";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/cart",
        "/checkout",
        "/favorites",
        "/kitchen",
        "/orders",
        "/signin",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
