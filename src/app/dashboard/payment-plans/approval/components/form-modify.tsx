import {
  DEBTOR_PAYMENT_METHODS,
  PAYMENT_FREQUENCY,
} from "@/app/dashboard/data";
import { useDebtorsStore } from "@/app/dashboard/debtors/store";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { usePaymentPlansStore } from "../../store";

const FormModify = () => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const t = useTranslations("paymentPlans.approvalForm.formModify");

  const { selectedInvoices, clearSelectedInvoices } = usePaymentPlansStore();

  const {
    debtors,
    fetchDebtorsPaginated,
    loading,
    isSearching,
    fetchDebtorById,
    dataDebtor,
    clearDataDebtor,
  } = useDebtorsStore();

  const paymentPlanSchema = z.object({
    totalAmount: z.number().min(1, t("totalRequired")),
    downPayment: z.number().min(0, t("downPaymentMin")),
    numberOfInstallments: z.number().min(1, t("installmentsRequired")),
    annualInterestRate: z
      .number()
      .min(0, t("interestRateMin")),
    paymentMethod: z.string().min(1, t("paymentMethodRequired")),
    paymentFrequency: z.string().min(1, t("frequencyRequired")),
    startDate: z.date({ message: t("startDateRequired") }),
    comments: z.string().optional(),
  });
  type PaymentPlanForm = z.infer<typeof paymentPlanSchema>;

  const form = useForm<PaymentPlanForm>({
    resolver: zodResolver(paymentPlanSchema) as any,
    mode: "onChange",
    defaultValues: {
      totalAmount: 0,
      downPayment: 0,
      numberOfInstallments: 1,
      annualInterestRate: 0,
      paymentMethod: "",
      paymentFrequency: "",
      startDate: undefined,
      comments: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
    watch,
    setValue,
    getValues,
  } = form;

  const watchedTotalAmount = watch("totalAmount");

  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setValue("totalAmount", totalAmount);
  }, [selectedInvoices, setValue]);

  const handleViewDetails = () => {
    console.log("Ver detalles del plan de pago");
  };

  const handleResetForm = () => {
    form.reset();
    clearSelectedInvoices();
    clearDataDebtor();
  };

  useEffect(() => {
    return () => {
      handleResetForm();
    };
  }, []);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue;
  };

  const parseFormattedNumber = (value: string) => {
    const cleanValue = value.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(cleanValue) || 0;
  };

  const formatNumberWithThousands = (value: number) => {
    return new Intl.NumberFormat("es-CL").format(value);
  };

  const calculateTotalAmount = () => {
    return selectedInvoices.reduce((sum, invoice) => {
      const amount =
        typeof invoice.amount === "string"
          ? parseFloat(invoice.amount)
          : invoice.amount;
      return Math.round(sum + (isNaN(amount) ? 0 : amount));
    }, 0);
  };

  const getFrequencyFactor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return 52;
      case "monthly":
        return 12;
      case "quarterly":
        return 4;
      case "semiannual":
        return 2;
      default:
        return 12;
    }
  };

  const calculateInstallment = () => {
    const totalAmount = calculateTotalAmount();
    const downPayment = watch("downPayment") || 0;
    const numberOfInstallments = watch("numberOfInstallments") || 1;
    const annualInterestRate = watch("annualInterestRate") || 0;
    const paymentFrequency = watch("paymentFrequency") || "monthly";

    const principal = totalAmount - downPayment;

    if (principal <= 0) return 0;
    if (annualInterestRate === 0) return principal / numberOfInstallments;

    const frequencyFactor = getFrequencyFactor(paymentFrequency);
    const periodRate = annualInterestRate / 100 / frequencyFactor;

    const installment =
      (principal *
        periodRate *
        Math.pow(1 + periodRate, numberOfInstallments)) /
      (Math.pow(1 + periodRate, numberOfInstallments) - 1);

    return installment;
  };

  const onSubmit = async (data: PaymentPlanForm) => {
    try {
      form.reset();
    } catch (error) {
      console.error("Error al crear plan de pago:", error);
      toast.error(t("createError"));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="totalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("totalAmountLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("calculatedAutomatically")}
                disabled={true}
                value={
                  field.value
                    ? `$${formatNumberWithThousands(field.value)}`
                    : "$0"
                }
                className="bg-gray-100 text-gray-700 font-medium"
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="downPayment"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("downPaymentLabel")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("enterAmount")}
                value={
                  field.value ? formatNumberWithThousands(field.value) : ""
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
        control={control}
        name="numberOfInstallments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("installmentsLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectPlaceholder")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {t("installmentUnit", { count: num })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="annualInterestRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("interestRateLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder={t("interestRatePlaceholder")}
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
        control={control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("paymentMethodLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectPlaceholder")} />
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
        control={control}
        name="paymentFrequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("paymentFrequencyLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectPlaceholder")} />
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
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("startDateLabel")} <span className="text-red-500">*</span>
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "dd-MM-yyyy", {
                          locale: es,
                        })
                      : t("datePlaceholder")}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("commentLabel")}</FormLabel>
            <FormControl>
              <Textarea placeholder={t("commentPlaceholder")} {...field} rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FormModify;
