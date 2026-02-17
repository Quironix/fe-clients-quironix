"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as React from "react";

interface InfoIconProps {
  color?: string;
  tooltipContent: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 text-xs leading-none",
  md: "h-5 w-5 text-sm leading-none",
  lg: "h-6 w-6 text-base leading-none",
};

export function InfoIcon({
  color = "#3b82f6",
  tooltipContent,
  size = "md",
  className,
}: InfoIconProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "inline-flex justify-center rounded-full text-white font-bold cursor-help relative",
            sizeClasses[size],
            className,
          )}
          style={{ backgroundColor: color }}
        >
          ¡
        </div>
      </TooltipTrigger>
      <TooltipContent className="whitespace-pre-line">{tooltipContent}</TooltipContent>
    </Tooltip>
  );
}
