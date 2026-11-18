"use client";
import React from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { MOCK_EXECUTIVE_SUMMARY } from "../constants/mock-extras";
import { useExecutiveSummary } from "../hooks/useDashboardAggregates";
import { QuironAiButton } from "./ai/quiron-buttons";
import { DashCard, eyebrow } from "./dash-card";

export const ExecutiveSummaryCard: React.FC = () => {
  const { session, profile } = useProfileContext();

  const { data: realData, isLoading } = useExecutiveSummary({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    enabled: !!session?.token && !!profile?.client?.id,
  });

  const s = realData || MOCK_EXECUTIVE_SUMMARY;

  return (
    <DashCard className="flex flex-col border-primary-bright/20 bg-linear-to-b from-[#f6f9ff] to-white to-62% px-5 py-[18px]">
      <div className="mb-[11px] flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-primary-bright">
        Resumen ejecutivo · Quirón
        {!realData && (
          <span className="ml-2 font-bold opacity-70">
            {isLoading ? "· cargando…" : "· datos ilustrativos"}
          </span>
        )}
      </div>
      <p className="text-[13.5px] leading-[1.62] text-gray-600">{s.text}</p>
      <div className={`${eyebrow} mt-4 mb-2`}>Acciones recomendadas</div>
      <div className="flex flex-col gap-2">
        {s.actions.map((a) => (
          <div
            className="flex items-center gap-2 rounded-md border border-primary-bright/20 bg-white px-2.5 py-2"
            key={a.label}
          >
            <span className="flex-1 text-left text-[11.5px] font-bold text-gray-700">{a.label}</span>
            {a.amount && (
              <span className="whitespace-nowrap text-[11px] font-extrabold text-primary-bright">
                {a.amount}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-primary-bright/15 pt-3.5">
        <QuironAiButton topic="resumen" label="Analizar estos datos con Quirón" />
        <span className="max-w-[210px] text-[11.5px] font-semibold leading-[1.4] text-gray-400">
          Quirón podrá explicar el resumen y sugerir próximos pasos.
        </span>
      </div>
    </DashCard>
  );
};
