import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  children: string;
  /** For GitHub READMEs: resolves relative links and images against the repo. */
  repo?: string | null;
  /** Set when the text's language differs from the page (e.g. an English README). */
  lang?: string;
};

function isRelative(url: string) {
  return !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(url);
}

export function Markdown({ children, repo, lang }: MarkdownProps) {
  return (
    <div className="notes" lang={lang}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        // Notes always sit under a page h1 and a section h2, so a README's own
        // "# Title" must not become a second top-level heading.
        components={{
          h1: ({ node: _, ...props }) => <h3 {...props} />,
          h2: ({ node: _, ...props }) => <h4 {...props} />,
          h3: ({ node: _, ...props }) => <h5 {...props} />,
          h4: ({ node: _, ...props }) => <h6 {...props} />,
          h5: ({ node: _, ...props }) => <h6 {...props} />,
        }}
        urlTransform={(url, key) => {
          const safe = defaultUrlTransform(url);
          if (!repo || !safe || !isRelative(safe)) return safe;
          const path = safe.replace(/^\.?\//, "");
          return key === "src"
            ? `https://raw.githubusercontent.com/${repo}/HEAD/${path}`
            : `https://github.com/${repo}/blob/HEAD/${path}`;
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
