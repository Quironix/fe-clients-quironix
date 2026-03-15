import DatePickerFormItem from "@/app/dashboard/components/date-picker-form-item";
import DebtorsSelectFormItem from "@/app/dashboard/components/debtors-select-form-item";
import { INVOICE_TYPES } from "@/app/dashboard/data";
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
import { formatDate, toISOString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ListOrdered, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { createDTE, updateDTE } from "../services";
import { useInvalidateDTEs } from "../hooks/useDTEs";
import { useDTEStore } from "../store";

const formSchema = z.object({
  client_code: z.string().optional(),
  type: z.enum(
    INVOICE_TYPES.find((type) => type.country === "CL")?.types.map(
      (type) => type.value
    ) as [string, ...string[]],
    {
      message: "El tipo de documento es requerido",
    }
  ),
  // folio: z.string().min(1, "El folio es requerido"),
  number: z.string().min(1, "El número de documento es requerido"),
  external_number: z
    .string()
    .min(1, "El número documento sistema externo es requerido"),
  balance: z.number().min(0, "El saldo debe ser mayor a 0"),
  amount: z.number().min(1, "El monto debe ser mayor a 0"),
  order_number: z.string().optional().nullable(),
  reception_date: z.string().min(1, "La fecha de recepción es requerida"),
  issue_date: z.string().min(1, "La fecha de emisión es requerida"),
  operation_date: z.string().optional().nullable(),
  due_date: z.string().min(1, "La fecha de vencimiento es requerida"),
  litigation_balance: z
    .number()
    .min(0, "El saldo de litigio debe ser mayor a 0")
    .optional()
    .nullable(),
  is_internal_document: z.boolean(),
  observations: z.string().optional().nullable(),
  order_code: z.string().optional().nullable(),
  number_of_installments: z.number().min(0, "El número de cuota es requerido"),
  reference: z.string().optional().nullable(),
  debtor_id: z.string().min(1, "El deudor es requerido"),
  ref_1: z.string().optional().nullable(),
  ref_2: z.string().optional().nullable(),
  ref_3: z.string().optional().nullable(),
  ref_4: z.string().optional().nullable(),
});

const FormDTE = () => {
  const { profile, session } = useProfileContext();
  const t = useTranslations("transactions.dte");
  const tForm = useTranslations("transactions.dte.form");
  const tCommon = useTranslations("common");
  const { dte, fetchDTEById, loading, clearDTE } = useDTEStore();
  const invalidateDTEs = useInvalidateDTEs();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loadingForm, setLoadingForm] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      client_code: profile?.client?.id || "",
      type: "INVOICE",
      number: "",
      external_number: "",
      balance: 0,
      amount: 0,
      order_number: "",
      reception_date: "",
      issue_date: formatDate(new Date() as unknown as string) || "",
      operation_date: formatDate(new Date() as unknown as string) || "",
      due_date: formatDate(new Date() as unknown as string) || "",
      litigation_balance: 0,
      is_internal_document: false,
      observations: "",
      order_code: "",
      number_of_installments: 0,
      reference: "",
      debtor_id: "",
      ref_1: "",
      ref_2: "",
      ref_3: "",
      ref_4: "",
    },
  });

  useEffect(() => {
    if (session?.token && profile?.client?.id) {
      if (id) {
        fetchDTEById(session.token, profile.client.id, id);
      } else {
        clearDTE();
        form.reset({
          client_code: profile?.client?.id || "",
          type: "INVOICE",
          number: "",
          external_number: "",
          balance: 0,
          amount: 0,
          order_number: "",
          reception_date: "",
          issue_date: formatDate(new Date() as unknown as string) || "",
          operation_date: formatDate(new Date() as unknown as string) || "",
          due_date: formatDate(new Date() as unknown as string) || "",
          litigation_balance: 0,
          is_internal_document: false,
          observations: "",
          order_code: "",
          number_of_installments: 0,
          reference: "",
          debtor_id: "",
          ref_1: "",
          ref_2: "",
          ref_3: "",
          ref_4: "",
        });
      }
    }
  }, [session?.token, profile?.client?.id, id]);

  useEffect(() => {
    if (id && dte && Object.keys(dte).length > 0 && dte.debtor) {
      form.reset({
        client_code: profile?.client?.id || "",
        type: dte.type || "INVOICE",
        number: dte.number || "",
        external_number: dte.external_number || "",
        balance: Number(dte.balance) || 0,
        amount: Number(dte.amount) || 0,
        order_number: dte.order_number || "",
        reception_date: dte.reception_date || "",
        issue_date:
          formatDate(dte.issue_date || (new Date() as unknown as string)) || "",
        operation_date:
          formatDate(dte.operation_date || (new Date() as unknown as string)) ||
          "",
        due_date:
          formatDate(dte.due_date || (new Date() as unknown as string)) || "",
        litigation_balance: Number(dte.litigation_balance) || 0,
        is_internal_document: dte.is_internal_document || false,
        observations: dte.observations || "",
        order_code: dte.order_code || "",
        number_of_installments: Number(dte.number_of_installments) || 0,
        reference: dte.reference || "",
        debtor_id: dte.debtor.id || "",
        ref_1: dte.ref_1 || "",
        ref_2: dte.ref_2 || "",
        ref_3: dte.ref_3 || "",
        ref_4: dte.ref_4 || "",
      });
    }
  }, [id, dte, profile?.client?.id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profile?.client?.id) {
      toast.error(t("clientNotFound"));
      return;
    }
    values.client_code = profile?.client?.id;
    values.debtor_id = values.debtor_id;

    // Convertir todas las fechas a ISO String usando la función helper
    // Solo convertir si el campo tiene valor, mantener null/undefined para campos opcionales
    if (values.operation_date) {
      values.operation_date = toISOString(values.operation_date) || null;
    }
    if (values.issue_date) {
      values.issue_date = toISOString(values.issue_date);
    }
    if (values.due_date) {
      values.due_date = toISOString(values.due_date);
    }
    if (values.reception_date) {
      values.reception_date = toISOString(values.reception_date);
    }

    try {
      let response;
      if (id) {
        // Modo edición
        setLoadingForm(true);
        response = await updateDTE(
          session?.token,
          profile?.client?.id,
          id,
          values
        );
        if (response) {
          toast.success(t("updateSuccess"));
          invalidateDTEs(profile?.client?.id);
          router.push("/dashboard/transactions/dte");
        } else {
          toast.error(tForm("updateError"));
        }
        setLoadingForm(false);
      } else {
        // Modo creación
        values.balance = values.amount;
        setLoadingForm(true);
        response = await createDTE(session?.token, profile?.client?.id, values);
        if (response) {
          toast.success(t("createSuccess"));
          invalidateDTEs(profile?.client?.id);
          router.push("/dashboard/transactions/dte");
        } else {
          toast.error(t("createError"));
        }
        setLoadingForm(false);
      }

      if (!id) {
        form.reset();
      }
    } catch (error) {
      setLoadingForm(false);
      toast.error(id ? tForm("updateErrorGeneric") : tForm("createErrorGeneric"));
    } finally {
      form.reset();
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-[100%]">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Primera fila */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 border border-gray-200 rounded-md">
              <FormField
                control={form.control}
                name="debtor_id"
                render={({ field }) => (
                  <DebtorsSelectFormItem
                    field={field}
                    title={tForm("debtorCode")}
                    required
                    initialDebtor={dte?.debtor}
                  />
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tForm("documentType")} <Required />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={tForm("selectOption")} />
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
              {/* 
              <FormField
                control={form.control}
                name="folio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Folio <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={tForm("fillPlaceholder")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tForm("documentNumber")} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={tForm("fillPlaceholder")} {...field} />
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
                      {tForm("externalNumber")} <Required />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder={tForm("fillPlaceholder")} {...field} />
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
                      {tForm("amount")} <Required />
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
                    <FormLabel>{tForm("purchaseOrder")}</FormLabel>
                    <FormControl>
                      <Input placeholder={tForm("fillPlaceholder")} {...field} />
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
                  <DatePickerFormItem
                    field={field}
                    title={tForm("receptionDate")}
                    required
                  />
                )}
              />

              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <DatePickerFormItem
                    field={field}
                    title={tForm("issueDate")}
                    required
                  />
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <DatePickerFormItem
                    field={field}
                    title={tForm("dueDate")}
                    required
                  />
                )}
              />

              <FormField
                control={form.control}
                name="is_internal_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {tForm("internalDocument")} <Required />
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        defaultValue={field.value ? "true" : "false"}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="si" />
                          <label htmlFor="si">{tForm("yes")}</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="no" />
                          <label htmlFor="no">{tForm("no")}</label>
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
                    <FormLabel>{tForm("orderCode")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tForm("fillPlaceholder")}
                        {...field}
                        value={field.value || ""}
                      />
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
                      {tForm("installmentNumber")} <Required />
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
                    <FormLabel>{tForm("reference")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={tForm("fillPlaceholder")}
                        {...field}
                        value={field.value || ""}
                      />
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
                    <FormLabel>{tForm("observation")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={tForm("fillPlaceholder")}
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección de Referencias */}
            <div className="space-y-4 p-5 border border-gray-200 rounded-md">
              <TitleStep title={tForm("references")} icon={<ListOrdered size={16} />} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="ref_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tForm("reference1")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("fillPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel>{tForm("reference2")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("fillPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel>{tForm("reference3")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("fillPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
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
                      <FormLabel>{tForm("reference4")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={tForm("fillPlaceholder")}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-center items-center">
              <Button type="submit" className="w-xs" disabled={loadingForm}>
                {id ? (
                  <>
                    {loadingForm ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {tForm("updating")}
                      </>
                    ) : (
                      tForm("update")
                    )}
                  </>
                ) : (
                  <>
                    {loadingForm ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {tForm("saving")}
                      </>
                    ) : (
                      tForm("save")
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};

export default FormDTE;
