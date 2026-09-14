import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface QuironMarkProps {
  size?: "sm" | "md";
  withWordmark?: boolean;
  className?: string;
}

const SIZE = {
  sm: { box: "h-5 w-5", icon: "h-3 w-3", text: "text-xs" },
  md: { box: "h-7 w-7", icon: "h-4 w-4", text: "text-sm" },
} as const;

export const QuironMark = ({
  size = "sm",
  withWordmark = false,
  className,
}: QuironMarkProps) => {
  const s = SIZE[size];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md text-[color:var(--quiron-foreground)]",
          s.box,
        )}
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--quiron), var(--quiron-dark))",
        }}
      >
        <Sparkles className={s.icon} strokeWidth={2.5} />
      </span>
      {withWordmark && (
        <span
          className={cn("font-semibold tracking-tight", s.text)}
          style={{ color: "var(--quiron-dark)" }}
        >
          Quirón
        </span>
      )}
    </span>
  );
};

export default QuironMark;
