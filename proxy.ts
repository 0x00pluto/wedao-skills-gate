import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isLoginPage = pathname === LOGIN_PATH;

  if (!isAdminArea || isLoginPage) {
    return NextResponse.next();
  }

  const token = request.cookies.get("huyuan_admin_session")?.value;
  if (token) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
