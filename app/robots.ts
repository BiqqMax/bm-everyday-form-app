import type { MetadataRoute } from "next";

import { siteUrl } from "../lib/supabase/env";

const publicPathPrefixes: string[] = ["/", "/about", "/features", "/use-cases", "/support", "/privacy", "/terms"];

const privatePathPrefixes: string[] = [
  "/login",
  "/signup",
  "/dashboard",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/logout",
  "/settings",
  "/forms",
  "/api",
  "/f/",
];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: publicPathPrefixes,
        disallow: privatePathPrefixes,
      },
      {
        userAgent: "Googlebot",
        allow: publicPathPrefixes,
        disallow: privatePathPrefixes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
