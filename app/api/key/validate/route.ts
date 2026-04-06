import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 面向调用方的短码，不包含内部实现信息 */
const Code = {
  MissingKey: "MISSING_KEY",
  InvalidJson: "INVALID_JSON",
  InvalidKey: "INVALID_KEY",
  Expired: "EXPIRED",
  ServiceUnavailable: "SERVICE_UNAVAILABLE",
} as const;

const MSG_MISSING_KEY_QUERY =
  "请在请求地址中附带 key 参数（由管理员提供的企业授权码）。";

const MSG_MISSING_KEY_JSON =
  "请在 JSON 请求体中提供字符串字段 key（企业授权码）。";

const MSG_INVALID_JSON =
  "请求体不是合法 JSON，请检查 Content-Type 与正文格式。";

/** 与「已过期」区分：不暗示企业是否在库中，仅表达校验未通过 */
const MSG_INVALID_KEY =
  "授权校验未通过，请核对授权码后重试，或联系管理员。";

const MSG_EXPIRED =
  "该企业授权已到期，请续期后重试或联系管理员。";

const MSG_VALID = "企业授权有效。";

const MSG_SERVICE_UNAVAILABLE =
  "服务暂时不可用，请稍后再试。若问题持续，请联系管理员。";

type CompanyRow = {
  id: string;
  name: string;
  expiry_at: string;
};

async function runValidation(enterpriseKey: string): Promise<NextResponse> {
  let supabase;
  try {
    supabase = getSupabaseServiceRoleClient();
  } catch (err) {
    console.error("Key validate API: Supabase client init failed:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        code: Code.ServiceUnavailable,
        message: MSG_SERVICE_UNAVAILABLE,
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, expiry_at")
    .eq("enterprise_key", enterpriseKey)
    .maybeSingle();

  if (error) {
    console.error("Key validate API: query failed:", error);
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
    return NextResponse.json({
      valid: false as const,
      code: Code.InvalidKey,
      message: MSG_INVALID_KEY,
    });
  }

  const row = data as CompanyRow;
  const expiryAt = new Date(row.expiry_at).toISOString();
  const expired = new Date(row.expiry_at).getTime() <= Date.now();

  if (expired) {
    return NextResponse.json({
      valid: false as const,
      code: Code.Expired,
      message: MSG_EXPIRED,
      expiryAt,
    });
  }

  return NextResponse.json({
    valid: true as const,
    message: MSG_VALID,
    expiryAt,
    companyName: row.name,
  });
}

export async function GET(request: NextRequest) {
  const enterpriseKey = request.nextUrl.searchParams.get("key");

  if (!enterpriseKey?.trim()) {
    return NextResponse.json(
      {
        error: "Bad Request",
        code: Code.MissingKey,
        message: MSG_MISSING_KEY_QUERY,
      },
      { status: 400 },
    );
  }

  return runValidation(enterpriseKey.trim());
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Bad Request",
        code: Code.InvalidJson,
        message: MSG_INVALID_JSON,
      },
      { status: 400 },
    );
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      {
        error: "Bad Request",
        code: Code.MissingKey,
        message: MSG_MISSING_KEY_JSON,
      },
      { status: 400 },
    );
  }

  const raw = (body as Record<string, unknown>).key;
  if (typeof raw !== "string" || !raw.trim()) {
    return NextResponse.json(
      {
        error: "Bad Request",
        code: Code.MissingKey,
        message: MSG_MISSING_KEY_JSON,
      },
      { status: 400 },
    );
  }

  return runValidation(raw.trim());
}
