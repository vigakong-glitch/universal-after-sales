import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#bca0ff",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "宇宙售后中心｜投诉一下宇宙",
    description: "回收故障碎片，压缩最近的霉运，领取一张宇宙赔偿单。纯娱乐互动体验。",
    openGraph: {
      title: "宇宙售后中心",
      description: "宇宸运行异常？本中心受理一些没办法的事。",
      type: "website",
      locale: "zh_CN",
      images: [{ url: `${origin}/og.png`, width: 1536, height: 1024, alt: "宇宙售后中心" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "宇宙售后中心",
      description: "向宇宙提交故障，领取你的赔偿单。",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
