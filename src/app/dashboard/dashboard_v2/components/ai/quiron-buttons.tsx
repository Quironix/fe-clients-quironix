"use client";
import { Sparkles } from "lucide-react";
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

  const classes = [
    "qxv2-btn-ai",
    variant === "ghost" ? "ghost" : "",
    size === "sm" ? "sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      style={style}
      onClick={() => openWithTopic(topic)}
    >
      <Sparkles size={size === "sm" ? 13 : 15} />
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
      className="qxv2-k-ai"
      title="Analizar este indicador con Quirón"
      onClick={(e) => {
        e.stopPropagation();
        openWithTopic(topic);
      }}
    >
      <Sparkles size={13} />
    </button>
  );
};
