import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于 | 互远 AI 企业技能中心",
  description: "关于互远 AI 企业技能中心。",
};

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        关于
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        内容建设中，敬请期待。
      </p>
    </main>
  );
}
