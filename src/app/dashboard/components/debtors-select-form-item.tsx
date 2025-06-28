import { FormControl, FormMessage } from "@/components/ui/form";

import { FormItem, FormLabel } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { SearchInput } from "@/components/ui/search-input";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { FieldValues } from "react-hook-form";
import { useDebtorsStore } from "../debtors/store";

export interface DebtorsSelectFormItemProps {
  field: FieldValues;
  title: string;
  required?: boolean;
}

export default function DebtorsSelectFormItem({
  field,
  title,
  required,
}: DebtorsSelectFormItemProps) {
  const { debtors, fetchDebtors } = useDebtorsStore();
  const { profile, session } = useProfileContext();

  useEffect(() => {
    if (session?.token && profile?.client?.id && debtors.length === 0) {
      fetchDebtors(session?.token, profile?.client?.id);
    }
  }, [fetchDebtors, profile?.client?.id, session?.token]);

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <FormControl className="w-full">
        <SearchInput
          value={field.value}
          onValueChange={(value: string) => field.onChange(value)}
          options={debtors.map((debtor: any) => ({
            value: debtor.id,
            label: debtor.name,
          }))}
          placeholder="Selecciona un deudor"
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
