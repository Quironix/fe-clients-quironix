"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { BANK_LIST } from "../../data";
import { BankFormValues } from "./bank-dialog";

interface BankFormProps {
  form: UseFormReturn<BankFormValues>;
  isLoading: boolean;
}

export interface Bank {
  name: string;
  sbifCode: string;
}

const BankForm: React.FC<BankFormProps> = ({ form, isLoading }) => {
  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="bank"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Banco<span className="text-orange-500">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
              defaultValue={field.value}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {BANK_LIST.map((bank) => (
                  <SelectItem key={bank.sbifCode} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="account_number"
        disabled={isLoading}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Número de cuenta<span className="text-orange-500">*</span>
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="Completa" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ledger_account"
        disabled={isLoading}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cuenta contable</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Completa" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BankForm;
