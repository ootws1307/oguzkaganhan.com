/** The colophon: who published this page, and when it was last set. */
export function SiteFooter({ siteName, updated }: { siteName: string; updated?: string }) {
  return (
    <footer className="page pt-10 pb-12">
      <div className="flex flex-wrap justify-between gap-3 border-t border-rule pt-3 text-xs text-ink-faint">
        <span>
          © {new Date().getFullYear()} {siteName}
        </span>
        {updated && <span>{updated}</span>}
      </div>
    </footer>
  );
}
