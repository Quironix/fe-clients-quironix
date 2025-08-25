"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useProfileContext } from "@/context/ProfileContext";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import DebtorContactSelectFormItem from "../../components/debtor-contact-select-form-item";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import LoaderTable from "../../components/loader-table";
import SelectClient from "../../components/select-client";
import { useDebtorsStore } from "../../debtors/store";
import { useDTEs } from "../../transactions/dte/hooks/useDTEs";
import { createLitigation, GetAllLitigationByDebtorId } from "../services";
import { usePaymentNettingStore } from "../../payment-netting/store";
import AccordionInvoiceDisputeForm from "./accordion-invoice-dispute-form";
import { columnsLitigationEntry } from "./columns-litigation-entry";
import EmptyLitigations from "./empty-litigations";
import LitigationDialogConfirm from "./litigation-dialog-confirm";

const invoiceSchema = z
  .object({
    documentType: z.string().min(1, "El tipo de factura es requerido"),
    invoiceNumber: z.string().min(1, "El número de factura es requerido"),
    invoiceAmount: z.string().min(1, "El monto de factura es requerido"),
    litigationAmount: z
      .string()
      .min(1, "El monto de litigio es requerido")
      .refine((val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      }, "El monto debe ser mayor a 0"),
    reason: z.string().min(1, "El motivo de litigio es requerido"),
    subreason: z.string().min(1, "El submotivo es requerido"),
  })
  .refine(
    (data) => {
      const invoiceAmount = Number(data.invoiceAmount);
      const litigationAmount = Number(data.litigationAmount);

      if (isNaN(invoiceAmount) || isNaN(litigationAmount)) {
        return true; // Let individual field validations handle invalid numbers
      }

      return litigationAmount <= invoiceAmount;
    },
    {
      message: "El monto de litigio no puede ser mayor al monto de factura",
      path: ["litigationAmount"], // This will show the error on the litigationAmount field
    }
  );

const litigationSchema = (isFactoring: boolean) => {
  return z.object({
    client: isFactoring
      ? z.string().min(1, "El cliente es requerido")
      : z.string().optional().nullable(),
    debtorId: z.string().min(1, "El deudor es requerido"),
    contact: z.string().min(1, "El contacto es requerido"),
    initial_comment: z.string().optional(),
    invoices: z
      .array(invoiceSchema)
      .min(1, "Al menos una factura es requerida")
      .max(10, "No puedes agregar más de 10 facturas"),
  });
};

type LitigationForm = z.infer<ReturnType<typeof litigationSchema>>;

