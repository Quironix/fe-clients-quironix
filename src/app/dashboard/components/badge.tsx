import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "error" | "warning" | "info";

interface BadgeProps {
  variant: BadgeVariant;
  text: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-200 text-green-700",
  error: "bg-red-200 text-red-600",
  warning: "bg-yellow-200 text-yellow-700",
  info: "bg-blue-200 text-blue-700",
};

export const Badge = ({ variant, text, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "text-xs px-2 py-1 font-bold rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {text}
    </span>
  );
};
