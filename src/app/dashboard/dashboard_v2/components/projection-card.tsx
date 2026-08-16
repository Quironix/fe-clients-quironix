import React from "react";
import { MOCK_PROJECTION } from "../constants/mock-extras";
import { DsoProjectionData } from "../types";

export interface ProjectionCardProps {
  data?: DsoProjectionData;
  isLoading?: boolean;
}

export const ProjectionCard: React.FC<ProjectionCardProps> = ({
  data,
  isLoading,
}) => {
  const currentDso = data ? `${data.currentDso} días` : MOCK_PROJECTION.currentValue;
  const projectedDso = data ? `${data.projectedDso} días` : MOCK_PROJECTION.projectedValue;
  const targetDso = data ? `${data.targetDso} días` : MOCK_PROJECTION.targetValue;
  const note = data ? data.note : MOCK_PROJECTION.note;

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Proyección — si se resuelven los litigios</h3>
        <span className="qxv2-h-sub">
          {data ? "Escenario proyectado" : "Escenario simulado · datos ilustrativos"}
        </span>
      </div>
      <div className="qxv2-body">
        <div className="qxv2-proj">
          <div className="qxv2-p-col qxv2-proj-col-bad">
            <div className="qxv2-p-lbl">DSO Actual</div>
            <div className="qxv2-p-num">{isLoading ? "..." : currentDso}</div>
          </div>
          <div className="qxv2-p-arrow">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" />
            </svg>
          </div>
          <div className="qxv2-p-col qxv2-proj-col-good">
            <div className="qxv2-p-lbl">DSO Sin Litigios</div>
            <div className="qxv2-p-num">{isLoading ? "..." : projectedDso}</div>
          </div>
          <div className="qxv2-p-col">
            <div className="qxv2-p-lbl">Meta</div>
            <div className="qxv2-p-num" style={{ color: "#98A2B3" }}>
              {isLoading ? "..." : targetDso}
            </div>
          </div>
        </div>
        <div className="qxv2-proj-note">{note}</div>
      </div>
    </div>
  );
};
