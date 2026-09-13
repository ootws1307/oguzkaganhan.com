"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { syncGithub } from "@/app/(panel)/actions";

function formatSync(iso: string | null) {
  if (!iso) return "hiç çalışmadı";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso),
  );
}

/** "Sync now": pulls public repos from GitHub. New repos arrive hidden in Projects. */
export function SyncButton({ lastSync }: { lastSync: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  function run() {
    setMessage(null);
    startTransition(async () => {
      const result = await syncGithub();
      if (!result.ok) {
        setMessage({ text: result.error, error: true });
        return;
      }
      const { fetched = 0, created = 0 } = result.data ?? {};
      setMessage({ text: `${fetched} repo okundu, ${created} yeni.` });
      router.refresh();
    });
  }

  return (
    <div className="px-4 py-3">
      <dl className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 text-sm">
        <dt lang="en" className="caps text-xs text-ink-soft">
          GitHub
        </dt>
        <dd className="text-right">{formatSync(lastSync)}</dd>
      </dl>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="caps mt-2 flex w-full items-center justify-between border border-ink px-3 py-2 text-sm transition-colors hover:bg-paper-deep disabled:opacity-60"
      >
        {pending ? "Senkronize ediliyor…" : "Şimdi senkronize et"}
        <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} aria-hidden />
      </button>
      <p
        aria-live="polite"
        className={`mt-2 text-xs ${message?.error ? "text-signal" : "text-ink-soft"}`}
      >
        {message?.text}
      </p>
    </div>
  );
}
