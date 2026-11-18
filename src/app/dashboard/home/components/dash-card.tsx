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
