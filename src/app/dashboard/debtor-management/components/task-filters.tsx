"use client";

import { Button } from "@/components/ui/button";
import { ExportExcelModal } from "@/components/ui/export-excel-modal";
import { useProfileContext } from "@/context/ProfileContext";
import { AlertTriangle, File, FileDown, FileText, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
  const t = useTranslations("debtorManagement");
  const { session, profile } = useProfileContext();
  const [exportOpen, setExportOpen] = useState(false);

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
    <div className="mb-3 flex flex-col gap-2">
      {/* Fila 1: buscador + exportar */}
      <div className="flex items-center justify-between gap-3">
        <DebtorSearchAutocomplete placeholder={t("searchPlaceholder")} />
        <Button
          variant="outline"
          className="h-9 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-[4px] shrink-0 text-sm"
          onClick={() => setExportOpen(true)}
        >
          <FileDown className="h-4 w-4 mr-1 text-orange-400" />
          Exportar
        </Button>
      </div>

      <div className="h-px w-full bg-gray-200" />

      {/* Fila 2: filtros de cuadrante */}
      <div className="flex items-center gap-1 w-full">
        <Button
          size="xs"
          variant={selectedQuadrant === "CRITICAL_DEBTORS" ? "secondary" : "outline"}
          className={
            selectedQuadrant === "CRITICAL_DEBTORS"
              ? "bg-red-500 hover:bg-red-600 text-white text-xs rounded-[4px] flex-1"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs rounded-[4px] flex-1"
          }
          onClick={() => handleQuadrantClick("CRITICAL_DEBTORS")}
        >
          <AlertTriangle className="w-4 h-4" />
          {t("filters.critical")} {counts.critical_debtors}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === "CASH_GENERATION" ? "secondary" : "outline"}
          className={
            selectedQuadrant === "CASH_GENERATION"
              ? "bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-[4px] flex-1"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs rounded-[4px] flex-1"
          }
          onClick={() => handleQuadrantClick("CASH_GENERATION")}
        >
          <FileText className="w-4 h-4" />
          {t("filters.cashGeneration")} {counts.cash_generation}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === "LITIGATION" ? "secondary" : "outline"}
          className={
            selectedQuadrant === "LITIGATION"
              ? "bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-[4px] flex-1"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs rounded-[4px] flex-1"
          }
          onClick={() => handleQuadrantClick("LITIGATION")}
        >
          <Scale className="w-4 h-4" />
          {t("filters.litigation")} {counts.litigation}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === "DEFICIENT_TECHNICAL_FILE" ? "secondary" : "outline"}
          className={
            selectedQuadrant === "DEFICIENT_TECHNICAL_FILE"
              ? "bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-[4px] flex-1"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 text-xs rounded-[4px] flex-1"
          }
          onClick={() => handleQuadrantClick("DEFICIENT_TECHNICAL_FILE")}
        >
          <File className="w-4 h-4" />
          {t("filters.technicalFile")} {counts.deficient_technical_file}
        </Button>
        <Button
          size="xs"
          variant={selectedQuadrant === null ? "secondary" : "outline"}
          className={
            selectedQuadrant === null
              ? "bg-gray-400 hover:bg-gray-500 text-white rounded-[4px] flex-1"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 rounded-[4px] flex-1"
          }
          onClick={() => onQuadrantChange(null)}
        >
          {t("filters.all")} {counts.total}
        </Button>
      </div>

      <ExportExcelModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        schema="MANAGEMENTS"
        accessToken={session?.token || ""}
        clientId={profile?.client?.id || ""}
      />
    </div>
  );
};
