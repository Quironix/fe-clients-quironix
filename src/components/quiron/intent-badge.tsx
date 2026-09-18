"use client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export type QuironIntent =
  | "COMPROBANTE_PAGO"
  | "SOLICITUD_FACTURA"
  | "CONSULTA_DATOS_DE_PAGO"
  | "ACUSE_RECIBO_SIN_ACCION"
  | "CONTACTO_NO_VIGENTE"
  | "COMPROMISO_PAGO"
  | "OTRA";

const INTENT_STYLE: Record<string, string> = {
  COMPROBANTE_PAGO: "bg-blue-50 text-blue-700",
  SOLICITUD_FACTURA: "bg-violet-100 text-violet-700",
  CONSULTA_DATOS_DE_PAGO: "bg-teal-100 text-teal-700",
  ACUSE_RECIBO_SIN_ACCION: "bg-slate-100 text-slate-600",
  CONTACTO_NO_VIGENTE: "bg-amber-100 text-amber-700",
  COMPROMISO_PAGO: "bg-emerald-100 text-emerald-700",
  OTRA: "bg-red-100 text-red-700",
};

const BADGE_BASE =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap";

export const IntentBadge = ({
  intent,
  className,
}: {
  intent?: QuironIntent | string | null;
  className?: string;
}) => {
  const t = useTranslations("dashboard.invoice_inbox");
  if (!intent) return null;
  const key = `intent.${intent}`;
  const label = t.has(key)
    ? t(key)
    : intent
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={cn(
        BADGE_BASE,
        INTENT_STYLE[intent] ?? "bg-slate-100 text-slate-600",
        className,
      )}
    >
      {label}
    </span>
  );
};

export default IntentBadge;
