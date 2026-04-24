import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    sent?: string;
    next?: string;
  }>;
};

const errorMap: Record<string, string> = {
  invalid_email: "请输入正确的邮箱地址。",
  send_failed: "发送登录邮件失败，请稍后重试。",
  invalid_link: "登录链接无效，请重新获取。",
  verify_failed: "登录链接已过期或验证失败，请重新获取。",
  not_allowed: "该邮箱未加入管理员白名单，请联系管理员。",
  server: "服务暂时不可用，请稍后重试。",
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const errorText = params.error ? errorMap[params.error] : "";
  const sent = params.sent === "1";
  const next = params.next && params.next.startsWith("/") ? params.next : "/admin";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-20">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-black">Admin Login</h1>
        <p className="mt-2 text-sm text-black/70">
          输入管理员邮箱，我们会发送一封魔法链接邮件用于登录后台。
        </p>

        <form
          action="/api/admin/auth/magic-link"
          method="post"
          className="mt-6 flex flex-col gap-4"
        >
          <input type="hidden" name="next" value={next} />
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-black/80">邮箱</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@company.com"
              className="h-11 rounded-lg border border-black/20 px-3 outline-none ring-0 focus:border-black/40"
            />
          </label>
          <button
            type="submit"
            className="h-11 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
          >
            发送登录链接
          </button>
        </form>

        {sent ? <p className="mt-4 text-sm text-green-700">登录邮件已发送，请前往邮箱查收。</p> : null}
        {errorText ? <p className="mt-4 text-sm text-red-600">{errorText}</p> : null}
      </div>
    </main>
  );
}
