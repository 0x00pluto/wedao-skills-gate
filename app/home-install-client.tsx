"use client";

import { installCommandRootClasses } from "@/lib/install-command-layout";
import dynamic from "next/dynamic";
import { useMemo } from "react";

type HomeInstallBlockProps = {
  publicOrigin: string;
  /** 传给安装块根节点，与 dynamic loading 骨架一致 */
  className?: string;
};

function InstallLoading({ className }: { className?: string }) {
  return (
    <div className={installCommandRootClasses(className)}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-800 dark:text-zinc-200">
        一键安装
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">加载中…</p>
    </div>
  );
}

export function HomeInstallBlock({
  publicOrigin,
  className,
}: HomeInstallBlockProps) {
  const Block = useMemo(
    () =>
      dynamic(
        () =>
          import("./install-command-block").then((m) => m.InstallCommandBlock),
        {
          ssr: false,
          loading: () => <InstallLoading className={className} />,
        },
      ),
    [className],
  );

  return <Block publicOrigin={publicOrigin} className={className} />;
}
