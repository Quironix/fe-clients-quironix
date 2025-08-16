import { DTE } from "@/app/dashboard/transactions/dte/types";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Required from "@/components/ui/required";
import { SearchInput } from "@/components/ui/search-input";
import { useState } from "react";

interface DteSelectFormItemProps {
  field: any;
  title: string;
  required: boolean;
  dtes: DTE[];
  onDteSelect?: (dte: DTE | null) => void;
}

export default function DteSelectFormItem({
  field,
  title,
  required,
  dtes,
  onDteSelect,
}: DteSelectFormItemProps) {
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <FormControl className="w-full">
        <SearchInput
          value={field.value}
          onValueChange={(value: string) => {
            field.onChange(value);
            if (onDteSelect) {
              onDteSelect(
                dtes.find((dte: DTE) => dte.number === value) || null
              );
            }
          }}
          options={dtes.map((dte: DTE) => {
            return {
              value: dte.number,
              label: `${dte.number} - ${new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(dte.amount)}`,
              debtor_code: "as",
            };
          })}
          placeholder="Selecciona un documento"
          onSearchChange={(searchValue) => {
            setSearchText(searchValue);
          }}
          isLoading={isSearching}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
