import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";

import { FormItem } from "@/components/ui/form";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfileContext } from "@/context/ProfileContext";
import { useEffect } from "react";
import { useBankInformationStore } from "../banks/store";

interface BankInformationSelectFormItemProps {
  field: any;
  title: string;
  required?: boolean;
}

export default function BankInformationSelectFormItem({
  field,
  title,
  required,
}: BankInformationSelectFormItemProps) {
  const { banksInformations, getAllBanksInformations } =
    useBankInformationStore();
  const { session, profile } = useProfileContext();

  useEffect(() => {
    if (
      session?.token &&
      profile?.client?.id &&
      banksInformations.length === 0
    ) {
      getAllBanksInformations(session.token, profile.client.id);
    }
  }, [session?.token, profile?.client?.id]);

  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select
        onValueChange={field.onChange}
        value={field.value}
        key={field.value}
        disabled={banksInformations.length === 0}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={
                banksInformations.length === 0
                  ? "Cargando bancos..."
                  : "Selecciona un banco"
              }
            />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {banksInformations.length > 0 ? (
            banksInformations.map((bank: any) => (
              <SelectItem key={bank.id} value={bank.id}>
                {bank.bank} ({bank.account_number})
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No hay bancos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
