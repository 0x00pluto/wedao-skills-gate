export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="bg-[var(--background)] pb-8 pt-8"
    >
      <div className="px-6">
        <div
          className="mx-auto w-full max-w-7xl border-t border-zinc-200/90 dark:border-zinc-800"
          aria-hidden
        />
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-6xl flex-row items-center px-6">
        <p className="shrink-0 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          HuyanAI SkillHub
        </p>
        <div
          className="min-h-[1.25rem] min-w-0 flex-1"
          aria-hidden
        />
      </div>
    </footer>
  );
}
