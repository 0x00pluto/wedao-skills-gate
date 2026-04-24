import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  getAdminSession,
  isWhitelistedAdminEmail,
} from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  const allowed = await isWhitelistedAdminEmail(session.email);
  if (!allowed) {
    await clearAdminSessionCookie();
    redirect("/admin/login?error=not_allowed");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-black">Dashboard</h1>
            <p className="mt-2 text-sm text-black/70">当前登录邮箱：{session.email}</p>
          </div>
          <form action="/api/admin/auth/logout" method="post">
            <button
              type="submit"
              className="h-10 rounded-lg border border-black/15 px-4 text-sm text-black hover:bg-black/5"
            >
              退出登录
            </button>
          </form>
        </div>

        <div className="mt-10 rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-6">
          <p className="text-lg font-medium text-black">Hello World</p>
          <p className="mt-2 text-sm text-black/60">
            这里是管理后台 Dashboard 占位页，后续可继续补充业务模块。
          </p>
        </div>
      </div>
    </main>
  );
}
