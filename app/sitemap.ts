import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteUrl
    ? [
        { url: siteUrl, changeFrequency: "monthly", priority: 1, alternates: { languages: { "zh-CN": siteUrl, en: `${siteUrl}/en/` } } },
        { url: `${siteUrl}/en/`, changeFrequency: "monthly", priority: 0.9, alternates: { languages: { "zh-CN": siteUrl, en: `${siteUrl}/en/` } } },
      ]
    : [];
}
