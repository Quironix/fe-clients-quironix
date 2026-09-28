"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { DebtorKpis, getDebtorKpis } from "../services/debtor-kpis";

const LIGHT_CLASS: Record<string, string> = {
  VERDE: "bg-green-100 text-green-700",
  AMARILLO: "bg-yellow-100 text-yellow-700",
  ROJO: "bg-red-100 text-red-700",
};
const LIGHT_KEY: Record<string, "green" | "yellow" | "red"> = {
  VERDE: "green",
  AMARILLO: "yellow",
  ROJO: "red",
};

const Light = ({ value }: { value: string }) => {
  const t = useTranslations("debtorManagement.debtorKpis");
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LIGHT_CLASS[value]}`}
    >
      {t(LIGHT_KEY[value])}
    </span>
  );
};

const Row = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
}) => (
  <div className="flex justify-between items-start w-full gap-3">
    <span className="text-xs">{label}</span>
    <span className="text-xs font-bold text-right flex flex-col items-end gap-1">
      {value}
      {sub && <span className="font-normal text-gray-500">{sub}</span>}
    </span>
  </div>
);

export const DebtorKpisCard = ({ debtorId }: { debtorId: string }) => {
  const t = useTranslations("debtorManagement.debtorKpis");
  const { session, profile } = useProfileContext();
  const clientId = profile?.client?.id || "";
  const token = session?.token || "";

  const { data, isLoading } = useQuery<DebtorKpis | null>({
    queryKey: ["debtor-kpis", clientId, debtorId],
    queryFn: () => getDebtorKpis(token, clientId, debtorId),
    enabled: !!token && !!clientId && !!debtorId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Skeleton className="h-16 w-full" />;
  if (!data?.calculationDate)
    return <span className="text-xs text-gray-500">{t("notCalculated")}</span>;

  const { credibility, rating } = data;
  const credibilityValue =
    credibility?.score != null ? (
      <span className="flex items-center gap-2">
        {Math.round(credibility.score)}
        {credibility.trafficLight && <Light value={credibility.trafficLight} />}
      </span>
    ) : credibility?.sufficiency === "HISTORIA_INSUFICIENTE" ? (
      t("insufficient", { total: credibility.factsTotal })
    ) : credibility ? (
      t("noFacts")
    ) : (
      t("noScore")
    );

  return (
    <div className="flex flex-col w-full gap-3 py-2">
      <Row
        label={t("credibility")}
        value={credibilityValue}
        sub={
          credibility?.score != null
            ? t("facts", {
                fulfilled: credibility.factsFulfilled,
                total: credibility.factsTotal,
              })
            : undefined
        }
      />
      <Row
        label={t("rating")}
        value={
          rating ? (
            <span className="flex items-center gap-2">
              {t("days", { days: Math.round(rating.ratingDays * 10) / 10 })}
              <Light value={rating.color} />
            </span>
          ) : (
            t("noRating")
          )
        }
        sub={
          rating
            ? [
                t("invoices", { count: rating.nPredictiveInvoices }),
                rating.cutStatus === "PROVISIONAL_C0" ? t("provisional") : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : undefined
        }
      />
      <span className="text-[10px] text-gray-400">
        {t("asOf", { date: data.calculationDate })}
      </span>
    </div>
  );
};
