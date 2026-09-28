import { useRouter } from "next/navigation";
import React from "react";
import { UpcomingCommitmentDay } from "../types";
import { CardMessage } from "./card-message";

export interface PipelineCardProps {
  data?: UpcomingCommitmentDay[];
  isLoading?: boolean;
}

const formatCurrency = (amount: number): string =>
  amount >= 1000000
    ? `$${(amount / 1000000).toFixed(1).replace(".", ",")}M`
    : `$${Math.round(amount).toLocaleString("es-CL")}`;

export const PipelineCard: React.FC<PipelineCardProps> = ({
  data,
  isLoading,
}) => {
  const router = useRouter();
  const hasRealData = data && data.length > 0;

  const goToAddManagement = (debtorId: string) =>
    router.push(`/dashboard/debtor-management/${debtorId}?tab=add-management`);

  return (
    <div className="qxv2-card">
      <div className="qxv2-card-h">
        <h3>Lo que viene — próximos vencimientos</h3>
        <span className="qxv2-h-sub">Anticípate: compromisos agendados</span>
      </div>

      {isLoading ? (
        <CardMessage>Cargando…</CardMessage>
      ) : hasRealData ? (
        data.map((day) => (
          <div className="qxv2-pipe-day" key={day.date}>
            <div className="qxv2-pd-h">
              <span className="qxv2-pd-when">{day.when}</span>
              <span className="qxv2-pd-cnt">
                {day.count} caso{day.count > 1 ? "s" : ""} · Total{" "}
                {formatCurrency(day.totalAmount)}
              </span>
            </div>
            {day.items.map((item, idx) => (
              <div className="qxv2-pipe-item" key={`${item.debtorName}-${idx}`}>
                <span className="qxv2-pi-nm">
                  {item.debtorName}
                  <small>{item.note}</small>
                </span>
                <span className="qxv2-pi-mo">
                  {formatCurrency(item.amount)}
                </span>
                <button
                  className="qxv2-btn-ghost"
                  style={{ padding: "5px 10px" }}
                  onClick={() => goToAddManagement(item.debtorId)}
                >
                  Preparar →
                </button>
              </div>
            ))}
          </div>
        ))
      ) : (
        <CardMessage>Sin compromisos agendados</CardMessage>
      )}
    </div>
  );
};
