"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDisputeStore } from "../store/disputeStore";
import { Loader2 } from "lucide-react";
import { useLitigationStore } from "../store/litigation-store";
import LitigationDialogConfirm from "./litigation-dialog-confirm";
import { useProfileContext } from "@/context/ProfileContext";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import DebtorsSelectFormItem from "../../components/debtors-select-form-item";
import SelectClient from "../../components/select-client";
import Required from "@/components/ui/required";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { INVOICE_TYPES } from "../../data";
import { DataTable } from "../../components/data-table";
import LoaderTable from "../../components/loader-table";
import { columns } from "./columns";
import {columnsLitigationEntry } from "./columns-litigation-entry"
import { useDTEs } from "../../transactions/dte/hooks/useDTEs";
import { DataTableDynamicColumns } from "../../components/data-table-dynamic-columns";
import { GetAllLitigationByDebtorId } from "../services";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const litigationSchema = z.object({
  client: z.string(),
  debtorId: z.string(),
  invoiceType: z.string(),
  invoiceNumber: z.string(),
  reason: z.string(),
  subreason: z.string(),
  contact: z.string(),
  comment: z.string().optional(),
  number: z.string().optional(),
  document: z.string().optional(),
  invoiceId: z.string().optional(),
  invoiceAmount: z.string(),
  litigationAmount: z.string(),
  documentType: z.string()
});



type LitigationForm = z.infer<typeof litigationSchema>;


