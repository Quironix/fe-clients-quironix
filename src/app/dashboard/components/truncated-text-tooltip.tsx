"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TruncatedTextTooltipProps {
  text: string | null;
  maxLength?: number;
  className?: string;
  variant?: "text" | "chip";
  chipClassName?: string;
  tooltipBody?: string | React.ReactNode;
}

export const TruncatedTextTooltip = ({
  text,
  maxLength = 50,
  className = "",
  variant = "text",
  chipClassName = "",
  tooltipBody,
}: TruncatedTextTooltipProps) => {
  if (!text) return <div className={className}>-</div>;

  const shouldTruncate = text.length > maxLength;
  const truncatedText = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  const renderContent = (content: string) => {
    if (variant === "chip") {
      const chipClasses =
        chipClassName || "rounded-full px-2 py-0.5 text-xs border";
      return <span className={chipClasses}>{content}</span>;
    }
    return <div className={className}>{content}</div>;
  };

  if (!shouldTruncate) {
    return renderContent(text);
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {variant === "chip" ? (
            <span
              className={`cursor-help ${chipClassName || "rounded-full px-2 py-0.5 text-xs border"} ${className}`}
            >
              {truncatedText}
            </span>
          ) : (
            <div className={`cursor-help ${className}`}>{truncatedText}</div>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-80 p-3">
          <div className="break-words text-sm">{tooltipBody || text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
