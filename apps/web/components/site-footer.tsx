/** The set closes on a plain colophon strip. */
export function SiteFooter({ siteName }: { siteName: string }) {
  return (
    <footer className="mx-auto max-w-[1480px] px-3 pt-6 pb-8 sm:px-6">
      <div className="caps tnum flex flex-wrap justify-between gap-3 border-t border-rule pt-3 text-xs text-ink-soft">
        <span>
          © {new Date().getFullYear()} {siteName}
        </span>
        <span>oguzkaganhan.com</span>
      </div>
    </footer>
  );
}
