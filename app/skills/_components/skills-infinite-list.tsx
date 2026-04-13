"use client";

import type { SkillCatalogRow } from "@/lib/skills-catalog";
import { useCallback, useEffect, useRef, useState } from "react";
import { SkillsTable } from "./skills-table";

type ApiSkillsResponse = {
  rows: SkillCatalogRow[];
  total: number;
  page: number;
  pageSize: number;
};

function appendDedupe(
  prev: SkillCatalogRow[],
  next: SkillCatalogRow[],
): SkillCatalogRow[] {
  const ids = new Set(prev.map((r) => r.id));
  const merged = [...prev];
  for (const row of next) {
    if (!ids.has(row.id)) {
      ids.add(row.id);
      merged.push(row);
    }
  }
  return merged;
}

type Props = {
  initialRows: SkillCatalogRow[];
  total: number;
  q: string;
  pageSize: number;
};

export function SkillsInfiniteList({
  initialRows,
  total,
  q,
  pageSize,
}: Props) {
  const [rows, setRows] = useState<SkillCatalogRow[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastLoadedPageRef = useRef(1);
  const requestIdRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = total > 0 && rows.length < total;

  const loadNext = useCallback(async () => {
    if (loadingRef.current) return;
    const nextPage = lastLoadedPageRef.current + 1;

    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);
    const reqId = ++requestIdRef.current;

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));

    try {
      const res = await fetch(`/api/skills?${params.toString()}`);
      if (!res.ok) {
        throw new Error("bad");
      }
      const data = (await res.json()) as ApiSkillsResponse;
      if (reqId !== requestIdRef.current) return;

      lastLoadedPageRef.current = data.page;
      setRows((prev) => appendDedupe(prev, data.rows));
    } catch {
      if (reqId === requestIdRef.current) {
        setLoadError("加载更多失败，请稍后重试。");
      }
    } finally {
      if (reqId === requestIdRef.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [pageSize, q]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries[0]?.isIntersecting;
        if (hit && !loadingRef.current) {
          void loadNext();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadNext]);

  return (
    <div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        {total === 0
          ? "0 项技能"
          : `已加载 ${rows.length.toLocaleString("zh-CN")} / ${total.toLocaleString("zh-CN")} 项技能`}
      </p>

      <SkillsTable rows={rows} />

      {loadError ? (
        <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
          {loadError}
        </p>
      ) : null}

      <div
        ref={sentinelRef}
        className="flex min-h-12 flex-col items-center justify-center py-6"
        aria-hidden={!loading && !hasMore}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span
              className="inline-block size-5 animate-spin rounded-full border-2 border-solid border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300"
              aria-hidden
            />
            <span>正在加载更多…</span>
          </div>
        ) : !hasMore && rows.length > 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            已加载全部
          </p>
        ) : null}
      </div>
    </div>
  );
}
