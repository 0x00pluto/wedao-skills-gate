import { getInstallationTokenString } from "@/lib/github-app";
import { mapParsedYamlToSkillRows } from "@/lib/parse-skills-index";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";
import yaml from "js-yaml";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_OWNER = "WeDAOLabs";
const DEFAULT_REPO = "skills-hub";
const DEFAULT_INDEX_PATH = "skills.index.yaml";

function readSkillsHubConfig(): { owner: string; repo: string; path: string } {
  const owner = (process.env.SKILLS_HUB_OWNER ?? DEFAULT_OWNER).trim();
  const repo = (process.env.SKILLS_HUB_REPO ?? DEFAULT_REPO).trim();
  const path = (process.env.SKILLS_HUB_INDEX_PATH ?? DEFAULT_INDEX_PATH).trim();
  if (!owner || !repo || !path) {
    throw new Error(
      "SKILLS_HUB_OWNER, SKILLS_HUB_REPO, SKILLS_HUB_INDEX_PATH must be non-empty when set",
    );
  }
  return { owner, repo, path };
}

type GhContentFile = {
  type: string;
  encoding?: string;
  content?: string;
};

function encodeRepoContentPath(path: string): string {
  return path
    .split("/")
    .filter((s) => s.length > 0)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

async function fetchRepoFileContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
): Promise<string> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeRepoContentPath(path)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "huyuan-ai-skills-gate-admin-sync",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API ${res.status} when fetching ${owner}/${repo}/${path}: ${text.slice(0, 500)}`,
    );
  }

  const data = (await res.json()) as GhContentFile | unknown[];

  if (Array.isArray(data)) {
    throw new Error(
      `Path ${path} is a directory, not a file. Set SKILLS_HUB_INDEX_PATH to a file path.`,
    );
  }

  if (data.type !== "file" || data.encoding !== "base64" || !data.content) {
    throw new Error("Unexpected GitHub API response: expected base64-encoded file content");
  }

  const normalized = data.content.replace(/\n/g, "");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function authorize(request: NextRequest): boolean {
  const expected = process.env.ADMIN_SYNC_API_KEY;
  if (!expected) {
    return false;
  }
  const provided = request.headers.get("x-api-key");
  return provided === expected;
}

export async function POST(request: NextRequest) {
  if (!process.env.ADMIN_SYNC_API_KEY) {
    console.error("ADMIN_SYNC_API_KEY is not configured");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { owner, repo, path } = readSkillsHubConfig();
    const token = await getInstallationTokenString();
    const yamlText = await fetchRepoFileContent(token, owner, repo, path);

    const parsed = yaml.load(yamlText);
    const rows = mapParsedYamlToSkillRows(parsed);

    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("skills")
      .upsert(rows, { onConflict: "id" })
      .select("id");

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { error: "Sync failed", detail: error.message },
        { status: 500 },
      );
    }

    const count = data?.length ?? rows.length;

    return NextResponse.json({
      ok: true,
      synced: count,
      source: { owner, repo, path },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", detail: message },
      { status: 500 },
    );
  }
}
