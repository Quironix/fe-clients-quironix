import { formatNumber } from "@/lib/utils";
import { DebtorConcentrationItem } from "../types";
import { QuironAiButton } from "./ai/quiron-buttons";
import { cardBody, DashCard, DashCardHeader, subText, track } from "./dash-card";

interface DebtorConcentrationCardProps {
  data?: DebtorConcentrationItem[];
  isLoading?: boolean;
}

export const DebtorConcentrationCard: React.FC<
  DebtorConcentrationCardProps
> = ({ data = [], isLoading }) => {
  const total = data.reduce((a, d) => a + d.amount, 0);
  const max = Math.max(1, ...data.map((d) => d.amount));

  return (
    <DashCard>
      <DashCardHeader
        title="Concentración de la mora"
        sub={`${data.length} deudores · ${formatNumber(total)}`}
      >
        <QuironAiButton
          topic="debtor-concentration"
          variant="ghost"
          size="sm"
          className="ml-auto"
        />
      </DashCardHeader>
      <div className={cardBody}>
        {isLoading ? (
          <div className={subText}>Cargando...</div>
        ) : (
          data.map((item, index) => (
            <div
              className="grid grid-cols-[20px_1fr_auto_auto] items-center gap-3 border-t border-gray-100 py-[11px] first:border-t-0"
              key={item.debtorId}
            >
              <span className="grid size-5 place-items-center rounded-sm bg-primary-soft text-[11px] font-black text-primary">
                {index + 1}
              </span>
              <span className="truncate text-[13px] font-extrabold">
                {item.debtorName}
                <small className="block text-[11px] font-bold text-gray-500">
                  {(item.share * 100).toFixed(1)}% de la mora
                </small>
              </span>
              <span className="text-right text-[13.5px] font-black">{formatNumber(item.amount)}</span>
              <span className={`${track} col-[2/5] mt-0.5 h-[5px]`}>
                <span
                  className="block h-full rounded-full bg-primary-bright"
                  style={{ width: `${(item.amount / max) * 100}%` }}
                />
              </span>
            </div>
          ))
        )}
      </div>
    </DashCard>
  );
};
