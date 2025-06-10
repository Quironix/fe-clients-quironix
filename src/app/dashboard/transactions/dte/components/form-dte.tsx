import { INVOICE_TYPES } from "@/app/dashboard/data";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { ListOrdered } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createDTE, updateDTE } from "../services";
import { useDTEStore } from "../store";

const FormDTE = () => {
  const { profile, session } = useProfileContext();
  const { debtors, fetchDebtors } = useDebtorsStore();
  const { dte, fetchDTEById } = useDTEStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      fetchDebtors(session.token, profile.client.id);
      if (id) {
        fetchDTEById(session.token, profile.client.id, id);
      }
    }
  }, [session?.token, profile?.client?.id, fetchDebtors, fetchDTEById, id]);

  const formSchema = z.object({
    client_code: z.string().optional(),
    type: z.enum(
      INVOICE_TYPES.find((type) => type.country === "CL")?.types.map(
        (type) => type.value
      ) as [string, ...string[]],
      {
        required_error: "El tipo de documento es requerido",
      }
    ),
    folio: z.string().min(1, "El folio es requerido"),
    number: z.string().min(1, "El número de documento es requerido"),
    external_number: z
      .string()
      .min(1, "El número documento sistema externo es requerido"),
    balance: z.number().min(0, "El saldo debe ser mayor a 0"),
    amount: z.number().min(0, "El monto debe ser mayor a 0"),
    order_number: z.string().min(1, "La orden de compra es requerida"),
    reception_date: z.string().min(1, "La fecha de recepción es requerida"),
    issue_date: z.string().min(1, "La fecha de emisión es requerida"),
    operation_date: z.string().min(1, "La fecha de operación es requerida"),
    due_date: z.string().min(1, "La fecha de vencimiento es requerida"),
    litigation_balance: z
      .number()
      .min(0, "El saldo de litigio debe ser mayor a 0"),
    is_internal_document: z.boolean(),
    observations: z.string().min(1, "Las observaciones son requeridas"),
    order_code: z.string().min(1, "El número de pedido es requerido"),
    number_of_installments: z
      .number()
      .min(1, "El número de cuota es requerido"),
    reference: z.string().min(1, "La referencia es requerida"),
    debtor_id: z.string().min(1, "El deudor es requerido"),
    ref_1: z.string().optional(),
    ref_2: z.string().optional(),
    ref_3: z.string().optional(),
    ref_4: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_code: profile?.client?.id || "",
      type: "INVOICE",
      folio: dte?.folio || "",
      number: dte?.number || "",
      external_number: dte?.external_number || "",
      balance: dte?.balance || 0,
      amount: dte?.amount || 0,
      order_number: dte?.order_number || "",
      reception_date: dte?.reception_date || "",
      issue_date: dte?.issue_date || "",
      operation_date: dte?.operation_date || "",
      due_date: dte?.due_date || "",
      litigation_balance: dte?.litigation_balance || 0,
      is_internal_document: dte?.is_internal_document || false,
      observations: dte?.observations || "", // Cambiado de observations a observation
      order_code: dte?.order_code || "",
      number_of_installments: Number(dte?.number_of_installments) || 0, // Convertido usando Number()
      reference: dte?.reference || "",
      debtor_id: dte?.debtor?.id || "",
      ref_1: dte?.ref_1 || "",
      ref_2: dte?.ref_2 || "",
      ref_3: dte?.ref_3 || "",
      ref_4: dte?.ref_4 || "",
    },
  });

  // Efecto para actualizar el formulario cuando se cargan los datos del DTE
  useEffect(() => {
    if (dte && Object.keys(dte).length > 0) {
      form.reset({
        client_code: profile?.client?.id || "",
        type: dte.type || "INVOICE",
        folio: dte.folio || "",
        number: dte.number || "",
        external_number: dte.external_number || "",
        balance: dte.balance || 0,
        amount: dte.amount || 0,
        order_number: dte.order_number || "",
        reception_date: dte.reception_date || "",
        issue_date: dte.issue_date || "",
        operation_date: dte.operation_date || "",
        due_date: dte.due_date || "",
        litigation_balance: dte.litigation_balance || 0,
        is_internal_document: dte.is_internal_document || false,
        observations: dte.observations || "",
        order_code: dte.order_code || "",
        number_of_installments: Number(dte.number_of_installments) || 0,
        reference: dte.reference || "",
        debtor_id: dte.debtor?.id || "",
        ref_1: dte.ref_1 || "",
        ref_2: dte.ref_2 || "",
        ref_3: dte.ref_3 || "",
        ref_4: dte.ref_4 || "",
      });
    }
  }, [dte, form, profile?.client?.id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    if (!profile?.client?.id) {
      toast.error("No se encontró el cliente");
      return;
    }
    values.client_code = profile?.client?.id;
    values.debtor_id = values.debtor_id || "";

    try {
      let response;
      if (id) {
        // Modo edición
        response = await updateDTE(
          session?.token,
          profile?.client?.id,
          id,
          values
        );
        if (response) {
          toast.success("DTE actualizado correctamente");
          router.push("/dashboard/transactions/dte");
        } else {
          toast.error(
            "Error al actualizar el DTE, revisa la información ingresada"
          );
        }
      } else {
        // Modo creación
        response = await createDTE(session?.token, profile?.client?.id, values);
        if (response) {
          toast.success("DTE creado correctamente");
          router.push("/dashboard/transactions/dte");
        } else {
          toast.error("Error al crear el DTE, revisa la información ingresada");
        }
      }

      if (!id) {
        form.reset();
      }
    } catch (error) {
      toast.error(id ? "Error al actualizar el DTE" : "Error al crear el DTE");
      console.error("Error en onSubmit:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Primera fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 border border-gray-200 rounded-md">
          <FormField
            control={form.control}
            name="debtor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Código deudor <Required />
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
                    {debtors
                      .filter(
                        (debtor) =>
                          debtor.name &&
                          debtor.name.trim() !== "" &&
                          debtor.id &&
                          typeof debtor.id === "string" &&
                          debtor.id.trim() !== ""
                      )
                      .map((debtor) => (
                        <SelectItem key={debtor.id!} value={debtor.id!}>
                          {debtor.name}
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
            name="type"
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
                    {INVOICE_TYPES.find((type) => type.country === "CL")
                      ?.types.filter(
                        (type) => type.value && type.value.trim() !== ""
                      )
                      .map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
            name="folio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Folio <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  N° de documento <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="external_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  N° documento sistema externo <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
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
                  Saldo <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
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
                    placeholder="0"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Orden de compra <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Segunda fila - Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 border border-gray-200 rounded-md">
          <FormField
            control={form.control}
            name="reception_date"
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
            name="issue_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de emisión <Required />
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
            name="operation_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de operación <Required />
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
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Fecha de vencimiento <Required />
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
            name="litigation_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Saldo de litigio <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="0"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_internal_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Documento interno <Required />
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex flex-row space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="si" />
                      <label htmlFor="si">Sí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no" />
                      <label htmlFor="no">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Tercera fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 border border-gray-200 rounded-md">
          <FormField
            control={form.control}
            name="order_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  N° pedido <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="number_of_installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  N° de cuota <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="1"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Referencia <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 p-5 border border-gray-200 rounded-md">
          <FormField
            control={form.control}
            name="observations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Observación <Required />
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Completa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Sección de Referencias */}
        <div className="space-y-4 p-5 border border-gray-200 rounded-md">
          <TitleStep title="Referencias" icon={<ListOrdered size={16} />} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="ref_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ref_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia 2</FormLabel>
                  <FormControl>
                    <Input placeholder="Completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ref_3"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia 3</FormLabel>
                  <FormControl>
                    <Input placeholder="Completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ref_4"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia 4</FormLabel>
                  <FormControl>
                    <Input placeholder="Completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-center items-center">
          <Button type="submit" className="w-xs">
            {id ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FormDTE;
