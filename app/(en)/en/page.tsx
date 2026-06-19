import type { Metadata } from "next";

import { SitePage } from "@/components/site-page";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roll Simulator | Shareable, Replayable Random Draws",
  description: "A free online draw tool for number ranges and name lists, with custom seeds and shareable links that reproduce the same results.",
  alternates: {
    canonical: siteUrl ? `${siteUrl}/en/` : undefined,
    languages: siteUrl ? { "zh-CN": `${siteUrl}/`, en: `${siteUrl}/en/` } : undefined,
  },
  openGraph: {
    type: "website", locale: "en_US", siteName: "Roll Simulator",
    title: "Roll Simulator | Shareable, Replayable Random Draws",
    description: "Create a number or name-list draw, then share one link that reproduces the same result.",
    ...(siteUrl ? { url: `${siteUrl}/en/`, images: [`${siteUrl}/og.svg`] } : {}),
  },
  twitter: {
    card: "summary_large_image", title: "Roll Simulator | Shareable, Replayable Random Draws",
    description: "Create a number or name-list draw, then share one link that reproduces the same result.",
    ...(siteUrl ? { images: [`${siteUrl}/og.svg`] } : {}),
  },
};

export default function EnglishHome() {
  return <SitePage locale="en" />;
}
