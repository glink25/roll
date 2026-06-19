import type { Metadata, Viewport } from "next";
import "../globals.css";

import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  applicationName: "Roll 模拟器",
  keywords: ["Roll 模拟器", "在线抽奖", "楼层抽奖", "随机抽奖", "名单抽奖", "随机种子"],
  authors: [{ name: "Roll 模拟器" }],
  creator: "Roll 模拟器",
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

export default function ChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className="scroll-smooth"><body>{children}</body></html>;
}
