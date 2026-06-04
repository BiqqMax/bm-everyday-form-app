import type { MetadataRoute } from "next";

import { siteUrl } from "../lib/supabase/env";

const publicPages = ["/", "/about", "/features", "/use-cases", "/support", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return publicPages.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
