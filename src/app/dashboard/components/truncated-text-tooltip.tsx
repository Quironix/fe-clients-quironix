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
}

export const TruncatedTextTooltip = ({
  text,
  maxLength = 50,
  className = "",
}: TruncatedTextTooltipProps) => {
  if (!text) return <div className={className}>-</div>;

  const shouldTruncate = text.length > maxLength;
  const truncatedText = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  if (!shouldTruncate) {
    return <div className={className}>{text}</div>;
  }
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`cursor-help ${className}`}>{truncatedText}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-80 p-3">
          <div className="break-words text-sm">{text}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
