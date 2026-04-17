"use client";

import { useCallback, useMemo, useState } from "react";

export function InstallSkillCommand({
  skillId,
  embedded = false,
}: {
  skillId: string;
  embedded?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const command = useMemo(
    () => `huyuan-ai-cli huyuan-skill install ${skillId}`,
    [skillId],
  );

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [command]);

  return (
    <section className={embedded ? "" : "rounded-2xl border border-zinc-200 bg-white/85 p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-950/70"}>
      <h2 className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
        复制并安装技能
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        在终端中执行以下命令安装当前技能。
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/70">
        <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">CLI</span>
          <button
            type="button"
            onClick={copy}
            className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {copied ? "已复制" : "复制命令"}
          </button>
        </div>
        <pre className="overflow-x-auto px-3 py-3 text-[13px] text-zinc-900 dark:text-zinc-100">
          <code>{command}</code>
        </pre>
      </div>
    </section>
  );
}
