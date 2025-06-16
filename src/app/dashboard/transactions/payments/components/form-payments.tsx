import BankInformationSelectFormItem from "@/app/dashboard/components/bank-information-select-form-item";
import BankListSelectFormItem from "@/app/dashboard/components/bank-list-select-form-item";
import DatePickerFormItem from "@/app/dashboard/components/date-picker-form-item";
import DebtorsSelectFormItem from "@/app/dashboard/components/debtors-select-form-item";
import Loader from "@/app/dashboard/components/loader";
import { DocumentType } from "@/app/dashboard/data";
import TitleStep from "@/app/dashboard/settings/components/title-step";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Required from "@/components/ui/required";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { usePaymentStore } from "../store";

const FormPayments = () => {
  const { profile, session } = useProfileContext();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const {
    payment,
    fetchPaymentById,
    loading,
    createPayment,
    responseSuccess,
    clearPayment,
    updatePayment,
  } = usePaymentStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      if (id) {
        setIsLoadingPayment(true);
        fetchPaymentById(session.token, profile.client.id, id).finally(() => {
          setIsLoadingPayment(false);
        });
      } else {
        clearPayment();
      }
    }
  }, [session?.token, profile?.client?.id, fetchPaymentById, id, clearPayment]);

  const formSchema = z.object({
    id: z.string().optional(),
    debtor_id: z.string().min(1, "El deudor es requerido"),
    bank_movement_id: z.string().optional().nullable(),
    bank_id: z.string().min(1, "El banco es requerido"),
    ingress_type: z.string().min(1, "El tipo de ingreso es requerido"),
    document_type: z.nativeEnum(DocumentType),
    payment_number: z.string().min(1, "El número de documento es requerido"),
    amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
    received_at: z.string().min(1, "La fecha de recepción es requerida"),
    due_at: z.string().optional().nullable(),
    balance: z.number().min(0, "El saldo debe ser mayor o igual a 0"),
    square: z.string().min(1, "La plaza es requerida"),
    bank_received: z.string().min(1, "El banco que recibe es requerido"),
    notes: z.string().optional(),
    deposit_at: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      debtor_id: "",
      bank_movement_id: null,
      bank_id: "",
      ingress_type: "MANUAL",
      document_type: DocumentType.DEPOSIT,
      payment_number: "",
      amount: 0,
      received_at: "",
      due_at: null,
      balance: 0,
      square: "",
      bank_received: "",
      notes: "",
      deposit_at: "",
    },
  });

  useEffect(() => {
    if (payment && Object.keys(payment).length > 0 && id) {
      const formatDate = (date: string | null): string | undefined => {
        if (!date) return undefined;
        try {
          const parsedDate = new Date(date);
          if (isNaN(parsedDate.getTime())) {
            console.warn("Invalid date:", date);
            return undefined;
          }
          return parsedDate.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error formatting date:", date, error);
          return undefined;
        }
      };

      const formData = {
        id: payment?.id || "",
        debtor_id: payment?.debtor_id || "",
        bank_movement_id: payment?.bank_movement_id || null,
        bank_id: payment?.bank_id || "",
        ingress_type: payment?.ingress_type || "MANUAL",
        document_type: payment?.document_type || DocumentType.DEPOSIT,
        payment_number: payment?.payment_number || "",
        amount: Number(payment?.amount) || 0,
        received_at: formatDate(payment?.received_at) || "",
        due_at: formatDate(payment?.due_at),
        balance: Number(payment?.balance) || 0,
        square: payment?.square || "",
        bank_received: payment?.bank_received || "",
        notes: payment?.notes || "",
        deposit_at: formatDate(payment?.deposit_at),
      };

      form.reset(formData);
    } else {
    }
  }, [payment, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsFormLoading(true);
    if (!profile?.client?.id) {
      toast.error("No se encontró el cliente");
      return;
    }

    try {
      let response;
      if (id) {
        const paymentData = {
          id: values?.id || undefined,
          debtor_id: values?.debtor_id || "",
          bank_movement_id: null,
          bank_id: values?.bank_id || "",
          ingress_type: values?.ingress_type || "MANUAL",
          document_type: values?.document_type || null,
          payment_number: values?.payment_number || "",
          amount: values?.amount || 0,
          received_at: values?.received_at || "",
          due_at: values?.due_at || null,
          balance: values?.balance || 0,
          square: values?.square || "",
          bank_received: values?.bank_received || "",
          notes: values?.notes || "",
          deposit_at: values?.deposit_at || null,
        };

        response = await updatePayment(
          session?.token,
          profile?.client?.id,
          paymentData
        );
        if (responseSuccess) {
          toast.success("Pago actualizado correctamente");
          router.push("/dashboard/transactions/payments");
        } else {
          toast.error(
            "Error al actualizar el pago, revisa la información ingresada"
          );
        }
      } else {
        const paymentData = {
          debtor_id: values?.debtor_id || "",
          bank_movement_id: null,
          bank_id: values?.bank_id || "",
          ingress_type: values?.ingress_type || "MANUAL",
          document_type: values?.document_type || null,
          payment_number: values?.payment_number || "",
          amount: values?.amount || 0,
          received_at: values?.received_at || "",
          due_at: values?.due_at || null,
          balance: values?.amount || 0,
          square: values?.square || "",
          bank_received: values?.bank_received || "",
          notes: values?.notes || "",
          deposit_at: values?.deposit_at || null,
        };

        await createPayment(session?.token, profile?.client?.id, paymentData);
        if (responseSuccess) {
          toast.success("Pago creado correctamente");
          router.push("/dashboard/transactions/payments");
        } else {
          toast.error(
            "Error al crear el pago, revisa la información ingresada"
          );
        }
      }

      if (!id) {
        form.reset();
      }
    } catch (error) {
      toast.error(
        id ? "Error al actualizar el pago" : "Error al crear el pago"
      );
      console.error("Error en onSubmit:", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <>
      {/* Loading skeleton cuando se está cargando un pago existente */}
      {id && isLoadingPayment ? (
        <div className="space-y-6">
          {/* Skeleton para información del documento */}
          <div className="p-5 border border-gray-200 rounded-md">
            <div className="w-full mb-5">
              <Skeleton className="h-6 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton para fechas */}
          <div className="p-5 border border-gray-200 rounded-md">
            <div className="w-full mb-5">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton para notas */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-5 border border-gray-200 rounded-md">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>

          {/* Skeleton para botón */}
          <div className="flex justify-center items-center">
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Primera fila - Información del documento */}
            <div className="p-5 border border-gray-200 rounded-md">
              <div className="w-full mb-5">
                <TitleStep
                  title="Información del documento"
                  icon={<FileText size={16} />}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="document_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de documento <Required />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona una opción" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(DocumentType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="payment_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        N° de documento <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa el número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Monto <Required />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bank_id"
                  render={({ field }) => (
                    <BankInformationSelectFormItem
                      field={field}
                      title="Banco que recibe"
                      required
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="bank_received"
                  render={({ field }) => (
                    <BankListSelectFormItem
                      field={field}
                      title="Banco de origen"
                      required
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="square"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Plaza <Required />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa la plaza" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtor_id"
                  render={({ field }) => (
                    <DebtorsSelectFormItem
                      field={field}
                      title="Deudor"
                      required
                    />
                  )}
                />
              </div>
            </div>

            {/* Cuarta fila - Fechas adicionales */}
            <div className="p-5 border border-gray-200 rounded-md">
              <div className="w-full mb-5">
                <TitleStep title="Fechas" icon={<Calendar size={16} />} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="received_at"
                  render={({ field }) => (
                    <DatePickerFormItem
                      field={field}
                      title="Fecha de recepción"
                      required
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="due_at"
                  render={({ field }) => (
                    <DatePickerFormItem
                      field={field}
                      title="Fecha de vencimiento"
                      required
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit_at"
                  render={({ field }) => (
                    <DatePickerFormItem
                      field={field}
                      title="Fecha de depósito"
                      required
                    />
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-5 border border-gray-200 rounded-md">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        className="h-32"
                        placeholder="Observaciones adicionales..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center items-center">
              <Button
                type="submit"
                className="w-xs h-10"
                disabled={isFormLoading}
              >
                {isFormLoading ? (
                  <Loader text="Guardando..." />
                ) : id ? (
                  "Actualizar"
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};

export default FormPayments;
