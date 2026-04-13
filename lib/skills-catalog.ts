import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";

/** 与 `public.skills` 目录查询 `select` 对齐 */
export type SkillCatalogRow = {
  id: string;
  name: string;
  version: string;
  description: string | null;
  tags: string[];
  updated_at: string | null;
};

export type SkillsPageResult = {
  rows: SkillCatalogRow[];
  total: number;
  page: number;
  pageSize: number;
};

/** 避免破坏 PostgREST `or()` 解析与 LIKE 通配注入 */
function sanitizeSearchInput(q: string): string {
  return q
    .trim()
    .slice(0, 200)
    .replace(/%/g, "")
    .replace(/_/g, "")
    .replace(/,/g, " ")
    .replace(/[()"]/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeRow(row: {
  id: string;
  name: string;
  version: string;
  description: string | null;
  tags: string[] | null;
  updated_at: string | null;
}): SkillCatalogRow {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
  };
}

export async function getSkillsCount(): Promise<number | null> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { count, error } = await supabase
      .from("skills")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("getSkillsCount", error);
      return null;
    }
    return count ?? 0;
  } catch {
    return null;
  }
}

/** PostgREST `or()` 片段；无搜索词时不应用 */
function searchOrFilterClause(q: string): string | null {
  if (q.length === 0) return null;
  const inner = `%${q}%`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const quoted = `"${inner}"`;
  return `name.ilike.${quoted},id.ilike.${quoted},description.ilike.${quoted}`;
}

export async function getSkillsPage(params: {
  q?: string;
  page: number;
  pageSize: number;
}): Promise<SkillsPageResult | null> {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const pageRaw = Math.max(1, Math.floor(params.page));
    const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize)));

    const rawQ = params.q?.trim() ?? "";
    const q = rawQ ? sanitizeSearchInput(rawQ) : "";
    const orClause = searchOrFilterClause(q);

    let countQuery = supabase
      .from("skills")
      .select("id", { count: "exact", head: true });
    if (orClause) countQuery = countQuery.or(orClause);

    const { count: totalCount, error: countError } = await countQuery;
    if (countError) {
      console.error("getSkillsPage count", countError);
      return null;
    }

    const total = totalCount ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(pageRaw, lastPage);

    let dataQuery = supabase
      .from("skills")
      .select("id, name, version, description, tags, updated_at")
      .order("updated_at", { ascending: false, nullsFirst: false });
    if (orClause) dataQuery = dataQuery.or(orClause);

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await dataQuery.range(from, to);

    if (error) {
      console.error("getSkillsPage", error);
      return null;
    }

    const rows = (data ?? []).map((row) =>
      normalizeRow(
        row as {
          id: string;
          name: string;
          version: string;
          description: string | null;
          tags: string[] | null;
          updated_at: string | null;
        },
      ),
    );

    return {
      rows,
      total,
      page,
      pageSize,
    };
  } catch {
    return null;
  }
}
