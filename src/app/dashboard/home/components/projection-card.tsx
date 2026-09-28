import React from "react";
import { DsoProjectionData } from "../types";
import { CardMessage, loadingOrEmpty } from "./card-message";

export interface ProjectionCardProps {
  data?: DsoProjectionData;
  isLoading?: boolean;
}

export const ProjectionCard: React.FC<ProjectionCardProps> = ({
  data,
  isLoading,
}) => {
  if (!data) {
    return (
      <div className="qxv2-card qxv2-v2-card">
        <div className="qxv2-card-h">
          <h3>Proyección — si se resuelven los litigios</h3>
        </div>
        <CardMessage>{loadingOrEmpty(isLoading)}</CardMessage>
      </div>
    );
  }

  return (
    <div className="qxv2-card qxv2-v2-card">
      <div className="qxv2-card-h">
        <h3>Proyección — si se resuelven los litigios</h3>
        <span className="qxv2-h-sub">Escenario proyectado</span>
      </div>
      <div className="qxv2-body">
        <div className="qxv2-proj">
          <div className="qxv2-p-col qxv2-proj-col-bad">
            <div className="qxv2-p-lbl">DSO Actual</div>
            <div className="qxv2-p-num">{data.currentDso} días</div>
          </div>
          <div className="qxv2-p-arrow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" />
            </svg>
          </div>
          <div className="qxv2-p-col qxv2-proj-col-good">
            <div className="qxv2-p-lbl">DSO Sin Litigios</div>
            <div className="qxv2-p-num">{data.projectedDso} días</div>
          </div>
          <div className="qxv2-p-col">
            <div className="qxv2-p-lbl">Meta</div>
            <div className="qxv2-p-num" style={{ color: "#98A2B3" }}>
              {data.targetDso} días
            </div>
          </div>
        </div>
        <div className="qxv2-proj-note">{data.note}</div>
      </div>
    </div>
  );
};
