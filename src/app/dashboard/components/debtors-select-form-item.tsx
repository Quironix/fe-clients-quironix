import { FormControl, FormMessage } from "@/components/ui/form";

import { FormItem, FormLabel } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { SearchInput } from "@/components/ui/search-input";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { useDebtorsStore } from "../debtors/store";
import useDebounce from "../hooks/useDebounce";

export interface DebtorsSelectFormItemProps {
  field: FieldValues;
  title?: string;
  required?: boolean;
  resetTrigger?: boolean;
  initialDebtor?: { id?: string; name?: string; debtor_code?: string };
}

export default function DebtorsSelectFormItem({
  field,
  title,
  required,
  resetTrigger,
  initialDebtor,
}: DebtorsSelectFormItemProps) {
  const { debtors, fetchDebtorsPaginated, loading, isSearching } =
    useDebtorsStore();
  const { profile, session } = useProfileContext();
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    if (session?.token && profile?.client?.id && debtors.length === 0) {
      fetchDebtorsPaginated(session?.token, profile?.client?.id);
    }
  }, [fetchDebtorsPaginated, profile?.client?.id, session?.token]);

  useEffect(() => {
    // This effect runs only when debouncedSearchText changes (after the delay)
    if (debouncedSearchText && session?.token && profile?.client?.id) {
      // Perform your search operation here, e.g., make an API call
      console.log("Searching for:", debouncedSearchText);
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
      // Si se borra la búsqueda, cargar todos los deudores
      fetchDebtorsPaginated(session?.token, profile?.client?.id, 1);
    }
  }, [
    debouncedSearchText,
    session?.token,
    profile?.client?.id,
    fetchDebtorsPaginated,
  ]);

  // Efecto para resetear el estado interno cuando se active resetTrigger
  useEffect(() => {
    if (resetTrigger) {
      setSearchText("");
      // También cargar todos los deudores nuevamente
      if (session?.token && profile?.client?.id) {
        fetchDebtorsPaginated(session?.token, profile?.client?.id, 1);
      }
    }
  }, [
    resetTrigger,
    session?.token,
    profile?.client?.id,
    fetchDebtorsPaginated,
  ]);

  const combinedDebtors = useMemo(() => {
    if (initialDebtor?.id && initialDebtor?.name && !debtors.find(d => d.id === initialDebtor.id)) {
      return [initialDebtor as { id: string; name: string; debtor_code?: string }, ...debtors];
    }
    return debtors;
  }, [debtors, initialDebtor]);

  return (
    <FormItem>
      {title && (
        <FormLabel>
          {title} {required && <Required />}
        </FormLabel>
      )}
      <FormControl className="w-full">
        <SearchInput
          value={field.value}
          onValueChange={(value: string) => field.onChange(value)}
          options={combinedDebtors.map((debtor: any) => {
            return {
              value: debtor.id,
              label: debtor.name,
              custom: debtor.debtor_code,
            };
          })}
          placeholder="Selecciona un deudor"
          onSearchChange={(searchValue) => {
            setSearchText(searchValue);
          }}
          isLoading={isSearching}
          resetTrigger={resetTrigger}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
