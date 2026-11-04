"use client";

import { Button } from "@/components/ui/button";
import { ExportExcelModal } from "@/components/ui/export-excel-modal";
import { useProfileContext } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, File, FileDown, FileText, Scale } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useState } from "react";
import { DailyPlanTab } from "../types/daily-plan";
import { DebtorSearchAutocomplete } from "./debtor-search-autocomplete";

interface DailyPlanFiltersProps {
  selectedTab: DailyPlanTab;
  countsByTab?: Record<DailyPlanTab, number>;
  onTabChange: (tab: DailyPlanTab) => void;
}

const TABS: Array<{
  tab: DailyPlanTab;
  label: string;
  icon?: ReactNode;
  activeClass: string;
}> = [
  {
    tab: "CRITICAL",
    label: "critical",
    icon: <AlertTriangle className="w-4 h-4" />,
    activeClass: "bg-red-500 hover:bg-red-600",
  },
  {
    tab: "CASH_GENERATION",
    label: "cashGeneration",
    icon: <FileText className="w-4 h-4" />,
    activeClass: "bg-orange-500 hover:bg-orange-600",
  },
  {
    tab: "LITIGATION",
    label: "litigation",
    icon: <Scale className="w-4 h-4" />,
    activeClass: "bg-yellow-500 hover:bg-yellow-600",
  },
  {
    tab: "TECHNICAL_FILE",
    label: "technicalFile",
    icon: <File className="w-4 h-4" />,
    activeClass: "bg-purple-500 hover:bg-purple-600",
  },
  { tab: "ALL", label: "all", activeClass: "bg-gray-400 hover:bg-gray-500" },
];

export const DailyPlanFilters = ({
  selectedTab,
  countsByTab,
  onTabChange,
}: DailyPlanFiltersProps) => {
  const t = useTranslations("debtorManagement");
  const { session, profile } = useProfileContext();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="mb-3 flex flex-col gap-2">
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

      <div className="flex items-center gap-1 w-full">
        {TABS.map(({ tab, label, icon, activeClass }) => {
          const active = selectedTab === tab;
          return (
            <Button
              key={tab}
              size="xs"
              variant={active ? "secondary" : "outline"}
              className={cn(
                "text-xs rounded-[4px] flex-1",
                active
                  ? `${activeClass} text-white`
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              )}
              onClick={() => onTabChange(active ? "ALL" : tab)}
            >
              {icon}
              {t(`filters.${label}`)} {countsByTab?.[tab] ?? 0}
            </Button>
          );
        })}
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
