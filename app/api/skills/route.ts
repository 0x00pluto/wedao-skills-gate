import { getSkillsPage } from "@/lib/skills-catalog";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? undefined;

  const pageRaw = parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const pageSizeRaw = parseInt(
    searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
    10,
  );
  const pageSize = Number.isFinite(pageSizeRaw)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, pageSizeRaw))
    : DEFAULT_PAGE_SIZE;

  const result = await getSkillsPage({ q, page, pageSize });

  if (result === null) {
    return NextResponse.json(
      { error: "SERVICE_UNAVAILABLE", message: "目录暂时不可用。" },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