const DisputeForm = ({
  handleClose,
  onRefetch,
  dataToAdd,
}: {
  handleClose: () => void;
  onRefetch?: () => void;
  dataToAdd?: any;
}) => {
  const { data: session } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const { profile } = useProfileContext();
  const [litigationsByDebtor, setLitigationsByDebtor] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState<any>(null);
  const { fetchDebtorById, dataDebtor, isFetchingDebtor } = useDebtorsStore();
  const { totalInvoices, totalPayments } = usePaymentNettingStore();

  const isFactoring = profile?.client?.type === "FACTORING";
  const litigationFormSchema = useMemo(
    () => litigationSchema(isFactoring),
    [isFactoring]
  );

  const form = useForm<LitigationForm>({
    resolver: zodResolver(litigationFormSchema),
    mode: "onSubmit",
    defaultValues: {
      client: isFactoring ? "" : null,
      debtorId: "",
      contact: "",
      initial_comment: "",
      invoices: [
        {
          documentType: "INVOICE",
          invoiceNumber: "",
          invoiceAmount: "",
          litigationAmount: "",
          reason: "",
          subreason: "",
        },
      ],
    },
  });

  useEffect(() => {
    console.log("🔍 DisputeForm - dataToAdd received:", dataToAdd);

    if (dataToAdd) {
      console.log("✅ dataToAdd exists, processing...");
      console.log("📋 debtor_id:", dataToAdd.debtor_id);
      console.log("📄 invoice_number:", dataToAdd.invoice_number);
      console.log("💰 amount:", dataToAdd.amount);
      
      // Calcular la diferencia totalInvoices - totalPayments
      const litigationDifference = totalInvoices - totalPayments;
      console.log("🔢 totalInvoices:", totalInvoices);
      console.log("🔢 totalPayments:", totalPayments);
      console.log("🔢 litigationDifference:", litigationDifference);

      form.setValue("invoices", [
        {
          documentType: "INVOICE",
          invoiceNumber: dataToAdd.number,
          invoiceAmount: dataToAdd?.amount,
          litigationAmount: litigationDifference > 0 ? litigationDifference.toString() : "0",
          reason: "Pago pendiente",
          subreason: "Pago pendiente",
        },
      ]);
      console.log("✅ Invoices setValue completed");

      form.setValue("debtorId", dataToAdd?.debtor?.id);
      console.log("✅ DebtorId setValue completed:", dataToAdd.debtor_id);

      // Forzar re-renderizado y validación del formulario
      form.trigger();
      console.log("🔄 Form trigger executed");

      console.log("🎯 Form values after setValue:", form.getValues());
    } else {
      console.log("❌ dataToAdd is null/undefined");
    }
  }, [dataToAdd, totalInvoices, totalPayments]);
  // Usar el nuevo hook useDTEs con paginación del servidor
  const { isLoading, handlePaginationChange } = useDTEs({
    accessToken: session?.token || "",
    clientId: profile?.client_id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    control,
  } = form;

  const debtorId = form.watch("debtorId");

  // Efecto para obtener el debtor completo cuando cambie debtorId
  useEffect(() => {
    if (debtorId && session?.token && profile?.client_id) {
      fetchDebtorById(session.token, profile.client_id, debtorId);
    } else {
      setSelectedDebtor(null);
      // Limpiar el campo de contacto cuando no hay debtor seleccionado
      form.setValue("contact", "");
    }
  }, [debtorId, session?.token, profile?.client_id, fetchDebtorById, form]);

  // Efecto para actualizar selectedDebtor cuando se obtenga dataDebtor
  useEffect(() => {
    if (dataDebtor?.id) {
      setSelectedDebtor(dataDebtor);
    }
  }, [dataDebtor]);

  // Efecto para limpiar campo cliente cuando no es Factoring
  useEffect(() => {
    if (!isFactoring) {
      form.setValue("client", null);
    }
  }, [isFactoring, form]);

  const onSubmit = async (data: LitigationForm) => {
    try {
      const res = await createLitigation({
        accessToken: session.token,
        clientId: profile.client_id,
        dataToInsert: data,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      // Solo ejecutar refetch y cerrar modal en caso de éxito
      if (onRefetch) {
        onRefetch();
      }
      handleClose();
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar litigio");
    }
  };

  const handleConfirm = () => {
    setShowDialog(false);
    reset();
  };

  const watchedInvoices = useWatch({
    control: form.control,
    name: "invoices",
  });
  useEffect(() => {
    const fetchLitigations = async () => {
      if (!debtorId || !session?.token || !profile?.client_id) {
        setLitigationsByDebtor([]);
        return;
      }

      // Extract invoice numbers directly from current form state
      const currentInvoices = form.getValues("invoices") || [];
      const invoiceNumbers = currentInvoices
        .map((invoice) => invoice.invoiceNumber)
        .filter((num) => num && num.trim() !== "")
        .join(",");

      try {
        const data = await GetAllLitigationByDebtorId(
          session.token,
          profile.client_id,
          debtorId,
          invoiceNumbers || undefined
        );
        setLitigationsByDebtor(data.data || []);
      } catch (error) {
        console.error("Error al obtener litigios por facturas", error);
        setLitigationsByDebtor([]);
      }
    };

    fetchLitigations();
  }, [watchedInvoices]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div
            className={`grid ${isFactoring ? "grid-cols-2" : "grid-cols-1"} gap-4`}
          >
            {isFactoring && (
              <FormField
                control={control}
                name="client"
                render={({ field }) => (
                  <SelectClient
                    field={field}
                    title="Cliente"
                    singleClient
                    required
                  />
                )}
              />
            )}

            <FormField
              control={control}
              name="debtorId"
              render={({ field }) => (
                dataToAdd?.debtor?.name ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Deudor *
                    </label>
                    <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      {dataToAdd.debtor.name}
                    </div>
                  </div>
                ) : (
                  <DebtorsSelectFormItem field={field} title="Deudor" required />
                )
              )}
            />
          </div>

          <AccordionInvoiceDisputeForm
            form={form}
            control={control}
            debtorId={debtorId}
            session={session}
            profile={profile}
            dataToAdd={dataToAdd}
          />

          {/* Litigios anteriores */}
          {litigationsByDebtor.length > 0 ? (
            <div className="mt-2 border bg-[#F1F5F9] border-gray-200 rounded-md py-4 px-3">
              <DataTableDynamicColumns
                columns={columnsLitigationEntry}
                title="Litigios ingresados"
                data={litigationsByDebtor}
                enableRowSelection={true}
                initialRowSelection={{}}
                onRowSelectionChange={() => {}}
                // Configuración para paginación del servidor (requerida)
                // pagination={pagination}
                onPaginationChange={handlePaginationChange}
                isServerSideLoading={isLoading}
                // Configuración de carga
                loadingComponent={<LoaderTable cols={7} />}
                emptyMessage="No se encontraron litigios"
                // Configuración de paginación
                // pageSize={currentLimit}
                // pageSizeOptions={[15, 20, 25, 30, 40, 50]}
              />
            </div>
          ) : (
            <EmptyLitigations />
          )}

          <div className="mt-6">
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <DebtorContactSelectFormItem
                  field={field}
                  selectedDebtor={selectedDebtor}
                  isFetchingDebtor={isFetchingDebtor}
                />
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="initial_comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentario</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ingresa un comentario"
                    {...field}
                    className="h-24"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center border-t border-orange-500 pt-4 w-full">
            <Button
              type="submit"
              className="bg-blue-600 text-white w-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span className="text-white">Guardando...</span>
                </>
              ) : (
                <span className="text-white">Guardar</span>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {showDialog && (
        <LitigationDialogConfirm
          title={
            <img
              src="/img/success-confirm.svg"
              alt="éxito"
              className="w-20 mx-auto"
            />
          }
          description="El litigio ha sido creado con éxito."
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default DisputeForm;
