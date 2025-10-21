"use client";

import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { AlertTriangle, File, FileText, Scale } from "lucide-react";
import { useMemo } from "react";
import { useCollectorQuadrants } from "../hooks/useCollectorQuadrants";
import { QuadrantType } from "../services/types";
import { DebtorSearchAutocomplete } from "./debtor-search-autocomplete";

interface TaskFiltersProps {
  selectedQuadrant: QuadrantType;
  onQuadrantChange: (value: QuadrantType) => void;
}

export const TaskFilters = ({
  selectedQuadrant,
  onQuadrantChange,
}: TaskFiltersProps) => {
  const { session, profile } = useProfileContext();

  // Obtener datos sin filtros para calcular totales
  const { data } = useCollectorQuadrants({
    accessToken: session?.token || "",
    clientId: profile?.client?.id || "",
    params: {
      page: 1,
      limit: 1000, // Obtener todos para contar
    },
  });

  // Calcular totales por cuadrante
  const counts = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        critical_debtors: 0,
        broken_commitments: 0,
        cash_generation: 0,
        litigation: 0,
        deficient_technical_file: 0,
        unclassified: 0,
      };
    }

    return {
      total:
        data.data.critical_debtors.length +
        data.data.broken_commitments.length +
        data.data.cash_generation.length +
        data.data.litigation.length +
        data.data.deficient_technical_file.length +
        data.data.unclassified.length,
      critical_debtors: data.data.critical_debtors.length,
      broken_commitments: data.data.broken_commitments.length,
      cash_generation: data.data.cash_generation.length,
      litigation: data.data.litigation.length,
      deficient_technical_file: data.data.deficient_technical_file.length,
      unclassified: data.data.unclassified.length,
    };
  }, [data]);

  const handleQuadrantClick = (quadrant: QuadrantType) => {
    // Si se hace clic en el cuadrante ya seleccionado, deseleccionar
    if (selectedQuadrant === quadrant) {
      onQuadrantChange(null);
    } else {
      onQuadrantChange(quadrant);
    }
  };

  return (
    <div className="mb-3 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:justify-between">
      <DebtorSearchAutocomplete placeholder="Buscar deudor por código o nombre" />

      <div className="flex items-center gap-1 flex-wrap">
        <Button
          size="xs"
          variant={
            selectedQuadrant === "CRITICAL_DEBTORS" ? "secondary" : "outline"
          }
          className={
            selectedQuadrant === "CRITICAL_DEBTORS"
              ? "bg-red-500 hover:bg-red-600 text-white text-xs"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
          }
          onClick={() => handleQuadrantClick("CRITICAL_DEBTORS")}
        >
          <AlertTriangle className="w-4 h-4" />
          Críticos {counts.critical_debtors}
        </Button>
        <Button
          size="xs"
          variant={
            selectedQuadrant === "CASH_GENERATION" ? "secondary" : "outline"
          }
          className={
            selectedQuadrant === "CASH_GENERATION"
              ? "bg-orange-500 hover:bg-orange-600 text-white text-xs"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
          }
          onClick={() => handleQuadrantClick("CASH_GENERATION")}
        >
          <FileText className="w-4 h-4" />
          Gen. Caja {counts.cash_generation}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === "LITIGATION" ? "secondary" : "outline"}
          className={
            selectedQuadrant === "LITIGATION"
              ? "bg-yellow-500 hover:bg-yellow-600 text-white text-xs"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
          }
          onClick={() => handleQuadrantClick("LITIGATION")}
        >
          <Scale className="w-4 h-4" />
          Litigios {counts.litigation}
        </Button>
        <Button
          size="xs"
          variant={
            selectedQuadrant === "DEFICIENT_TECHNICAL_FILE"
              ? "secondary"
              : "outline"
          }
          className={
            selectedQuadrant === "DEFICIENT_TECHNICAL_FILE"
              ? "bg-purple-500 hover:bg-purple-600 text-white text-xs"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
          }
          onClick={() => handleQuadrantClick("DEFICIENT_TECHNICAL_FILE")}
        >
          <File className="w-4 h-4" />
          Exp. Técnico {counts.deficient_technical_file}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === null ? "secondary" : "outline"}
          className={
            selectedQuadrant === null
              ? "bg-gray-400 hover:bg-gray-500 text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }
          onClick={() => onQuadrantChange(null)}
        >
          Todas {counts.total}
        </Button>
      </div>
    </div>
  );
};
