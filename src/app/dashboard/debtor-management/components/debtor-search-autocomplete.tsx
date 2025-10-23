"use client";

import { Input } from "@/components/ui/input";
import { useProfileContext } from "@/context/ProfileContext";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getCollectorQuadrants } from "../services";
import { QuadrantItem } from "../services/types";

interface DebtorSearchAutocompleteProps {
  placeholder?: string;
}

const QUADRANT_LABELS: Record<string, { label: string; color: string }> = {
  BROKEN_COMMITMENTS: {
    label: "Compromisos Incumplidos",
    color: "bg-red-100 text-red-700",
  },
  CRITICAL_DEBTORS: {
    label: "Riesgo / crédito",
    color: "bg-red-100 text-red-700",
  },
  CASH_GENERATION: {
    label: "Gen. Caja",
    color: "bg-orange-100 text-orange-700",
  },
  LITIGATION: { label: "Litigios", color: "bg-yellow-100 text-yellow-700" },
  DEFICIENT_TECHNICAL_FILE: {
    label: "Exp. Técnico",
    color: "bg-purple-100 text-purple-700",
  },
  UNCLASSIFIED: { label: "Sin Clasificar", color: "bg-gray-100 text-gray-700" },
};

export const DebtorSearchAutocomplete = ({
  placeholder = "Buscar deudor por código o nombre",
}: DebtorSearchAutocompleteProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<QuadrantItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { session, profile } = useProfileContext();
  const router = useRouter();

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Buscar sugerencias cuando cambia el texto
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchValue.trim() || searchValue.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (!session?.token || !profile?.client?.id) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await getCollectorQuadrants(
          session.token,
          profile.client.id,
          {
            search: searchValue,
            page: 1,
            limit: 4, // Máximo 4 resultados
          }
        );

        // Aplanar todos los resultados de los diferentes cuadrantes
        const allResults: QuadrantItem[] = [
          ...response.data.critical_debtors,
          ...response.data.broken_commitments,
          ...response.data.cash_generation,
          ...response.data.litigation,
          ...response.data.deficient_technical_file,
          ...response.data.unclassified,
        ].slice(0, 4); // Asegurar máximo 4

        setSuggestions(allResults);
        setIsOpen(allResults.length > 0);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce: esperar 300ms después de que el usuario deje de escribir
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, session?.token, profile?.client?.id]);

  const handleSelectDebtor = (debtorId: string) => {
    setIsOpen(false);
    setSearchValue("");
    // Redirigir a la página de detalle del deudor
    router.push(`/dashboard/debtor-management/${debtorId}`);
  };

  const getQuadrantInfo = (quadrantName: string) => {
    return (
      QUADRANT_LABELS[quadrantName] || {
        label: quadrantName,
        color: "bg-gray-100 text-gray-700",
      }
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-auto min-w-[280px] max-w-auto">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200"
        />
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && (
        <div className="absolute z-50 min-w-full w-max max-w-2xl mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Buscando...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((item, index) => {
                const quadrantInfo = getQuadrantInfo(item.quadrantName);
                return (
                  <button
                    key={`${item.debtorId}-${index}`}
                    onClick={() => handleSelectDebtor(item.debtorId)}
                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {item.debtor.debtor_code}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.debtor.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Venc.</div>
                          <div className="font-semibold text-gray-900">
                            $453.119
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${quadrantInfo.color}`}
                        >
                          {quadrantInfo.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};
