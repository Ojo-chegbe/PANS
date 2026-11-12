import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/account",
        "/checkout",
        "/learn",
        "/payment",
        "/download",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: base + "/sitemap.xml",
  };
}
