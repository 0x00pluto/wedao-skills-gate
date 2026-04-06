import { getInstallationTokenString } from "@/lib/github-app";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 面向调用方的短码，不包含内部实现信息 */
const Code = {
  MissingSkillId: "MISSING_SKILL_ID",
  MissingKey: "MISSING_KEY",
  AccessDenied: "ACCESS_DENIED",
  ServiceUnavailable: "SERVICE_UNAVAILABLE",
} as const;

const MSG_MISSING_SKILL_ID =
  "请在请求地址中附带 skillId 参数，用于指定要访问的技能。";

const MSG_MISSING_KEY =
  "请在请求地址中附带 key 参数（由管理员提供的企业授权码）。";

const MSG_ACCESS_DENIED =
  "企业授权码无效、已过期，或您尚未获得该技能的访问权限。请核对授权码与技能是否正确，或联系管理员。";

const MSG_SERVICE_UNAVAILABLE =
  "服务暂时不可用，请稍后再试。若问题持续，请联系管理员。";

export async function GET(request: NextRequest) {
  const enterpriseKey = request.nextUrl.searchParams.get("key");
  const skillIdRaw = request.nextUrl.searchParams.get("skillId");

  if (!skillIdRaw?.trim()) {
    return NextResponse.json(
      {
        error: "Bad Request",
        code: Code.MissingSkillId,
        message: MSG_MISSING_SKILL_ID,
      },
      { status: 400 },
    );
  }

  const skillId = skillIdRaw.trim();

  if (!enterpriseKey) {
    return NextResponse.json(
      {
        error: "Forbidden",
        code: Code.MissingKey,
        message: MSG_MISSING_KEY,
      },
      { status: 403 },
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch (err) {
    console.error("Token API: Supabase client init failed:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: Code.ServiceUnavailable,
        message: MSG_SERVICE_UNAVAILABLE,
      },
      { status: 500 },
    );
  }

  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("companies")
    .select("id, company_skills!inner(skill_id)")
    .eq("enterprise_key", enterpriseKey)
    .eq("company_skills.skill_id", skillId)
    .gt("expiry_at", nowIso)
    .maybeSingle();

  if (error) {
    console.error("Token API: authorization query failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: Code.ServiceUnavailable,
        message: MSG_SERVICE_UNAVAILABLE,
      },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: "Forbidden",
        code: Code.AccessDenied,
        message: MSG_ACCESS_DENIED,
      },
      { status: 403 },
    );
  }

  try {
    const token = await getInstallationTokenString();
    return NextResponse.json({ token });
  } catch (err) {
    console.error("Token API: GitHub installation token failed:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: Code.ServiceUnavailable,
        message: MSG_SERVICE_UNAVAILABLE,
      },
      { status: 500 },
    );
  }
}
