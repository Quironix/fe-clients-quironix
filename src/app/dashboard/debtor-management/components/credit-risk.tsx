import { formatNumber } from "@/lib/utils";
import { Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "../../components/badge";
import { CallReasons } from "../types";

const CreditRisk = ({ data }: { data: CallReasons["credit_risk_summary"] }) => {
  const t = useTranslations("debtorManagement.creditRisk");
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
        return { color: "green", text: t("low") };
      case "MEDIUM":
        return { color: "yellow", text: t("medium") };
      case "HIGH":
        return { color: "red", text: t("high") };
      case "UNKNOWN":
      default:
        return { color: "gray", text: t("unknown") };
    }
  };

  // Determinar estado crediticio basado en línea de crédito y categoría de riesgo
  const getCreditStatus = () => {
    if (!credit_risk_summary.has_credit_line) {
      return { variant: "warning" as const, text: t("noCreditLine") };
    }
    if (credit_risk_summary.risk_category === "HIGH") {
      return { variant: "error" as const, text: t("retained") };
    }
    if (credit_risk_summary.risk_category === "MEDIUM") {
      return { variant: "warning" as const, text: t("underReview") };
    }
    return { variant: "success" as const, text: t("active") };
  };

  const riskDisplay = getRiskDisplay(credit_risk_summary.risk_category);
  const creditStatus = getCreditStatus();

  return (
    <div className="flex flex-col justify-center items-center w-full gap-3 flex-1 py-2">
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">{t("currentCredit")}</span>
        <span className="text-xs font-bold">
          {formatNumber(credit_risk_summary.current_credit)}
        </span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">{t("availableCredit")}</span>
        <span className="text-xs font-bold">
          {formatNumber(credit_risk_summary.available_credit)}
        </span>
      </div>
      <div className="flex justify-between items-center w-full">
        <span className="text-xs">{t("riskCategory")}</span>
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
        <span className="text-xs">{t("creditStatus")}</span>
        <Badge variant={creditStatus.variant} text={creditStatus.text} />
      </div>
    </div>
  );
};

export default CreditRisk;
