import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface QuironBadgeProps {
  label?: string;
  className?: string;
}

export const QuironBadge = ({
  label = "Quirón",
  className,
}: QuironBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap",
      className,
    )}
    style={{
      backgroundColor: "color-mix(in srgb, var(--quiron) 15%, transparent)",
      color: "var(--quiron-dark)",
    }}
  >
    <Sparkles className="h-3 w-3" strokeWidth={2.5} />
    {label}
  </span>
);

export default QuironBadge;
