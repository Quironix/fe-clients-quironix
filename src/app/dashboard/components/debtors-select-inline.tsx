import { FormControl, FormMessage } from "@/components/ui/form";
import { FormItem, FormLabel } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Button } from "@/components/ui/button";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { useDebtorsStore } from "../debtors/store";
import useDebounce from "../hooks/useDebounce";
import { Check, ChevronsUpDown, Loader2, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DebtorsSelectInlineProps {
  field: FieldValues;
  title?: string;
  required?: boolean;
  initialDebtor?: { id?: string; name?: string; debtor_code?: string };
}

export default function DebtorsSelectInline({
  field,
  title,
  required,
  initialDebtor,
}: DebtorsSelectInlineProps) {
  const { debtors, fetchDebtorsPaginated, loading, isSearching } =
    useDebtorsStore();
  const { profile, session } = useProfileContext();
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPlacement, setDropdownPlacement] = useState<"bottom" | "top">("bottom");
  const debouncedSearchText = useDebounce(searchText, 500);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (session?.token && profile?.client?.id && debtors.length === 0) {
      fetchDebtorsPaginated(session?.token, profile?.client?.id);
    }
  }, [fetchDebtorsPaginated, profile?.client?.id, session?.token]);

  useEffect(() => {
    if (debouncedSearchText && session?.token && profile?.client?.id) {
      fetchDebtorsPaginated(
        session?.token,
        profile?.client?.id,
        1,
        debouncedSearchText
      );
    } else if (
      debouncedSearchText === "" &&
      session?.token &&
      profile?.client?.id
    ) {
      fetchDebtorsPaginated(session?.token, profile?.client?.id, 1);
    }
  }, [
    debouncedSearchText,
    session?.token,
    profile?.client?.id,
    fetchDebtorsPaginated,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 350;
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPlacement("top");
      } else {
        setDropdownPlacement("bottom");
      }
    }
  }, [isOpen]);

  const [selectedDebtorData, setSelectedDebtorData] = useState<{ id: string; name: string; debtor_code?: string } | null>(null);

  useEffect(() => {
    if (field.value && !selectedDebtorData) {
      const debtor = debtors.find(d => d.id === field.value);
      if (debtor) {
        setSelectedDebtorData(debtor);
      }
    }
  }, [field.value, debtors, selectedDebtorData]);

  const combinedDebtors = useMemo(() => {
    const debtorsList = [...debtors];

    if (initialDebtor?.id && initialDebtor?.name && !debtorsList.find(d => d.id === initialDebtor.id)) {
      debtorsList.unshift(initialDebtor as { id: string; name: string; debtor_code?: string });
    }

    if (selectedDebtorData && !debtorsList.find(d => d.id === selectedDebtorData.id)) {
      debtorsList.unshift(selectedDebtorData);
    }

    return debtorsList;
  }, [debtors, initialDebtor, selectedDebtorData]);

  const selectedDebtor = combinedDebtors.find((d) => d.id === field.value);

  return (
    <FormItem className="relative">
      {title && (
        <FormLabel>
          {title} {required && <Required />}
        </FormLabel>
      )}
      <FormControl className="w-full">
        <div ref={containerRef} className="relative">
          <Button
            ref={buttonRef}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between truncate",
              !field.value && "text-muted-foreground"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="truncate">
              {selectedDebtor ? selectedDebtor.name : "Selecciona un deudor"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>

          {isOpen && (
            <div
              className={cn(
                "absolute z-50 w-full bg-white border rounded-md shadow-md",
                dropdownPlacement === "top" ? "bottom-full mb-1" : "top-full mt-1"
              )}
            >
              <div className="flex h-9 items-center gap-2 border-b px-3">
                <SearchIcon className="h-4 w-4 shrink-0 opacity-50" />
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Buscar..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="max-h-[300px] overflow-x-hidden overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Buscando...
                    </span>
                  </div>
                ) : combinedDebtors.length === 0 ? (
                  <div className="py-6 text-center text-sm">
                    No se encontró el elemento
                  </div>
                ) : (
                  <div className="p-1">
                    {combinedDebtors.map((debtor) => (
                      <button
                        key={debtor.id}
                        type="button"
                        className={cn(
                          "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
                          debtor.id === field.value && "bg-accent"
                        )}
                        onClick={() => {
                          field.onChange(debtor.id);
                          setSelectedDebtorData(debtor);
                          setSearchText("");
                          setIsOpen(false);
                        }}
                      >
                        <span className="truncate">{debtor.name}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            debtor.id === field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
