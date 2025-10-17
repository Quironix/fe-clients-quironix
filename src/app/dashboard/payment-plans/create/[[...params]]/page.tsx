"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import DebtorsSelectFormItem from "@/app/dashboard/components/debtors-select-form-item";
import {
  DEBTOR_PAYMENT_METHODS,
  PAYMENT_FREQUENCY,
} from "@/app/dashboard/data";
import IconDescription from "@/app/dashboard/payment-netting/components/icon-description";
import Stepper from "@/components/Stepper";
import { Step } from "@/components/Stepper/types";
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
import Language from "@/components/ui/language";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building2,
  Calculator,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Coins,
  IdCard,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Header from "../../../components/header";
import { Main } from "../../../components/main";
import TitleSection from "../../../components/title-section";
import { useDebtorsStore } from "../../../debtors/store";
import DebtorInvoicesTable from "../../components/debtor-invoices-table";
import FinancialSummary from "../../components/financial-summary";
import { usePaymentPlansStore } from "../../store";

// Esquema de validación para el formulario de plan de pago
const paymentPlanSchema = z.object({
  // Información del deudor
  debtorId: z.string().min(1, "El deudor es requerido"),

  // Facturas seleccionadas
  selectedInvoices: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos una factura"),

  // Configuración del plan de pago
  totalAmount: z.number().min(1, "El monto total es requerido"),
  downPayment: z.number().min(0, "El pago contado debe ser mayor o igual a 0"),
  numberOfInstallments: z.number().min(1, "El número de cuotas es requerido"),
  annualInterestRate: z
    .number()
    .min(0, "La tasa de interés debe ser mayor o igual a 0"),
  paymentMethod: z.string().min(1, "La forma de pago es requerida"),
  paymentFrequency: z.string().min(1, "La frecuencia de pago es requerida"),
  startDate: z.date({ required_error: "La fecha de inicio es requerida" }),
  comments: z.string().optional(),
});

type PaymentPlanForm = z.infer<typeof paymentPlanSchema>;

const steps: Step[] = [
  { id: 1, label: "Información del deudor", completed: false },
  { id: 2, label: "Configuración del plan", completed: false },
  { id: 3, label: "Resumen y confirmación", completed: false },
];

const CreatePaymentPlanPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsState, setStepsState] = useState<Step[]>(steps);
  const [isDebtorInfoExpanded, setIsDebtorInfoExpanded] = useState(true);
  const [isPaymentConfigExpanded, setIsPaymentConfigExpanded] = useState(false);

  const { data: session } = useSession();
  const { profile } = useProfileContext();

  // Usar el store para las facturas seleccionadas
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

  // Configuración del formulario con react-hook-form
  const form = useForm<PaymentPlanForm>({
    resolver: zodResolver(paymentPlanSchema),
    mode: "onChange",
    defaultValues: {
      debtorId: "",
      selectedInvoices: [],
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

  // Observar cambios en el formulario
  const watchedDebtorId = watch("debtorId");
  const watchedTotalAmount = watch("totalAmount");
  const watchedSelectedInvoices = watch("selectedInvoices");

  // Obtener datos completos del deudor seleccionado
  useEffect(() => {
    if (watchedDebtorId && session?.token && profile?.client?.id) {
      fetchDebtorById(session.token, profile.client.id, watchedDebtorId);
    }
  }, [watchedDebtorId, session?.token, profile?.client?.id, fetchDebtorById]);

  // Actualizar el estado de los pasos cuando se seleccione un deudor
  useEffect(() => {
    if (dataDebtor?.id) {
      const newSteps = [...stepsState];
      newSteps[0].completed = true;
      setStepsState(newSteps);
      setCurrentStep(1);
      setIsPaymentConfigExpanded(true);
    }
  }, [dataDebtor?.id]);

  // Actualizar facturas seleccionadas cuando cambien
  useEffect(() => {
    if (selectedInvoices.length > 0) {
      setValue(
        "selectedInvoices",
        selectedInvoices.map((inv) => inv.id)
      );

      // Marcar el step 2 como completado cuando hay facturas seleccionadas
      setStepsState((prevSteps) => {
        const newSteps = [...prevSteps];
        newSteps[1].completed = true;
        return newSteps;
      });

      // Avanzar automáticamente al paso de configuración si estamos en el paso 2
      if (currentStep === 1) {
        setCurrentStep(2);
        setIsPaymentConfigExpanded(true);
      }
    } else {
      // Desmarcar el step 2 si no hay facturas seleccionadas
      setStepsState((prevSteps) => {
        const newSteps = [...prevSteps];
        newSteps[1].completed = false;
        return newSteps;
      });

      // Volver al paso 1 si no hay facturas y estamos en paso posterior
      if (currentStep >= 2) {
        setCurrentStep(1);
        setIsPaymentConfigExpanded(false);
      }
    }
  }, [selectedInvoices, setValue, currentStep]);

  const handleStepChange = (step: number) => {
    // Solo permitir cambiar a pasos ya completados o el siguiente paso
    let canChangeToStep =
      step <= currentStep + 1 &&
      (step === 0 || stepsState[step - 1]?.completed);

    // Para el step 3 (índice 2), verificar que haya facturas seleccionadas
    if (step === 2) {
      canChangeToStep = canChangeToStep && selectedInvoices.length > 0;
    }

    if (canChangeToStep) {
      setCurrentStep(step);

      // Expandir/contraer secciones según el paso
      if (step === 0) {
        setIsDebtorInfoExpanded(true);
        setIsPaymentConfigExpanded(false);
      } else if (step === 1) {
        setIsDebtorInfoExpanded(false);
        setIsPaymentConfigExpanded(true);
      }
    }
  };

  const handleInvoicesSelected = (invoices: any[]) => {
    // Calcular automáticamente cuando cambien las facturas seleccionadas
    const totalAmount = calculateTotalAmount();
    setValue("totalAmount", totalAmount);
  };

  // Actualizar colocación total cuando cambien las facturas seleccionadas
  useEffect(() => {
    const totalAmount = calculateTotalAmount();
    setValue("totalAmount", totalAmount);
  }, [selectedInvoices, setValue]);

  const handleViewDetails = () => {
    // Implementar lógica para mostrar detalles del plan de pago
    console.log("Ver detalles del plan de pago");
  };

  // Función para resetear el formulario y las métricas
  const handleResetForm = () => {
    // Resetear formulario
    form.reset();
    // Limpiar facturas seleccionadas
    clearSelectedInvoices();
    // Resetear estados del stepper
    setCurrentStep(0);
    setStepsState(steps);
    setIsDebtorInfoExpanded(true);
    setIsPaymentConfigExpanded(false);
    clearDataDebtor();
  };

  useEffect(() => {
    return () => {
      handleResetForm();
    };
  }, []);

  // Función para formatear moneda con separador de miles
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    return numericValue;
  };

  const parseFormattedNumber = (value: string) => {
    // Manejar el formato chileno: remover puntos (separadores de miles) y convertir comas a puntos decimales
    const cleanValue = value.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(cleanValue) || 0;
  };

  // Función para formatear números con separador de miles
  const formatNumberWithThousands = (value: number) => {
    return new Intl.NumberFormat("es-CL").format(value);
  };

  // Calcular colocación total basada en facturas seleccionadas
  const calculateTotalAmount = () => {
    return selectedInvoices.reduce((sum, invoice) => {
      const amount =
        typeof invoice.amount === "string"
          ? parseFloat(invoice.amount)
          : invoice.amount;
      return Math.round(sum + (isNaN(amount) ? 0 : amount));
    }, 0);
  };

  // Función para obtener el factor de frecuencia (cuántos períodos por año)
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

  // Función para calcular cuota basada en la frecuencia de pago
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

  // Handler para envío del formulario
  const onSubmit = async (data: PaymentPlanForm) => {
    try {
      // Resetear formulario
      form.reset();
      setCurrentStep(0);
      setStepsState(steps);
      setIsDebtorInfoExpanded(true);
      setIsPaymentConfigExpanded(false);
    } catch (error) {
      console.error("Error al crear plan de pago:", error);
      toast.error("Error al crear el plan de pago");
    }
  };

  return (
    <>
      <Header fixed>
        <Language />
      </Header>
      <Main>
        <TitleSection
          title="Planes de pagos"
          description=""
          icon={<Coins color="white" />}
          subDescription="Planes de pago"
        />

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent>
                <div className="grid grid-cols-12 items-start gap-6 w-full">
                  {/* Columna principal - Stepper y formularios */}
                  <div className="col-span-8 space-y-6">
                    {/* Stepper */}

                    <Stepper
                      steps={stepsState}
                      currentStep={currentStep}
                      onStepChange={handleStepChange}
                    />

                    {/* Información del deudor */}

                    <Card>
                      <CardHeader
                        className="cursor-pointer"
                        onClick={() =>
                          setIsDebtorInfoExpanded(!isDebtorInfoExpanded)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100/50 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <CardTitle className="text-lg">
                              Información del deudor
                            </CardTitle>
                          </div>
                          {isDebtorInfoExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </CardHeader>

                      {isDebtorInfoExpanded && (
                        <CardContent className="space-y-6">
                          <div>
                            <FormField
                              control={control}
                              name="debtorId"
                              render={({ field }) => (
                                <DebtorsSelectFormItem
                                  field={field}
                                  title="Seleccionar deudor"
                                  required
                                />
                              )}
                            />
                          </div>

                          <Separator />

                          <div className="bg-blue-100/30 p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2 text-blue-800">
                              Datos del deudor
                            </h3>
                            {dataDebtor?.id ? (
                              <div className="space-y-5 grid grid-cols-2">
                                <IconDescription
                                  icon={
                                    <IdCard className="w-8 h-8 text-blue-600" />
                                  }
                                  description="RUT"
                                  value={
                                    dataDebtor.dni?.dni ||
                                    dataDebtor.debtor_code
                                  }
                                />
                                <IconDescription
                                  icon={
                                    <Building2 className="w-8 h-8 text-blue-600" />
                                  }
                                  description="Razón social"
                                  value={dataDebtor.name}
                                />
                                <IconDescription
                                  icon={
                                    <User className="w-8 h-8 text-blue-600" />
                                  }
                                  description="Contacto"
                                  value={dataDebtor.contacts[0].name}
                                />

                                <IconDescription
                                  icon={
                                    <Mail className="w-8 h-8 text-blue-600" />
                                  }
                                  description="Email"
                                  value={dataDebtor?.email || "Sin información"}
                                />
                                <IconDescription
                                  icon={
                                    <Phone className="w-8 h-8 text-blue-600" />
                                  }
                                  description="Teléfono"
                                  value={dataDebtor?.phone || "Sin información"}
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                No has seleccionado ningún deudor
                              </p>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>

                    {/* Facturas del deudor */}
                    {currentStep > 0 && (
                      <DebtorInvoicesTable
                        debtorId={dataDebtor?.id}
                        onInvoicesSelected={handleInvoicesSelected}
                      />
                    )}

                    {/* Configuración del plan de pago */}
                    {/* Solo mostrar si hay facturas seleccionadas o si no estamos en el paso 2 */}
                    {(selectedInvoices.length > 0 || currentStep !== 1) && (
                      <Card>
                        <CardHeader
                          className="cursor-pointer"
                          onClick={() =>
                            setIsPaymentConfigExpanded(!isPaymentConfigExpanded)
                          }
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
                            {isPaymentConfigExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>

                        {isPaymentConfigExpanded && (
                          <CardContent className="space-y-6">
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
                                          field.value !== undefined &&
                                          field.value !== null
                                            ? formatNumberWithThousands(
                                                field.value
                                              )
                                            : "0"
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
                                      N° de cuotas{" "}
                                      <span className="text-red-500">*</span>
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
                                      Tasa de interés anual (%){" "}
                                      <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        max={48}
                                        placeholder="Ej: 1"
                                        value={field.value || ""}
                                        onChange={(e) => {
                                          const value = e.target.value;
                                          // Solo permitir números enteros
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
                                            ? format(
                                                field.value,
                                                "dd-MM-yyyy",
                                                {
                                                  locale: es,
                                                }
                                              )
                                            : "DD-MM-AAAA"}
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
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </div>

                  {/* Sidebar derecho - Resumen financiero */}
                  <FinancialSummary
                    selectedDebtor={dataDebtor}
                    selectedInvoices={selectedInvoices.map((invoice) => ({
                      id: invoice.id,
                      amount:
                        typeof invoice.amount === "string"
                          ? parseFloat(invoice.amount) || 0
                          : invoice.amount,
                    }))}
                    paymentConfig={{
                      totalAmount: watchedTotalAmount,
                      downPayment: watch("downPayment"),
                      numberOfInstallments: watch("numberOfInstallments"),
                      annualInterestRate: watch("annualInterestRate"),
                      paymentMethod: watch("paymentMethod"),
                      paymentFrequency: watch("paymentFrequency"),
                      startDate: watch("startDate"),
                      comments: watch("comments"),
                    }}
                    onViewDetails={handleViewDetails}
                    onReset={handleResetForm}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </Main>
    </>
  );
};

export default CreatePaymentPlanPage;
