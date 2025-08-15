"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import DebtorContactSelectFormItem from "../../components/debtor-contact-select-form-item";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import DteSelectFormItem from "../../components/dte-select-form-item";
import LoaderTable from "../../components/loader-table";
import SelectClient from "../../components/select-client";
import { disputes, INVOICE_TYPES } from "../../data";
import { useDebtorsStore } from "../../debtors/store";
import { useDTEs } from "../../transactions/dte/hooks/useDTEs";
import { getDTEsByDebtor } from "../../transactions/dte/services";
import { DTE } from "../../transactions/dte/types";
import { createLitigation, GetAllLitigationByDebtorId } from "../services";
import { columnsLitigationEntry } from "./columns-litigation-entry";
import EmptyLitigations from "./empty-litigations";
import LitigationDialogConfirm from "./litigation-dialog-confirm";

const litigationSchema = (isFactoring: boolean) => {
  return z.object({
    client: isFactoring
      ? z.string().min(1, "El cliente es requerido")
      : z.string().optional().nullable(),
    debtorId: z.string().min(1, "El deudor es requerido"),
    invoiceNumber: z.string().min(1, "El número de factura es requerido"),
    reason: z.string(),
    subreason: z.string(),
    contact: z.string(),
    initial_comment: z.string().optional(),
    number: z.string().optional(),
    document: z.string().optional(),
    invoiceId: z.string().optional(),
    invoiceAmount: z.string(),
    litigationAmount: z.string(),
    documentType: z.string().min(1, "El tipo de factura es requerido"),
  });
};

type LitigationForm = z.infer<ReturnType<typeof litigationSchema>>;

const DisputeForm = ({
  handleClose,
  onRefetch,
}: {
  handleClose: () => void;
  onRefetch?: () => void;
}) => {
  const { data: session } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const { profile } = useProfileContext();
  const [litigationsByDebtor, setLitigationsByDebtor] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState<any>(null);
  const { fetchDebtorById, dataDebtor, isFetchingDebtor } = useDebtorsStore();
  const [dteByDebtor, setDteByDebtor] = useState<any[]>([]);
  const [litigationAmountDisplay, setLitigationAmountDisplay] = useState("");

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
      invoiceNumber: "",
      invoiceAmount: "",
      litigationAmount: "",
      reason: "",
      subreason: "",
      contact: "",
      initial_comment: "",
      documentType: "INVOICE",
    },
  });
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
      const payload = {
        document_type: data.documentType,
        invoice_number: data.invoiceNumber,
        litigation_amount: Number(data.litigationAmount),
        motivo: data.reason,
        submotivo: data.subreason,
        contact: data.contact,
        debtor_id: data.debtorId,
        initial_comment: data.initial_comment ?? "",
        // Solo incluir company_id para clientes Factoring
        ...(isFactoring && { company_id: data.client }),
      };

      const res = await createLitigation({
        accessToken: session.token,
        clientId: profile.client_id,
        dataToInsert: payload,
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
  useEffect(() => {
    const fetchLitigations = async () => {
      if (!debtorId || !session?.token || !profile?.client_id) return;
      try {
        const data = await GetAllLitigationByDebtorId(
          session.token,
          profile.client_id,
          debtorId
        );
        setLitigationsByDebtor(data.data);
      } catch (error) {
        console.error("Error al obtener litigios anteriores", error);
      }
    };

    fetchLitigations();
  }, [debtorId, session?.token, profile?.client_id]);

  const watchDocumentType = form.watch("documentType");
  useEffect(() => {
    if (debtorId && session?.token && profile?.client_id) {
      getDTEsByDebtor(session.token, profile.client_id, debtorId, {
        type: watchDocumentType,
        balance: "1",
      }).then((res) => {
        setDteByDebtor(res);
      });
    }
  }, [debtorId, session?.token, profile?.client_id, watchDocumentType]);

  const handleDteSelect = (dte: DTE | null) => {
    if (dte) {
      const amount = dte.amount;
      form.setValue("litigationAmount", amount.toString());
      // Set formatted display value with proper formatting
      const formattedAmount = new Intl.NumberFormat("es-CL", {
        style: "decimal",
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(amount);
      setLitigationAmountDisplay(formattedAmount);
    } else {
      form.setValue("litigationAmount", "");
      setLitigationAmountDisplay("");
    }
  };

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
                <DebtorsSelectFormItem field={field} title="Deudor" required />
              )}
            />
          </div>

          <p className="mb-2 font-semibold">Factura</p>
          <div className="grid grid-cols-3 gap-2 items-end">
            <div className="min-w-0">
              <FormField
                control={control}
                name="documentType"
                render={({ field }) => (
                  <FormItem className="w-full max-w-full">
                    <FormLabel className="py-1">
                      Tipo de factura <Required />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="truncate w-full">
                          <SelectValue
                            placeholder="Selecciona"
                            className="truncate"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVOICE_TYPES.find((t) => t.country === "CL")
                          ?.types.filter((t) => t.value)
                          .map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              className="truncate"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="invoiceNumber"
              render={({ field }) => (
                <DteSelectFormItem
                  field={field}
                  title="Número de factura"
                  required
                  dtes={dteByDebtor}
                  onDteSelect={handleDteSelect}
                />
              )}
            />

            <FormField
              control={form.control}
              name="litigationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto de factura</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Ej: 12345678"
                      value={litigationAmountDisplay}
                      onChange={(e) => {
                        // Remove non-numeric characters
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numericValue = parseInt(rawValue) || 0;

                        // Update form value
                        field.onChange(numericValue.toString());

                        // Update display value
                        setLitigationAmountDisplay(e.target.value);
                      }}
                      onBlur={() => {
                        // Format value on blur
                        const value = parseInt(field.value) || 0;
                        const formattedAmount = new Intl.NumberFormat("es-CL", {
                          style: "decimal",
                          maximumFractionDigits: 0,
                          minimumFractionDigits: 0,
                        }).format(value);
                        setLitigationAmountDisplay(formattedAmount);
                      }}
                      onFocus={() => {
                        // Show raw number on focus for easier editing
                        const value = parseInt(field.value) || 0;
                        setLitigationAmountDisplay(value.toString());
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
          <p className="mb-2 font-semibold">Litigio</p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo litigio</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Resetear el submotivo cuando cambie el motivo
                      form.setValue("subreason", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="truncate w-full">
                        <SelectValue
                          placeholder="Selecciona motivo"
                          className="truncate"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {disputes.map((item) => (
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
              name="subreason"
              render={({ field }) => {
                const selectedReason = form.watch("reason");
                const selectedDispute = disputes.find(
                  (item) => item.code === selectedReason
                );

                return (
                  <FormItem>
                    <FormLabel>Submotivo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedReason}
                    >
                      <FormControl>
                        <SelectTrigger className="truncate w-full">
                          <SelectValue
                            placeholder="Selecciona submotivo"
                            className="truncate"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedDispute?.submotivo.map((sub) => (
                          <SelectItem key={sub.code} value={sub.code}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
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
