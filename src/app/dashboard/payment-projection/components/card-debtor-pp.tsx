import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { usePaymentProjectionStore } from "../store";

const CardDebtorPP = ({ debtor }: { debtor: any }) => {
  const { debtorId, setDebtorId } = usePaymentProjectionStore();
  return (
    <Card
      onClick={() => setDebtorId(debtor?.id)}
      className={cn(
        "w-full hover:bg-blue-100/30 hover:border-red-300 cursor-pointer transition-all duration-300",
        debtorId === debtor?.id && "bg-blue-100/30 border-red-300"
      )}
    >
      <CardContent className="space-y-3">
        <div className="text-right w-full">
          <Badge className="bg-yellow-400 rounded-full text-gray-600">
            <TrendingUp /> Alto
          </Badge>
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-sm font-bold truncate max-w-[300px]">
            {debtor?.name}
          </span>
          <span className="text-[13px] font-semibold">
            {debtor?.debtor_code}
          </span>
        </div>
        <div className="flex items-center justify-start bg-blue-100/50 gap-20 p-3 px-2 rounded-md">
          <div className="flex flex-col items-start justify-start gap-0">
            <span className="text-[10px] text-gray-500">Deuda vencida</span>
            <span className="text-lg font-semibold text-red-500">
              {formatNumber(debtor?.overdue_debt)}
            </span>
          </div>
          <div className="flex flex-col items-start justify-start gap-0">
            <span className="text-[10px] text-gray-500">Deuda periodo</span>
            <span className="text-lg font-semibold text-black">
              {formatNumber(debtor?.period_debt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardDebtorPP;
