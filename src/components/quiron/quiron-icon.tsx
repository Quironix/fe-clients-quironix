"use client";
import { cn } from "@/lib/utils";
import { useEffect, useId, useState } from "react";
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

const BEAT_SECONDS = 1.8;

const bump = (x: number) =>
  (0.5 - 0.5 * Math.cos(2 * Math.PI * (x - Math.floor(x)))) ** 4;

const stretchAt = (seconds: number, stripe: number) =>
  1 +
  (stripe === TAIL_STRIPE ? 0.2 : 0.12) *
    bump(
      seconds / BEAT_SECONDS -
        (TAIL_STRIPE - Math.abs(stripe - TAIL_STRIPE)) * 0.07,
    );

export const quironIconPath = (seconds?: number) =>
  Array.from({ length: STRIPES }, (_, i) => {
    const dx = -Math.sin(ANGLE);
    const dy = Math.cos(ANGLE);
    const offset = RADIUS * 0.86 * ((2 * i) / (STRIPES - 1) - 1);
    const tail = i === TAIL_STRIPE ? TAIL : 0;
    const stretch = seconds === undefined ? 1 : stretchAt(seconds, i);
    return ellipse(
      CENTER + dy * offset + dx * tail,
      CENTER - dx * offset + dy * tail,
      7,
      (Math.sqrt(RADIUS ** 2 - offset ** 2) + tail) * stretch,
    );
  }).join("");

export const QUIRON_ICON_PATH = quironIconPath();

const useBeatClock = (enabled: boolean) => {
  const [seconds, setSeconds] = useState<number>();
  useEffect(() => {
    if (
      !enabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    let frame = requestAnimationFrame(function tick(now) {
      setSeconds(now / 1000);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [enabled]);
  return seconds;
};

const LAYERS = ["base", "hi", "glow"];

interface QuironIconProps {
  size?: number;
  tone?: "brand" | "current";
  label?: string;
  animated?: boolean;
  className?: string;
}

export const QuironIcon = ({
  size = 20,
  tone = "brand",
  label,
  animated = false,
  className,
}: QuironIconProps) => {
  const id = useId();
  const seconds = useBeatClock(animated);
  const path =
    seconds === undefined ? QUIRON_ICON_PATH : quironIconPath(seconds);
  const flash = seconds === undefined ? 0 : bump(seconds / BEAT_SECONDS - 0.21);
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
        <path d={path} fill="currentColor" />
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
              r={(64 + 14 * flash).toFixed(1)}
            >
              <stop offset="0" stopColor="#ff8113" stopOpacity="0.95" />
              <stop offset="0.5" stopColor="#ff8113" stopOpacity="0.43" />
              <stop offset="1" stopColor="#ff8113" stopOpacity="0" />
            </radialGradient>
          </defs>
          {LAYERS.map((layer) => (
            <path key={layer} d={path} fill={`url(#${id}-${layer})`} />
          ))}
        </>
      )}
    </svg>
  );
};
