import { cn } from "@/lib/utils";
import { useId } from "react";
import { Curve, FULL_TURN, scaleCurve, tracePath } from "./quiron-curves";
import { QUIRON_VIEW_BOX, QuironGradient } from "./quiron-gradient";

const LOOP_RADIUS = 66;
const LOOP_SEGMENTS = 240;
const LOBE_IMBALANCE = 0.45;

const lazoQ: Curve = (t) => {
  const lobe = 1 - LOBE_IMBALANCE * Math.sin(t);
  const x = Math.sin(t) * lobe + LOBE_IMBALANCE;
  const y = 0.55 * Math.sin(2 * t) * lobe;
  return [(x - y) * Math.SQRT1_2, (x + y) * Math.SQRT1_2];
};

export const LAZO_Q_PATH = `${tracePath(scaleCurve(lazoQ, LOOP_RADIUS), 0, FULL_TURN, LOOP_SEGMENTS)}Z`;

const strokeWidthFor = (size: number) => {
  if (size <= 12) return 30;
  if (size <= 16) return 28;
  if (size <= 24) return 26;
  return 22;
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
        d={LAZO_Q_PATH}
        stroke={isBrand ? `url(#${gradientId})` : "currentColor"}
        strokeWidth={strokeWidthFor(size)}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
