import { getInstallationTokenString } from "@/lib/github-app";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const enterpriseKey = request.nextUrl.searchParams.get("key");
  const validKey = process.env.VALID_COMPANY_KEY;

  if (!validKey) {
    console.error("VALID_COMPANY_KEY is not configured");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  if (enterpriseKey !== validKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = await getInstallationTokenString();
    return NextResponse.json({ token });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
