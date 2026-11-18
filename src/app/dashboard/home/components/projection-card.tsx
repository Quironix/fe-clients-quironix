import React from "react";
import { MOCK_PROJECTION } from "../constants/mock-extras";
import { DsoProjectionData } from "../types";
import { cardBody, DashCard, DashCardHeader } from "./dash-card";

export interface ProjectionCardProps {
  data?: DsoProjectionData;
  isLoading?: boolean;
}

const colLabel = "text-[10.5px] font-extrabold uppercase tracking-[0.05em] text-gray-400";
const colNum = "mt-1 text-[30px] font-black tracking-[-0.02em]";

export const ProjectionCard: React.FC<ProjectionCardProps> = ({
  data,
  isLoading,
}) => {
  const currentDso = data ? `${data.currentDso} días` : MOCK_PROJECTION.currentValue;
  const projectedDso = data ? `${data.projectedDso} días` : MOCK_PROJECTION.projectedValue;
  const targetDso = data ? `${data.targetDso} días` : MOCK_PROJECTION.targetValue;
  const note = data ? data.note : MOCK_PROJECTION.note;

  return (
    <DashCard>
      <DashCardHeader
        title="Proyección — si se resuelven los litigios"
        sub={data ? "Escenario proyectado" : "Escenario simulado · datos ilustrativos"}
      />
      <div className={cardBody}>
        <div className="flex flex-wrap items-stretch gap-4">
          <div className="min-w-[120px] flex-1">
            <div className={colLabel}>DSO Actual</div>
            <div className={`${colNum} text-bad-fg`}>{isLoading ? "..." : currentDso}</div>
          </div>
          <div className="grid place-items-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[26px] text-good"
            >
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" />
            </svg>
          </div>
          <div className="min-w-[120px] flex-1">
            <div className={colLabel}>DSO Sin Litigios</div>
            <div className={`${colNum} text-good-fg`}>{isLoading ? "..." : projectedDso}</div>
          </div>
          <div className="min-w-[120px] flex-1">
            <div className={colLabel}>Meta</div>
            <div className={`${colNum} text-gray-400`}>{isLoading ? "..." : targetDso}</div>
          </div>
        </div>
        <div className="mt-3.5 rounded-lg border border-good/25 bg-good-bg px-3.5 py-[11px] text-[12.5px] font-semibold text-green-800">
          {note}
        </div>
      </div>
    </DashCard>
  );
};
