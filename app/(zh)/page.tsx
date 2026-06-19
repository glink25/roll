import type { Metadata } from "next";

import { SitePage } from "@/components/site-page";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Roll 模拟器｜可分享、可重放的在线随机抽奖工具",
  description: "免费的楼层与名单抽奖工具。支持数字范围、排除楼层、名称列表、自定义种子，以及可分享、可复现的抽奖结果链接。",
  alternates: {
    canonical: siteUrl ? `${siteUrl}/` : undefined,
    languages: siteUrl ? { "zh-CN": `${siteUrl}/`, en: `${siteUrl}/en/` } : undefined,
  },
  openGraph: {
    type: "website", locale: "zh_CN", siteName: "Roll 模拟器",
    title: "Roll 模拟器｜可分享、可重放的在线随机抽奖工具",
    description: "创建楼层或名单抽奖，复制链接即可分享并重放同一结果。",
    ...(siteUrl ? { url: `${siteUrl}/`, images: [`${siteUrl}/og.svg`] } : {}),
  },
  twitter: {
    card: "summary_large_image", title: "Roll 模拟器｜可分享、可重放的在线随机抽奖工具",
    description: "创建楼层或名单抽奖，复制链接即可分享并重放同一结果。",
    ...(siteUrl ? { images: [`${siteUrl}/og.svg`] } : {}),
  },
};

export default function Home() {
  return <SitePage locale="zh" />;
}
