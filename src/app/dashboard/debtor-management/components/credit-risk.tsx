import { formatNumber } from "@/lib/utils";
import { Circle } from "lucide-react";
import { Badge } from "../../components/badge";
import { CallReasons } from "../types";

const CreditRisk = ({ data }: { data: CallReasons["credit_risk_summary"] }) => {
  // Valores por defecto si credit_risk_summary no existe
  const credit_risk_summary = data || {
    current_credit: 0,
    available_credit: 0,
    risk_category: "UNKNOWN" as const,
    has_credit_line: false,
  };

  // Mapeo de categoría de riesgo a color y texto
  const getRiskDisplay = (category: string) => {
    switch (category) {
      case "LOW":
        return { color: "green", text: "Bajo" };
      case "MEDIUM":
        return { color: "yellow", text: "Medio" };
      case "HIGH":
        return { color: "red", text: "Alto" };
      case "UNKNOWN":
      default:
        return { color: "gray", text: "Desconocido" };
    }
  };

  // Determinar estado crediticio basado en línea de crédito y categoría de riesgo
  const getCreditStatus = () => {
    if (!credit_risk_summary.has_credit_line) {
      return { variant: "warning" as const, text: "Sin línea de crédito" };
    }
    if (credit_risk_summary.risk_category === "HIGH") {
      return { variant: "error" as const, text: "Retenido" };
    }
    if (credit_risk_summary.risk_category === "MEDIUM") {
      return { variant: "warning" as const, text: "En revisión" };
    }
    return { variant: "success" as const, text: "Activo" };
  };

  const riskDisplay = getRiskDisplay(credit_risk_summary.risk_category);
  const creditStatus = getCreditStatus();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-3 flex-1 py-2">
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Crédito actual</span>
        <span className="text-xs font-bold">
          {formatNumber(credit_risk_summary.current_credit)}
        </span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Crédito disponible</span>
        <span className="text-xs font-bold">
          {formatNumber(credit_risk_summary.available_credit)}
        </span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Cat. de riesgo</span>
        <span className="text-xs font-bold flex items-center gap-1">
          <Circle
            color={riskDisplay.color}
            fill={riskDisplay.color}
            size={15}
          />{" "}
          {riskDisplay.text}
        </span>
      </div>

      <div className="flex justify-between items-center w-full">
        <span className="text-xs">Estado crediticio</span>
        <Badge variant={creditStatus.variant} text={creditStatus.text} />
      </div>
    </div>
  );
};

export default CreditRisk;
