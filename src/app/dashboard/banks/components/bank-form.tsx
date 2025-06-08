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
import { BankFormValues } from "./bank-dialog";

interface BankFormProps {
  form: UseFormReturn<BankFormValues>;
  isLoading: boolean;
}

interface Bank {
  name: string;
  sbifCode: string;
}

export const BANK_LIST: Bank[] = [
  { name: "Banco de Chile", sbifCode: "001" },
  { name: "Banco Internacional", sbifCode: "009" },
  { name: "Scotiabank Chile", sbifCode: "014" },
  { name: "Banco de Crédito e Inversiones", sbifCode: "016" },
  { name: "Banco BICE", sbifCode: "028" },
  { name: "HSBC Bank (Chile)", sbifCode: "031" },
  { name: "Banco Santander-Chile", sbifCode: "037" },
  { name: "Banco Itaú Chile", sbifCode: "039" },
  { name: "JP Morgan Chase Bank, N. A.", sbifCode: "041" },
  { name: "Banco Security", sbifCode: "049" },
  { name: "Banco Falabella", sbifCode: "051" },
  { name: "Banco Ripley", sbifCode: "053" },
  { name: "Banco Consorcio", sbifCode: "055" },
  { name: "Banco BTG Pactual Chile", sbifCode: "059" },
  { name: "China Construction Bank, Agencia en Chile", sbifCode: "060" },
  { name: "Bank of China, Agencia en Chile", sbifCode: "061" },
  { name: "Tanner Banco Digital", sbifCode: "062" },
  { name: "Banco Estado", sbifCode: "012" },
];

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
