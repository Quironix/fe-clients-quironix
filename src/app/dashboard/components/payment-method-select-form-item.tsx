import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { SelectValue } from "@/components/ui/select";

import { SelectTrigger } from "@/components/ui/select";

import { FormControl, FormMessage } from "@/components/ui/form";

import { FormLabel } from "@/components/ui/form";

import { FormItem } from "@/components/ui/form";
import Required from "@/components/ui/required";
import { Select } from "@/components/ui/select";
import { DEBTOR_PAYMENT_METHODS } from "../data";

interface PaymentMethodSelectFormItemProps {
  field: any;
  title: string;
  required?: boolean;
}

export default function PaymentMethodSelectFormItem({
  field,
  title,
  required,
}: PaymentMethodSelectFormItemProps) {
  return (
    <FormItem>
      <FormLabel>
        {title} {required && <Required />}
      </FormLabel>
      <Select 
        onValueChange={(value) => field.onChange(value === "__none__" ? null : value)}
        value={field.value || "__none__"}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un banco" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="__none__">-- Selecciona un método de pago --</SelectItem>
          {DEBTOR_PAYMENT_METHODS.map((paymentMethod) => (
            <SelectItem key={paymentMethod.value} value={paymentMethod.value}>
              {paymentMethod.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
