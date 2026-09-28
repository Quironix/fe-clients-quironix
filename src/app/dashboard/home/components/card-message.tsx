import React from "react";

export const CardMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div style={{ padding: "16px", color: "#667085", fontSize: "13px" }}>
    {children}
  </div>
);

export const loadingOrEmpty = (isLoading: boolean | undefined) =>
  isLoading ? "Cargando…" : "Sin datos";
