import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skills.huyuan.ai"),
  title: "互远 AI 企业技能中心",
  description: "Huyuan AI 企业技能列表与能力中心",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://skills.huyuan.ai/#organization",
      "name": "互远AI",
      "url": "https://skills.huyuan.ai/",
    },
    {
      "@type": "WebSite",
      "@id": "https://skills.huyuan.ai/#website",
      "url": "https://skills.huyuan.ai/",
      "name": "互远 AI 企业技能中心",
      "inLanguage": "zh-CN",
      "publisher": { "@id": "https://skills.huyuan.ai/#organization" },
      "description":
        "Huyuan AI 企业技能列表与能力中心，汇聚企业级 AI 技能与自动化能力。",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://skills.huyuan.ai/#software-application",
      "url": "https://skills.huyuan.ai/",
      "name": "互远 AI 企业技能中心",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "跨平台（需 Node.js）",
      "description":
        "互远 AI 企业技能分发与管理平台，支持一键安装 CLI 工具与企业技能包。",
      "publisher": { "@id": "https://skills.huyuan.ai/#organization" },
    },
    {
      "@type": "HowTo",
      "@id": "https://skills.huyuan.ai/#howto",
      "name": "一键安装互远 AI 技能",
      "description":
        "通过终端执行一行命令，自动安装 huyuan-ai-cli 并完成技能部署。",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "确保环境准备",
          "text": "确认本机已安装 Node.js 和 npm（https://nodejs.org/）。",
          "url": "https://skills.huyuan.ai/#install-step-1",
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "执行安装命令",
          "text": "在终端运行：curl -fsSL \"https://skills.huyuan.ai/install.sh\" | bash",
          "url": "https://skills.huyuan.ai/#install-step-2",
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "完成安装",
          "text": "脚本自动安装 CLI、完成企业授权登录并安装默认技能包。",
          "url": "https://skills.huyuan.ai/#install-step-3",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* suppressHydrationWarning: 部分浏览器扩展会向 html/body 注入属性（如 data-atm-ext-installed），与 SSR 不一致 */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
