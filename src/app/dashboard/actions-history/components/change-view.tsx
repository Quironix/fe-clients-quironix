import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ChangeEntry } from "../labels";

const Old = ({ children }: { children: string }) => (
  <span className="rounded bg-red-50 px-1 text-red-700 line-through decoration-red-400">
    {children}
  </span>
);

const New = ({ children }: { children: string }) => (
  <span className="rounded bg-emerald-50 px-1 text-emerald-800">
    {children}
  </span>
);

const Chip = ({ sign, children }: { sign: "+" | "−"; children: string }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
      sign === "+"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
        : "bg-red-50 text-red-700 ring-red-600/20",
    )}
  >
    {sign} {children}
  </span>
);

/** Un cambio: antes tachado en rojo → después en verde; listas como chips +/−. */
export const ChangeView = ({
  entry,
  compact = false,
}: {
  entry: ChangeEntry;
  compact?: boolean;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5",
      compact ? "min-w-0 flex-nowrap" : "flex-wrap",
    )}
  >
    <span className="shrink-0 text-muted-foreground">{entry.label}:</span>
    {entry.kind === "value" && <span className="truncate">{entry.value}</span>}
    {entry.kind === "list" && (
      <>
        {entry.added?.map((v) => (
          <Chip key={`+${v}`} sign="+">
            {v}
          </Chip>
        ))}
        {entry.removed?.map((v) => (
          <Chip key={`-${v}`} sign="−">
            {v}
          </Chip>
        ))}
      </>
    )}
    {entry.kind === "diff" && (
      <>
        {entry.before !== undefined && <Old>{entry.before}</Old>}
        {entry.before !== undefined && entry.after !== undefined && (
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        {entry.after !== undefined && <New>{entry.after}</New>}
      </>
    )}
  </span>
);
