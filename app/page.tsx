import { HomeInstallBlock } from "./home-install-client";

export default function Home() {
  const publicOrigin = process.env.NEXT_PUBLIC_SKILLS_GATE_ORIGIN ?? "";

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.22),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-zinc-300/80 to-transparent dark:via-zinc-600/50"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400">
            互远AI · Huyuan AI
          </p>
          <h1 className="mb-8 text-balance text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-zinc-50">
            企业技能中心
          </h1>
          <p className="mx-auto max-w-lg text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            欢迎来到互远 AI 企业技能中心，后续将在此汇聚更多能力与技能。
          </p>
          <HomeInstallBlock publicOrigin={publicOrigin} />
        </div>
      </section>
    </div>
  );
}
