import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";

import { FormItem } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BANK_LIST } from "../data";

interface BankListSelectFormItemProps {
  field: any;
  title: string;
  required?: boolean;
}

export default function BankListSelectFormItem({
  field,
  title,
  required,
}: BankListSelectFormItemProps) {
  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un banco" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {BANK_LIST.map((bank) => (
            <SelectItem key={bank.name} value={bank.name}>
              {bank.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
