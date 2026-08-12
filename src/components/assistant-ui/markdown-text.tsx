"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  type CodeHeaderProps,
  type SyntaxHighlighterProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { type FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { KPIAlertMiniCardList } from "@/components/assistant-ui/kpi-alert-mini-card";
import { cn } from "@/lib/utils";

const findJsonArray = (
  text: string,
): { json: string; start: number; end: number } | null => {
  const start = text.indexOf("[");
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === "[") depth++;
    else if (char === "]") {
      depth--;
      if (depth === 0) {
        return { json: text.slice(start, i + 1), start, end: i + 1 };
      }
    }
  }
  return null;
};

const isKpiAlertArray = (raw: string): boolean => {
  try {
    const parsed = JSON.parse(raw);
    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (item) =>
          item &&
          typeof item === "object" &&
          "title" in item &&
          "value" in item &&
          "target" in item,
      )
    );
  } catch {
    return false;
  }
};

const preprocessKpiAlerts = (text: string): string => {
  if (/```kpi\w*/i.test(text)) return text;

  const found = findJsonArray(text);
  if (!found || !isKpiAlertArray(found.json)) return text;

  return (
    text.slice(0, found.start) +
    "\n\n```kpi-alert\n" +
    found.json +
    "\n```\n\n" +
    text.slice(found.end)
  );
};

const KPIAwareSyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  language,
  code,
  components: { Pre, Code },
}) => {
  const trimmed = code.trim();
  if (language.toLowerCase().startsWith("kpi")) {
    return <KPIAlertMiniCardList raw={trimmed} />;
  }
  return (
    <Pre>
      <Code>{code}</Code>
    </Pre>
  );
};

const MarkdownTextImpl = () => {
  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={{
        ...defaultComponents,
        SyntaxHighlighter: KPIAwareSyntaxHighlighter,
      }}
      preprocess={preprocessKpiAlerts}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  if (language?.toLowerCase().startsWith("kpi")) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-4 rounded-t-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">
      <span className="lowercase [&>span]:text-xs">{language}</span>
      <TooltipIconButton tooltip="Copy" onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  );
};

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const defaultComponents = memoizeMarkdownComponents({
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mb-2 mt-3 scroll-m-20 text-sm font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mb-2 mt-3 scroll-m-20 text-sm font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mb-1.5 mt-2 scroll-m-20 text-sm font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mb-1.5 mt-2 scroll-m-20 text-xs font-semibold tracking-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "my-1.5 text-xs font-semibold first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn("my-1.5 text-xs font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("mb-2 mt-2 leading-snug first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("text-sm font-semibold", className)} {...props} />
  ),
  a: ({ className, ...props }) => (
    <a
      className={cn(
        "text-primary font-medium underline underline-offset-4",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-l-2 pl-3 italic", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("my-2 ml-4 list-disc [&>li]:mt-1", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("my-2 ml-4 list-decimal [&>li]:mt-1", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-2 border-b", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        "my-5 w-full border-separate border-spacing-0 overflow-y-auto",
        className,
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className,
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }) => (
    <sup
      className={cn("[&>a]:text-xs [&>a]:no-underline", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "overflow-x-auto !rounded-t-none rounded-b-lg bg-black p-3 text-xs text-white",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock && "bg-muted rounded border font-semibold",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
});
