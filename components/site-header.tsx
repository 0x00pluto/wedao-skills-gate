"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function navLinkClass(active: boolean): string {
  const base =
    "shrink-0 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] rounded-md px-1 py-0.5 dark:focus-visible:ring-zinc-600 dark:focus-visible:ring-offset-zinc-950";
  if (active) {
    return `${base} text-zinc-900 dark:text-zinc-50`;
  }
  return `${base} text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const onSkills =
    pathname === "/skills" || pathname.startsWith("/skills/");
  const [loginOpen, setLoginOpen] = useState(false);
  const loginTitleId = useId();

  useEffect(() => {
    if (!loginOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLoginOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [loginOpen]);

  const loginModal = loginOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => setLoginOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={loginTitleId}
        className="w-full max-w-sm rounded-xl border border-zinc-200 bg-[var(--background)] p-6 shadow-lg dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id={loginTitleId}
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          登录
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          登录功能正在开发中，内容建设中，敬请期待。
        </p>
        <button
          type="button"
          onClick={() => setLoginOpen(false)}
          className="mt-6 w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          知道了
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b border-zinc-200/90 bg-[var(--background)]/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80"
        role="banner"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-6 sm:gap-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-600"
          >
            <Image
              src="/brand-mark.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 rounded-lg"
              unoptimized
            />
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Huyuan AI SkillHub
            </span>
          </Link>

          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto sm:gap-8"
            aria-label="主导航"
          >
            <Link
              href="/skills"
              className={navLinkClass(onSkills)}
              aria-current={onSkills ? "page" : undefined}
            >
              Skills
            </Link>
            <Link
              href="/skills"
              className={`inline-flex items-center gap-1.5 ${navLinkClass(onSkills)}`}
              aria-current={onSkills ? "page" : undefined}
            >
              <SearchIcon className="size-4 shrink-0 opacity-80" />
              Search
            </Link>
            <Link
              href="/about"
              className={navLinkClass(pathname === "/about")}
              aria-current={pathname === "/about" ? "page" : undefined}
            >
              About
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              登录
            </button>
          </div>
        </div>
      </header>
      {loginModal ? createPortal(loginModal, document.body) : null}
    </>
  );
}
