import React from "react";
import { MOCK_PIPELINE } from "../constants/mock-extras";
import { UpcomingCommitmentDay } from "../types";

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
  const hasRealData = data && data.length > 0;

  return (
    <div className="qxv2-card">
      <div className="qxv2-card-h">
        <h3>Lo que viene — próximos vencimientos</h3>
        <span className="qxv2-h-sub">
          {hasRealData ? "Anticípate: compromisos agendados" : "Anticípate: compromisos futuros · datos ilustrativos"}
        </span>
      </div>

      {isLoading ? (
        <div style={{ padding: "16px", color: "#667085", fontSize: "13px" }}>
          Cargando próximos vencimientos...
        </div>
      ) : hasRealData ? (
        data.map((day) => (
          <div className="qxv2-pipe-day" key={day.date}>
            <div className="qxv2-pd-h">
              <span className="qxv2-pd-when">{day.when}</span>
              <span className="qxv2-pd-cnt">
                {day.count} caso{day.count > 1 ? "s" : ""} · Total {formatCurrency(day.totalAmount)}
              </span>
            </div>
            {day.items.map((item, idx) => (
              <div className="qxv2-pipe-item" key={`${item.debtorName}-${idx}`}>
                <span className="qxv2-pi-nm">
                  {item.debtorName}
                  <small>{item.note}</small>
                </span>
                <span className="qxv2-pi-mo">{formatCurrency(item.amount)}</span>
                <button className="qxv2-btn-ghost" style={{ padding: "5px 10px" }}>
                  Preparar →
                </button>
              </div>
            ))}
          </div>
        ))
      ) : (
        MOCK_PIPELINE.map((day) => (
          <div className="qxv2-pipe-day" key={day.when}>
            <div className="qxv2-pd-h">
              <span className="qxv2-pd-when">{day.when}</span>
              <span className="qxv2-pd-cnt">
                {day.items.length} caso{day.items.length > 1 ? "s" : ""}
              </span>
            </div>
            {day.items.map((item) => (
              <div className="qxv2-pipe-item" key={item.debtorName}>
                <span className="qxv2-pi-nm">
                  {item.debtorName}
                  <small>{item.note}</small>
                </span>
                <span className="qxv2-pi-mo">{item.amount}</span>
                <button className="qxv2-btn-ghost" style={{ padding: "5px 10px" }}>
                  Preparar →
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};
