import { cn } from "@/lib/utils";
import { useId } from "react";
import { QUIRON_VIEW_BOX } from "./quiron-gradient";

const STRIPES = 7;
const TAIL_STRIPE = 3;
const TAIL = 22;
const RADIUS = 66;
const CENTER = -10;
const ANGLE = -Math.PI / 4;
const ELLIPSE_SEGMENTS = 40;

const ellipse = (cx: number, cy: number, rx: number, ry: number) => {
  const cos = Math.cos(ANGLE);
  const sin = Math.sin(ANGLE);
  const points = Array.from({ length: ELLIPSE_SEGMENTS }, (_, n) => {
    const a = (2 * Math.PI * n) / ELLIPSE_SEGMENTS;
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    return `${n ? "L" : "M"}${(cx + x * cos - y * sin).toFixed(2)} ${(cy + x * sin + y * cos).toFixed(2)}`;
  });
  return `${points.join("")}Z`;
};

export const QUIRON_ICON_PATH = Array.from({ length: STRIPES }, (_, i) => {
  const dx = -Math.sin(ANGLE);
  const dy = Math.cos(ANGLE);
  const offset = RADIUS * 0.86 * ((2 * i) / (STRIPES - 1) - 1);
  const tail = i === TAIL_STRIPE ? TAIL : 0;
  return ellipse(
    CENTER + dy * offset + dx * tail,
    CENTER - dx * offset + dy * tail,
    7,
    Math.sqrt(RADIUS ** 2 - offset ** 2) + tail,
  );
}).join("");

const LAYERS = ["base", "hi", "glow"];

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
  const id = useId();
  return (
    <svg
      viewBox={QUIRON_VIEW_BOX}
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0", className)}
    >
      {tone === "current" ? (
        <path d={QUIRON_ICON_PATH} fill="currentColor" />
      ) : (
        <>
          <defs>
            <linearGradient
              id={`${id}-base`}
              gradientUnits="userSpaceOnUse"
              x1="-70"
              y1="-70"
              x2="70"
              y2="70"
            >
              <stop offset="0" style={{ stopColor: "var(--quiron-mark-1)" }} />
              <stop
                offset="0.55"
                style={{ stopColor: "var(--quiron-mark-2)" }}
              />
              <stop offset="1" style={{ stopColor: "var(--quiron-mark-3)" }} />
            </linearGradient>
            <radialGradient
              id={`${id}-hi`}
              gradientUnits="userSpaceOnUse"
              cx="-50"
              cy="-50"
              r="70"
            >
              <stop offset="0" stopColor="#7fa8ff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#7fa8ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id={`${id}-glow`}
              gradientUnits="userSpaceOnUse"
              cx="62"
              cy="62"
              r="64"
            >
              <stop offset="0" stopColor="#ff8113" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ff8113" stopOpacity="0.43" />
              <stop offset="1" stopColor="#ff8113" stopOpacity="0" />
            </radialGradient>
          </defs>
          {LAYERS.map((layer) => (
            <path
              key={layer}
              d={QUIRON_ICON_PATH}
              fill={`url(#${id}-${layer})`}
            />
          ))}
        </>
      )}
    </svg>
  );
};
