/**
 * 将 skills.index.yaml 解析结果映射为 `public.skills` 行。
 * 支持：根数组、或 { skills | items | catalog } 包裹的数组。
 */

export type SkillRow = {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  updated_at: string | null;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown, fallback = ""): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => asString(x).trim())
    .filter((s) => s.length > 0);
}

/** 接受 YYYY-MM-DD、可被 Date 解析的字符串，或 js-yaml 解析出的 Date 对象，输出 YYYY-MM-DD 或 null */
function normalizeDate(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  // js-yaml 常把未加引号的日期标量解析为 Date，仅处理 string 会得到 null
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10);
  }
  if (typeof v === "string") {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }
  return null;
}

function rowFromEntry(raw: unknown, index: number): SkillRow | null {
  if (!isRecord(raw)) return null;

  const id = asString(raw.id ?? raw.skill_id ?? raw.slug).trim();
  if (!id) {
    console.warn(`skills.index: skip entry #${index}: missing id`);
    return null;
  }

  const name = asString(raw.name ?? raw.title, id);
  const version = asString(raw.version ?? raw.ver, "0.0.0");
  const description = asString(raw.description ?? raw.desc ?? raw.summary, "");

  const tags =
    Array.isArray(raw.tags) ? asStringArray(raw.tags) :
    typeof raw.tags === "string" ? asStringArray(raw.tags.split(/[,\s]+/)) :
    [];

  const updated_at = normalizeDate(
    raw.updated_at ??
      raw.update_at ??
      raw.updatedAt ??
      raw.date ??
      raw.index_updated,
  );

  return {
    id,
    name,
    version,
    description,
    tags,
    updated_at,
  };
}

function extractArray(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (!isRecord(parsed)) return null;

  const keys = ["skills", "items", "catalog", "list"] as const;
  for (const k of keys) {
    const v = parsed[k];
    if (Array.isArray(v)) return v;
  }
  return null;
}

export function mapParsedYamlToSkillRows(parsed: unknown): SkillRow[] {
  const arr = extractArray(parsed);
  if (!arr) {
    throw new Error(
      "skills.index.yaml: expected a root array or an object with skills/items/catalog/list array",
    );
  }

  const rows: SkillRow[] = [];
  arr.forEach((entry, i) => {
    const row = rowFromEntry(entry, i);
    if (row) rows.push(row);
  });

  if (rows.length === 0) {
    throw new Error("skills.index.yaml: no valid skill entries after parsing");
  }

  return rows;
}
