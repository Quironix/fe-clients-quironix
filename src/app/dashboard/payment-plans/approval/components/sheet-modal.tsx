import {
  DEBTOR_PAYMENT_METHODS,
  PAYMENT_FREQUENCY,
} from "@/app/dashboard/data";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Required from "@/components/ui/required";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { formatNumber, getPendingInstallments } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calculator,
  CalendarCheck,
  CalendarClock,
  Calendar as CalendarIcon,
  ChartBar,
  ChevronDown,
  ChevronUp,
  Coins,
  DollarSign,
  Eye,
  Info,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import CardUser from "../../components/card-user";
import {
  approvePaymentPlan,
  rejectPaymentPlan,
  updatePaymentPlan,
} from "../../services";
import {
  PaymentFrequency,
  PaymentPlanResponse,
  UpdatePaymentPlanRequest,
} from "../../types";

const paymentPlanSchema = z
  .object({
    type: z.enum(["approve", "reject", "modify"], {
      message: "You need to select a notification type.",
    }),
    // Información del deudor
    debtorId: z.string().optional(),

    // Facturas seleccionadas
    selectedInvoices: z.array(z.string()).optional(),

    // {tPending("paymentPlanConfig")}
    totalAmount: z.number().optional(),
    initialPayment: z
      .number()
      .min(0, "El pago contado debe ser mayor o igual a 0")
      .optional(),
    numberOfInstallments: z.number().optional(),
    annualInterestRate: z
      .number()
      .min(0, "La tasa de interés debe ser mayor o igual a 0")
      .optional(),
    paymentMethod: z.string().optional(),
    paymentFrequency: z.string().optional(),
    startDate: z.date().optional(),
    comments: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "modify") {
        return (
          data.totalAmount !== undefined &&
          data.totalAmount > 0 &&
          data.numberOfInstallments !== undefined &&
          data.numberOfInstallments > 0 &&
          data.annualInterestRate !== undefined &&
          data.annualInterestRate >= 0 &&
          data.paymentMethod &&
          data.paymentMethod.length > 0 &&
          data.paymentFrequency &&
          data.paymentFrequency.length > 0 &&
          data.startDate !== undefined
        );
      }
      return true;
    },
    {
      message:
        "Todos los campos del plan de pago son requeridos cuando se modifica",
      path: ["type"],
    }
  );

type PaymentPlanForm = z.infer<typeof paymentPlanSchema>;