const DisputeForm = () => {
  const { litigiosIngresados } = useLitigationStore();
  const [showDialog, setShowDialog] = useState(false);
  const { session, profile } = useProfileContext();
  const [selectedReason, setSelectedReason] = useState("");
  const [litigationsByDebtor, setLitigationsByDebtor] = useState([]);

  const form = useForm<LitigationForm>({
    resolver: zodResolver(litigationSchema),
    defaultValues: {
      client: "",
      debtorId: "",
      invoiceType: "",
      invoiceNumber: "",
      invoiceAmount: "",
      litigationAmount: "",
      reason: "",
      subreason: "",
      contact: "",
      comment: "",
      documentType: ""
    },
  });
   // Usar el nuevo hook useDTEs con paginación del servidor
   const {
    isLoading,
    handlePaginationChange,
  } = useDTEs({
    accessToken: session?.token || "",
    clientId: profile?.client_id || "",
    initialPage: 1,
    initialLimit: 15,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = form;


  const debtorId = form.watch("debtorId");

  const disputes = [
  {
    code: "COMMERCIAL_INVOICE",
    label: "Factura Comercial",
    submotivo: [
      { code: "ISSUED", label: "Emitida" },
      { code: "NOT_ISSUED", label: "No Emitida" }
    ]
  },
  {
    code: "SETTLEMENT",
    label: "Finiquito",
    submotivo: [
      { code: "LEGAL_COLLECTION", label: "Cobranza Judicial" },
      { code: "STORE_DELIVERY", label: "Entrega de Local" }
    ]
  },
  {
    code: "CREDIT_NOTE",
    label: "Nota de Crédito",
    submotivo: [
      { code: "ADMINISTRATIVE", label: "Administrativa" },
      { code: "PHYSICAL_DIFFERENCE", label: "Diferencia Física" },
      { code: "VALUE_DIFFERENCE", label: "Diferencia Valor" },
      { code: "DISPATCH_GUIDE_DIFFERENCE", label: "Diferencia Guía de Despacho" }
    ]
  },
  {
    code: "INVOICE_ISSUE",
    label: "Problemas con la Factura",
    submotivo: [
      { code: "RETENTION_CERTIFICATE", label: "Certificado de Retención" },
      { code: "SERVICE_ISSUES", label: "Inconvenientes con el servicio." },
      { code: "IN_OTHER_FACTORING", label: "En Poder de Otro Factoring" },
      { code: "DUE_DATE_ERROR", label: "Error de Vencimiento" },
      { code: "INVOICE_VOIDED", label: "Factura Anulada" },
      { code: "INVOICE_PAID", label: "Factura Pagada" },
      { code: "REINVOICING", label: "Re-Facturación" },
      { code: "REJECTED_BY_SII", label: "Rechazo en el SII" },
      { code: "NO_CONTRACT", label: "Sin Contrato" },
      { code: "TRANSFERABLE_REQUEST", label: "Solicitud de Cedible" },
      { code: "DOCUMENTATION_REQUEST", label: "Solicitud de Documentación" }
    ]
  }
  ];

  const onSubmit = async (data: LitigationForm) => {
    try {
      const payload = {
        document_type: data.documentType,
        invoice_number: data.invoiceNumber,
        litigation_amount: Number(data.litigationAmount),
        description: data.comment ?? "",
        motivo: data.reason,
        submotivo: data.subreason,
        contact: data.contact,
        debtor_id: data.debtorId,
        initial_comment: data.comment ?? "",
      };

      const res = await fetch(
        `${API_URL}/v2/clients/${profile.client_id}/litigations`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al crear litigio");

      setShowDialog(true);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("litigation:created"));
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar litigio");
      setShowDialog(false);
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
        setLitigationsByDebtor(data);
      } catch (error) {
        console.error("Error al obtener litigios anteriores", error);
      }
    };
  
    fetchLitigations();
  }, [debtorId, session?.token, profile?.client_id]);

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-[735px] max-w-full bg-white rounded-md p-6 space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Ingreso de litigio</h2>
            <p className="text-sm text-gray-500">
              Completa los campos obligatorios para ingresar un litigio.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="client"
              render={({ field }) => (
                <SelectClient field={field} title="Cliente" singleClient />
              )}
            />

            <FormField
              control={control}
              name="debtorId"
              render={({ field }) => (
                <DebtorsSelectFormItem field={field} title="Deudor" />
              )}
            />
          </div>

          <p className="mb-0 font-semibold">Factura</p>
          <div className="grid grid-cols-3 gap-2 ">
  <div className="min-w-0">
    <FormField
      control={control}
      name="documentType"
      render={({ field }) => (
        <FormItem className="w-full max-w-full">
          <FormLabel className="py-1">Tipo de factura</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="truncate w-full">
                <SelectValue placeholder="Selecciona" className="truncate" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {INVOICE_TYPES.find((t) => t.country === "CL")?.types
                .filter((t) => t.value)
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

  <div className="min-w-0">
    <FormItem className="w-full max-w-full">
      <FormLabel className="py-1">Número de factura</FormLabel>
      <FormControl>
        <Input placeholder="Ej: 12345678" {...register("invoiceNumber")} />
      </FormControl>
      <FormMessage>{errors.invoiceNumber?.message}</FormMessage>
    </FormItem>
  </div>

  <div className="min-w-0">
    <FormItem className="w-full max-w-full">
      <FormLabel className="py-1">Monto de factura</FormLabel>
      <FormControl>
        <Input
          placeholder="Ej: 150000"
          {...register("litigationAmount")}
        />
      </FormControl>
      <FormMessage>{errors.invoiceAmount?.message}</FormMessage>
    </FormItem>
  </div>
</div>

          {/* Litigios anteriores */}
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
          <div className="grid grid-cols-3 gap-4">
          <FormField
  control={control}
  name="reason"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Motivo litigio</FormLabel>
      <select
        {...field}
        onChange={(e) => {
          field.onChange(e);
          setSelectedReason(e.target.value);
        }}
        className="w-full border border-gray-300 p-2 rounded-md"
      >
        <option value="">Selecciona motivo</option>
        {disputes.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
      <FormMessage />
    </FormItem>
  )}
/>


<FormField
  control={control}
  name="subreason"
  render={({ field }) => {
    const selected = disputes.find((item) => item.code === selectedReason);

    return (
      <FormItem>
        <FormLabel>Submotivo</FormLabel>
        <select
          {...field}
          className="w-full border border-gray-300 p-2 rounded-md"
          disabled={!selected}
        >
          <option value="">Selecciona submotivo</option>
          {selected?.submotivo.map((sub) => (
            <option key={sub.code} value={sub.code}>
              {sub.label}
            </option>
          ))}
        </select>
        <FormMessage />
      </FormItem>
    );
  }}
/>


  <FormField
    control={control}
    name="contact"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Contacto</FormLabel>
        <select
          {...field}
          className="w-full border border-gray-300 p-2 rounded-md"
        >
          <option value="">Selecciona contacto</option>
          <option value="Juan Pérez">Juan Pérez</option>
          <option value="María González">María González</option>
        </select>
        <FormMessage />
      </FormItem>
    )}
  />
</div>


                   <div >
            <FormLabel className="py-2">Comentario</FormLabel>
            <Textarea {...register("comment")} placeholder="Comentario..." />
          </div>
          <div className=" bg-[#FF8113] h-0.5 max-w-full"></div>


          {/* Botón */}
          <div className="flex justify-center">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ingresando litigio
                </>
              ) : (
                "Crear litigio"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>

      {showDialog && (
        <LitigationDialogConfirm
          title={<img src="/img/success-confirm.svg" alt="éxito" className="w-20 mx-auto" />}
          description="El litigio ha sido creado con éxito."
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default DisputeForm;
