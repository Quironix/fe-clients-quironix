import { BANK_LIST, DocumentType } from "@/app/dashboard/data";
import { useDebtorsStore } from "@/app/dashboard/debtors/store";
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
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, FileText, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updatePayment } from "../services";
import { usePaymentStore } from "../store";

const FormPayments = () => {
  const { profile, session } = useProfileContext();

  const {
    payment,
    fetchPaymentById,
    fetchBankInformation,
    bankInformation,
    loading,
    createPayment,
    responseSuccess,
  } = usePaymentStore();
  const { debtors, fetchDebtors } = useDebtorsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDebtors(session.token, profile.client.id);
      fetchBankInformation(session.token, profile.client.id);
      if (id) {
        fetchPaymentById(session.token, profile.client.id, id);
      }
    }
  }, [session?.token, profile?.client?.id, fetchPaymentById, id]);

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

  // Efecto para actualizar el formulario cuando se cargan los datos del DTE
  useEffect(() => {
    if (payment && Object.keys(payment).length > 0) {
      form.reset({
        id: payment?.id || "",
        debtor_id: payment?.debtor_id || "",
        bank_movement_id: payment?.bank_movement_id || null,
        bank_id: payment?.bank_id || "",
        ingress_type: payment?.ingress_type || "",
        document_type: payment?.document_type || DocumentType.DEPOSIT,
        payment_number: payment?.payment_number || "",
        amount: payment?.amount || 0,
        received_at: payment?.received_at || "",
        due_at: payment?.due_at || null,
        balance: payment?.balance || 0,
        square: payment?.square || "",
        bank_received: payment?.bank_received || "",
        notes: payment?.notes || "",
        deposit_at: payment?.deposit_at || "",
      });
    }
  }, [payment, form, profile?.client?.id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    if (!profile?.client?.id) {
      toast.error("No se encontró el cliente");
      return;
    }

    try {
      let response;
      if (id) {
        // Modo edición - incluir el id
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
          id,
          paymentData
        );
        if (response) {
          toast.success("Pago actualizado correctamente");
          router.push("/dashboard/transactions/payments");
        } else {
          toast.error(
            "Error al actualizar el pago, revisa la información ingresada"
          );
        }
      } else {
        // Modo creación - excluir el id
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
          balance: values?.balance || 0,
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
    }
  };

  return (
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
              name="ingress_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tipo de ingreso <Required />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={"MANUAL"}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                    </SelectContent>
                  </Select>
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
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Balance <Required />
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
                <FormItem>
                  <FormLabel>
                    Banco <Required />
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={
                        !bankInformation || bankInformation.length === 0
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !bankInformation || bankInformation.length === 0
                              ? "Cargando bancos..."
                              : "Selecciona un banco"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {bankInformation && bankInformation.length > 0 ? (
                          bankInformation.map((bank: any) => (
                            <SelectItem key={bank.id} value={bank.id}>
                              {bank.bank} ({bank.account_number})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No hay bancos disponibles
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_received"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Banco que recibe <Required />
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un banco" />
                      </SelectTrigger>
                      <SelectContent>
                        {BANK_LIST.map((bank) => (
                          <SelectItem key={bank.name} value={bank.name}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
                <FormItem className="w-full">
                  <FormLabel>
                    Deudor <Required />
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!debtors || debtors.length === 0}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            !debtors || debtors.length === 0
                              ? "Cargando deudores..."
                              : "Selecciona un deudor"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {debtors && debtors.length > 0 ? (
                          debtors.map((debtor) => (
                            <SelectItem key={debtor.id} value={debtor.id}>
                              {debtor.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No hay deudores disponibles
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
                <FormItem>
                  <FormLabel>
                    Fecha de recepción <Required />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de vencimiento <Required />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de depósito <Required />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
            className="w-xs"
            disabled={!form.formState.isValid || loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : id ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormPayments;
