import { cn } from "@/lib/utils";
import { useId } from "react";
import { FULL_TURN, harmonic, scaleCurve, tracePath } from "./quiron-curves";
import { QUIRON_VIEW_BOX, QuironGradient } from "./quiron-gradient";

const ICON_RADIUS = 72;
const ICON_SEGMENTS = 240;

export const QUIRON_ICON_PATH = `${tracePath(scaleCurve(harmonic, ICON_RADIUS), 0, FULL_TURN, ICON_SEGMENTS)}Z`;

const strokeWidthFor = (size: number) => {
  if (size <= 16) return 24;
  if (size <= 24) return 22;
  return 20;
};

interface QuironIconProps {
  size?: number;
  tone?: "brand" | "current";
  label?: string;
  className?: string;
}

export const QuironIcon = ({
  size = 20,
  tone = "brand",
  label,
  className,
}: QuironIconProps) => {
  const gradientId = useId();
  const isBrand = tone === "brand";
  return (
    <svg
      viewBox={QUIRON_VIEW_BOX}
      width={size}
      height={size}
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0", className)}
    >
      {isBrand && (
        <defs>
          <QuironGradient id={gradientId} />
        </defs>
      )}
      <path
        d={QUIRON_ICON_PATH}
        stroke={isBrand ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidthFor(size)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
