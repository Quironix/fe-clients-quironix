"use client";
import { QuironIcon } from "@/components/quiron/quiron-icon";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";
import { useQuiron } from "./quiron-context";

interface QuironAiButtonProps {
  /** Identificador del tema a analizar. Lo usará el backend/BFF para saber qué
   * contexto enviarle a Quirón cuando se conecte la lógica de IA. */
  topic: string;
  label?: string;
  variant?: "default" | "ghost";
  size?: "md" | "sm";
  className?: string;
  style?: CSSProperties;
}

export const QuironAiButton = ({
  topic,
  label = "Analizar con Quirón",
  variant = "default",
  size = "md",
  className = "",
  style,
}: QuironAiButtonProps) => {
  const { enabled, openWithTopic } = useQuiron();
  if (!enabled) return null;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-[7px] rounded-md font-extrabold transition",
        variant === "ghost"
          ? "border-[1.5px] border-primary-bright/30 text-primary-bright hover:bg-primary-soft"
          : "bg-linear-135 from-primary-bright to-primary text-white shadow-md shadow-primary/25 hover:-translate-y-px hover:shadow-lg hover:shadow-primary/40",
        size === "sm" ? "rounded-[8px] px-3 py-1.5 text-[11.5px]" : "px-[15px] py-[9px] text-[13px]",
        className,
      )}
      style={style}
      onClick={() => openWithTopic(topic)}
    >
      <QuironIcon tone="current" size={size === "sm" ? 13 : 15} />
      {label}
    </button>
  );
};

export const QuironMiniButton = ({ topic }: { topic: string }) => {
  const { enabled, openWithTopic } = useQuiron();
  if (!enabled) return null;

  return (
    <button
      type="button"
      className="absolute top-[11px] right-[11px] grid size-6 cursor-pointer place-items-center rounded-[7px] bg-primary-soft text-primary-bright opacity-0 transition group-hover:opacity-100 hover:bg-primary-bright/20"
      title="Analizar este indicador con Quirón"
      onClick={(e) => {
        e.stopPropagation();
        openWithTopic(topic);
      }}
    >
      <QuironIcon tone="current" size={13} />
    </button>
  );
};
