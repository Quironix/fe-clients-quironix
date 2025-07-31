"use client";

import {
  SquareUserRound,
  Building,
  FileText,
  FolderTree,
  Calendar,
  User,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Litigation } from "../../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import {updateLitigation} from "../../services"
import { useProfileContext } from "@/context/ProfileContext";
import LitigationDialogConfirm from "../litigation-dialog-confirm";

const litigationEditSchema = z.object({
  litigationAmount: z.coerce.number(),
  reason: z.string(),
  subreason: z.string(),
  contact: z.string(),
});

type LitigationEditForm = z.infer<typeof litigationEditSchema>;

type LitigationEditModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  litigation: Litigation;
};

const disputes = [
  {
    code: "COMMERCIAL_INVOICE",
    label: "Factura Comercial",
    submotivo: [
      { code: "ISSUED", label: "Emitida" },
      { code: "NOT_ISSUED", label: "No Emitida" },
    ],
  },
  {
    code: "SETTLEMENT",
    label: "Finiquito",
    submotivo: [
      { code: "LEGAL_COLLECTION", label: "Cobranza Judicial" },
      { code: "STORE_DELIVERY", label: "Entrega de Local" },
    ],
  },
  {
    code: "CREDIT_NOTE",
    label: "Nota de Crédito",
    submotivo: [
      { code: "ADMINISTRATIVE", label: "Administrativa" },
      { code: "PHYSICAL_DIFFERENCE", label: "Diferencia Física" },
      { code: "VALUE_DIFFERENCE", label: "Diferencia Valor" },
      { code: "DISPATCH_GUIDE_DIFFERENCE", label: "Diferencia Guía de Despacho" },
    ],
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
      { code: "DOCUMENTATION_REQUEST", label: "Solicitud de Documentación" },
    ],
  },
];

const LitigationEditModal = ({ open, onOpenChange, litigation }: LitigationEditModalProps) => {
    const { session, profile } = useProfileContext()
    const [selectedReason, setSelectedReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);

  const form = useForm<LitigationEditForm>({
    resolver: zodResolver(litigationEditSchema),
    defaultValues: {
        litigationAmount: 0,
      reason:  "",
      subreason:  "",
      contact: "",
    },
  });
  useEffect(() => {
    if (litigation) {
      form.reset({
        litigationAmount: Number(litigation.litigationAmount ?? 0),
        reason: litigation.reason ?? "",
        subreason: litigation.subreason ?? "",
        contact: litigation.number ?? "",
      });
    }
  }, [litigation]);

  const { control, register, handleSubmit, formState: { errors }, reset } = form;

  const onSubmit = async (data: LitigationEditForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        litigation_amount: data.litigationAmount,
        motivo: data.reason,
        submotivo: data.subreason,
        contact: data.contact,
      };

      const accessToken = session?.accessToken;
    const clientId = profile?.client_id;
    const litigationId = litigation?.code;

    if (!accessToken || !clientId || !litigationId) {
      throw new Error("Faltan datos necesarios para la actualización");
    }

    await updateLitigation(accessToken, clientId, litigationId, payload);

    window.dispatchEvent(new CustomEvent("litigation:updated"));
    onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar litigio");
    } finally {
      setIsSubmitting(false);
    }
  };

    if (!open) return null;
     const handleConfirm = () => {
    setShowDialog(false);
    reset();
  };


  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-start">
        <div className="bg-white rounded-md w-full max-w-3xl relative py-8 px-6">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 hover:text-black"
          >
            <X />
          </button>

          <div className="my-4">
            <h2 className="text-xl font-bold text-gray-800">Editar litigio</h2>
            <p className="text-lg text-gray-600">Factura N° {litigation?.invoice_number ?? "..."}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#EDF2F7] px-4 py-6 my-2 rounded-md">
            <div className="flex items-center">
              <Image src="/img/dollar-sign.svg" alt="Signo pesos" width={32} height={32} />
              <div className="ml-2">
                <p>Monto Factura</p>
                <p className="text-[#2F6EFF] font-bold text-3xl">
                  ${litigation?.invoiceAmount ?? "..."}
                </p>
              </div>
            </div>
            <FormField
              control={control}
              name="litigationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto litigio</FormLabel>
                  <Input type="number" className="bg-white border-2" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm text-gray-800 mt-6">
          <div className="flex items-center gap-2">
                          <SquareUserRound />
                          <div>
                              
              <p className="text-sm">RUT</p>
              <p> {litigation?.number ?? "123123-1"} </p>
                          </div>
            </div>

            <div className="flex items-center gap-2">
              <Building />
              <div>
                <p className="text-sm">Razón social</p>
                <p>{litigation?.reason ?? "Sin Razón Social"}</p>
              </div>
            </div>

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

<div className="flex items-center gap-2">
                          <Calendar />
                          <div>
                              
              <p className="text-sm">Fecha</p>
              <p className="font-semibold">{litigation?.date ?? "Fecha"}</p>
                          </div>
            </div>

            <FormField
              control={control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-2 border-2 border-[#EDF2F7] rounded-md p-4 text-sm text-gray-700 my-3">
            <MessageSquare />
            <div>
              <p className="font-medium text-sm mb-1">Comentario</p>
              <p>{litigation?.comment ?? "Sin comentario."}</p>
            </div>
                  </div>
                  
          <div className=" bg-[#FF8113] h-0.5 max-w-full mt-5"></div>

          <div className="mt-2 flex justify-center">
            <Button type="submit" disabled={isSubmitting} className="mt-4 px-10 bg-[#1249C7] text-white hover:bg-[#1249C7]/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </div>
              </div>
              {showDialog && (
        <LitigationDialogConfirm
          title={<img src="/img/success-confirm.svg" alt="éxito" className="w-20 mx-auto" />}
          description="El litigio ha sido creado con éxito."
          onConfirm={handleConfirm}
        />
      )}
      </form>
    </FormProvider>
  );
};

export default LitigationEditModal;
