import Link from "next/link";
import { getSkillsCount } from "@/lib/skills-catalog";
import { HomeInstallBlock } from "./home-install-client";

export const dynamic = "force-dynamic";

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default async function Home() {
  const publicOrigin = process.env.NEXT_PUBLIC_SKILLS_GATE_ORIGIN ?? "";
  const skillCount = await getSkillsCount();

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]"
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 text-left md:grid-cols-2 md:items-center md:gap-12">
          <div className="max-w-xl md:max-w-none">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
              互远AI · Huyuan AI
            </p>
            <h1 className="mb-8 max-w-xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-50">
              企业技能中心
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              欢迎来到互远 AI 企业技能中心，后续将在此汇聚更多能力与技能。
            </p>
            <p className="mt-6 max-w-lg text-base text-zinc-600 dark:text-zinc-400">
              {skillCount === null ? (
                <>目录暂不可用，请稍后再试或联系管理员。</>
              ) : (
                <>
                  当前目录共{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {skillCount.toLocaleString("zh-CN")}
                  </span>{" "}
                  项技能可用。
                </>
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/skills"
                className="inline-flex items-center rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-zinc-50 shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                浏览全部技能
                <ArrowRightIcon className="ml-1.5 h-4 w-4" />
              </Link>
            </div>
            <span id="install-step-1" />
            <span id="install-step-2" />
            <span id="install-step-3" />
          </div>

          <div className="w-full rounded-2xl border border-zinc-200/90 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-zinc-700/90 dark:bg-zinc-950/80">
            <p className="mb-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              在本站复制一键安装命令，在终端执行即可。
            </p>
            <HomeInstallBlock
              publicOrigin={publicOrigin}
              className="mt-0 max-w-none"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
