import { formatNumber } from "@/lib/utils";
import {
  CalendarClock,
  ChartColumn,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useMemo } from "react";

const DetailDebtorProjection = ({ debtor }: { debtor: any }) => {
  const totalEstimated = useMemo(() => {
    return debtor?.weekly_projections.reduce(
      (acc: number, curr: any) => acc + curr.total_weekly_estimated,
      0
    );
  }, [debtor]);

  const totalReal = useMemo(() => {
    return totalEstimated - totalEstimated * 0.3;
  }, [debtor]);

  return (
    <div className="bg-blue-100/30 rounded-md p-5">
      <div className="flex items-start justify-start gap-36">
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">Razón social</span>
          <span className="text-md font-bold">{debtor?.name}</span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">Código deudor</span>
          <span className="text-md font-bold">{debtor?.debtor_code}</span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">Deuda vencida</span>
          <span className="text-md font-bold">
            {formatNumber(debtor?.overdue_debt)}
          </span>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-xs text-gray-500">Por vencer en periodo</span>
          <span className="text-md font-bold">
            {formatNumber(debtor?.period_debt)}
          </span>
        </div>
      </div>
      <div className="bg-blue-100/70 rounded-md p-5 mt-5 flex items-start justify-start gap-36">
        <div className="flex items-center justify-start gap-2">
          <ChartColumn className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">Estimado</span>
            <span className="text-md font-bold">
              {formatNumber(totalEstimated)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <DollarSign className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">Real</span>
            <span className="text-md font-bold">{formatNumber(totalReal)}</span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <TrendingDown className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">Variación</span>
            <span className="text-md font-bold">
              {formatNumber(totalEstimated - totalReal)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-start gap-2">
          <CalendarClock className="text-blue-600" />
          <div className="flex flex-col items-start justify-start">
            <span className="text-xs">Calendario de pago</span>
            <span className="text-md ">
              Pagos fijos los días 5 y 20 de cada mes.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDebtorProjection;
