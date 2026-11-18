import { cn } from "@/lib/utils";
import { ComponentProps, ReactNode } from "react";

export type Tone = "good" | "warn" | "bad";

export const TONE_COLOR: Record<Tone, string> = {
  good: "var(--good)",
  warn: "var(--warn)",
  bad: "var(--bad)",
};

export const TONE_TEXT: Record<Tone, string> = {
  good: "text-good-fg",
  warn: "text-warn-fg",
  bad: "text-bad-fg",
};

export const TONE_BADGE: Record<Tone, string> = {
  good: "bg-good-bg text-good-fg",
  warn: "bg-warn-bg text-warn-fg",
  bad: "bg-bad-bg text-bad-fg",
};

export const viewRoot = "flex flex-col gap-4 text-[14px] leading-[1.45] text-gray-900";
export const subText = "text-xs font-semibold text-gray-500";
export const cardBody = "px-5 pt-3.5 pb-[18px]";
export const eyebrow = "text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-gray-400";
export const track = "overflow-hidden rounded-full bg-gray-100";
export const badge = "ml-auto whitespace-nowrap rounded-full px-[9px] py-1 text-[11px] font-extrabold";
export const pill = "whitespace-nowrap rounded-full bg-primary-soft px-[9px] py-[3px] text-[10.5px] font-extrabold text-primary-bright";
export const btnGhost =
  "cursor-pointer whitespace-nowrap rounded-md border-[1.5px] border-primary-bright px-3 py-[7px] text-xs font-extrabold text-primary-bright transition-colors hover:bg-primary-soft disabled:cursor-default disabled:opacity-60";
export const avatar = "grid flex-none place-items-center rounded-full bg-primary-soft font-extrabold text-primary";

export const DashCard = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    className={cn("rounded-xl border border-gray-200 bg-white shadow-sm", className)}
    {...props}
  />
);

export const DashCardHeader = ({
  title,
  sub,
  children,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-wrap items-start gap-2.5 px-5 pt-4", className)}>
    <h3 className="shrink-0 text-[15px] font-extrabold text-primary-ink">{title}</h3>
    {sub !== undefined && (
      <span className={cn(subText, "order-3 min-w-0 basis-full break-words")}>{sub}</span>
    )}
    {children}
  </div>
);

export const kpiGrid = "grid grid-cols-[repeat(auto-fill,minmax(236px,1fr))] gap-3.5";

export const kpi = {
  card: "group relative flex flex-col rounded-xl border border-gray-200 bg-white px-4 pt-3.5 pb-3 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-bright hover:shadow-[0_8px_20px_rgba(16,24,40,0.1)]",
  head: "flex items-center gap-2",
  title: "min-w-0 flex-1 text-[13.5px] font-extrabold",
  dot: "size-2 flex-none rounded-full",
  q: "mt-[3px] min-h-[30px] text-[11.5px] font-semibold italic text-gray-400",
  valRow: "mt-1 flex items-end gap-2",
  val: "text-[27px] font-black leading-none tracking-[-0.02em]",
  unit: "pb-0.5 text-[13px] font-extrabold text-gray-400",
  meta: "mt-2 text-[11.5px] font-bold text-gray-400",
  fillTrack: "relative h-[9px] overflow-hidden rounded-full bg-gray-100",
  fillBar: "block h-full rounded-full transition-[width] duration-500",
  fillCap: "mt-1.5 block text-[11px] font-extrabold",
  trendBox: "relative mt-3",
  trendSvg: "block h-[52px] w-full",
  trendLbl: "pointer-events-none absolute right-0 -translate-y-1/2 rounded bg-white/85 px-1 text-[9.5px] font-extrabold text-gray-500",
  foot: "mt-auto flex items-center pt-2.5",
  tag: "rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.08em] text-gray-500",
};
