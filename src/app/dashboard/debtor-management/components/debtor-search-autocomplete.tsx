"use client";

import { Input } from "@/components/ui/input";
import { useProfileContext } from "@/context/ProfileContext";
import { formatNumber } from "@/lib/utils";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getDebtors } from "@/app/dashboard/debtors/services";
import { getCollectorQuadrants } from "../services";
import { Debtor, QuadrantItem } from "../services/types";
import DialogConfirm from "../../components/dialog-confirm";

interface DebtorSearchAutocompleteProps {
  placeholder?: string;
  onSelect?: (debtor: Debtor) => void;
  searchMode?: "quadrant" | "simple";
}

interface QuadrantItemWithHighlight extends QuadrantItem {
  isFirstInQuadrant?: boolean;
}

const QUADRANT_COLORS: Record<string, string> = {
  BROKEN_COMMITMENTS: "bg-red-100 text-red-700",
  CRITICAL_DEBTORS: "bg-red-100 text-red-700",
  CASH_GENERATION: "bg-orange-100 text-orange-700",
  LITIGATION: "bg-yellow-100 text-yellow-700",
  DEFICIENT_TECHNICAL_FILE: "bg-purple-100 text-purple-700",
  UNCLASSIFIED: "bg-gray-100 text-gray-700",
};

export const DebtorSearchAutocomplete = ({
  placeholder,
  onSelect,
  searchMode = "quadrant",
}: DebtorSearchAutocompleteProps) => {
  const t = useTranslations("debtorManagement");
  const tTask = useTranslations("debtorManagement.taskItem");
  const defaultPlaceholder = t("searchPlaceholder");
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<QuadrantItemWithHighlight[]>([]);
  const [simpleResults, setSimpleResults] = useState<Debtor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { session, profile } = useProfileContext();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchValue.trim() || searchValue.length < 2) {
        setSuggestions([]);
        setSimpleResults([]);
        setIsOpen(false);
        return;
      }
      if (!session?.token || !profile?.client?.id) return;

      setIsLoading(true);
      try {
        if (searchMode === "simple") {
          const response = await getDebtors(session.token, profile.client.id, {
            search: searchValue,
            page: 1,
            limit: 5,
          });
          const results: Debtor[] = response.data || [];
          setSimpleResults(results);
          setIsOpen(results.length > 0);
        } else {
          const response = await getCollectorQuadrants(session.token, profile.client.id, {
            search: searchValue,
            page: 1,
            limit: 4,
          });

          const allResults: QuadrantItemWithHighlight[] = [];
          const quadrants = [
            response.data.critical_debtors,
            response.data.broken_commitments,
            response.data.cash_generation,
            response.data.litigation,
            response.data.deficient_technical_file,
            response.data.unclassified,
          ];
          for (const quadrant of quadrants) {
            if (quadrant.length > 0) {
              allResults.push({ ...quadrant[0], isFirstInQuadrant: true });
              allResults.push(...quadrant.slice(1));
            }
          }
          const limitedResults = allResults.slice(0, 4);
          setSuggestions(limitedResults);
          setIsOpen(allResults.length > 0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setSimpleResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, session?.token, profile?.client?.id, searchMode]);

  const handleSelectSimpleDebtor = (debtor: Debtor) => {
    setIsOpen(false);
    setSearchValue("");
    if (onSelect) {
      onSelect(debtor);
    } else {
      router.push(`/dashboard/debtor-management/${debtor.id}`);
    }
  };

  const handleSelectDebtor = (item: QuadrantItemWithHighlight) => {
    if (item.isFirstInQuadrant) {
      setIsOpen(false);
      setSearchValue("");
      if (onSelect) {
        onSelect(item.debtor);
      } else {
        router.push(`/dashboard/debtor-management/${item.debtor.id}`);
      }
    } else {
      setSelectedDebtor(item.debtor);
      setIsDialogOpen(true);
    }
  };

  const handleConfirmNavigation = () => {
    if (selectedDebtor) {
      setIsOpen(false);
      setSearchValue("");
      setIsDialogOpen(false);
      if (onSelect) {
        onSelect(selectedDebtor);
      } else {
        router.push(`/dashboard/debtor-management/${selectedDebtor.id}`);
      }
    }
  };

  const getQuadrantInfo = (quadrantName: string) => {
    const tQuadrant = t(`quadrantLabels.${quadrantName}` as any);
    return {
      label: tQuadrant || quadrantName,
      color: QUADRANT_COLORS[quadrantName] || "bg-gray-100 text-gray-700",
    };
  };

  return (
    <div ref={wrapperRef} className="relative w-auto min-w-[280px] max-w-[300px]">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
        <Input
          placeholder={placeholder || defaultPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 min-w-full w-max max-w-lg mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">{t("searching")}</div>
          ) : searchMode === "simple" ? (
            simpleResults.length > 0 ? (
              <div className="py-2">
                {simpleResults.map((debtor) => (
                  <button
                    key={debtor.id}
                    onClick={() => handleSelectSimpleDebtor(debtor)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="font-semibold text-gray-900">{debtor.name}</div>
                    <div className="text-[11px] text-gray-400 uppercase">{debtor.debtor_code}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">{t("noResults")}</div>
            )
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((item, index) => {
                const quadrantInfo = getQuadrantInfo(item.quadrantName);
                return (
                  <button
                    key={`${item.debtorId}-${index}`}
                    onClick={() => handleSelectDebtor(item)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 gap-x-0">
                        <div className="font-semibold text-gray-900">{item.debtor.debtor_code}</div>
                        <div className="text-[11px] text-gray-400 uppercase">{item.debtor.name}</div>
                      </div>
                      <div className="flex flex-col gap-1 ml-4 justify-end items-end">
                        <div className="text-right flex items-center gap-2">
                          <div className="text-xs text-gray-500">{t("expired")}</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(item.debtor.due_debt_amount)}
                          </div>
                        </div>
                        <span className={`px-3 rounded-full text-[10px] font-medium whitespace-nowrap ${quadrantInfo.color}`}>
                          {quadrantInfo.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">{t("noResults")}</div>
          )}
        </div>
      )}

      <DialogConfirm
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        title={tTask("outOfOrderTitle")}
        description={tTask("outOfOrderDescription")}
        confirmButtonText={tTask("backButton")}
        cancelButtonText={tTask("continueButton")}
        onCancel={handleConfirmNavigation}
        type="warning"
      />
    </div>
  );
};
