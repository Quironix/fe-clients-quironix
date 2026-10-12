"use client";
import { cn } from "@/lib/utils";
import { useEffect, useId, useRef } from "react";
import {
  Curve,
  FULL_TURN,
  blendCurves,
  scaleCurve,
  tracePath,
} from "./quiron-curves";
import { QUIRON_VIEW_BOX, QuironGradient } from "./quiron-gradient";

const circle: Curve = (t) => [0.8 * Math.sin(t), 0.8 * Math.cos(t)];
const infinity: Curve = (t) => [0.92 * Math.sin(t), 0.46 * Math.sin(2 * t)];
const wave: Curve = (t) => [
  0.92 * Math.sin(t),
  0.5 * Math.sin(4 * t) * (1 - 0.35 * Math.sin(t) ** 2),
];
const harmonic: Curve = (t) => [
  0.85 * Math.sin(3 * t + Math.PI / 2),
  0.85 * Math.sin(2 * t),
];

const STATES = [circle, infinity, wave, harmonic];
const STATE_SECONDS = 2.6;
const HOLD_RATIO = 0.6;
const HEAD_RADIANS_PER_SECOND = 1.7;
const TRAIL = FULL_TURN * 0.9;
const TRAIL_SEGMENTS = 200;
const LOADER_RADIUS = 82;
const STROKE_WIDTH = 2.5;

const smoothstep = (x: number) => x * x * (3 - 2 * x);

export const loaderPath = (seconds: number): string => {
  const progress = seconds / STATE_SECONDS;
  const state = Math.floor(progress);
  const morph = smoothstep(
    Math.max(0, (progress - state - HOLD_RATIO) / (1 - HOLD_RATIO)),
  );
  const curve = blendCurves(
    STATES[state % STATES.length],
    STATES[(state + 1) % STATES.length],
    morph,
  );
  const head = seconds * HEAD_RADIANS_PER_SECOND;
  return tracePath(
    scaleCurve(curve, LOADER_RADIUS),
    head - TRAIL,
    head,
    TRAIL_SEGMENTS,
  );
};

interface QuironLoaderProps {
  size?: number;
  label?: string;
  className?: string;
}

export const QuironLoader = ({
  size = 44,
  label,
  className,
}: QuironLoaderProps) => {
  const gradientId = useId();
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function draw(now) {
      pathRef.current?.setAttribute("d", loaderPath((now - start) / 1000));
      frame = requestAnimationFrame(draw);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      viewBox={QUIRON_VIEW_BOX}
      width={size}
      height={size}
      fill="none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("shrink-0 overflow-visible", className)}
    >
      <defs>
        <QuironGradient id={gradientId} />
      </defs>
      <path
        ref={pathRef}
        d={loaderPath(0)}
        stroke={`url(#${gradientId})`}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