const SheetModal = ({ detail }: { detail: PaymentPlanResponse }) => {
  const { data: session } = useSession();
  const { profile } = useProfileContext();
  const t = useTranslations("paymentPlans.sheetModal");
  const tPending = useTranslations("paymentPlans.pendingModal");
  const tForm = useTranslations("paymentPlans.approvalForm.formModify");
  const [debtorExpanded, setDebtorExpanded] = useState(false);
  const [paymentPlanExpanded, setPaymentPlanExpanded] = useState(true);
  const [objectedExpanded, setObjectedExpanded] = useState(
    detail?.status === "OBJECTED" || false
  );

  const form = useForm<PaymentPlanForm>({
    resolver: zodResolver(paymentPlanSchema) as any,
    mode: "onChange",
    defaultValues: {
      debtorId: detail?.debtorId || "",
      selectedInvoices: detail?.invoiceIds || [],
      totalAmount: Math.round(detail?.totalPlanAmount || 0),
      initialPayment: Math.round(detail?.initialPayment || 0),
      numberOfInstallments: detail?.numberOfInstallments || 1,
      annualInterestRate: Math.round(detail?.annualInterestRate || 0),
      paymentMethod: detail?.paymentMethod || "",
      paymentFrequency: detail?.paymentFrequency || "",
      startDate: detail?.planStartDate
        ? new Date(detail.planStartDate)
        : undefined,
      comments: detail?.debtConcept || "",
      reason: "",
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

  //   const updateConfig = (field: keyof PaymentPlanConfig, value: any) => {
  //     const newConfig = { ...config, [field]: value };
  //     setConfig(newConfig);
  //   };

  const formatCurrency = (value: string) => {
    // Remover caracteres no numéricos excepto puntos y comas
    const numericValue = value.replace(/[^\d,.-]/g, "");
    return numericValue;
  };

  const parseFormattedNumber = (value: string) => {
    // Manejar el formato chileno: remover puntos (separadores de miles) y convertir comas a puntos decimales
    const cleanValue = value.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(cleanValue) || 0;
  };

  const formatNumberWithThousands = (value: number) => {
    return new Intl.NumberFormat("es-CL").format(Math.round(value));
  };

  const pendingInstallments = useMemo(() => {
    return getPendingInstallments(
      detail.paymentStartDate,
      detail.paymentEndDate,
      detail.numberOfInstallments,
      detail.paymentFrequency
    );
  }, [
    detail.paymentStartDate,
    detail.paymentEndDate,
    detail.numberOfInstallments,
    detail.paymentFrequency,
  ]);

  const calculatePaymentEndDate = (
    startDate: Date,
    numberOfInstallments: number,
    frequency: string
  ) => {
    const endDate = new Date(startDate);

    switch (frequency) {
      case "weekly":
        endDate.setDate(endDate.getDate() + numberOfInstallments * 7);
        break;
      case "biweekly":
        endDate.setDate(endDate.getDate() + numberOfInstallments * 15);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + numberOfInstallments);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + numberOfInstallments * 3);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + numberOfInstallments);
    }

    return endDate;
  };

  const paymentEndDate = calculatePaymentEndDate(
    form.watch("startDate"),
    form.watch("numberOfInstallments"),
    form.watch("paymentFrequency")
  );
  const onSubmit = async (data: PaymentPlanForm) => {
    try {
      if (data.type === "modify") {
        // Capturar datos del formulario de modificación
        const modificationData: UpdatePaymentPlanRequest = {
          total_plan_amount: Math.round(metrics.totalToPay),
          installment_amount: Math.round(metrics.installmentAmount),
          number_of_installments: data.numberOfInstallments,
          annual_interest_rate: data.annualInterestRate,
          payment_method: data.paymentMethod,
          payment_frequency: data.paymentFrequency as PaymentFrequency,
          start_date: data.startDate?.toISOString().split("T")[0],
          payment_start_date: data.startDate?.toISOString().split("T")[0],
          payment_end_date: paymentEndDate.toISOString().split("T")[0],
          comments: data.comments,
          objected_comment: data.reason,
          initial_payment: data.initialPayment,
          status: "OBJECTED",
        };
        debugger;

        const response = await updatePaymentPlan(
          session.token,
          profile.client_id,
          detail.id,
          modificationData
        );

        console.log("Datos de modificación capturados:", response);

        // Aquí implementarías la lógica para enviar los datos modificados
        // await modifyPaymentPlan(detail.requestId, modificationData);
      } else {
        // Para approve/reject solo enviamos tipo y razón
        const approvalData = {
          type: data.type,
          reason: data.reason,
        };
        if (data.type === "approve") {
          const responseApprove = await approvePaymentPlan(
            session.token,
            profile.client_id,
            detail.id,
            {
              approval_comment: data.reason,
            }
          );

          if (responseApprove.success) {
            toast.success(t("approveSuccess"));
          } else {
            toast.error(t("approveError"));
          }
        }
        if (data.type === "reject") {
          const responseReject = await rejectPaymentPlan(
            session.token,
            profile.client_id,
            detail.id,
            {
              rejection_comment: data.reason,
            }
          );

          if (responseReject.success) {
            toast.success(t("rejectSuccess"));
          } else {
            toast.error(t("rejectError"));
          }
        }

        // Aquí implementarías la lógica para aprobar/rechazar
        // await processPaymentPlanDecision(detail.requestId, approvalData);
      }

      // Resetear formulario después del éxito
      form.reset();
    } catch (error) {
      console.error("Error al procesar plan de pago:", error);
    } finally {
      // TODO : ELIMINAR ESTO
      window.location.reload();
    }
  };

  const getFrequencyName = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return t("frequencyWeekly");
      case "monthly":
        return t("frequencyMonthly");
      case "quarterly":
        return t("frequencyQuarterly");
      case "semiannual":
        return t("frequencySemiannual");
      default:
        return t("frequencyMonthly");
    }
  };

  const getFrequencyFactor = (frequency: string) => {
    switch (frequency) {
      case "weekly":
        return 52; // 52 semanas por año
      case "monthly":
        return 12; // 12 meses por año
      case "quarterly":
        return 4; // 4 trimestres por año
      case "semiannual":
        return 2; // 2 semestres por año
      default:
        return 12; // Por defecto mensual
    }
  };

  const calculateFinancialMetrics = () => {
    // Validación de datos básicos
    if (!detail) {
      return {
        totalInvoices: 0,
        initialPayment: 0,
        principalAmount: 0,
        numberOfInstallments: 0,
        installmentAmount: 0,
        totalToPay: 0,
        totalInterest: 0,
        ctc: 0,
        effectiveRate: 0,
        paymentFrequency: "monthly",
        frequencyName: "mensual",
      };
    }

    // 1. Valores base del financiamiento
    const totalInvoices = detail.originalInvoices.reduce(
      (sum, invoice) => sum + parseFloat(invoice.amount),
      0
    );
    const initialPayment = form.watch("initialPayment") || 0;
    const principalAmount = totalInvoices - initialPayment; // Capital a financiar

    // 2. Parámetros del préstamo
    const numberOfInstallments = form.watch("numberOfInstallments") || 1;
    const annualInterestRate = form.watch("annualInterestRate") || 0;
    const paymentFrequency = form.watch("paymentFrequency") || "monthly";
    const frequencyName = getFrequencyName(paymentFrequency);

    // 3. Cálculo de tasas
    const frequencyFactor = getFrequencyFactor(paymentFrequency);
    const nominalPeriodRate = annualInterestRate / 100 / frequencyFactor; // Tasa nominal por período

    // 4. Cálculo de cuota usando fórmula PMT (Payment)
    let installmentAmount = 0;

    if (principalAmount <= 0) {
      // No hay nada que financiar
      installmentAmount = 0;
    } else if (nominalPeriodRate === 0) {
      // Sin intereses (tasa 0%)
      installmentAmount = principalAmount / numberOfInstallments;
    } else {
      // Con intereses - Fórmula PMT estándar bancaria
      const ratePower = Math.pow(1 + nominalPeriodRate, numberOfInstallments);
      installmentAmount =
        (principalAmount * (nominalPeriodRate * ratePower)) / (ratePower - 1);
    }

    // 5. Cálculos derivados
    const totalInstallments = installmentAmount * numberOfInstallments;
    const totalToPay = totalInstallments; // Solo las cuotas, el pie ya está pagado
    const totalInterest = totalInstallments - principalAmount; // Intereses totales pagados
    const ctc = totalInterest; // Costo Total del Crédito = solo los intereses

    // 6. Tasa efectiva anual (TEA)
    let effectiveRate = 0;
    if (nominalPeriodRate > 0) {
      effectiveRate =
        (Math.pow(1 + nominalPeriodRate, frequencyFactor) - 1) * 100;
    }

    return {
      totalInvoices,
      initialPayment,
      principalAmount,
      numberOfInstallments,
      installmentAmount,
      totalToPay,
      totalInterest,
      ctc,
      effectiveRate,
      paymentFrequency,
      frequencyName,
      // Métricas adicionales
      loanToValue:
        totalInvoices > 0 ? (principalAmount / totalInvoices) * 100 : 0, // LTV%
      initialPaymentRatio:
        totalInvoices > 0 ? (initialPayment / totalInvoices) * 100 : 0, // % pie
    };
  };
  const metrics = calculateFinancialMetrics();

  const formatPercentage = (value: number, decimals: number = 2) => {
    return `${value.toFixed(decimals)}%`;
  };

  const typeSelected = form.watch("type");
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[90%] rounded-l-xl p-0 m-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{t("detailTitle")}</SheetTitle>

          <SheetDescription>
            <span>{t("requestNumber", { id: detail?.requestId })}</span>
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <div className="flex items-center justify-between h-full">
            <div className="bg-white w-3/4 p-5 h-full rounded-l-xl flex flex-col">
              <span className="font-bold">{t("detailLabel")}</span>

              <div className="flex items-center gap-2 justify-between w-full mb-4">
                <span className="text-sm font-semibold">
                  {t("requestNumberLabel", { id: detail?.requestId })}
                </span>

                {detail?.status === "APPROVED" && (
                  <span className="text-xs font-semibold border border-green-600 px-4 py-1 text-green-600 rounded-full bg-green-50">
                    {t("approved")}
                  </span>
                )}
                {detail?.status === "PENDING" && (
                  <span className="text-xs font-semibold border border-blue-600 px-4 py-1 text-blue-600 rounded-full bg-blue-50">
                    {t("inReview")}
                  </span>
                )}
                {detail?.status === "REJECTED" && (
                  <span className="text-xs font-semibold border border-red-600 px-4 py-1 text-red-600 rounded-full bg-red-50">
                    {t("denied")}
                  </span>
                )}
                {detail?.status === "OBJECTED" && (
                  <span className="text-xs font-semibold border border-purple-600 px-4 py-1 text-purple-600 rounded-full bg-purple-50">
                    {t("withObservations")}
                  </span>
                )}
              </div>

              <ScrollArea className="h-[calc(100vh-50px)] pr-5 mb-20 pb-10">
                <CardUser
                  detail={detail}
                  setDebtorExpanded={setDebtorExpanded}
                  debtorExpanded={debtorExpanded}
                />

                <Card className="mt-5">
                  <CardHeader
                    className="cursor-pointer"
                    onClick={() => setPaymentPlanExpanded(!paymentPlanExpanded)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100/50 rounded-full flex items-center justify-center">
                          <Calculator className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">
                          {tPending("paymentPlanConfig")}
                        </CardTitle>
                      </div>
                      {paymentPlanExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>

                  {paymentPlanExpanded && (
                    <>
                      <CardContent className="space-y-6">
                        {typeSelected === "modify" ? (
                          <div className="flex gap-4 items-start justify-between">
                            <div className="grid grid-cols-2 gap-4 mt-5">
                              {/* Colocación total */}
                              <FormField
                                control={control}
                                name="totalAmount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("totalAmountLabel")}{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={tForm("calculatedAutomatically")}
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

                              {/* Pago contado */}
                              <FormField
                                control={control}
                                name="initialPayment"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{tForm("downPaymentLabel")}</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder={tForm("enterAmount")}
                                        value={
                                          field.value
                                            ? formatNumberWithThousands(
                                                field.value
                                              )
                                            : ""
                                        }
                                        onChange={(e) => {
                                          const value = formatCurrency(
                                            e.target.value
                                          );
                                          field.onChange(
                                            parseFormattedNumber(value)
                                          );
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Número de cuotas */}
                              <FormField
                                control={control}
                                name="numberOfInstallments"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("installmentsLabel")}{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        max="36"
                                        placeholder={tForm("installmentsLabel")}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          if (
                                            value === "" ||
                                            /^\d+$/.test(value)
                                          ) {
                                            field.onChange(
                                              parseInt(value) || 0
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Tasa de interés anual */}
                              <FormField
                                control={control}
                                name="annualInterestRate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("interestRateLabel")}{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        placeholder={tForm("interestRatePlaceholder")}
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Permitir números decimales
                                          if (
                                            value === "" ||
                                            /^\d*\.?\d*$/.test(value)
                                          ) {
                                            field.onChange(
                                              parseFloat(value) || 0
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Forma de pago */}
                              <FormField
                                control={control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("paymentMethodLabel")}{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder={tForm("selectPlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {DEBTOR_PAYMENT_METHODS.map((item) => (
                                          <SelectItem
                                            key={item.value}
                                            value={item.value}
                                          >
                                            {item.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Frecuencia de pago */}
                              <FormField
                                control={control}
                                name="paymentFrequency"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("paymentFrequencyLabel")}{" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder={tForm("selectPlaceholder")} />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {PAYMENT_FREQUENCY.map((item) => (
                                          <SelectItem
                                            key={item.code}
                                            value={item.code}
                                          >
                                            {item.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {/* Inicio de pago */}
                              <FormField
                                control={control}
                                name="startDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {tForm("startDateLabel")}{" "}
                                      <span className="text-red-500">*</span>
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
                                              ? format(
                                                  field.value,
                                                  "dd-MM-yyyy",
                                                  {
                                                    locale: es,
                                                  }
                                                )
                                              : tForm("datePlaceholder")}
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          locale={es}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Comentario */}
                              <div className="col-span-2">
                                <FormField
                                  control={control}
                                  name="comments"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{tForm("commentLabel")}</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder={tForm("commentPlaceholder")}
                                          {...field}
                                          rows={4}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            <Card className="bg-blue-50 border-blue-200 w-1/2">
                              <CardHeader>
                                <div className="flex items-center gap-3">
                                  <DollarSign className="h-5 w-5 text-blue-600" />
                                  <CardTitle className="text-lg">
                                    {t("financialSummary")}
                                  </CardTitle>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {/* Cálculos Financieros */}
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 pl-5">
                                      Colocación total:
                                    </span>
                                    <span className="text-sm font-semibold pr-5">
                                      {formatNumber(detail.totalDebt)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 pl-5">
                                      Pago contado (
                                      {formatPercentage(
                                        metrics.initialPaymentRatio,
                                        1
                                      )}
                                      ):
                                    </span>
                                    <span className="text-sm font-semibold pr-5">
                                      {formatNumber(metrics.initialPayment)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 pl-5">
                                      Capital a financiar:
                                    </span>
                                    <span className="text-sm font-semibold pr-5">
                                      {formatNumber(metrics.principalAmount)}
                                    </span>
                                  </div>

                                  <Separator color="bg-blue-600" />

                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 pl-5">
                                      Cuota {metrics.frequencyName}:
                                    </span>
                                    <span className="text-lg font-bold pr-5">
                                      {formatNumber(metrics.installmentAmount)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600 pl-5">
                                      Total intereses:
                                    </span>
                                    <span className="text-sm font-semibold pr-5">
                                      {formatNumber(metrics.totalInterest)}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center bg-blue-100 py-2 px-5 rounded-md">
                                    <span className="text-sm font-medium text-gray-600">
                                      Total a pagar:
                                    </span>
                                    <span className="text-lg font-bold">
                                      {formatNumber(metrics.totalToPay)}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ) : (
                          <>
                            <div className="bg-blue-100/30 p-4 rounded-lg grid grid-cols-3 items-center">
                              <div className="flex flex-col gap-0">
                                <span className="text-sm text-black">
                                  {tPending("totalPlacement")}
                                </span>
                                <span className=" text-blue-700 text-2xl font-bold">
                                  {formatNumber(
                                    Math.round(detail.totalDebt as number)
                                  )}
                                </span>
                              </div>
                              <div className="flex flex-col gap-0">
                                <span className="text-sm text-black">
                                  {tPending("cashPayment")}
                                </span>
                                <span className=" text-blue-700 text-2xl font-bold">
                                  {formatNumber(
                                    Math.round(detail.initialPayment)
                                  )}
                                </span>
                              </div>
                              <div className="flex flex-col gap-0">
                                <span className="text-xs text-black font-bold">
                                  {tPending("upcomingDueDates")}
                                </span>
                                <div className="text-sm text-black space-y-1">
                                  {pendingInstallments
                                    .slice(0, 4)
                                    .map((installment, index) => (
                                      <div key={index} className="text-xs">
                                        {installment}
                                      </div>
                                    ))}
                                  {pendingInstallments.length > 4 && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                                          {tPending("moreInstallments", { count: pendingInstallments.length - 4 })}
                                        </div>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-md">
                                        <DialogHeader>
                                          <DialogTitle>
                                            {tPending("allPendingInstallments")}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="max-h-[350px] overflow-y-auto space-y-2">
                                          {pendingInstallments.map(
                                            (installment, index) => (
                                              <div
                                                key={index}
                                                className="text-xs text-gray-700 p-2 bg-gray-50 rounded"
                                              >
                                                {installment}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                  {pendingInstallments.length === 0 && (
                                    <div className="text-xs text-green-600">
                                      {tPending("noPendingInstallments")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <IconDescription
                                icon={
                                  <Coins className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("installmentCount")}
                                value={
                                  detail.numberOfInstallments as unknown as string
                                }
                              />
                              <IconDescription
                                icon={
                                  <Coins className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("installmentValue")}
                                value={formatNumber(
                                  Math.round(
                                    detail.installmentAmount as unknown as number
                                  )
                                )}
                              />
                              <IconDescription
                                icon={
                                  <ChartBar className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("annualInterestRate")}
                                value={
                                  detail.annualInterestRate as unknown as string
                                }
                              />
                              <IconDescription
                                icon={
                                  <DollarSign className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("paymentMethod")}
                                value={
                                  DEBTOR_PAYMENT_METHODS.find(
                                    (x) => x.value === detail.paymentMethod
                                  )?.label
                                }
                              />

                              <IconDescription
                                icon={
                                  <CalendarIcon className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("paymentStart")}
                                value={
                                  detail.planStartDate
                                    ? format(
                                        detail.planStartDate,
                                        "dd-MM-yyyy",
                                        {
                                          locale: es,
                                        }
                                      )
                                    : "-"
                                }
                              />
                              <IconDescription
                                icon={
                                  <CalendarCheck className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("paymentEnd")}
                                value={
                                  detail.paymentEndDate
                                    ? format(
                                        detail.paymentEndDate,
                                        "dd-MM-yyyy",
                                        {
                                          locale: es,
                                        }
                                      )
                                    : "-"
                                }
                              />
                              <IconDescription
                                icon={
                                  <CalendarClock className="w-6 h-6 text-gray-400" />
                                }
                                description={tPending("paymentFrequency")}
                                value={
                                  PAYMENT_FREQUENCY.find(
                                    (x) => x.code === detail.paymentFrequency
                                  )?.label
                                }
                              />
                            </div>
                            {detail.debtConcept && (
                              <div className="flex justify-start items-center gap-2 bg-amber-100 border border-amber-300 p-4 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-amber-300 shrink-0" />
                                <span className="text-sm text-gray-500 flex flex-col gap-0">
                                  <span className="text-black text-xs">
                                    {tPending("commentLabel")}
                                  </span>
                                  <span className="text-md text-gray-500">
                                    {detail.debtConcept}
                                  </span>
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </>
                  )}
                </Card>
              </ScrollArea>
            </div>
            <div className="bg-blue-100/10 w-1/4 p-5 h-screen">
              <h3 className="text-md font-medium">{t("paymentPlanAuthorization")}</h3>
              <Image
                src={
                  detail.status === "PENDING"
                    ? "/img/approval.svg"
                    : "/img/check-status.svg"
                }
                alt="approval"
                width={100}
                height={100}
                className="w-full p-5"
              />

              {detail?.status === "APPROVED" && (
                <div className="border border-green-300 bg-green-100 p-3 rounded-lg flex gap-2 items-start justify-start">
                  <Info className="w-4 h-4 text-green-600 shrink-0" />{" "}
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black font-bold">
                      {t("planApproved")}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {detail?.approvalComment && detail?.approvalComment}
                    </span>
                  </div>
                </div>
              )}

              {detail?.status === "REJECTED" && (
                <div className="border border-red-300 bg-red-100 p-3 rounded-lg flex gap-2 items-start justify-start">
                  <Info className="w-4 h-4 text-red-600 shrink-0" />{" "}
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black font-bold">
                      {t("planDenied")}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {detail?.rejectionComment && detail?.rejectionComment}
                    </span>
                  </div>
                </div>
              )}

              {detail.status === "PENDING" && (
                <ScrollArea className="h-[450px] pr-2 mb-20 pb-10 overflow-y-auto">
                  <div className="max-h-[450px] pr-5 mb-20 pb-10 overflow-y-auto">
                    <div className="w-full space-y-5">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>
                              {t("selectOption")} <Required />
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col"
                              >
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <RadioGroupItem
                                      value="approve"
                                      className="bg-white"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("optionApprove")}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <RadioGroupItem
                                      value="reject"
                                      className="bg-white"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("optionDeny")}
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <RadioGroupItem
                                      value="modify"
                                      className="bg-white"
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {t("optionModify")}
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        {typeSelected === "modify" && (
                          <div className="border border-blue-300 p-3 rounded-lg flex gap-2 items-start justify-start">
                            <Info className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="flex flex-col gap-0">
                              <span className="text-sm text-black font-bold">
                                {t("needChanges")}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t("needChangesDescription")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("commentLabel")}</FormLabel>
                            <FormControl className="w-full">
                              <Textarea
                                {...field}
                                placeholder={t("commentPlaceholder")}
                                className="w-full bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        onClick={form.handleSubmit(onSubmit)}
                      >
                        {t("sendResponseButton")}
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default SheetModal;
