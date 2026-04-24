import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
let cachedAnon: SupabaseClient | null = null;

/**
 * 服务端专用 Supabase 客户端（service_role，可绕过 RLS）。
 * 仅用于 Route Handler / Server Actions 等不可被用户篡改的环境。
 */
export function getSupabaseServiceRoleClient(): SupabaseClient {
  if (cached) {
    return cached;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}

/**
 * 服务端可用的 Supabase anon 客户端（用于 Auth OTP/回调）。
 * 该客户端受项目 Auth/RLS 策略约束，不可替代 service_role。
 */
export function getSupabaseAnonClient(): SupabaseClient {
  if (cachedAnon) {
    return cachedAnon;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY");
  }

  cachedAnon = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAnon;
}
