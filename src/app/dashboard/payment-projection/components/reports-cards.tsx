import { useProfileContext } from "@/context/ProfileContext";
import { cn, formatNumber } from "@/lib/utils";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingDown } from "lucide-react";
import { useSession } from "next-auth/react";
import CardDashboard from "../../components/card-dashboard";
import { getIndicators } from "../services";

const ReportsCards = () => {
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
            title="Proyección total"
          />
          <CardDashboard
            icon={<DollarSign className="text-green-600" />}
            value={formatNumber(data?.data?.data?.collected)}
            title="Recaudado"
          />
          <CardDashboard
            icon={<TrendingDown className="text-red-600" />}
            value={
              <span
                className={cn(
                  "",
                  (data?.data?.data?.variation as number) > 0
                    ? "text-black"
                    : "text-red-400"
                )}
              >
                {formatNumber(data?.data?.data?.variation)}
              </span>
            }
            title="Variación"
            description={
              <span
                className={cn(
                  "text-xs",
                  (data?.data?.data?.variation_percentage as number) >= 0
                    ? "text-gray-400"
                    : "text-red-400"
                )}
              >
                ({data?.data?.data?.variation_percentage}%)
              </span>
            }
          />
          <CardDashboard
            icon={<IconInfoCircle className="text-red-600" />}
            value={formatNumber(data?.data?.data?.critical_cases, false)}
            title="Casos críticos"
            description={
              <span className="text-gray-400 text-xs">
                {data?.data?.data?.metadata?.period_days} días vencidos totales
              </span>
            }
          />
        </div>
      )}
    </div>
  );
};

export default ReportsCards;
