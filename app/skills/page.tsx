import { getSkillsPage } from "@/lib/skills-catalog";
import type { Metadata } from "next";
import { SkillsInfiniteList } from "./_components/skills-infinite-list";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export const metadata: Metadata = {
  title: "技能目录 | 互远 AI 企业技能中心",
  description: "浏览互远 AI 企业技能中心公开技能目录。",
};

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;

  const result = await getSkillsPage({ q, page: 1, pageSize: PAGE_SIZE });

  const rows = result?.rows ?? [];
  const total = result !== null ? result.total : null;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]"
        aria-hidden
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 sm:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            技能目录
            {total !== null ? (
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                {" "}
                ({total.toLocaleString("zh-CN")})
              </span>
            ) : null}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            浏览技能库；支持按名称、标识或描述搜索。
          </p>
        </header>

        {result === null ? (
          <p className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-6 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
            目录暂时不可用，请稍后再试或联系管理员。
          </p>
        ) : (
          <>
            <form
              method="get"
              action="/skills"
              className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <div className="relative flex-1">
                <span
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                  aria-hidden
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="按名称、标识或描述搜索…"
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-900 shadow-sm outline-none ring-zinc-400 placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
                  autoComplete="off"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                搜索
              </button>
            </form>

            <SkillsInfiniteList
              key={q ?? ""}
              initialRows={rows}
              total={result.total}
              q={q ?? ""}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </main>
    </div>
  );
}
