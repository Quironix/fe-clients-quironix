import { useProfileContext } from "@/context/ProfileContext";
import { cn, formatNumber } from "@/lib/utils";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import CardDashboard from "../../components/card-dashboard";
import { getIndicators } from "../services";

const ReportsCards = () => {
  const t = useTranslations("paymentProjection");
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => getIndicators(session?.token, profile?.client_id),
    enabled: !!session?.token && !!profile?.client_id,
  });
  return (
    <div className="w-full mb-5">
      {isLoading ? (
        <div className="grid grid-cols-4 gap-5 h-full">
          <div className="animate-pulse flex flex-col gap-2 bg-gray-100 rounded-lg p-4 h-32">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="animate-pulse flex flex-col gap-2 bg-gray-100 rounded-lg p-4 h-32">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="animate-pulse flex flex-col gap-2 bg-gray-100 rounded-lg p-4 h-32">
            <div className="w-10 h-10 bg-gray-300 roun  ded-full" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
          <div className="animate-pulse flex flex-col gap-2 bg-gray-100 rounded-lg p-4 h-32">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5 h-full mb-5">
          <CardDashboard
            icon={<DollarSign className="text-blue-600" />}
            value={formatNumber(data?.data?.data?.total_projection)}
            title={t("totalProjection")}
          />
          <CardDashboard
            icon={<DollarSign className="text-green-600" />}
            value={formatNumber(data?.data?.data?.collected)}
            title={t("collected")}
          />
          {(() => {
            const estimated = data?.data?.data?.total_projection as number ?? 0;
            const collected = data?.data?.data?.collected as number ?? 0;
            const pct = estimated > 0 ? (collected / estimated) * 100 : 0;
            const color = pct >= 100 ? "text-green-600" : pct >= 95 ? "text-yellow-600" : "text-red-500";
            return (
              <CardDashboard
                icon={<TrendingDown className={color} />}
                value={
                  <span className={cn("", color)}>
                    {formatNumber(data?.data?.data?.variation)}
                  </span>
                }
                title={t("variation")}
                description={
                  <span className={cn("text-xs", color)}>
                    ({pct.toFixed(1)}%)
                  </span>
                }
              />
            );
          })()}
          <CardDashboard
            icon={<IconInfoCircle className="text-red-600" />}
            value={formatNumber(data?.data?.data?.critical_cases, false)}
            title={t("criticalCases")}
            description={
              <span className="text-gray-400 text-xs">
                {t("totalOverdueDays", { days: data?.data?.data?.metadata?.period_days })}
              </span>
            }
          />
        </div>
      )}
    </div>
  );
};

export default ReportsCards;
