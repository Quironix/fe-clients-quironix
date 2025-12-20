"use client";

import { DatePopover } from "@/app/dashboard/components/date-popover";
import { Invoice } from "@/app/dashboard/payment-plans/store";
import {
  Form,
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
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DEBTOR_PAYMENT_METHODS, PAYMENT_FREQUENCY } from "../../../data";

const paymentPlanSchema = z.object({
  downPayment: z.number().min(0, "Debe ser mayor o igual a 0"),
  numberOfInstallments: z.number().min(1, "Debe ser al menos 1"),
  annualInterestRate: z.number().min(0, "Debe ser mayor o igual a 0"),
  paymentMethod: z.string().min(1, "La forma de pago es requerida"),
  paymentFrequency: z.string().min(1, "La frecuencia es requerida"),
  startDate: z.date({ message: "La fecha es requerida" }),
});

type PaymentPlanFormData = z.infer<typeof paymentPlanSchema>;

interface ManagementPaymentPlanFormProps {
  value?: any;
  onChange: (data: any) => void;
  selectedInvoices?: Invoice[];
}

const ManagementPaymentPlanForm = ({
  value,
  onChange,
  selectedInvoices = [],
}: ManagementPaymentPlanFormProps) => {
  const onChangeRef = useRef(onChange);
  const [calculatedInstallment, setCalculatedInstallment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const form = useForm<PaymentPlanFormData>({
    resolver: zodResolver(paymentPlanSchema) as any,
    mode: "onChange",
    defaultValues: value || {
      downPayment: 0,
      numberOfInstallments: 1,
      annualInterestRate: 0,
      paymentMethod: "",
      paymentFrequency: "",
      startDate: undefined,
    },
  });

  const calculateTotalAmount = () => {
    return selectedInvoices.reduce((sum, invoice) => {
      const amount =
        typeof invoice.balance === "string"
          ? parseFloat(invoice.balance)
          : invoice.balance;
      return Math.round(sum + (isNaN(amount) ? 0 : amount));
    }, 0);
  };

  const getFrequencyFactor = (frequency: string) => {
    switch (frequency) {
      case "FREQ_7_DAYS":
        return 52;
      case "FREQ_15_DAYS":
        return 24;
      case "FREQ_30_DAYS":
        return 12;
      case "FREQ_45_DAYS":
        return 4;
      case "FREQ_60_DAYS":
        return 2;
      default:
        return 12;
    }
  };

  const calculateInstallment = () => {
    const totalAmount = calculateTotalAmount();
    const downPayment = form.watch("downPayment") || 0;
    const numberOfInstallments = form.watch("numberOfInstallments") || 1;
    const annualInterestRate = form.watch("annualInterestRate") || 0;
    const paymentFrequency = form.watch("paymentFrequency") || "FREQ_30_DAYS";

    const principal = totalAmount - downPayment;

    if (principal <= 0) return { installment: 0, totalInterest: 0 };
    if (annualInterestRate === 0) {
      return {
        installment: principal / numberOfInstallments,
        totalInterest: 0,
      };
    }

    const frequencyFactor = getFrequencyFactor(paymentFrequency);
    const periodRate = annualInterestRate / 100 / frequencyFactor;

    const installment =
      (principal *
        periodRate *
        Math.pow(1 + periodRate, numberOfInstallments)) /
      (Math.pow(1 + periodRate, numberOfInstallments) - 1);

    const totalToPay = installment * numberOfInstallments;
    const totalInterest = totalToPay - principal;

    return { installment, totalInterest };
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      const { installment, totalInterest } = calculateInstallment();
      setCalculatedInstallment(installment);
      setTotalInterest(totalInterest);

      const isValid = form.formState.isValid;

      onChangeRef.current({
        ...values,
        _isValid: isValid,
      });
    });

    return () => subscription.unsubscribe();
  }, [form.watch, form.formState.isValid]);

  const formatNumberWithThousands = (value: number) => {
    return new Intl.NumberFormat("es-CL").format(Math.round(value));
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue;
  };

  const parseFormattedNumber = (value: string) => {
    const cleanValue = value.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(cleanValue) || 0;
  };

  const totalAmount = calculateTotalAmount();
  const downPayment = form.watch("downPayment") || 0;
  const amountToFinance = totalAmount - downPayment;
  const totalToPay = amountToFinance + totalInterest;
  const downPaymentPercentage =
    totalAmount > 0 ? ((downPayment / totalAmount) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Formulario - Izquierda (8 columnas) */}
      <div className="col-span-8 space-y-6">
        <Form {...form}>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-semibold text-blue-900">
                  Resumen de Facturas
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Facturas seleccionadas:</span>
                  <span className="font-semibold">
                    {selectedInvoices.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monto total:</span>
                  <span className="font-semibold text-blue-900">
                    ${formatNumberWithThousands(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pago contado ($)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa un monto"
                        value={
                          field.value !== undefined && field.value !== null
                            ? formatNumberWithThousands(field.value)
                            : "0"
                        }
                        onChange={(e) => {
                          const value = formatCurrency(e.target.value);
                          field.onChange(parseFormattedNumber(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numberOfInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      N° de cuotas <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        placeholder="Ingresa el número de cuotas"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            field.onChange(parseInt(value) || 0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="annualInterestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tasa de interés anual (%){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={48}
                        step="0.01"
                        placeholder="Ej: 5.5"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            field.onChange(parseFloat(value) || 0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Forma de pago <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEBTOR_PAYMENT_METHODS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
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
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Frecuencia de pago <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_FREQUENCY.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.label}
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
                name="startDate"
                render={({ field }) => (
                  <DatePopover
                    field={field}
                    label="Fecha de inicio"
                    placeholder="Selecciona fecha"
                    required
                  />
                )}
              />
            </div>
          </div>
        </Form>
      </div>

      {/* Resumen Financiero - Derecha (4 columnas) */}
      <div className="col-span-4">
        <div className="sticky top-4 space-y-4">
          <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-900">
                Resumen financiero
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Colocación total:</span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(totalAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  Pago contado ({downPaymentPercentage}%):
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(downPayment)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5 border-b border-gray-300">
                <span className="text-sm text-gray-700">
                  Monto a financiar:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(amountToFinance)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2.5">
                <span className="text-sm text-gray-700">
                  Cuota{" "}
                  {PAYMENT_FREQUENCY.find(
                    (f) => f.code === form.watch("paymentFrequency")
                  )?.label.toLowerCase() || "mensual"}
                  :
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(calculatedInstallment)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2.5">
                <span className="text-sm text-gray-700">Total intereses:</span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(totalInterest)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-gray-300 bg-blue-100/60 -mx-5 px-5 py-3 -mb-5 rounded-b-xl">
                <span className="text-sm font-semibold text-gray-900">
                  Total a pagar:
                </span>
                <span className="text-sm font-bold text-gray-900">
                  ${formatNumberWithThousands(totalToPay)}
                </span>
              </div>
            </div>
          </div>

          {!form.formState.isValid && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                Debe completar todos los campos del plan de pago
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagementPaymentPlanForm;
