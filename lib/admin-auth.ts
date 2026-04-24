import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";

const ADMIN_COOKIE_NAME = "huyuan_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminSessionPayload = {
  sub: string;
  email: string;
  exp: number;
};

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }
  return secret;
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function signPayload(payloadBase64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function encodeSession(payload: AdminSessionPayload): string {
  const secret = getSessionSecret();
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

function decodeSession(token: string): AdminSessionPayload | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const secret = getSessionSecret();
  const expected = signPayload(payloadBase64, secret);

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf8"),
    ) as AdminSessionPayload;
    if (!payload.email || !payload.sub || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp * 1000 <= Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function parseAdminSessionToken(
  token: string | undefined,
): AdminSessionPayload | null {
  if (!token) {
    return null;
  }
  return decodeSession(token);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isWhitelistedAdminEmail(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("admin_whitelist")
    .select("email")
    .eq("email", normalized)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Admin whitelist query failed: ${error.message}`);
  }

  return Boolean(data?.email);
}

export async function setAdminSessionCookie(input: {
  userId: string;
  email: string;
}): Promise<void> {
  const payload: AdminSessionPayload = {
    sub: input.userId,
    email: normalizeEmail(input.email),
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  };
  const token = encodeSession(payload);
  const store = await cookies();

  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  return parseAdminSessionToken(store.get(ADMIN_COOKIE_NAME)?.value);
}
