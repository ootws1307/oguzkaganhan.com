"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { Textarea } from "@/components/ui/textarea";

/** Markdown source with a live preview rendered exactly as the site renders it. */
export function MarkdownField({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  invalid,
  rows = 10,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
  rows?: number;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");

  return (
    <div className="border border-input">
      <div className="flex border-b border-input" role="tablist" aria-label="Düzenleme modu">
        {(["write", "preview"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`caps px-3 py-1.5 text-xs transition-colors ${
              mode === m ? "bg-paper-deep text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {m === "write" ? "Yaz" : "Önizleme"}
          </button>
        ))}
        <span className="ml-auto self-center px-3 text-xs text-ink-soft">Markdown</span>
      </div>
      {mode === "write" ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          rows={rows}
          className="min-h-40 border-0 font-mono text-[0.85rem] leading-relaxed focus-visible:ring-0"
        />
      ) : (
        <div className="notes min-h-40 px-3 py-3">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-ink-soft">Önizlenecek metin yok.</p>
          )}
        </div>
      )}
    </div>
  );
}
