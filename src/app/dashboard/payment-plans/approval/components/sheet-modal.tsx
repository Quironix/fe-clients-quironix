import {
  DEBTOR_PAYMENT_METHODS,
  PAYMENT_FREQUENCY,
} from "@/app/dashboard/data";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import CardUser from "../../components/card-user";
import { approvePaymentPlan } from "../../services";
import { PaymentPlanResponse } from "../../types";

const paymentPlanSchema = z
  .object({
    type: z.enum(["approve", "reject", "modify"], {
      required_error: "You need to select a notification type.",
    }),
    // Información del deudor
    debtorId: z.string().optional(),

    // Facturas seleccionadas
    selectedInvoices: z.array(z.string()).optional(),

    // Configuración del plan de pago
    totalAmount: z.number().optional(),
    downPayment: z
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
  const [debtorExpanded, setDebtorExpanded] = useState(false);
  const [paymentPlanExpanded, setPaymentPlanExpanded] = useState(true);
  const [objectedExpanded, setObjectedExpanded] = useState(
    detail?.status === "OBJECTED" || false
  );

  const form = useForm<PaymentPlanForm>({
    resolver: zodResolver(paymentPlanSchema),
    mode: "onChange",
    defaultValues: {
      debtorId: detail?.debtorId || "",
      selectedInvoices: detail?.invoiceIds || [],
      totalAmount: detail?.totalPlanAmount || 0,
      downPayment: detail?.initialPayment || 0,
      numberOfInstallments: detail?.numberOfInstallments || 1,
      annualInterestRate: detail?.annualInterestRate || 0,
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

  const formatNumberWithThousands = (value: number) => {
    return new Intl.NumberFormat("es-CL").format(value);
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

  const onSubmit = async (data: PaymentPlanForm) => {
    try {
      if (data.type === "modify") {
        // Capturar datos del formulario de modificación
        const modificationData = {
          type: data.type,
          totalAmount: data.totalAmount,
          downPayment: data.downPayment,
          numberOfInstallments: data.numberOfInstallments,
          annualInterestRate: data.annualInterestRate,
          paymentMethod: data.paymentMethod,
          paymentFrequency: data.paymentFrequency,
          startDate: data.startDate,
          comments: data.comments,
          reason: data.reason,
        };
        console.log("Datos de modificación capturados:", modificationData);

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
              comments: data.reason,
            }
          );

          if (responseApprove.success) {
            toast.success("Plan de pago aprobado correctamente");
          } else {
            toast.error("Error al aprobar el plan de pago");
          }
        }
        console.log("Datos de aprobación/rechazo:", approvalData);

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
          <SheetTitle>Detalles del plan de pago 2</SheetTitle>

          <SheetDescription>
            <span>Solicitud Nº{detail?.requestId}</span>
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <div className="flex items-center justify-between h-full">
            <div className="bg-white w-3/4 p-5 h-full rounded-l-xl flex flex-col">
              <span className="font-bold">Detalle del plan de pago</span>

              <div className="flex items-center gap-2 justify-between w-full mb-4">
                <span className="text-sm font-semibold">
                  Solicitud Nº {detail?.requestId}
                </span>

                {detail?.status === "APPROVED" && (
                  <span className="text-xs font-semibold border border-green-600 px-4 py-1 text-green-600 rounded-full bg-green-50">
                    Aprobado
                  </span>
                )}
                {detail?.status === "PENDING" && (
                  <span className="text-xs font-semibold border border-blue-600 px-4 py-1 text-blue-600 rounded-full bg-blue-50">
                    En revisión
                  </span>
                )}
                {detail?.status === "REJECTED" && (
                  <span className="text-xs font-semibold border border-red-600 px-4 py-1 text-red-600 rounded-full bg-red-50">
                    Denegado
                  </span>
                )}
                {detail?.status === "OBJECTED" && (
                  <span className="text-xs font-semibold border border-purple-600 px-4 py-1 text-purple-600 rounded-full bg-purple-50">
                    Con observaciones
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
                          Configuración del plan de pago
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
                    <CardContent className="space-y-6">
                      {typeSelected === "modify" ? (
                        <div>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Colocación total */}
                            <FormField
                              control={control}
                              name="totalAmount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Colocación total{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Calculado automáticamente"
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
                              name="downPayment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Pago contado ($)</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ingresa un monto"
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
                                        field.onChange(parseFloat(value) || 0);
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
                                    N° de cuotas{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value.toString()}
                                    onValueChange={(value) =>
                                      field.onChange(parseInt(value))
                                    }
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {Array.from(
                                        { length: 36 },
                                        (_, i) => i + 1
                                      ).map((num) => (
                                        <SelectItem
                                          key={num}
                                          value={num.toString()}
                                        >
                                          {num} cuota{num > 1 ? "s" : ""}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
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
                                    Tasa de interés anual (%){" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      placeholder="Ej: 12.5"
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
                                    Forma de pago{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona" />
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
                                    Frecuencia de pago{" "}
                                    <span className="text-red-500">*</span>
                                  </FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona" />
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
                          </div>

                          {/* Inicio de pago */}
                          <FormField
                            control={control}
                            name="startDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Inicio de pago{" "}
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
                                          ? format(field.value, "dd/MM/yyyy", {
                                              locale: es,
                                            })
                                          : "DD/MM/AAAA"}
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
                          <FormField
                            control={control}
                            name="comments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Comentario</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Completa"
                                    {...field}
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="bg-blue-100/30 p-4 rounded-lg grid grid-cols-3 items-center">
                            <div className="flex flex-col gap-0">
                              <span className="text-sm text-black">
                                Colocación total
                              </span>
                              <span className=" text-blue-700 text-2xl font-bold">
                                {formatNumber(detail.totalPlanAmount)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0">
                              <span className="text-sm text-black">
                                Pago contado
                              </span>
                              <span className=" text-blue-700 text-2xl font-bold">
                                {formatNumber(detail.initialPayment)}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0">
                              <span className="text-xs text-black font-bold">
                                Próximos vencimientos
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
                                  <div className="text-xs text-gray-500">
                                    +{pendingInstallments.length - 4} cuotas
                                    más...
                                  </div>
                                )}
                                {pendingInstallments.length === 0 && (
                                  <div className="text-xs text-green-600">
                                    No hay cuotas pendientes
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <IconDescription
                              icon={<Coins className="w-6 h-6 text-gray-400" />}
                              description="Nº de cuotas"
                              value={
                                detail.numberOfInstallments as unknown as string
                              }
                            />
                            <IconDescription
                              icon={
                                <ChartBar className="w-6 h-6 text-gray-400" />
                              }
                              description="Tasa de interés anual (%)"
                              value={
                                detail.annualInterestRate as unknown as string
                              }
                            />
                            <IconDescription
                              icon={
                                <DollarSign className="w-6 h-6 text-gray-400" />
                              }
                              description="Forma de pago"
                              value={
                                DEBTOR_PAYMENT_METHODS.find(
                                  (x) => x.value === detail.paymentMethod
                                )?.label
                              }
                            />
                            <IconDescription
                              icon={
                                <CalendarClock className="w-6 h-6 text-gray-400" />
                              }
                              description="Frecuencia de pago"
                              value={
                                PAYMENT_FREQUENCY.find(
                                  (x) => x.code === detail.paymentFrequency
                                )?.label
                              }
                            />
                            <IconDescription
                              icon={
                                <CalendarIcon className="w-6 h-6 text-gray-400" />
                              }
                              description="Inicio de pago"
                              value={detail.planStartDate as unknown as string}
                            />
                            <IconDescription
                              icon={
                                <CalendarCheck className="w-6 h-6 text-gray-400" />
                              }
                              description="Término de pago"
                              value={detail.paymentEndDate as unknown as string}
                            />
                          </div>
                          {detail.debtConcept && (
                            <div className="flex justify-start items-center gap-2 bg-amber-100 border border-amber-300 p-4 rounded-lg">
                              <MessageSquare className="w-6 h-6 text-amber-300 flex-shrink-0" />
                              <span className="text-sm text-gray-500 flex flex-col gap-0">
                                <span className="text-black text-xs">
                                  Comentario
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
                  )}
                </Card>
              </ScrollArea>
            </div>
            <div className="bg-blue-100/10 w-1/4 p-5 h-screen">
              <h3 className="text-md font-medium">Autorización plan de pago</h3>
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
                  <Info className="w-4 h-4 text-green-600 flex-shrink-0" />{" "}
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black font-bold">
                      Plan de pago aprobado
                    </span>
                    <span className="text-xs text-gray-500">
                      {detail.debtConcept}
                    </span>
                  </div>
                </div>
              )}
              {detail?.status === "REJECTED" && (
                <div className="border border-red-300 bg-red-100 p-3 rounded-lg flex gap-2 items-start justify-start">
                  <Info className="w-4 h-4 text-red-600 flex-shrink-0" />{" "}
                  <div className="flex flex-col gap-0">
                    <span className="text-sm text-black font-bold">
                      Plan de pago denegado
                    </span>
                    <span className="text-xs text-gray-500">
                      {detail.debtConcept}
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
                              Selecciona una opción <Required />
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
                                    Aprobar
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
                                    Denegar
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
                                    Modificar condiciones
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
                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="flex flex-col gap-0">
                              <span className="text-sm text-black font-bold">
                                ¿Necesitas hacer cambios?
                              </span>
                              <span className="text-xs text-gray-500">
                                Ajusta el plan de pago a tus términos. Cuando
                                termines, simplemente haz clic en{" "}
                                <span className="font-black">
                                  “Enviar respuesta”
                                </span>
                                .
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
                            <FormLabel>Comentario</FormLabel>
                            <FormControl className="w-full">
                              <Textarea
                                {...field}
                                placeholder="Escribe un comentario..."
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
                        Enviar respuesta
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
