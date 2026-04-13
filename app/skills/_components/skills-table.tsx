import type { SkillCatalogRow } from "@/lib/skills-catalog";

function formatUpdatedAt(value: string | null): string {
  if (!value) return "—";
  try {
    const d =
      value.length <= 10 ? new Date(`${value}T00:00:00`) : new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(d);
  } catch {
    return value;
  }
}

export function SkillsTable({ rows }: { rows: SkillCatalogRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400">
        没有匹配的技能，请调整搜索词或清空筛选。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              技能
            </th>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              描述
            </th>
            <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              标签
            </th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100">
              更新
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className={
                index % 2 === 1
                  ? "bg-zinc-50/80 dark:bg-zinc-900/25"
                  : "bg-white dark:bg-zinc-950/40"
              }
            >
              <td className="align-top px-4 py-3">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {row.name}
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {row.id}
                  {row.version ? (
                    <>
                      {" "}
                      · {row.version}
                    </>
                  ) : null}
                </div>
              </td>
              <td className="max-w-md align-top px-4 py-3 text-zinc-600 dark:text-zinc-400">
                <p className="line-clamp-2" title={row.description ?? ""}>
                  {row.description?.trim() ? row.description : "—"}
                </p>
              </td>
              <td className="align-top px-4 py-3">
                {row.tags.length === 0 ? (
                  <span className="text-zinc-400 dark:text-zinc-500">—</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {row.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="whitespace-nowrap align-top px-4 py-3 text-zinc-600 dark:text-zinc-400">
                {formatUpdatedAt(row.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
