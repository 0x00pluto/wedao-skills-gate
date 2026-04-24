import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  isWhitelistedAdminEmail,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SessionBody = {
  accessToken?: string;
};

function getSupabaseAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY");
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SessionBody;
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 400 });
    }

    const supabase = getSupabaseAnonClient();
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user?.id || !data.user.email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const allowed = await isWhitelistedAdminEmail(data.user.email);
    if (!allowed) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    await setAdminSessionCookie({ userId: data.user.id, email: data.user.email });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Create admin session failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
