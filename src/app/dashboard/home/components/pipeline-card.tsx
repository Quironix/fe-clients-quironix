import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { MOCK_PIPELINE } from "../constants/mock-extras";
import { UpcomingCommitmentDay } from "../types";
import { btnGhost, DashCard, DashCardHeader } from "./dash-card";

export interface PipelineCardProps {
  data?: UpcomingCommitmentDay[];
  isLoading?: boolean;
}

const formatCurrency = (amount: number): string =>
  amount >= 1000000
    ? `$${(amount / 1000000).toFixed(1).replace(".", ",")}M`
    : `$${Math.round(amount).toLocaleString("es-CL")}`;

const PipeDay = ({ when, count, children }: { when: string; count: string; children: ReactNode }) => (
  <div className="border-t border-gray-100 px-5 py-3 first:border-t-0">
    <div className="mb-[9px] flex items-center gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.04em] text-primary-bright">{when}</span>
      <span className="text-[11px] font-extrabold text-gray-400">{count}</span>
    </div>
    {children}
  </div>
);

const PipeItem = ({
  name,
  note,
  amount,
  onClick,
}: {
  name: string;
  note: string;
  amount: string;
  onClick?: () => void;
}) => (
  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2.5 py-[7px]">
    <span className="text-[12.5px] font-extrabold">
      {name}
      <small className="block text-[11px] font-semibold text-gray-500">{note}</small>
    </span>
    <span className="text-[12.5px] font-black">{amount}</span>
    <button className={`${btnGhost} px-2.5 py-[5px]`} onClick={onClick}>
      Preparar →
    </button>
  </div>
);

export const PipelineCard: React.FC<PipelineCardProps> = ({
  data,
  isLoading,
}) => {
  const router = useRouter();
  const hasRealData = data && data.length > 0;

  const goToAddManagement = (debtorId: string) =>
    router.push(`/dashboard/debtor-management/${debtorId}?tab=add-management`);

  return (
    <DashCard>
      <DashCardHeader
        title="Lo que viene — próximos vencimientos"
        sub={
          hasRealData
            ? "Anticípate: compromisos agendados"
            : "Anticípate: compromisos futuros · datos ilustrativos"
        }
      />

      {isLoading ? (
        <div className="p-4 text-[13px] text-gray-500">Cargando próximos vencimientos...</div>
      ) : hasRealData ? (
        data.map((day) => (
          <PipeDay
            key={day.date}
            when={day.when}
            count={`${day.count} caso${day.count > 1 ? "s" : ""} · Total ${formatCurrency(day.totalAmount)}`}
          >
            {day.items.map((item, idx) => (
              <PipeItem
                key={`${item.debtorName}-${idx}`}
                name={item.debtorName}
                note={item.note}
                amount={formatCurrency(item.amount)}
                onClick={() => goToAddManagement(item.debtorId)}
              />
            ))}
          </PipeDay>
        ))
      ) : (
        MOCK_PIPELINE.map((day) => (
          <PipeDay
            key={day.when}
            when={day.when}
            count={`${day.items.length} caso${day.items.length > 1 ? "s" : ""}`}
          >
            {day.items.map((item) => (
              <PipeItem key={item.debtorName} name={item.debtorName} note={item.note} amount={item.amount} />
            ))}
          </PipeDay>
        ))
      )}
    </DashCard>
  );
};
