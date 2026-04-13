"use client";

import { installCommandRootClasses } from "@/lib/install-command-layout";
import { useCallback, useState } from "react";

type Props = {
  /** 构建时注入的公网根地址，如 https://skills.example.com（无末尾斜杠） */
  publicOrigin: string;
  /** 合并到根容器；例如两栏卡片内传入 `mt-0 max-w-none` */
  className?: string;
};

export function InstallCommandBlock({ publicOrigin, className }: Props) {
  const [origin] = useState(() => {
    const fromEnv = publicOrigin.trim();
    if (fromEnv) return fromEnv;
    return typeof window !== "undefined" ? window.location.origin : "";
  });
  const [copied, setCopied] = useState(false);

  const line =
    origin.length > 0
      ? `curl -fsSL "${origin}/install.sh" | bash`
      : "";

  const copy = useCallback(async () => {
    if (!line) return;
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [line]);

  return (
    <div className={installCommandRootClasses(className)}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
        一键安装
      </h2>
      <p className="mb-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        在本机终端执行（需已安装 Node.js / npm）。
      </p>
      <div className="relative min-h-[3rem] overflow-hidden rounded-xl border border-zinc-200/90 bg-zinc-950/5 dark:border-zinc-700/80 dark:bg-zinc-950/40">
        <button
          type="button"
          onClick={copy}
          disabled={!line}
          title={copied ? "已复制" : "复制命令"}
          aria-label={copied ? "已复制到剪贴板" : "复制安装命令"}
          className="absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200/80 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800/90 dark:hover:text-zinc-100"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden
            >
              <rect width={14} height={14} x={8} y={8} rx={2} ry={2} />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </button>
        <pre className="overflow-x-auto px-4 py-3 pr-14 text-left text-sm text-zinc-900 dark:text-zinc-100">
          <code className="font-mono text-[13px] leading-relaxed">
            {line || "…"}
          </code>
        </pre>
      </div>
    </div>
  );
}
