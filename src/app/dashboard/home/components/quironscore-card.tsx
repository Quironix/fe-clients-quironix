"use client";
import React from "react";
import { useProfileContext } from "@/context/ProfileContext";
import { useQuironscore } from "../hooks/useDashboardAggregates";
import { buildQuironscoreView } from "../utils/quironscore-view";
import { QuironAiButton } from "./ai/quiron-buttons";

const toneColor = (v: number) =>
  v < 34 ? "#EF4444" : v < 67 ? "#F59E0B" : "#1FA35C";
const MUTED = "#9AA3B5";

export const QuironscoreCard: React.FC = () => {
  const { session, profile } = useProfileContext();
  const { data, isLoading } = useQuironscore({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    enabled: !!session?.token && !!profile?.client?.id,
  });

  const view = buildQuironscoreView(data ?? null);
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - ((view.score ?? 0) / 100) * circumference;

  return (
    <div className="qxv2-card qxv2-score">
      <div className="qxv2-card-h">
        <h3>Quironscore</h3>
        <span
          className="qxv2-h-sub"
          style={{
            fontSize: 10.5,
            background: "var(--qx-blue-soft)",
            color: "var(--qx-blue-bright)",
            fontWeight: 800,
            padding: "3px 9px",
            borderRadius: 999,
          }}
        >
          En calibración
        </span>
        <QuironAiButton
          topic="quironscore"
          variant="ghost"
          size="sm"
          style={{ marginLeft: "auto" }}
        />
      </div>
      <div className="qxv2-sc-top">
        <div className="qxv2-donut">
          <svg viewBox="0 0 112 112">
            <circle
              cx="56"
              cy="56"
              r="48"
              fill="none"
              stroke="#EFF1F7"
              strokeWidth="10"
            />
            {view.score !== null && (
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke={toneColor(view.score)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 56 56)"
              />
            )}
          </svg>
          <div className="qxv2-d-val">
            <div>
              <b>{view.score ?? "N/A"}</b>
              <i>DE 100</i>
            </div>
          </div>
        </div>
        <div className="qxv2-sc-side">
          <span className="qxv2-band">
            {isLoading ? "Cargando…" : view.headline}
          </span>
          {data?.calculationDate && (
            <div className="qxv2-scale">
              Calculado al {data.calculationDate}
            </div>
          )}
          <div className="qxv2-scale">
            Caja 45 · Rating 25 · Gestión 15 · Credibilidad 15
          </div>
        </div>
      </div>
      <div className="qxv2-sc-comps">
        {view.components.map((c) => (
          <div className="qxv2-sc-comp" key={c.label} title={c.detail}>
            <span className="qxv2-c-name">
              {c.label}
              <small
                style={{ display: "block", color: MUTED, fontWeight: 500 }}
              >
                {c.detail}
              </small>
            </span>
            <span className="qxv2-c-track">
              <span
                className="qxv2-c-fill"
                style={{
                  width: `${c.value ?? 0}%`,
                  background: c.value === null ? MUTED : toneColor(c.value),
                }}
              />
            </span>
            <span
              className="qxv2-c-val"
              style={{ color: c.value === null ? MUTED : toneColor(c.value) }}
            >
              {c.value ?? "N/A"}
            </span>
          </div>
        ))}
      </div>
      <div className="qxv2-sc-note">
        Si falta un componente no hay Quironscore: no se inventa ni se
        redistribuye su peso.
      </div>
    </div>
  );
};
