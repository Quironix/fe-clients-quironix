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

const paymentPlanSchema = z.object({
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

const FormModify = () => {
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
  const watchedTotalAmount = watch("totalAmount");

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
    clearSelectedInvoices();
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
    } catch (error) {
      console.error("Error al crear plan de pago:", error);
      toast.error("Error al crear el plan de pago");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Colocación total */}
      <FormField
        control={control}
        name="totalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Colocación total <span className="text-red-500">*</span>
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

      {/* Número de cuotas */}
      <FormField
        control={control}
        name="numberOfInstallments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              N° de cuotas <span className="text-red-500">*</span>
            </FormLabel>
            <Select
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(parseInt(value))}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
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
              Tasa de interés anual (%) <span className="text-red-500">*</span>
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

      {/* Forma de pago */}
      <FormField
        control={control}
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

      {/* Frecuencia de pago */}
      <FormField
        control={control}
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

      {/* Inicio de pago */}
      <FormField
        control={control}
        name="startDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Inicio de pago <span className="text-red-500">*</span>
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
                      : "DD-MM-AAAA"}
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

      {/* Comentario */}
      <FormField
        control={control}
        name="comments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Comentario</FormLabel>
            <FormControl>
              <Textarea placeholder="Completa" {...field} rows={4} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default FormModify;
