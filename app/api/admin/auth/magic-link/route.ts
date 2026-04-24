import { NextRequest, NextResponse } from "next/server";

import { isWhitelistedAdminEmail, normalizeEmail } from "@/lib/admin-auth";
import { getSupabaseAnonClient } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getOriginFromRequest(request: NextRequest): string {
  const configured =
    process.env.NEXT_PUBLIC_SKILLS_GATE_ORIGIN?.replace(/\/$/, "") ??
    request.nextUrl.origin;

  // 本地开发统一回跳到 localhost，避免 127.0.0.1 与 dev 资源跨域问题。
  const localhostMatch = configured.match(
    /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i,
  );
  if (localhostMatch) {
    return `http://localhost${localhostMatch[2] ?? ":3000"}`;
  }
  return configured;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const emailRaw = String(formData.get("email") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  const email = normalizeEmail(emailRaw);

  if (!email || !isValidEmail(email)) {
    return NextResponse.redirect(
      new URL("/admin/login?error=invalid_email", request.url),
    );
  }

  try {
    const allowed = await isWhitelistedAdminEmail(email);
    if (!allowed) {
      return NextResponse.redirect(
        new URL("/admin/login?error=not_allowed", request.url),
      );
    }

    const supabase = getSupabaseAnonClient();
    const origin = getOriginFromRequest(request);
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Magic link send failed:", error);
      return NextResponse.redirect(
        new URL("/admin/login?error=send_failed", request.url),
      );
    }

    return NextResponse.redirect(new URL("/admin/login?sent=1", request.url));
  } catch (error) {
    console.error("Magic link API failed:", error);
    return NextResponse.redirect(new URL("/admin/login?error=server", request.url));
  }
}
