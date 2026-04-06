"use client";

import dynamic from "next/dynamic";

const InstallCommandBlock = dynamic(
  () =>
    import("./install-command-block").then((m) => m.InstallCommandBlock),
  {
    ssr: false,
    loading: () => (
      <div className="mt-12 w-full max-w-xl text-left">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
          一键安装
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">加载中…</p>
      </div>
    ),
  },
);

export function HomeInstallBlock({ publicOrigin }: { publicOrigin: string }) {
  return <InstallCommandBlock publicOrigin={publicOrigin} />;
}
