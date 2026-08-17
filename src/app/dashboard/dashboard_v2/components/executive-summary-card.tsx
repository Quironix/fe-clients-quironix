"use client";
import React from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { MOCK_EXECUTIVE_SUMMARY } from "../constants/mock-extras";
import { useExecutiveSummary } from "../hooks/useDashboardAggregates";

export const ExecutiveSummaryCard: React.FC = () => {
  const { session, profile } = useProfileContext();

  const { data: realData, isLoading } = useExecutiveSummary({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    enabled: !!session?.token && !!profile?.client?.id,
  });

  const s = realData || MOCK_EXECUTIVE_SUMMARY;

  return (
    <div className="qxv2-card qxv2-summary">
      <div className="qxv2-sm-label">
        Resumen ejecutivo · Quirón
        {!realData && (
          <span style={{ marginLeft: 8, fontWeight: 700, opacity: 0.7 }}>
            {isLoading ? "· cargando…" : "· datos ilustrativos"}
          </span>
        )}
      </div>
      <p>{s.text}</p>
      <div className="qxv2-sm-acts-title">Acciones recomendadas</div>
      <div className="qxv2-q-actions">
        {s.actions.map((a) => (
          <div className="qxv2-q-action" key={a.label}>
            <span className="qxv2-qa-tx">{a.label}</span>
            {a.amount && <span className="qxv2-qa-amt">{a.amount}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};
