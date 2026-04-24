"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function safeNext(input: string | null): string {
  if (!input || !input.startsWith("/") || input.startsWith("//")) {
    return "/admin";
  }
  return input;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("正在验证登录状态...");
  const [nextPath, setNextPath] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(safeNext(params.get("next")));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const params = new URLSearchParams(window.location.search);
        const accessToken =
          hash.get("access_token") ?? params.get("access_token");
        if (!accessToken) throw new Error("missing_access_token");

        const res = await fetch("/api/admin/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });

        if (res.ok) {
          router.replace(nextPath);
          return;
        }

        if (res.status === 403) {
          router.replace("/admin/login?error=not_allowed");
          return;
        }
        router.replace("/admin/login?error=verify_failed");
      } catch (error) {
        console.error("Auth callback failed:", error);
        if (!cancelled) {
          setMessage("登录验证失败，正在返回登录页...");
        }
        router.replace("/admin/login?error=verify_failed");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [nextPath, router]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-20">
      <div className="rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-black">Dashboard Login</h1>
        <p className="mt-3 text-sm text-black/70">{message}</p>
      </div>
    </main>
  );
}
