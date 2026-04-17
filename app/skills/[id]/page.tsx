import { getSkillById } from "@/lib/skills-catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InstallSkillCommand } from "./_components/install-skill-command";

export const dynamic = "force-dynamic";

function formatUpdatedAt(value: string | null): string {
  if (!value) return "未知";
  try {
    const d =
      value.length <= 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(d);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = await getSkillById(id);

  if (!skill) {
    return {
      title: "技能未找到 | 互远 AI 企业技能中心",
      description: "请求的技能不存在或暂不可用。",
    };
  }

  const versionText = skill.version?.trim() ? ` v${skill.version}` : "";
  return {
    title: `${skill.name}${versionText} | 互远 AI 企业技能中心`,
    description: skill.description?.trim() || `${skill.name} 技能详情页`,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = await getSkillById(id);

  if (!skill) notFound();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]"
        aria-hidden
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/70 sm:p-7">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Skill
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {skill.name}
            </h1>
            <p className="mt-5 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {skill.description?.trim() || "暂无描述"}
            </p>
          </section>
          <aside>
            <section className="rounded-2xl border border-zinc-200 bg-white/85 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/70">
              <InstallSkillCommand skillId={skill.id} embedded />
              <div className="my-5 border-t border-zinc-200 dark:border-zinc-700" />
              <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
                技能信息
              </h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
                  <dt className="text-zinc-500 dark:text-zinc-400">作者</dt>
                  <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                    HuYuan AI
                  </dd>
                </div>
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
                  <dt className="text-zinc-500 dark:text-zinc-400">版本</dt>
                  <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                    {skill.version || "未知"}
                  </dd>
                </div>
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
                  <dt className="text-zinc-500 dark:text-zinc-400">标识</dt>
                  <dd className="mt-1 break-all font-medium text-zinc-900 dark:text-zinc-100">
                    {skill.id}
                  </dd>
                </div>
                <div className="border-b border-zinc-200 pb-3 dark:border-zinc-700">
                  <dt className="text-zinc-500 dark:text-zinc-400">更新时间</dt>
                  <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">
                    {formatUpdatedAt(skill.updated_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 dark:text-zinc-400">标签</dt>
                  <dd className="mt-1">
                    {skill.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {skill.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        暂无标签
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
