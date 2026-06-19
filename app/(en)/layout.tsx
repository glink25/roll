import type { Metadata, Viewport } from "next";
import "../globals.css";

import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  applicationName: "Roll Simulator",
  keywords: ["random draw", "giveaway picker", "replayable draw", "seeded random", "number picker", "name picker"],
  authors: [{ name: "Roll Simulator" }],
  creator: "Roll Simulator",
  category: "utilities",
  robots: { index: true, follow: true },
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
  colorScheme: "light dark",
};

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="scroll-smooth"><body>{children}</body></html>;
}
