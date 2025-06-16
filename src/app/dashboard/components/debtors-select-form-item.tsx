import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { FormControl, FormMessage } from "@/components/ui/form";

import { FormItem, FormLabel } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { useDebtorsStore } from "../debtors/store";

export interface DebtorsSelectFormItemProps {
  field: any;
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
      <Select
        onValueChange={field.onChange}
        value={field.value}
        key={field.value}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {debtors
            .filter(
              (debtor) =>
                debtor.name &&
                debtor.name.trim() !== "" &&
                debtor.id &&
                typeof debtor.id === "string" &&
                debtor.id.trim() !== ""
            )
            .map((debtor) => (
              <SelectItem key={debtor.id!} value={debtor.id}>
                {debtor.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
